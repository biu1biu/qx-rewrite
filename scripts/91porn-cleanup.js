// Remove confirmed 91porn ad containers from HTML without touching nav/video markup.
// SAFETY: every rule is anchored to a provable ad marker. Nothing here may remove
// the top-nav/headnav menu, pagination, or video elements.
let body = $response.body || "";
if (!body.length) $done({});

// 1) cont6 ad divs — must contain an ad marker (external ad link or ad_img image).
//    Without the marker requirement, a non-ad element using class="cont6" would be removed.
body = body.replace(/<div\b[^>]*class=["'][^"']*\bcont6\b[^"']*["'][^>]*>(?:(?!<\/div>)[\s\S])*?(?:ad_img|91selfie|rmhfrtnd|jads\.co|juicyads|smartpop)[\s\S]*?<\/div>\s*/gi, '');

// 2) ad_img anchor — the <a> wrapping an <img class="ad_img"> ad banner.
body = body.replace(/<a\b[^>]*>\s*<img\b[^>]*class=["'][^"']*\bad_img\b[^"']*["'][^>]*>\s*<\/a>\s*(?:<br\s*\/?>\s*)*/gi, '');

// 3) smartpop iframe — the popup ad from go.rmhfrtnd.com.
body = body.replace(/<iframe\b[^>]*src=["']https?:\/\/go\.rmhfrtnd\.com\/smartpop\/[^"']+["'][\s\S]*?<\/iframe>\s*(?:<br\s*\/?>\s*)*/gi, '');

// 4) JuicyAds comment block — bounded so it cannot swallow the page if the END
//    comment is missing (tempered dot stops at </body> or the next <!-- ad marker).
body = body.replace(/<!--[\s]*JuicyAds v3\.1[\s]*-->(?:(?!JuicyAds END|<\/body>)[\s\S])*?<!--[\s]*JuicyAds END[\s]*-->\s*/gi, '');

$done({ body });
