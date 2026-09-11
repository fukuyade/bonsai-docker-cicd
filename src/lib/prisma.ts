import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

// Prisma 7以降、PrismaClientはURL文字列を直接受け取らず、
// driver adapterを介して接続する。MySQL 8には(ワイヤプロトコル互換の)
// MariaDB用アダプター(@prisma/adapter-mariadb)を使うのが公式の案内。
// (参考: https://pris.ly/d/prisma7-client-config)
// ローカル開発(Docker Compose)ではサービス名"db"へ非TLSで接続するが、
// 本番(Vercel + TiDB Cloud等の外部ホスティング)はTLS必須のことが多い。
// ホスト名がDocker/localhost以外なら自動でTLSを有効にする
// (本番用に環境変数を追加せずに済むよう、接続先ホスト名から判定している)。
const LOCAL_HOSTNAMES = ["db", "localhost", "127.0.0.1"];

function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  const isLocal = LOCAL_HOSTNAMES.includes(url.hostname);

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    // MySQL 8のデフォルト認証方式(caching_sha2_password)は、非TLS接続では
    // サーバーの公開鍵取得を許可しないとハンドシェイクが完了しない。
    // ローカル開発ではTLSを使っていないため明示的に許可する
    // (TLS接続時はこのオプション自体が意味を持たないため無害)。
    allowPublicKeyRetrieval: true,
    // 本番の外部MySQLホスティングは大抵TLS必須のため、ローカル以外では有効化する。
    ...(isLocal ? {} : { ssl: {} }),
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
