// Remove 18comic.vip ad slots while preserving comic images and playback markup.
let body = $response.body || "";

function removeDivsByClass(source, className) {
  const open = /<div\b[^>]*\bclass\s*=\s*(["'])([^"']*)\1[^>]*>/ig;
  let match;
  let output = "";
  let cursor = 0;

  while ((match = open.exec(source))) {
    if (!match[2].split(/\s+/).includes(className)) continue;
    const start = match.index;
    let depth = 1;
    let scan = open.lastIndex;
    const tags = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<div\b[^>]*>|<\/div\s*>/ig;
    tags.lastIndex = scan;
    let tag;
    while ((tag = tags.exec(source))) {
      const value = tag[0];
      if (/^<script\b|^<style\b|^<!--/i.test(value)) continue;
      if (/^<div\b/i.test(value)) depth += 1;
      else depth -= 1;
      if (depth === 0) {
        output += source.slice(cursor, start);
        cursor = tags.lastIndex;
        open.lastIndex = cursor;
        break;
      }
    }
    if (depth !== 0) break;
  }

  return output + source.slice(cursor);
}

function removeEmptyWrappers(source) {
  let result = source;
  const empty = [
    /<div\b[^>]*class=["'][^"']*\bphoto_center_div\b[^"']*["'][^>]*>\s*<\/div>/ig,
    /<div\b[^>]*class=["'][^"']*\b(?:col-[^"']+\s+)*mobile-ad\b[^"']*["'][^>]*>\s*<\/div>/ig,
    /<div\b[^>]*class=["'][^"']*\bc835e-33_e_sticky2\b[^"']*["'][^>]*>\s*(?:<div\b[^>]*>\s*<\/div>\s*)*<\/div>/ig
  ];
  for (const pattern of empty) result = result.replace(pattern, "");
  return result;
}

if (/^\s*\{/.test(body)) {
  try {
    const json = JSON.parse(body);
    for (const key of ["addiv", "ad1", "ad2"]) {
      if (Object.prototype.hasOwnProperty.call(json, key)) json[key] = "";
    }
    body = JSON.stringify(json);
  } catch (_) {
    // Leave non-JSON responses unchanged if the endpoint changes format.
  }
} else {
  body = removeDivsByClass(body, "c835e-33_e_sticky2");
  body = removeDivsByClass(body, "c835e-33_e");
  body = removeEmptyWrappers(body);
}

$done({ body });
