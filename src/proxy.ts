import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

// Next.js 16では`middleware.ts`が廃止され`proxy.ts`に名称変更された
// (参考: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md)。
//
// ここで行うのはcookieの中身を見るだけの簡易チェック(optimistic check)。
// 実際のDBアクセスを伴う最終的な認可チェックは、各ページ・Server Actionから
// 呼ばれるsrc/lib/auth/dal.tsのverifySession()側(secure check)で行う。
// 役割を分けているのは、proxyは全リクエストで実行されるため
// ここでDBへ問い合わせるとパフォーマンスに影響するため。
const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || pathname === "/";
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // 未ログインで保護対象のパスに来た場合はログイン画面へ。
  if (!session && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済みなのにログイン画面に来た場合は一覧へ戻す。
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/bonsai", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 静的アセット・画像最適化・faviconはproxyの対象から外す
  // (対象に含めるとCSS/JS/画像の読み込みまでブロックされ得るため)。
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
