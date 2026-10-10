import { z } from "zod";

// ログインフォームの検証。
// パスワードの複雑さ要件はここでは課さない(利用者はアプリ側で作成する
// 社内アカウントであり、新規登録フォームは今回のスコープ外のため)。
export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "メールアドレスを入力してください")
    .email("メールアドレスの形式が正しくありません"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
