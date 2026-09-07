import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold text-gray-900">盆栽管理アプリ</h1>
      <p className="max-w-md text-gray-600">
        盆栽の基本情報と手入れ履歴を記録・確認する社内向け管理アプリです。
      </p>
      <Link
        href="/bonsai"
        className="rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        盆栽一覧を見る
      </Link>
    </main>
  );
}
