# Changelog

## Unreleased

- Accessibility: light `muted` (#6F756F to #686D68) and `signal` (#A8641E to #9B5C1C) reach 4.5:1 on paper, paper-deep, signal-tint and mist; `on-moss-muted` (#DCE9DD to #EFF5EF) reaches 4.5:1 on moss
- New `control-line` token (light #908872, dark #557561) at 3:1 for control boundaries (WCAG 1.4.11): inputs, selects, textareas, tag inputs, file drop, checkbox, radio, switch track, segmented border, range track. `line` stays the subtle divider
- The signal badge label uses `on-moss`, fixing 2.18:1 in dark
- Switch knob and other physical left/right (select, table, tabs, alert dismiss, rows, button groups, chip and avatar overlaps, prose lists) now mirror in right-to-left
- Checkbox tick and dash are masks painted with `on-moss`, so the indeterminate state shows a dash and both read correctly in dark, forced or from the system
- The select chevron follows the theme through `--sm-chevron` (dark uses the dark `muted`); `npm run check` fails if its colour drifts from `muted`
- The indeterminate progress bar slides right to left in right-to-left
- `npm run check` (scripts/check-contrast.js) computes WCAG ratios for declared token pairs in both themes and runs in CI
- Menu button: the ARIA menu pattern for `.sm-menu` through `data-sm-menu` (keyboard, `menuitemradio`, `sm:select`), with a checked style
- Menu list uses logical properties and mirrors in right-to-left; the `end` modifier joins `right`
- Behaviours no longer stop when `localStorage` is blocked

## 1.0.0

First public release.

- Tokens in CSS and JSON, light ("Paper") and dark ("Night")
- Typography scale, layout helpers
- Buttons, chips, tags, badges, labels, avatars
- Inputs for every native type, input groups, textarea with counter, select, file drop
- Tag input for emails, labels, keywords and numbers, with suggestions and single mode
- Checkbox, radio, switch, segmented control, range
- Tabs, command bar, breadcrumb, pagination, menu, steps, side nav
- Alerts, toasts, dialogs including the full-screen interrupt, tooltips, progress, spinner, skeleton, empty state
- Cards, stats, list rows, table, accordion
- Documentation site for GitHub Pages
