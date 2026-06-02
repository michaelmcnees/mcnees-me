import 'piccolore';
import { j as decodeKey } from './chunks/astro/server_DbCnhppp.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_Cp4s71Uz.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/user/mcnees-me/","cacheDir":"file:///home/user/mcnees-me/node_modules/.astro/","outDir":"file:///home/user/mcnees-me/dist/","srcDir":"file:///home/user/mcnees-me/src/","publicDir":"file:///home/user/mcnees-me/public/","buildClientDir":"file:///home/user/mcnees-me/dist/client/","buildServerDir":"file:///home/user/mcnees-me/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"404.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/blog","isIndex":true,"type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"case-studies/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/case-studies","isIndex":true,"type":"page","pattern":"^\\/case-studies\\/?$","segments":[[{"content":"case-studies","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/case-studies/index.astro","pathname":"/case-studies","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"projects/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/projects","isIndex":true,"type":"page","pattern":"^\\/projects\\/?$","segments":[[{"content":"projects","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/projects/index.astro","pathname":"/projects","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/views/[slug]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/views\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"views","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/api/views/[slug].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://mcnees.me","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/home/user/mcnees-me/src/pages/blog/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/home/user/mcnees-me/src/pages/blog/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/user/mcnees-me/src/pages/case-studies/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/case-studies/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/user/mcnees-me/src/pages/case-studies/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/case-studies/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/user/mcnees-me/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/user/mcnees-me/src/pages/projects/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/projects/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/user/mcnees-me/src/pages/404.astro",{"propagation":"none","containsHead":true}],["/home/user/mcnees-me/src/pages/about.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/404@_@astro":"pages/404.astro.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/api/views/[slug]@_@ts":"pages/api/views/_slug_.astro.mjs","\u0000@astro-page:src/pages/blog/[slug]@_@astro":"pages/blog/_slug_.astro.mjs","\u0000@astro-page:src/pages/blog/index@_@astro":"pages/blog.astro.mjs","\u0000@astro-page:src/pages/case-studies/[slug]@_@astro":"pages/case-studies/_slug_.astro.mjs","\u0000@astro-page:src/pages/case-studies/index@_@astro":"pages/case-studies.astro.mjs","\u0000@astro-page:src/pages/projects/index@_@astro":"pages/projects.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_D0lbq_vY.mjs","/home/user/mcnees-me/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_3ntPgjVZ.mjs","/home/user/mcnees-me/.astro/content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","/home/user/mcnees-me/.astro/content-modules.mjs":"chunks/content-modules_DSJCW6nN.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_BImmq04h.mjs","/home/user/mcnees-me/src/content/blog/ai-doesnt-know-your-smart-home-platform.mdx?astroPropagatedAssets":"chunks/ai-doesnt-know-your-smart-home-platform_DQ-HEd8K.mjs","/home/user/mcnees-me/src/content/blog/from-engineer-to-engineering-manager.mdx?astroPropagatedAssets":"chunks/from-engineer-to-engineering-manager_CIdels-h.mjs","/home/user/mcnees-me/src/content/blog/the-calculator-didnt-kill-accounting.mdx?astroPropagatedAssets":"chunks/the-calculator-didnt-kill-accounting_CaI0-RDk.mjs","/home/user/mcnees-me/src/content/blog/upgrading-the-homelab-part-1-taking-stock.mdx?astroPropagatedAssets":"chunks/upgrading-the-homelab-part-1-taking-stock_KGHWJTZG.mjs","/home/user/mcnees-me/src/content/blog/upgrading-the-homelab-part-2-the-build.mdx?astroPropagatedAssets":"chunks/upgrading-the-homelab-part-2-the-build_Bw06ZWef.mjs","/home/user/mcnees-me/src/content/blog/welcome.mdx?astroPropagatedAssets":"chunks/welcome__m1fDQe8.mjs","/home/user/mcnees-me/src/content/case-studies/creekside-shores-portal.mdx?astroPropagatedAssets":"chunks/creekside-shores-portal_Bnt3OC96.mjs","/home/user/mcnees-me/src/content/case-studies/tcb-games.mdx?astroPropagatedAssets":"chunks/tcb-games_BbkmOVcS.mjs","/home/user/mcnees-me/src/content/projects/homey-vivint.mdx?astroPropagatedAssets":"chunks/homey-vivint_CRoE_qMH.mjs","/home/user/mcnees-me/src/content/projects/honeydew.mdx?astroPropagatedAssets":"chunks/honeydew_D4ITlgJI.mjs","/home/user/mcnees-me/src/content/projects/mantle.mdx?astroPropagatedAssets":"chunks/mantle_BBa6L-dq.mjs","/home/user/mcnees-me/src/content/projects/retro-estates.mdx?astroPropagatedAssets":"chunks/retro-estates_Wqel3Mg9.mjs","/home/user/mcnees-me/src/content/blog/ai-doesnt-know-your-smart-home-platform.mdx":"chunks/ai-doesnt-know-your-smart-home-platform_CYornfSM.mjs","/home/user/mcnees-me/src/content/blog/from-engineer-to-engineering-manager.mdx":"chunks/from-engineer-to-engineering-manager_B45dzk_Z.mjs","/home/user/mcnees-me/src/content/blog/the-calculator-didnt-kill-accounting.mdx":"chunks/the-calculator-didnt-kill-accounting_C9Nj-1CB.mjs","/home/user/mcnees-me/src/content/blog/upgrading-the-homelab-part-1-taking-stock.mdx":"chunks/upgrading-the-homelab-part-1-taking-stock_CrhLo5rD.mjs","/home/user/mcnees-me/src/content/blog/upgrading-the-homelab-part-2-the-build.mdx":"chunks/upgrading-the-homelab-part-2-the-build_CJp_N8jl.mjs","/home/user/mcnees-me/src/content/blog/welcome.mdx":"chunks/welcome_sUgdGgos.mjs","/home/user/mcnees-me/src/content/case-studies/creekside-shores-portal.mdx":"chunks/creekside-shores-portal_CJkKMRd3.mjs","/home/user/mcnees-me/src/content/case-studies/tcb-games.mdx":"chunks/tcb-games_Cr8vA7MR.mjs","/home/user/mcnees-me/src/content/projects/homey-vivint.mdx":"chunks/homey-vivint_DXh65TL3.mjs","/home/user/mcnees-me/src/content/projects/honeydew.mdx":"chunks/honeydew_BRhanotS.mjs","/home/user/mcnees-me/src/content/projects/mantle.mdx":"chunks/mantle_BScgaSXl.mjs","/home/user/mcnees-me/src/content/projects/retro-estates.mdx":"chunks/retro-estates_PWcUdWfv.mjs","@/components/search.tsx":"_astro/search.A8ooTINc.js","@/components/tag-filter.tsx":"_astro/tag-filter.DbA3L1JN.js","@astrojs/react/client.js":"_astro/client.Dc9Vh3na.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/about.jPpJheRT.css","/favicon.ico","/favicon.svg","/_astro/client.Dc9Vh3na.js","/_astro/index.DiEladB3.js","/_astro/index.a64eb99d.4QfbLX62.js","/_astro/jsx-runtime.D_zvdyIk.js","/_astro/search.A8ooTINc.js","/_astro/tag-filter.DbA3L1JN.js","/404.html","/about/index.html","/blog/index.html","/case-studies/index.html","/projects/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"mYuV8Nr6kyqBdks1nm7JORH7HYGxYKqNO/BpkwkQcpo="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
