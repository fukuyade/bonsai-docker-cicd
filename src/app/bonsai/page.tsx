import Link from "next/link";

import { listBonsai } from "@/lib/bonsai";

import { StatusBadge } from "./_components/StatusBadge";

// このページはビルド時に静的化せず、リクエストの度にDBから最新状態を取得する。
// 指定しない場合、DBアクセスがあってもNext.jsはビルド時の静的化を試みてしまい、
// (ビルド環境からDBへ到達できないと)ビルド自体が失敗する。
export const dynamic = "force-dynamic";

// Server Component: DBアクセス(listBonsai)をサーバー側だけで実行し、
// 結果のHTMLだけをクライアントへ送る。DB接続情報やクエリはブラウザに出ない。
export default async function BonsaiListPage() {
  const bonsaiList = await listBonsai();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">盆栽一覧</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{bonsaiList.length}件</span>
          <Link
            href="/bonsai/new"
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            + 新規登録
          </Link>
        </div>
      </div>

      {bonsaiList.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          登録されている盆栽がありません。
        </p>
      ) : (
        // スマートフォンの幅ではセル内の文字が縦に折り返され読みにくくなるため、
        // whitespace-nowrapで1行に固定し、代わりに横スクロール(overflow-x-auto)させる。
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3 font-medium whitespace-nowrap">管理番号</th>
                <th className="p-3 font-medium whitespace-nowrap">名称</th>
                <th className="p-3 font-medium whitespace-nowrap">樹種</th>
                <th className="p-3 font-medium whitespace-nowrap">状態</th>
                <th className="p-3 font-medium whitespace-nowrap">設置場所</th>
              </tr>
            </thead>
            <tbody>
              {bonsaiList.map((bonsai) => (
                <tr
                  key={bonsai.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3 whitespace-nowrap">
                    <Link
                      href={`/bonsai/${bonsai.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {bonsai.managementNumber}
                    </Link>
                  </td>
                  <td className="p-3 whitespace-nowrap text-gray-900">
                    {bonsai.name}
                  </td>
                  <td className="p-3 whitespace-nowrap text-gray-700">
                    {bonsai.species}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <StatusBadge status={bonsai.status} />
                  </td>
                  <td className="p-3 whitespace-nowrap text-gray-700">
                    {bonsai.location ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
