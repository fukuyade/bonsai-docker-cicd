import { DEMO_ACCOUNTS } from "@/lib/auth/demo-accounts";

// ポートフォリオ公開用に、ログイン画面へデモアカウントを案内表示する。
// 表示するかどうかは環境変数SHOW_DEMO_ACCOUNTSで切り替え、実運用相当の環境では
// 表示しない(認証情報を画面に出すのは、あくまで公開デモ専用の例外的な見せ方)。
export function DemoAccountsNotice() {
  return (
    <section
      aria-label="デモアカウント"
      className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p className="font-medium">デモ用アカウント</p>
      <p className="mt-1 text-xs text-amber-800">
        ポートフォリオ公開用のダミーアカウントです。削除は管理者のみ可能です。
      </p>
      <ul className="mt-3 space-y-3">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.email} className="rounded-md bg-white/70 p-3">
            <p className="text-xs font-medium text-amber-800">
              {account.roleLabel}
            </p>
            <p className="mt-1 break-all font-mono text-xs">{account.email}</p>
            <p className="font-mono text-xs">{account.password}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
