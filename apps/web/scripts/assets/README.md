# Asset generation scripts

Run from repo root:

```bash
node apps/web/scripts/assets/gen-boards.mjs
node apps/web/scripts/assets/gen-sfx.mjs
```

Outputs land in `apps/web/public/skins/boards/` and `apps/web/public/sfx/`.
Hand-authored piece SVGs live under `public/skins/{default,frost}/` — edit those directly.
