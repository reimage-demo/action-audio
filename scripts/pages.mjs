import { writeFileSync } from "node:fs";
import { stores, services } from "../shared/catalog.js";
const logo =
  '<img src="/assets/action-audio-logo.webp" width="189" height="70" alt="The Action Audio Store">';
const nav = `<a class="skip" href="#main">Skip to content</a><header><div class="nav wrap"><a href="/" class="logo" aria-label="Action Audio home">${logo}</a><nav id="navigation" aria-label="Main navigation"><a href="/services.html">Services</a><a href="/inventory.html">Inventory</a><a href="/about.html">Our story</a><a href="/locations.html">Locations</a><a class="mobile-track" href="/track.html">Track my vehicle</a></nav><div class="nav-actions"><a class="track-link" href="/track.html">Track my vehicle</a><a class="button small" href="/book.html">Book an appointment</a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="navigation">Menu</button></div></div></header>`;
const footer = `<footer><div class="wrap footer-grid"><div><a class="logo" href="/">${logo}</a><p>Connecticut’s mobile electronics store.<br>Hartford & Wethersfield. Since 1983.</p></div><div><h3>Explore</h3><a href="/services.html">Our services</a><a href="/inventory.html">Browse inventory</a><a href="/about.html">Our story</a></div><div><h3>Your visit</h3><a href="/book.html">Book an appointment</a><a href="/track.html">Track your vehicle</a><a href="/locations.html">Find a store</a></div><div><h3>Contact Wethersfield</h3><a class="footer-phone" href="tel:8606676330">(860) 667-6330</a><p>Monday–Saturday, 9am–6pm<br>Sunday closed</p></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} The Action Audio Store.</span><a href="/privacy.html">Privacy</a><p class="powered-by">Powered by <a href="https://reimagebs.com" target="_blank" rel="noopener noreferrer">REIMAGE BUSINESS SOLUTIONS</a></p></div></footer>`;
const cta = `<section class="wrap"><div class="final-cta"><div><h2>Tell us what your vehicle needs.</h2><p>Choose Hartford or Wethersfield. Our team will confirm your appointment.</p></div><a href="/book.html" class="button">Book an appointment</a></div></section>`;
const serviceRows = () =>
  services
    .map(
      (s) =>
        `<article class="service-row"><h3><a href="/services.html#${s.id}">${s.name}</a></h3><p>${s.description}</p><a class="text-link" href="/services.html#${s.id}" aria-label="Read about ${s.name.toLowerCase()}">Service details</a></article>`,
    )
    .join("");
const locationCards = () =>
  stores
    .map(
      (s) =>
        `<article class="location-card"><h3>${s.name}</h3><p class="location-label">${s.detail}</p><p class="address">${s.address}<br>${s.city}</p><p class="hours">Monday–Saturday, 9am–6pm<br>Sunday closed</p><div class="location-actions"><a class="text-link" href="/book.html?store=${s.id}">Book at ${s.name}</a><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address + " " + s.city)}" target="_blank" rel="noopener noreferrer">Directions<span class="sr-only"> (opens in a new tab)</span></a></div><a class="location-detail" href="/${s.id}.html">${s.name} store information</a></article>`,
    )
    .join("");
const head = (_label, title, desc) =>
  `<section class="page-heading wrap"><h1>${title}</h1><p>${desc}</p></section>`;
