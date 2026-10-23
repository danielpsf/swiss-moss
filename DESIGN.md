# Swiss Moss: design guide

Paper, ink and one green. This file is the whole system on one page. It is written for coding agents first and people second: every rule here is one you can check in the output.

Source of truth, in order: `tokens/tokens.css`, `css/swiss-moss.css`, `js/swiss-moss.js`, then `index.html` (the live gallery with markup under every demo). The figCraft file in `design/` mirrors the code; if they disagree, the code wins.

## Build a screen in five steps

1. Load the fonts, `css/swiss-moss.css` and `js/swiss-moss.js` (see README). No build step, no framework.
2. Open with one sentence that states the situation: `<h1 class="sm-display-l">Seven things need you.</h1>`.
3. Separate content with hairlines (`.sm-list`, `.sm-divider`, `.sm-section-rule`). Use a card only for things that float or take input.
4. Give the screen one primary action: `.sm-btn.primary`. Everything else is default or `quiet`.
5. Copy markup from the gallery. Do not invent classes. If a component is missing, compose it from tokens and existing classes, and say so.

## Hard rules

- Use tokens, never raw values: `var(--sm-moss)`, `var(--sm-space-4)`, `var(--sm-radius-m)`. A hex code in component CSS is a bug.
- One accent. Moss marks the primary action, the active tab, the selection, the drop target and the focus ring. Nothing else is green.
- Signal (warm amber) means wrong or irreversible. Danger means destructive. Neither decorates.
- Colour is never the only signal. A status dot has a word (`Active`), a delta chip has an arrow and a word (`↓ Down 12%`), a strength meter has a label.
- Logical properties only: `margin-inline-start`, `padding-inline`, `inset-inline-start`, `text-align:start`. Components must mirror under `dir="rtl"`. Use `.sm-flip` on direction-bound icons.
- Text reaches 4.5:1 and control borders 3:1 in both themes. Run `npm run check` after touching tokens.
- Motion answers an action and nothing else. Respect `prefers-reduced-motion` (the base CSS already does).
- Sentence case everywhere. No emoji and no exclamation marks in the interface.
- Every form control has a visible label (`.sm-label`) or an `aria-label`.
- Behaviours are opt-in `data-sm-*` attributes. No dependencies.

## Tokens

All custom properties are prefixed `--sm-`. Light ("Paper") is the default. Dark ("Night") follows the system, or set `data-theme="dark"` / `"light"` on `<html>`.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `paper` | #FBF8F0 | #121A15 | page background |
| `paper-deep` | #F1EDE0 | #18231C | hover, code, disabled, tags |
| `card` | #FFFFFF | #1A271F | inputs, cards, popovers |
| `mist` | #EEF3EB | #1E3127 | selected rows, active chips, range days |
| `line` | #E6E0CF | #2A3A30 | hairline dividers, card borders |
| `control-line` | #908872 | #557561 | borders of inputs and controls (3:1) |
| `line-strong` | #141A16 | #EDE6D6 | section rules, table head rule |
| `ink` | #141A16 | #EDE6D6 | text |
| `muted` | #686D68 | #9AA89E | secondary text, hints, placeholders |
| `moss` | #4A7A52 | #7FC48F | the accent |
| `moss-deep` | #355B3C | #A9D8B2 | accent text, primary hover |
| `on-moss` | #FFFFFF | #121A15 | text and glyphs on moss |
| `on-moss-muted` | #EFF5EF | #2A4A33 | secondary text on moss |
| `signal` / `signal-tint` | #9B5C1C / #F7EBDD | #E0A36B / #3A2A1A | wrong, warning, irreversible |
| `danger` / `danger-tint` | #9C3B2E / #F7E3DF | #E08A7C / #3A1F1B | destructive |
| `info` / `info-tint` | #2F5C7A / #E4EDF3 | #8CB8D6 / #1B2A36 | neutral information |
| `toast` / `on-toast` / `on-toast-accent` | #141A16 / #FBF8F0 / #B9DDBF | #EDE6D6 / #121A15 / #355B3C | toasts, bulk action bar |
| `focus` | #4A7A52 | #7FC48F | focus ring |

Type (class = token): `display-xl` 112, `display-l` 56, `display-m` 44 (all clamp down on small screens), `title` 28, `heading` 20, `item` 19, `lead` 17, `body` 15, `small` 14, `caption` 13 muted, `key` 12. Display sizes use Inter Tight 600 with tight tracking; text uses Inter.

