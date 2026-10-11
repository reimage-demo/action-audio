import {
  stores,
  services,
  statusLabels,
  serviceStore,
  serviceAvailableAt,
} from "./shared/catalog.js?v=8c12b36759f6";
import { serviceContent } from "./shared/service-content.js?v=4b68c3214f4d";
import { journeyProgress, progressStages } from "./shared/progress.js?v=6644ae19c328";
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const menu = $(".menu-toggle");
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  $("#navigation").classList.toggle("open", open);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    menu?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("aria-label", "Open navigation");
    $("#navigation")?.classList.remove("open");
  }
});
document.querySelectorAll("#navigation a").forEach((a) => {
  if (a.pathname === location.pathname) a.setAttribute("aria-current", "page");
});
let clientPromise;
async function client() {
  const url = window.ACTION_AUDIO_CONFIG?.convexUrl;
  if (!url)
    throw new Error(
      "Online requests are not available yet. Please call (860) 667-6330 and our team will help you.",
    );
  if (!clientPromise)
    clientPromise = import("/action-audio/assets/convex-client.js").then(
      ({ ConvexClient }) => new ConvexClient(url),
    );
  return clientPromise;
}
const notice = (node, message) => {
  node.innerHTML = `<div class="notice">${esc(message)}</div>`;
};
const params = new URLSearchParams(location.search);
const booking = $("#booking-form");
if (booking) {
  const fields = booking.elements;
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const fmt = (d) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  fields.date.min = fmt(tomorrow);
  fields.date.max = fmt(new Date(now.getTime() + 179 * 86400000));
  if (stores.some((s) => s.id === params.get("store")))
    fields.store.value = params.get("store");
  if (services.some((s) => s.id === params.get("service"))) {
    fields.service.value = params.get("service");
    fields.store.value = serviceStore(fields.service.value).id;
  }
  function syncServices() {
    const store = stores.find((s) => s.id === fields.store.value);
    for (const option of fields.service.options) {
      if (option.value)
        option.disabled = !store || !store.serviceIds.includes(option.value);
    }
    if (!serviceAvailableAt(fields.store.value, fields.service.value))
      fields.service.value =
        store?.serviceIds.length === 1 ? store.serviceIds[0] : "";
    $("#service-location-note").textContent = store
      ? `${store.specialty} at ${store.name}.`
      : "Choose a location to see its services.";
  }
  syncServices();
  const topic = serviceContent.find((s) => s.name === params.get("topic"));
  if (topic && !fields.notes.value)
    fields.notes.value = `I’m interested in ${topic.name.toLowerCase()}.`;
  if (params.get("product") && !fields.notes.value)
    fields.notes.value = `I’m interested in ${params.get("product").slice(0, 140)}.`;
  let requestKey = crypto.randomUUID(),
    generation = 0;
  async function refreshTimes() {
    const gen = ++generation;
    fields.time.disabled = true;
    fields.time.innerHTML = '<option value="">Choose a store & date</option>';
    if (!fields.store.value || !fields.date.value) return;
    try {
      const c = await client();
      const times = await c.query("appointments:availability", {
        store: fields.store.value,
        date: fields.date.value,
      });
      if (gen !== generation) return;
      fields.time.innerHTML =
        '<option value="">' +
        (times.length
          ? "Select a time"
          : "No times available — choose another day") +
        "</option>" +
        times
          .map(
            (t) =>
              `<option value="${t}">${Number(t.slice(0, 2)) > 12 ? Number(t.slice(0, 2)) - 12 : Number(t.slice(0, 2))}:00 ${Number(t.slice(0, 2)) >= 12 ? "PM" : "AM"}</option>`,
          )
          .join("");
      fields.time.disabled = !times.length;
      $("#booking-message").textContent = "";
    } catch (e) {
      if (gen === generation)
        notice($("#booking-message"), e.data || e.message);
    }
  }
  booking.addEventListener("change", (e) => {
    if (e.target.name === "store") syncServices();
    if (["store", "date"].includes(e.target.name)) refreshTimes();
  });
  if (!window.ACTION_AUDIO_CONFIG?.convexUrl)
    notice(
      $("#booking-message"),
      "Online booking is being prepared. Call (860) 667-6330 to arrange your visit.",
    );
  booking.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!booking.reportValidity()) return;
    const button = booking.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Sending your request…";
    try {
      if (!fields.time.value)
        throw new Error("Choose an available time before submitting.");
      const c = await client();
      const values = Object.fromEntries(new FormData(booking));
      const result = await c.mutation("appointments:create", {
        ...values,
        requestKey,
      });
      const code = result.trackingCode;
      booking.innerHTML = `<div class="booking-success" role="status" tabindex="-1"><h2>Appointment request received.</h2><p>Your appointment request is received. The ${esc(stores.find((s) => s.id === values.store)?.name)} team will contact you to confirm ${esc(values.date)} at ${esc(values.time)} ET.</p><div class="tracking-ticket"><span>Your private tracking code</span><code>${esc(code)}</code><button type="button" class="text-link" id="copy-tracking">Copy tracking link </button><small id="copy-message" aria-live="polite">Save this link to follow every update. Keep it private.</small></div><a class="button" id="new-tracking-link" href="/action-audio/track.html#${esc(code)}">Track my vehicle </a><p class="form-note">No payment is required to request an appointment.</p></div>`;
      $("#copy-tracking").addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText($("#new-tracking-link").href);
          $("#copy-message").textContent =
            "Tracking link copied. Keep it somewhere safe.";
        } catch {
          $("#copy-message").textContent =
            "Select and copy the code above, or save the tracking page as a bookmark.";
        }
      });
      booking.querySelector(".booking-success").focus();
      booking.scrollIntoView({ block: "start", behavior: "smooth" });
    } catch (err) {
      notice($("#booking-message"), err.data || err.message);
      $("#booking-message").focus();
      button.disabled = false;
      button.innerHTML = `Request an appointment `;
    }
  });
}
const estimateForm = $("#estimate-form");
if (estimateForm) {
  const fields = estimateForm.elements;
  const requested = serviceContent.find(s=>s.id===params.get("service"));
  if (requested) fields.service.value = requested.id;
  const showLocation = () => {
    const service = serviceContent.find(s=>s.id===fields.service.value);
    $("#estimate-location").textContent = service ? `${service.name} · ${serviceStore(service.booking).name}` : "Electronics in Wethersfield. Detailing in Hartford.";
  };
  fields.service.addEventListener("change",showLocation); showLocation();
  const requestKey = crypto.randomUUID();
  estimateForm.addEventListener("submit",async e=>{
    e.preventDefault(); if (!estimateForm.reportValidity()) return;
    const button = estimateForm.querySelector('button[type="submit"]');
    button.disabled=true;button.textContent="Sending request…";
    const values=Object.fromEntries(new FormData(estimateForm));
    try {
      const c=await client(); await c.mutation("estimates:create",{...values,requestKey});
      const service=serviceContent.find(s=>s.id===values.service),store=serviceStore(service.booking);
      estimateForm.innerHTML=`<div class="estimate-success" role="status" tabindex="-1"><h2>Estimate request received.</h2><p>The ${esc(store.name)} team will review your ${esc(service.name.toLowerCase())} request for your ${esc(values.vehicleMake)} ${esc(values.vehicleModel)} and call you at ${esc(values.phone)}.</p><p>No appointment has been reserved. We’ll discuss availability and approximate pricing when we call.</p><a class="text-link" href="/action-audio/services.html">Back to services</a></div>`;
      estimateForm.querySelector('.estimate-success').focus();
    } catch(err) { notice($("#estimate-message"),err.data||err.message);$("#estimate-message").focus();button.disabled=false;button.textContent="Request a call"; }
  });
}
const tracking = $("#tracking-form");
let unsubscribe, trackingTimer;
const dateLabel = (date) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
function renderJourney(target, a) {
  const p = journeyProgress(a),
    store = stores.find((s) => s.id === a.store);
  const last = a.updates.at(-1);
  target.innerHTML = `<article class="journey-card"><div class="journey-heading"><div><span class="badge">${esc(statusLabels[a.status])}</span><h2>${esc(services.find((s) => s.id === a.service)?.name || a.service)}</h2><p>${esc(store?.name)} · ${esc(dateLabel(a.date))} · ${esc(a.time)} ET</p></div><div class="journey-percent"><strong>${p.percent}<span>%</span></strong><span>${p.estimated ? "Estimated progress" : "Service milestone"}</span></div></div>${a.status === "cancelled" ? '<p class="notice">This appointment has been cancelled. Contact the store if you’d like to arrange another visit.</p>' : `<div class="journey-meter" role="progressbar" aria-label="${p.estimated ? "Estimated service progress" : "Service milestone"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}"><span style="width:${p.percent}%"></span></div><ol class="journey-stages">${progressStages.map((stage, i) => `<li class="${i < p.stage ? "done" : i === p.stage ? "current" : ""}" ${i === p.stage ? 'aria-current="step"' : ""}><span>${i < p.stage ? "✓" : String(i + 1)}</span><strong>${stage.label}</strong><small>${stage.description}</small></li>`).join("")}</ol>`}<div class="journey-note"><strong>${a.status === "completed" ? "Collected. Enjoy the drive." : a.status === "ready" ? "Your vehicle is ready for pickup." : p.paused ? "Your service is on hold while we wait for parts." : p.overdue ? "Awaiting an updated pickup estimate." : a.estimatedReadyDate ? `Target pickup · ${esc(dateLabel(a.estimatedReadyDate))}` : "Updates from the people working on your ride."}</strong><p>${a.status === "requested" ? "Your preferred time has been requested. Our team will contact you to confirm." : a.status === "ready" || a.status === "completed" ? "Our team has confirmed this milestone." : p.paused ? "Estimated movement is paused. The team will post an update when work can continue." : p.overdue ? "The target date has passed. Please wait for the team’s ready-for-pickup confirmation." : p.estimated ? "The percentage is a time-based estimate within the current confirmed stage. Only our team can move your vehicle to the next stage or mark it ready." : "Each milestone reflects a staff update. Your vehicle is ready only when our team confirms it."}</p></div><div class="journey-history"><h3>Your service updates</h3><span>All times Eastern</span><ol class="timeline">${[
    ...a.updates,
  ]
    .reverse()
    .map(
      (u) =>
        `<li><strong>${esc(statusLabels[u.status])}</strong><time>${esc(new Date(u.at).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }))} ET</time>${u.message ? `<p>${esc(u.message)}</p>` : ""}</li>`,
    )
    .join(
      "",
    )}</ol></div><p class="form-note">${last ? `Last team update ${esc(new Date(last.at).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }))} ET. ` : ""}This page updates automatically.</p></article>`;
}
if (tracking) {
  const initial = location.hash.slice(1);
  if (/^[a-f0-9]{32}$/i.test(initial)) tracking.elements.code.value = initial;
  tracking.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!tracking.reportValidity()) return;
    const target = $("#tracking-result"),
      button = tracking.querySelector("button");
    unsubscribe?.();
    clearInterval(trackingTimer);
    button.disabled = true;
    notice(target, "Looking up your vehicle…");
    try {
      const c = await client();
      const code = tracking.elements.code.value.trim().toLowerCase();
      history.replaceState(null, "", location.pathname + "#" + code);
      unsubscribe = c.onUpdate(
        "appointments:track",
        { code },
        (a) => {
          button.disabled = false;
          clearInterval(trackingTimer);
          if (!a) {
            notice(
              target,
              "We couldn’t find that code. Double-check it or contact the store for help.",
            );
            return;
          }
          renderJourney(target, a);
          clearInterval(trackingTimer);
          trackingTimer = setInterval(() => renderJourney(target, a), 60000);
        },
        (err) => {
          button.disabled = false;
          clearInterval(trackingTimer);
          notice(target, err.data || err.message);
        },
      );
    } catch (err) {
      button.disabled = false;
      notice(target, err.data || err.message);
    }
  });
  if (initial) tracking.requestSubmit();
}
if ($("#inventory-results")) {
  const preview =
    window.ACTION_AUDIO_CONFIG?.inventoryPreview === true ||
    !window.ACTION_AUDIO_CONFIG?.convexUrl;
  let products = [];
  const previewNotice = document.createElement("div");
  previewNotice.className = "inventory-preview-note";
  previewNotice.hidden = !preview;
  previewNotice.innerHTML =
    "<strong>Explore manufacturer examples</strong><p>Browse example models with original category illustrations, not exact product photographs. Manufacturer links show model details. Confirm pricing, fit, and availability with our Wethersfield team.</p>";
  $(".filters").before(previewNotice);
  const render = () => {
    const search = $("#inventory-search").value.toLowerCase();
    const category = $("#inventory-category").value;
    const store = $("#inventory-store").value;
    const filtered = products.filter(
      (p) =>
        (preview || !store || p.store === store) &&
        (!category ||
          p.category === category ||
          (category === "Car audio" &&
            ["Speakers", "Subwoofers", "Amplifiers", "Receivers"].includes(
              p.category,
            ))) &&
        `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(search),
    );
    document
      .querySelectorAll("[data-category]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(
            button.dataset.category === category ||
              (button.dataset.category === "Car audio" &&
                ["Speakers", "Subwoofers", "Amplifiers", "Receivers"].includes(
                  category,
                )),
          ),
        ),
      );
    const guide = serviceContent.find((s) => s.category === category);
    const guideNode = $("#category-guide");
    guideNode.hidden = !guide;
    guideNode.className = "category-guide";
    guideNode.innerHTML = guide
      ? `<div><h2>${esc(guide.name)}</h2><p>${esc(guide.description)}</p></div><a class="text-link" href="/action-audio/${guide.id}.html">Explore this service </a>`
      : "";
    $("#inventory-count").textContent = products.length
      ? `${filtered.length} ${preview ? "sample " : ""}product${filtered.length === 1 ? "" : "s"}`
      : "";
    $("#inventory-results").innerHTML = filtered.length
      ? filtered
          .map(
            (p) =>
              `<article class="product-card"><div class="product-image${preview ? " preview-product-image" : ""}">${p.imageUrl?.startsWith("https://") || (preview && p.imageUrl?.startsWith("/action-audio/assets/gear-")) ? `<img src="${esc(p.imageUrl)}" alt="${esc(preview ? p.category + " — original category illustration, not the exact model" : p.name)}" loading="lazy" referrerpolicy="no-referrer">` : '<span class="image-unavailable">Product image unavailable</span>'}</div><div class="product-content"><span class="product-category">${esc(p.brand)} · ${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-meta"><span>${esc(preview ? "Sample product" : stores.find((s) => s.id === p.store)?.name)}</span><span>${preview ? "Confirm availability" : esc({ in_stock: "In stock", order: "Available to order", unavailable: "Currently unavailable" }[p.availability])}</span></div><strong>${p.price !== undefined ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.price) : "Contact us for pricing"}</strong><p style="margin-top:18px"><a class="text-link" href="/action-audio/book.html?store=wethersfield&service=electrical-installation&product=${encodeURIComponent(p.name)}">Ask about this product </a></p>${preview ? `<a class="product-source" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Manufacturer details (opens in new tab)</a>` : ""}</div></article>`,
          )
          .join("")
      : `<div class="empty-state"><h2>${guide && !search ? "Let’s find your fit." : products.length ? "No matching products." : "Ask about current stock."}</h2><p>${guide && !search ? "Contact our team for compatible options and current availability in this category." : products.length ? "Try another search or category." : "Our electronics catalog is being updated. Ask our team about current stock and pricing."}</p><a class="button" href="/action-audio/book.html">Ask about a product </a></div>`;
  };
  ["#inventory-search", "#inventory-category", "#inventory-store"].forEach(
    (s) => $(s).addEventListener("input", render),
  );
  const categorySelect = $("#inventory-category");
  if (
    [...categorySelect.options].some(
      (option) => option.value === params.get("category"),
    )
  )
    categorySelect.value = params.get("category");
  document.querySelectorAll("[data-category]").forEach((button) =>
    button.addEventListener("click", () => {
      categorySelect.value = button.dataset.category;
      render();
    }),
  );
  if (preview) {
    import("./shared/inventory-preview.js?v=42154ceeca37")
      .then(({ previewProducts }) => {
        products = previewProducts;
        render();
      })
      .catch(() =>
        notice(
          $("#inventory-results"),
          "Product preview is unavailable. Please contact the store.",
        ),
      );
  } else
    client()
      .then((c) =>
        c.onUpdate(
          "inventory:publicList",
          {},
          (data) => {
            products = data;
            render();
          },
          () => {
            notice(
              $("#inventory-results"),
              "Electronics are temporarily unavailable. Please contact the store for current stock.",
            );
          },
        ),
      )
      .catch((e) => notice($("#inventory-results"), e.data || e.message));
}

// Pause for keyboard interaction, reduced motion, hover, and background tabs.
const carousel = $(".slideshow");
if (carousel) {
  const slides = [...carousel.querySelectorAll("[data-slide]")];
  const dots = [...carousel.querySelectorAll("[data-slide-to]")];
  const play = carousel.querySelector(".slide-play");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let paused = motion.matches;
  let hovered = false;
  let timer;
  const updatePlay = () => {
    play.textContent = paused ? "Play" : "Pause";
    play.setAttribute(
      "aria-label",
      paused ? "Play slideshow" : "Pause slideshow",
    );
  };
  function schedule() {
    clearInterval(timer);
    if (!paused && !hovered && !document.hidden)
      timer = setInterval(() => show(current + 1, false), 6500);
  }
  function show(index, announce = true) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      slide.classList.toggle("is-active", i === current);
      dots[i].setAttribute("aria-pressed", String(i === current));
    });
    if (announce)
      carousel.querySelector(".slide-status").textContent =
        `Slide ${current + 1} of ${slides.length}: ${slides[current].querySelector("h2").innerText.replace(/\s+/g, " ")}`;
    schedule();
  }
  const manualShow = (index) => {
    paused = true;
    updatePlay();
    show(index);
  };
  dots.forEach((dot, i) => dot.addEventListener("click", () => manualShow(i)));
  carousel
    .querySelector(".slide-prev")
    .addEventListener("click", () => manualShow(current - 1));
  carousel
    .querySelector(".slide-next")
    .addEventListener("click", () => manualShow(current + 1));
  let pointerPaused;
  play.addEventListener("pointerdown", () => {
    pointerPaused = paused;
  });
  play.addEventListener("click", () => {
    paused = !(pointerPaused ?? paused);
    pointerPaused = undefined;
    updatePlay();
    schedule();
  });
  carousel.addEventListener("mouseenter", () => {
    hovered = true;
    schedule();
  });
  carousel.addEventListener("mouseleave", () => {
    hovered = false;
    schedule();
  });
  carousel.addEventListener("focusin", () => {
    paused = true;
    updatePlay();
    schedule();
  });
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      manualShow(current + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });
  motion.addEventListener("change", () => {
    if (motion.matches) paused = true;
    updatePlay();
    schedule();
  });
  document.addEventListener("visibilitychange", schedule);
  updatePlay();
  schedule();
}
