/* Swiss Moss 1.1.0 behaviours. No dependencies. Apache-2.0.
   Everything is opt-in through data attributes, and the module exposes window.SwissMoss. */
(function () {
  "use strict";
  const SM = {};
  // localStorage throws in private windows and with blocked site data; the system must still work.
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* not saved */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* nothing to remove */ } }
  };

  /* ---------- theme ---------- */
  SM.theme = {
    get() { return document.documentElement.getAttribute("data-theme") || "auto"; },
    set(mode) {
      if (mode === "auto") { document.documentElement.removeAttribute("data-theme"); store.del("sm-theme"); }
      else { document.documentElement.setAttribute("data-theme", mode); store.set("sm-theme", mode); }
      document.querySelectorAll("[data-sm-theme]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.smTheme === mode)));
    },
    toggle() {
      const dark = document.documentElement.getAttribute("data-theme") === "dark" || (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
      SM.theme.set(dark ? "light" : "dark");
    },
    init() {
      const saved = store.get("sm-theme");
      if (saved) document.documentElement.setAttribute("data-theme", saved);
      document.addEventListener("click", e => {
        const b = e.target.closest("[data-sm-theme]");
        if (b) SM.theme.set(b.dataset.smTheme);
        if (e.target.closest("[data-sm-theme-toggle]")) SM.theme.toggle();
      });
      document.querySelectorAll("[data-sm-theme]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.smTheme === (saved || "auto"))));
    }
  };

  /* ---------- tabs ---------- */
  SM.tabs = {
    init(root) {
      (root || document).querySelectorAll("[data-sm-tabs]").forEach(tabs => {
        const list = [...tabs.querySelectorAll("[role=tab]")];
        const show = tab => {
          list.forEach(t => {
            const on = t === tab;
            t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
            const p = document.getElementById(t.getAttribute("aria-controls")); if (p) p.hidden = !on;
          });
        };
        tabs.addEventListener("click", e => { const t = e.target.closest("[role=tab]"); if (t) show(t); });
        tabs.addEventListener("keydown", e => {
          const i = list.indexOf(document.activeElement); if (i < 0) return;
          const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : null;
          if (n === null) return; e.preventDefault(); const t = list[(n + list.length) % list.length]; t.focus(); show(t);
        });
        show(list.find(t => t.getAttribute("aria-selected") === "true") || list[0]);
      });
    }
  };

  /* ---------- tag input (emails, labels, keywords) ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  SM.tagInput = {
    init(root) {
      (root || document).querySelectorAll("[data-sm-tag-input]").forEach(el => {
        if (el.dataset.smReady) return; el.dataset.smReady = "1";
        const type = el.dataset.smTagInput || "text";
        const single = el.classList.contains("single");
        const max = Number(el.dataset.smMax || 0);
        const hidden = el.querySelector("input[type=hidden]");
        const input = el.querySelector("input:not([type=hidden])");
        const suggestions = (el.dataset.smSuggest || "").split(",").map(s => s.trim()).filter(Boolean);
        let values = [...el.querySelectorAll(".sm-chip")].map(c => c.dataset.value || c.textContent.trim());
        let box = null, active = -1;
        const valid = v => type === "email" ? EMAIL.test(v) : type === "number" ? !isNaN(Number(v)) : v.length > 0;
        const sync = () => { if (hidden) hidden.value = values.join(","); el.dispatchEvent(new CustomEvent("sm:change", { detail: { values: [...values] }, bubbles: true })); };
        const draw = () => {
          el.querySelectorAll(".sm-chip").forEach(c => c.remove());
          values.forEach((v, i) => {
            const chip = document.createElement("span");
            chip.className = "sm-chip" + (valid(v) ? "" : " invalid"); chip.dataset.value = v; chip.tabIndex = 0;
            chip.innerHTML = `<span>${v.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))}</span><button type="button" class="sm-chip-x" aria-label="Remove ${v}">&times;</button>`;
            chip.querySelector("button").addEventListener("click", () => { values.splice(i, 1); draw(); sync(); input.focus(); });
            chip.addEventListener("keydown", e => { if (e.key === "Backspace" || e.key === "Delete") { values.splice(i, 1); draw(); sync(); input.focus(); } });
            el.insertBefore(chip, input);
          });
          input.placeholder = values.length ? "" : input.dataset.placeholder || "";
          input.hidden = single && values.length >= 1;
          if (max && values.length >= max) input.hidden = true;
        };
        const add = raw => {
          raw.split(/[,;\n]/).map(s => s.trim()).filter(Boolean).forEach(v => {
            if (single) values = [];
            if (max && values.length >= max) return;
            if (!values.includes(v)) values.push(v);
          });
          input.value = ""; draw(); sync(); closeSuggest();
        };
        const openSuggest = () => {
          const q = input.value.trim().toLowerCase();
          const list = suggestions.filter(s => !values.includes(s) && (!q || s.toLowerCase().includes(q))).slice(0, 8);
          closeSuggest(); if (!list.length) return;
          box = document.createElement("div"); box.className = "sm-suggest"; box.setAttribute("role", "listbox");
          list.forEach((s, i) => { const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "option"); b.textContent = s; b.addEventListener("mousedown", e => { e.preventDefault(); add(s); input.focus(); }); box.appendChild(b); });
          el.style.position = el.style.position || "relative"; el.appendChild(box); active = -1;
        };
        const closeSuggest = () => { if (box) { box.remove(); box = null; } };
        const moveActive = d => { if (!box) return; const opts = [...box.children]; active = (active + d + opts.length) % opts.length; opts.forEach((o, i) => o.setAttribute("aria-selected", String(i === active))); };
        input.dataset.placeholder = input.placeholder;
        input.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === "Tab" && input.value.trim() || e.key === "," || (e.key === " " && type === "email")) {
            if (box && active >= 0) { e.preventDefault(); add(box.children[active].textContent); return; }
            if (input.value.trim()) { e.preventDefault(); add(input.value); }
          } else if (e.key === "Backspace" && !input.value && values.length) { values.pop(); draw(); sync(); }
          else if (e.key === "ArrowDown") { e.preventDefault(); if (!box) openSuggest(); moveActive(1); }
          else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
          else if (e.key === "Escape") closeSuggest();
        });
        input.addEventListener("input", () => { if (suggestions.length) openSuggest(); });
        input.addEventListener("focus", () => { if (suggestions.length && !input.value) openSuggest(); });
        input.addEventListener("blur", () => { setTimeout(() => { if (input.value.trim()) add(input.value); closeSuggest(); }, 120); });
        input.addEventListener("paste", e => { const t = (e.clipboardData || window.clipboardData).getData("text"); if (/[,;\n ]/.test(t)) { e.preventDefault(); add(t); } });
        el.addEventListener("click", e => { if (e.target === el) input.focus(); });
        el.getValues = () => [...values];
        el.setValues = v => { values = [...v]; draw(); sync(); };
        draw();
      });
    }
  };

  /* ---------- toggle chips ---------- */
  SM.chips = {
    init(root) {
      (root || document).addEventListener("click", e => {
        const c = e.target.closest(".sm-chip[aria-pressed]"); if (!c || e.target.closest(".sm-chip-x")) return;
        c.setAttribute("aria-pressed", String(c.getAttribute("aria-pressed") !== "true"));
      });
    }
  };

  /* ---------- toasts ---------- */
  SM.toast = (text, opts = {}) => {
    let region = document.querySelector(".sm-toast-region");
    if (!region) { region = document.createElement("div"); region.className = "sm-toast-region"; region.setAttribute("role", "status"); region.setAttribute("aria-live", "polite"); document.body.appendChild(region); }
    const t = document.createElement("div"); t.className = "sm-toast";
    const span = document.createElement("span"); span.textContent = text; t.appendChild(span);
    if (opts.action) { const b = document.createElement("button"); b.type = "button"; b.textContent = opts.action; b.addEventListener("click", () => { opts.onAction && opts.onAction(); t.remove(); }); t.appendChild(b); }
    region.appendChild(t);
    setTimeout(() => t.remove(), opts.duration || 6000);
    return t;
  };

  /* ---------- dialogs ---------- */
  SM.dialog = {
    init(root) {
      (root || document).addEventListener("click", e => {
        const open = e.target.closest("[data-sm-dialog-open]"); if (open) { const d = document.getElementById(open.dataset.smDialogOpen); if (d) d.showModal(); }
        const close = e.target.closest("[data-sm-dialog-close]"); if (close) { const d = close.closest("dialog"); if (d) d.close(); }
        const d = e.target.closest("dialog.sm-dialog"); if (d && e.target === d && !d.classList.contains("full")) d.close();
      });
    }
  };

  /* ---------- file drop ---------- */
  SM.file = {
    init(root) {
      (root || document).querySelectorAll("label.sm-file").forEach(l => {
        const input = l.querySelector("input[type=file]"); const name = l.querySelector("[data-sm-file-name]");
        const show = files => { if (name) name.textContent = files.length ? [...files].map(f => f.name).join(", ") : ""; };
        ["dragenter", "dragover"].forEach(ev => l.addEventListener(ev, e => { e.preventDefault(); l.classList.add("dragover"); }));
        ["dragleave", "drop"].forEach(ev => l.addEventListener(ev, e => { e.preventDefault(); l.classList.remove("dragover"); }));
        l.addEventListener("drop", e => { if (input && e.dataTransfer.files.length) { input.files = e.dataTransfer.files; show(input.files); } });
        if (input) input.addEventListener("change", () => show(input.files));
      });
    }
  };

  /* ---------- character counter ---------- */
  SM.counter = {
    init(root) {
      (root || document).querySelectorAll("[data-sm-count]").forEach(el => {
        const target = document.getElementById(el.dataset.smCount); if (!target) return;
        const max = target.maxLength > 0 ? target.maxLength : null;
        const draw = () => { el.textContent = max ? `${target.value.length} / ${max}` : String(target.value.length); };
        target.addEventListener("input", draw); draw();
      });
    }
  };

  /* ---------- field validation on blur ---------- */
  SM.validate = {
    init(root) {
      (root || document).querySelectorAll(".sm-field[data-sm-validate] .sm-input, .sm-field[data-sm-validate] .sm-textarea, .sm-field[data-sm-validate] .sm-select").forEach(input => {
        const field = input.closest(".sm-field");
        const check = () => field.classList.toggle("invalid", !input.checkValidity());
        input.addEventListener("blur", check); input.addEventListener("input", () => { if (field.classList.contains("invalid")) check(); });
      });
    }
  };

  // One polite live region for short confirmations ("Copied") that are not worth a toast.
  const announce = text => {
    let r = document.getElementById("sm-announce");
    if (!r) { r = document.createElement("div"); r.id = "sm-announce"; r.className = "sm-sr-only"; r.setAttribute("aria-live", "polite"); document.body.appendChild(r); }
    r.textContent = ""; setTimeout(() => { r.textContent = text; }, 30);
  };
  const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  const isRtl = el => getComputedStyle(el).direction === "rtl";

  /* ---------- menu button (ARIA menu pattern) ---------- */
  // Markup: <div class="sm-menu" data-sm-menu> <button aria-haspopup="menu" aria-expanded="false" aria-controls="id">
  // and <ul class="sm-menu-list" id="id" role="menu" hidden> with role=menuitem, menuitemradio or menuitemcheckbox buttons inside.
  // Fires "sm:select" on the host with { item, value } (value is data-value, else the text).
  // Checkbox items stay open and fire "sm:change" with { values } instead.
  const itemValue = item => (item.dataset.value !== undefined ? item.dataset.value : item.textContent.trim());
  const bindMenuList = (list, host, close) => {
    const items = () => [...list.querySelectorAll("[role^=menuitem]")];
    list.addEventListener("keydown", e => {
      const all = items(); const i = all.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); all[(i + 1) % all.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); all[(i - 1 + all.length) % all.length].focus(); }
      else if (e.key === "Home") { e.preventDefault(); all[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); all[all.length - 1].focus(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (e.key === "Tab") close(false);
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const next = [...all.slice(i + 1), ...all.slice(0, i + 1)].find(el => el.textContent.trim().toLowerCase().startsWith(e.key.toLowerCase()));
        if (next) next.focus();
      }
    });
    list.addEventListener("click", e => {
      const item = e.target.closest("[role^=menuitem]"); if (!item) return;
      const role = item.getAttribute("role");
      if (role === "menuitemcheckbox") {
        item.setAttribute("aria-checked", String(item.getAttribute("aria-checked") !== "true"));
        emit(host, "sm:change", { values: items().filter(i => i.getAttribute("role") === "menuitemcheckbox" && i.getAttribute("aria-checked") === "true").map(itemValue) });
        return;
      }
      if (role === "menuitemradio") items().filter(i => i.getAttribute("role") === "menuitemradio").forEach(i => i.setAttribute("aria-checked", String(i === item)));
      emit(host, "sm:select", { item, value: itemValue(item) });
      close(true);
    });
    return items;
  };
  SM.menu = {
    init(root) {
      // init(element) also wires the element itself, so a menu added after load can be passed straight in.
      const r = root || document;
      [...(r.matches && r.matches("[data-sm-menu]") ? [r] : []), ...r.querySelectorAll("[data-sm-menu]")].forEach(menu => {
        if (menu.dataset.smReady) return; menu.dataset.smReady = "1";
        const trigger = menu.querySelector("[aria-haspopup]");
        const list = menu.querySelector("[role=menu]");
        if (!trigger || !list) return;
        const isOpen = () => !list.hidden;
        const close = refocus => { list.hidden = true; trigger.setAttribute("aria-expanded", "false"); if (refocus) trigger.focus(); };
        const items = bindMenuList(list, menu, close);
        const open = where => {
          list.hidden = false; trigger.setAttribute("aria-expanded", "true");
          const all = items();
          (where === "last" ? all[all.length - 1] : all.find(i => i.getAttribute("aria-checked") === "true") || all[0]).focus();
        };
        // A badge inside the trigger shows how many checkbox items are on (the multi-select pattern).
        const badge = trigger.querySelector(".sm-badge");
        const count = () => { if (badge) { const n = list.querySelectorAll('[role=menuitemcheckbox][aria-checked="true"]').length; badge.textContent = n; badge.hidden = !n; } };
        menu.addEventListener("sm:change", count); count();
        trigger.addEventListener("click", () => (isOpen() ? close(false) : open()));
        trigger.addEventListener("keydown", e => {
          if (e.key === "ArrowDown") { e.preventDefault(); open(); }
          else if (e.key === "ArrowUp") { e.preventDefault(); open("last"); }
        });
        document.addEventListener("click", e => { if (isOpen() && !menu.contains(e.target)) close(false); });
        menu.addEventListener("focusout", e => { if (isOpen() && e.relatedTarget && !menu.contains(e.relatedTarget)) close(false); });
      });
    }
  };

  /* ---------- context menu ---------- */
  // <div data-sm-context-menu="id" tabindex="0"> opens <ul class="sm-menu-list floating" id="id" role="menu" hidden>
  // at the pointer on right-click, or at the area with the Menu key or Shift+F10. Events fire on the area.
  SM.contextMenu = {
    init(root) {
      (root || document).querySelectorAll("[data-sm-context-menu]").forEach(area => {
        if (area.dataset.smReady) return; area.dataset.smReady = "1";
        const list = document.getElementById(area.dataset.smContextMenu); if (!list) return;
        let back = null;
        const close = refocus => { list.hidden = true; if (refocus && back) back.focus(); };
        bindMenuList(list, area, close);
        const open = (x, y) => {
          back = document.activeElement; list.hidden = false;
          const r = list.getBoundingClientRect();
          list.style.left = Math.max(8, Math.min(x, innerWidth - r.width - 8)) + "px";
          list.style.top = Math.max(8, Math.min(y, innerHeight - r.height - 8)) + "px";
          const first = list.querySelector("[role^=menuitem]"); if (first) first.focus();
        };
        area.addEventListener("contextmenu", e => { e.preventDefault(); open(e.clientX, e.clientY); });
        area.addEventListener("keydown", e => {
          if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) { e.preventDefault(); const r = area.getBoundingClientRect(); open(r.left + 16, r.top + 16); }
        });
        document.addEventListener("click", e => { if (!list.hidden && !list.contains(e.target)) close(false); });
        list.addEventListener("focusout", e => { if (!list.hidden && e.relatedTarget && !list.contains(e.relatedTarget)) close(false); });
      });
    }
  };

  /* ---------- popover placement ---------- */
  // The native popover API opens and light-dismisses <div class="sm-popover" popover id="x"> from <button popovertarget="x">.
  // This only places it under its invoker (above when there is no room) and keeps it there on scroll and resize.
  SM.popover = {
    place(p, anchor) {
      const a = anchor.getBoundingClientRect(), r = p.getBoundingClientRect(), gap = 6;
      let left = isRtl(anchor) ? a.right - r.width : a.left;
      left = Math.max(8, Math.min(left, innerWidth - r.width - 8));
      let top = a.bottom + gap;
      if (top + r.height > innerHeight - 8 && a.top - gap - r.height > 8) top = a.top - gap - r.height;
      p.style.left = left + "px"; p.style.top = top + "px";
    },
    init() {
      const invoker = p => document.querySelector(`[popovertarget="${p.id}"]`);
      document.addEventListener("toggle", e => {
        const p = e.target;
        if (e.newState !== "open" || !p.classList || !p.classList.contains("sm-popover")) return;
        const inv = invoker(p); if (inv) SM.popover.place(p, inv);
      }, true);
      const again = () => document.querySelectorAll(".sm-popover").forEach(p => {
        let open = false; try { open = p.matches(":popover-open"); } catch (err) { /* no popover support */ }
        const inv = open && invoker(p); if (inv) SM.popover.place(p, inv);
      });
      addEventListener("resize", again); addEventListener("scroll", again, { passive: true, capture: true });
    }
  };

  /* ---------- command palette ---------- */
  // <dialog class="sm-dialog sm-palette" data-sm-palette="k"> holding a text input, a role=listbox of role=option items
  // (optional .sm-palette-group headings between them) and a .sm-palette-empty line. Cmd/Ctrl + the key toggles it.
  SM.palette = {
    init(root) {
      (root || document).querySelectorAll("dialog[data-sm-palette]").forEach(d => {
        if (d.dataset.smReady) return; d.dataset.smReady = "1";
        const input = d.querySelector("input"), list = d.querySelector("[role=listbox]"), empty = d.querySelector(".sm-palette-empty");
        if (!input || !list) return;
        const opts = [...list.querySelectorAll("[role=option]")];
        opts.forEach((o, i) => { o.id = o.id || (list.id || "sm-palette") + "-" + i; });
        input.setAttribute("role", "combobox"); input.setAttribute("aria-expanded", "true"); input.setAttribute("aria-autocomplete", "list");
        if (list.id) input.setAttribute("aria-controls", list.id);
        let shown = opts, active = 0;
        const mark = () => {
          shown.forEach((o, i) => o.setAttribute("aria-selected", String(i === active)));
          if (shown[active]) { input.setAttribute("aria-activedescendant", shown[active].id); shown[active].scrollIntoView({ block: "nearest" }); }
          else input.removeAttribute("aria-activedescendant");
        };
        const filter = () => {
          const q = input.value.trim().toLowerCase();
          opts.forEach(o => { o.hidden = !!q && !o.textContent.toLowerCase().includes(q); o.setAttribute("aria-selected", "false"); });
          list.querySelectorAll(".sm-palette-group").forEach(g => {
            let n = g.nextElementSibling, any = false;
            while (n && !n.classList.contains("sm-palette-group")) { if (!n.hidden) any = true; n = n.nextElementSibling; }
            g.hidden = !any;
          });
          shown = opts.filter(o => !o.hidden); active = 0;
          if (empty) empty.hidden = shown.length > 0;
          mark();
        };
        const pick = o => { emit(d, "sm:select", { item: o, value: itemValue(o) }); d.close(); };
        input.addEventListener("input", filter);
        input.addEventListener("keydown", e => {
          if ((e.key === "ArrowDown" || e.key === "ArrowUp") && shown.length) { e.preventDefault(); active = (active + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length; mark(); }
          else if (e.key === "Enter" && shown[active]) { e.preventDefault(); pick(shown[active]); }
        });
        list.addEventListener("click", e => { const o = e.target.closest("[role=option]"); if (o) pick(o); });
        d.addEventListener("close", () => { input.value = ""; filter(); });
        const key = (d.dataset.smPalette || "k").toLowerCase();
        document.addEventListener("keydown", e => {
          if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== key) return;
          e.preventDefault(); if (d.open) d.close(); else { d.showModal(); input.focus(); }
        });
        filter();
      });
    }
  };

  /* ---------- calendar and date picker ---------- */
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseIso = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const CHEVRON = d => `<svg class="sm-icon sm-flip" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  // <div class="sm-calendar" data-sm-calendar="single|range" data-sm-for="input-id" data-value="2026-10-23" data-sm-week-start="1">
  // A range value is an ISO 8601 interval, "2026-10-01/2026-10-07". Fires "sm:change" with { value, start, end }.
  // Inside a popover, picking a day (or the end of a range) closes the popover.
  SM.calendar = {
    iso, parse: parseIso,
    // 42 days (six weeks) that cover the month, starting on weekStart (0 Sunday, 1 Monday).
    grid(year, month, weekStart = 1) {
      const offset = (new Date(year, month, 1).getDay() - weekStart + 7) % 7;
      return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - offset + i));
    },
    // Same day n months away, clamped to the last day of a shorter month.
    addMonths(d, n) {
      const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
      t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()));
      return t;
    },
    init(root) {
      (root || document).querySelectorAll("[data-sm-calendar]").forEach(el => {
        if (el.dataset.smReady) return; el.dataset.smReady = "1";
        const range = el.dataset.smCalendar === "range";
        const ws = el.dataset.smWeekStart !== undefined ? Number(el.dataset.smWeekStart) : 1;
        const langEl = el.closest("[lang]"); const locale = (langEl && langEl.lang) || undefined;
        const target = el.dataset.smFor ? document.getElementById(el.dataset.smFor) : null;
        let start = null, end = null;
        const load = v => { [start, end] = (v || "").split("/").map(parseIso); start = start || null; end = range ? end || null : null; };
        load(el.dataset.value || (target && target.value));
        let focus = start || new Date();
        let view = new Date(focus.getFullYear(), focus.getMonth(), 1);
        const fMonth = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
        const fDay = new Intl.DateTimeFormat(locale, { weekday: "short" });
        const fLong = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
        el.innerHTML = `<div class="sm-calendar-head"><button type="button" class="sm-btn icon sm quiet" data-nav="-1" aria-label="Previous month">${CHEVRON("M15 6l-6 6 6 6")}</button><b aria-live="polite"></b><button type="button" class="sm-btn icon sm quiet" data-nav="1" aria-label="Next month">${CHEVRON("M9 6l6 6-6 6")}</button></div><table role="grid"><thead><tr></tr></thead><tbody></tbody></table>`;
        const label = el.querySelector("b"), head = el.querySelector("thead tr"), body = el.querySelector("tbody");
        const draw = focusIt => {
          const cells = SM.calendar.grid(view.getFullYear(), view.getMonth(), ws);
          const today = iso(new Date()), f = iso(focus), s = start && iso(start), e = end && iso(end);
          label.textContent = fMonth.format(view);
          head.innerHTML = cells.slice(0, 7).map(d => `<th scope="col">${fDay.format(d)}</th>`).join("");
          let html = "";
          cells.forEach((d, i) => {
            const k = iso(d), cls = [d.getMonth() !== view.getMonth() && "out", range && s && e && k > s && k < e && "in-range"].filter(Boolean).join(" ");
            if (i % 7 === 0) html += "<tr>";
            html += `<td><button type="button" data-day="${k}" tabindex="${k === f ? 0 : -1}" class="${cls}" aria-label="${fLong.format(d)}" aria-pressed="${k === s || k === e}"${k === today ? ' aria-current="date"' : ""}>${d.getDate()}</button></td>`;
            if (i % 7 === 6) html += "</tr>";
          });
          body.innerHTML = html;
          if (focusIt) body.querySelector('[tabindex="0"]').focus();
        };
        const moveTo = (d, focusIt) => { focus = d; view = new Date(d.getFullYear(), d.getMonth(), 1); draw(focusIt); };
        const choose = d => {
          if (!range || !start || end || d < start) { start = d; end = null; } else end = d;
          const value = range ? (start ? iso(start) : "") + (end ? "/" + iso(end) : "") : iso(start);
          el.dataset.value = value;
          if (target) { target.value = value; target.dispatchEvent(new Event("change", { bubbles: true })); }
          emit(el, "sm:change", { value, start: start && iso(start), end: end && iso(end) });
          moveTo(d, true);
          const pop = el.closest("[popover]");
          if (pop && pop.hidePopover && (!range || end)) pop.hidePopover();
        };
        el.querySelector(".sm-calendar-head").addEventListener("click", e => {
          const b = e.target.closest("[data-nav]"); if (!b) return;
          const n = Number(b.dataset.nav); focus = SM.calendar.addMonths(focus, n); view = SM.calendar.addMonths(view, n); draw(false);
        });
        body.addEventListener("click", e => { const b = e.target.closest("[data-day]"); if (b) choose(parseIso(b.dataset.day)); });
        body.addEventListener("keydown", e => {
          let step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
          const d = new Date(focus);
          if (step) { if (isRtl(el) && Math.abs(step) === 1) step = -step; d.setDate(d.getDate() + step); }
          else if (e.key === "PageUp" || e.key === "PageDown") { moveTo(SM.calendar.addMonths(focus, e.key === "PageUp" ? -1 : 1), true); e.preventDefault(); return; }
          else if (e.key === "Home") d.setDate(d.getDate() - (d.getDay() - ws + 7) % 7);
          else if (e.key === "End") d.setDate(d.getDate() + 6 - (d.getDay() - ws + 7) % 7);
          else return;
          e.preventDefault(); moveTo(d, true);
        });
        if (target) target.addEventListener("change", () => { if (target.value === el.dataset.value) return; load(target.value); if (start) moveTo(start, false); else draw(false); });
        draw(false);
      });
    }
  };

  /* ---------- number stepper ---------- */
  // <div class="sm-stepper" data-sm-stepper> with buttons data-step="-1" / "1" around an <input type="number" min max step>.
  SM.stepper = {
    init(root) {
      (root || document).querySelectorAll("[data-sm-stepper]").forEach(el => {
        if (el.dataset.smReady) return; el.dataset.smReady = "1";
        const input = el.querySelector("input"), btns = [...el.querySelectorAll("[data-step]")];
        const sync = () => btns.forEach(b => {
          const v = Number(input.value);
          b.disabled = Number(b.dataset.step) < 0 ? input.min !== "" && v <= Number(input.min) : input.max !== "" && v >= Number(input.max);
        });
        el.addEventListener("click", e => {
          const b = e.target.closest("[data-step]"); if (!b) return;
          if (input.value === "") input.value = input.min || 0;
          if (Number(b.dataset.step) < 0) input.stepDown(); else input.stepUp();
          input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true }));
        });
        input.addEventListener("input", sync); sync();
      });
    }
  };

  /* ---------- one-time code ---------- */
  // <div class="sm-otp" data-sm-otp="6"><input class="sm-input" name="code" aria-label="Verification code"></div>
  // The original input becomes hidden and keeps the joined value; one box per digit is drawn. Fires "sm:change" with { value, complete }.
  SM.otp = {
    init(root) {
      (root || document).querySelectorAll("[data-sm-otp]").forEach(el => {
        if (el.dataset.smReady) return; el.dataset.smReady = "1";
        const n = Number(el.dataset.smOtp) || 6, src = el.querySelector("input"); if (!src) return;
        const name = src.getAttribute("aria-label") || "Code"; const initial = src.value; src.type = "hidden";
        el.setAttribute("role", "group"); el.setAttribute("aria-label", name);
        const boxes = Array.from({ length: n }, (_, i) => {
          const b = document.createElement("input");
          b.className = "sm-input"; b.inputMode = "numeric"; b.autocomplete = i === 0 ? "one-time-code" : "off";
          b.setAttribute("aria-label", `Digit ${i + 1} of ${n}`); el.appendChild(b); return b;
        });
        const sync = () => { src.value = boxes.map(b => b.value).join(""); emit(el, "sm:change", { value: src.value, complete: src.value.length === n }); };
        // Typing, autofill and paste all land here: spread the digits from box i onwards.
        const fill = (i, text) => {
          const digits = String(text).replace(/\D/g, "").split("");
          if (!digits.length) { boxes[i].value = ""; sync(); return; }
          digits.slice(0, n - i).forEach((c, k) => { boxes[i + k].value = c; });
          boxes[Math.min(i + digits.length, n - 1)].focus(); sync();
        };
        boxes.forEach((b, i) => {
          b.addEventListener("focus", () => b.select());
          b.addEventListener("input", () => fill(i, b.value));
          b.addEventListener("paste", e => { e.preventDefault(); fill(i, (e.clipboardData || window.clipboardData).getData("text")); });
          b.addEventListener("keydown", e => {
            if (e.key === "Backspace" && !b.value && i > 0) { e.preventDefault(); boxes[i - 1].value = ""; boxes[i - 1].focus(); sync(); }
            else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); boxes[i - 1].focus(); }
            else if (e.key === "ArrowRight" && i < n - 1) { e.preventDefault(); boxes[i + 1].focus(); }
          });
        });
        if (initial) fill(0, initial);
      });
    }
  };

  /* ---------- password: reveal and strength ---------- */
  // <button class="sm-reveal" data-sm-reveal="input-id" aria-pressed="false">Show</button>
  // <div class="sm-strength" data-sm-strength="input-id"><span></span><span></span><span></span><span></span><b></b></div>
  const STRENGTH = ["Too short", "Weak", "Fair", "Good", "Strong"];
  SM.password = {
    // 0 under 8 characters, then one point each for 8+, 12+, mixed case, and a digit with a symbol.
    score(pw) {
      if (pw.length < 8) return 0;
      return 1 + (pw.length >= 12) + (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) + (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw));
    },
    init(root) {
      (root || document).querySelectorAll("[data-sm-strength]").forEach(m => {
        if (m.dataset.smReady) return; m.dataset.smReady = "1";
        const input = document.getElementById(m.dataset.smStrength), word = m.querySelector("b"); if (!input) return;
        m.setAttribute("aria-live", "polite");
        const draw = () => { const v = input.value; const s = v ? Math.min(4, SM.password.score(v)) : 0; m.dataset.level = v ? s : ""; if (word) word.textContent = v ? STRENGTH[s] : ""; };
        input.addEventListener("input", draw); draw();
      });
      if (SM.password.wired) return; SM.password.wired = true;
      document.addEventListener("click", e => {
        const b = e.target.closest("[data-sm-reveal]"); if (!b) return;
        const input = document.getElementById(b.dataset.smReveal); if (!input) return;
        const show = input.type === "password"; input.type = show ? "text" : "password"; b.setAttribute("aria-pressed", String(show));
      });
    }
  };

  /* ---------- money ---------- */
  // <input class="sm-input" data-sm-money inputmode="decimal" min="0" max="10000"> inside an .sm-input-group with the currency as affix.
  // Free text while typing; on blur the value is parsed in the page locale, clamped and shown formatted. The number is in data-value.
  SM.money = {
    parse(text, locale) {
      const dec = (new Intl.NumberFormat(locale).formatToParts(1.1).find(p => p.type === "decimal") || { value: "." }).value;
      let t = String(text).replace(new RegExp("[^0-9\\-" + (dec === "." ? "\\." : dec) + "]", "g"), "");
      if (dec !== ".") t = t.replace(dec, ".");
      const n = parseFloat(t); return isNaN(n) ? null : n;
    },
    format(n, locale, digits = 2) { return new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n); },
    init(root) {
      (root || document).querySelectorAll("input[data-sm-money]").forEach(input => {
        if (input.dataset.smReady) return; input.dataset.smReady = "1";
        const langEl = input.closest("[lang]"); const locale = input.dataset.smLocale || (langEl && langEl.lang) || undefined;
        const digits = input.dataset.smMoney === "" ? 2 : Number(input.dataset.smMoney);
        const tidy = () => {
          let n = SM.money.parse(input.value, locale);
          if (n === null) { delete input.dataset.value; input.value = ""; return; }
          const min = input.getAttribute("min"), max = input.getAttribute("max");
          if (min !== null) n = Math.max(n, Number(min)); if (max !== null) n = Math.min(n, Number(max));
          input.dataset.value = n; input.value = SM.money.format(n, locale, digits);
        };
        input.addEventListener("blur", tidy); if (input.value) tidy();
      });
    }
  };

  /* ---------- copy to clipboard ---------- */
  // <button data-sm-copy="text to copy"> or <button data-sm-copy data-sm-copy-target="element-id">.
  // A child with data-sm-copy-label shows "Copied" for two seconds; screen readers hear it too.
  SM.copy = {
    init() {
      document.addEventListener("click", async e => {
        const b = e.target.closest("[data-sm-copy]"); if (!b) return;
        const src = b.dataset.smCopyTarget && document.getElementById(b.dataset.smCopyTarget);
        const text = b.dataset.smCopy || (src ? ("value" in src && src.tagName !== "BUTTON" ? src.value : src.innerText) : "");
        const label = b.querySelector("[data-sm-copy-label]");
        let said = "Copied";
        try { await navigator.clipboard.writeText(text); } catch (err) { said = "Could not copy"; }
        announce(said);
        if (!label) return;
        if (!label.dataset.was) label.dataset.was = label.textContent;
        label.textContent = said; clearTimeout(b.smCopyTimer);
        b.smCopyTimer = setTimeout(() => { label.textContent = label.dataset.was; }, 2000);
      });
    }
  };

  /* ---------- page banner ---------- */
  // <div class="sm-banner" data-sm-banner="maintenance-oct"> with a .sm-banner-x button. A named banner stays dismissed.
  SM.banner = {
    init(root) {
      (root || document).querySelectorAll("[data-sm-banner]").forEach(b => {
        if (b.dataset.smReady) return; b.dataset.smReady = "1";
        const key = b.dataset.smBanner ? "sm-banner:" + b.dataset.smBanner : null;
        if (key && store.get(key)) { b.hidden = true; return; }
        const x = b.querySelector(".sm-banner-x");
        if (x) x.addEventListener("click", () => { b.hidden = true; if (key) store.set(key, "1"); });
      });
    }
  };

  /* ---------- truncation ---------- */
  // <span data-sm-truncate><span class="sm-truncate">long text</span></span>: when the text is cut, the wrapper
  // becomes focusable and shows the full text as a tooltip. <button data-sm-expand="id"> opens a .sm-clamp block.
  SM.truncate = {
    init(root) {
      (root || document).querySelectorAll("[data-sm-truncate]").forEach(w => {
        if (w.dataset.smReady) return; w.dataset.smReady = "1";
        const inner = w.firstElementChild || w;
        const check = () => {
          const cut = inner.scrollWidth > inner.clientWidth + 1 || inner.scrollHeight > inner.clientHeight + 1;
          if (cut) { w.dataset.tip = inner.textContent.trim(); w.tabIndex = 0; }
          else { delete w.dataset.tip; w.removeAttribute("tabindex"); }
        };
        check(); if (window.ResizeObserver) new ResizeObserver(check).observe(inner);
      });
      if (SM.truncate.wired) return; SM.truncate.wired = true;
      document.addEventListener("click", e => {
        const b = e.target.closest("[data-sm-expand]"); if (!b) return;
        const t = document.getElementById(b.dataset.smExpand); if (!t) return;
        const open = t.classList.toggle("open"); b.setAttribute("aria-expanded", String(open));
        if (!b.dataset.more) b.dataset.more = b.textContent;
        b.textContent = open ? b.dataset.less || "Show less" : b.dataset.more;
      });
    }
  };

  /* ---------- carousel ---------- */
  // <div class="sm-carousel" data-sm-carousel> with a .sm-carousel-track and buttons data-sm-prev / data-sm-next.
  SM.carousel = {
    init(root) {
      (root || document).querySelectorAll("[data-sm-carousel]").forEach(c => {
        if (c.dataset.smReady) return; c.dataset.smReady = "1";
        const track = c.querySelector(".sm-carousel-track"), prev = c.querySelector("[data-sm-prev]"), next = c.querySelector("[data-sm-next]");
        if (!track) return;
        const go = d => track.scrollBy({ left: d * (isRtl(c) ? -1 : 1) * track.clientWidth * 0.85, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        const sync = () => { const x = Math.abs(track.scrollLeft); if (prev) prev.disabled = x < 2; if (next) next.disabled = x + track.clientWidth >= track.scrollWidth - 2; };
        if (prev) prev.addEventListener("click", () => go(-1));
        if (next) next.addEventListener("click", () => go(1));
        track.addEventListener("scroll", sync, { passive: true }); sync();
      });
    }
  };

  /* ---------- data table: sort, select, bulk actions ---------- */
  // <table class="sm-table" data-sm-table id="t">: <th aria-sort="none"><button class="sm-sort">Name</button></th> sorts by that
  // column (a cell's data-sort wins over its text). A header checkbox data-sm-select-all and row checkboxes data-sm-select-row
  // select rows; <div class="sm-bulk-bar" data-sm-bulk-for="t" hidden> shows while any are on, with [data-sm-bulk-count] and [data-sm-bulk-clear].
  SM.table = {
    compare(a, b) {
      const na = Number(a), nb = Number(b);
      if (a !== "" && b !== "" && !isNaN(na) && !isNaN(nb)) return na - nb;
      return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
    },
    init(root) {
      (root || document).querySelectorAll("table[data-sm-table]").forEach(t => {
        if (t.dataset.smReady) return; t.dataset.smReady = "1";
        const body = t.tBodies[0]; if (!body) return;
        t.querySelectorAll("th .sm-sort").forEach(btn => btn.addEventListener("click", () => {
          const th = btn.closest("th"), col = th.cellIndex;
          const dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
          t.querySelectorAll("th[aria-sort]").forEach(h => h.setAttribute("aria-sort", "none"));
          th.setAttribute("aria-sort", dir);
          const key = r => { const c = r.cells[col]; return c ? (c.dataset.sort !== undefined ? c.dataset.sort : c.textContent.trim()) : ""; };
          [...body.rows].sort((a, b) => SM.table.compare(key(a), key(b)) * (dir === "ascending" ? 1 : -1)).forEach(r => body.appendChild(r));
          emit(t, "sm:sort", { column: col, dir });
        }));
        const all = t.querySelector("[data-sm-select-all]");
        const rows = () => [...t.querySelectorAll("[data-sm-select-row]")];
        const bar = t.id ? document.querySelector(`[data-sm-bulk-for="${t.id}"]`) : null;
        const sync = () => {
          const boxes = rows(), on = boxes.filter(b => b.checked);
          boxes.forEach(b => b.closest("tr").classList.toggle("selected", b.checked));
          if (all) { all.checked = on.length > 0 && on.length === boxes.length; all.indeterminate = on.length > 0 && on.length < boxes.length; }
          if (bar) { bar.hidden = !on.length; const c = bar.querySelector("[data-sm-bulk-count]"); if (c) c.textContent = on.length; }
          emit(t, "sm:selection", { rows: on.map(b => b.closest("tr")) });
        };
        t.addEventListener("change", e => {
          if (e.target === all) rows().forEach(b => { b.checked = all.checked; });
          if (e.target === all || e.target.matches("[data-sm-select-row]")) sync();
        });
        if (bar) bar.addEventListener("click", e => { if (e.target.closest("[data-sm-bulk-clear]")) { rows().forEach(b => { b.checked = false; }); sync(); } });
        if (all || bar) sync();
      });
    }
  };

  SM.init = root => {
    SM.tabs.init(root); SM.menu.init(root); SM.contextMenu.init(root); SM.palette.init(root); SM.tagInput.init(root); SM.file.init(root);
    SM.counter.init(root); SM.validate.init(root); SM.calendar.init(root); SM.stepper.init(root); SM.otp.init(root); SM.password.init(root);
    SM.money.init(root); SM.banner.init(root); SM.truncate.init(root); SM.carousel.init(root); SM.table.init(root);
  };
  SM.theme.init(); SM.chips.init(); SM.dialog.init(); SM.popover.init(); SM.copy.init();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => SM.init()); else SM.init();
  window.SwissMoss = SM;
})();
