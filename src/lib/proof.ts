// Live, truthful signals — fetched server-side with ISR caching and graceful
// fallbacks. If a source is unreachable the UI simply omits the signal; it
// never invents one.

const HEALTH_URL =
  process.env.STATUS_PING_URL ?? "https://api.tera-linker.com/health";

/** Pings the opPORTOnities production API's public /health endpoint.
 *  Read-only, exposes nothing but "the system is up". Cached 5 minutes. */
export async function getProductionStatus(): Promise<{
  ok: boolean;
  checkedAt: string;
} | null> {
  try {
    const res = await fetch(HEALTH_URL, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { status?: string };
    if (body.status !== "ok") return null;
    return { ok: true, checkedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}
// Note: a public-GitHub contributions signal was tried and removed — the
// production work lives in private repos, so the public count (≈23/yr) reads
// as inactivity. A truthful signal that misleads is still misleading.
