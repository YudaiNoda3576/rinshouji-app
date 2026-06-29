import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";

// Hono アプリ本体。API と静的ページの両方をこのアプリで配信し、同一オリジンで完結させる。
// 今後ルートを増やす場合はこのファイルに追加していく。
export const app = new Hono();

// Hello World API。疎通確認用の最小エンドポイント。
app.get("/api/hello", (c) => {
  return c.json({ message: "Hello World" });
});

// favicon は未用意のため 204 を返してコンソールの 404 を抑止する。
app.get("/favicon.ico", (c) => c.body(null, 204));

// public/ 配下の静的ファイルを配信する（"/" で public/index.html を返す）。
app.use("/*", serveStatic({ root: "./public" }));
