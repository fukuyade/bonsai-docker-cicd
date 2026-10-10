import { AppHeader } from "../_components/AppHeader";

// /admin配下(管理者向けの画面)の共通レイアウト。
// ログイン確認はAppHeaderが行う。管理者かどうかの判定は各ページ側で行う。
export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  return (
    <div className="min-h-full">
      <AppHeader />
      {children}
    </div>
  );
}
