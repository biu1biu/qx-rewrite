// Remove confirmed missav ad containers from HTML without touching video/CDN markup.
// Ad sources from the 2026-08-02 capture and the 2026-08-03 video-page capture:
//   - smartpop iframes (go.mayzaent.com) in fixed-size mx-auto wrappers
//   - the popup video ad (creative.myavlive.com/widgets/Player, campaignId=side_player)
//   - snaptrckr / rallytrck tracking-pixel iframes
//   - the under_player widget (Alpine x-ref="stripchat" -> widgets/v4/Universal)
//   - TSyndicate native 300x250 spot (cdn.tsyndicate.com ms.js)
//   - the html-ads dynamic injector (SCSpotScript / StripchatSpot)
// SAFETY: every rule is anchored to a provable ad marker. The real video is a
// <video> element fed by HLS (surrit.com / growcdnssedge.com) and never an
// <iframe> with one of the ad srcs below, so removing those iframes and their
// wrappers cannot touch playback.
(function () {
  'use strict';

  const url = $request.url || '';
  if (url.indexOf('missav') === -1) return $done({});

  let body = $response.body;
  if (typeof body !== 'string' || !body.length) return $done({});

  const headers = $response.headers || {};
  const ctype = (headers['Content-Type'] || headers['content-type'] || '').toLowerCase();
  if (ctype.indexOf('text/html') === -1) return $done({});

  // Ad networks that render as <iframe> srcs (server-rendered or injected).
  const AD_SRC = 'mayzaent\\.com|myavlive\\.com|snaptrckr|rallytrck|optvz|tsyndicate';

  // 1) html-ads dynamic injector FIRST — its def script holds ad <iframe>
  //    markup inside JS strings; stripping it before the iframe rules keeps
  //    those strings out of reach of the bare-iframe regex. The marker must
  //    sit in the script directly after the div (tempered dot cannot cross a
  //    </script> boundary), so it can never swallow an intervening script —
  //    the GTM 129KB lesson.
  body = body.replace(/<div\s+id="html-ads"[^>]*>\s*<\/div>\s*<script[^>]*>(?:(?!<\/script>)[\s\S])*?(?:htmlAds|SCSpotScript|StripchatSpot|creative\.myavlive\.com)[\s\S]*?<\/script>/gi, '');
  // 2) html-ads executor — the separate script that CALLS the removed htmlAds
  //    array; anchored to script start so it can never swallow the scripts in
  //    between (the GTM 129KB lesson).
  body = body.replace(/<script[^>]*>\s*(?:if\s*\(\s*)?htmlAds\s*\[\s*htmlAdIndexes[\s\S]*?<\/script>/gi, '');

  // 3) the under_player widget: an Alpine div whose x-init injects
  //    widgets/v4/Universal via $refs.stripchat.innerHTML. Its opening tag
  //    contains '>' inside the x-init expression, so locate it by indexOf
  //    instead of a regex and remove the whole (empty-body) element.
  const anchor = 'x-ref="stripchat"';
  let at = body.indexOf(anchor);
  while (at !== -1) {
    const start = body.lastIndexOf('<div', at);
    if (start === -1 || at - start > 4000) break; // anchor must sit in a nearby div
    const tagEnd = body.indexOf('>', at);
    if (tagEnd === -1) break;
    let depth = 1;
    let i = tagEnd + 1;
    let close = -1;
    while (depth > 0 && i < body.length) {
      const n1 = body.indexOf('<div', i);
      const n2 = body.indexOf('</div>', i);
      if (n2 === -1) break;
      if (n1 !== -1 && n1 < n2) { depth++; i = body.indexOf('>', n1) + 1; }
      else { depth--; i = n2 + 6; }
    }
    if (depth === 0) close = i;
    if (close === -1) break; // malformed — leave it untouched rather than guess
    body = body.slice(0, start) + body.slice(close);
    at = body.indexOf(anchor, start);
  }

  // 4) ad iframe inside its fixed-size mx-auto wrapper (the wrapper carries
  //    the visible box size; its outer responsive divs collapse to 0 height
  //    once the box is gone, so removing them is unnecessary).
  body = body.replace(new RegExp('<div\\s+class="mx\\-auto"\\s+style="width:\\s*\\d+px;\\s*height:\\s*\\d+px;">\\s*<iframe[^>]*src=["\'][^"\']*(?:' + AD_SRC + ')[^"\']*["\'][^>]*>[\\s\\S]*?<\\/iframe>\\s*<\\/div>', 'g'), '');
  // 5) bare ad iframe fallback (any wrapper shape)
  body = body.replace(new RegExp('<iframe[^>]*src=["\'][^"\']*(?:' + AD_SRC + ')[^"\']*["\'][^>]*>[\\s\\S]*?<\\/iframe>', 'g'), '');

  // 6) TSyndicate 300x250 spot + ms.js SDK (SDK script must sit directly inside the spot div)
  body = body.replace(/<div[^>]*style="width:\s*300px;\s*height:\s*250px;\s*overflow:\s*hidden;">\s*<script[^>]*tsyndicate[^>]*>[\s\S]*?<\/script>\s*<\/div>/g, '');
  body = body.replace(/<script[^>]*src=["']\/\/cdn\.tsyndicate\.com[^>]*>[\s\S]*?<\/script>/g, '');

  // 7) static cam-girl <a> links to the myavlive landing page (left as pure text in the nav menu)
  body = body.replace(/<a[^>]*href=["']https?:\/\/zh\.myavlive\.com[^>]*>[\s\S]*?<\/a>/gi, '');

  $done({ body });
})();
