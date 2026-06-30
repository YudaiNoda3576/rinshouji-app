# 寺務管理システム フロントエンド (React + Vite + TypeScript)
# マルチステージ: node でビルド → nginx で静的成果物(dist)を配信する。

# 1) ビルドステージ
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# 2) 配信ステージ
FROM nginx:1.27-alpine
# ビルド済みの静的アセットを配信ルートへ配置する。
COPY --from=build /app/dist /usr/share/nginx/html
# SPA 風のルーティングや /api のプロキシ設定を含む nginx 設定。
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
