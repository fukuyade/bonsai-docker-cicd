import Link from "next/link";

// このファイルは /bonsai/[id] 配下でnotFound()が呼ばれたときに表示される。
export default function BonsaiNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-xl font-bold text-gray-900">
        盆栽が見つかりませんでした
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        指定された盆栽は存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/bonsai"
        className="mt-6 inline-block text-sm text-blue-600 hover:underline"
      >
        ← 盆栽一覧へ戻る
      </Link>
    </main>
  );
}
