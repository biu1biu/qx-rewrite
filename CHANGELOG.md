# Changelog

## 2026-08-03 (block the popup video ad without touching the real video)

- User: "第一次点击视频还有一个弹窗式的视频广告的那个要拦截,但是别误拦截真正的视频". Reproduced on a real video page (HMN-246) in the browser and confirmed the "popup video ad" is `creative.myavlive.com/widgets/Player?autoplay=all&campaignId=side_player` — an auto-playing video iframe, plus the `snaptrckr`/`rallytrck` tracking-pixel iframes, the `go.mayzaent.com/smartpop` popup, and the Alpine-injected `widgets/v4/Universal` under_player widget. All these domains were **already network-rejected** (`url reject` + MITM hostname), but the cleanup script only removed the `mayzaent` iframe ELEMENT — so a rejected ad iframe still occupied its 300x250/300x100 box. The fix is purely in `scripts/missav-cleanup.js`:
  - Generalized the iframe rule from `go.mayzaent.com` to any ad-domain src (`mayzaent`/`myavlive`/`snaptrckr`/`rallytrck`/`optvz`/`tsyndicate`), removing the iframe together with its fixed-size `mx-auto` wrapper div.
  - Removed the under_player widget: an Alpine div (`x-ref="stripchat"`) whose `x-init` injects `widgets/v4/Universal` via `$refs.stripchat.innerHTML`. Its opening tag contains `>` inside the quoted x-init expression (e.g. `clientWidth >= 1280`), so it is located with an indexOf scan + nesting-count removal instead of a regex.
  - html-ads def rule now uses a tempered `(?!<\/script>)` dot so the ad marker must sit in the script directly after the `html-ads` div — it can no longer swallow intervening scripts (the GTM 129KB lesson, now provably bounded).
  - Dropped the `hidden lg:block` / `lg:hidden` responsive-wrapper cascade: the `mx-auto` div carries the visible box size, so removing it already collapses the outer wrappers to zero height; skipping the cascade removes a latent div-imbalance risk if missav ever nests two ads in one wrapper.
  - **Real video untouched by construction**: the player is a `<video>` element fed by HLS (surrit / growcdnssedge) and never an `<iframe>` with an ad src.
- Verified against fresh raw HTML (fetched live, not from the old HAR): video page HMN-246 208,456 B -> 198,979 B, div tags 199/199 -> 190/190 balanced, 3 `<video>` tags and all 126 surrit references untouched, only the GTM `ns.html` iframe left (its request is rejected and it sits in `<noscript>`); homepage 328,647 B -> 319,817 B, div tags 458/458 -> 447/447 (same as the 2026-08-02 verification), 60 `<video>` tags untouched, every ad marker gone. Pass-through guards re-run: non-missav / empty / JSON / JS / missing content-type all pass through unchanged, an m3u8 body served with a text/html header stays byte-identical, and a mixed ad-iframes + `<video>` + htmlAds-executor page separates correctly.

## 2026-08-03 (diagnosis: "video won't play" is a geo-block, not a rule issue)

- User reported playback still broken after the surrit hotfix. Diagnosed with a fresh play-video capture (`quantumult-x-2026-08-02-171954.har`) plus live tests from the user's mainland-China IP:
  - surrit.com IS missav's current video HLS CDN (the play capture shows `/{uuid}/playlist.m3u8` / `source1280|source842/720p/video.m3u8` + `seek/_N.jpg` previews requested on play; the watch page references it ~200 times).
  - surrit.com's Cloudflare **geo-blocks mainland-China IPs**: direct `curl` from the user's IP (120.196.48.195, Guangzhou CN Mobile) returns the same 403 block page, and the block page records the exact CN IP. Identical 403 appears in the pre-rule capture (124043), so this predates the rules.
  - The rewrite script was re-verified against the real video watch page (fetched live): div tags 201/201 -> 195/195 balanced, 3 `<video>` tags and all 201 surrit references untouched. The rewrite is not the cause.
  - Backup CDN `media-hls.growcdnssedge.com` is reachable from CN (serves 200/404, not geo-blocked) — videos served from it play fine.
- Added `missav-routing.list` to route `surrit.com` through a foreign proxy node (the only way to watch surrit-served videos from CN). Follows the existing `91porn-routing.list` pattern; `proxy` field is editable.

## 2026-08-02 (fix: video playback restored)

