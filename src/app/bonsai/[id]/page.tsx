import Link from "next/link";
import { notFound } from "next/navigation";

import { getBonsaiWithMaintenanceRecords } from "@/lib/bonsai";
import { formatDate } from "@/lib/format";
import { MAINTENANCE_WORK_TYPE_LABEL } from "@/lib/maintenance-work-type";

import { StatusBadge } from "../_components/StatusBadge";

import { BonsaiImageGallery } from "./_components/BonsaiImageGallery";

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

  const bonsai = await getBonsaiWithMaintenanceRecords(bonsaiId);

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
          <Link
            href={`/bonsai/${bonsai.id}/delete`}
            className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            削除
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <BonsaiImageGallery images={bonsai.images} />
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

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">手入れ履歴</h2>
          <Link
            href={`/bonsai/${bonsai.id}/maintenance/new`}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            + 履歴を登録
          </Link>
        </div>

        {bonsai.maintenanceRecords.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            手入れ履歴はまだ登録されていません。
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            {bonsai.maintenanceRecords.map((record) => (
              <li key={record.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(record.maintenanceDate)}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {MAINTENANCE_WORK_TYPE_LABEL[record.workType]}
                  </span>
                </div>
                {record.workerName && (
                  <p className="mt-1 text-xs text-gray-500">
                    担当: {record.workerName}
                  </p>
                )}
                {record.memo && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                    {record.memo}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
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
