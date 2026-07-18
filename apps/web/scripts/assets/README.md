# Asset generation scripts

Run from repo root:

```bash
node apps/web/scripts/assets/gen-boards.mjs
node apps/web/scripts/assets/gen-sfx.mjs
```

Outputs land in `packages/web-assets/public/skins/boards/` and `packages/web-assets/public/sfx/`.
Hand-authored piece SVGs live under `public/skins/{default,frost}/` — edit those directly.
