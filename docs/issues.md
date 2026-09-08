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

## Day 4｜盆栽一覧・詳細(完了)

ブランチ: `feature/bonsai-list-detail`

- [x] `/bonsai` 一覧取得・表示
- [x] `/bonsai/[id]` 詳細取得・表示
- [x] ステータスの日本語表示(色付きバッジ)
- [x] 空データ・存在しないID(404相当)の表示

push条件: seedデータを一覧・詳細で確認 ✅、存在しないID(`/bonsai/999`)・非数値ID(`/bonsai/abc`)が
404を返すことを確認 ✅、lint・build成功 ✅。

### 遭遇した問題と対応(面接説明用メモ)

- **ビルド時にDBへ接続しようとして失敗**: `/bonsai`はDBアクセスを含むが`cookies()`等の
  動的APIを使っていないため、Next.jsは既定でビルド時の静的プリレンダリングを試みる。
  ビルド環境(ホスト)からは`db`ホスト名へ到達できず`next build`が失敗した。
  管理画面は常に最新のDB状態を見せたいという要件とも合致するため、
  `export const dynamic = "force-dynamic"`を明示して都度サーバーレンダリングにした。
- **seedを複数回実行するとidがずれる**: `deleteMany()`だけではAUTO_INCREMENTがリセットされず、
  実行するたびに`id`が6, 7, 8…と増え続けた。「何度実行しても同じ結果になる」という
  seedスクリプト本来の意図に反するため、`ALTER TABLE ... AUTO_INCREMENT = 1`を追加して解決。

## Day 5｜盆栽登録・編集・Zod(完了)

ブランチ: `feature/bonsai-register-edit`

- [x] `/bonsai/new` 登録フォーム
- [x] `/bonsai/[id]/edit` 編集フォーム
- [x] Server Actions + Zodによるサーバー側検証
- [x] `managementNumber`重複時のエラー処理
- [x] 保存中・成功・失敗表示

push条件: 正常系・異常系を確認 ✅(新規登録→詳細反映、編集→更新反映、必須項目未入力の
Zodエラー、管理番号重複エラーをすべてブラウザ操作で確認)、DBに想定外の値が入らない ✅、
内部エラーを画面へそのまま出さない ✅(Prismaのエラーはconsole.errorのみ、画面には
汎用メッセージ)。lint・build成功 ✅。

### 遭遇した問題と対応(面接説明用メモ)

- **`"use server"`ファイルは非同期関数以外exportできない**: `actions.ts`に定数(初期state)を
  一緒に書いたら`A "use server" file can only export async functions`でビルドエラー。
  型・初期値は`form-state.ts`という別の通常ファイルに分離した。
- **エラーで差し戻すと他の入力項目まで空になる**: `defaultValue`(非制御input)は初回マウント時
  にしか効かないため、`useActionState`でstateが更新されても入力欄には反映されなかった。
  Server Actionの戻り値に送信済みの値(`values`)を含めて返し、`<form key={...}>`で
  stateが変わるたびにフォームごと再マウントさせることで解決。
- **Windows + Docker Desktopでのファイル監視の不具合**: 新規ファイル(`form-state.ts`など)を
  追加した直後、Turbopackがそれを検知できず`Module not found`になった。ブラウザの
  Networkタブでサーバーの実際のレスポンスを見て「まだ古いコードが動いている」ことに気づき、
  `docker compose restart app`で解決。既存ファイルの編集(HMR)は問題なく効くが、
  **新規ファイル追加時だけは要注意**という学びをREADMEに追記した。

## Day 6｜手入れ履歴・1対多の実装(完了)

ブランチ: `feature/maintenance-records`

- [x] `/bonsai/[id]/maintenance/new` 登録
- [x] 盆栽詳細画面での履歴一覧表示(実施日降順)
- [x] 存在しない`bonsaiId`の処理

push条件: 複数の履歴を登録・表示 ✅(ブラウザ操作でNo.001に新規履歴を追加し、
実施日降順の先頭に表示されることを確認)、別の盆栽に履歴が混ざらない ✅(No.002を開き、
No.001の履歴が出ないことを確認)、不正ID(`/bonsai/999/maintenance/new`)がHTTP 404を
返すことを確認 ✅。lint・build成功 ✅。

