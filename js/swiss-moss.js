/* Swiss Moss 1.0.0 behaviours. No dependencies. Apache-2.0.
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

  /* ---------- menu button (ARIA menu pattern) ---------- */
  // Markup: <div class="sm-menu" data-sm-menu> <button aria-haspopup="menu" aria-expanded="false" aria-controls="id">
  // and <ul class="sm-menu-list" id="id" role="menu" hidden> with role=menuitem or menuitemradio buttons inside.
  // Fires "sm:select" on the menu element with { item, value } (value is data-value, else the text).
  SM.menu = {
    init(root) {
      // init(element) also wires the element itself, so a menu added after load can be passed straight in.
      const r = root || document;
      [...(r.matches && r.matches("[data-sm-menu]") ? [r] : []), ...r.querySelectorAll("[data-sm-menu]")].forEach(menu => {
        if (menu.dataset.smReady) return; menu.dataset.smReady = "1";
        const trigger = menu.querySelector("[aria-haspopup]");
        const list = menu.querySelector("[role=menu]");
        if (!trigger || !list) return;
        const items = () => [...list.querySelectorAll("[role^=menuitem]")];
        const isOpen = () => !list.hidden;
        const open = where => {
          list.hidden = false; trigger.setAttribute("aria-expanded", "true");
          const all = items();
          (where === "last" ? all[all.length - 1] : all.find(i => i.getAttribute("aria-checked") === "true") || all[0]).focus();
        };
        const close = refocus => { list.hidden = true; trigger.setAttribute("aria-expanded", "false"); if (refocus) trigger.focus(); };
        trigger.addEventListener("click", () => (isOpen() ? close(false) : open()));
        trigger.addEventListener("keydown", e => {
          if (e.key === "ArrowDown") { e.preventDefault(); open(); }
          else if (e.key === "ArrowUp") { e.preventDefault(); open("last"); }
        });
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
          if (item.getAttribute("role") === "menuitemradio") items().filter(i => i.getAttribute("role") === "menuitemradio").forEach(i => i.setAttribute("aria-checked", String(i === item)));
          menu.dispatchEvent(new CustomEvent("sm:select", { detail: { item, value: item.dataset.value !== undefined ? item.dataset.value : item.textContent.trim() }, bubbles: true }));
          close(true);
        });
        document.addEventListener("click", e => { if (isOpen() && !menu.contains(e.target)) close(false); });
        menu.addEventListener("focusout", e => { if (isOpen() && e.relatedTarget && !menu.contains(e.relatedTarget)) close(false); });
      });
    }
  };

  SM.init = root => { SM.tabs.init(root); SM.menu.init(root); SM.tagInput.init(root); SM.file.init(root); SM.counter.init(root); SM.validate.init(root); };
  SM.theme.init(); SM.chips.init(); SM.dialog.init();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => SM.init()); else SM.init();
  window.SwissMoss = SM;
})();
