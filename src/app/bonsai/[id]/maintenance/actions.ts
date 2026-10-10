"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/dal";
import {
  createMaintenanceRecordWithAudit,
  updateMaintenanceRecordWithAudit,
} from "@/lib/maintenance";
import {
  maintenanceFormSchema,
  toMaintenanceInput,
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

function parseFormData(formData: FormData) {
  return maintenanceFormSchema.safeParse({
    maintenanceDate: formData.get("maintenanceDate"),
    workType: formData.get("workType"),
    workerName: formData.get("workerName"),
    memo: formData.get("memo"),
  });
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

// 操作ログに「誰が」を残すため、ログイン中の利用者を取得する。
// 未ログイン(または利用者が削除済み)ならログイン画面へ戻す。
async function requireActor() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return { id: user.id, name: user.name };
}

export async function createMaintenanceRecordAction(
  bonsaiId: number,
  _prevState: MaintenanceFormState,
  formData: FormData,
): Promise<MaintenanceFormState> {
  const actor = await requireActor();
  const values = extractValues(formData);
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return {
      message: "入力内容を確認してください。",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    await createMaintenanceRecordWithAudit({
      bonsaiId,
      input: toMaintenanceInput(parsed.data),
      actor,
    });
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

export async function updateMaintenanceRecordAction(
  bonsaiId: number,
  recordId: number,
  _prevState: MaintenanceFormState,
  formData: FormData,
): Promise<MaintenanceFormState> {
  const actor = await requireActor();
  const values = extractValues(formData);
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return {
      message: "入力内容を確認してください。",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    const result = await updateMaintenanceRecordWithAudit({
      id: recordId,
      bonsaiId,
      input: toMaintenanceInput(parsed.data),
      actor,
    });

    if (result === "not-found") {
      return {
        message: "対象の手入れ履歴が見つかりませんでした。",
        fieldErrors: {},
        values,
      };
    }
  } catch (error) {
    // 想定外のエラーはログにだけ残し、詳細は画面に出さない。
    console.error("手入れ履歴の更新に失敗しました:", error);
    return {
      message: "更新に失敗しました。時間をおいて再度お試しください。",
      fieldErrors: {},
      values,
    };
  }

  // 変更が無かった場合("unchanged")も、エラーではなく通常どおり詳細へ戻す。
  revalidatePath(`/bonsai/${bonsaiId}`);
  redirect(`/bonsai/${bonsaiId}`);
}
