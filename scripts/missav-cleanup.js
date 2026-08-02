// Remove confirmed missav ad containers from HTML without touching video/CDN markup.
// Ad sources from the 2026-08-02 capture:
//   - smartpop iframes (go.mayzaent.com) wrapped in fixed-size mx-auto divs
//   - TSyndicate native 300x250 spot (cdn.tsyndicate.com ms.js)
//   - the html-ads dynamic injector (SCSpotScript / StripchatSpot)
// SAFETY: every rule is anchored to a provable ad marker. Nothing here may
// remove a <video> element, the player container, or video HLS markup, so
// playback is unaffected even if the page structure changes.
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
  // 3) TSyndicate 300x250 spot + ms.js SDK (SDK script must sit directly inside the spot div)
  body = body.replace(/<div[^>]*style="width:\s*300px;\s*height:\s*250px;\s*overflow:\s*hidden;">\s*<script[^>]*tsyndicate[^>]*>[\s\S]*?<\/script>\s*<\/div>/g, '');
  body = body.replace(/<script[^>]*src=["']\/\/cdn\.tsyndicate\.com[^>]*>[\s\S]*?<\/script>/g, '');
  // 4) html-ads dynamic injector — the def script sits directly after the div and must contain an ad marker
  body = body.replace(/<div\s+id="html-ads"[^>]*>\s*<\/div>\s*<script[^>]*>[\s\S]*?(?:htmlAds|SCSpotScript|StripchatSpot|creative\.myavlive\.com)[\s\S]*?<\/script>/gi, '');
  // 5) html-ads executor — a separate script that CALLS the removed htmlAds array; anchored to script start so it can never swallow the scripts in between
  body = body.replace(/<script[^>]*>\s*(?:if\s*\(\s*)?htmlAds\s*\[\s*htmlAdIndexes[\s\S]*?<\/script>/gi, '');
  // 6) static cam-girl <a> links to the myavlive landing page (left as pure text in the nav menu)
  body = body.replace(/<a[^>]*href=["']https?:\/\/zh\.myavlive\.com[^>]*>[\s\S]*?<\/a>/gi, '');

  $done({ body });
})();