### 遭遇した問題と対応(面接説明用メモ)

- **includeの使い方**: 盆栽詳細を取得する際に`include: { maintenanceRecords: { orderBy } }`で
  1回のクエリで関連する手入れ履歴もまとめて取得(N+1回避、SQLのJOINに相当)。
  一覧・編集用の`getBonsaiById`とは別に`getBonsaiWithMaintenanceRecords`を用意し、
  用途ごとに必要な分だけ取得するようにした。
- **親が存在しない履歴を防ぐ仕組み**: フォーム表示後に対象の盆栽が別操作で削除された場合、
  外部キー制約違反(Prismaのエラーコード`P2003`)としてDB側で確実にブロックされる。
  アプリ側のバリデーションだけでなく、DBスキーマの制約自体が最後の砦になっている。
- **ブラウザ操作ツールのref(要素参照)クリックが効かないことがあった**: 要素をref経由でクリック
  しても実際にはボタンが押されずPOSTが飛ばないケースに遭遇。座標を目視確認して直接クリックする
  ことで解決(ツール側の問題であり、アプリの実装とは無関係)。

## Day 7｜エラー処理・UI・公開情報確認(完了)

ブランチ: `chore/error-handling-ui`

- [x] loading / empty / error状態の表示
- [x] フォームのエラーメッセージ・二重送信防止(Day5/6で実装済み、再確認)
- [x] スマートフォン表示確認
- [x] ログと利用者向けメッセージの分離
- [x] 公開GitHubに実在情報が含まれていないか全体確認

応募前判定: 一覧・詳細・登録・編集・手入れ履歴が動作 ✅、Dockerで再現可能 ✅、
lint・build成功 ✅、README起動手順あり ✅、秘密・社内情報なし ✅
(grepで実在の会社名・個人情報・拠点名等がないことを確認、GitHubユーザー名のリポジトリURL記載のみ)。

### 遭遇した問題と対応(面接説明用メモ)

- **開発モードは詳細なエラーをブラウザへ返す(仕様通り)**: `next dev`でDB接続を切って`/bonsai`に
  アクセスすると、レスポンスにPrismaのスタックトレースやSQLクエリ内容まで含まれていた。
  最初は「情報が漏れている」と焦ったが、これは`next dev`が開発者の利便性のために意図的に行う
  挙動で、本番ビルド(`next build && next start`)で同じ状況を再現したところ、ブラウザ側には
  `digest`(ハッシュ)だけが渡り、詳細はサーバーのコンソールにしか出ないことを確認できた。
  「開発時に見えるログ」と「本番で利用者に見えるログ」は別物であることを実地で確認した。
- **error.tsxのprop名がreset→retryに変更されている**: Next.js 16の変更点(Day1のAGENTS.md指示に
  従いnode_modules内のドキュメントを確認して対応)。
- **mysqlクライアントの文字コード指定漏れでDELETEが効かない**: 動作確認用に手動でDELETE文を
  実行した際、`--default-character-set=utf8mb4`を付け忘れると、WHERE句の日本語文字列が
  正しく比較されず0件のまま何も削除されない(エラーは出ない)。SELECT側では気づかず、原因調査に
  時間がかかった。アプリのコード自体の問題ではないが、DB動作確認の手順として記録。
- **テーブルのスマートフォン表示崩れ**: 5列のテーブルが375px幅では各セル内で日本語が
  縦に折り返され読みにくかった。`whitespace-nowrap` + `overflow-x-auto`で1行固定+横スクロールに変更。

## Day 8｜README・最終確認・応募(コード面完了、応募はユーザー作業)

ブランチ: `chore/readme-finalize`

