import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

// Prisma 7以降、PrismaClientはURL文字列を直接受け取らず、
// driver adapterを介して接続する。MySQL 8には(ワイヤプロトコル互換の)
// MariaDB用アダプター(@prisma/adapter-mariadb)を使うのが公式の案内。
// (参考: https://pris.ly/d/prisma7-client-config)
function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL ?? "");

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    // MySQL 8のデフォルト認証方式(caching_sha2_password)は、非TLS接続では
    // サーバーの公開鍵取得を許可しないとハンドシェイクが完了しない。
    // ローカル開発ではTLSを使っていないため明示的に許可する。
    allowPublicKeyRetrieval: true,
  });
  return new PrismaClient({ adapter });
}

// Next.jsの開発サーバーはホットリロードのたびにモジュールを再評価するため、
// 毎回 new PrismaClient() すると接続がどんどん増えてしまう。
// globalThis にインスタンスを保持して使い回すことで、開発時の接続過多を防ぐ。
// (本番相当のビルド・実行では毎回新規プロセスなので影響しない)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
