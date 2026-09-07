import Link from "next/link";
import { notFound } from "next/navigation";

import { getBonsaiById } from "@/lib/bonsai";
import { formatDate } from "@/lib/format";

import { StatusBadge } from "../_components/StatusBadge";

// /bonsai/page.tsxと同じ理由でビルド時の静的化を無効にする。
export const dynamic = "force-dynamic";

// [id]は動的ルートセグメント。URLの/bonsai/1の"1"がparams.idとして渡される。
// Next.js 16ではparamsがPromiseなのでawaitして取り出す。
export default async function BonsaiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bonsaiId = Number(id);

  // "abc"のような数値でないIDが来た場合もここで404にする。
  if (!Number.isInteger(bonsaiId)) {
    notFound();
  }

  const bonsai = await getBonsaiById(bonsaiId);

  // 存在しないIDの場合、Next.jsのnotFound()を呼ぶと
  // 同じフォルダ(またはより上位)のnot-found.tsxが表示される(404相当)。
  if (!bonsai) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/bonsai"
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        ← 盆栽一覧へ戻る
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{bonsai.managementNumber}</p>
          <h1 className="text-2xl font-bold text-gray-900">{bonsai.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={bonsai.status} />
          <Link
            href={`/bonsai/${bonsai.id}/edit`}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            編集
          </Link>
        </div>
      </div>

      <dl className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        <Row label="樹種" value={bonsai.species} />
        <Row label="設置場所" value={bonsai.location ?? "-"} />
        <Row label="入手日" value={formatDate(bonsai.acquiredAt)} />
        <Row
          label="次回手入れ予定日"
          value={formatDate(bonsai.nextMaintenanceDate)}
        />
        <Row label="備考" value={bonsai.memo ?? "-"} multiline />
      </dl>

      {/* 手入れ履歴の表示・登録はDay6で追加予定 */}
    </main>
  );
}

function Row({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd
        className={`col-span-2 text-sm text-gray-900 ${multiline ? "whitespace-pre-wrap" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