Space: `space-1` 4, `2` 8, `3` 12, `4` 16, `5` 20, `6` 28, `7` 40, `8` 64, `9` 96 (px). Reading width `measure` 860px.
Radius: `s` 8, `m` 12 (inputs, popovers), `l` 16 (cards, dialogs), `pill` (buttons, chips).
Shadow: `rest` for resting cards, `lift` for anything floating. Motion: `fast` 120ms, `base` 180ms, `ease`.

`tokens/tokens.json` holds the same values for tooling.

## Component index

Look up by the name you know. Modifiers are plain extra classes (`.sm-btn.primary.sm`).

| You want | Swiss Moss | Notes |
| --- | --- | --- |
| Button | `.sm-btn` + `primary` `quiet` `signal` `danger` `dashed`, `sm` `lg` `xl` `icon` `block` `loading` | one `primary` per view |
| Button group, toggle group | `.sm-btn-group` with `aria-pressed`; `.sm-segmented` for one-of-many | |
| Toggle | `.sm-chip[aria-pressed]` | |
| Badge, counter | `.sm-badge` (`muted`, `signal`, `dot`) | |
| Tag, label pill | `.sm-tag` (`moss`, `signal`, `danger`, `info`, `outline`, `dot`) | |
| Status badge | `.sm-status` (`moss`, `signal`, `danger`, `info`) | dot plus a word |
| Trend, delta | `.sm-delta` (`bad`, `flat`) | arrow plus a word |
| Avatar, avatar group | `.sm-avatar`, `.sm-avatar-group` | |
| Kbd, shortcut | `.sm-kbd` | |
| Form field | `.sm-field` > `.sm-label` + control + `.sm-hint` + `.sm-error`; `data-sm-validate` | `.invalid` shows the error |
| Input, textarea, native select | `.sm-input`, `.sm-textarea`, `.sm-select` | |
| Input group, search, affix | `.sm-input-group` with `.sm-icon`, `.sm-affix`, inner `.sm-select`, `.sm-sep` | phone numbers use the inner select |
| Number input with buttons | `.sm-stepper[data-sm-stepper]` | |
| OTP, verification code | `.sm-otp[data-sm-otp="6"]` | |
| Password | `.sm-reveal[data-sm-reveal]` + `.sm-strength[data-sm-strength]` | |
| Currency, money | `input[data-sm-money]` in an input group | formats in the page locale on blur |
| Date picker, calendar, date range | `.sm-calendar[data-sm-calendar="single"]` or `"range"`, in a `.sm-popover` | |
| Combobox with chips, email list | `.sm-tag-input[data-sm-tag-input="email"]`, `data-sm-suggest` | |
| Multi-select, filter | `.sm-menu[data-sm-menu]` with `menuitemcheckbox` items, `.sm-badge` in the trigger | |
| Checkbox, radio, switch, slider | `.sm-check`, `.sm-radio`, `.sm-switch`, `.sm-range` | |
| File upload | `label.sm-file` | |
| Tabs | `.sm-tabs[data-sm-tabs]` + `.sm-tab[role=tab]` | |
| Dropdown menu | `.sm-menu[data-sm-menu]` + `.sm-menu-list[role=menu]` | |
| Context menu | `[data-sm-context-menu]` + `.sm-menu-list.floating` | |
| Command palette | `dialog.sm-dialog.sm-palette[data-sm-palette]` | Cmd/Ctrl+K |
| Search bar | `.sm-command` | |
| App header, navbar | `.sm-topbar` | |
| Sidebar | `.sm-nav` | |
| Page title with actions | `.sm-page-header` | |
| Breadcrumb, pagination, stepper/wizard | `.sm-breadcrumb`, `.sm-pagination`, `.sm-steps` | |
| Announcement bar | `.sm-banner[data-sm-banner="key"]` | |
| Alert, callout | `.sm-alert` (`signal`, `danger`, `info`, `neutral`) | |
| Toast, snackbar | `SwissMoss.toast(text, { action, onAction })` | |
| Modal, confirm dialog | `dialog.sm-dialog` + `data-sm-dialog-open` / `data-sm-dialog-close` | |
| Sheet, side panel | `dialog.sm-dialog.sheet` | |
| Drawer, bottom sheet | `dialog.sm-dialog.drawer`; `.responsive` turns a dialog into one on phones | |
| Popover, hover card | `.sm-popover[popover]` + `[popovertarget]` | |
| Tooltip, info tip | `[data-tip]`, `.sm-infotip` | |
| Progress, spinner, skeleton | `.sm-progress`, `.sm-spinner`, `.sm-skeleton` | |
| Empty, error state | `.sm-empty`, `.sm-empty.error` | |
| Card | `.sm-card` (`tinted`, `flat`, `lift`) | |
| KPI tile | `.sm-stat` + `.sm-delta` + `svg.sm-spark` | |
| Chart (simple) | `.sm-bars` / `.sm-bar` with `--v`, `svg.sm-spark` | no chart library |
| List | `.sm-list`, `.sm-row` (`interactive`, `selected`) | |
| Data table | `table.sm-table[data-sm-table]` in `.sm-table-wrap`, `.sm-sort`, `.select`, `.sticky`, `.sm-toolbar`, `.sm-bulk-bar` | |
| Key-value list | `dl.sm-dl` | stacks on phones |
| Activity feed | `ol.sm-timeline` | |
| Code block | `.sm-code` (`numbered`) with `[data-sm-copy]` | |
| Copy button | `[data-sm-copy]` | |
| Truncation | `.sm-truncate` in `[data-sm-truncate]`; `.sm-clamp` + `[data-sm-expand]` | |
| Accordion, collapsible | `.sm-accordion` with `<details>` | |
| Separator | `.sm-divider`, `.sm-divider-label` | |
| Carousel | `.sm-carousel[data-sm-carousel]` | scroll snap |
| Aspect ratio, scroll area | `.sm-ratio` (`--sm-ratio`), `.sm-scroll` (`--sm-scroll-h`) | |
| Layout | `.sm-container`, `.sm-stack`, `.sm-cluster`, `.sm-between`, `.sm-grid`, `.sm-form-row` | |

