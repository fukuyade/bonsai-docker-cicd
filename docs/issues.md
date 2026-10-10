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

## A3｜自動テスト＋GitHub Actions(完了)

ブランチ: `feature/tests-ci`

- [x] テスト基盤を導入し、導入理由をREADMEへ記載(Vitest)
- [x] Zod入力検証の正常系・異常系
- [x] 管理番号、日付、必須項目などの境界値テスト
- [x] 検索条件の組み立て処理の単体テスト
- [x] GitHub Actionsでlint・test・buildを自動実行
- [ ] PR上でCI成功を確認 ← このPRをGitHubに上げた時点で確認する

計25件のテスト(2ファイル)。

### 設計判断

- **Vitestを選んだ理由**: 設定が軽くTypeScriptをそのまま実行でき、今回のように
  「DBを使わない純粋関数を素早く検証する」用途に合うため。Jestに比べて追加設定が少ない。
- **DBを起動せずに動くテストにした**: テスト対象をDBアクセスを含まない純粋関数
  (Zodスキーマ、`buildBonsaiWhere`、変換処理)に絞ることで、CIでMySQLを立てる必要がなく、
  実行時間も1秒未満に収まる。**テストしやすさを意識して検索ロジックをDB処理から
  分離した(A2)ことが、ここで効いている。**
- **境界値テストを入れた理由**: 「50文字ちょうどは通る/51文字は弾かれる」のように、
  条件の境目こそバグが出やすい。正常系と異常系だけでなく境目も確認している。
- **CIでDBに接続しない構成**: ページは`force-dynamic`のためビルド時にDBへ接続せず、
  テストも純粋関数のみ。ただし`prisma.config.ts`の読み込み時に環境変数の存在チェックだけ
  行われるため、ワークフローにダミー値を設定している。
- **`prisma generate`をlint/test/buildより前に置いた**: 型定義(PrismaClientやenum)は
  この工程で生成されるため、先に実行しないと型エラーになる。

### 動作確認

- `npm test` で25件すべて成功
- CIと同じ手順(ダミー環境変数・DBなし)をローカルで再現し、
  `prisma generate` → lint → test → build がすべて成功することを確認
- **意図的に失敗するテストを一時的に追加**し、`Test Files 1 failed`と
  **終了コード1**が返ることを確認(CIが失敗を検知できる状態)。確認後に削除。

### 遭遇した問題と対応

- **Vitest 5 が`@types/node`のバージョン衝突でインストールできなかった**:
  create-next-appの初期値は`@types/node@^20`だが、Vitest 5は`^22 || >=24`を要求していた。
  実行環境(Docker・ローカルとも)はNode 24なので、**型定義を実際の実行バージョンに合わせる**
  のが正しい対応と判断し`@types/node@^24`へ更新した(その場しのぎの`--legacy-peer-deps`は使わない)。
- **Viteの設定ファイル形式の警告**: `vitest.config.ts`がCommonJSとして読まれ警告が出たため、
  `.mts`拡張子に変更してESMとして明示的に読ませるようにした。

## A4｜応募品質版の最終整理(完了)

ブランチ: `chore/release-prep`

- [x] 一覧・詳細・登録・編集・履歴・検索・削除を通しで確認
- [x] READMEへ4方向写真、検索、削除、テスト、CIを反映
- [x] READMEへ最新のER図を反映(A1で対応済み)
- [x] AI利用範囲と自分の判断・検証内容を更新
- [x] 公開情報に実在データ・社内情報・秘密情報がないか再確認
- [ ] PC・スマートフォンの画面画像を保存 ← ツール制約により未対応(下記参照)
- [ ] リリースタグ `v1.0.0` を付けるか検討 ← ユーザー判断

### 最終動作確認(クリーンな状態から)

`docker compose down -v` で**volumeごと削除し、完全に空の状態から**再現を確認した。

1. `docker compose up -d --build` → app・db とも起動、db は healthy
2. `npx prisma migrate deploy` → 2つのマイグレーションが順に適用される
3. `npm run db:seed` → Bonsai 5件 / BonsaiImage 20件 / MaintenanceRecord 3件

全ルートのHTTPステータス:

