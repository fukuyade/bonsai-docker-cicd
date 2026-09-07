import { z } from "zod";

// フォーム送信されるFormDataは全て文字列なので、まず文字列として検証する。
// 日付や数値への変換は各Server Action側で行う(スキーマ自体をシンプルに保つため)。
export const bonsaiFormSchema = z.object({
  managementNumber: z
    .string()
    .trim()
    .min(1, "管理番号を入力してください")
    .max(50, "管理番号は50文字以内で入力してください"),
  name: z.string().trim().min(1, "盆栽名を入力してください").max(100, "盆栽名は100文字以内で入力してください"),
  species: z
    .string()
    .trim()
    .min(1, "樹種を入力してください")
    .max(100, "樹種は100文字以内で入力してください"),
  status: z.enum(
    ["HEALTHY", "NEEDS_CARE", "UNDER_TREATMENT", "INACTIVE"],
    { message: "管理状態を選択してください" },
  ),
  location: z.string().trim().max(100, "設置場所は100文字以内で入力してください").optional(),
  acquiredAt: z
    .string()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "入手日の形式が正しくありません",
    ),
  nextMaintenanceDate: z
    .string()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "次回手入れ予定日の形式が正しくありません",
    ),
  memo: z.string().trim().max(2000, "備考は2000文字以内で入力してください").optional(),
});

export type BonsaiFormValues = z.infer<typeof bonsaiFormSchema>;

// フォーム(文字列)の値を、Prismaへ渡すためのデータに変換する。
// 空文字は「未入力」としてnullに揃える。
export function toBonsaiCreateInput(values: BonsaiFormValues) {
  return {
    managementNumber: values.managementNumber,
    name: values.name,
    species: values.species,
    status: values.status,
    location: values.location || null,
    acquiredAt: values.acquiredAt ? new Date(values.acquiredAt) : null,
    nextMaintenanceDate: values.nextMaintenanceDate
      ? new Date(values.nextMaintenanceDate)
      : null,
    memo: values.memo || null,
  };
}

export type BonsaiCreateInput = ReturnType<typeof toBonsaiCreateInput>;
