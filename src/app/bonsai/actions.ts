"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createBonsai, updateBonsai } from "@/lib/bonsai";
import {
  bonsaiFormSchema,
  toBonsaiCreateInput,
} from "@/lib/validation/bonsai";

import type { BonsaiFormState } from "./form-state";

// Server Actionはフォームから直接POSTで呼ばれる。ブラウザの入力チェックを
// 迂回して(devtoolsで直接POSTするなど)不正な値が送られる可能性もあるため、
// クライアント側の検証とは別にサーバー側でも必ずZodで検証する。
//
// ("use server"ファイルは非同期関数以外をexportできないため、
//  BonsaiFormState型や初期値はform-state.tsに分離している)

const FORM_FIELD_NAMES = [
  "managementNumber",
  "name",
  "species",
  "status",
  "location",
  "acquiredAt",
  "nextMaintenanceDate",
  "memo",
] as const;

// エラーで差し戻すときに、入力し直させないよう送信された値を保持しておくためのヘルパー。
function extractValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const name of FORM_FIELD_NAMES) {
    values[name] = String(formData.get(name) ?? "");
  }
  return values;
}

function parseFormData(formData: FormData) {
  return bonsaiFormSchema.safeParse({
    managementNumber: formData.get("managementNumber"),
    name: formData.get("name"),
    species: formData.get("species"),
    status: formData.get("status"),
    location: formData.get("location"),
    acquiredAt: formData.get("acquiredAt"),
    nextMaintenanceDate: formData.get("nextMaintenanceDate"),
    memo: formData.get("memo"),
  });
}

// Prismaの一意制約違反(P2002)かどうかを判定するヘルパー。
// 内部のエラー内容(SQLやスタックトレース)をそのまま画面に出さず、
// 「管理番号が重複しています」という利用者向けメッセージに変換する。
function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function createBonsaiAction(
  _prevState: BonsaiFormState,
  formData: FormData,
): Promise<BonsaiFormState> {
  const values = extractValues(formData);
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return {
      message: "入力内容を確認してください。",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    };
  }

  let createdId: number;
  try {
    const bonsai = await createBonsai(toBonsaiCreateInput(parsed.data));
    createdId = bonsai.id;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        message: "この管理番号はすでに使われています。",
        fieldErrors: {
          managementNumber: ["この管理番号はすでに使われています。"],
        },
        values,
      };
    }
    // 想定外のエラーはログにだけ残し、詳細は画面に出さない。
    console.error("盆栽の登録に失敗しました:", error);
    return {
      message: "登録に失敗しました。時間をおいて再度お試しください。",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/bonsai");
  redirect(`/bonsai/${createdId}`);
}

export async function updateBonsaiAction(
  id: number,
  _prevState: BonsaiFormState,
  formData: FormData,
): Promise<BonsaiFormState> {
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
    await updateBonsai(id, toBonsaiCreateInput(parsed.data));
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        message: "この管理番号はすでに使われています。",
        fieldErrors: {
          managementNumber: ["この管理番号はすでに使われています。"],
        },
        values,
      };
    }
    console.error("盆栽の更新に失敗しました:", error);
    return {
      message: "更新に失敗しました。時間をおいて再度お試しください。",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/bonsai");
  revalidatePath(`/bonsai/${id}`);
  redirect(`/bonsai/${id}`);
}
