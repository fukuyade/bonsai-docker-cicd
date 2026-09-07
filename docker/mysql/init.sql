-- dbコンテナの初回起動時(データ領域が空の場合のみ)に自動実行される初期化スクリプト。
-- `prisma migrate dev` が使うshadow database(一時的な検証用DB)を用意しておく。
-- MYSQL_DATABASE環境変数で作られる本体のbonsaiデータベースとは別に必要。
CREATE DATABASE IF NOT EXISTS prisma_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
