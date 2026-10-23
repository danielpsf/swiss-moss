# Agents

Read `DESIGN.md` before building or changing UI with Swiss Moss. It holds the tokens, hard rules, the component index (common names to `sm-` markup), events and the hand-in checklist.

Working on this repository:

- No dependencies and no build step. Vanilla CSS and JS only.
- A new component needs CSS in `css/swiss-moss.css`, a demo in `index.html`, a row in the `DESIGN.md` index and a line in `CHANGELOG.md`.
- Run `npm run check` (contrast in both themes, plus the behaviour helpers). It must pass.
- Commits are signed off (`git commit -s`).
