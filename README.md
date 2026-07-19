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
- `upstream/rewrite.snippet`: untouched copy of the imported upstream baseline.
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
