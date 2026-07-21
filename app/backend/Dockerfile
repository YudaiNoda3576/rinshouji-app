# 寺務管理システム バックエンド (Hono + Node)
# 開発用イメージ。tsx watch によるホットリロードを前提とし、ソースはボリュームでマウントする。
FROM node:24-alpine

WORKDIR /app

# 依存解決はソース変更の影響を受けないよう先にコピーしてレイヤキャッシュを効かせる。
COPY package.json package-lock.json ./
# TLS 傍受環境（社内プロキシ等）ではコンテナ内の npm が SELF_SIGNED_CERT_IN_CHAIN で
# 失敗するため、開発用イメージに限り証明書検証を無効化できるようにする（既定は有効）。
# 社内 CA 証明書を配置できる場合は NODE_EXTRA_CA_CERTS 方式に置き換えるのが正道。
ARG NPM_STRICT_SSL=true
ENV npm_config_strict_ssl=$NPM_STRICT_SSL
RUN npm ci --no-audit --no-fund

# 残りのソースをコピー（本番ビルド・ボリューム無し起動でも動くようにするため）。
COPY . .

EXPOSE 3000

# 既定は開発サーバ。compose 側で command を上書きすることも可能。
CMD ["npm", "run", "dev"]
