"use client";

import { useActionState } from "react";

import type { MaintenanceRecord, MaintenanceWorkType } from "@prisma/client";

import { toDateInputValue } from "@/lib/format";
import { MAINTENANCE_WORK_TYPE_LABEL } from "@/lib/maintenance-work-type";

import type { MaintenanceFormState } from "../form-state";

type MaintenanceFormProps = {
  action: (
    prevState: MaintenanceFormState,
    formData: FormData,
  ) => Promise<MaintenanceFormState>;
  initialState: MaintenanceFormState;
  // 編集時は既存の履歴を渡す(新規登録のときは省略)。
  defaultValues?: MaintenanceRecord;
  submitLabel?: string;
};

const WORK_TYPE_OPTIONS = Object.entries(MAINTENANCE_WORK_TYPE_LABEL) as Array<
  [MaintenanceWorkType, string]
>;

export function MaintenanceForm({
  action,
  initialState,
  defaultValues,
  submitLabel = "登録する",
}: MaintenanceFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  // エラーで差し戻された直後は「送信した値(state.values)」を優先し、
  // まだ送信していない初期表示では編集対象の既存データ(defaultValues)を使う
  // (BonsaiFormと同じ考え方)。
  const getValue = (name: string, fallback?: string | null) =>
    state.values[name] ?? fallback ?? "";

  return (
    <form
      key={JSON.stringify(state.values)}
      action={formAction}
      className="space-y-5"
      noValidate
    >
      {state.message && (
        <p
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}

      <div>
        <label
          htmlFor="maintenanceDate"
          className="block text-sm font-medium text-gray-700"
        >
          実施日<span className="ml-1 text-red-500">*</span>
        </label>
        <input
          id="maintenanceDate"
          name="maintenanceDate"
          type="date"
          required
          defaultValue={getValue(
            "maintenanceDate",
            toDateInputValue(defaultValues?.maintenanceDate),
          )}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <FieldErrors errors={state.fieldErrors.maintenanceDate} />
      </div>

      <div>
        <label htmlFor="workType" className="block text-sm font-medium text-gray-700">
          作業種別<span className="ml-1 text-red-500">*</span>
        </label>
        <select
          id="workType"
          name="workType"
          defaultValue={
            getValue("workType", defaultValues?.workType) || "WATERING"
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {WORK_TYPE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <FieldErrors errors={state.fieldErrors.workType} />
      </div>

      <div>
        <label
          htmlFor="workerName"
          className="block text-sm font-medium text-gray-700"
        >
          担当者名
        </label>
        <input
          id="workerName"
          name="workerName"
          type="text"
          defaultValue={getValue("workerName", defaultValues?.workerName)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <FieldErrors errors={state.fieldErrors.workerName} />
      </div>

      <div>
        <label htmlFor="memo" className="block text-sm font-medium text-gray-700">
          備考
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={4}
          defaultValue={getValue("memo", defaultValues?.memo)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <FieldErrors errors={state.fieldErrors.memo} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}

function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <p className="mt-1 text-sm text-red-600" aria-live="polite">
      {errors[0]}
    </p>
  );
}
