import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { env } from "./config/env.js";

// エントリポイント。Node ランタイムで Hono アプリを起動する。
serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`寺務管理システム バックエンド起動: http://localhost:${info.port}`);
});
