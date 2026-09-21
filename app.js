/* SIG Lodges v2.1 — vanilla JS, no dependencies, shared across all pages. */
(function () {
  "use strict";

  /* =====================================================================
     CONFIG (edit these — no code changes needed)
     ===================================================================== */
  /* Reservations inboxes — one per lodge, plus the SIG Lodges umbrella inbox.
     On a lodge site the inquiry form and the request-to-book fallback go to the
     lodge the guest picked, and "Either / not sure" reaches both lodges.
     Two <body> attributes steer it:
       data-site-lodge — whose inbox this page's own links use ("or email …", footer)
       data-site-inbox — if set, EVERY form inquiry on this site goes here instead
                         of the picked lodge. hut.rip uses it so umbrella inquiries
                         land with SIG rather than a single lodge; the picked lodge
                         is still named in the message body. */
  var LODGE_EMAILS = {
    "Lost Trail Lodge": "losttraillodgetruckee@gmail.com",
    "Thelma Hut":       "redmtnthelma@gmail.com"
  };
  var SIG_EMAIL = "siglodges@gmail.com";   // hut.rip — the SIG Lodges umbrella inbox
  var WHATSAPP_NUMBER = "";          // digits only, country code first. "" hides the button.
  var FORM_ENDPOINT = "";            // POST URL (Formspree/HubSpot). "" → prefilled email fallback.

  /* Booking — Lodgify portable search bar (Website builder → External widgets).
     One widget per website (661257), so there is no per-rental id: Search opens
     the Lodgify all-properties results page in a new tab. Only the button colour
     differs per lodge, so the widget matches the page it sits on.
     To re-theme, edit the colours below; to swap in a newer snippet from Lodgify,
     replace the markup and keep the ${c.*} substitutions. */
  function lodgifySearchBar(c) {
    return `<script src="https://app.lodgify.com/portable-search-bar/stable/renderPortableSearchBar.js" defer></script>
<style>
  :root{
    --ldg-psb-background:#ffffff;--ldg-psb-border-radius:0.42em;
    --ldg-psb-box-shadow:0px 24px 54px 0px rgba(0,0,0,0.1);--ldg-psb-padding:14px;
    --ldg-psb-input-background:#ffffff;--ldg-psb-button-border-radius:3.58em;
    --ldg-psb-color-primary:${c.primary};--ldg-psb-color-primary-lighter:${c.lighter};
    --ldg-psb-color-primary-darker:${c.darker};--ldg-psb-color-primary-contrast:#ffffff;
    --ldg-semantic-color-primary:${c.primary};--ldg-semantic-color-primary-lighter:${c.lighter};
    --ldg-semantic-color-primary-darker:${c.darker};--ldg-semantic-color-primary-contrast:#ffffff;
    --ldg-component-modal-z-index:999;
  }
  #lodgify-search-bar{width:100%;}
</style>
<div id="lodgify-search-bar" data-website-id="661257" data-language-code="en" data-search-page-url='https://siglodges.lodgify.com/en/all-properties' data-dates-check-in-label='Check-in' data-dates-check-out-label='Check-out' data-guests-counter-label='Guests' data-guests-input-singular-label='{{NumberOfGuests}} guest' data-guests-input-plural-label='{{NumberOfGuests}} guests' data-location-input-label='Location' data-search-button-label='Search' data-dates-input-min-stay-tooltip-text='{"one":"Minimum {minStay} night","other":"Minimum {minStay} nights"}' data-guests-breakdown-label='Guests' data-adults-label='{"one":"adult","other":"adults"}' data-adults-description='Ages {minAge} or above' data-children-label='{"one":"child","other":"children"}' data-children-description='Ages {minAge}-{maxAge}' data-children-not-allowed-label='Not suitable for children' data-infants-label='{"one":"infant","other":"infants"}' data-infants-description='Under {maxAge}' data-infants-not-allowed-label='Not suitable for infants' data-pets-label='{"one":"pet","other":"pets"}' data-pets-not-allowed-label='Not allowed' data-done-label='Done' data-new-tab="true" data-version="stable" data-has-guests-breakdown></div>`;
  }
  var LODGIFY = {
    lt:  { name: "Lost Trail Lodge", url: "", embedHtml: lodgifySearchBar({primary:"#1f4d3a", lighter:"#2e6b4f", darker:"#163a2b"}) },
    rmp: { name: "Thelma Hut",       url: "", embedHtml: lodgifySearchBar({primary:"#294a6b", lighter:"#3d6491", darker:"#1d3a52"}) }
  };

  /* Instagram — set the handle (no @). For a LIVE auto-updating feed, add a
     Behold.so feed id (behold.so) OR a LightWidget id (lightwidget.com).
     With no feed id, the static photo grid + Follow button stand in. */
  var INSTAGRAM = {
    handle: "",            // e.g. "siglodges"  ← Matt: drop the handle here
    beholdId: "",
    lightwidgetId: ""
  };

  /* Google reviews — create the SIG Google Business Profile, then paste a
     widget embed (Elfsight / Featurable / Trustindex) and/or a headline rating.
     Until set, the seeded carousel stands in. */
  var GOOGLE_REVIEWS = {
    embedHtml: "",         // widget embed code
    ratingText: ""         // e.g. "4.9 on Google · 36 reviews"
  };
  /* ===================================================================== */

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function isAlpine() { return document.body.classList.contains("theme-alpine"); }

  /* Inboxes for a name. "SIG Lodges" is the umbrella inbox; a lodge name is its
     own; unknown, blank or "Either / not sure" reaches both lodges. */
  function lodgeEmails(name) {
    if (name === "SIG Lodges") return [SIG_EMAIL];
    var one = LODGE_EMAILS[name];
    if (one) return [one];
    return Object.keys(LODGE_EMAILS).map(function (k) { return LODGE_EMAILS[k]; });
  }
  function mailTo(name) { return lodgeEmails(name).join(","); }
  var SITE_LODGE = document.body.getAttribute("data-site-lodge") || "";
  var SITE_INBOX = document.body.getAttribute("data-site-inbox") || "";

  /* Re-run <script> tags inside injected HTML (embeds often include them). */
  function runScripts(container) {
    $$("script", container).forEach(function (old) {
      var s = document.createElement("script");
      Array.prototype.forEach.call(old.attributes, function (a) { s.setAttribute(a.name, a.value); });
      if (!old.src) s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  /* ---- Year ---- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Sticky nav ---- */
  var nav = $("#nav");
  var onScroll = function () { if (nav) nav.classList.toggle("scrolled", window.scrollY > 40); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Scroll reveals ---- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Pre-select lodge from any [data-lodge] button (home CTAs, if present) ---- */
  var lodgeSel = $("#lodge");
  $$("[data-lodge]").forEach(function (btn) {
    if (btn.id === "bookingWidget") return; // that's the booking mount, not a button
    btn.addEventListener("click", function () {
      if (!lodgeSel) return;
      lodgeSel.value = btn.getAttribute("data-lodge") === "rmp" ? "Thelma Hut" : "Lost Trail Lodge";
    });
  });

  /* ---- Contact: WhatsApp + email (inquiry section + footer) ---- */
  var waBtn = $("#waBtn"), footerWa = $("#footerWa");
  if (WHATSAPP_NUMBER) {
    var waHref = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" +
      encodeURIComponent("Hi SIG Lodges — I'd like to ask about a stay.");
    if (waBtn) waBtn.href = waHref;
    if (footerWa) { footerWa.href = waHref; footerWa.hidden = false; }
  } else if (waBtn) {
    waBtn.style.display = "none";
  }
  var emailLink = $("#emailLink"), footerEmail = $("#footerEmail");
  var mailHref = "mailto:" + mailTo(SITE_LODGE) + "?subject=" + encodeURIComponent("SIG Lodges — inquiry");
  if (emailLink) { emailLink.textContent = lodgeEmails(SITE_LODGE).join(" or "); emailLink.href = mailHref; }
  if (footerEmail) { footerEmail.href = mailHref; }

  /* ---- Reviews carousel ---- */
  function initCarousel(root) {
    var viewport = $("[data-carousel-viewport]", root);
    var track = $("[data-carousel-track]", root);
    if (!viewport || !track) return;
    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) return;
    var prev = $("[data-carousel-prev]", root);
    var next = $("[data-carousel-next]", root);
    var dotsWrap = $("[data-carousel-dots]", root);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function step() {
      if (slides.length > 1) {
        return Math.round(slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left) || viewport.clientWidth;
      }
      return slides[0].getBoundingClientRect().width || viewport.clientWidth;
    }
    function index() { return Math.round(viewport.scrollLeft / (step() || 1)); }
    function go(i) {
      i = Math.max(0, Math.min(i, slides.length - 1));
      viewport.scrollTo({ left: step() * i, behavior: reduce ? "auto" : "smooth" });
    }

    var dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      dotsWrap.removeAttribute("aria-hidden");
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", function () { go(i); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }
    function update() {
      var idx = index();
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === idx ? "true" : "false"); });
      if (prev) prev.disabled = viewport.scrollLeft <= 2;
      if (next) next.disabled = viewport.scrollLeft >= (viewport.scrollWidth - viewport.clientWidth - 2);
    }

    if (prev) prev.addEventListener("click", function () { go(index() - 1); });
    if (next) next.addEventListener("click", function () { go(index() + 1); });
    viewport.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index() + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(index() - 1); }
    });

    var ms = parseInt(root.getAttribute("data-autoplay"), 10);
    var timer = null;
    function play() {
      if (!ms || reduce || timer) return;
      timer = setInterval(function () {
        var atEnd = viewport.scrollLeft >= (viewport.scrollWidth - viewport.clientWidth - 2);
        go(atEnd ? 0 : index() + 1);
      }, ms);
    }
    function pause() { if (timer) { clearInterval(timer); timer = null; } }
    ["mouseenter", "focusin", "pointerdown", "touchstart"].forEach(function (ev) { root.addEventListener(ev, pause, { passive: true }); });
    ["mouseleave", "focusout"].forEach(function (ev) { root.addEventListener(ev, play); });
    document.addEventListener("visibilitychange", function () { document.hidden ? pause() : play(); });
    window.addEventListener("resize", function () { window.requestAnimationFrame(update); });

    update();
    play();
  }
  $$("[data-carousel]").forEach(initCarousel);

  /* ---- Booking (Lodgify embed, or request-to-book fallback) ---- */
  function buildRequestToBook(name) {
    var wrap = document.createElement("div");
    wrap.className = "booking-fallback";
    wrap.innerHTML =
      '<div class="row2">' +
        '<div class="field"><label>Check-in</label><input type="date" data-bf="in"></div>' +
        '<div class="field"><label>Check-out</label><input type="date" data-bf="out"></div>' +
      '</div>' +
      '<div class="field"><label>Guests</label><input type="number" min="1" inputmode="numeric" data-bf="guests" placeholder="How many in your group?"></div>';
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--block " + (isAlpine() ? "btn--alpine" : "btn--solid");
    btn.textContent = "Request these dates";
    btn.addEventListener("click", function () {
      var ci = $("[data-bf=in]", wrap).value, co = $("[data-bf=out]", wrap).value, g = $("[data-bf=guests]", wrap).value;
      var lines = ["Booking request from the SIG Lodges site.", "", "Lodge: " + name,
        "Check-in: " + (ci || "—"), "Check-out: " + (co || "—"), "Guests: " + (g || "—")];
      window.location.href = "mailto:" + mailTo(SITE_INBOX || name) +
        "?subject=" + encodeURIComponent("Booking request — " + name) +
        "&body=" + encodeURIComponent(lines.join("\n"));
    });
    wrap.appendChild(btn);
    var note = document.createElement("p");
    note.className = "booking-fallback__note";
    note.innerHTML = 'Live instant-book is coming online. For now we confirm every booking personally — or <a href="#inquire">send a full inquiry</a>.';
    wrap.appendChild(note);
    return wrap;
  }

  (function initBooking() {
    var mount = $("#bookingWidget");
    if (!mount) return;
    var key = mount.getAttribute("data-lodge");
    var cfg = (LODGIFY && LODGIFY[key]) || {};
    var name = mount.getAttribute("data-lodge-name") || cfg.name || "this lodge";
    if (cfg.embedHtml) {
      var box = document.createElement("div");
      box.className = "booking__lodgify";
      box.innerHTML = cfg.embedHtml;
      mount.appendChild(box);
      runScripts(box);
      return;
    }
    if (cfg.url) {
      var a = document.createElement("a");
      a.className = "btn " + (isAlpine() ? "btn--alpine" : "btn--solid");
      a.href = cfg.url; a.target = "_blank"; a.rel = "noopener";
      a.textContent = "Check availability & book";
      mount.appendChild(a);
      return;
    }
    mount.appendChild(buildRequestToBook(name));
  })();

  /* ---- Instagram (live widget, or static grid + follow links) ---- */
  (function initInstagram() {
    var handle = ((INSTAGRAM && INSTAGRAM.handle) || "").replace(/^@/, "");
    var profileUrl = handle ? "https://instagram.com/" + handle : "https://instagram.com";

    var handleEl = $("#igHandle");
    if (handleEl && handle) handleEl.textContent = "@" + handle;

    var follow = $("#igFollow");
    if (follow) { follow.href = profileUrl; if (handle) follow.textContent = "Follow @" + handle; }

    var fs = $("#footerSocial");
    if (fs) {
      var fa = document.createElement("a");
      fa.href = profileUrl; fa.target = "_blank"; fa.rel = "noopener";
      fa.textContent = handle ? "Instagram · @" + handle : "Instagram";
      fs.appendChild(fa);
    }

    var feed = $("#igFeed");
    if (!feed) return;
    if (INSTAGRAM.beholdId) {
      feed.className = "ig-feed ig-feed--live";
      feed.innerHTML = '<div data-behold-id="' + INSTAGRAM.beholdId + '"></div>';
      var bs = document.createElement("script");
      bs.type = "module"; bs.src = "https://w.behold.so/widget.js";
      document.body.appendChild(bs);
    } else if (INSTAGRAM.lightwidgetId) {
      feed.className = "ig-feed ig-feed--live";
      feed.innerHTML = '<iframe src="https://cdn.lightwidget.com/widgets/' + INSTAGRAM.lightwidgetId +
        '.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%;border:0;overflow:hidden;"></iframe>';
      var ls = document.createElement("script");
      ls.src = "https://cdn.lightwidget.com/widgets/lightwidget.js";
      document.body.appendChild(ls);
    }
    /* else: keep the static photo grid already in the HTML */
  })();

  /* ---- Google reviews (live widget replaces seeded carousel when configured) ---- */
  (function initGoogleReviews() {
    var rating = $("#googleRating");
    if (rating && GOOGLE_REVIEWS && GOOGLE_REVIEWS.ratingText) {
      rating.hidden = false;
      rating.innerHTML = '<span class="stars" aria-hidden="true">★★★★★</span> ' + GOOGLE_REVIEWS.ratingText;
    }
    var mount = $("#googleReviews");
    if (mount && GOOGLE_REVIEWS && GOOGLE_REVIEWS.embedHtml) {
      mount.hidden = false;
      mount.innerHTML = GOOGLE_REVIEWS.embedHtml;
      runScripts(mount);
      var car = $(".reviews .carousel");
      if (car) car.style.display = "none";
      var note = $(".reviews .reviews-note");
      if (note) note.style.display = "none";
    }
  })();

  /* ---- Inquiry form ---- */
  var form = $("#inquiryForm");
  var statusEl = $("#formStatus");
  function setStatus(m, k) { if (statusEl) { statusEl.textContent = m; statusEl.className = "form__status" + (k ? " " + k : ""); } }

  function buildMailto(d) {
    var lines = [
      "New booking inquiry from the SIG Lodges site.", "",
      "Name: " + d.name, "Email: " + d.email, "Lodge: " + d.lodge,
      "Trip type: " + (d.triptype || "—"), "Dates: " + (d.dates || "—"),
      "Group size: " + (d.group || "—"), "", "Message:", d.message || "—"
    ];
    return "mailto:" + mailTo(SITE_INBOX || d.lodge) +
      "?subject=" + encodeURIComponent("Booking inquiry — " + d.name + " (" + d.lodge + ")") +
      "&body=" + encodeURIComponent(lines.join("\n"));
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = {
        name: $("#name").value.trim(), email: $("#email").value.trim(), lodge: $("#lodge").value,
        triptype: $("#triptype").value, dates: $("#dates").value.trim(),
        group: $("#group").value.trim(), message: $("#message").value.trim()
      };
      if (!FORM_ENDPOINT) {
        setStatus("Opening your email app to send your inquiry…", "ok");
        window.location.href = buildMailto(d);
        return;
      }
      setStatus("Sending…", "");
      var btn = $("button[type=submit]", form);
      if (btn) btn.disabled = true;
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
        .then(function (res) { if (!res.ok) throw new Error("bad status"); form.reset(); setStatus("Thanks — your inquiry is in. We'll get back to you personally, soon.", "ok"); })
        .catch(function () { setStatus("Couldn't submit automatically — opening your email app instead…", "err"); window.location.href = buildMailto(d); })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  }
})();
