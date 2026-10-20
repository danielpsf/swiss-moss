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
| Lines | `line`, `line-strong` |
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

Buttons (primary, ghost, quiet, signal, danger, sizes, icon, loading, groups), chips (toggle, removable, avatar, invalid), tags, badges, labels, keyboard hints, avatars and avatar groups, fields with hint and error, inputs for text, email, password, number, url, tel, date, time, search, color, read-only and disabled, input groups with icons and affixes, textarea with character counter, select, file drop zone, tag inputs (emails, single value, suggestions, numbers with a maximum), checkbox with indeterminate, radio, switch, segmented control, range, tabs with keyboard support, command bar, breadcrumb, pagination, menu and menu button, steps, side nav, alerts in five tones, toasts with an action, dialogs and a full-screen variant, tooltips, progress bars, spinner, skeletons, empty states, cards in four looks, stats, list rows with selected state, tables, accordion.

Every one is shown with its markup on the documentation page.

## Behaviours

`window.SwissMoss` exposes:

- `theme.set("light" | "dark" | "auto")`, `theme.toggle()`
- `toast(text, { action, onAction, duration })`
- `init(root)` to wire components added after page load
- Menu button: `data-sm-menu` wires the ARIA menu pattern (arrow keys, Home, End, type-ahead, Escape) and fires `sm:select`
- Tag inputs: `element.getValues()`, `element.setValues([...])`, and an `sm:change` event

## Accessibility

Focus rings on everything, 4.5:1 text contrast on `paper` and `card` in both themes, tabs with arrow-key navigation and proper roles, native `<dialog>` for modals, labels on every form control in the examples. If you find a gap, open an issue.

## Licence

Apache-2.0. See `LICENSE`.
