# 盆栽管理アプリ (bonsai-docker-cicd)

> 個人開発ポートフォリオ。実在の盆栽・担当者・顧客情報は使用せず、架空データのみで構成しています。

## 概要

盆栽を管理する担当者が、保有する盆栽の基本情報と手入れ履歴を記録・確認するための社内向け管理アプリです。
Excelでの一覧管理で起こりがちな「更新履歴が残らない」「複数人での同時編集に弱い」といった課題を、
Webアプリ化によって解消することを目的とした個人開発プロジェクトです。

## 作成背景・解決したい課題

- 盆栽の基本情報と手入れ履歴が別々に管理され、1本の盆栽に対する作業履歴を時系列で追いにくい
- Excel運用は変更履歴や入力値検証が弱く、誤入力・重複登録が起きやすい
- Webアプリ化により、一覧・検索・登録・履歴管理を1つの画面体系にまとめる

## 使用技術と採用理由(採用予定)

| 技術 | 理由 |
|---|---|
| Next.js 16 (App Router) / TypeScript | フロントエンド・バックエンドを1つのコードベースで実装でき、Server Actionsで責務を分離しやすいため |
| MySQL 8 + Prisma | リレーショナルなデータ(盆栽 1 : 手入れ履歴 多)を型安全に扱うため |
| Docker Compose | `app`/`db` をコード化し、誰でも同じ環境を再現できるようにするため |
| Zod | サーバー側の入力値検証を型定義と一体化するため |
| Tailwind CSS | 管理画面のUIを素早く一貫したスタイルで組むため |

技術選定の詳細な理由・バージョンは [docs/decisions.md](docs/decisions.md)(今後追加予定)にも記録していきます。

## 機能一覧(今週のMVP: P0)

- [ ] 盆栽情報の一覧・登録・詳細・編集
- [ ] 手入れ履歴の登録・表示
- [ ] 盆栽と手入れ履歴の1対多リレーション
- [ ] 入力値検証(Zod)と例外処理
- [x] Docker ComposeでのNext.js + MySQL起動
- [ ] Prisma接続
- [ ] 初期ダミーデータ投入

P1(削除・検索・テスト・CI等)・P2(認証・画像アップロード・デプロイ等)は今回のMVP範囲外です。詳細は Issue を参照してください。

## ディレクトリ構成

```
src/
  app/        # App Router (ルーティング・ページ)
public/       # 静的アセット
Dockerfile    # app(Next.js)コンテナのビルド定義
compose.yaml  # app・db 2サービスの定義
.env.example  # 環境変数のキー名と安全なダミー値の例
```

Prisma関連のディレクトリは今後のIssueで追加していきます。

## 開発環境の起動手順

### Docker Compose(推奨)

`app`(Next.js)・`db`(MySQL 8)の2サービスをDocker Composeで起動します。

```bash
cp .env.example .env   # 値はダミーのままでもローカル動作可
docker compose up --build
```

http://localhost:3000 で確認できます。ソースコードはbind mountされているため、
`src/`配下を編集すると自動でホットリロードされます(コンテナの再ビルド不要)。

```bash
docker compose down       # 停止(dbのデータは保持される)
docker compose down -v    # 停止 + dbのデータも削除
```

`app`コンテナは`db`という**サービス名**をホスト名としてMySQLへ接続します(`localhost`ではありません)。
Docker Composeが作る内部ネットワークでは、サービス名がそのままDNS解決されるためです。

### ローカルNode.js環境(Dockerを使わない場合)

```bash
npm install
npm run dev
```

http://localhost:3000 で確認できます。この場合はMySQLへの接続は別途用意する必要があります。

```bash
npm run lint   # ESLint
npm run build  # 本番ビルド
```

## 今後の予定

1. ~~Docker Compose環境(Next.js + MySQL)~~ ✅ 完了
2. Prisma導入・スキーマ設計・マイグレーション・seed
3. 盆栽CRUD実装
4. 手入れ履歴の登録・表示実装
5. README・画面画像・工夫した点/苦労した点の追記

## AIを使った範囲(進行中・随時更新)

このプロジェクトは Claude Code を利用しながら開発しています。各Issue・Pull Requestに、AIが担当した部分と本人が確認・判断した内容を記録していきます。
