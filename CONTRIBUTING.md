# Contributing

Thanks for helping. A few rules keep Swiss Moss small.

- One accent colour. If a component needs a second one, it is the wrong component.
- Lines, not boxes. Reach for a hairline before a card.
- No dependencies. Behaviours are vanilla JS, opt-in through `data-sm-*` attributes.
- Every component needs: CSS in `css/swiss-moss.css`, a demo in `index.html`, and a line in `CHANGELOG.md`.
- Contrast: text must reach 4.5:1 and control borders 3:1 in both themes. Run `npm run check` (node, no install); add new token pairs to `scripts/check-contrast.js`.
- Direction: use logical properties (`inline-start`, `padding-inline`, `text-align:start`), never `left`/`right`, so components mirror with `dir="rtl"`.
- Sentence case in every example. No emoji in the interface.

Sign off your commits (`git commit -s`) to agree to the Developer Certificate of Origin.
