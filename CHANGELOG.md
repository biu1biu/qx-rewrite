# Changelog

## 2026-07-19

- Created the public repository `biu1biu/qx-rewrite`.
- Imported `https://github.com/fmz200/wool_scripts/raw/main/QuantumultX/rewrite/rewrite.snippet` as the initial active rule set.
- Stored the untouched imported file at `upstream/rewrite.snippet`.
- Imported baseline SHA-256: `be950bd64086028e7fc092b40ff1b32b809443749ede70406cf0aeedf33ee516`.
- Analyzed `quantumult-x-2026-07-19-140509.har` and added narrow 91porn ad/SmartPop rules.
- Deliberately left `la.btc620.com/.../mp43/*.mp4` untouched so video requests continue to receive HTTP 206 ranges.
