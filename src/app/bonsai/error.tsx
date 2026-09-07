"use client";

import { useEffect } from "react";

// /bonsai配下で「想定外の例外」(DB接続断など)が起きたときのフォールバックUI。
// notFound()による404とは別物: こちらはtry/catchで拾わなかった実行時エラー用。
// Next.js 16ではreset propの名前がretryに変わっている(過去バージョンとの相違点)。
export default function BonsaiError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // 詳細なエラー内容はサーバー/ブラウザのログにだけ残し、
    // 画面には内部情報(スタックトレース等)を出さない。
    console.error("盆栽ページで予期しないエラーが発生しました:", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-xl font-bold text-gray-900">
        問題が発生しました
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        時間をおいて再度お試しください。問題が続く場合は管理者にご連絡ください。
      </p>
      <button
        onClick={() => retry()}
        className="mt-6 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        再読み込み
      </button>
    </main>
  );
}
