import { financingDialog } from "./design.mjs";
import { imageMarkup } from "../shared/images.js";
import { writeFileSync, readFileSync } from "node:fs";
import { metadata, writeDiscovery } from "./seo.mjs";
import { serviceContent } from "../shared/service-content.js";
import { locationGuides } from "../shared/search-content.js";
import { stores, services, serviceStore } from "../shared/catalog.js";
import {
  navigation,
  footer,
  homePage,
  electronicsPage,
  servicesPage,
  detailPages,
  showroomGallery,
  answerSection,
} from "./design.mjs";
const logo =
  '<img src="/assets/action-audio-logo.webp" width="189" height="70" alt="The Action Audio Store">';
const nav = navigation;
const cta = `<section class="wrap"><div class="final-cta"><div><h2>Tell us what your vehicle needs.</h2><p>Electronics in Wethersfield. Detailing and tinting in Hartford. Find the right team for your ride.</p></div><a href="/book.html" class="button">Book an appointment</a></div></section>`;
const serviceRows = () =>
  services
    .map(
      (s) =>
        `<article class="service-row"><h3><a href="/${s.id}.html">${s.name}</a></h3><p>${s.description}</p><a class="text-link" href="/${s.id}.html" aria-label="Read about ${s.name.toLowerCase()}">Service details</a></article>`,
    )
    .join("");
const locationCards = () =>
  stores
    .map(
      (s) =>
        `<article class="location-card"><h3>${s.name}</h3><p class="location-label">${s.detail}</p><p class="address">${s.address}<br>${s.city}</p><p class="hours">Monday–Saturday, 9am–6pm<br>Sunday closed</p><div class="location-actions"><a class="text-link" href="/book.html?store=${s.id}">Book at ${s.name}</a><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address + " " + s.city)}" target="_blank" rel="noopener noreferrer">Directions<span class="sr-only"> (opens in a new tab)</span></a></div><a class="location-detail" href="/${s.id}.html">${s.name} store information</a></article>`,
    )
    .join("");
const head = (label, title, desc) =>
  `<section class="page-heading wrap"><h1>${title}</h1><p>${desc}</p></section>`;
