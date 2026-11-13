import type { Env } from "./types/index";

export async function scheduled(
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  const { refreshAllTables } = await import("./lib/scraper");

  const result = await refreshAllTables({
    TABLES_KV: env.TABLES_KV,
    AGENDAE_USUARIO: env.AGENDAE_USUARIO,
    AGENDAE_PASSWORD: env.AGENDAE_PASSWORD,
  });

  console.log(
    `[CRON] Scraped ${result.updated} tables, errors: ${result.errors.length}`,
  );
  for (const err of result.errors) {
    console.error(`[CRON] ${err.tableId}: ${err.error}`);
  }
}