import { imageMarkup } from "../shared/images.js";
import { seoServices } from "./seo.mjs";
import {
  serviceContent,
  electronicsCategories,
} from "../shared/service-content.js";
import { stores, serviceStore } from "../shared/catalog.js";
const arrow = "";
const serviceLink = (s) => `/${s.id}.html`;
const photo = (s, cls = "", eager = false) => imageMarkup(s.image,s.alt,{className:cls,eager,sizes:eager?"(max-width: 760px) calc(100vw - 36px), 640px":"(max-width: 760px) calc(100vw - 36px), 430px"});
const bookingLink = (s) =>
  `/book.html?store=${serviceStore(s.booking).id}&service=${s.booking}&topic=${encodeURIComponent(s.name)}`;
export const wordmark =
  imageMarkup("action-audio-logo.webp","The Action Audio Store",{sizes:"189px",eager:true,priority:"auto"});
export const navigation = `<a class="skip" href="#main">Skip to content</a><header><div class="nav wrap"><a href="/" class="logo" aria-label="Action Audio home">${wordmark}</a><nav id="navigation" aria-label="Main navigation"><a href="/electronics.html">Electronics</a><a href="/services.html">Services</a><a href="/about.html">Our story</a><a href="/locations.html">Visit us</a><a class="mobile-track" href="/track.html">Track my vehicle</a></nav><div class="nav-actions"><a class="track-link" href="/track.html">Track my vehicle</a><a class="button small" href="/estimate.html">Get an estimate</a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="navigation">Menu</button></div></div></header>`;
export const footer = `<footer><div class="wrap footer-grid"><div><a class="logo" href="/" aria-label="Action Audio home">${wordmark}</a><p>Car audio and electronics in Wethersfield.<br>Vehicle detailing in Hartford.</p></div><div><h3>Explore</h3><a href="/electronics.html">Electronics</a><a href="/services.html">Services</a><a href="/about.html">Our story</a></div><div><h3>Your visit</h3><a href="/estimate.html">Request an estimate</a><a href="/book.html">Book an appointment</a><a href="/track.html">Track your vehicle</a><a href="/locations.html">Our locations</a></div><div><h3>Wethersfield</h3><a class="footer-phone" href="tel:8606676330">(860) 667-6330</a><p>Wethersfield · Mon–Sat, 9am–6pm<br>Sunday closed</p></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} The Action Audio Store.</span><nav class="legal-links" aria-label="Legal and accessibility"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/accessibility.html">Accessibility</a><button type="button" data-cookie-settings>Cookie settings</button></nav><p class="powered-by">Powered by <a href="https://reimagebs.com" target="_blank" rel="noopener noreferrer">REIMAGE BUSINESS SOLUTIONS</a></p></div></footer>`;
export const contactStrip = `<section class="contact-strip wrap" aria-label="Store addresses, hours, and phone"><a href="/wethersfield.html"><span class="micro-label">Wethersfield ${arrow}</span><strong>105 Silas Deane Hwy</strong><span>Electronics & remote starters</span></a><a href="/hartford.html"><span class="micro-label">Hartford ${arrow}</span><strong>2814 Main Street</strong><span>Interior & exterior detailing</span></a><div><span class="micro-label">Store hours</span><strong>Mon–Sat · 9am–6pm</strong><span>Sunday closed</span></div><a href="tel:8606676330"><span class="micro-label">Call Wethersfield ${arrow}</span><strong>(860) 667-6330</strong><span>Electronics & installation</span></a></section>`;
const slides = [
  {
    image: "hero-installation.webp",
    alt: "Illustrative technician installing subwoofers and an amplifier",
    label: "Car audio",
    title: "Your music.<br>Made for your drive.",
    location: "Car audio · Wethersfield",
    description: "Speakers, subwoofers, and professional installation.",
    service: "car-audio",
  },
  {
    image: "hero-remote-start.webp",
    alt: "Illustrative remote-start key fob in front of a silver SUV",
    label: "Remote starters",
    title: "Comfort starts<br>before you get in.",
    location: "Remote starters · Wethersfield",
    description: "A remote-start system matched to your vehicle.",
    service: "remote-starters",
  },
  {
    image: "service-detailing.webp",
    alt: "Original illustration of a detailer polishing a vehicle hood",
    label: "Detailing",
    title: "Care for every<br>detail.",
    location: "Auto detailing · Hartford",
    description: "Interior and exterior care for your vehicle.",
    service: "auto-detailing",
  },
];
export function homePage() {
  return `<section class="photo-hero" aria-label="Action Audio vehicle services"><h1 class="sr-only">Action Audio — Hartford car detailing and Wethersfield auto electronics</h1><div class="slideshow" role="region" aria-roledescription="carousel" aria-label="Featured vehicle services"><div class="slides">${slides.map((s, i) => `<article class="hero-slide${i === 0 ? " is-active" : ""}" data-slide="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}"${i ? " hidden" : ""}>${imageMarkup(s.image,"",{className:"hero-backdrop",sizes:"(max-width: 760px) 480px, 800px",eager:i===0,priority:"low"})}${imageMarkup(s.image,s.alt,{className:"hero-photo",sizes:"(max-width: 760px) 100vw, 1100px",eager:i===0})}<div class="photo-hero-scrim" aria-hidden="true"></div><div class="slide-copy wrap"><p class="hero-service-location">${s.location}</p><h2>${s.title}</h2><p class="hero-description">${s.description}</p><a class="button" href="/estimate.html?service=${s.service}">Get an estimate</a></div></article>`).join("")}</div><div class="hero-control-row wrap"><div class="slide-controls"><button type="button" class="slide-prev" aria-label="Previous slide">Previous</button><div class="slide-dots">${slides.map((s, i) => `<button type="button" data-slide-to="${i}" aria-label="Show slide ${i + 1}: ${s.label.toLowerCase()}" aria-pressed="${i === 0}"><span></span></button>`).join("")}</div><button type="button" class="slide-next" aria-label="Next slide">Next</button><button type="button" class="slide-play" aria-label="Pause slideshow">Pause</button></div></div><span class="sr-only slide-status" aria-live="polite"></span></div></section>${contactStrip}${homeServices()}${showroomGallery()}
<section class="heritage wrap"><h2>Greater Hartford.<br>Since 1983.</h2><div><p>Visit Hartford for <a href="/auto-detailing.html">interior and exterior car detailing</a>, or Wethersfield for <a href="/electronics-repair.html">auto electronics repair</a> and <a href="/electrical-installation.html">car electronics installation</a>. Two local stores, with the right team for your vehicle.</p><a class="text-link" href="/about.html">Read our story</a></div></section>`;
}
export function electronicsPage() {
  return `<section class="page-heading centered wrap"><h1>Vehicle electronics.</h1><p>Car audio, remote starters, and electronics at our Wethersfield showroom.</p></section><section class="wrap section inventory-section"><div class="category-pills" role="group" aria-label="Electronics categories"><button type="button" data-category="" aria-pressed="true">All electronics</button>${electronicsCategories.map((c) => `<button type="button" data-category="${c}" aria-pressed="false">${c === "Security" ? "Car alarms" : c}</button>`).join("")}</div><div class="filters"><label class="search-field"><span class="sr-only">Search electronics</span><input id="inventory-search" type="search" placeholder="Search products or brands"></label><select id="inventory-category" aria-label="Filter by electronics category"><option value="">All categories</option>${["Car audio", "Speakers", "Subwoofers", "Amplifiers", "Receivers", ...electronicsCategories.slice(1)].map((c) => `<option>${c}</option>`).join("")}</select><input type="hidden" id="inventory-store" value="wethersfield"><span class="showroom-filter">Wethersfield showroom</span></div><div id="category-guide" hidden></div><p id="inventory-count" class="muted" aria-live="polite"></p><div id="inventory-results" class="product-grid" aria-live="polite"><div class="empty-state"><h2>Loading electronics…</h2><p>Explore equipment and ask our team about your vehicle.</p></div></div><nav class="electronics-service-links" aria-label="Explore electronics services">${serviceContent.filter(s => s.booking !== "auto-detailing").map(s => `<a href="/${s.id}.html">${s.name}</a>`).join("")}</nav><div class="brand-panel"><p>Alpine <span>Rockford Fosgate</span> Pioneer <span>Kenwood</span> MTX</p><small>Visit Wethersfield for electronics. Compatibility and availability vary by vehicle.</small></div></section>`;
}
export function servicesPage() {
  return `<section class="page-heading wrap"><h1>Services & installation.</h1><p>Electronics and remote starters in Wethersfield. Vehicle detailing in Hartford.</p></section><section class="wrap service-directory">${serviceContent.map((s) => `<article class="directory-card" id="${s.id}"><a class="directory-photo${s.product ? " is-product" : ""}" href="${serviceLink(s)}">${photo(s)}</a><div class="directory-copy"><span class="service-location">${serviceStore(s.booking).name}</span><h2><a href="${serviceLink(s)}">${s.name}</a></h2><p>${s.description}</p><div class="service-actions"><a class="button" href="/estimate.html?service=${s.id}">Get an estimate</a><a class="text-link" href="${serviceLink(s)}">Service details</a></div></div></article>`).join("")}</section>`;
}
export function detailPages() {
  return Object.fromEntries(
    serviceContent.map((s) => [
      `${s.id}.html`,
      {
        title: seoServices[s.id]?.title || `${s.name} in ${serviceStore(s.booking).name}, CT | Action Audio`,
        desc: seoServices[s.id]?.description || `${s.name} at Action Audio in ${serviceStore(s.booking).name}, Connecticut. ${s.prepare}`,
        body: `<section class="wrap detail-hero"><div><nav class="service-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/services.html">Services</a><span aria-hidden="true">/</span><span aria-current="page">${s.name}</span></nav><p class="eyebrow">${s.name} · ${serviceStore(s.booking).name}</p><h1>${(seoServices[s.id]?.heading || s.headline).replace("\n", "<br>")}</h1><p class="detail-description">${s.description}</p><div class="service-actions"><a class="button" href="/estimate.html?service=${s.id}">Get an estimate</a><a class="text-link" href="${bookingLink(s)}">Book an appointment</a></div></div><figure class="detail-image${s.product ? " is-product" : ""}">${photo(s, "", true)}</figure></section><section class="wrap detail-body"><div><h2>${s.tag}.</h2><p>${s.detail}</p><ul class="check-list">${s.items.map((x) => `<li>${x}</li>`).join("")}</ul></div><aside class="prepare-card"><h3>Before you visit</h3><p>${s.prepare}</p><a class="text-link" href="/${serviceStore(s.booking).id}.html">Visit ${serviceStore(s.booking).name} </a><small>${serviceStore(s.booking).address}<br>Mon–Sat, 9am–6pm</small></aside></section><section class="wrap service-local-context"><h2>${s.name} for Greater Hartford drivers.</h2><p>${s.booking === "auto-detailing" ? "Detailing is offered at 2814 Main St in Hartford, CT. Tell us whether the interior, exterior, or both need attention, and share any stains, surface concerns, or timing requirements." : "Electronics services are offered at 105 Silas Deane Hwy in Wethersfield, CT, near Hartford. Share your vehicle year, make, model, existing equipment, and what you want to repair or install."} We’ll discuss the scope and estimate before you arrange your visit.</p><nav class="related-services" aria-label="Related services">${serviceContent.filter(item => item.id !== s.id && (s.booking === "auto-detailing" ? ["electronics-repair","electrical-installation"].includes(item.id) : ["car-audio","remote-starters","electronics-repair","electrical-installation"].includes(item.id))).map(item=>`<a href="/${item.id}.html">${item.name}</a>`).join("")}</nav></section><section class="wrap faq-section" id="faq"><h2>A few things to know.</h2>${s.faq.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join("")}</section><section class="wrap"><div class="final-cta"><div><h2>Visit our ${serviceStore(s.booking).name} team.</h2><p>Visit our ${serviceStore(s.booking).name} team. We’ll confirm the details before your appointment.</p></div><a class="button" href="${bookingLink(s)}">Plan your visit ${arrow}</a></div></section>`,
      },
    ]),
  );
}

