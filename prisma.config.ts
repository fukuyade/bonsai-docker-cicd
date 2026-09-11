// Prisma 7から、CLI(migrate/db seed等)が使う接続URLはschema.prismaではなく
// このファイルで指定する。アプリ実行時(PrismaClient)の接続はsrc/lib/prisma.tsの
// driver adapterで別途指定している(参考: https://pris.ly/d/prisma7-client-config)。
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // `migrate dev` が一時的に使うshadow database。bonsai_userはbonsaiデータベースのみの
    // 権限しか持たないため、データベース作成権限を持つroot接続を別途指定する。
    //
    // SHADOW_DATABASE_URLは`migrate dev`(ローカル開発)でのみ使う変数で、
    // 本番のビルド(`prisma generate`のみ実行)では不要。`env()`は未設定だと
    // 例外を投げるため、値がある時だけ渡すようにして本番ビルドを壊さないようにする。
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: env("SHADOW_DATABASE_URL") }
      : {}),
  },
});
