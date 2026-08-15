


const state = {
  config: null,
  categories: [],
  types: [],
  products: [],
  offers: [],
  cart: JSON.parse(localStorage.getItem('legend_cart') || '[]'),
};

const app = document.getElementById('app');

/* ===== Data Loading ===== */
async function loadData() {
  const [config, categories, types, products, offers] = await Promise.all([
    fetch('/api/config').then(r => r.json()),
    fetch('/api/categories').then(r => r.json()),
    fetch('/api/types').then(r => r.json()),
    fetch('/api/products').then(r => r.json()),
    fetch('/api/offers').then(r => r.json())
  ]);

  state.config = config;

  state.categories = categories.sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  state.types = types;
  state.products = products;
  state.offers = offers;

  console.log('OFFERS:', state.offers);

  const aboutText = document.getElementById('aboutText');

  if (aboutText) {
    aboutText.textContent = config.aboutText || '';
  }

  buildSideNav();
}
function buildSideNav() {
  const list = document.getElementById('sideNavList');

  list.innerHTML = `
    <li><a href="#/">الرئيسية</a></li>

    <li><a href="#/offers">العروضات</a></li>

    ${state.categories.map(c => `
      <li>
        <a href="#/category/${c.id}">${c.name}</a>
      </li>
    `).join('')}

    <li><a href="#contact">تواصل معنا</a></li>
  `;
}

/* ===== Router ===== */
function parseHash() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) {
    return { view: 'home' };
  }

  if (parts[0] === 'category') {
    return {
      view: 'category',
      id: parts[1]
    };
  }

  if (parts[0] === 'offers') {
    return {
      view: 'offers'
    };
  }

  if (parts[0] === 'type') {
    return {
      view: 'type',
      id: parts[1]
    };
  }

  if (parts[0] === 'contact') {
    return {
      view: 'contact'
    };
  }

  return {
    view: 'home'
  };
}

function render() {
  const route = parseHash();

  closeSideNav();
  closeCart();

  if (route.view === 'home') {
    renderHome();
  } else if (route.view === 'offers') {
    renderOffersView();
  } else if (route.view === 'category') {
    renderCategoryView(route.id);
  } else if (route.view === 'type') {
    renderTypeView(route.id);
  } else if (route.view === 'contact') {
    renderContact();
  }

  window.scrollTo({
    top: 0,
    behavior: 'auto'
  });

  requestAnimationFrame(setupScrollReveal);
}

window.addEventListener('hashchange', render);

