import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import authRoutes from "./routes/auth";
import tableRoutes from "./routes/tables";
import pdfRoutes from "./routes/pdf";
import type { Env } from "./types/index";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "https://fox-web.ficus.workers.dev", credentials: true }));

app.route("/api/auth", authRoutes);
app.route("/api/tables", tableRoutes);
app.route("/api/pdf", pdfRoutes);

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/auth/me", authMiddleware, (c) => {
  return c.json({ authenticated: true });
});

// SPA fallback — serve index.html for any non-API route so client-side
// routing (React Router) works on refresh and direct links.
const SPA_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FoxWeb - Coefficients PDF Generator</title>
    <script type="module" crossorigin src="/assets/index-1bGGSi2r.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-CDp9FrIQ.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

app.get("*", (c) => c.html(SPA_HTML));

export default app;
export { scheduled } from "./scheduled";