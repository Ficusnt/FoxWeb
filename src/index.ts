/**
 * src/index.ts — Cloudflare Workers entry point.
 *
 * Serves health check and routes API requests. The frontend static assets
 * are served by Cloudflare Pages directly from the build output.
 */

import { handleHealth } from "./lib/health"

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Health check
    if (url.pathname === "/api/health") {
      return handleHealth(env)
    }

    // 404 for anything else hitting the Workers entry directly
    return new Response("Not found", { status: 404 })
  }
}
