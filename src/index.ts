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

export default app;
export { scheduled } from "./scheduled";