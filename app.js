import { estimateQuestions, detailPrompts, defaultDetailPrompt } from "./shared/estimate-intake.js?v=dcc51a9d16a8";
import { beginSubmission, submissionError } from "./shared/request-feedback.js?v=dcc51a9d16a8";
import { imageMarkup } from "./shared/images.js?v=dcc51a9d16a8";
import {
  stores,
  services,
  statusLabels,
  serviceStore,
  serviceAvailableAt,
} from "./shared/catalog.js?v=dcc51a9d16a8";
import { serviceContent } from "./shared/service-content.js?v=dcc51a9d16a8";
import { journeyProgress, progressStages } from "./shared/progress.js?v=dcc51a9d16a8";
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
function setMenuOpen(open) {
  menu?.setAttribute("aria-expanded", String(open));
  menu?.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  document.querySelector("#navigation")?.classList.toggle("open", open);
}
menu?.addEventListener("click", () => setMenuOpen(menu.getAttribute("aria-expanded") !== "true"));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menu.focus();
  }
});
document.addEventListener("click", (event) => {
  if (menu?.getAttribute("aria-expanded") === "true" && !event.target.closest("header")) setMenuOpen(false);
});
matchMedia("(max-width: 820px)").addEventListener("change", () => setMenuOpen(false));
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
    clientPromise = import("/assets/convex-client.js").then(
      ({ ConvexClient }) => new ConvexClient(url),
    );
  return clientPromise;
}
const notice = (node, message) => {
  node.innerHTML = `<div class="notice">${esc(message)}</div>`;
};
document.querySelectorAll("#booking-form,#estimate-form,#tracking-form").forEach(form=>form.addEventListener("focusin",()=>{client().catch(()=>{});},{once:true}));
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
    if (fields.service.value && !serviceAvailableAt(fields.store.value, fields.service.value)) fields.service.value = "";
    $("#service-location-note").textContent = store
      ? `${store.specialty} · ${store.address}, ${store.city}.`
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
    fields.time.removeAttribute("aria-busy");
    fields.time.innerHTML = '<option value="">Choose a store & date</option>';
    if (!fields.store.value || !fields.date.value) return;
    fields.time.innerHTML = '<option value="">Loading available times…</option>';
    fields.time.setAttribute("aria-busy","true");
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
      if (gen === generation) {
        fields.time.innerHTML = '<option value="">Unable to load times — select the date again</option>';
        notice($("#booking-message"), "Available times could not be loaded. Select your date again to retry, or call (860) 667-6330.");
      }
    } finally { if(gen === generation) fields.time.removeAttribute("aria-busy"); }
  }
  booking.addEventListener("change", (e) => {
    if (e.target.name === "service" && fields.service.value) {
      fields.store.value = serviceStore(fields.service.value).id;
      syncServices();
      refreshTimes();
    }
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
    if (booking.dataset.submitting || !booking.reportValidity()) return;
    const button = booking.querySelector("button[type=submit]");
    const values = Object.fromEntries(new FormData(booking));
    const finish = beginSubmission(booking,button,$("#booking-message"));
    try {
      if (!navigator.onLine) throw new Error("Offline");
      if (!values.time)
        throw new Error("Choose an available time before submitting.");
      const c = await client();
      const result = await c.mutation("appointments:create", {
        ...values,
        requestKey,
      });
      const code = result.trackingCode;
      booking.innerHTML = `<div class="booking-success" role="status" tabindex="-1"><h2>Appointment request received.</h2><p>Your appointment request is received. The ${esc(stores.find((s) => s.id === values.store)?.name)} team will contact you to confirm ${esc(values.date)} at ${esc(values.time)} ET.</p><div class="tracking-ticket"><span>Your private tracking code</span><code>${esc(code)}</code><button type="button" class="text-link" id="copy-tracking">Copy tracking link </button><small id="copy-message" aria-live="polite">Save this link to follow every update. Keep it private.</small></div><a class="button" id="new-tracking-link" href="/track.html#${esc(code)}">Track my vehicle </a><p class="form-note">No payment is required to request an appointment.</p></div>`;
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
      booking.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    } catch (err) {
      submissionError($("#booking-message"),err);
    } finally { finish(); }
  });
}
const estimateForm = $("#estimate-form");
if (estimateForm) {
  const fields = estimateForm.elements;
  const requested = serviceContent.find(s=>s.id===params.get("service"));
  if (requested) fields.service.value = requested.id;
  if (params.get("product")) fields.details.value = `I’m interested in ${params.get("product").slice(0, 140)}.`;
  const answerDrafts = new Map();
  let activeService = "";
  function showLocation() {
    if (activeService) answerDrafts.set(activeService, Array.from(document.querySelectorAll("[data-estimate-answer]")).map(el => [el.dataset.estimateAnswer, el.value]));
    const service = serviceContent.find(s=>s.id===fields.service.value);
    const store = service && serviceStore(service.booking);
    $("#estimate-location").innerHTML = store ? `<strong>${esc(store.name)} · selected for ${esc(service.name.toLowerCase())}</strong><span>${esc(store.address)}, ${esc(store.city)}</span>` : "Your service selects the right store automatically.";
    $("#estimate-project").hidden = !service;
    fields.details.required = Boolean(service);
    fields.details.placeholder = detailPrompts[service?.id] || defaultDetailPrompt;
    $("#estimate-questions").innerHTML = (estimateQuestions[service?.id] || []).map(q => `<label>${esc(q.label)}<select data-estimate-answer="${esc(q.id)}" required><option value="">Choose an option</option>${q.options.map(value=>`<option>${esc(value)}</option>`).join("")}</select></label>`).join("");
    for (const [id, value] of answerDrafts.get(service?.id) || []) document.querySelector(`[data-estimate-answer="${id}"]`).value = value;
    const bookingLink = $("#estimate-booking-link");
    if (bookingLink) bookingLink.href = service ? `/book.html?store=${store.id}&service=${service.booking}&topic=${encodeURIComponent(service.name)}` : "/book.html";
    activeService = service?.id || "";
  }
  fields.service.addEventListener("change",showLocation); showLocation();
  fields.vehicleYear.addEventListener("input", () => {
    const value = Number(fields.vehicleYear.value), max = new Date().getFullYear() + 2;
    fields.vehicleYear.setCustomValidity(value >= 1900 && value <= max ? "" : `Enter a vehicle year from 1900 to ${max}.`);
  });
  const requestKey = crypto.randomUUID();
  estimateForm.addEventListener("submit",async e=>{
    e.preventDefault(); if (estimateForm.dataset.submitting || !estimateForm.reportValidity()) return;
    const button = estimateForm.querySelector('button[type="submit"]');
    const values=Object.fromEntries(new FormData(estimateForm));
    values.answers = Array.from(document.querySelectorAll("[data-estimate-answer]")).map(el => ({id:el.dataset.estimateAnswer, value:el.value}));
    const finish=beginSubmission(estimateForm,button,$("#estimate-message"));
    try {
      if (!navigator.onLine) throw new Error("Offline");
      const c=await client(); await c.mutation("estimates:create",{...values,requestKey});
      const service=serviceContent.find(s=>s.id===values.service),store=serviceStore(service.booking);
      estimateForm.innerHTML=`<div class="estimate-success" role="status" tabindex="-1"><h2>Estimate request received.</h2><p>The ${esc(store.name)} team will review your ${esc(service.name.toLowerCase())} request for your ${esc(values.vehicleYear)} ${esc(values.vehicleMake)} ${esc(values.vehicleModel)} and call you at ${esc(values.phone)}.</p><p>No appointment has been reserved. We’ll discuss availability and approximate pricing when we call.</p><a class="text-link" href="/services.html">Back to services</a></div>`;
      estimateForm.querySelector('.estimate-success').focus();
    } catch(err) { submissionError($("#estimate-message"),err); } finally { finish(); }
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
    if (tracking.querySelector("button").disabled || !tracking.reportValidity()) return;
    const target = $("#tracking-result"),
      button = tracking.querySelector("button");
    unsubscribe?.();
    clearInterval(trackingTimer);
    button.disabled = true;
    button.textContent="Checking…";button.classList.add("is-loading");
    notice(target, "Looking up your vehicle…");
    try {
      const c = await client();
      const code = tracking.elements.code.value.trim().toLowerCase();
      history.replaceState(null, "", location.pathname + "#" + code);
      unsubscribe = c.onUpdate(
        "appointments:track",
        { code },
        (a) => {
          button.disabled = false;button.textContent="Check my vehicle";button.classList.remove("is-loading");
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
          button.disabled = false;button.textContent="Check my vehicle";button.classList.remove("is-loading");
          clearInterval(trackingTimer);
          notice(target, err.data || err.message);
        },
      );
    } catch (err) {
      button.disabled = false;button.textContent="Check my vehicle";button.classList.remove("is-loading");
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
      ? `<div><h2>${esc(guide.name)}</h2><p>${esc(guide.description)}</p></div><a class="text-link" href="/${guide.id}.html">Explore this service </a>`
      : "";
    $("#inventory-count").textContent = products.length
      ? `${filtered.length} ${preview ? "sample " : ""}product${filtered.length === 1 ? "" : "s"}`
      : "";
    $("#inventory-results").innerHTML = filtered.length
      ? filtered
          .map(
            (p) =>
              `<article class="product-card"><div class="product-image${preview ? " preview-product-image" : ""}">${p.imageUrl?.startsWith("https://") || (preview && p.imageUrl?.startsWith("/assets/gear-")) ? (preview ? imageMarkup(p.imageUrl.split(/\//).at(-1),p.category + " — original category illustration, not the exact model",{sizes:"(max-width: 760px) 100vw, 400px"}) : `<img src="${esc(p.imageUrl)}" alt="${esc(p.name)}" width="800" height="600" loading="lazy" decoding="async" referrerpolicy="no-referrer">`) : '<span class="image-unavailable">Product image unavailable</span>'}</div><div class="product-content"><span class="product-category">${esc(p.brand)} · ${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-meta"><span>${esc(preview ? "Sample product" : stores.find((s) => s.id === p.store)?.name)}</span><span>${preview ? "Confirm availability" : esc({ in_stock: "In stock", order: "Available to order", unavailable: "Currently unavailable" }[p.availability])}</span></div><strong>${p.price !== undefined ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.price) : "Contact us for pricing"}</strong><p style="margin-top:18px"><a class="text-link" href="/estimate.html?service=electrical-installation&product=${encodeURIComponent(p.name)}">Ask about this product </a></p>${preview ? `<a class="product-source" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Manufacturer details (opens in new tab)</a>` : ""}</div></article>`,
          )
          .join("")
      : `<div class="empty-state"><h2>${guide && !search ? "Let’s find your fit." : products.length ? "No matching products." : "Ask about current stock."}</h2><p>${guide && !search ? "Contact our team for compatible options and current availability in this category." : products.length ? "Try another search or category." : "Our electronics catalog is being updated. Ask our team about current stock and pricing."}</p><a class="button" href="/book.html">Ask about a product </a></div>`;
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
    import("./shared/inventory-preview.js?v=dcc51a9d16a8")
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
  let slideRequest = 0;
  const loadedSlides = new Map();
  function prepare(index) {
    const target=(index+slides.length)%slides.length;
    if(!loadedSlides.has(target)) loadedSlides.set(target,(async()=>{
      const images=[...slides[target].querySelectorAll("img")];
      images.forEach(image=>{image.loading="eager";image.fetchPriority="low";});
      const image=slides[target].querySelector('.hero-photo img');
      if(image) await image.decode();
    })().catch(error=>{loadedSlides.delete(target);throw error;}));
    return loadedSlides.get(target);
  }
  function warmNext() {
    if(navigator.connection?.saveData || document.hidden) return;
    prepare(current+1).catch(()=>{});
  }
  async function show(index, announce = true) {
    const target=(index+slides.length)%slides.length;
    const request=++slideRequest;
    const status=carousel.querySelector('.slide-status');
    if(announce)status.textContent='Loading the next picture…';
    carousel.setAttribute('aria-busy','true');
    try {
      await prepare(target);
      if(request!==slideRequest)return;
      current=target;
      slides.forEach((slide,i)=>{
        slide.hidden=i!==current;
        slide.classList.toggle('is-active',i===current);
        dots[i].setAttribute('aria-pressed',String(i===current));
      });
      if(announce)status.textContent=`Slide ${current+1} of ${slides.length}: ${slides[current].querySelector('h2').innerText.replace(/\s+/g,' ')}`;
      warmNext();
    } catch {
      if(request===slideRequest)status.textContent='This picture could not load. Your current slide is still available. Try Next again.';
    } finally {
      if(request===slideRequest){carousel.removeAttribute('aria-busy');schedule();}
    }
  }
  const firstImage=slides[0].querySelector('.hero-photo img');
  const warmWhenReady=()=>{
    if('requestIdleCallback' in window)requestIdleCallback(warmNext,{timeout:2000});
    else setTimeout(warmNext,500);
  };
  if(firstImage.complete)warmWhenReady();else firstImage.addEventListener('load',warmWhenReady,{once:true});
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
