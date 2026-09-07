# 開発用Dockerfile。
# ローカルのNode.jsバージョン(v24)に合わせて固定し、環境差異をなくす。
FROM node:24-alpine

# Prisma(Day3で導入予定)のクエリエンジンがAlpine(musl)でOpenSSLを要求するため、
# 先に入れておく。入れないとDay3で `Error: Unable to require libquery_engine...`
# のようなエラーが出るため。
RUN apk add --no-cache openssl

WORKDIR /app

# 依存関係だけ先にコピーしてinstallすることで、
# ソース変更のたびに `npm ci` が走らないようにする(レイヤーキャッシュ活用)。
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
