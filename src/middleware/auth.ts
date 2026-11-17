import type { Hono } from "hono";
import type { Env } from "../types/index";

/**
 * Auth middleware that can be selectively applied.
 * Use withRoute for specific routes, or withRoute for all routes.
 */
export const authMiddleware = async (c: any, next: any) => {
  // Allow unauthenticated access to tables/list and pdf/generate endpoints
  const path = c.path;
  if (path === "/" || path.startsWith("/api/tables") || path.startsWith("/api/pdf")) {
    await next();
    return;
  }

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

/**
 * Helper to apply auth middleware to specific routes
 * Use withRoute(authMiddleware, "/protected-path")
 */
export const withRoute = (middleware: any, route: string) => {
  return async (c: any, next: any) => {
    const path = c.path;
    if (path === route) {
      await middleware(c, next);
    } else {
      await next();
    }
  };
}