- [x] README必須項目を完成(概要・課題・機能一覧・技術構成・ER図・Docker起動手順・migration/seed手順・画面一覧・工夫点・問題と解決・今後の改善案・AI利用範囲)
- [x] lint・型・buildの最終確認
- [x] PR・Issue状態の整理(PR #1〜6すべてマージ済み、Open 0件を確認)、未使用コード・デバッグ出力の確認(console.log/TODO等なし)
- [ ] GitHubプロフィールへピン留め、職務経歴書へ追記、応募 ← ここはユーザー本人の作業

### 遭遇した問題と対応(面接説明用メモ)

- **画面キャプチャの自動保存ができなかった**: ブラウザ操作ツールのスクリーンショット保存機能が
  この環境では保存先パスを返さず、README用の画像ファイルとして直接埋め込めなかった。
  README内では画面一覧(パス一覧)と、Docker Composeで実際に操作して確認できる旨を明記する形にし、
  スクリーンショット追加は今後の作業として残した。

## Day 9(予備日)・Day 10〜16(応募後の面接学習フェーズ)

Day 8までに完成していれば、Day 9はクリーンな環境での再現確認のみ行い、Day 10以降(Docker/DB/Next.js/検証/Git運用/テスト・CI/AI利用の説明練習)へ進む。詳細はNotion計画表を参照。

---

# 追加実装フェーズ(A1〜A4)

Day 1〜8相当を1日で完了したため、Day 10以降の復習に入る前に応募品質版へ引き上げる追加実装を行う。
A1〜A4は暦日ではなく、PRを分けるための作業単位。

## A1｜盆栽ごとの4方向写真を表示(完了)

ブランチ: `feature/bonsai-images`

- [x] 生成済みの架空画像20枚を `public/images/bonsai/` 配下へ配置
- [x] No.001〜005ごとに正面・右・左・背面の4枚を紐付ける
- [x] 盆栽詳細画面に写真ギャラリーを追加
- [x] 写真の向きが分かるラベルと適切なalt属性を付ける
- [x] PC・スマートフォンでレイアウトを確認
- [x] READMEに「画像はAI生成の架空データ」と明記

完成条件: 5鉢すべてで4方向の画像が表示される ✅ / 別の盆栽の画像が混ざらない ✅(No.005で確認) /
画像がない場合も画面が壊れない ✅(一時的にDBから削除して「写真は登録されていません。」の表示を確認) /
migration・seed・lint・build成功 ✅

### 設計判断

- **画像はDBにバイナリで持たず、パスだけを保存**: DBにバイナリを入れるとバックアップ・転送が重くなり、
  Webサーバーからの配信も非効率になる。ファイルは`public/`に置き、DBは`imagePath`だけを持つ。
- **`Bonsai 1 : N BonsaiImage` の1対多**: 1鉢につき4方向の写真があり、将来的に枚数が変わる可能性も
  あるため、盆栽テーブルに`frontImage`等の固定カラムを増やすのではなくテーブルを分けた。
- **`angle`を列挙型にした理由**: 自由入力だと「正面」「front」「FRONT」など表記ゆれが混入する。
  enumにすればDB側で4値以外を弾ける。さらに`@@unique([bonsaiId, angle])`で同じ向きの二重登録も防止。
- **写真は`onDelete: Cascade`**: 手入れ履歴は業務記録なので`Restrict`(削除を拒否)にしたが、
  写真は盆栽に完全に付随するデータで、親が消えたら単独で残す意味がないため`Cascade`を選択。
  **同じ「1対多」でも、データの性質によって削除時の挙動を変えている**点が設計上のポイント。
- **画像の圧縮**: 元画像は1254px PNGで計42MB。ポートフォリオのリポジトリとしては重く、cloneが遅くなる
  ため、800px・JPEG(品質82)へ変換して計2.0MB(約95%削減)にしてからコミットした。
  写真はPNGよりJPEGの方が大幅に軽い。
- **`next/image`を使用**: 表示サイズに応じた画像最適化と遅延読み込みが自動で行われる。
  `sizes`を指定してスマートフォンでは小さい画像が配信されるようにした。

### 遭遇した問題と対応

- **seedが`Cannot read properties of undefined (reading 'FRONT')`で失敗**: `migrate dev`実行後も、
  コンテナ内のPrisma Clientに新しいenum(`BonsaiImageAngle`)が反映されていなかった。
  `docker compose exec app npx prisma generate`を明示実行して解決。
  スキーマにenumやモデルを追加したときは、**マイグレーションだけでなくClientの再生成も必要**。
- **UNIQUE制約の動作確認**: 手動で重複INSERTを試し、
  `Duplicate entry '1-FRONT' for key 'bonsai_image.bonsai_image_bonsaiId_angle_key'`
  が返ることを確認した。

## A2｜検索・絞り込み＋安全な削除(完了)

ブランチ: `feature/bonsai-search-delete`

- [x] 管理番号・樹種・名称の部分一致検索
- [x] 状態・設置場所による絞り込み
- [x] 検索条件をURLのクエリパラメータへ保持
- [x] 検索結果0件の表示
- [x] 盆栽削除機能
- [x] 削除前の確認表示
- [x] 手入れ履歴がある盆栽は`onDelete: Restrict`に従って削除を拒否
- [x] 内部エラーをそのまま表示せず、利用者向けメッセージへ変換

### 設計判断

- **検索フォームは素のHTML `method="get"`**: JavaScriptを使わずに動き、送信すると入力値が
  そのままURLのクエリパラメータになる。検索結果のURLを共有・ブックマークでき、ブラウザの
  戻る/進むも自然に効く。Client Componentにして状態管理する必要がない。
- **where句の組み立てを純粋関数に分離**(`src/lib/bonsai-search.ts`の`buildBonsaiWhere`):
  DBアクセスを含まないので、そのまま単体テストできる(A3でテストを書く)。
- **不正なstatusは「指定なし」として扱う**: URLは利用者が自由に書き換えられるため、
  `?status=INVALID` のような値が来ても落ちずに全件表示になるようにした(実際に確認済み)。
- **絞り込み候補(設置場所)はDBの実データから生成**: 固定リストを持たず`distinct`で取得するため、
  データが増えても選択肢が自動で追従する。
- **削除は確認画面を必ず経由**: 一覧や詳細から直接は削除できない作りにして誤操作を防いだ。
- **物理削除を選択した理由**: 論理削除(削除フラグ)は「参照する全クエリでフラグ除外を忘れない」
  運用コストがかかる。今回のMVPでは復元要件がないため物理削除とし、代わりに
  「履歴がある盆栽は削除できない」制約で重要データを守る方針にした。
- **「履歴の有無を事前SELECTして判定」ではなくDB制約に任せた**: 確認と削除の間に履歴が
  追加されると通り抜けてしまう(競合状態)。外部キー制約違反(P2003)を捕捉する方が確実。
  ただし利用者体験のため、確認画面では事前に件数を表示して理由を先に伝えている。

### 動作確認

- キーワード「松」→ No.001・No.002 がヒット
- 状態HEALTHY → No.001・No.004 がヒット
- 複合条件(松 + 展示場A)→ No.001 のみ
- 該当なし → 「条件に一致する盆栽が見つかりませんでした。」
- `?status=INVALID` → 無視され全5件表示(落ちない)
- 履歴なしのNo.004をブラウザから削除 → 一覧が5件→4件になりリダイレクト
- 削除に伴い写真4件もCascadeで削除されたことをDBで確認
- 履歴ありのNo.001はDB直接削除でも拒否されることを確認
  (`Cannot delete or update a parent row: a foreign key constraint fails`)

### 遭遇した問題と対応

- **`Unknown field 'images' for include statement on model 'Bonsai'`**: `docker compose down`で
  コンテナと匿名volumeが消え、`up`で作り直した際に、**イメージにビルド時点で焼き込まれた
  古いPrisma Client**が使われたことが原因。`docker compose up -d --build`でイメージごと
  作り直して解決。スキーマを変えたらイメージの再ビルドが要る、という依存関係を実地で確認した。
- **ESLintの未使用引数の警告**: Server Actionは`(prevState, formData)`というシグネチャが
  決まっており、使わない引数も受け取る必要がある。`argsIgnorePattern: "^_"`を設定し、
  アンダースコア始まりを「意図的に使っていない」印として扱うようにした。
