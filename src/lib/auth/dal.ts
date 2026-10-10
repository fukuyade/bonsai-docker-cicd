import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { getSessionPayload, type SessionPayload } from "./session";

// Data Access Layer(DAL)。
// 認証・権限まわりのチェックをここに集約し、各ページ・Server Actionは
// この関数を呼ぶだけにする(Next.js公式ドキュメントが推奨するパターン)。
//
// proxy.ts側のチェックは「cookieの中身を見るだけの簡易チェック(optimistic)」であり、
// ここでのチェックが「実際にDBへアクセスする直前の最終防衛線(secure)」にあたる。
// 二重に見えるが、役割が違うため両方置いている。
//
// React の cache() で包むことで、同じリクエスト内で何度呼んでも
// 実際の検証処理は1回しか走らない(無駄な再計算を防ぐ)。
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSessionPayload();
  if (!session) {
    redirect("/login");
  }
  return session;
});

// 画面表示(ヘッダーに名前を出す等)のために、パスワードハッシュを含まない
// 最小限のユーザー情報だけを返す。
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
});
