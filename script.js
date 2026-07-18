/* ===========================================================
   Ирис — цветочная лавка
   script.js
=========================================================== */
(() => {
  "use strict";

  /* -----------------------------------------------------------
     Data
  ----------------------------------------------------------- */
  const BOUQUETS = [
    {
      id: "b1",
      name: "Дикое поле",
      category: "wild",
      tag: "Полевой",
      price: 8900,
      color: "#C97B84",
      desc: "Космея, маттиола, ромашка и злаки — букет, будто сорванный по дороге домой.",
    },
    {
      id: "b2",
      name: "Нежность пиона",
      category: "classic",
      tag: "Классика",
      price: 14500,
      color: "#E7B8C0",
      desc: "Крупные пионы кремовых и розовых оттенков, собранные плотным купольным букетом.",
    },
    {
      id: "b3",
      name: "Городской сад",
      category: "wild",
      tag: "Полевой",
      price: 9700,
      color: "#C9A227",
      desc: "Ранункулюсы, эустома и веточки эвкалипта — компактно и живо, как городской двор весной.",
    },
    {
      id: "b4",
      name: "Ирис моно",
      category: "mono",
      tag: "Монобукет",
      price: 7200,
      color: "#5B6E4F",
      desc: "Девять ирисов в чистом виде — тот самый цветок, в честь которого названа лавка.",
    },
    {
      id: "b5",
      name: "Белая сирень",
      category: "classic",
      tag: "Классика",
      price: 11300,
      color: "#F1ECDD",
      desc: "Сирень, астильба и эвкалипт — воздушный букет для тех, кто любит светлые тона.",
    },
    {
      id: "b6",
      name: "Дельфиниум монобукет",
      category: "mono",
      tag: "Монобукет",
      price: 8300,
      color: "#6E8168",
      desc: "Высокие синие соцветия дельфиниума — эффектный жест без лишних деталей.",
    },
  ];

  const REVIEWS = [
    { name: "Алина К.", role: "заказала «Дикое поле»", text: "Букет держался почти две недели и правда пах полем, а не магазином. Заказывала на день рождения подруги — она была в восторге." },
    { name: "Марат Т.", role: "заказал «Ирис моно»", text: "Привезли точно в оговорённый час, курьер аккуратно донёс до двери. Ирисы были свежайшие, распустились на второй день." },
    { name: "Ольга П.", role: "заказала «Нежность пиона»", text: "Собирают действительно вручную — видно по тому, как продуманы переходы оттенков. Возьму ещё на годовщину." },
  ];

  const money = (n) => n.toLocaleString("ru-RU") + " ₽";

  /* -----------------------------------------------------------
     Bouquet illustration (procedural SVG so every card is unique)
  ----------------------------------------------------------- */
  function bouquetSVG(color) {
    return `
      <svg viewBox="0 0 200 170" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="170" fill="var(--sage)"/>
        <g transform="translate(100,120)">
          <ellipse cx="0" cy="34" rx="46" ry="8" fill="var(--ink)" opacity="0.1"/>
          <path d="M0 34 L-6 -30 M0 34 L6 -35 M0 34 L0 -40" stroke="#5B6E4F" stroke-width="3" fill="none" stroke-linecap="round"/>
          <g>
            <circle cx="0" cy="-42" r="26" fill="${color}"/>
            <circle cx="-28" cy="-24" r="20" fill="${color}" opacity="0.85"/>
            <circle cx="28" cy="-26" r="20" fill="${color}" opacity="0.85"/>
            <circle cx="-14" cy="-58" r="16" fill="${color}" opacity="0.7"/>
            <circle cx="18" cy="-60" r="16" fill="${color}" opacity="0.7"/>
            <circle cx="0" cy="-42" r="8" fill="var(--gold)"/>
          </g>
        </g>
      </svg>`;
  }

  /* -----------------------------------------------------------
     Render catalog
  ----------------------------------------------------------- */
  const catalogGrid = document.getElementById("catalogGrid");

  function renderCatalog(filter = "all") {
    const items = filter === "all" ? BOUQUETS : BOUQUETS.filter(b => b.category === filter);
    catalogGrid.innerHTML = items.map(b => `
      <article class="bouquet-card" data-id="${b.id}">
        <div class="bouquet-media">
          <span class="bouquet-tag">${b.tag}</span>
          ${bouquetSVG(b.color)}
        </div>
        <div class="bouquet-body">
          <h3>${b.name}</h3>
          <p class="bouquet-desc">${b.desc}</p>
          <div class="bouquet-foot">
            <span class="bouquet-price">${money(b.price)}</span>
            <button class="add-btn" data-id="${b.id}">В корзину</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      renderCatalog(btn.dataset.filter);
    });
  });

  renderCatalog();

  /* Populate the "which bouquet" select in the order form */
  const bouquetSelect = document.getElementById("bouquet");
  BOUQUETS.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = `${b.name} — ${money(b.price)}`;
    bouquetSelect.appendChild(opt);
  });

  /* -----------------------------------------------------------
     Cart
  ----------------------------------------------------------- */
  const cart = new Map(); // id -> qty

  const cartToggle = document.getElementById("cartToggle");
  const cartClose = document.getElementById("cartClose");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartCountEl = document.getElementById("cartCount");

  function openCart() {
    cartDrawer.classList.add("is-open");
    cartOverlay.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartToggle.setAttribute("aria-expanded", "true");
  }
  function closeCart() {
    cartDrawer.classList.remove("is-open");
    cartOverlay.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartToggle.setAttribute("aria-expanded", "false");
  }
  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  function addToCart(id) {
    cart.set(id, (cart.get(id) || 0) + 1);
    renderCart();
  }
  function changeQty(id, delta) {
    const next = (cart.get(id) || 0) + delta;
    if (next <= 0) cart.delete(id);
    else cart.set(id, next);
    renderCart();
  }
  function removeFromCart(id) {
    cart.delete(id);
    renderCart();
  }

  function renderCart() {
    if (cart.size === 0) {
      cartItemsEl.innerHTML = `<p class="cart-empty">Пока пусто. Загляните в каталог — там ждут пионы 🌸</p>`;
    } else {
      cartItemsEl.innerHTML = [...cart.entries()].map(([id, qty]) => {
        const b = BOUQUETS.find(x => x.id === id);
        return `
          <div class="cart-item" data-id="${id}">
            <div class="cart-item-thumb" style="background:${b.color}"></div>
            <div class="cart-item-info">
              <h4>${b.name}</h4>
              <div class="cart-item-price">${money(b.price)}</div>
              <div class="cart-item-qty">
                <button class="qty-btn" data-action="dec" aria-label="Уменьшить количество">−</button>
                <span>${qty}</span>
                <button class="qty-btn" data-action="inc" aria-label="Увеличить количество">+</button>
              </div>
            </div>
            <button class="cart-remove" data-action="remove">Удалить</button>
          </div>`;
      }).join("");
    }

    const count = [...cart.values()].reduce((a, b) => a + b, 0);
    const total = [...cart.entries()].reduce((sum, [id, qty]) => sum + BOUQUETS.find(x => x.id === id).price * qty, 0);

    cartTotalEl.textContent = money(total);
    cartCountEl.textContent = count;
  }

  catalogGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    addToCart(btn.dataset.id);
    btn.textContent = "Добавлено ✓";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "В корзину";
      btn.classList.remove("added");
    }, 1200);
    openCart();
  });

  cartItemsEl.addEventListener("click", (e) => {
    const itemEl = e.target.closest(".cart-item");
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    const action = e.target.dataset.action;
    if (action === "inc") changeQty(id, 1);
    if (action === "dec") changeQty(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  renderCart();

  /* -----------------------------------------------------------
     Reviews
  ----------------------------------------------------------- */
  const reviewsTrack = document.getElementById("reviewsTrack");
  reviewsTrack.innerHTML = REVIEWS.map(r => `
    <article class="review-card">
      <div class="review-stars" aria-label="Оценка 5 из 5">★★★★★</div>
      <p>${r.text}</p>
      <div class="review-name">${r.name}</div>
      <div class="review-role">${r.role}</div>
    </article>
  `).join("");

  /* -----------------------------------------------------------
     Hero flower field (signature animated element)
  ----------------------------------------------------------- */
  const heroField = document.getElementById("heroField");
  const fieldColors = ["#C97B84", "#C9A227", "#A8B89A", "#6E8168", "#E7B8C0"];

  function buildFlower(x, y, scale, color, delay) {
    return `
      <svg class="field-flower" style="left:${x}%; bottom:${y}%; width:${34 * scale}px; height:${34 * scale}px; animation-delay:${delay}s;" viewBox="0 0 40 40">
        <path d="M20 20 C20 8, 30 8, 20 20 C30 8, 32 18, 20 20 C32 18, 30 30, 20 20 C30 30, 20 32, 20 20 C20 32, 10 30, 20 20 C10 30, 8 18, 20 20 C8 18, 10 8, 20 20"
          fill="${color}" opacity="0.85"/>
        <circle cx="20" cy="20" r="4.5" fill="var(--gold)"/>
      </svg>`;
  }

  let flowersHTML = "";
  for (let i = 0; i < 16; i++) {
    const x = Math.random() * 96;
    const y = Math.random() * 22;
    const scale = 0.6 + Math.random() * 1.1;
    const color = fieldColors[Math.floor(Math.random() * fieldColors.length)];
    const delay = Math.random() * 4;
    flowersHTML += buildFlower(x, y, scale, color, delay);
  }
  heroField.innerHTML = flowersHTML;

  /* -----------------------------------------------------------
     Order form validation (client-side demo — no backend)
  ----------------------------------------------------------- */
  const orderForm = document.getElementById("orderForm");
  const formStatus = document.getElementById("formStatus");

  function setError(field, msg) {
    const el = orderForm.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = msg || "";
  }

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const name = orderForm.name.value.trim();
    const phone = orderForm.phone.value.trim();

    if (name.length < 2) {
      setError("name", "Введите имя (минимум 2 символа)");
      valid = false;
    } else {
      setError("name", "");
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("phone", "Проверьте номер телефона");
      valid = false;
    } else {
      setError("phone", "");
    }

    if (!valid) {
      formStatus.textContent = "Пожалуйста, проверьте поля выше.";
      formStatus.style.color = "var(--rose-deep)";
      return;
    }

    formStatus.style.color = "var(--sage-dark)";
    formStatus.textContent = `Спасибо, ${name}! Заявка принята — мы позвоним на ${phone} в течение 30 минут.`;
    orderForm.reset();
  });

  /* -----------------------------------------------------------
     Misc
  ----------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
