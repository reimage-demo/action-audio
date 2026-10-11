(() => {
  const key = "actionAudioCookieChoice.v1";
  const duration = 180 * 24 * 60 * 60 * 1000;
  let choice = null;
  let returnFocus = null;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && ["accepted", "denied"].includes(saved.value) && saved.expiresAt > Date.now()) choice = saved.value;
  } catch { /* The controls still work when browser storage is unavailable. */ }

  const call = document.createElement("a");
  call.className = "floating-call";
  call.href = "tel:8606676330";
  call.setAttribute("aria-label", "Call Action Audio in Wethersfield at (860) 667-6330");
  call.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z"/></svg><span>Call store</span>';
  document.body.append(call);

  const notice = document.createElement("section");
  notice.className = "cookie-notice";
  notice.hidden = true;
  notice.setAttribute("aria-labelledby", "cookie-title");
  notice.innerHTML = '<h2 id="cookie-title">Your cookie choices.</h2><p>Essential storage remembers your choice. We currently use no analytics or advertising cookies. Accept or deny optional cookies; change your choice anytime.</p><a href="/privacy.html#cookies">Privacy & cookies</a><div class="cookie-actions"><button type="button" data-cookie-choice="denied">Deny</button><button type="button" data-cookie-choice="accepted">Accept</button></div>';
  document.body.append(notice);

  function updateStatus() {
    document.querySelectorAll("[data-cookie-status]").forEach(element => {
      element.textContent = choice ? `Your current choice: optional cookies ${choice}.` : "You have not saved a cookie choice. Optional cookies are off.";
    });
  }
  function show(open) {
    notice.hidden = !open;
  }
  document.querySelectorAll("[data-cookie-settings]").forEach(button => button.addEventListener("click", () => {
    returnFocus = button;
    show(true);
    notice.querySelector("button").focus({ preventScroll: true });
  }));
  notice.querySelectorAll("[data-cookie-choice]").forEach(button => button.addEventListener("click", () => {
    choice = button.dataset.cookieChoice;
    try { localStorage.setItem(key, JSON.stringify({ value: choice, expiresAt: Date.now() + duration })); } catch { /* A blocked preference is retained for this page only. */ }
    show(false);
    updateStatus();
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    else call.focus({ preventScroll: true });
    returnFocus = null;
  }));
  updateStatus();
  show(!choice);
  // There are no optional tracking scripts. A saved acceptance does not load any.
})();
