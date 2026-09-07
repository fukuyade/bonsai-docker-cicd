// /bonsai配下のページ読み込み中に表示されるスケルトン。
// Next.jsがpage.tsxを自動でSuspense境界にラップし、この内容を
// フォールバックとして表示してくれる(app/getting-started/fetching-data参照)。
export default function BonsaiLoading() {
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
