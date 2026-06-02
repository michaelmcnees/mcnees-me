export { renderers } from '../../../renderers.mjs';

const prerender = false;
const VALID_SLUG = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const BOT_PATTERN = /bot|crawler|spider|googlebot|bingbot|baiduspider|yandexbot|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot/i;
function isBot(userAgent) {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};
function jsonResponse(views, status = 200) {
  return new Response(JSON.stringify({ views }), {
    status,
    headers: JSON_HEADERS
  });
}
const POST = async ({ params, request, locals }) => {
  const slug = params.slug;
  if (!slug || !VALID_SLUG.test(slug)) {
    return jsonResponse(0, 400);
  }
  const db = locals.runtime?.env?.PAGE_VIEWS_DB;
  if (!db) {
    return jsonResponse(0);
  }
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) {
    return jsonResponse(0);
  }
  const referer = request.headers.get("referer");
  const cf = request.cf;
  const country = cf?.country ?? null;
  const city = cf?.city ?? null;
  const region = cf?.region ?? null;
  let views = 0;
  try {
    await db.prepare(
      "INSERT INTO page_views (slug, user_agent, country, city, region, referer) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(slug, userAgent, country, city, region, referer).run();
    const result = await db.prepare("SELECT COUNT(*) as views FROM page_views WHERE slug = ?").bind(slug).first();
    views = result?.views ?? 0;
  } catch {
  }
  return jsonResponse(views);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
