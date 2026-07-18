# Asset generation scripts

Run from repo root:

```bash
pnpm --filter @wolf-sheep/web-assets generate:boards
pnpm --filter @wolf-sheep/web-assets generate:sfx
```

Outputs land in `packages/web-assets/public/skins/boards/` and `packages/web-assets/public/sfx/`.
Hand-authored piece SVGs live under `public/skins/{default,frost}/` — edit those directly.