Not in the system on purpose: resizable panes, a charting library, icon and illustration sets (bring your own 24px stroke icons at `stroke-width` 1.6 to 1.8, `currentColor`).

## Behaviours and events

Wire elements added after load with `SwissMoss.init(root)`. Events bubble from the component:

| Event | From | `detail` |
| --- | --- | --- |
| `sm:select` | menu, context menu area, palette | `{ item, value }` |
| `sm:change` | tag input, checkbox menu, calendar, OTP | `{ values }`, `{ value, start, end }`, `{ value, complete }` |
| `sm:sort` | table | `{ column, dir }` |
| `sm:selection` | table | `{ rows }` |

Helpers: `SwissMoss.calendar.grid/addMonths/iso/parse`, `SwissMoss.password.score`, `SwissMoss.money.parse/format`, `SwissMoss.table.compare`, `SwissMoss.popover.place`, `SwissMoss.theme.set/toggle`.

## Writing

- Headlines are full sentences with a full stop: "Four replies, one sitting."
- Buttons say what happens: "Send and next", "Revoke all tokens". Never "OK" or "Submit".
- Hints explain the consequence in one line.
- Errors say what went wrong and what to do: "Could not load runs. The worker did not answer in 10 seconds."
- Counts live inside sentences, not as a big number with a tiny label (stats are the exception, in dashboards).

## Checklist before you hand in a screen

- [ ] Only `sm-` classes and `--sm-` tokens; no new hex values
- [ ] One primary button; signal and danger only where something is wrong or destructive
- [ ] Works in light, dark (`data-theme`) and `dir="rtl"`
- [ ] Works at 390px wide with no sideways scroll
- [ ] Every control is labelled and reachable by keyboard, with a visible focus ring
- [ ] Meaning never depends on colour alone
- [ ] `npm run check` passes

## Adding to the system

Add the CSS to `css/swiss-moss.css` (prefixed `sm-`, tokens only, logical properties), a behaviour to `js/swiss-moss.js` only if HTML and CSS cannot do it, a demo with markup to `index.html`, a row to the component index above, a line to `CHANGELOG.md`, and any new colour pair to `scripts/check-contrast.js`. Pure logic gets an assertion in `scripts/check-behaviours.js`. Then update the figCraft file in `design/`.

## The design file

`design/swiss-moss.figcraft` holds the tokens as variables (Light and Dark modes), the text and effect styles, every component with its variants, and two example screens built from instances. Open it in figCraft to work by hand. Keep it in step with the code: tokens change in `tokens/tokens.css` first.
