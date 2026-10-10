import Link from "next/link";

import { canViewAuditLog } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/dal";

import { logoutAction } from "../login/actions";

// ログイン後の全ページに共通のヘッダー(ユーザー名・ロールバッジ・ログアウト)。
// /bonsai配下と/admin配下のlayout.tsxから共用する。
//
// getCurrentUser()の中でverifySession()を呼んでおり、未ログインなら
// ここで/loginへリダイレクトされる(=このヘッダーを使うlayout配下はログイン必須になる)。
export async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      {/* スマートフォン幅では折り返して、ヘッダーが画面からはみ出さないようにする */}
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
        <Link href="/bonsai" className="text-sm font-bold text-gray-900">
          盆栽管理アプリ
        </Link>
        {user && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-600">
            {canViewAuditLog(user.role) && (
              <Link
                href="/admin/audit-logs"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                操作ログ
              </Link>
            )}
            <span>
              {user.name}
              <span className="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                {user.role === "ADMIN" ? "管理者" : "一般ユーザー"}
              </span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                ログアウト
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