/* ===== Views ===== */
function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-bg" style="background-image:url('/images/backg.jpg')"></div>
      <div class="hero-scrim"></div>
      <div class="hero-content">
        <span class="hero-eyebrow">LUXURY STREETWEAR</span>
        <h1 class="hero-word">LEGEND</h1>
        <p class="hero-word-ar">أناقة لا تُنسى</p>
        <p class="hero-tagline">${state.config.aboutText}</p>
        <a href="#categories" class="btn btn-gold">تسوّق الآن</a>
      </div>
    </section>

    <section class="section" id="categories">
      <span class="eyebrow">تسوّق حسب القسم</span>
      <h2 class="section-title">الأقسام</h2>
      <div class="stitch"></div>
      <div class="grid cols-3">
        ${state.categories.map(cat => `
          <a href="#/category/${cat.id}" class="tile">
            <img src="${cat.image}" alt="${cat.name}" loading="lazy">
            <div class="tile-label">
              <span class="name">${cat.name}</span>
              <span class="cta">اكتشف المجموعة ←</span>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
    

    </section>
    <section class="section offers-section">
  <span class="eyebrow">خصومات LEGEND</span>
  <h2 class="section-title">العروضات</h2>
  <div class="stitch"></div>

  <a href="#/offers" class="offers-card">
    <div class="offers-card-content">
      <span class="offers-badge">SPECIAL OFFER</span>
      <h3>عروض LEGEND</h3>
      <p>اكتشف القطع المختارة بأسعار مميزة</p>
      <span class="offers-btn">تصفح العروض ←</span>
    </div>
  </a>
</section>
  `;
  
}
function renderOffers() {
  const offerProducts = state.products.filter(p => p.offer === true);

  app.innerHTML = `
    <section class="section">

      <nav class="breadcrumb">
        <a href="#/">الرئيسية</a>
        <span class="sep">/</span>
        <span class="current">العروضات</span>
      </nav>

      <span class="eyebrow">✦ عروض LEGEND</span>

      <h2 class="section-title">العروضات</h2>

      <div class="stitch"></div>

      ${
        offerProducts.length
          ? productGrid(offerProducts)
          : emptyState('لا توجد عروض حاليًا')
      }

    </section>
  `;

  requestAnimationFrame(setupScrollReveal);
}

function renderCategoryView(catId) {
  const category = state.categories.find(c => c.id === catId);
  if (!category) return renderHome();
  const relatedTypes = state.types.filter(t => t.categoryId === catId);

  app.innerHTML = `
    <section class="section">
      <nav class="breadcrumb">
        <a href="#/">الرئيسية</a><span class="sep">/</span><span class="current">${category.name}</span>
      </nav>
      <span class="eyebrow">${category.name}</span>
      <h2 class="section-title">اختر النوع</h2>
      <div class="stitch"></div>
      <div class="grid cols-3">
        ${relatedTypes.map(t => `
          <a href="#/type/${t.id}" class="tile">
            <img src="${t.image}" alt="${t.name}" loading="lazy">
            <div class="tile-label">
              <span class="name">${t.name}</span>
              <span class="cta">عرض المنتجات ←</span>
            </div>
          </a>
        `).join('') || emptyState('لا توجد أنواع بعد في هذا القسم')}
      </div>
    </section>
  `;
}

function renderTypeView(typeId) {
  const type = state.types.find(t => t.id === typeId);
  if (!type) return renderHome();
  const category = state.categories.find(c => c.id === type.categoryId);
  const products = state.products.filter(p => p.typeId === typeId);

  app.innerHTML = `
    <section class="section">
      <nav class="breadcrumb">
        <a href="#/">الرئيسية</a><span class="sep">/</span>
        <a href="#/category/${category.id}">${category.name}</a><span class="sep">/</span>
        <span class="current">${type.name}</span>
      </nav>
      <span class="eyebrow">${category.name}</span>
      <h2 class="section-title">${type.name}</h2>
      <div class="stitch"></div>
      ${productGrid(products)}
    </section>
  `;
}
function renderOffersView() {
  const activeOffers = state.offers.filter(
    offer => offer.active !== false
  );

  app.innerHTML = `
    <section class="section">

      <nav class="breadcrumb">
        <a href="#/">الرئيسية</a>
        <span class="sep">/</span>
        <span class="current">العروضات</span>
      </nav>

      <span class="eyebrow">✦ عروض LEGEND</span>

      <h2 class="section-title">العروضات</h2>

      <div class="stitch"></div>

      ${
        activeOffers.length
          ? `
            <div class="product-grid">
              ${activeOffers.map(offer => `
                <article
                  class="product-card offer-card"
                  data-open-offer="${offer.id}"
                >

                  <div class="product-thumb">
                    <img
                      src="${offer.image}"
                      alt="${offer.name}"
                      loading="lazy"
                    >

                    <span class="offer-badge">
                      عرض خاص
                    </span>
                  </div>

                  <div class="product-info">

                    <h3 class="product-name">
                      ${offer.name}
                    </h3>

                    <p class="offer-description">
                      ${offer.description || ''}
                    </p>

                    <div class="product-price">
                      $${offer.price}
                    </div>

                    <div class="offer-quantity">
                      ${offer.quantity} قطع
                    </div>

                  </div>

                </article>
              `).join('')}
            </div>
          `
          : emptyState('لا توجد عروض حاليًا')
      }

    </section>
  `;

  requestAnimationFrame(setupScrollReveal);
}

/* ===== Contact Page ===== */
function renderContact() {
  closeCart();
  app.innerHTML = `
    <section class="section contact-section">
      <span class="eyebrow">✦ تواصل</span>
      <h1 class="section-title">نحن هنا لخدمتك</h1>
      <div class="stitch in-view" style="--w:0%;"></div>
      <p style="color:var(--grey);max-width:560px;margin-bottom:44px;line-height:1.9;font-size:15px;">
        يسعدنا سماع رأيك أو الرد على استفساراتك. تواصل معنا بأي وقت وسنرد عليك بأسرع وقت.
      </p>

      <div class="contact-grid">
        <div class="contact-card">
          <form id="contactForm" class="contact-form">
            <div class="form-group">
              <label for="contactName">الاسم الكامل</label>
              <input type="text" id="contactName" name="name" placeholder="مثال: محمد الأمين" required>
            </div>
            <div class="form-group">
              <label for="contactEmail">البريد الإلكتروني</label>
              <input type="email" id="contactEmail" name="email" placeholder="example@mail.com" required>
            </div>
            <div class="form-group">
              <label for="contactPhone">رقم الهاتف (اختياري)</label>
              <input type="tel" id="contactPhone" name="phone" placeholder="70 123 456">
            </div>
            <div class="form-group">
              <label for="contactSubject">الموضوع</label>
              <input type="text" id="contactSubject" name="subject" placeholder="موضوع رسالتك">
            </div>
            <div class="form-group">
              <label for="contactMessage">الرسالة</label>
              <textarea id="contactMessage" name="message" rows="5" placeholder="اكتب رسالتك هنا..." required></textarea>
            </div>
            <button type="submit" class="btn btn-gold btn-block">إرسال الرسالة</button>
          </form>
        </div>

        <div class="contact-card contact-info">
          <h3 style="font-family:var(--font-ar-head);font-size:20px;font-weight:600;margin:0 0 24px;color:var(--gold);">
            معلومات التواصل
          </h3>
          
          <div class="contact-item">
            <span class="contact-icon">📍</span>
            <div>
              <strong>العنوان</strong>
              <p> الهرمل-سوق الضيعة-مقابل ضريح صبري بيك</p>
            </div>
          </div>
          
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <div>
              <strong>الهاتف</strong>
              <p>+96178947818</p>
            </div>
          </div>
          
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <div>
              <strong>البريد الإلكتروني</strong>
              <p>info@legend-store.com</p>
            </div>
          </div>
          
          <div class="contact-item">
            <span class="contact-icon">🕐</span>
            <div>
              <strong>ساعات العمل</strong>
              <p>الاثنين - السبت: ١٠ ص - ١٠ م</p>
              <p style="margin-top:2px;color:var(--grey);">الأحد: مغلق</p>
            </div>
          </div>

          <div style="margin-top:32px;padding-top:24px;border-top:1px solid var(--line);">
            <p style="font-family:var(--font-ar-head);color:var(--gold);font-size:14px;margin:0 0 14px;text-align:center;">
              تابعنا على وسائل التواصل
            </p>
            <div class="social-links">
              <a href="#" aria-label="إنستغرام">📷 إنستغرام</a>
              <a href="#" aria-label="فيسبوك">👍 فيسبوك</a>
              <a href="#" aria-label="واتساب">💬 واتساب</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', handleContactSubmit);
  }
}

function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  
  const name = data.get('name');
  const email = data.get('email');
  const phone = data.get('phone') || 'غير مذكور';
  const subject = data.get('subject') || 'استفسار عام';
  const message = data.get('message');

  const whatsappMessage = `
📩 *رسالة جديدة من موقع Legend*

*الاسم:* ${name}
*البريد:* ${email}
*الهاتف:* ${phone}
*الموضوع:* ${subject}

*الرسالة:*
${message}
  `;

  const phoneNumber = '96178947818';
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  window.open(url, '_blank');

  showToast('✅ تم إرسال رسالتك! سنتواصل معك قريباً.');
  form.reset();
}

/* ===== Helpers ===== */
function productGrid(products) {
  if (!products.length) {
    return emptyState('لا توجد منتجات هنا حاليًا');
  }

  return `
    <div class="product-grid">
      ${products.map(p => `
        <article
          class="product-card"
          data-open-product="${p.id}"
          role="button"
          tabindex="0"
        >

          <div class="product-thumb">
            <img
              src="${p.colors?.[0]?.image || ''}"
              alt="${p.name}"
              loading="lazy"
            >
          </div>

          <div class="product-info">
            <h3 class="product-name">${p.name}</h3>

            <div class="product-price">
              $${p.price}
            </div>

            <div class="product-swatches">
              ${(p.colors || []).map(c => `
                <span
                  class="swatch"
                  style="background:${c.hex}"
                  title="${c.name}"
                ></span>
              `).join('')}
            </div>

          </div>

        </article>
      `).join('')}
    </div>
  `;
}

function emptyState(text) {
  return `<div class="empty-state"><div class="glyph">L</div><p>${text}</p></div>`;
}

/* ===== Scroll Reveal ===== */
let observer;
function setupScrollReveal() {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.tile, .product-card, .stitch').forEach(el => observer.observe(el));
}

/* ===== Side Nav ===== */
const sideNav = document.getElementById('sideNav');
const scrim = document.getElementById('scrim');
document.getElementById('menuBtn').addEventListener('click', () => {
  sideNav.classList.add('open');
  scrim.classList.add('show');
});
document.getElementById('closeNav').addEventListener('click', closeSideNav);
scrim.addEventListener('click', closeSideNav);

function closeSideNav() {
  sideNav.classList.remove('open');
  scrim.classList.remove('show');
}

/* ===== Cart ===== */
function saveCart() {
  localStorage.setItem('legend_cart', JSON.stringify(state.cart));
}

function cartCount() {
  return state.cart.reduce((sum, i) => sum + i.qty, 0);
}

function cartTotal() {
  return state.cart.reduce((sum, i) => sum + i.qty * i.price, 0);
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const count = cartCount();
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);

  const itemsEl = document.getElementById('cartItems');
  const checkoutBtn = document.getElementById('checkoutBtn');
  document.getElementById('cartTotal').textContent = `$${cartTotal()}`;
  checkoutBtn.disabled = state.cart.length === 0;

  if (!state.cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty">سلتك فارغة حاليًا<br>ابدأ التسوّق واختر قطعتك المفضلة</div>`;
    return;
  }

  itemsEl.innerHTML = state.cart.map(item => `
    <div class="cart-item" data-cart-id="${item.cartId}">
      <img src="${item.image}" alt="${item.name}">
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-meta">
 ${item.isOffer
  ? `
    <div class="offer-cart-details">
      <span>🎁 عرض خاص</span>

      ${
        (item.selections || []).map((selection, index) => `
          <div class="offer-cart-item">
            <strong>القطعة${index + 1}</strong>
            <span>اللون: ${selection.color}</span>
            <span>المقاس: ${selection.size}</span>
          </div>
        `).join('')
      }
    </div>
  `
  : `
    <span>اللون: ${item.color}</span>
    <span>المقاس: ${item.size}</span>
  `
}
</div>
        <div class="ci-row">
          <div class="ci-qty">
            <button data-qty="-1">−</button>
            <span>${item.qty}</span>
            <button data-qty="1">+</button>
          </div>
          <span class="ci-price">$${item.qty * item.price}</span>
        </div>
        <button class="ci-remove" data-remove>إزالة</button>
      </div>
    </div>
  `).join('');
}

