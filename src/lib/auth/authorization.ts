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

// 操作ログ(誰がいつ何を変更したか)の閲覧は管理者のみ。
// 一般ユーザーも手入れ履歴を編集できる代わりに、変更の追跡は管理者が行う想定。
export function canViewAuditLog(role: UserRole): boolean {
  return role === "ADMIN";
}
