import { z } from "zod";

export const maintenanceFormSchema = z.object({
  maintenanceDate: z
    .string()
    .min(1, "実施日を入力してください")
    .refine((value) => !Number.isNaN(Date.parse(value)), "実施日の形式が正しくありません"),
  workType: z.enum(
    ["WATERING", "PRUNING", "REPOTTING", "FERTILIZING", "PEST_CONTROL", "OTHER"],
    { message: "作業種別を選択してください" },
  ),
  workerName: z.string().trim().max(100, "担当者名は100文字以内で入力してください").optional(),
  memo: z.string().trim().max(2000, "備考は2000文字以内で入力してください").optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

// フォームの値(文字列)を、DBへ渡す形(Date・null)へ変換する。作成・更新で共用。
export function toMaintenanceInput(values: MaintenanceFormValues) {
  return {
    maintenanceDate: new Date(values.maintenanceDate),
    workType: values.workType,
    workerName: values.workerName || null,
    memo: values.memo || null,
  };
}
