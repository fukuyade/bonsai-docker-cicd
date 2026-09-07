# 実装計画(Day単位)

Notion「[📅 盆栽管理アプリ｜実装・応募・面接学習計画（1日単位）](https://app.notion.com/p/3d48e1b3220381ffa2dfd5d8e56196bd)」を基準とする。
Day 8での応募完成を目標に、Day 2以降は「ブランチ作成 → 実装 → push → Draft PR → その日の完成条件を満たしたらmainへmerge」で進める。

## 運用ルールに対する判断メモ

- **Day 1(`chore/project-setup`)のみ、例外的に`main`へ直接コミットした。** 理由: GitHub上でPull
  Requestを作成するにはベースブランチ(`main`)が実在している必要があり、リポジトリ作成直後は比較先が
  存在しないため。以後の判断はNotion計画の「毎日pushしてよい。ただし未完成ならmainへ無理にmergeせず、
  作業ブランチへpushしてDraft PRを更新する」ルールに従う。
- **Day 2以降は実装を`main`へ直接コミットしない。**

## Day 1｜方針確定・GitHub・Next.js初期構築(完了・mainへ直接コミット)

- [x] Next.js + TypeScript プロジェクト作成(`create-next-app`, App Router, `src/`, strict)
- [x] ESLint / Tailwind CSS セットアップ確認
- [x] `npm run lint` / `npm run build` / `npm run dev`(画面表示)の成功確認
- [x] README仮記載(目的・技術構成・今週のMVP)
- [x] GitHubリポジトリ作成・push(https://github.com/fukuyade/bonsai-docker-cicd)

## Day 2｜Docker Compose + MySQL(完了)

ブランチ: `feature/docker-environment`

- [x] `app` / `db` の2サービスでDockerfile・compose.yaml作成
- [x] MySQL 8、healthcheck、named volume、utf8mb4設定
- [x] `.env.example` / `.dockerignore` 整備
- [x] README起動・停止手順を追記

push条件: `docker compose up`でapp・dbが起動し、ブラウザでNext.js初期画面が表示される。実値入り`.env`が追跡対象外。

## Day 3｜Prisma・DB設計・seed(完了)

ブランチ: `feature/prisma-schema`

- [x] Prisma導入・MySQL接続(Prisma 7、driver adapter方式)
- [x] `Bonsai` / `MaintenanceRecord` スキーマ設計(1対多、`managementNumber`ユニーク制約、`onDelete: Restrict`)
- [x] マイグレーション作成(`prisma/migrations/20260907082216_init`)
- [x] seedスクリプトでダミーデータ投入(架空データのみ、Bonsai5件・MaintenanceRecord3件)

push条件: 空DBからmigration・seedを再現できる ✅(`docker compose down -v` → `up --build` →
`migrate dev` → `db:seed` の通しで確認済み)。README下書きにER図を追加 ✅。

### 遭遇した問題と対応(面接説明用メモ)

- **Prisma 7の破壊的変更**: `schema.prisma`内の`datasource.url`が廃止され、接続情報は
  `prisma.config.ts`(CLI/migrate用)と`PrismaClient`のdriver adapter(アプリ実行時用)に
  分離する方式になった。公式ドキュメント(pris.ly/d/prisma7-client-config)を確認して対応。
- **MySQL用の公式driver adapterが存在しない**: `@prisma/adapter-mysql`はnpmに存在せず、
  ワイヤプロトコル互換の`@prisma/adapter-mariadb`を使うのが公式の案内。
- **shadow database**: `migrate dev`は検証用DBを作るために「データベース作成権限」を要求する。
  アプリ用ユーザー(`bonsai_user`)は`bonsai`データベースのみに絞りたかったため、
  shadow db作成専用にroot接続(`SHADOW_DATABASE_URL`)を分離し、最小権限を維持した。
- **MySQL 8のcaching_sha2_password**: 既定の認証方式が、非TLS接続だと`mariadb`ドライバの
  ハンドシェイクをブロックする(接続プールが増えず無限にタイムアウトする)。
  `allowPublicKeyRetrieval: true`を明示して解決。
- **npmの新しいinstall-scripts制限**: 新しいnpmは未承認パッケージの`postinstall`を実行しないため、
  `@prisma/client`インストール時の自動`prisma generate`が働かないことがある。
  Dockerfileで`RUN npx prisma generate`を明示実行するよう変更。
- **匿名volumeの取り残し**: `node_modules`を匿名volumeで保護している影響で、依存関係を追加して
  イメージを再ビルドしても、既存コンテナ起動時に古いvolumeの中身が使われ続けることがあった。
  `docker compose down && up --build`でコンテナごと作り直すことで解決し、READMEに注記した。

## Day 4｜盆栽一覧・詳細

ブランチ: `feature/bonsai-list-detail`

- [ ] `/bonsai` 一覧取得・表示
- [ ] `/bonsai/[id]` 詳細取得・表示
- [ ] ステータスの日本語表示
- [ ] 空データ・存在しないID(404相当)の表示

push条件: seedデータを一覧・詳細で確認、存在しないIDの表示を確認、lint・build成功。

## Day 5｜盆栽登録・編集・Zod

ブランチ: `feature/bonsai-register-edit`

- [ ] `/bonsai/new` 登録フォーム
- [ ] `/bonsai/[id]/edit` 編集フォーム
- [ ] Server Actions + Zodによるサーバー側検証
- [ ] `managementNumber`重複時のエラー処理
- [ ] 保存中・成功・失敗表示

push条件: 正常系・異常系を確認、DBに想定外の値が入らない、内部エラーを画面へそのまま出さない。

## Day 6｜手入れ履歴・1対多の実装

ブランチ: `feature/maintenance-records`

- [ ] `/bonsai/[id]/maintenance/new` 登録
- [ ] 盆栽詳細画面での履歴一覧表示(実施日降順)
- [ ] 存在しない`bonsaiId`の処理

push条件: 複数の履歴を登録・表示、別の盆栽に履歴が混ざらない、不正IDを確認。

## Day 7｜エラー処理・UI・公開情報確認

ブランチ: `chore/error-handling-ui`

- [ ] loading / empty / error状態の表示
- [ ] フォームのエラーメッセージ・二重送信防止
- [ ] スマートフォン表示確認
- [ ] ログと利用者向けメッセージの分離
- [ ] 公開GitHubに実在情報が含まれていないか全体確認

応募前判定: 一覧・詳細・登録・編集・手入れ履歴が動作、Dockerで再現可能、lint・build成功、README起動手順あり、秘密・社内情報なし。

## Day 8｜README・最終確認・応募

ブランチ: `chore/readme-finalize`

- [ ] README必須項目を完成(概要・課題・機能一覧・技術構成・ER図・Docker起動手順・migration/seed手順・画面画像・工夫点・問題と解決・AI利用範囲・今後の改善案)
- [ ] lint・型・buildの最終確認
- [ ] PR・Issue状態の整理、未使用コード・デバッグ出力の確認
- [ ] GitHubプロフィールへピン留め、職務経歴書へ追記、応募

## Day 9(予備日)・Day 10〜16(応募後の面接学習フェーズ)

Day 8までに完成していれば、Day 9はクリーンな環境での再現確認のみ行い、Day 10以降(Docker/DB/Next.js/検証/Git運用/テスト・CI/AI利用の説明練習)へ進む。詳細はNotion計画表を参照。