- **Hotfix**: `surrit.com` was wrongly classified as an ad. Its `/{uuid}/720p/video.m3u8` requests (referer = missav video detail page) are a real HLS video CDN, so the `url reject` rule and its MITM hostname broke playback for videos served from it. Removed surrit.com from `rewrite.snippet` entirely (rule + both hostname lines).
- Made `scripts/missav-cleanup.js` safer for pages never captured in the HAR (the video watch page was not in the capture):
  - Dropped the "empty fixed-size box" cleanup (cosmetic, could in theory touch an empty player container).
  - TSyndicate spot rule now requires the SDK `<script>` to sit directly inside the spot div — no cross-container scanning.
  - `html-ads` def script must provably be the ad injector (contain `htmlAds`/`SCSpotScript`/`StripchatSpot`/`creative.myavlive.com`); added the `htmlAds[htmlAdIndexes[0]]` executor script removal, anchored to script start so it cannot swallow intervening scripts (the GTM 129KB lesson again).
  - Removed static `zh.myavlive.com/girls/...` cam links from the nav menu.
- Re-verified on the captured homepage: div tags 458/458 -> 447/447 balanced, 8.8 KB of pure ad nodes removed, 60 `<video>` tags untouched, all ad markers gone; non-missav / non-HTML responses still pass through unchanged.

## 2026-08-02

- Analyzed `quantumult-x-2026-08-02-124043.har` (251 requests) and added a `✅ missav ✅` section to `rewrite.snippet` for missav.ws.
- Confirmed ad injection points: 6 static smartpop iframes (`go.mayzaent.com/smartpop/{campaignId}`, 300x100 / 728x90), a TSyndicate native 300x250 spot (page embeds `//cdn.tsyndicate.com/sdk/v1/ms.js`), and the `html-ads` dynamic injector (`creative.myavlive.com/widgets/Spot/lib.js` -> StripchatSpot). Also blocked StripChat popunders, `surrit.com` ad-preview video, click/impression pixels (`t.rallytrck.website`, `t.snaptrckr.fun`, `s.optvz.com`), and GTM analytics.
- Added `scripts/missav-cleanup.js` to strip the ad containers from missav HTML responses, including fixed-size wrapper divs so blocked ads do not leave blank boxes.
- Deliberately left video HLS CDNs (`growcdnssedge.com`, `doppiocdn.com/.net`), cover images (`z6v2p9a8.bkcdn.net`, `fourhoi.com`, `img.doppiocdn.com`), and the recombee recommendation API untouched.
- Verified offline: div tag pairing stays balanced (458/458 -> 449/449), 7.1 KB of pure ad nodes removed, app bundle and navigation markup preserved; non-HTML / non-missav responses pass through unchanged.
- Mistake avoided: a GTM regex (`<script[^>]*>.*?googletagmanager.*?</script>`) would have swallowed a 129 KB inline SSR payload, so GTM is handled by a plain `url reject` instead of response-body rewriting.

## 2026-07-19

- Created the public repository `biu1biu/qx-rewrite`.
- Imported `https://github.com/fmz200/wool_scripts/raw/main/QuantumultX/rewrite/rewrite.snippet` as the initial active rule set.
- Stored the untouched imported file at `upstream/rewrite.snippet`.
- Imported baseline SHA-256: `be950bd64086028e7fc092b40ff1b32b809443749ede70406cf0aeedf33ee516`.
- Analyzed `quantumult-x-2026-07-19-140509.har` and added narrow 91porn ad/SmartPop rules.
- Deliberately left `la.btc620.com/.../mp43/*.mp4` untouched so video requests continue to receive HTTP 206 ranges.
- Added an HTML response cleanup script for 91porn ad containers that were leaving oversized blank boxes after URL blocking.
- Restored `rewrite.snippet` to the untouched upstream baseline and moved all 91porn rules into standalone `91porn.snippet`.
- Added `91porn-routing.list` for the site and video CDN domains seen in the HAR; its policy name is intentionally editable.
- Analyzed `quantumult-x-2026-07-19-152527.har` and added standalone `18comic.snippet` rules for the confirmed third-party ad endpoints.
- Added `scripts/18comic-cleanup.js` to remove the site's `.c835e-33_e` ad slots and AJAX `ad1/ad2` fragments, including empty-wrapper cleanup so blocked ads do not leave large blank boxes.
- Verified all 17 captured 18comic HTML/JSON responses offline: ad markers were removed while comic image markers and video markup stayed unchanged. No rule matches `cdn-msp2/3.18comic.vip` or the captured MP4 hosts.
- Replayed `quantumult-x-2026-07-19-160701.har` and extended the standalone 91porn cleanup to `uvideos.php` pages and all confirmed `ad_img` banner anchors; blocked JuicyAds loader script as well. Video markup and sources remain untouched.
