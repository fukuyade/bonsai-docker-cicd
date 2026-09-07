# 開発用Dockerfile。
# ローカルのNode.jsバージョン(v24)に合わせて固定し、環境差異をなくす。
FROM node:24-alpine

# Prismaのクエリエンジンが Alpine(musl) で OpenSSL を要求するため先に入れておく。
# 入れないと `Error: Unable to require libquery_engine...` のようなエラーが出る。
RUN apk add --no-cache openssl

WORKDIR /app

# 依存関係だけ先にコピーしてinstallすることで、
# ソース変更のたびに `npm ci` が走らないようにする(レイヤーキャッシュ活用)。
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci
# 新しいnpmは「未承認パッケージのinstall-scriptsを実行しない」ため、
# @prisma/client の postinstall(`prisma generate`)が自動実行されないことがある。
# ビルドの度に明示的に実行することで、環境に依存せず確実にクライアントを生成する。
# `prisma generate` はスキーマからコードを生成するだけでDBに接続しないが、
# prisma.config.tsの読み込み時にDATABASE_URLの存在チェックだけは行われるため、
# このRUNコマンドの中だけダミー値を与える(イメージのENVとしては残さない。
# 実際の接続情報はコンテナ実行時にcompose.yaml経由で渡される)。
RUN DATABASE_URL=mysql://build:build@localhost:3306/build \
    SHADOW_DATABASE_URL=mysql://build:build@localhost:3306/build \
    npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
