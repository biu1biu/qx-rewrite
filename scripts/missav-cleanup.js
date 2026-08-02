// Remove confirmed missav ad containers from HTML without touching video/CDN markup.
// Ad sources from the 2026-08-02 capture:
//   - smartpop iframes (go.mayzaent.com) wrapped in fixed-size mx-auto divs
//   - TSyndicate native 300x250 spot (cdn.tsyndicate.com ms.js)
//   - the html-ads dynamic injector (SCSpotScript / StripchatSpot)
// Video HLS, cover images (bkcdn/fourhoi/doppiocdn) and the recombee API are left untouched.
(function () {
  'use strict';

  const url = $request.url || '';
  if (url.indexOf('missav') === -1) return $done({});

  let body = $response.body;
  if (typeof body !== 'string' || !body.length) return $done({});

  const headers = $response.headers || {};
  const ctype = (headers['Content-Type'] || headers['content-type'] || '').toLowerCase();
  if (ctype.indexOf('text/html') === -1) return $done({});

  // 1) smartpop iframe + its fixed-size wrapper div
  body = body.replace(/<div\s+class="mx\-auto"\s+style="width:\s*\d+px;\s*height:\s*\d+px;">\s*<iframe[^>]*go\.mayzaent\.com[^>]*>[\s\S]*?<\/iframe>\s*<\/div>/g, '');
  // 2) bare smartpop iframe fallback
  body = body.replace(/<iframe[^>]*go\.mayzaent\.com[^>]*>[\s\S]*?<\/iframe>/g, '');
  // 3) leftover empty ad boxes (known sizes only)
  body = body.replace(/<div\s+class="mx\-auto"\s+style="width:\s*(?:300|728)px;\s*height:\s*(?:90|100|250)px;">\s*<\/div>/g, '');
  // 4) TSyndicate 300x250 spot + ms.js SDK
  body = body.replace(/<div[^>]*style="width:\s*300px;\s*height:\s*250px;\s*overflow:\s*hidden;">[\s\S]*?<script[^>]*tsyndicate[^>]*>[\s\S]*?<\/script>\s*<\/div>/g, '');
  body = body.replace(/<script[^>]*src=["']\/\/cdn\.tsyndicate\.com[^>]*>[\s\S]*?<\/script>/g, '');
  // 5) html-ads dynamic injector
  body = body.replace(/<div\s+id="html-ads"[^>]*>\s*<\/div>\s*<script[^>]*>[\s\S]*?<\/script>/gi, '');

  $done({ body });
})();
