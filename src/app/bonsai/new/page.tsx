import Link from "next/link";

import { BonsaiForm } from "../_components/BonsaiForm";
import { createBonsaiAction } from "../actions";
import { emptyBonsaiFormState } from "../form-state";

export default function NewBonsaiPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/bonsai"
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        ← 盆栽一覧へ戻る
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">盆栽の新規登録</h1>

      <BonsaiForm
        action={createBonsaiAction}
        initialState={emptyBonsaiFormState}
        submitLabel="登録する"
      />
    </main>
  );
}