const cartDrawer = document.getElementById('cartDrawer');
const cartScrim = document.getElementById('cartScrim');
document.getElementById('cartBtn').addEventListener('click', () => {
  cartDrawer.classList.add('open');
  cartScrim.classList.add('show');
});
document.getElementById('closeCart').addEventListener('click', closeCart);
cartScrim.addEventListener('click', closeCart);

function closeCart() {
  cartDrawer.classList.remove('open');
  cartScrim.classList.remove('show');
}

document.getElementById('cartItems').addEventListener('click', (e) => {
  const row = e.target.closest('.cart-item');
  if (!row) return;
  const cartId = row.dataset.cartId;
  const item = state.cart.find(i => i.cartId === cartId);
  if (!item) return;

  if (e.target.matches('[data-qty]')) {
    const delta = parseInt(e.target.dataset.qty, 10);
    item.qty = Math.max(1, item.qty + delta);
  } else if (e.target.matches('[data-remove]')) {
    state.cart = state.cart.filter(i => i.cartId !== cartId);
  } else return;

  saveCart();
  updateCartUI();
});
function addToCart(product, color, size, qty) {
  const cartId = `${product.id}__${color}__${size}`;

  const existing = state.cart.find(
    item => item.cartId === cartId
  );

  if (existing) {
    existing.qty += qty;
  } else {
    const colorObj = product.colors.find(
      c => c.name === color
    );

    state.cart.push({
      cartId,
      productId: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      color,
      size,
      qty,
      image: colorObj ? colorObj.image : ''
    });
  }

  saveCart();
  updateCartUI();

  showToast('تمت الإضافة إلى السلة');
}
function addOfferToCart(offer, selections, qty) {

  const cartId =
    `offer__${offer.id}__${Date.now()}`;

  state.cart.push({
    cartId,

    isOffer: true,

    offerId: offer.id,

    productId: null,

    name: offer.name,

    price: offer.price,

    qty,

    image: offer.image,

    selections: selections.map(item => ({
      color: item.color,
      size: item.size
    }))
  });

  saveCart();
  updateCartUI();

  showToast(
    `تمت إضافة ${offer.name} إلى السلة`
  );
}
/* ===== Product Modal ===== */
const productModalScrim = document.getElementById('productModalScrim');
console.log('MODAL SCRIM:', productModalScrim);
const productModal = document.getElementById('productModal');
let modalOpen = false;

