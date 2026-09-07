"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createMaintenanceRecord } from "@/lib/maintenance";
import {
  maintenanceFormSchema,
  toMaintenanceCreateInput,
} from "@/lib/validation/maintenance";

import type { MaintenanceFormState } from "./form-state";

const FIELD_NAMES = ["maintenanceDate", "workType", "workerName", "memo"] as const;

function extractValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const name of FIELD_NAMES) {
    values[name] = String(formData.get(name) ?? "");
  }
  return values;
}

// 外部キー制約違反(P2003)かどうかを判定する。
// フォーム表示後にその盆栽が別操作で削除された場合など、
// 親(Bonsai)が存在しない状態でMaintenanceRecordを作ろうとするとこのエラーになる。
function isForeignKeyConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}

export async function createMaintenanceRecordAction(
  bonsaiId: number,
  _prevState: MaintenanceFormState,
  formData: FormData,
): Promise<MaintenanceFormState> {
  const values = extractValues(formData);
  const parsed = maintenanceFormSchema.safeParse({
    maintenanceDate: formData.get("maintenanceDate"),
    workType: formData.get("workType"),
    workerName: formData.get("workerName"),
    memo: formData.get("memo"),
  });

  if (!parsed.success) {
    return {
      message: "入力内容を確認してください。",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    await createMaintenanceRecord(
      toMaintenanceCreateInput(parsed.data, bonsaiId),
    );
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return {
        message: "対象の盆栽が見つかりませんでした。一覧から登録し直してください。",
        fieldErrors: {},
        values,
      };
    }
    console.error("手入れ履歴の登録に失敗しました:", error);
    return {
      message: "登録に失敗しました。時間をおいて再度お試しください。",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath(`/bonsai/${bonsaiId}`);
  redirect(`/bonsai/${bonsaiId}`);
}