export function showroomGallery() {
  return `<section class="wrap section showroom-section"><div class="section-heading"><div><h2>Visit the Wethersfield showroom.</h2></div><p>See the equipment in person and talk with our team about your vehicle.</p></div><div class="showroom-grid"><figure>${imageMarkup("wethersfield-speakers.webp","Speaker displays inside Action Audio’s Wethersfield showroom",{sizes:"(max-width: 760px) 50vw, 440px"})}</figure><figure>${imageMarkup("wethersfield-counter.webp","The counter and electronics displays at Action Audio in Wethersfield",{sizes:"(max-width: 760px) 50vw, 440px"})}</figure><aside><span class="eyebrow">Two locations</span><h3>Wethersfield: electronics.</h3><p>Remote starters, car audio, electronics repair, and installation.</p><a class="text-link" href="/wethersfield.html">Visit Wethersfield </a><hr><h3>Hartford: detailing.</h3><p>Interior and exterior vehicle detailing, with care in every detail.</p><a class="text-link" href="/auto-detailing.html">Explore detailing </a></aside></div></section>`;
}

export function homeServices() {
  const featured = [serviceContent[1], serviceContent[0], serviceContent[9]];
  const more = serviceContent.filter((s) => !featured.includes(s));
  const item = (s) =>
    `<article><a class="service-selection-photo" href="${serviceLink(s)}">${photo(s)}</a><div class="service-selection-body"><div class="service-selection-title"><h3><a href="${serviceLink(s)}">${s.name}</a></h3><span>${serviceStore(s.booking).name}</span></div><div class="service-actions"><a class="text-link" href="/estimate.html?service=${s.id}">Get an estimate</a><a class="text-link service-detail-link" href="${serviceLink(s)}">Details</a></div></div></article>`;
  return `<section class="service-color-section"><div class="wrap section service-selection-section"><div class="section-heading"><div><h2>Find your service.</h2><p>Choose your service. Tell us your vehicle. We’ll call you with an estimate.</p></div><a class="text-link" href="/services.html">All service details</a></div><div class="service-selection featured-services">${featured.map(item).join("")}</div><details class="more-services"><summary>More electronics & installation services <span aria-hidden="true">+</span></summary><div class="service-selection">${more.map(item).join("")}</div></details></div></section>`;
}
