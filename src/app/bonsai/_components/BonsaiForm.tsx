"use client";

import { useActionState } from "react";

import type { Bonsai } from "@prisma/client";

import { BONSAI_STATUS_LABEL } from "@/lib/bonsai-status";
import { toDateInputValue } from "@/lib/format";

import type { BonsaiFormState } from "../form-state";

type BonsaiFormProps = {
  action: (
    prevState: BonsaiFormState,
    formData: FormData,
  ) => Promise<BonsaiFormState>;
  initialState: BonsaiFormState;
  defaultValues?: Bonsai;
  submitLabel: string;
};

const STATUS_OPTIONS = Object.entries(BONSAI_STATUS_LABEL) as Array<
  [Bonsai["status"], string]
>;

export function BonsaiForm({
  action,
  initialState,
  defaultValues,
  submitLabel,
}: BonsaiFormProps) {
  // useActionStateはServer Actionの戻り値(BonsaiFormState)をstateとして保持し、
  // formActionをフォームのaction propに渡すと、送信中はpendingがtrueになる。
  const [state, formAction, pending] = useActionState(action, initialState);

  // 入力欄はdefaultValue(非制御)で扱っている。エラーで差し戻された直後は
  // 「送信した値(state.values)」を優先し、まだ何も送信していない初期表示では
  // 編集対象の既存データ(defaultValues)を使う。
  const getValue = (name: string, fallback?: string | null) =>
    state.values[name] ?? fallback ?? "";

  return (
    // formのkeyをstate.valuesの中身で変えることで、エラー後に入力欄へ
    // 送信済みの値を反映させる(defaultValueは初回マウント時にしか効かないため、
    // 値が変わったら入力欄ごと作り直す)。
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

      <TextField
        label="管理番号"
        name="managementNumber"
        required
        defaultValue={getValue("managementNumber", defaultValues?.managementNumber)}
        errors={state.fieldErrors.managementNumber}
        placeholder="No.001"
      />
      <TextField
        label="盆栽名"
        name="name"
        required
        defaultValue={getValue("name", defaultValues?.name)}
        errors={state.fieldErrors.name}
      />
      <TextField
        label="樹種"
        name="species"
        required
        defaultValue={getValue("species", defaultValues?.species)}
        errors={state.fieldErrors.species}
      />

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          管理状態
        </label>
        <select
          id="status"
          name="status"
          defaultValue={getValue("status", defaultValues?.status ?? "HEALTHY")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <FieldErrors errors={state.fieldErrors.status} />
      </div>

      <TextField
        label="設置場所"
        name="location"
        defaultValue={getValue("location", defaultValues?.location)}
        errors={state.fieldErrors.location}
      />
      <TextField
        label="入手日"
        name="acquiredAt"
        type="date"
        defaultValue={getValue(
          "acquiredAt",
          toDateInputValue(defaultValues?.acquiredAt),
        )}
        errors={state.fieldErrors.acquiredAt}
      />
      <TextField
        label="次回手入れ予定日"
        name="nextMaintenanceDate"
        type="date"
        defaultValue={getValue(
          "nextMaintenanceDate",
          toDateInputValue(defaultValues?.nextMaintenanceDate),
        )}
        errors={state.fieldErrors.nextMaintenanceDate}
      />

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

function TextField({
  label,
  name,
  required = false,
  type = "text",
  defaultValue,
  errors,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
  errors?: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={errors && errors.length > 0}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <FieldErrors errors={errors} />
    </div>
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
