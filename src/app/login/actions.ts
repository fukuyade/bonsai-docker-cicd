"use server";

import { redirect } from "next/navigation";

import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { loginFormSchema } from "@/lib/validation/auth";

import type { LoginFormState } from "./form-state";

// 「メールアドレスが存在しない」と「パスワードが違う」を区別せず同じ
// メッセージにする。区別すると、登録済みメールアドレスの有無を
// 総当たりで調べられてしまう(ユーザー列挙攻撃)ため。
const INVALID_CREDENTIALS_MESSAGE =
  "メールアドレスまたはパスワードが正しくありません。";

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      message: "入力内容を確認してください。",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // userが存在しない場合とパスワード不一致の場合を、あえて同じ分岐にしている
  // (上記の理由)。存在しない場合はverifyPasswordを呼ばずスキップする。
  const isValid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !isValid) {
    return { message: INVALID_CREDENTIALS_MESSAGE, fieldErrors: {} };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect("/bonsai");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
