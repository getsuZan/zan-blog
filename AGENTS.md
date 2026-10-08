# zan-blog agent guardrails — repel sloppish designs

## Palette law
- Colors only via `--p-*` vars (global.css). Never hardcode hex in markup.
- Official Tetris brand set only (brandpalettes.com/tetris-color-codes).
- Text accents must keep ≥4.5 contrast both themes (`npm run audit` enforces).
- Complement (`--p-comp`) balances purple: eyebrows, T head, gradient tail.
- Amber (`--p-warm`) sparing: gradient tail, tiny highlights.

## Shape law
- Square corners (`rounded`, 4px). No `rounded-xl/lg` on cards/buttons/inputs.
- 1px hairlines only. No bulky shadows; hover shadow max `0 8px 22px -14px`.
- Chips (T container) keep game-piece look: solid `--p-chip`, 4px radius.

## Tetris restraint
- Subtle always: background outlines, dividers, hover chip, favicon, 404.
- No flashing loops. All motion honors `prefers-reduced-motion`.
- Background pieces: 5–7, large outline blueprint style, gray grid, endless drift.

## Component law (no copies)
- Cards only via `PostCard`. Rows only via `NowRow`. Never duplicate their markup in JS templates.
- Filter by hiding SSR nodes (`hidden` class), never `innerHTML` re-render.
- One instance rule: vinyl, background canvas exist once per page.

## Motion
- 140–220ms ease-outs. Slide/fade only; nothing bounces.
- Inline scripts must survive view transitions (delegate + `astro:after-swap`).

## Gate
- `npm run build` then `npm run audit` must pass before push.
