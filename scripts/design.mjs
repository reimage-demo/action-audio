import {
  serviceContent,
  electronicsCategories,
} from "../shared/service-content.js";
import { stores } from "../shared/catalog.js";
const arrow = '<span aria-hidden="true">↗</span>';
const serviceLink = (s) => `/${s.id}.html`;
const photo = (s, cls = "") =>
  `<img class="${cls}" src="/assets/${s.image}" alt="${s.alt}" loading="lazy" width="800" height="600">`;
const bookingLink = (s) =>
  `/book.html?service=${s.booking}&topic=${encodeURIComponent(s.name)}`;
export const wordmark =
  '<img src="/assets/action-audio-logo.webp" width="189" height="70" alt="The Action Audio Store">';
export const navigation = `<a class="skip" href="#main">Skip to content</a><header><div class="nav wrap"><a href="/" class="logo" aria-label="Action Audio home">${wordmark}</a><nav id="navigation" aria-label="Main navigation"><a href="/electronics.html">Electronics</a><a href="/services.html">Services</a><a href="/about.html">Our story</a><a href="/locations.html">Visit us</a><a class="mobile-track" href="/track.html">Track my vehicle</a></nav><div class="nav-actions"><a class="track-link" href="/track.html">Track my vehicle</a><a class="button small" href="/book.html">Let’s talk <span aria-hidden="true">↗</span></a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="navigation">Menu</button></div></div></header>`;
export const footer = `<footer><div class="wrap footer-grid"><div><a class="logo" href="/" aria-label="Action Audio home">${wordmark}</a><p>Better sound. Smarter upgrades.<br>Your local specialists since 1983.</p></div><div><h3>Explore</h3><a href="/electronics.html">Electronics</a><a href="/services.html">Services</a><a href="/about.html">Our story</a></div><div><h3>Your visit</h3><a href="/book.html">Book an appointment</a><a href="/track.html">Track your vehicle</a><a href="/locations.html">Our locations</a></div><div><h3>Let’s talk</h3><a class="footer-phone" href="tel:8606676330">(860) 667-6330</a><p>Wethersfield · Mon–Sat, 9am–6pm<br>Sunday closed</p></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} The Action Audio Store.</span><a href="/privacy.html">Privacy</a><p class="powered-by">Powered by <a href="https://reimagebs.com" target="_blank" rel="noopener noreferrer">REIMAGE BUSINESS SOLUTIONS</a></p></div></footer>`;
export const contactStrip = `<section class="contact-strip wrap" aria-label="Store addresses, hours, and phone"><a href="/wethersfield.html"><span class="micro-label">Wethersfield ${arrow}</span><strong>105 Silas Deane Hwy</strong><span>Wethersfield, CT 06109</span></a><a href="/hartford.html"><span class="micro-label">Hartford ${arrow}</span><strong>2814 Main Street</strong><span>Hartford, CT 06120</span></a><div><span class="micro-label">Store hours</span><strong>Mon–Sat · 9am–6pm</strong><span>Sunday closed</span></div><a href="tel:8606676330"><span class="micro-label">Call Wethersfield ${arrow}</span><strong>(860) 667-6330</strong><span>Let’s plan your next upgrade</span></a></section>`;
const slides = [
  {
    image: "hero-installation.webp",
    alt: "Illustrative technician installing subwoofers and an amplifier",
    label: "CAR AUDIO & INSTALLATION",
    title: "Good music deserves great sound.",
    link: "/car-audio.html",
    cta: "Explore car audio",
  },
  {
    image: "hero-remote-start.webp",
    alt: "Illustrative remote-start key fob in front of a silver SUV",
    label: "REMOTE STARTERS",
    title: "Comfort, before you get in.",
    link: "/remote-starters.html",
    cta: "Explore remote starters",
  },
  {
    image: "hero-interior.webp",
    alt: "Premium vehicle interior with a door speaker",
    label: "ELECTRONICS FOR YOUR EVERYDAY",
    title: "A little upgrade. A better drive.",
    link: "/electronics.html",
    cta: "Explore electronics",
  },
];
export function homePage() {
  return `<section class="home-hero" aria-labelledby="hero-title"><div class="hero-intro wrap"><p class="eyebrow">CONNECTICUT ROOTS. SINCE 1983.</p><h1 id="hero-title">Your drive. <span>Upgraded.</span></h1><p>Better sound. A smarter start. A ride that feels like you.</p><div class="hero-actions"><a class="button" href="/electronics.html">Explore electronics <span aria-hidden="true">↗</span></a><a class="text-link" href="/services.html">Find your service <span aria-hidden="true">→</span></a></div></div><div class="slideshow wrap" role="region" aria-roledescription="carousel" aria-label="Featured vehicle upgrades"><div class="slides">${slides.map((s, i) => `<article class="hero-slide${i === 0 ? " is-active" : ""}" data-slide="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}"${i ? " hidden" : ""}><img src="/assets/${s.image}" alt="${s.alt}" width="1800" height="1000" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}><div class="slide-shade"></div><div class="slide-copy"><p>${s.label}</p><h2>${s.title}</h2><a href="${s.link}">${s.cta} <span aria-hidden="true">↗</span></a></div></article>`).join("")}</div><div class="slide-controls"><button type="button" class="slide-prev" aria-label="Previous slide">‹</button><div class="slide-dots">${slides.map((s, i) => `<button type="button" data-slide-to="${i}" aria-label="Show slide ${i + 1}: ${s.label.toLowerCase()}" aria-pressed="${i === 0}"><span></span></button>`).join("")}</div><button type="button" class="slide-next" aria-label="Next slide">›</button><span class="control-divider"></span><button type="button" class="slide-play" aria-label="Pause slideshow">Ⅱ</button></div><span class="image-note">Illustrative imagery</span><span class="sr-only slide-status" aria-live="polite"></span></div></section>${contactStrip}
<section class="section wrap"><div class="section-heading"><div><p class="eyebrow">BUILT AROUND YOUR RIDE</p><h2>Small changes.<br>Big difference.</h2></div><p>From your first speaker upgrade to your next remote starter, let’s make every mile feel better.</p></div><div class="feature-grid">${[serviceContent[0], serviceContent[1]].map((s, i) => `<a class="feature-card" href="${serviceLink(s)}"><div class="feature-photo">${photo(s)}</div><div class="feature-copy"><span class="eyebrow">${i ? "READY WHEN YOU ARE" : "FEEL EVERY NOTE"}</span><h3>${s.name}</h3><p>${i ? "A more comfortable start to every journey." : "Bring your favorite music to life."}</p><span class="round-arrow" aria-hidden="true">↗</span></div></a>`).join("")}</div></section>
<section class="soft-section"><div class="wrap section"><div class="section-heading"><div><p class="eyebrow">FIND YOUR NEXT UPGRADE</p><h2>Great gear. Expert guidance.</h2></div><a class="text-link" href="/electronics.html">All electronics <span aria-hidden="true">→</span></a></div><div class="category-showcase">${[
    ["Speakers", "alpine-s2-s65.webp", "The details you’ve been missing."],
    ["Subwoofers", "rockford-p3d4-12.webp", "Bass you can feel."],
    ["Amplifiers", "rockford-r2-500x1.webp", "Give your system more."],
    ["Receivers", "kenwood-dmx4707s.webp", "Your dashboard, reimagined."],
  ]
    .map(
      ([name, img, desc]) =>
        `<a href="/electronics.html?category=${name}" class="gear-card"><img src="/assets/products/${img}" alt="${name} manufacturer example" width="350" height="260" loading="lazy"><div><h3>${name} ${arrow}</h3><p>${desc}</p></div></a>`,
    )
    .join(
      "",
    )}</div><p class="catalog-disclaimer">Manufacturer examples shown. Ask us about compatibility, pricing, and availability.</p></div></section>
<section class="section wrap"><div class="section-heading"><div><p class="eyebrow">MORE THAN GREAT SOUND</p><h2>Care for the whole experience.</h2></div><a class="text-link" href="/services.html">All services <span aria-hidden="true">→</span></a></div><div class="care-grid">${[serviceContent[8], serviceContent[9], serviceContent[10]].map((s, i) => `<a class="care-card" href="${serviceLink(s)}"><span class="service-number">0${i + 1}</span><h3>${s.name}</h3><p>${["Get your electronics back on track.", "A fresh look for the ride you love.", "The right fit. The finishing touches."][i]}</p><span class="text-link">Explore service ${arrow}</span></a>`).join("")}</div></section>
<section class="heritage wrap"><div><p class="eyebrow">YOUR LOCAL SPECIALISTS</p><h2>Technology moves fast.<br>Good service stays.</h2><p>From our beginnings as a CB radio shop in 1983 to today’s mobile electronics, we’ve grown with the way Connecticut drives.</p><a class="text-link" href="/about.html">Get to know Action Audio <span aria-hidden="true">→</span></a></div><div class="heritage-year"><span>CONNECTICUT ORIGINAL</span><strong>Since<br>1983.</strong><span>HARTFORD · WETHERSFIELD</span></div></section>
<section class="wrap"><div class="final-cta"><div><p class="eyebrow">LET’S MAKE IT YOURS</p><h2>Your next upgrade starts here.</h2><p>Tell us about your vehicle. We’ll help with the rest.</p></div><a class="button" href="/book.html">Plan your visit ${arrow}</a></div></section>`;
}
export function electronicsPage() {
  return `<section class="page-heading centered wrap"><p class="eyebrow">FIND YOUR NEXT UPGRADE</p><h1>Electronics.<br><span>Made for your drive.</span></h1><p>Explore the possibilities. Find your fit. Let’s bring it all together.</p></section><section class="wrap section inventory-section"><div class="category-pills" role="group" aria-label="Electronics categories"><button type="button" data-category="" aria-pressed="true">All electronics</button>${electronicsCategories.map((c) => `<button type="button" data-category="${c}" aria-pressed="false">${c === "Security" ? "Car alarms" : c}</button>`).join("")}</div><div class="filters"><label class="search-field"><span class="sr-only">Search electronics</span><input id="inventory-search" type="search" placeholder="Search products or brands"></label><select id="inventory-category" aria-label="Filter by electronics category"><option value="">All categories</option>${["Car audio", "Speakers", "Subwoofers", "Amplifiers", "Receivers", ...electronicsCategories.slice(1)].map((c) => `<option>${c}</option>`).join("")}</select><select id="inventory-store" aria-label="Filter by store"><option value="">Both stores</option>${stores.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select></div><div id="category-guide" hidden></div><p id="inventory-count" class="muted" aria-live="polite"></p><div id="inventory-results" class="product-grid" aria-live="polite"><div class="empty-state"><h2>Loading electronics…</h2><p>Explore equipment and ask our team about your vehicle.</p></div></div><div class="brand-panel"><span class="eyebrow">BRANDS YOU KNOW. GUIDANCE YOU CAN COUNT ON.</span><p>Alpine <span>Rockford Fosgate</span> Pioneer <span>Kenwood</span> MTX</p><small>Product compatibility and availability vary by vehicle and store.</small></div></section>`;
}
export function servicesPage() {
  return `<section class="page-heading centered wrap"><p class="eyebrow">THOUGHTFUL WORK. EVERY DETAIL.</p><h1>Good hands.<br><span>Great possibilities.</span></h1><p>From sound and comfort to repairs and detailing.<br>Explore what’s possible for your vehicle.</p></section><section class="wrap service-directory">${serviceContent.map((s, i) => `<a class="directory-card" id="${s.id}" href="${serviceLink(s)}"><div class="directory-photo${s.product ? " is-product" : ""}">${photo(s)}</div><div class="directory-copy"><span class="eyebrow">${s.tag}</span><h2>${s.name} ${arrow}</h2><p>${s.description}</p><span class="text-link">Explore service →</span></div></a>`).join("")}</section><section class="wrap"><div class="final-cta"><div><h2>Have something else in mind?</h2><p>Tell us what you’re planning. We’ll help you find the next step.</p></div><a href="/book.html" class="button">Let’s talk ${arrow}</a></div></section>`;
}
export function detailPages() {
  return Object.fromEntries(
    serviceContent.map((s) => [
      `${s.id}.html`,
      {
        title: `${s.name} in Hartford & Wethersfield | Action Audio`,
        desc: s.description,
        body: `<section class="wrap detail-hero"><div><a class="breadcrumb" href="/services.html">← All services</a><p class="eyebrow">${s.name}</p><h1>${s.headline.replace("\n", "<br>")}</h1><p class="detail-description">${s.description}</p><a class="button" href="${bookingLink(s)}">Talk about ${s.name.toLowerCase()} ${arrow}</a></div><figure class="detail-image${s.product ? " is-product" : ""}">${photo(s)}<figcaption>${s.product ? "Manufacturer example. Application and compatibility must be confirmed." : "Illustrative imagery"}</figcaption></figure></section><section class="wrap detail-body"><div><p class="eyebrow">LET’S FIND YOUR FIT</p><h2>${s.tag}.</h2><p>${s.detail}</p><ul class="check-list">${s.items.map((x) => `<li>${x}</li>`).join("")}</ul></div><aside class="prepare-card"><span class="eyebrow">BEFORE YOUR VISIT</span><h3>A little detail goes a long way.</h3><p>${s.prepare}</p><a class="text-link" href="tel:8606676330">(860) 667-6330 ↗</a><small>Wethersfield · Mon–Sat, 9am–6pm</small></aside></section><section class="wrap faq-section"><h2>A few things to know.</h2>${s.faq.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join("")}</section><section class="wrap"><div class="final-cta"><div><h2>Let’s talk about your ride.</h2><p>Choose Hartford or Wethersfield. Our team will confirm the details.</p></div><a class="button" href="${bookingLink(s)}">Plan your visit ${arrow}</a></div></section>`,
      },
    ]),
  );
}
