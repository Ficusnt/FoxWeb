# Cloudflare Pages + Functions project for FoxCapital web port
# Hosted at https://fox-web.ficus.workers.dev/

# Free plan — no R2. CSV storage uses KV instead.

# Infrastructure setup (run once):
#
#   pnpm dlx wrangler login
#
#   # KV namespaces
#   pnpm dlx wrangler kv namespace create TABLE_CONFIG
#   pnpm dlx wrangler kv namespace create TABLE_CSVS
#   pnpm dlx wrangler kv namespace create FOX_SESSIONS
#
#   # D1 database
#   pnpm dlx wrangler d1 create fox-db
#   pnpm dlx wrangler d1 execute fox-db --file=./src/schema.sql
#
#   # Secrets (AGENDAE_USUARIO and AGENDAE_PASSWORD may already be set)
#   pnpm dlx wrangler secret put AGENDAE_USUARIO
#   pnpm dlx wrangler secret put AGENDAE_PASSWORD
#   pnpm dlx wrangler secret put AGENDAE_URL
#     # value: https://www.agendae.com.ar/
#
#   # Fill in the printed IDs into wrangler.toml:
#   #   [[kv_namespaces]] binding = "TABLE_CONFIG"   id = "..."
#   #   [[kv_namespaces]] binding = "TABLE_CSVS"     id = "..."
#   #   [[kv_namespaces]] binding = "FOX_SESSIONS"   id = "..."
#   #   [[d1_databases]]    binding = "FOX_DB"         database_id = "..."
#
# Local development:
#   pnpm dlx wrangler dev   -> http://localhost:8787
#
# Deploy:
#   Push to GitHub — Cloudflare Pages auto-deploys.
#   In Cloudflare Pages dashboard (Settings → Functions), add the same
#   KV/D1 bindings and secrets for the production deployment.