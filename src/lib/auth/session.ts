import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import type { UserRole } from "@prisma/client";

// Next.js公式ドキュメント(app/guides/authentication)の「Stateless Sessions」の
// 実装パターンに沿っている。セッションの実体はDBに保存せず、
// 署名付きJWTをhttpOnly cookieに入れてブラウザに持たせる方式(ステートレス)。
//
// ペイロードには最小限のユーザー情報(id・権限)だけを入れ、
// メールアドレスやパスワードなど個人情報・秘密情報は入れない。

const COOKIE_NAME = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7日

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // 開発中に設定し忘れた場合、原因不明のログイン失敗にならないよう早めに気づけるようにする。
    throw new Error(
      "SESSION_SECRETが設定されていません。.envに追加してください(生成方法: openssl rand -base64 32)。",
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: number;
  role: UserRole;
};

async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

// 署名が不正・期限切れの場合はnullを返す(例外にせず、呼び出し側で
// 「未ログイン扱い」として自然にログイン画面へ誘導できるようにするため)。
async function decryptSession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // JS(document.cookie)から読めないようにし、XSS時の窃取を防ぐ
    secure: process.env.NODE_ENV === "production", // 本番はHTTPS必須、ローカル開発(非HTTPS)は例外
    sameSite: "lax", // 他サイトからのリンク遷移では送らず、CSRF耐性を上げる
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// proxy.ts(ミドルウェア相当)から使う軽量版。cookies()ではなくRequest経由で
// 読み取るため、ここではトークン文字列を受け取って検証するだけにしている。
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  return decryptSession(token);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(COOKIE_NAME)?.value);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
