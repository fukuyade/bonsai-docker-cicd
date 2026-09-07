import Link from "next/link";
import { notFound } from "next/navigation";

import { getBonsaiById } from "@/lib/bonsai";

import { BonsaiForm } from "../../_components/BonsaiForm";
import { updateBonsaiAction } from "../../actions";
import { emptyBonsaiFormState } from "../../form-state";

export const dynamic = "force-dynamic";

export default async function EditBonsaiPage({
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

  // updateBonsaiActionは(id, prevState, formData)を受け取るので、
  // idを固定した関数をbindしてBonsaiFormへ渡す
  // (Server Actionへ追加の引数を渡す公式パターン)。
  const updateBonsaiWithId = updateBonsaiAction.bind(null, bonsai.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/bonsai/${bonsai.id}`}
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        ← 盆栽詳細へ戻る
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {bonsai.name} の編集
      </h1>

      <BonsaiForm
        action={updateBonsaiWithId}
        initialState={emptyBonsaiFormState}
        defaultValues={bonsai}
        submitLabel="更新する"
      />
    </main>
  );
}
