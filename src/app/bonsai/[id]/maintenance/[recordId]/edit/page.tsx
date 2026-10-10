import Link from "next/link";
import { notFound } from "next/navigation";

import { getBonsaiById } from "@/lib/bonsai";
import { getMaintenanceRecord } from "@/lib/maintenance";

import { updateMaintenanceRecordAction } from "../../actions";
import { MaintenanceForm } from "../../_components/MaintenanceForm";
import { emptyMaintenanceFormState } from "../../form-state";

export const dynamic = "force-dynamic";

export default async function EditMaintenanceRecordPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>;
}) {
  const { id, recordId } = await params;
  const bonsaiId = Number(id);
  const maintenanceRecordId = Number(recordId);

  if (!Number.isInteger(bonsaiId) || !Number.isInteger(maintenanceRecordId)) {
    notFound();
  }

  const [bonsai, record] = await Promise.all([
    getBonsaiById(bonsaiId),
    // 盆栽IDも条件に含めるため、別の盆栽の履歴IDをURLに指定しても取得できず404になる。
    getMaintenanceRecord(maintenanceRecordId, bonsaiId),
  ]);

  if (!bonsai || !record) {
    notFound();
  }

  // 対象の盆栽ID・履歴IDを固定したServer Actionをbindしてフォームへ渡す。
  const updateWithIds = updateMaintenanceRecordAction.bind(
    null,
    bonsai.id,
    record.id,
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/bonsai/${bonsai.id}`}
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        ← 盆栽詳細へ戻る
      </Link>

      <p className="text-sm text-gray-500">{bonsai.managementNumber}</p>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">
        {bonsai.name} の手入れ履歴を編集
      </h1>

      <p className="mb-6 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
        変更内容は操作ログに記録されます(誰が・いつ・何を変更したか)。
      </p>

      <MaintenanceForm
        action={updateWithIds}
        initialState={emptyMaintenanceFormState}
        defaultValues={record}
        submitLabel="更新する"
      />
    </main>
  );
}