| URL | 期待 | 結果 |
|---|---|---|
| `/`、`/bonsai`、`/bonsai?keyword=松` | 200 | ✅ |
| `/bonsai/1`、`/bonsai/new`、`/bonsai/1/edit` | 200 | ✅ |
| `/bonsai/1/delete`、`/bonsai/1/maintenance/new` | 200 | ✅ |
| `/bonsai/999`、`/bonsai/abc` | 404 | ✅ |
| `/bonsai/999/delete`、`/bonsai/999/maintenance/new` | 404 | ✅ |

lint / test(25件) / build もすべて成功。

### 見つけた不具合と修正(このフェーズの最大の収穫)

**症状**: 404の画面(「盆栽が見つかりませんでした」)は正しく表示されるのに、
HTTPステータスが **200のまま**だった。

**原因**: Day 7で追加した `src/app/bonsai/loading.tsx`。
`loading.tsx` を置いた階層はストリーミングが有効になり、Next.jsは先に
HTTPヘッダー(200 OK)とスケルトンを送り始める。**ヘッダー送出後はステータスを
変更できない**ため、そのあとに `notFound()` を呼んでも404にならなかった。

**切り分け方**: `loading.tsx` を一時的に外して再起動したところ404が返るようになり、
原因を特定できた。

**修正**: 公式ドキュメントにある「ルートグループで `loading.tsx` の適用範囲を限定する」
方法を採用。一覧ページを `(list)/page.tsx` へ移し、`loading.tsx` も同じグループ内に置いた。
ルートグループはURLに影響しないため `/bonsai` のまま、詳細ページはストリーミング対象から
外れて正しく404を返すようになった。

**学び**: Day 4の時点では404を確認していたが、Day 7で`loading.tsx`を追加した後に
**再確認していなかった**ため回帰に気づけなかった。
「画面の見た目は正しいのにステータスだけ誤っている」類のバグは目視では見つからず、
`curl`でのステータス確認が有効だった。今後は機能追加のたびに確認項目を通しで再実行する。

### 未対応として残したもの

- **画面キャプチャの保存**: ブラウザ操作ツールのスクリーンショット保存機能が
  この環境では保存先パスを返さないため、README用の画像として埋め込めなかった。
  README には画面一覧(パス表)と、Docker Composeで実際に操作して確認できる旨を明記している。
- **リリースタグ `v1.0.0`**: 付与するかはユーザー判断のため保留。

## A5｜公開デモ環境の構築 Vercel + TiDB Cloud(完了)

ブランチ: `chore/vercel-deploy-prep`、`fix/prisma-config-optional-shadow-db`、`docs/add-live-demo-link`

- [x] TiDB Cloud Serverless(MySQL互換、無料枠)にDBを用意
- [x] `package.json`のbuildスクリプトに`prisma generate`を追加(Dockerでは明示RUNで対応していたが、Vercelにも必要)
- [x] `src/lib/prisma.ts`: 接続先ホスト名がDocker/localhost以外ならTLSを自動で有効化
- [x] TiDB Cloudへ`prisma migrate deploy`・`db:seed`を実行
- [x] READMEに公開URLを追記

完成条件: https://bonsai-docker-cicd.vercel.app/bonsai がVercel上で200を返し、
盆栽5件が表示される ✅

### 設計判断

- **AWS RDSではなくTiDB Cloud Serverlessを選定**: AWS RDSの無料枠は12ヶ月の期限付きでその後課金が発生し、
  VPC・セキュリティグループ等の設定も複雑。TiDB Cloud ServerlessはMySQL互換で期限のない無料枠があり、
  面接期間中ずっと公開しておく用途に適していたため選択した。
- **ローカルと本番でTLSの要否をコードから自動判定**: 接続先ホスト名が`db`/`localhost`以外なら
  自動でTLSを有効化するようにし(`src/lib/prisma.ts`)、本番用に追加の環境変数を増やさずに済むようにした。

### 遭遇した問題と対応

- **Vercelのビルドで`prisma generate`が実行されない**: npmの新しいinstall-scripts制限(A1で見た問題と同種)
  により、`@prisma/client`が生成されずビルド失敗。`build`スクリプトに明示的に含めて解決。
