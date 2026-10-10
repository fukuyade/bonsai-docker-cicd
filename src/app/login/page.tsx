import { DemoAccountsNotice } from "./_components/DemoAccountsNotice";
import { LoginForm } from "./_components/LoginForm";

// 環境変数をビルド時ではなくリクエスト時に読むため、動的レンダリングにする
// (静的化されると、デプロイ後に環境変数を変えても表示が切り替わらない)。
export const dynamic = "force-dynamic";

// ログイン済みかどうかの判定はproxy.ts(公式ドキュメントのOptimistic checks)側で
// 行っており、既にログイン済みの場合はここへ到達する前に/bonsaiへ
// リダイレクトされる。そのためこのページ自体はフォーム表示に専念する。
export default function LoginPage() {
  const showDemoAccounts = process.env.SHOW_DEMO_ACCOUNTS === "true";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">
        盆栽管理アプリ
      </h1>
      <p className="mb-8 text-center text-sm text-gray-500">
        社内スタッフ用のログイン画面です
      </p>
      <LoginForm />
      {showDemoAccounts && <DemoAccountsNotice />}
    </main>
  );
}
