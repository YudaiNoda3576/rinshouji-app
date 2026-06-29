# 寺務管理システム バックエンド (Hono + Node)
# 開発用イメージ。tsx watch によるホットリロードを前提とし、ソースはボリュームでマウントする。
FROM node:24-alpine

WORKDIR /app

# 依存解決はソース変更の影響を受けないよう先にコピーしてレイヤキャッシュを効かせる。
COPY package.json package-lock.json ./
RUN npm ci

# 残りのソースをコピー（本番ビルド・ボリューム無し起動でも動くようにするため）。
COPY . .

EXPOSE 3000

# 既定は開発サーバ。compose 側で command を上書きすることも可能。
CMD ["npm", "run", "dev"]
