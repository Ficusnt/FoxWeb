import type { Hono } from "hono";
import type { Env } from "../types/index";

export const authMiddleware = async (c: any, next: any) => {
  const cookie = c.req.header("Cookie");
  const sessionCookie = cookie?.split("; ").find((c: string) => c.startsWith("session="));
  const token = sessionCookie ? sessionCookie.split("=")[1] : null;

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (token !== c.env.SESSION_SECRET) {
    return c.json({ error: "Invalid session" }, 401);
  }

  await next();
};