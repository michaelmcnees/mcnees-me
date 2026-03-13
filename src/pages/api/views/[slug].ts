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

async function getViewCount(
  accountId: string,
  apiToken: string,
  slug: string
): Promise<number> {
  const query = `SELECT count() as views FROM page_views WHERE index1 = '${slug}'`;
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    body: query,
  });

  if (!response.ok) return 0;

  const text = await response.text();
  // Analytics Engine SQL API returns CSV-like text, parse the count from it
  const lines = text.trim().split("\n");
  if (lines.length < 2) return 0;
  const count = parseInt(lines[1], 10);
  return isNaN(count) ? 0 : count;
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const slug = params.slug;
  if (!slug || !VALID_SLUG.test(slug)) {
    return jsonResponse(0, 400);
  }

  const env = locals.runtime.env;
  const pageViews = env.PAGE_VIEWS;
  const accountId = env.CF_ACCOUNT_ID;
  const apiToken = env.CF_API_TOKEN;

  // If bindings aren't available (local dev), return 0
  if (!pageViews || !accountId || !apiToken) {
    return jsonResponse(0);
  }

  // Bots get no write and no query — return 0 immediately
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) {
    return jsonResponse(0);
  }

  // Write data point for non-bot visitors
  pageViews.writeDataPoint({
    indexes: [slug],
  });

  // Query count
  let views = 0;
  try {
    views = await getViewCount(accountId, apiToken, slug);
  } catch {
    // Silently fail — views stays 0
  }

  return jsonResponse(views);
};
