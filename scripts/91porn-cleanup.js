// Remove confirmed 91porn ad containers from HTML without touching video markup.
let body = $response.body || "";

const adPatterns = [
  /<div\b[^>]*class=["'][^"']*\bcont6\b[^"']*["'][\s\S]*?<\/div>\s*/gi,
  /<a\b[^>]*>\s*<img\b[^>]*class=["'][^"']*\bad_img\b[^"']*["'][^>]*>\s*<\/a>\s*(?:<br\s*\/?>\s*)*/gi,
  /<iframe\b[^>]*src=["']https?:\/\/go\.rmhfrtnd\.com\/smartpop\/[^"']+["'][\s\S]*?<\/iframe>\s*(?:<br\s*\/?>\s*)*/gi,
  /<!--[\s]*JuicyAds v3\.1[\s]*-->[\s\S]*?<!--[\s]*JuicyAds END[\s]*-->\s*/gi
];

for (const pattern of adPatterns) body = body.replace(pattern, "");

$done({ body });
