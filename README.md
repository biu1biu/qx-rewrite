# Quantumult X Rewrite

Personal Quantumult X rewrite rules based on the public `fmz200/wool_scripts` baseline.

## Subscription

```text
https://raw.githubusercontent.com/biu1biu/qx-rewrite/main/rewrite.snippet
```

Add the URL in Quantumult X under **订阅资源** as a rewrite snippet. The file is intentionally public so the raw URL can be fetched without a GitHub login.

## Layout

- `rewrite.snippet`: active subscription file.
- `91porn.snippet`: standalone 91porn rules; subscribe this separately in Quantumult X.
- `91porn-routing.list`: standalone playback-domain routing list; change the final `proxy` field to your policy/group name.
- `scripts/91porn-cleanup.js`: removes confirmed ad containers from 91porn HTML responses; video elements and sources are left unchanged.
- `18comic.snippet`: standalone 18comic.vip rules; subscribe this separately in Quantumult X.
- `scripts/18comic-cleanup.js`: removes marked 18comic ad slots and AJAX ad fragments; comic image and video URLs are left unchanged.
- `scripts/missav-cleanup.js`: removes confirmed missav.ws ad containers (smartpop iframes, TSyndicate native ads, the `html-ads` dynamic injector) from HTML responses; video HLS CDNs, cover images, and the recombee API are left unchanged. Rules live inside `rewrite.snippet` under the `✅ missav ✅` section.
- `upstream/rewrite.snippet`: untouched copy of the imported upstream baseline.
- `zhs-ad-domains.list`: 智慧树 (ZHS) ad domain reject list — works without MITM. Subscribe separately in QX rule section.
- `CHANGELOG.md`: local changes and verification notes.

## Workflow

1. Capture the ad request or response and provide the app name, URL, and relevant response shape.
2. Add the smallest rule that removes the ad without breaking the surrounding response.
3. Test the rule with the affected app and commit the change.
4. Keep credentials, cookies, device identifiers, and raw private captures out of Git.

The upstream source is recorded in `CHANGELOG.md`. Upstream updates must be reviewed before replacing local rules, because they can change MITM hostnames and response scripts.

The standalone 91porn subscription URL is:

```text
https://raw.githubusercontent.com/biu1biu/qx-rewrite/main/91porn.snippet
```

The playback routing list is:

```text
https://raw.githubusercontent.com/biu1biu/qx-rewrite/main/91porn-routing.list
```

The standalone 18comic subscription URL is:

```text
https://raw.githubusercontent.com/biu1biu/qx-rewrite/main/18comic.snippet
```

The 智慧树 ad domain reject list (no MITM needed):

```text
https://raw.githubusercontent.com/biu1biu/qx-rewrite/main/zhs-ad-domains.list
```

Subscribe this in **Quantumult X → 配置文件 → 规则 → 引用**（不是重写部分）
