# Issue分割計画(P0)

GitHubリポジトリ作成後、以下をIssueとして登録し、各Issueに対応するブランチでPull Requestを作成する。

## 運用ルールに対する判断メモ

引き継ぎ書では「mainへ直接実装せず、Issue単位でブランチとPull Requestを作成する」と定めているが、
**プロジェクトの雛形を作るための最初のコミット(`create-next-app`の出力そのもの)のみ、例外的に`main`へ直接コミットした。**

- 理由: GitHub上でPull Requestを作成するには比較先のベースブランチ(`main`)が実在している必要があり、
  何もない状態からブランチを切ってもPRの相手先が存在しない。
- そのため「リポジトリの雛形を用意する初期化コミット」は`main`に直接置き、
  **Issue 2(`feature/docker-environment`)以降はすべてブランチ作成 → Pull Request → マージのフローで進める。**
- 実装内容そのもの(盆栽CRUD等)は最初から一切`main`に直接コミットしていない。

## 1. chore/project-setup(完了・mainへ直接コミット)
Next.js初期構築、lint、基本ディレクトリ構成。

- [x] Next.js + TypeScript プロジェクト作成(`create-next-app`)
- [x] ESLint / Tailwind CSS セットアップ確認
- [x] `npm run lint` / `npm run build` の成功確認
- [x] README仮記載(目的・技術構成・今週のMVP)

## 2. feature/docker-environment
Docker ComposeとMySQL。

- [ ] `app` / `db` サービスの Dockerfile・compose.yaml 作成
- [ ] `db` に healthcheck・named volume・utf8mb4 設定
- [ ] `.env.example` / `.dockerignore` 整備
- [ ] README起動手順追記

## 3. feature/prisma-schema
Prisma、マイグレーション、seed。

- [ ] Prisma導入・MySQL接続
- [ ] `Bonsai` / `MaintenanceRecord` スキーマ設計(1対多)
- [ ] マイグレーション作成
- [ ] seedスクリプトで初期ダミーデータ投入

## 4. feature/bonsai-crud
盆栽一覧・登録・詳細・編集。

- [ ] `/bonsai` 一覧
- [ ] `/bonsai/new` 登録(Server Action + Zod検証)
- [ ] `/bonsai/[id]` 詳細
- [ ] `/bonsai/[id]/edit` 編集
- [ ] 存在しないID・管理番号重複時のエラー処理

## 5. feature/maintenance-records
手入れ履歴登録・表示。

- [ ] `/bonsai/[id]/maintenance/new` 登録
- [ ] 盆栽詳細画面への履歴一覧表示
- [ ] 1対多リレーションの動作確認

## 6. chore/validation-readme
検証、エラー処理、README、テスト。

- [ ] 入力値検証・例外処理の総点検
- [ ] README完成(ER図・画面画像・工夫点・苦労した点)
- [ ] (P1) Vitestによる検証テスト
- [ ] (P1) GitHub Actionsでlint・build自動実行