const pages = {
  "index.html": {
    title:
      "Auto Electronics Repair, Detailing & Installation in Hartford & Wethersfield | Action Audio",
    desc: "Auto electronics repair, auto detailing, and auto electrical installation at Action Audio in Hartford and Wethersfield, CT. Serving Connecticut since 1983.",
    body: `<section class="hero wrap"><div class="hero-copy"><p class="hero-location">Hartford & Wethersfield, Connecticut</p><h1>Car electronics<br><span>& detailing.</span></h1><p class="hero-description">Auto electronics repair, detailing, and electrical installation. Local know-how, built on four decades of working on the vehicles you drive.</p><a class="button" href="/book.html">Book an appointment</a><div class="hero-contact"><a href="tel:8606676330">(860) 667-6330</a><span>Wethersfield · Mon–Sat, 9am–6pm</span></div></div><figure class="hero-photo"><img src="/assets/hero-installation.webp" alt="Car audio installation with dual subwoofers and a technician connecting an amplifier" width="1200" height="900" fetchpriority="high"></figure></section><section class="services-overview wrap"><div class="section-heading"><h2>What we do</h2><p>Three ways we take care of your vehicle.</p></div><div class="service-list">${serviceRows()}</div></section><section class="story-section"><div class="wrap story-grid"><div><h2>Connecticut roots.<br>Since 1983.</h2><a class="text-link" href="/about.html">Our story</a></div><div class="story-copy"><p>We started as a CB radio shop. As vehicles and technology changed, we changed with them.</p><p>Today, Action Audio brings decades of installation experience and more than 50 brands to Connecticut drivers—from a brand-new daily driver to your ’57 Chevy.</p><div class="brand-note"><h3>Brands we carry</h3><p>Alpine, Rockford Fosgate, Pioneer, Diamond Audio, Kenwood, Powerbass, MTX, and more.</p><a class="text-link" href="/inventory.html">Browse inventory</a></div></div></div></section><section class="section wrap"><div class="section-heading location-heading"><h2>Visit either store.</h2><p>Choose the location that works for you.<br>Holiday hours may vary.</p></div><div class="locations-grid">${locationCards()}</div></section>`,
  },
  "services.html": {
    title:
      "Auto Electronics Repair, Detailing & Electrical Installation | Action Audio CT",
    desc: "Explore auto electronics repair, auto detailing, and auto electrical installation at Action Audio in Hartford and Wethersfield, Connecticut.",
    body:
      head(
        "BUILT FOR YOUR DRIVE",
        "Services for your vehicle.",
        "Electronics repair, detailing, and electrical installation. Thoughtful care for the way you drive.",
      ) +
      `<section class="wrap service-details">${services.map((s) => `<article id="${s.id}" class="service-detail"><h2>${s.name}</h2><div><p>${s.description}</p><ul class="check-list">${s.items.map((x) => `<li>${x}</li>`).join("")}</ul><a class="text-link" href="/book.html?service=${s.id}">Book this service</a></div></article>`).join("")}</section>` +
      cta,
  },
  "inventory.html": {
    title: "Car Audio & Mobile Electronics Inventory | Action Audio CT",
    desc: "Browse the latest Action Audio inventory by category and store. Explore speakers, amplifiers, receivers, remote starters and security systems.",
    body:
      head(
        "FIND YOUR NEXT UPGRADE",
        "Inventory",
        "Explore car audio equipment. Our team can help you find the right fit for your vehicle.",
      ) +
      `<section class="wrap section inventory-section"><div class="filters"><label class="search-field"><input id="inventory-search" type="search" placeholder="Search products or brands" aria-label="Search inventory"></label><select id="inventory-category" aria-label="Filter by category"><option value="">All categories</option>${["Speakers", "Subwoofers", "Amplifiers", "Receivers", "Remote starters", "Security", "Accessories"].map((s) => `<option>${s}</option>`).join("")}</select><select id="inventory-store" aria-label="Filter by store"><option value="">Both stores</option>${stores.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select></div><p id="inventory-count" class="muted" aria-live="polite"></p><div id="inventory-results" class="product-grid" aria-live="polite"><div class="empty-state"><h2>Ask about current stock.</h2><p>Contact our team for current stock and pricing at your preferred store.</p><a class="button" href="/book.html">Ask about a product </a></div></div><div class="brand-panel"><p>Alpine · Rockford Fosgate · Pioneer · Diamond Audio · Kenwood · Powerbass · MTX</p><small>Product compatibility and availability vary by vehicle and store.</small></div></section>`,
  },
  "locations.html": {
    title: "Hartford & Wethersfield Car Audio Stores | Action Audio Locations",
    desc: "Visit Action Audio at 2814 Main St in Hartford or 105 Silas Deane Hwy in Wethersfield. Open Monday–Saturday, 9am–6pm.",
    body:
      head(
        "COME SEE US",
        "Hartford & Wethersfield",
        "Great sound and personal service, right here in Connecticut.",
      ) +
      `<section class="wrap section"><div class="locations-grid">${locationCards()}</div><p class="center muted">Monday–Saturday, 9am–6pm. Closed Sundays. Holiday hours may vary.</p></section>` +
      cta,
  },
  "about.html": {
    title:
      "Our Story — Connecticut Mobile Electronics Since 1983 | Action Audio",
    desc: "From a CB radio shop in 1983 to two Connecticut car audio destinations. Get to know Action Audio in Hartford and Wethersfield.",
    body:
      head(
        "CONNECTICUT ROOTS. SINCE 1983.",
        "A Connecticut original.",
        "Action Audio began as a CB radio shop in 1983. Our work has grown with the vehicles and electronics we service.",
      ) +
      `<section class="wrap prose-section"><aside class="history-note"><p>Established in Connecticut</p><strong>1983</strong><p>From CB radios to today’s mobile electronics.</p></aside><div class="prose"><h2>From a CB radio shop to two local stores.</h2><p>Action Audio started in 1983 as a CB radio store. As technology evolved, so did we. Today, our selection spans more than 50 brands, from Alpine and Rockford Fosgate to Pioneer, Diamond Audio, Kenwood, Powerbass, and MTX.</p><p>What hasn’t changed is the way we work: we listen to what you want, help you choose the right equipment, and take care with every installation.</p><h2>Every ride has a story.</h2><p>A fresh-off-the-lot vehicle. A well-loved daily driver. A 1957 Chevy. Whatever you bring through our doors, we’re here to take care of it with auto electronics repair, auto detailing, and auto electrical installation.</p><a class="button" href="/locations.html">Meet your local store </a></div></section>` +
      cta,
  },
  "book.html": {
    title:
      "Book Auto Electronics Repair, Detailing & Installation | Action Audio",
    desc: "Request auto electronics repair, auto detailing, or auto electrical installation at your preferred Action Audio store in Hartford or Wethersfield.",
    body:
      head(
        "LET’S TAKE CARE OF YOUR RIDE",
        "Book an appointment",
        "Tell us what you have in mind. We’ll get in touch to confirm the details.",
      ) +
      `<section class="wrap booking-layout"><form id="booking-form" class="form-panel"><fieldset><legend>Choose your store</legend><div class="store-options">${stores.map((s) => `<label class="store-option"><input type="radio" name="store" value="${s.id}" required><strong>${s.name}</strong><span>${s.address}</span></label>`).join("")}</div></fieldset><fieldset><legend>Your ride & your service</legend><div class="form-grid"><label class="full">Service<select name="service" required><option value="">Choose a service</option>${services.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select></label><label class="full">Vehicle<input name="vehicle" placeholder="e.g. 2022 Toyota Camry" maxlength="150" minlength="3" required></label><label>Preferred date<input type="date" name="date" required></label><label>Preferred time<select name="time" required disabled><option value="">Choose a store & date</option></select></label></div><small>Monday–Saturday. Requests start from tomorrow. All times are Eastern.</small></fieldset><fieldset><legend>A way to reach you</legend><div class="form-grid"><label class="full">Full name<input autocomplete="name" name="name" minlength="2" maxlength="100" required></label><label>Email<input autocomplete="email" type="email" name="email" maxlength="254" required></label><label>Phone<input autocomplete="tel" type="tel" name="phone" minlength="10" maxlength="30" required></label><label class="full">Anything else we should know? <span class="optional">Optional</span><textarea name="notes" rows="4" maxlength="2000" placeholder="Tell us about your current setup or what you’d like to change."></textarea></label></div><div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div></fieldset><label class="consent"><input type="checkbox" required> <span>I agree to be contacted about this request and have read the <a href="/privacy.html">privacy notice</a>.</span></label><div id="booking-message" role="status" tabindex="-1"></div><button class="button submit-button" type="submit">Request an appointment </button><p class="form-note">Your appointment is confirmed once our team contacts you.</p></form><aside class="booking-aside"><h2>Before your visit</h2><p>From the first conversation to the final check, we’ll keep you informed and take care of your ride.</p><ul class="check-list"><li> Your choice of two local stores</li><li> Advice tailored to your vehicle</li><li> Private vehicle progress tracking</li></ul><hr><h3>Prefer to talk it through?</h3><a class="phone-link" href="tel:8606676330">(860) 667-6330</a><p>Wethersfield · Mon–Sat, 9am–6pm</p></aside></section>`,
  },
  "track.html": {
    title: "Track Your Vehicle Service | Action Audio",
    desc: "Use your private Action Audio tracking code to check your appointment and vehicle service progress.",
    noindex: true,
    body:
      head(
        "STAY IN THE LOOP",
        "Track your vehicle",
        "Enter the private tracking code you received with your appointment request.",
      ) +
      `<section class="wrap tracking-section"><form id="tracking-form" class="form-panel"><label>Tracking code<input name="code" autocomplete="off" spellcheck="false" placeholder="Your 32-character tracking code" required pattern="[a-fA-F0-9]{32}" maxlength="32"></label><button class="button">Check my vehicle </button><p class="form-note">Keep this code private. Need help? Call <a href="tel:8606676330">(860) 667-6330</a>.</p></form><div id="tracking-result" aria-live="polite"></div></section>`,
  },
  "privacy.html": {
    title: "Privacy Notice | Action Audio",
    desc: "How Action Audio uses information submitted through appointment requests and vehicle tracking.",
    body:
      head(
        "YOUR INFORMATION",
        "Privacy notice",
        "Information you share helps us take care of your appointment and your vehicle.",
      ) +
      `<section class="wrap prose narrow"><h2>Appointment information</h2><p>We collect the name, email, phone number, vehicle information, store preference, appointment preference, and notes you submit. We use these details to respond to your request, coordinate service, and provide progress updates.</p><h2>Storage and access</h2><p>Appointment and inventory data are stored using Convex. Authorized staff can access customer records to manage service. Staff sign-in uses browser storage to maintain an authenticated session. We do not ask for payment information on this website.</p><h2>Private tracking codes</h2><p>Your tracking code provides access to your appointment and service updates. Keep it private. Tracking pages are excluded from our sitemap and marked not to be indexed.</p><h2>Your choices</h2><p>To request a correction or deletion of information you submitted, contact Action Audio at <a href="tel:8606676330">(860) 667-6330</a> or visit our Wethersfield store at 105 Silas Deane Highway.</p></section>`,
  },
};
for (const s of stores)
  pages[s.id + ".html"] = {
    title: `Auto Electronics Repair, Detailing & Installation in ${s.name}, CT | Action Audio`,
    desc: `Visit Action Audio at ${s.address}, ${s.city} for auto electronics repair, auto detailing, and auto electrical installation. Book your ${s.name} appointment.`,
    body:
      head(
        `ACTION AUDIO · ${s.name.toUpperCase()}, CONNECTICUT`,
        `Action Audio<br>${s.name}`,
        `Auto electronics repair, auto detailing, and auto electrical installation at ${s.address}.`,
      ) +
      `<section class="wrap location-local"><div class="form-panel"><h2>${s.name}</h2><p>${s.address}<br>${s.city}</p><p>Monday–Saturday: 9am–6pm<br>Sunday: Closed<br><small>Holiday hours may vary.</small></p><a class="button" href="/book.html?store=${s.id}">Book at ${s.name} </a><a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address + " " + s.city)}">Get directions</a></div><div><h2>Services at this store</h2><p>Whether you need electronics repaired, detailing work, or an electrical installation, our ${s.name} team will help you plan the right service for your vehicle.</p><ul class="check-list">${services.map((s) => `<li><a href="/services.html#${s.id}">${s.name}</a></li>`).join("")}</ul></div></section>` +
      cta,
  };
