import type { UserRole } from "@prisma/client";

// 権限judgeはDBアクセスを含まない純粋関数にしておく。
// bonsai-search.ts(A2)と同じ理由で、単体テストしやすくするため。
//
// 現状のルール: 削除はADMINのみ。閲覧・登録・編集はSTAFFでも可能。
// 「何ができるか」をここに集約しておけば、将来ルールが増えても
// この1ファイルとテストだけ見れば全体像が分かる。
export function canDeleteBonsai(role: UserRole): boolean {
  return role === "ADMIN";
}