- **`PrismaConfigEnvError: Cannot resolve environment variable: SHADOW_DATABASE_URL`**: `prisma.config.ts`が
  常に`env("SHADOW_DATABASE_URL")`を評価していたため、この変数を設定していないVercel上のビルドで例外が
  発生。ローカルでは`.env`に設定済みで気づかなかった。`SHADOW_DATABASE_URL`は`migrate dev`(ローカル開発)
  専用で本番の`prisma generate`には不要なため、環境変数が実際に存在する時だけ渡すよう修正。
- **`prisma migrate deploy`が「Connections using insecure transport are prohibited」で失敗**: 接続URLに
  `?sslaccept=strict`を付けて解決。CLI(schema engine)とアプリ本体(driver adapter)でTLSの扱いが
  別コードパスであることを実機で確認した。

## B1｜認証・権限管理(完了)

ブランチ: `feature/auth`

実務レベルへの引き上げフェーズ(B1〜)の最初の項目。社内向け管理アプリなのにログインが
無かった、という一番大きな欠陥への対応。

- [x] `User`モデル追加(email/passwordHash/role)、マイグレーション作成
- [x] パスワードのハッシュ化・検証(bcryptjs)
- [x] ログインセッション(JWT、jose)。httpOnly cookie、7日で失効
- [x] `src/proxy.ts`でログイン必須化(未ログイン→`/login`へリダイレクト)
- [x] Data Access Layer(`src/lib/auth/dal.ts`)で最終防衛線のセッション検証
- [x] 管理者/一般ユーザーの2層のロール、削除は管理者のみ(`canDeleteBonsai`)
- [x] デモアカウント2件(admin/staff)をseedへ追加
- [x] 単体テスト追加(パスワードのハッシュ化・検証、権限判定)
- [x] README・ER図・デモアカウント情報を追記

完成条件: 未ログインで`/bonsai`配下にアクセスすると`/login`へリダイレクトされる ✅ /
admin・staff両アカウントでログインでき、staffには削除リンクが表示されない ✅ /
staffが`/bonsai/[id]/delete`をURL直打ちしても詳細ページへ戻される ✅ /
lint・test(31件)・build成功 ✅ (すべてDocker内で確認)

### 設計判断

- **NextAuth等のライブラリを使わず自前実装**: Next.js 16は訓練データより新しく、サードパーティ
  認証ライブラリの対応状況が不透明だったため、公式ドキュメント(`node_modules/next/dist/docs`)が
  提示する「認証ライブラリを使わない場合の標準パターン」(jose + bcryptjs + cookies API)に
  そのまま従った。依存を増やさず、全行を自分の言葉で説明できる状態を優先した。
- **ステートレスセッション(JWT)を採用**: セッションをDBに保存する方式(database session)は
  より安全だが実装コストが高い。今回はJWTを署名してcookieに入れるステートレス方式にした。
  ペイロードには`userId`と`role`のみを含め、個人情報は含めない。
- **「簡易チェック」と「最終防衛線」の二重構造**: `proxy.ts`はcookieを見るだけの軽量チェック
  (optimistic check、全リクエストで実行されるためDBアクセスを避ける)。実際の認可判断は
  各Server Action・ページから呼ぶ`verifySession()`(secure check、DBアクセスを伴う)で行う。
  役割を分けている理由をNext.js公式ドキュメントの用語(optimistic/secure)で説明できるようにした。
- **削除リンクの非表示とServer Action側の権限チェックを両方実装**: UI側の非表示はUX目的にすぎず、
  devtoolsで直接フォームを送信されれば通り抜けてしまう。`deleteBonsaiAction`側でも必ず
  `canDeleteBonsai()`を呼び、権限がなければ処理自体を止める。
- **ログイン失敗メッセージを統一**: 「メールアドレスが存在しない」と「パスワードが違う」を
  区別せず同じメッセージ・同じ処理経路にし、登録済みメールアドレスの有無を外部から
  推測されにくくした(ユーザー列挙攻撃対策)。

### 遭遇した問題と対応

- **`middleware.ts`が認識されない**: Next.js 16では`middleware.ts`が廃止され、`proxy.ts`
  (関数名も`proxy`)に名称変更されていた。学習時の知識のまま実装しても動かないため、公式
  ドキュメントで新しいファイル規約を確認してから実装した。
