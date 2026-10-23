# Swiss Moss

Paper, ink and one green.

A small, opinionated design system for calm interfaces: a token set, a CSS component library and a few dependency-free behaviours. Light and dark from the same tokens. No build step, no framework.

Live documentation: enable GitHub Pages on this repository (Settings, Pages, Source: GitHub Actions) and the included workflow publishes `index.html` on every push to `main`.

## What's inside

```
tokens/   tokens.css (custom properties, both themes)  tokens.json (same values for tooling)
css/      swiss-moss.css (every component, prefixed sm-)
js/       swiss-moss.js (theme, tabs, menu, tag input, toasts, dialogs, file drop, counters, validation)
examples/ a settings page built only from the system
design/   swiss-moss.figcraft, the design file for working by hand
DESIGN.md the system in one page, written for agents and people
index.html  the documentation and gallery, served by GitHub Pages
```

## Use it

Load the two open fonts (Inter and Inter Tight), then the stylesheet and the script:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="css/swiss-moss.css">
<script src="js/swiss-moss.js" defer></script>
```

Then write plain HTML with `sm-` classes:

```html
<h1 class="sm-display-l">Seven things need you.</h1>
<button class="sm-btn primary">Send and next</button>
<div class="sm-tag-input" data-sm-tag-input="email">
  <input type="text" placeholder="Add people">
  <input type="hidden" name="to">
</div>
```

Dark mode follows the operating system. Force a theme with `data-theme="dark"` or `"light"` on `<html>`, or give people a switch:

```html
<button data-sm-theme="light">Light</button>
<button data-sm-theme="auto">Auto</button>
<button data-sm-theme="dark">Dark</button>
```

The choice is stored in `localStorage` under `sm-theme`.

## Principles

1. **One sentence first.** Screens open with a headline that states the situation in words. Counts live inside sentences.
2. **Lines, not boxes.** Hairlines separate content. Cards are for things that float or take input.
3. **Nothing moves until you do.** Motion answers an action, and `prefers-reduced-motion` is respected.
4. **One accent.** Moss marks the primary action, the active tab, the drop target and the focus ring. The warm signal colour means wrong or irreversible, never decoration.

## Tokens

| Group | Tokens |
| --- | --- |
| Grounds | `paper`, `paper-deep`, `card`, `mist` |
| Lines | `line` (dividers), `control-line` (control borders), `line-strong` |
| Text | `ink`, `muted` |
| Accent | `moss`, `moss-deep`, `on-moss`, `on-moss-muted`, `focus` |
| Status | `signal`, `signal-tint`, `danger`, `danger-tint`, `info`, `info-tint` |
| Toast | `toast`, `on-toast`, `on-toast-accent` |
| Type | `display-xl`, `display-l`, `display-m`, `title`, `heading`, `item`, `lead`, `body`, `small`, `caption`, `key` |
| Space | `space-1` (4px) to `space-9` (96px), on a 28px rhythm; `measure` 860px |
| Radius | `s` 8px, `m` 12px, `l` 16px, `pill` |
| Shadow | `rest`, `lift` |

Every value is a custom property prefixed `--sm-`, for example `var(--sm-moss)`.

## Components

Buttons (primary, ghost, quiet, signal, danger, dashed, sizes, icon, loading, groups), chips (toggle, removable, avatar, invalid), tags, badges, status dots, delta chips, labels, keyboard hints, info tips, avatars and avatar groups.

Inputs: fields with hint and error, every native input type, input groups with icons, affixes and an inline select (phone numbers), textarea with character counter, select, file drop zone, tag inputs (emails, single value, suggestions, numbers with a maximum), number stepper, one-time code, password with reveal and strength meter, money input, calendar, date picker and date range, multi-select. Checkbox with indeterminate, radio, switch, segmented control, range.

Navigation and structure: tabs with keyboard support, top bar, page header, banner, command bar, command palette, breadcrumb, pagination, menu and menu button, context menu, steps, side nav, carousel, labeled divider, aspect ratio, scroll area.

Overlays and feedback: alerts in five tones, toasts with an action, dialogs (full-screen, sheet, drawer, and one that becomes a drawer on phones), popovers, tooltips, progress bars, spinner, skeletons, empty and error states.

Data: cards in four looks, stats with delta and sparkline, bar list, list rows with selected state, tables with sortable columns, row selection, sticky header, toolbar and bulk action bar, description list, timeline, code block with copy and line numbers, truncation with a tooltip, clamped text with "show more", accordion.

Every one is shown with its markup on the documentation page. `DESIGN.md` maps common component names (popover, sheet, combobox, data table, OTP and so on) to Swiss Moss markup.

## Behaviours

`window.SwissMoss` exposes:

- `theme.set("light" | "dark" | "auto")`, `theme.toggle()`
- `toast(text, { action, onAction, duration })`
- `init(root)` to wire components added after page load
- Menu button: `data-sm-menu` wires the ARIA menu pattern (arrow keys, Home, End, type-ahead, Escape) and fires `sm:select`
- Tag inputs: `element.getValues()`, `element.setValues([...])`, and an `sm:change` event
- Menus: `menuitemcheckbox` items stay open and fire `sm:change` with `{ values }`; a `.sm-badge` in the trigger counts them
- Context menu: `data-sm-context-menu="list-id"` on an area (right-click, Menu key or Shift+F10)
- Popover: native `popover` and `popovertarget`; Swiss Moss places it under its button. `popover.place(el, anchor)` for your own
- Command palette: `<dialog data-sm-palette="k">` opens with Cmd/Ctrl+K and fires `sm:select`
- Calendar: `data-sm-calendar="single" | "range"`, `data-sm-for` to fill an input, `sm:change` with `{ value, start, end }`; ranges are ISO 8601 intervals
- Inputs: `data-sm-stepper`, `data-sm-otp="6"`, `data-sm-reveal`, `data-sm-strength`, `data-sm-money` (parses and formats in the page locale)
- Copy: `data-sm-copy="text"` or `data-sm-copy-target="id"`, announced to screen readers
- Banner: `data-sm-banner="key"` remembers a dismissal; truncation: `data-sm-truncate`, `data-sm-expand`; carousel: `data-sm-carousel`
- Tables: `data-sm-table` sorts on `.sm-sort` buttons, selects with `data-sm-select-all` / `data-sm-select-row`, and drives `data-sm-bulk-for`; fires `sm:sort` and `sm:selection`

## Accessibility

Focus rings on everything, 4.5:1 text contrast and 3:1 control borders (`control-line`) in both themes, checked by `npm run check` (which also tests the date, password, money and sort helpers), logical properties so components mirror in right-to-left, tabs with arrow-key navigation and proper roles, native `<dialog>` for modals, labels on every form control in the examples. If you find a gap, open an issue.

## Licence

Apache-2.0. See `LICENSE`.