const pages = {
  "index.html": {
    title: "Car Detailing & Car Electronics in Hartford CT | Action Audio",
    desc: "Upgrade your drive with car audio, remote starters, electronics, and installation in Wethersfield, plus auto detailing and window tinting in Hartford, Connecticut.",
    body: homePage(),
  },
  "services.html": {
    title: "Auto Detailing & Car Electronics Services CT | Action Audio",
    desc: "Explore car audio, remote starters, electronics replacement, dash cams, GPS trackers, window tinting, detailing, and installation in Hartford and Wethersfield.",
    body: servicesPage(),
  },
  "electronics.html": {
    title: "Car Electronics & Audio in Wethersfield CT | Action Audio",
    desc: "Car audio, remote starters, dash cams, and vehicle electronics in Wethersfield, CT. Explore equipment and discuss installation with Action Audio.",
    body: electronicsPage(),
  },
  "locations.html": {
    title:
      "Hartford & Wethersfield Locations | Action Audio",
    desc: "Visit Action Audio at 2814 Main St in Hartford or 105 Silas Deane Hwy in Wethersfield. Open Monday–Saturday, 9am–6pm.",
    body:
      head(
        "COME SEE US",
        "Hartford & Wethersfield",
        "Two locations. Two specialties. The same care for your vehicle.",
      ) +
      `<section class="wrap section"><div class="locations-grid">${locationCards()}</div><p class="center muted">Monday–Saturday, 9am–6pm. Closed Sundays. Holiday hours may vary.</p></section>` +
      cta,
  },
  "about.html": {
    title:
      "Our Story — Connecticut Mobile Electronics Since 1983 | Action Audio",
    desc: "From a CB radio shop in 1983 to two Connecticut automotive destinations. Get to know Action Audio in Hartford and Wethersfield.",
    body:
      head(
        "CONNECTICUT ROOTS. SINCE 1983.",
        "A Connecticut original.",
        "Action Audio began as a CB radio shop in 1983. Our work has grown with the vehicles and electronics we service.",
      ) +
      `<section class="wrap prose-section"><aside class="history-note"><p>Established in Connecticut</p><strong>1983</strong><p>From CB radios to today’s mobile electronics.</p></aside><div class="prose"><h2>From a CB radio shop to two local stores.</h2><p>Action Audio started in 1983 as a CB radio store. As technology evolved, so did we. Today, our selection spans more than 50 brands, including Diamond Audio, Sony, Rockford Fosgate, Pioneer, Kenwood, and Powerbass.</p><p>What hasn’t changed is the way we work: we listen to what you want, help you choose the right equipment, and take care with every installation.</p><h2>Every ride has a story.</h2><p>A fresh-off-the-lot vehicle. A well-loved daily driver. A 1957 Chevy. Whatever you bring through our doors, we’re here to take care of it with electronics replacement, auto detailing, and auto electrical installation.</p><a class="button" href="/locations.html">Meet your local store </a></div></section>` +
      cta,
  },
  "estimate.html": {
    title: "Request a Vehicle Service Estimate | Action Audio",
    desc: "Request a callback about remote starters, car audio, electronics, or detailing. Tell Action Audio your vehicle make and model.",
    body: head("", "Request an estimate.", "Tell us about your vehicle and the service you need. Our team will call you to discuss options and an approximate price.") + `<section class="wrap booking-layout"><form id="estimate-form" class="form-panel"><p class="intake-intro">A few details now help us give you a useful estimate. No account or payment needed. Choose “Not sure” whenever you need advice.</p><fieldset><legend>1. Your service & vehicle</legend><div class="form-grid"><label class="full">Service<select name="service" required><option value="">Select your service</option>${serviceContent.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select></label><div class="full estimate-location-card" id="estimate-location" aria-live="polite">Your service selects the right store automatically.</div><label>Vehicle year<input name="vehicleYear" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="e.g. 2022" required></label><label>Vehicle make<input name="vehicleMake" autocomplete="off" placeholder="e.g. Toyota" minlength="2" maxlength="80" required></label><label class="full">Vehicle model<input name="vehicleModel" placeholder="e.g. Camry" minlength="1" maxlength="100" required></label></div></fieldset><fieldset id="estimate-project" hidden><legend>2. What would you like done?</legend><div id="estimate-questions" class="form-grid"></div><label class="project-details">Tell us a little more<textarea name="details" rows="3" minlength="10" maxlength="2000" aria-describedby="estimate-detail-help" required></textarea><small id="estimate-detail-help">A sentence or two is enough. If you’re unsure, tell us what you’d like help choosing.</small></label><details class="optional-details"><summary>Add trim, budget, or timing <span class="optional">Optional</span></summary><div class="form-grid"><label>Vehicle trim<input name="vehicleTrim" maxlength="100" placeholder="e.g. SE, if known"></label><label>Budget range<input name="budget" maxlength="100" placeholder="e.g. $300–$500, or open to options"></label><label class="full">Timing / best time to call<input name="timing" maxlength="200" placeholder="e.g. Next month; call after 3pm"></label></div></details></fieldset><fieldset><legend>3. How can we reach you?</legend><div class="form-grid"><label>Your name<input name="name" autocomplete="name" minlength="2" maxlength="100" required></label><label>Phone number<input name="phone" type="tel" autocomplete="tel" minlength="10" maxlength="30" placeholder="(860) 555-0123" required></label></div></fieldset><div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="consent"><input type="checkbox" required><span>I agree to be contacted about this estimate and have read the <a href="/privacy.html">privacy notice</a>.</span></label><div id="estimate-message" role="status" tabindex="-1"></div><button type="submit" class="button">Send estimate request</button><p class="form-note">We’ll call to discuss your options and approximate pricing. No appointment or payment is required to ask.</p></form><aside class="booking-aside"><h2>What happens next</h2><p>Your request goes directly to the team that handles your service. We’ll review your vehicle details and call you to discuss the job.</p><dl class="estimate-stores"><dt>Wethersfield</dt><dd>Remote starters, car audio, electronics, and installation.</dd><dt>Hartford</dt><dd>Auto detailing and window tinting.</dd></dl><p>Ready to arrange a visit?</p><a class="text-link" id="estimate-booking-link" href="/book.html">Request an appointment</a></aside></section>` + `<section class="wrap"><div class="final-cta"><div><h2>Explore financing for your service.</h2><p>For Acima applications, choose Wethersfield or Hartford.</p></div><div class="service-cta-actions"><button type="button" class="button acima-trigger" aria-haspopup="dialog" aria-controls="acima-stores">Apply for financing</button></div></div></section>${financingDialog}`
  },
  "book.html": {
    title:
      "Book Auto Detailing or Electronics Installation | Action Audio",
    desc: "Request auto detailing or tinting in Hartford, or car audio and electronics installation in Wethersfield, CT. The team will contact you to confirm your visit.",
    body:
      head(
        "LET’S TAKE CARE OF YOUR RIDE",
        "Book an appointment",
        "Tell us what you have in mind. We’ll get in touch to confirm the details.",
      ) +
      `<section class="wrap booking-layout"><form id="booking-form" class="form-panel"><fieldset><legend>Choose your store</legend><div class="store-options">${stores.map((s) => `<label class="store-option"><input type="radio" name="store" value="${s.id}" required><strong>${s.name}</strong><span>${s.specialty}</span><small>${s.address}</small></label>`).join("")}</div><p class="form-note" id="service-location-note" aria-live="polite">Choose a location to see its services.</p></fieldset><fieldset><legend>Your ride & your service</legend><div class="form-grid"><label class="full">Service<select name="service" required><option value="">Choose a service</option>${services.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select></label><label class="full">Vehicle<input name="vehicle" placeholder="e.g. 2022 Toyota Camry" maxlength="150" minlength="3" required></label><label>Preferred date<input type="date" name="date" required></label><label>Preferred time<select name="time" required disabled><option value="">Choose a store & date</option></select></label></div><small>Monday–Saturday. Requests start from tomorrow. All times are Eastern.</small></fieldset><fieldset><legend>A way to reach you</legend><div class="form-grid"><label class="full">Full name<input autocomplete="name" name="name" minlength="2" maxlength="100" required></label><label>Email<input autocomplete="email" type="email" name="email" maxlength="254" required></label><label>Phone<input autocomplete="tel" type="tel" name="phone" minlength="10" maxlength="30" required></label><label class="full">Anything else we should know? <span class="optional">Optional</span><textarea name="notes" rows="4" maxlength="2000" placeholder="Tell us about your current setup or what you’d like to change."></textarea></label></div><div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div></fieldset><label class="consent"><input type="checkbox" required> <span>I agree to be contacted about this request and have read the <a href="/privacy.html">privacy notice</a>.</span></label><div id="booking-message" role="status" tabindex="-1"></div><button class="button submit-button" type="submit">Request an appointment </button><p class="form-note">Your appointment is confirmed once our team contacts you.</p></form><aside class="booking-aside"><h2>Before your visit</h2><p>From the first conversation to the final check, we’ll keep you informed and take care of your ride.</p><ul class="check-list"><li> Electronics in Wethersfield · detailing and window tinting in Hartford</li><li> Advice tailored to your vehicle</li><li> Private vehicle progress tracking</li></ul><hr><h3>Prefer to talk it through?</h3><a class="phone-link" href="tel:8606676330">(860) 667-6330</a><p>Wethersfield · Mon–Sat, 9am–6pm</p></aside></section>`,
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
    title: "Privacy & Cookies | Action Audio",
    desc: "How Action Audio handles website requests, private vehicle tracking, and cookie choices.",
    body: head("YOUR INFORMATION", "Privacy & cookies.", "How we use information you share with Action Audio.") + `<section class="wrap prose narrow legal-prose"><p class="legal-date">Last updated October 11, 2026</p><h2>Who we are</h2><p>This notice covers The Action Audio Store’s website, appointment and estimate forms, and vehicle tracking. Contact us at <a href="tel:8606676330">(860) 667-6330</a> or visit 105 Silas Deane Highway, Wethersfield, CT 06109.</p><h2>Information you provide</h2><p>Appointment requests collect your name, email, phone number, vehicle details, preferred store, service, date and time, and any notes you submit. Estimate requests collect your name, phone number, vehicle year, make and model, selected service, and project details, including your answers to service questions. You may also share your trim, budget, and timing preferences. Please avoid including payment details or sensitive personal information in notes.</p><h2>How we use and share information</h2><p>We use these details to respond to requests, coordinate service, provide vehicle updates, and maintain service records. Authorized staff can access customer records for these purposes. GitHub Pages hosts the public website, and Convex provides backend services and data storage. Hosting and service providers may process technical information such as IP addresses and browser or request details to operate and secure their services. Information may also be disclosed when required by law or needed to address misuse or protect legal rights.</p><p>We do not sell personal information or use website requests for targeted advertising. This website does not collect payment card information.</p><h2>Storage, security, and retention</h2><p>Appointment and estimate details are encrypted before storage. The published website and backend connections use HTTPS. These safeguards reduce risk, but no system can guarantee complete security. We keep information for as long as reasonably needed to handle your request, provide service, maintain necessary business records, and meet legal or security obligations.</p><h2>Private vehicle tracking</h2><p>Your tracking code provides access to limited appointment and service updates. Anyone with the code may view those updates, so keep it private. Tracking results do not display your contact details. Contact us if you believe a code has been shared without your permission.</p><h2 id="cookies">Cookies and browser storage</h2><p>We currently use no analytics or advertising cookies on the public website. The cookie controls save your Accept or Deny choice in local browser storage for 180 days. This essential preference record contains the choice and its expiration time, not your name or contact information. Staff sign-in uses separate browser storage to maintain an authenticated session.</p><p>Accepting optional cookies currently saves your preference only; it does not activate tracking. Denying optional cookies does not prevent you from requesting service or tracking your vehicle. You can change your choice below or through Cookie settings in the footer. Clearing browser storage resets your preference. If your browser blocks storage, we cannot remember your choice between visits.</p><p data-cookie-status aria-live="polite"></p><button class="button" type="button" data-cookie-settings>Change cookie choice</button><h2>Your choices and requests</h2><p>Call <a href="tel:8606676330">(860) 667-6330</a> to request access to, correction of, or deletion of information you submitted, or to ask about other privacy rights available under applicable law. We may need to verify your identity before acting. Some records may need to be retained for legal or business obligations. If you disagree with our response, contact us to request a review.</p><h2>External websites and children</h2><p>Links to financing providers, manufacturers, maps, and social media take you to services with their own privacy practices. We do not control information you provide to those services. This website is not directed to children under 13. Contact us if you believe a child has submitted personal information.</p><h2>Updates to this notice</h2><p>Changes will be posted here with an updated date. Contact the store if you have questions about this notice or your information.</p></section>`,
  },
  "terms.html": {
    title: "Website Terms | Action Audio",
    desc: "Terms for using the Action Audio website, requesting service, and viewing vehicle updates.",
    body: head("WEBSITE INFORMATION", "Terms of use.", "A few things to know when browsing or requesting service.") + `<section class="wrap prose narrow legal-prose"><p class="legal-date">Last updated October 11, 2026</p><h2>Using this website</h2><p>The Action Audio Store provides this website to explain our services, receive inquiries, and share vehicle progress. Use it lawfully, provide accurate information, and submit requests only for yourself or someone you are authorized to represent. Do not attempt to access other customers’ tracking codes, staff accounts, or restricted systems, or interfere with the website.</p><h2>Estimates and appointments</h2><p>Submitting a form is a request for contact, not a confirmed appointment or a binding agreement to perform work. Our team will contact you to discuss availability and your vehicle. An estimate is an approximate price; final scope and pricing depend on compatibility, inspection, selected equipment, and the work required. Confirm the service details with the store before authorizing work.</p><h2>Products and service information</h2><p>Electronics examples are not a live stock or pricing list. Illustrations may represent an equipment category rather than the exact model. Product specifications, fit, availability, warranty coverage, and prices must be confirmed with the store and, where appropriate, the manufacturer. We may update or correct website information.</p><h2>Vehicle progress</h2><p>Tracking shows service updates associated with your private code. Any estimated percentage or timing is a guide, not a guarantee of completion or pickup time. Staff-confirmed stages indicate recorded progress. Contact the store to confirm your vehicle is ready before arranging pickup. Keep your tracking code private.</p><h2>External links and financing</h2><p>Third-party websites, including financing providers, manufacturers, maps, and social media, operate under their own terms. Financing applications and eligibility decisions are handled by the provider. A website link does not guarantee approval, availability, or any particular financing terms. We do not accept payment card information through the public website.</p><h2>Website content</h2><p>Action Audio branding and website content are provided for personal browsing and evaluating our services. Obtain permission before reusing content for commercial purposes. Third-party names and trademarks belong to their respective owners.</p><h2>Availability and your rights</h2><p>We aim to keep the website accurate and available, but errors, interruptions, or delayed updates can occur. Contact us to confirm information that is important to your service decision. These website terms do not replace a separate service agreement, product warranty, or rights that cannot be limited under applicable consumer law.</p><h2>Contact and updates</h2><p>For questions, call <a href="tel:8606676330">(860) 667-6330</a> or visit 105 Silas Deane Highway, Wethersfield, CT 06109. Updated website terms will be posted on this page with a revised date. See our <a href="/privacy.html">Privacy notice</a> for how website information is handled.</p></section>`,
  },
  "accessibility.html": {
    title: "Accessibility | Action Audio",
    desc: "Accessibility features and ways to get help using the Action Audio website.",
    body: head("ACCESS FOR EVERYONE", "Accessibility.", "We want everyone to be able to explore our services and contact our team.") + `<section class="wrap prose narrow legal-prose"><p class="legal-date">Last updated October 11, 2026</p><h2>Our approach</h2><p>We aim to make this website accessible and use the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA as a design and improvement goal. Formal conformance has not been independently assessed, and we do not claim that every part of the site meets every requirement.</p><h2>Features available</h2><ul><li>Keyboard navigation, visible focus indicators, and a skip link on the main website pages.</li><li>Descriptive image alternatives, headings, and labeled form controls.</li><li>Responsive layouts for smaller screens and browser zoom.</li><li>Manual slideshow controls and a Pause button. Automatic slideshow movement respects reduced-motion preferences.</li><li>Cookie controls that can be revisited from the footer.</li></ul><h2>Known limitations</h2><p>Forms, vehicle tracking, slideshow controls, and cookie preferences require JavaScript. Some content and tools are provided through external websites, whose accessibility we do not control. We continue to review the site; assistive technology and browser combinations may produce different results.</p><h2>Get help or report a barrier</h2><p>If you have trouble reading information, using a form, or accessing a feature, call <a href="tel:8606676330">(860) 667-6330</a>. Our Wethersfield team is available Monday–Saturday, 9am–6pm, at 105 Silas Deane Highway, Wethersfield, CT 06109. The team can discuss services and help with an appointment request by phone or in person.</p><p>When reporting a problem, tell us which page or feature was affected and what you were trying to do. If helpful, include your browser or assistive technology. Do not send passwords, payment details, or private tracking codes in a public report.</p></section>`,
  },
};
for (const s of stores)
  pages[s.id + ".html"] = {
    title: `${s.specialty} in ${s.name}, CT | Action Audio`,
    desc: `Visit Action Audio at ${s.address}, ${s.city} for ${s.detail.toLowerCase()}. Book your ${s.name} appointment.`,
    body:
      head(
        `ACTION AUDIO · ${s.name.toUpperCase()}, CONNECTICUT`,
        `${s.id === "hartford" ? "Detailing & window tinting" : "Car audio & electronics"}<br>${s.name}, CT`,
        `${s.detail} at ${s.address}.`,
      ) +
      `<section class="wrap location-local"><div class="form-panel"><h2>${s.name}</h2><p>${s.address}<br>${s.city}</p><p>Monday–Saturday: 9am–6pm<br>Sunday: Closed<br><small>Holiday hours may vary.</small></p><a class="button" href="/book.html?store=${s.id}">Book at ${s.name} </a><a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address + " " + s.city)}">Get directions</a></div><div><h2>Services at this store</h2><p>${s.id === "wethersfield" ? "Explore car audio, remote starters, and electronics with our Wethersfield team. Let’s find the right fit for your vehicle." : "Bring your vehicle to our Hartford team for auto detailing and window tinting. Tell us about your vehicle and the work you have in mind."}</p><ul class="check-list">${serviceContent
        .filter((service) => serviceStore(service.booking).id === s.id)
        .map((s) => `<li><a href="/${s.id}.html">${s.name}</a></li>`)
        .join("")}</ul></div></section>` +
      `<section class="wrap service-guide"><h2>${locationGuides[s.id].heading}</h2><p>${locationGuides[s.id].text}</p><a class="text-link" href="/estimate.html?service=${s.id === "hartford" ? "auto-detailing" : "electrical-installation"}">Request a ${s.name} service estimate</a></section>` +
      answerSection(s.id + ".html", `${s.name} store questions`) +
      (s.id === "wethersfield" ? showroomGallery() : "") +
      cta,
  };