- **ローカルの`.env`で`SHADOW_DATABASE_URL`が誤って`mysql`(MySQLのシステムデータベース)を
  指していた**: `migrate dev`はshadow database用に一時的にテーブルを作成・削除するため、この
  ままではMySQLサーバー自体の内部管理テーブルを壊しかねない状態だった。マイグレーション実行前に
  `.env.example`通りの`prisma_shadow`へ修正して回避した。原因は不明(過去のいずれかの作業で
  誤って書き換わったと思われる)が、**「ダミー値だから」と値の中身を確認せずに使わない**ことの
  重要性を再認識した。
- **`Cannot find module 'bcryptjs'`(seed実行時)**: ホスト側で`npm install`した後、
  `docker compose up -d --build`だけでは既存の匿名volume(`node_modules`)が残り、新しい依存が
  コンテナ内に反映されなかった。Day3・A2で既知だった問題と同種。`docker compose down`後に
  `up -d --build`し、volumeごと作り直して解決した。
- **curlでServer Actionsを直接叩けない**: Server Actionsは暗号化されたアクションIDを含む
  RSC専用プロトコル(`multipart/form-data`、`$ACTION_REF_1`等の隠しフィールド)で送信される。
  単純な`curl -X POST`では模擬できないため、実際のログイン確認はブラウザ操作で行った。

## B1続き｜手入れ履歴の編集と操作ログ(完了)

ブランチ: `feature/maintenance-edit`(`feature/auth`の上に作成。B1のPRをマージした後にPRを作る)

- [x] 手入れ履歴の編集画面(`/bonsai/[id]/maintenance/[recordId]/edit`)と詳細画面の「編集」リンク
- [x] 操作ログ(`AuditLog`モデル・マイグレーション)。履歴の登録・更新を記録
- [x] 操作ログの閲覧画面(`/admin/audit-logs`、管理者のみ)
- [x] 作業種別の表示名を「病害虫防除」から「消毒」へ変更(DB上の値`PEST_CONTROL`は変更せず、migration不要)
- [x] ヘッダーを共通化(`AppHeader`)し、スマートフォン幅で折り返すようにした
- [x] 単体テスト追加(差分検出・ログ整形・権限判定)。合計44件

完成条件: 一般ユーザーが履歴を編集でき、その内容が操作ログに記録される ✅ /
管理者のみ操作ログを閲覧でき、一般ユーザーがURLを直接開いても一覧へ戻される ✅ /
スマートフォン幅(375px)で横スクロールが出ない ✅ / lint・test(44件)・build成功 ✅

### 設計判断

- **誰でも編集できる代わりに操作ログで補う**: 手入れ履歴は業務記録。編集を禁止するのではなく、
  一般ユーザーにも編集を許したうえで、変更の追跡で安全性を担保する方針にした。
- **更新と操作ログを同一トランザクションにした**: 別々に書くと、更新だけ成功してログが残らない
  (または逆)状態が起こり得る。変更前の値の取得・差分計算・更新・ログ記録を1つのトランザクションに
  まとめ、ログの「変更前」が更新時点の値とずれないようにした。
- **内容が変わっていない更新はログを残さない**: 意味のないログが増えるのを防ぐ。
- **履歴IDと盆栽IDの両方で検索**: URLの盆栽IDと履歴IDの組み合わせが食い違う場合(他の盆栽の履歴を
  指す等)は取得できず404にする。
- **`AuditLog.userId`は`onDelete: SetNull`+操作時点の名前を`userName`に保存**: 利用者が削除されても
  ログは残したい(誰の操作か分かるよう名前のスナップショットも持つ)。
- **表示名だけ変えてDBの値は変えなかった(消毒)**: enumの値を変えるとmigrationと既存データの更新が
  必要になる。表示名はラベル対応表(`maintenance-work-type.ts`)で管理しているため、そこだけの変更で済む。
- **ログの整形・差分計算を純粋関数に分離**: DBなしでテストできる(`maintenance-diff.ts`、`audit-format.ts`)。

### 未対応として残したもの

- 盆栽の登録・編集・削除の操作ログ(現在ログを取っているのは手入れ履歴の登録・更新のみ)
- 手入れ履歴の削除
- 操作ログのページネーション・絞り込み(現在は直近100件)
