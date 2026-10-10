import { UserRole } from "@prisma/client";

// ポートフォリオ公開用のデモアカウント。実在の担当者情報ではない。
// seed(prisma/seed.ts)でのユーザー作成と、ログイン画面の案内表示の
// 両方から参照することで、2箇所に同じ値を書いて食い違うのを防ぐ。
export const DEMO_ACCOUNTS = [
  {
    email: "admin@example.com",
    password: "AdminPass123!",
    name: "管理者デモ",
    role: UserRole.ADMIN,
    roleLabel: "管理者",
  },
  {
    email: "staff@example.com",
    password: "StaffPass123!",
    name: "一般ユーザーデモ",
    role: UserRole.STAFF,
    roleLabel: "一般ユーザー",
  },
] as const;
