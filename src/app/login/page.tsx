import { LoginForm } from "./_components/LoginForm";

// ログイン済みかどうかの判定はproxy.ts(公式ドキュメントのOptimistic checks)側で
// 行っており、既にログイン済みの場合はここへ到達する前に/bonsaiへ
// リダイレクトされる。そのためこのページ自体はフォーム表示に専念する。
export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">
        盆栽管理アプリ
      </h1>
      <p className="mb-8 text-center text-sm text-gray-500">
        社内スタッフ用のログイン画面です
      </p>
      <LoginForm />
    </main>
  );
}
