import type { APIRoute } from "astro";

export const prerender = false;

const VALID_SLUG = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

const BOT_PATTERN =
  /bot|crawler|spider|googlebot|bingbot|baiduspider|yandexbot|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot/i;

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
} as const;

function jsonResponse(views: number, status = 200): Response {
  return new Response(JSON.stringify({ views }), {
    status,
    headers: JSON_HEADERS,
  });
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const slug = params.slug;
  if (!slug || !VALID_SLUG.test(slug)) {
    return jsonResponse(0, 400);
  }

  const db = locals.runtime.env.PAGE_VIEWS_DB;

  // If binding isn't available (local dev without wrangler), return 0
  if (!db) {
    return jsonResponse(0);
  }

  // Bots get no write and no query — return 0 immediately
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) {
    return jsonResponse(0);
  }

  const referer = request.headers.get("referer");
  const cf = (request as any).cf as Record<string, string> | undefined;
  const country = cf?.country ?? null;
  const city = cf?.city ?? null;
  const region = cf?.region ?? null;

  let views = 0;
  try {
    // Insert row for this view
    await db
      .prepare(
        "INSERT INTO page_views (slug, user_agent, country, city, region, referer) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(slug, userAgent, country, city, region, referer)
      .run();

    // Query total count
    const result = await db
      .prepare("SELECT COUNT(*) as views FROM page_views WHERE slug = ?")
      .bind(slug)
      .first<{ views: number }>();

    views = result?.views ?? 0;
  } catch {
    // Silently fail — views stays 0
  }

  return jsonResponse(views);
};
