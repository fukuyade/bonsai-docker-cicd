// 一覧ページの読み込み中に表示されるスケルトン。
//
// このファイルが `(list)` というルートグループの中にあるのには理由がある。
// loading.tsx を置いた階層は「ストリーミング」が有効になり、Next.jsは
// 先にHTTPヘッダー（200 OK）とこのスケルトンを送り始める。
// そのため、あとから notFound() を呼んでもステータスを404へ変更できない。
//
// 以前は src/app/bonsai/loading.tsx に置いていたため、配下の
// /bonsai/[id] などが「404の画面なのにステータスは200」という状態になっていた。
// ルートグループ（URLに影響しないフォルダ）で一覧ページだけを囲むことで、
// スケルトン表示と、詳細ページの正しい404の両立ができる。
export default function BonsaiListLoading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-gray-200" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </main>
  );
}