app.addEventListener('click', (e) => {
  const productCard = e.target.closest('[data-open-product]');
  if (productCard) {
    openProductModal(productCard.dataset.openProduct);
    return;
  }
const offerCard = e.target.closest('[data-open-offer]');

if (offerCard) {
  const offerId = offerCard.dataset.openOffer;

  const offer = state.offers.find(
    o => String(o.id) === String(offerId)
  );

  if (!offer) {
    console.log('Offer not found:', offerId);
    return;
  }

  openOfferModal(offer);
  return;
}
});

function openOfferModal(offer) {
  let qty = 1;

  const selections = Array.from(
    { length: offer.quantity },
    () => ({
      color: '',
      size: ''
    })
  );

  function renderOfferModal() {
    productModal.innerHTML = `
      <div class="pm-grid">

        <div class="pm-image-wrap">
          <button class="icon-btn pm-close" data-close-modal>
            &times;
          </button>

          <img
            src="${offer.image}"
            alt="${offer.name}"
          >
        </div>

        <div class="pm-body">

          <div>
            <span class="offer-label">
              عرض خاص
            </span>

            <h2 class="pm-name">
              ${offer.name}
            </h2>

            <div class="pm-price">
              $${offer.price}
            </div>
          </div>

          <p class="pm-desc">
            ${offer.description || ''}
          </p>

          <div class="pm-field">

            <label>
              اختر تفاصيل كل قطعة
            </label>

            <div class="offer-items">

              ${selections.map((item, index) => `
                <div class="offer-item">

                  <h4>
                    القطعة ${index + 1}
                  </h4>

                  <label>
                    اللون
                  </label>

                  <div class="pm-colors">

                    ${(offer.colors || []).map(color => `
                      <button
                        type="button"
                        class="pm-color ${
                          item.color === color.name ? 'active' : ''
                        }"
                        style="background:${color.hex}"
                        data-offer-color="${index}"
                        data-color="${color.name}"
                        title="${color.name}"
                      ></button>
                    `).join('')}

                  </div>

                  <div class="selected-option">
                    ${item.color || 'اختر اللون'}
                  </div>

                  <label>
                    المقاس
                  </label>

                  <div class="pm-sizes">

                    ${(offer.sizes || []).map(size => `
                      <button
                        type="button"
                        class="pm-size ${
                          item.size === size ? 'active' : ''
                        }"
                        data-offer-size="${index}"
                        data-size="${size}"
                      >
                        ${size}
                      </button>
                    `).join('')}

                  </div>

                </div>
              `).join('')}

            </div>

          </div>

          <div class="pm-field">

            <label>
              الكمية
            </label>

            <div class="pm-qty">

              <button
                class="qty-btn"
                data-offer-qty="-1"
              >
                −
              </button>

              <span class="qty-value">
                ${qty}
              </span>

              <button
                class="qty-btn"
                data-offer-qty="1"
              >
                +
              </button>

            </div>

          </div>

          <div class="pm-actions">

            <button
              class="btn btn-gold btn-block"
              data-add-offer
            >
              إضافة العرض إلى السلة
            </button>

          </div>

        </div>
      </div>
    `;

    /* إغلاق النافذة */
    productModal
      .querySelector('[data-close-modal]')
      .addEventListener('click', closeProductModal);

    /* اختيار اللون */
    productModal
      .querySelectorAll('[data-offer-color]')
      .forEach(btn => {

        btn.addEventListener('click', () => {

          const index = Number(
            btn.dataset.offerColor
          );

          selections[index].color =
            btn.dataset.color;

          renderOfferModal();
        });

      });

    /* اختيار المقاس */
    productModal
      .querySelectorAll('[data-offer-size]')
      .forEach(btn => {

        btn.addEventListener('click', () => {

          const index = Number(
            btn.dataset.offerSize
          );

          selections[index].size =
            btn.dataset.size;

          renderOfferModal();
        });

      });

    /* زيادة / نقصان الكمية */
    productModal
      .querySelectorAll('[data-offer-qty]')
      .forEach(btn => {

        btn.addEventListener('click', () => {

          qty = Math.max(
            1,
            qty + Number(btn.dataset.offerQty)
          );

          renderOfferModal();
        });

      });

    /* إضافة العرض */
    productModal
      .querySelector('[data-add-offer]')
      .addEventListener('click', () => {

        const incomplete = selections.some(
          item => !item.color || !item.size
        );

        if (incomplete) {
          showToast(
            'الرجاء اختيار اللون والمقاس لكل قطعة'
          );
          return;
        }

        addOfferToCart(
          offer,
          selections,
          qty
        );

        closeProductModal();
      });
  }

  renderOfferModal();

  productModalScrim.classList.add('show');

  modalOpen = true;

  history.pushState(
    { modal: 'offer' },
    ''
  );
}
function openProductModal(productId) {
  console.log('OPEN PRODUCT MODAL:', productId);
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  let selectedColor = product.colors[0].name;
  let selectedSize = null;
  let qty = 1;

  function paint() {
    const colorObj = product.colors.find(c => c.name === selectedColor);
    productModal.innerHTML = `
      <div class="pm-grid">
        <div class="pm-image-wrap">
          <button class="icon-btn pm-close" data-close-modal>&times;</button>
          <img src="${colorObj.image}" alt="${product.name} - ${selectedColor}">
        </div>
        <div class="pm-body">
          <div>
            <h2 class="pm-name">${product.name}</h2>
            <div class="pm-price">$${product.price}</div>
          </div>
          <p class="pm-desc">${product.description}</p>

          <div class="pm-field">
            <label>اللون: ${selectedColor}</label>
            <div class="pm-colors">
              ${product.colors.map(c => `
                <button class="pm-color ${c.name === selectedColor ? 'active' : ''}" style="background:${c.hex}" data-color="${c.name}" title="${c.name}"></button>
              `).join('')}
            </div>
          </div>

          <div class="pm-field">
            <label>المقاس ${selectedSize ? '' : '(اختر مقاسًا)'}</label>
            <div class="pm-sizes">
              ${product.sizes.map(s => `<button class="pm-size ${s === selectedSize ? 'active' : ''}" data-size="${s}">${s}</button>`).join('')}
            </div>
          </div>

          <div class="pm-field">
            <label>الكمية</label>
            <div class="pm-qty">
              <button class="qty-btn" data-qty="-1">−</button>
              <span class="qty-value">${qty}</span>
              <button class="qty-btn" data-qty="1">+</button>
            </div>
          </div>

          <div class="pm-actions">
            <button class="btn btn-gold btn-block" data-add-to-cart>إضافة إلى السلة</button>
          </div>
        </div>
      </div>
    `;

    productModal.querySelectorAll('[data-color]').forEach(btn => {
      btn.addEventListener('click', () => { selectedColor = btn.dataset.color; paint(); });
    });
    productModal.querySelectorAll('[data-size]').forEach(btn => {
      btn.addEventListener('click', () => { selectedSize = btn.dataset.size; paint(); });
    });
    productModal.querySelectorAll('[data-qty]').forEach(btn => {
      btn.addEventListener('click', () => {
        qty = Math.max(1, qty + parseInt(btn.dataset.qty, 10));
        paint();
      });
    });
    productModal.querySelector('[data-close-modal]').addEventListener('click', closeProductModal);
    productModal.querySelector('[data-add-to-cart]').addEventListener('click', () => {
      if (!selectedSize) { showToast('الرجاء اختيار المقاس أولًا'); return; }
      addToCart(product, selectedColor, selectedSize, qty);
      closeProductModal();
    });
  }

  paint();
 productModalScrim.classList.add('show');
 console.log('AFTER SHOW:', productModalScrim.className);

console.log(
  'MODAL CLASSES:',
  productModalScrim.className
);

console.log(
  'MODAL DISPLAY:',
  getComputedStyle(productModalScrim).display
);

console.log(
  'MODAL VISIBILITY:',
  getComputedStyle(productModalScrim).visibility
);

console.log(
  'MODAL OPACITY:',
  getComputedStyle(productModalScrim).opacity
);

modalOpen = true;
history.pushState({ modal: 'product' }, '');
}

