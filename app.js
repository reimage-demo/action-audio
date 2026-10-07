import { stores, services, statusLabels } from "./shared/catalog.js";
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
  if (services.some((s) => s.id === params.get("service")))
    fields.service.value = params.get("service");
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
      booking.innerHTML = `<div class="notice" role="status"><h2>Appointment request received.</h2><p>Our team will contact you to confirm your appointment. Save your private tracking code:</p><code>${esc(code)}</code><p>This code lets you view your service updates. Keep it somewhere safe.</p><a class="button" href="/action-audio/track.html#${esc(code)}">Track my vehicle </a></div>`;
      booking.scrollIntoView({ block: "start", behavior: "smooth" });
    } catch (err) {
      notice($("#booking-message"), err.data || err.message);
      $("#booking-message").focus();
      button.disabled = false;
      button.innerHTML = `Request an appointment `;
    }
  });
}
const tracking = $("#tracking-form");
let unsubscribe;
if (tracking) {
  const initial = location.hash.slice(1);
  if (/action-audio/^[a-f0-9]{32}$/i.test(initial)) tracking.elements.code.value = initial;
  tracking.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!tracking.reportValidity()) return;
    const target = $("#tracking-result"),
      button = tracking.querySelector("button");
    unsubscribe?.();
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
          if (!a) {
            notice(
              target,
              "We couldn’t find that code. Double-check it or contact the store for help.",
            );
            return;
          }
          target.innerHTML = `<article class="form-panel"><span class="badge">${esc(statusLabels[a.status])}</span><h2 style="font-size:28px;margin:20px 0 10px">${esc(services.find((s) => s.id === a.service)?.name || a.service)}</h2><p>${esc(stores.find((s) => s.id === a.store)?.name)} · ${esc(a.date)} · ${esc(a.time)} ET</p><ol class="timeline">${[
            ...a.updates,
          ]
            .reverse()
            .map(
              (u) =>
                `<li><strong>${esc(statusLabels[u.status])}</strong><time>${esc(new Date(u.at).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }))} ET</time>${u.message ? `<p>${esc(u.message)}</p>` : ""}</li>`,
            )
            .join("")}</ol></article>`;
        },
        (err) => {
          button.disabled = false;
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
    "<strong>Sample inventory · Client preview</strong><p>Examples from brands Action Audio carries. Photos and specifications come from the manufacturers. Specific models, pricing, and availability at either store are not confirmed.</p>";
  $(".filters").before(previewNotice);
  const render = () => {
    const search = $("#inventory-search").value.toLowerCase();
    const category = $("#inventory-category").value;
    const store = $("#inventory-store").value;
    const filtered = products.filter(
      (p) =>
        (preview || !store || p.store === store) &&
        (!category || p.category === category) &&
        `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(search),
    );
    $("#inventory-count").textContent = products.length
      ? `${filtered.length} ${preview ? "sample " : ""}product${filtered.length === 1 ? "" : "s"}`
      : "";
    $("#inventory-results").innerHTML = filtered.length
      ? filtered
          .map(
            (p) =>
              `<article class="product-card"><div class="product-image${preview ? " preview-product-image" : ""}">${p.imageUrl?.startsWith("https://") || (preview && p.imageUrl?.startsWith("/action-audio/assets/products/")) ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer">` : '<span class="image-unavailable">Product image unavailable</span>'}</div><div class="product-content"><span class="product-category">${esc(p.brand)} · ${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-meta"><span>${esc(preview ? "Sample product" : stores.find((s) => s.id === p.store)?.name)}</span><span>${preview ? "Confirm availability" : esc({ in_stock: "In stock", order: "Available to order", unavailable: "Currently unavailable" }[p.availability])}</span></div><strong>${p.price !== undefined ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.price) : "Contact us for pricing"}</strong><p style="margin-top:18px"><a class="text-link" href="/action-audio/book.html${(preview ? store : p.store) ? `?store=${esc(preview ? store : p.store)}` : ""}">Ask about this product </a></p>${preview ? `<a class="product-source" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Manufacturer details (opens in new tab)</a>` : ""}</div></article>`,
          )
          .join("")
      : `<div class="empty-state"><h2>${products.length ? "No matching products." : "Ask about current stock."}</h2><p>${products.length ? "Try another search, category, or store." : "Our online inventory is being updated. Ask our team about current stock and pricing."}</p><a class="button" href="/action-audio/book.html">Ask about a product </a></div>`;
  };
  ["#inventory-search", "#inventory-category", "#inventory-store"].forEach(
    (s) => $(s).addEventListener("input", render),
  );
  if (preview) {
    import("./shared/inventory-preview.js")
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
              "Inventory is temporarily unavailable. Please contact the store for current stock.",
            );
          },
        ),
      )
      .catch((e) => notice($("#inventory-results"), e.data || e.message));
}
