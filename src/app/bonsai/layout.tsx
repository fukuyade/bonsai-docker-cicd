import { getCurrentUser } from "@/lib/auth/dal";

import { logoutAction } from "../login/actions";

// /bonsai配下の全ページに共通のヘッダー(ログイン中ユーザー名・ロールバッジ・
// ログアウトボタン)を表示するレイアウト。
//
// getCurrentUser()の中でverifySession()を呼んでおり、未ログインなら
// ここで/loginへリダイレクトされる。つまりこのlayout.tsx配下(/bonsai以下の
// 全ページ)は、この1ファイルを通すだけでログイン必須になる。
export default async function BonsaiLayout({
  children,
}: LayoutProps<"/bonsai">) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-full">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <span className="text-sm font-bold text-gray-900">
            盆栽管理アプリ
          </span>
          {user && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
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
      {children}
    </div>
  );
}
