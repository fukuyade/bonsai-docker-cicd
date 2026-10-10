import { AppHeader } from "../_components/AppHeader";

// /bonsai配下の全ページに共通のヘッダーを表示するレイアウト。
// AppHeaderの中でログイン確認(verifySession)をしているため、
// この配下(/bonsai以下の全ページ)はこのファイルを通すだけでログイン必須になる。
export default async function BonsaiLayout({
  children,
}: LayoutProps<"/bonsai">) {
  return (
    <div className="min-h-full">
      <AppHeader />
      {children}
    </div>
  );
}
