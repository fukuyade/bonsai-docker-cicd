import Link from "next/link";
import { notFound } from "next/navigation";

import { getBonsaiById } from "@/lib/bonsai";

import { createMaintenanceRecordAction } from "../actions";
import { MaintenanceForm } from "../_components/MaintenanceForm";
import { emptyMaintenanceFormState } from "../form-state";

export const dynamic = "force-dynamic";

export default async function NewMaintenanceRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bonsaiId = Number(id);

  if (!Number.isInteger(bonsaiId)) {
    notFound();
  }

  const bonsai = await getBonsaiById(bonsaiId);

  if (!bonsai) {
    notFound();
  }

  // 対象の盆栽IDを固定したServer Actionをbindしてフォームへ渡す。
  const createMaintenanceRecordWithBonsaiId = createMaintenanceRecordAction.bind(
    null,
    bonsai.id,
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {bonsai.name} の手入れ履歴登録
      </h1>

      <MaintenanceForm
        action={createMaintenanceRecordWithBonsaiId}
        initialState={emptyMaintenanceFormState}
      />
    </main>
  );
}
