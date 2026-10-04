/* ==========================================================================
   Casa de Carnes Cruzado — interações e efeitos
   ========================================================================== */
(() => {
  "use strict";

  const C = window.CRUZADO || {};
  const root = document.documentElement;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- WhatsApp ---------- */
  const phone = String(C.whatsapp || "").replace(/\D/g, "");
  // "5500000000000" (o padrão do config) conta como não configurado
  const hasPhone = /[1-9]/.test(phone.slice(2));
  const waUrl = (msg) =>
    `https://wa.me/${phone}?text=${encodeURIComponent(msg || C.mensagemPadrao || "")}`;
  const linkWhatsApp = (el, msg) => {
    if (!hasPhone) return; // mantém o link original (#contato) até o número ser configurado
    el.href = waUrl(msg);
    el.target = "_blank";
    el.rel = "noopener";
  };
  $$("[data-whatsapp]").forEach((el) => linkWhatsApp(el, el.dataset.msg));

  /* ---------- Dados da loja (config.js) ---------- */
  $$("[data-config]").forEach((el) => {
    const value = C[el.dataset.config];
    if (typeof value === "string" && value) el.textContent = value;
  });

  const hours = $("[data-hours]");
  if (hours && Array.isArray(C.horarios) && C.horarios.length) {
    hours.replaceChildren(
      ...C.horarios.map(([day, time]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = day;
        dd.textContent = time;
        row.append(dt, dd);
        return row;
      })
    );
  }

  const maps = $("[data-maps]");
  if (maps) {
    const query = [C.endereco, C.cidade].filter(Boolean).join(", ");
    maps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  const insta = String(C.instagram || "").replace(/^@/, "").trim();
  if (insta) {
    const item = $("[data-instagram]");
    const link = $("[data-instagram-link]");
    if (item && link) {
      link.href = `https://instagram.com/${encodeURIComponent(insta)}`;
      link.textContent = `@${insta}`;
      item.hidden = false;
    }
  }

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Preloader / entrada do hero ---------- */
  const markLoaded = () => {
    const wait = reduceMotion ? 0 : Math.max(0, 700 - performance.now());
    setTimeout(() => root.classList.add("is-loaded"), wait);
  };
  if (document.readyState === "complete") markLoaded();
  else window.addEventListener("load", markLoaded, { once: true });
  setTimeout(() => root.classList.add("is-loaded"), 2500); // garantia

  /* ---------- Menu móvel ---------- */
  const toggle = $(".nav-toggle");
  const menu = $("#menu-mobile");
  const setMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      menu.hidden = false;
      void menu.offsetWidth; // força o reflow para a transição rodar
      menu.classList.add("is-open");
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => {
        if (!menu.classList.contains("is-open")) menu.hidden = true;
      }, 700);
    }
  };
  toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu?.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu?.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- Revelar ao rolar ---------- */
  const settle = (el) => {
    el.classList.remove("reveal", "is-in");
    el.style.removeProperty("--d");
  };
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
          el.classList.add("is-in");
          io.unobserve(el);
          // depois de revelado, devolve o elemento às próprias transições (hover etc.)
          setTimeout(() => settle(el), 1200 + delay * 1000);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => {
      const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
      const index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty("--d", `${Math.min(index, 6) * 0.08}s`);
      io.observe(el);
    });
  } else {
    revealEls.forEach(settle);
  }

  /* ---------- Rolagem: nav, barra de progresso, manifesto, botão flutuante ---------- */
  const nav = $("[data-nav]");
  const waFloat = $(".wa-float");
  const manifesto = $("[data-words]");
  let words = [];

  if (manifesto) {
    const split = (node, extraClass) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.append(document.createTextNode(" "));
              return;
            }
            const span = document.createElement("span");
            span.className = extraClass ? `w ${extraClass}` : "w";
            span.textContent = part;
            frag.append(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          split(child, child.className);
        }
      });
    };
    split(manifesto);
    words = $$(".w", manifesto);
    if (reduceMotion) words.forEach((w) => w.classList.add("is-lit"));
  }

  const updateManifesto = () => {
    if (!words.length || reduceMotion) return;
    const rect = manifesto.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.85;
    const end = vh * 0.4;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (rect.height + start - end)));
    const lit = Math.round(progress * words.length);
    words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
  };

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    root.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : "0");
    nav?.classList.toggle("is-scrolled", y > 24);
    waFloat?.classList.toggle("is-visible", y > window.innerHeight * 0.8);
    updateManifesto();
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- Link ativo na navegação ---------- */
  const navLinks = $$(".nav-links a");
  if ("IntersectionObserver" in window && navLinks.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) =>
            a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    navLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean)
      .forEach((section) => spy.observe(section));
  }

  /* ---------- Passos "Como pedir" ---------- */
  const steps = $("[data-steps]");
  if (steps) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const stepsIO = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            steps.classList.add("is-in");
            stepsIO.disconnect();
          }
        },
        { threshold: 0.35 }
      );
      stepsIO.observe(steps);
    } else {
      steps.classList.add("is-in");
    }
  }

  /* ---------- Efeitos de ponteiro (somente mouse) ---------- */
  if (finePointer) {
    // Borda/brilho que segue o cursor nos cards
    $$("[data-spotlight]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  if (finePointer && !reduceMotion) {
    // Botões magnéticos
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.32;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });

    // Emblema 3D
    const tilt = $("[data-tilt]");
    const hero = $(".hero");
    if (tilt && hero) {
      hero.addEventListener("pointermove", (e) => {
        const r = tilt.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        tilt.style.transform = `rotateY(${dx * 26}deg) rotateX(${-dy * 26}deg)`;
      });
      hero.addEventListener("pointerleave", () => (tilt.style.transform = ""));
    }

    // Brilho vermelho que acompanha o cursor
    const glow = $(".cursor-glow");
    if (glow) {
      let tx = window.innerWidth / 2;
      let ty = window.innerHeight / 2;
      let cx = tx;
      let cy = ty;
      let running = false;
      const loop = () => {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) requestAnimationFrame(loop);
        else running = false;
      };
      window.addEventListener(
        "pointermove",
        (e) => {
          tx = e.clientX;
          ty = e.clientY;
          root.classList.add("has-cursor");
          if (!running) {
            running = true;
            requestAnimationFrame(loop);
          }
        },
        { passive: true }
      );
      document.documentElement.addEventListener("pointerleave", () => root.classList.remove("has-cursor"));
    }
  }

  /* ---------- Ripple nos botões ---------- */
  if (!reduceMotion) {
    document.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - r.left - size / 2}px`;
      ripple.style.top = `${e.clientY - r.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  }

  /* ---------- Filtros da vitrine ---------- */
  const filters = $(".filters");
  if (filters) {
    const indicator = $(".filters-indicator", filters);
    const buttons = $$(".filter", filters);
    const cards = $$("[data-products] .card-product");
    const empty = $(".products-empty");

    const moveIndicator = (btn) => {
      indicator.style.width = `${btn.offsetWidth}px`;
      indicator.style.height = `${btn.offsetHeight}px`;
      indicator.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
    };
    const active = () => buttons.find((b) => b.classList.contains("is-active")) || buttons[0];

    const apply = (cat) => {
      let shown = 0;
      cards.forEach((card) => {
        const match = cat === "todos" || card.dataset.cat === cat;
        card.classList.toggle("is-hidden", !match);
        card.classList.remove("is-entering");
        if (!match) return;
        settle(card);
        if (!reduceMotion) {
          void card.offsetWidth;
          card.style.animationDelay = `${shown * 70}ms`;
          card.classList.add("is-entering");
        }
        shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
    };

    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        buttons.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        moveIndicator(btn);
        apply(btn.dataset.filter);
      })
    );

    moveIndicator(active());
    document.fonts?.ready.then(() => moveIndicator(active()));
    window.addEventListener("resize", () => moveIndicator(active()), { passive: true });
  }

  /* ---------- Calculadora do kit churrasco ---------- */
  const range = $("#pessoas");
  if (range) {
    const peopleEl = $("[data-people]");
    const kgEl = $("[data-kg]");
    const gppEl = $("[data-gpp]");
    const kitBtn = $("[data-kit]");
    const grams = Number(C.gramasPorPessoa) || 400;
    const fmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (gppEl) gppEl.textContent = grams;

    const update = () => {
      const n = Number(range.value);
      const kg = fmt.format((n * grams) / 1000);
      const min = Number(range.min);
      const max = Number(range.max);
      peopleEl.textContent = n;
      kgEl.textContent = `${kg} kg`;
      range.style.setProperty("--fill", `${((n - min) / (max - min)) * 100}%`);
      linkWhatsApp(
        kitBtn,
        `Olá, Casa de Carnes Cruzado! Quero montar um kit churrasco para ${n} pessoas (cerca de ${kg} kg de carne). Podem me ajudar a escolher os cortes?`
      );
    };
    range.addEventListener("input", update);
    update();
  }

  /* ---------- Formulário de pedido ---------- */
  const form = $("[data-order-form]");
  if (form) {
    const rules = {
      nome: (v) => v.trim().length >= 2 || "Informe seu nome.",
      telefone: (v) => {
        const d = v.replace(/\D/g, "");
        return (d.length >= 10 && d.length <= 11) || "Informe um WhatsApp válido com DDD.";
      },
      pedido: (v) => v.trim().length >= 3 || "Conte o que você gostaria de pedir.",
    };

    const validate = (input) => {
      const result = rules[input.name](input.value);
      const ok = result === true;
      const field = input.closest(".field");
      const msg = $(`[data-msg-for="${input.name}"]`, form);
      field.classList.toggle("is-error", !ok);
      field.classList.toggle("is-success", ok);
      input.setAttribute("aria-invalid", String(!ok));
      if (msg) msg.textContent = ok ? "Tudo certo." : result;
      return ok;
    };

    const tel = form.elements.telefone;
    tel.addEventListener("input", () => {
      const d = tel.value.replace(/\D/g, "").slice(0, 11);
      let out = d;
      if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 6) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
      tel.value = out;
    });

    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener("blur", () => {
        if (input.value) validate(input);
      });
      input.addEventListener("input", () => {
        if (input.closest(".field").matches(".is-error, .is-success")) validate(input);
      });
    });

    const label = $("[data-submit-label]", form);
    const defaultLabel = label.textContent;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const valid = Object.keys(rules).map((name) => validate(form.elements[name]));
      if (valid.includes(false)) {
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      if (!hasPhone) {
        label.textContent = "WhatsApp da loja ainda não configurado";
        console.warn("Cruzado: configure o número do WhatsApp em assets/js/config.js");
        setTimeout(() => (label.textContent = defaultLabel), 3500);
        return;
      }
      const f = form.elements;
      const message = [
        "Olá, Casa de Carnes Cruzado! Quero fazer um pedido.",
        "",
        `*Nome:* ${f.nome.value.trim()}`,
        `*WhatsApp:* ${f.telefone.value.trim()}`,
        `*Tipo:* ${f.tipo.value}`,
        `*Pedido:* ${f.pedido.value.trim()}`,
      ].join("\n");
      window.open(waUrl(message), "_blank", "noopener");
      label.textContent = "Abrindo o WhatsApp…";
      setTimeout(() => (label.textContent = defaultLabel), 3000);
    });
  }
})();