const domain = "https://actionaudiostorellc.com";
for (const [file, p] of Object.entries(pages)) {
  const url = domain + (file === "index.html" ? "/" : "/" + file);
  const schema = {
    "@context": "https://schema.org",
    "@graph": stores.map((s) => ({
      "@type": "AutomotiveBusiness",
      "@id": domain + "/" + s.id + ".html#store",
      name: "Action Audio — " + s.name,
      url: domain + "/" + s.id + ".html",
      image: domain + "/assets/action-audio-logo.webp",
      ...(s.phone ? { telephone: "+1" + s.tel } : {}),
      address: {
        "@type": "PostalAddress",
        streetAddress: s.address,
        addressLocality: s.name,
        addressRegion: "CT",
        postalCode: s.id === "hartford" ? "06120" : "06109",
        addressCountry: "US",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          opens: "09:00",
          closes: "18:00",
        },
      ],
      areaServed: ["Hartford", "Wethersfield"],
      foundingDate: "1983",
    })),
  };
  writeFileSync(
    file,
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#1557e8"><title>${p.title}</title><meta name="description" content="${p.desc}"><meta name="robots" content="${p.noindex ? "noindex, nofollow" : "index, follow"}"><meta name="referrer" content="strict-origin-when-cross-origin"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:title" content="${p.title}"><meta property="og:description" content="${p.desc}"><meta property="og:url" content="${url}"><meta property="og:image" content="${domain}/assets/hero-installation.webp"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="stylesheet" href="/styles.css"><script type="application/ld+json">${JSON.stringify(schema)}</script><script src="/config.js"></script><script type="module" src="/app.js"></script></head><body class="page-${file.replace(".html", "")}">${nav}<main id="main">${p.body}</main>${footer}</body></html>`,
  );
}
writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.entries(
    pages,
  )
    .filter(([f, p]) => !p.noindex)
    .map(
      ([f]) =>
        `<url><loc>${domain}${f === "index.html" ? "/" : "/" + f}</loc></url>`,
    )
    .join("")}<url><loc>${domain}/landing-page.html</loc></url></urlset>`,
);
