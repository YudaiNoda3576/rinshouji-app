# 寺務管理システム フロントエンド (React + Babel standalone / ビルド不要の静的配信)
# nginx で静的ファイルをそのまま配信する。開発時は compose 側でソースをボリュームマウントする。
FROM nginx:1.27-alpine

# 静的アセット一式を配信ルートへ配置（ボリューム無し起動でも動くようにするため）。
COPY . /usr/share/nginx/html

# SPA 風のルーティングや /api のプロキシ設定を含む nginx 設定。
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
