# Changelog

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