Object.assign(pages, detailPages());
for (const [file, p] of Object.entries(pages)) {
  writeFileSync(file, `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#12345b">${metadata(file,p)}<link rel="icon" type="image/x-icon" href="/favicon.ico?v=20261101"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png?v=20261101"><link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png?v=20261101"><link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png?v=20261101"><link rel="stylesheet" href="/styles.css"><script src="/config.js"></script><script type="module" src="/app.js"></script><script src="/site.js" defer></script></head><body class="page-${file.replace(".html", "")}">${nav}<main id="main">${p.body}</main>${footer}</body></html>`);
}
const landing = readFileSync("landing-page.html", "utf8").replace(/(<a class="links-logo"[^>]*>)[\s\S]*?(<\/a>)/, (_,start,end)=>start+imageMarkup("action-audio-logo.webp","The Action Audio Store",{sizes:"270px",eager:true,priority:"auto"})+end);
const landingWithFinancing = landing.replace(/<dialog\b[\s\S]*?<\/dialog>/, financingDialog).replace(/<script>\s*const acimaDialog[\s\S]*?<\/script>/, "").replace(/[ \t]+$/gm, "");
const landingMeta = metadata("landing-page.html", {title:"Book, Track & Explore | Action Audio Hartford & Wethersfield",desc:"Request an appointment, track your vehicle, browse electronics, and contact Action Audio. Detailing and tinting in Hartford; car audio and electronics in Wethersfield."});
writeFileSync("landing-page.html",landingWithFinancing.replace(/<head>[\s\S]*?<\/head>/,`<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#12345b">${landingMeta}<link rel="icon" type="image/x-icon" href="/favicon.ico?v=20261101"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png?v=20261101"><link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png?v=20261101"><link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png?v=20261101"><link rel="stylesheet" href="/styles.css"><script src="/site.js" defer></script></head>`));
writeDiscovery(pages);

// Keep old bookmarks useful without advertising retired services or indexing them.
for (const [from, to] of [["electronics-repair", "electronics-replacement"], ["radar-detectors", "services"]]) {
  writeFileSync(`${from}.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0;url=${to}.html"><title>Service information | Action Audio</title></head><body><p><a href="/${to}.html">Continue to current service information</a></p></body></html>`);
}