function closeProductModal() {
  productModalScrim.classList.remove('show');
  modalOpen = false;
}

productModalScrim.addEventListener('click', (e) => {
  if (e.target === productModalScrim) closeProductModal();
});

window.addEventListener('popstate', () => {
  if (modalOpen) closeProductModal();
});

/* ===== Checkout ===== */
const checkoutModalScrim = document.getElementById('checkoutModalScrim');
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (!state.cart.length) return;
  checkoutModalScrim.classList.add('show');
});
document.getElementById('closeCheckout').addEventListener('click', closeCheckout);
checkoutModalScrim.addEventListener('click', (e) => {
  if (e.target === checkoutModalScrim) closeCheckout();
});

function closeCheckout() {
  checkoutModalScrim.classList.remove('show');
}

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const customer = Object.fromEntries(formData.entries());

  const order = {
    customer,
    items: state.cart,
    total: cartTotal(),
  };

  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  } catch (err) {
    console.error('order log failed', err);
  }

  const message = buildWhatsAppMessage(order);
  const phone = state.config.whatsappNumber;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');

  state.cart = [];
  saveCart();
  updateCartUI();
  closeCheckout();
  closeCart();
  e.target.reset();
  showToast('تم إرسال طلبك، تابع المحادثة على واتساب');
});

