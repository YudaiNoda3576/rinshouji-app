import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { districtsRoute } from "./routes/districts.js";
import { householdsRoute } from "./routes/households.js";
import { householdsWriteRoute } from "./routes/households-write.js";
import { deceasedRoute } from "./routes/deceased.js";
import { noticesRoute } from "./routes/notices.js";

// Hono アプリ本体。API と静的ページの両方をこのアプリで配信し、同一オリジンで完結させる。
// 今後ルートを増やす場合はこのファイルに追加していく。
export const app = new Hono();

// Hello World API。疎通確認用の最小エンドポイント。
app.get("/api/hello", (c) => {
  return c.json({ message: "Hello World" });
});

app.route("/api/districts", districtsRoute);
app.route("/api/households", householdsRoute);
app.route("/api/households", householdsWriteRoute);
app.route("/api/deceased", deceasedRoute);
app.route("/api/notices", noticesRoute);

// favicon は未用意のため 204 を返してコンソールの 404 を抑止する。
app.get("/favicon.ico", (c) => c.body(null, 204));

// public/ 配下の静的ファイルを配信する（"/" で public/index.html を返す）。
app.use("/*", serveStatic({ root: "./public" }));
