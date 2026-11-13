import { Hono } from "hono";
import type { Env } from "../types/index";

const auth = new Hono<{ Bindings: Env }>();

auth.post("/login", async (c) => {
  const body = await c.req.json();
  const usuario: string = body.usuario;
  const password: string = body.password;

  const expectedUser = c.env.AGENDAE_USUARIO;
  const expectedPass = c.env.AGENDAE_PASSWORD;

  if (
    expectedUser &&
    expectedPass &&
    usuario === expectedUser &&
    password === expectedPass
  ) {
    c.header(
      "Set-Cookie",
      `session=${c.env.SESSION_SECRET || "dev-secret"}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
    );
    return c.json({ ok: true, authenticated: true });
  }

  return c.json({ error: "Invalid credentials" }, 401);
});

auth.post("/logout", (c) => {
  c.header("Set-Cookie", "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  return c.json({ ok: true });
});

auth.get("/me", (c) => {
  const cookie = c.req.header("Cookie");
  const sessionCookie = cookie?.split("; ").find((c: string) => c.startsWith("session="));
  const token = sessionCookie ? sessionCookie.split("=")[1] : null;
  const expectedSecret = c.env.SESSION_SECRET || "dev-secret";
  return c.json({ authenticated: token === expectedSecret });
});

export default auth;