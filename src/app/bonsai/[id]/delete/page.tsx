import Link from "next/link";
import { notFound } from "next/navigation";

import { getBonsaiWithMaintenanceRecords } from "@/lib/bonsai";

import { deleteBonsaiAction } from "../../actions";
import { emptyBonsaiDeleteState } from "../../form-state";
import { DeleteConfirmForm } from "./_components/DeleteConfirmForm";

export const dynamic = "force-dynamic";

export default async function DeleteBonsaiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bonsaiId = Number(id);

  if (!Number.isInteger(bonsaiId)) {
    notFound();
  }

  const bonsai = await getBonsaiWithMaintenanceRecords(bonsaiId);

  if (!bonsai) {
    notFound();
  }

  const maintenanceCount = bonsai.maintenanceRecords.length;
  const imageCount = bonsai.images.length;

  // 削除対象のIDを固定したServer Actionをbindして渡す。
  const deleteWithId = deleteBonsaiAction.bind(null, bonsai.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/bonsai/${bonsai.id}`}
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        ← 盆栽詳細へ戻る
      </Link>

      <h1 className="mb-4 text-2xl font-bold text-gray-900">盆栽の削除</h1>

      <div className="mb-6 rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-500">{bonsai.managementNumber}</p>
        <p className="text-lg font-bold text-gray-900">{bonsai.name}</p>
        <p className="mt-1 text-sm text-gray-600">樹種: {bonsai.species}</p>
      </div>

      {maintenanceCount > 0 ? (
        // 履歴がある場合は、実行前に理由を明示する。
        // （それでも送信された場合はDBの外部キー制約が最終的に拒否する）
        <div className="mb-6 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">この盆栽は削除できません。</p>
          <p className="mt-1">
            手入れ履歴が {maintenanceCount} 件登録されています。
            業務記録を誤って失わないよう、履歴が残っている盆栽は削除できない設計にしています。
          </p>
        </div>
      ) : (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">この操作は取り消せません。</p>
          <p className="mt-1">
            盆栽の情報と、紐づく写真 {imageCount} 件が削除されます。
          </p>
        </div>
      )}

      {maintenanceCount > 0 ? (
        <Link
          href={`/bonsai/${bonsai.id}`}
          className="inline-block rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          詳細へ戻る
        </Link>
      ) : (
        <DeleteConfirmForm
          action={deleteWithId}
          initialState={emptyBonsaiDeleteState}
          cancelHref={`/bonsai/${bonsai.id}`}
        />
      )}
    </main>
  );
}