function buildWhatsAppMessage(order) {
  const lines = [];
  lines.push(`طلب جديد من موقع ${state.config.storeName}`);
  lines.push('');
  lines.push(`الاسم: ${order.customer.name}`);
  lines.push(`الهاتف: ${order.customer.phone}`);
  lines.push(`المدينة: ${order.customer.city}`);
  lines.push(`العنوان: ${order.customer.address}`);
  if (order.customer.notes) lines.push(`ملاحظات: ${order.customer.notes}`);
  lines.push('');
  lines.push('تفاصيل الطلب:');
 order.items.forEach((item, i) => {

  if (item.isOffer) {
  lines.push(`${i + 1}. عرض خاص: ${item.name}`);

  (item.selections || []).forEach((selection, index) => {
    lines.push(
      `   القطعة${index + 1}: اللون: ${selection.color} — المقاس: ${selection.size}`
    );
  });

  lines.push(
    `   الكمية: ${item.qty} — السعر: $${item.price * item.qty}`
  );


  } else {

    lines.push(
      `${i + 1}. ${item.name} — اللون: ${item.color} — المقاس: ${item.size} — الكمية: ${item.qty} — السعر: $${item.price * item.qty}`
    );

  }

});
  lines.push('');
  lines.push(`المجموع الكلي: $${order.total}`);
  return lines.join('\n');
}

/* ===== Toast ===== */
function showToast(text) {
  const oldToast = document.querySelector('.toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/* ===== Init ===== */
document.getElementById('year').textContent = new Date().getFullYear();

(async function init() {
  await loadData();
  updateCartUI();
  render();
})();