"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { BonsaiDeleteState } from "../../../form-state";

/**
 * 削除確認フォーム。
 *
 * 誤操作を防ぐため、一覧や詳細から直接は削除できず、
 * 必ずこの確認画面を経由する作りにしている。
 */
export function DeleteConfirmForm({
  action,
  initialState,
  cancelHref,
}: {
  action: (prevState: BonsaiDeleteState) => Promise<BonsaiDeleteState>;
  initialState: BonsaiDeleteState;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      {state.message && (
        <p
          className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "削除中..." : "削除する"}
        </button>
        <Link
          href={cancelHref}
          className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
