/* ============================================================
   ZYRO MEDIA EDITOR
   YouTube-style upload -> edit (Text / Filters / Effects / Edits)
   -> surface (preview + publish). Self-contained.
   ============================================================ */
(function () {
  "use strict";

  if (window.__zyroEditorLoaded) return;
  window.__zyroEditorLoaded = true;

  /* ---------------- State ---------------- */
  var S = {
    kind: "image",            // image | video
    category: "photo",        // photo | reel | video
    file: null,
    url: null,
    dirty: false,
    filterId: "none",
    adjust: { brightness: 100, contrast: 100, saturation: 100, warmth: 0, fade: 0 },
    transform: { rotate: 0, flipH: false, flipV: false },
    aspect: "original",
    effects: { vignette: 0, grain: 0, glow: 0, leak: 0, blur: 0 },
    texts: [],
    trim: { start: 0, end: 0, duration: 0 },
    activeTab: "filters",
    selectedTextId: null
  };

  var FILTERS = [
    { id: "none",      name: "Original", css: "" },
    { id: "vivid",     name: "Vivid",    css: "saturate(1.45) contrast(1.1)" },
    { id: "warm",      name: "Warm",     css: "sepia(.25) saturate(1.25) hue-rotate(-8deg)" },
    { id: "cool",      name: "Cool",     css: "hue-rotate(14deg) saturate(1.12) brightness(1.02)" },
    { id: "mono",      name: "Mono",     css: "grayscale(1)" },
    { id: "sepia",     name: "Sepia",    css: "sepia(.85)" },
    { id: "vintage",   name: "Vintage",  css: "sepia(.4) contrast(.92) saturate(.85) brightness(1.05)" },
    { id: "cinematic", name: "Cinema",   css: "contrast(1.18) saturate(.92) brightness(.96) hue-rotate(-6deg)" },
    { id: "fade",      name: "Fade",     css: "contrast(.9) brightness(1.1) saturate(.85)" },
    { id: "noir",      name: "Noir",     css: "grayscale(1) contrast(1.35) brightness(.95)" },
    { id: "retro",     name: "Retro",    css: "sepia(.5) saturate(1.35) hue-rotate(-16deg) contrast(1.05)" },
    { id: "dreamy",    name: "Dreamy",   css: "brightness(1.12) saturate(1.2) blur(.4px)" }
  ];

  var ASPECTS = [
    { id: "original", name: "Original", ratio: 0 },
    { id: "1:1",      name: "1:1",      ratio: 1 },
    { id: "4:5",      name: "4:5",      ratio: 4 / 5 },
    { id: "9:16",     name: "9:16",     ratio: 9 / 16 },
    { id: "16:9",     name: "16:9",     ratio: 16 / 9 },
    { id: "3:4",      name: "3:4",      ratio: 3 / 4 }
  ];

  var TEXT_COLORS = ["#ffffff", "#000000", "#e63946", "#ffd166", "#06d6a0", "#118ab2", "#ff5a5f", "#a855f7", "#f97316"];
  var TEXT_FONTS = [
    { id: "inherit", name: "Sans", css: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
    { id: "Georgia, serif", name: "Serif", css: "Georgia, serif" },
    { id: "'Courier New', monospace", name: "Mono", css: "'Courier New', monospace" },
    { id: "Impact, sans-serif", name: "Impact", css: "Impact, 'Arial Black', sans-serif" },
    { id: "'Trebuchet MS', sans-serif", name: "Trebuchet", css: "'Trebuchet MS', sans-serif" },
    { id: "Verdana, sans-serif", name: "Verdana", css: "Verdana, sans-serif" }
  ];

  /* ---------------- DOM refs ---------------- */
  var el = {};
  var domReady = false;

  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    if (typeof window.showToast === "function") { try { window.showToast(msg); return; } catch (e) {} }
    var t = $("zeToast");
    if (!t) { t = document.createElement("div"); t.id = "zeToast"; t.className = "ze-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t.__tm); t.__tm = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  /* ---------------- Build UI ---------------- */
  function buildUI() {
    if (domReady) return;
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="ze-overlay" id="zeOverlay">' +
        '<div class="ze-shell">' +
          '<div class="ze-top">' +
            '<button class="ze-top-btn" id="zeCancel" aria-label="Cancel">&#10005;</button>' +
            '<div class="ze-title" id="zeTitle">Edit</div>' +
            '<button class="ze-top-btn ze-next" id="zeNext">Next</button>' +
          '</div>' +
          '<div class="ze-stage" id="zeStage">' +
            '<div class="ze-canvas" id="zeCanvas">' +
              '<img class="ze-media" id="zeImg" alt="preview" style="display:none">' +
              '<video class="ze-media" id="zeVid" playsinline muted style="display:none"></video>' +
              '<div class="ze-fx-layer" id="zeFxLayer"></div>' +
              '<div class="ze-text-layer" id="zeTextLayer"></div>' +
            '</div>' +
            '<div class="ze-hint" id="zeHint">&#65291; Text, filters, effects &amp; edits</div>' +
            '<div class="ze-render" id="zeRender">' +
              '<div class="ze-spinner"></div>' +
              '<div class="ze-render-text" id="zeRenderText">Processing&hellip;</div>' +
              '<div class="ze-render-bar"><div class="ze-render-fill" id="zeRenderFill"></div></div>' +
              '<div class="ze-render-sub" id="zeRenderSub">Please keep this window open.</div>' +
            '</div>' +
          '</div>' +
          '<div class="ze-panel" id="zePanel"></div>' +
          '<nav class="ze-tabs" id="zeTabs">' +
            tabBtn("text", "Text", '<path d="M4 6h16M9 6v13M15 6v13"/>') +
            tabBtn("filters", "Filters", '<circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/>') +
            tabBtn("effects", "Effects", '<path d="m12 3-1.9 5.8L4 10.7l5.8 1.9L12 18l1.9-5.4L20 10.7l-6.1-1.9Z"/>') +
            tabBtn("edits", "Edits", '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#141419"/><circle cx="15" cy="12" r="2" fill="#141419"/><circle cx="8" cy="18" r="2" fill="#141419"/>') +
          '</nav>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    el.overlay = $("zeOverlay");
    el.cancel = $("zeCancel");
    el.next = $("zeNext");
    el.title = $("zeTitle");
    el.stage = $("zeStage");
    el.canvas = $("zeCanvas");
    el.img = $("zeImg");
    el.vid = $("zeVid");
    el.fx = $("zeFxLayer");
    el.textLayer = $("zeTextLayer");
    el.hint = $("zeHint");
    el.panel = $("zePanel");
    el.tabs = $("zeTabs");
    el.render = $("zeRender");
    el.renderText = $("zeRenderText");
    el.renderFill = $("zeRenderFill");
    el.renderSub = $("zeRenderSub");

    el.cancel.addEventListener("click", closeEditor);
    el.next.addEventListener("click", onNext);
    el.tabs.querySelectorAll(".ze-tab").forEach(function (b) {
      b.addEventListener("click", function () { switchTab(b.getAttribute("data-tab")); });
    });

    // pointer drag for text overlays
    el.textLayer.addEventListener("pointerdown", onTextPointerDown);
    window.addEventListener("pointermove", onTextPointerMove);
    window.addEventListener("pointerup", onTextPointerUp);
    window.addEventListener("resize", function () { if (el.overlay.classList.contains("show")) { applyAspect(); renderTexts(); } });

    domReady = true;
  }

  function tabBtn(tab, label, svg) {
    return '<button class="ze-tab" data-tab="' + tab + '"><svg viewBox="0 0 24 24">' + svg + '</svg><span>' + label + '</span></button>';
  }

  /* ---------------- Open / close ---------------- */
  function openEditor(file, kind, category) {
    buildUI();
    if (!file) return;

    S.kind = kind === "video" ? "video" : "image";
    S.category = category || (S.kind === "video" ? "reel" : "photo");
    S.file = file;
    S.dirty = false;
    S.filterId = "none";
    S.adjust = { brightness: 100, contrast: 100, saturation: 100, warmth: 0, fade: 0 };
    S.transform = { rotate: 0, flipH: false, flipV: false };
    S.aspect = "original";
    S.effects = { vignette: 0, grain: 0, glow: 0, leak: 0, blur: 0 };
    S.texts = [];
    S.trim = { start: 0, end: 0, duration: 0 };
    S.selectedTextId = null;

    if (S.url) { try { URL.revokeObjectURL(S.url); } catch (e) {} }
    S.url = URL.createObjectURL(file);

    el.overlay.classList.add("show");
    el.title.textContent = S.kind === "video" ? "Edit video" : "Edit photo";
    el.next.disabled = false;
    el.next.textContent = "Next";
    el.hint.classList.remove("hide");
    setTimeout(function () { el.hint.classList.add("hide"); }, 3200);

    // reset media elements
    el.img.style.display = "none"; el.img.removeAttribute("src");
    el.vid.style.display = "none"; el.vid.removeAttribute("src");

    if (S.kind === "video") {
      el.vid.src = S.url;
      el.vid.style.display = "block";
      el.vid.loop = true;
      el.vid.onloadedmetadata = function () {
        S.trim.duration = el.vid.duration || 0;
        S.trim.start = 0;
        S.trim.end = el.vid.duration || 0;
        applyAspect();
        renderTexts();
        switchTab("filters");
        // grab a real (non-black) frame for filter thumbnails
        try {
          var t = Math.min(0.2, (el.vid.duration || 1) * 0.1);
          if (el.vid.currentTime < t) el.vid.currentTime = t;
          else captureVideoThumb();
        } catch (e) { captureVideoThumb(); }
        setTimeout(captureVideoThumb, 700);
      };
      el.vid.onseeked = function () { captureVideoThumb(); };
      try { el.vid.play().catch(function () {}); } catch (e) {}
    } else {
      el.img.src = S.url;
      el.img.style.display = "block";
      el.img.onload = function () {
        applyAspect();
        renderTexts();
        switchTab("filters");
      };
    }
    applyPreview();
  }

  function closeEditor() {
    el.overlay.classList.remove("show");
    try { el.vid.pause(); } catch (e) {}
    el.render.classList.remove("show");
  }

  /* ---------------- Preview application ---------------- */
  function activeFilterCss() {
    var f = FILTERS.filter(function (x) { return x.id === S.filterId; })[0];
    return f ? f.css : "";
  }

  function buildFilter() {
    var a = S.adjust, parts = [];
    var fc = activeFilterCss();
    if (fc) parts.push(fc);
    var b = a.brightness / 100;
    var c = a.contrast / 100;
    var s = a.saturation / 100;
    if (Math.abs(b - 1) > 0.001) parts.push("brightness(" + b.toFixed(3) + ")");
    if (Math.abs(c - 1) > 0.001) parts.push("contrast(" + c.toFixed(3) + ")");
    if (Math.abs(s - 1) > 0.001) parts.push("saturate(" + s.toFixed(3) + ")");
    if (a.fade > 0) { parts.push("contrast(" + (1 - a.fade / 100 * 0.25).toFixed(3) + ")"); parts.push("brightness(" + (1 + a.fade / 100 * 0.12).toFixed(3) + ")"); }
    if (S.effects.blur > 0) parts.push("blur(" + (S.effects.blur / 100 * 6).toFixed(2) + "px)");
    return parts.join(" ");
  }

  function applyPreview() {
    var m = S.kind === "video" ? el.vid : el.img;
    if (!m) return;
    m.style.filter = buildFilter();
    m.style.transform = "rotate(" + S.transform.rotate + "deg) scaleX(" + (S.transform.flipH ? -1 : 1) + ") scaleY(" + (S.transform.flipV ? -1 : 1) + ")";
    renderEffects();
    renderTexts();
  }

  function renderEffects() {
    var e = S.effects, html = "";
    if (e.vignette > 0) html += '<div class="ze-fx ze-fx-vignette" style="opacity:' + (e.vignette / 100) + '"></div>';
    if (e.grain > 0)    html += '<div class="ze-fx ze-fx-grain" style="opacity:' + (e.grain / 100 * 0.6) + '"></div>';
    if (e.glow > 0)     html += '<div class="ze-fx ze-fx-glow" style="opacity:' + (e.glow / 100) + '"></div>';
    if (e.leak > 0)     html += '<div class="ze-fx ze-fx-leak" style="opacity:' + (e.leak / 100) + '"></div>';
    if (S.adjust.warmth > 0) html += '<div class="ze-fx ze-fx-warm" style="opacity:' + (S.adjust.warmth / 100 * 0.5) + '"></div>';
    if (S.adjust.warmth < 0) html += '<div class="ze-fx ze-fx-cool" style="opacity:' + (Math.abs(S.adjust.warmth) / 100 * 0.5) + '"></div>';
    el.fx.innerHTML = html;
  }

  /* ---------------- Aspect ---------------- */
  function mediaNatural() {
    if (S.kind === "video") return { w: el.vid.videoWidth || 1080, h: el.vid.videoHeight || 1920 };
    return { w: el.img.naturalWidth || 1080, h: el.img.naturalHeight || 1080 };
  }

  function applyAspect() {
    var n = mediaNatural();
    var swap = S.transform.rotate === 90 || S.transform.rotate === 270;
    var fw = swap ? n.h : n.w, fh = swap ? n.w : n.h;
    var asp = ASPECTS.filter(function (x) { return x.id === S.aspect; })[0] || ASPECTS[0];
    var ratio = asp.ratio || (fw / fh);

    // available stage box
    var stageW = el.stage.clientWidth - 28;
    var stageH = el.stage.clientHeight - 28;
    var boxRatio = stageW / stageH;
    var w, h;
    if (ratio > boxRatio) { w = stageW; h = stageW / ratio; }
    else { h = stageH; w = stageH * ratio; }

    el.canvas.style.width = Math.round(w) + "px";
    el.canvas.style.height = Math.round(h) + "px";
    el.canvas.classList.toggle("ze-no-round", asp.id !== "original");
  }

  /* ---------------- Text overlays ---------------- */
  function addText() {
    var id = "t" + Date.now();
    S.texts.push({
      id: id, text: "Your text", x: 0.5, y: 0.5,
      size: 0.08, color: "#ffffff", bg: "shadow", bgColor: "#000000",
      font: "inherit", weight: 800, rot: 0
    });
    S.selectedTextId = id;
    S.dirty = true;
    renderTexts();
    if (S.activeTab !== "text") switchTab("text"); else renderTextPanel();
  }

  function renderTexts() {
    var boxW = el.canvas.clientWidth || 300;
    var html = "";
    S.texts.forEach(function (t) {
      var fs = Math.max(10, t.size * boxW);
      var style = "left:" + (t.x * 100) + "%;top:" + (t.y * 100) + "%;font-size:" + fs + "px;font-family:" + t.font + ";font-weight:" + t.weight + ";color:" + t.color + ";";
      if (t.rot) style += "transform:translate(-50%,-50%) rotate(" + t.rot + "deg);";
      var cls = "ze-text-item" + (t.id === S.selectedTextId ? " selected" : "");
      if (t.bg === "solid") { cls += " ze-bg-solid"; style += "background:" + t.bgColor + ";"; }
      else if (t.bg === "outline") { cls += " ze-bg-outline"; }
      html += '<div class="' + cls + '" data-id="' + t.id + '" style="' + style + '">' + escapeHtml(t.text) + "</div>";
    });
    el.textLayer.innerHTML = html;
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var drag = null;
  function onTextPointerDown(e) {
    var item = e.target.closest ? e.target.closest(".ze-text-item") : null;
    if (!item) { S.selectedTextId = null; renderTexts(); return; }
    S.selectedTextId = item.getAttribute("data-id");
    renderTexts();
    var rect = el.canvas.getBoundingClientRect();
    drag = { id: S.selectedTextId, rect: rect };
    item.setPointerCapture && item.setPointerCapture(e.pointerId);
    e.preventDefault();
    if (S.activeTab === "text") renderTextPanel();
  }
  function onTextPointerMove(e) {
    if (!drag) return;
    var t = S.texts.filter(function (x) { return x.id === drag.id; })[0];
    if (!t) return;
    var r = drag.rect;
    t.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    t.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    var node = el.textLayer.querySelector('[data-id="' + t.id + '"]');
    if (node) { node.style.left = (t.x * 100) + "%"; node.style.top = (t.y * 100) + "%"; }
  }
  function onTextPointerUp() { if (drag) { drag = null; S.dirty = true; } }

  function selectedText() { return S.texts.filter(function (x) { return x.id === S.selectedTextId; })[0] || null; }

  /* ---------------- Tabs ---------------- */
  function switchTab(tab) {
    S.activeTab = tab;
    el.tabs.querySelectorAll(".ze-tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    if (tab === "text") renderTextPanel();
    else if (tab === "filters") renderFiltersPanel();
    else if (tab === "effects") renderEffectsPanel();
    else renderEditsPanel();
  }

  function renderFiltersPanel() {
    var thumbSrc = thumbSource();
    var html = '<div class="ze-panel-title">Filters</div><div class="ze-filter-strip">';
    FILTERS.forEach(function (f) {
      html += '<div class="ze-filter-thumb' + (f.id === S.filterId ? " active" : "") + '" data-fid="' + f.id + '">' +
                '<img class="ze-ft-img" src="' + thumbSrc + '" style="filter:' + (f.css || "none") + '" alt="' + f.name + '">' +
                '<span class="ze-ft-name">' + f.name + '</span>' +
              '</div>';
    });
    html += "</div>";
    el.panel.innerHTML = html;
    el.panel.querySelectorAll(".ze-filter-thumb").forEach(function (n) {
      n.addEventListener("click", function () {
        S.filterId = n.getAttribute("data-fid");
        S.dirty = true;
        applyPreview();
        renderFiltersPanel();
      });
    });
  }

  var _thumbSrc = null;
  function thumbSource() {
    if (_thumbSrc) return _thumbSrc;
    try {
      if (S.kind === "image") { _thumbSrc = el.img.src; return _thumbSrc; }
      var c = document.createElement("canvas");
      c.width = 120; c.height = 120;
      var ctx = c.getContext("2d");
      var vw = el.vid.videoWidth || 120, vh = el.vid.videoHeight || 120;
      var s = Math.min(vw, vh);
      ctx.drawImage(el.vid, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, 120, 120);
      _thumbSrc = c.toDataURL("image/jpeg", 0.6);
    } catch (e) { _thumbSrc = ""; }
    return _thumbSrc;
  }

  function captureVideoThumb() {
    if (S.kind !== "video") return;
    try {
      var c = document.createElement("canvas");
      c.width = 120; c.height = 120;
      var ctx = c.getContext("2d");
      var vw = el.vid.videoWidth || 120, vh = el.vid.videoHeight || 120;
      var s = Math.min(vw, vh);
      ctx.drawImage(el.vid, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, 120, 120);
      _thumbSrc = c.toDataURL("image/jpeg", 0.6);
    } catch (e) { return; }
    if (S.activeTab === "filters") renderFiltersPanel();
  }

  function renderEffectsPanel() {
    var e = S.effects;
    var html = '<div class="ze-panel-title">Effects</div><div class="ze-chips" id="zeFxChips">' +
      fxChip("vignette", "Vignette", e.vignette) +
      fxChip("grain", "Grain", e.grain) +
      fxChip("glow", "Glow", e.glow) +
      fxChip("leak", "Light Leak", e.leak) +
      "</div>";
    html += '<div style="height:14px"></div>';
    html += sliderRow("zeBlur", "Blur", e.blur, 0, 100, "%");
    el.panel.innerHTML = html;

    el.panel.querySelectorAll(".ze-chip").forEach(function (n) {
      n.addEventListener("click", function () {
        var k = n.getAttribute("data-fx");
        S.effects[k] = S.effects[k] > 0 ? 0 : 70;
        S.dirty = true;
        applyPreview();
        renderEffectsPanel();
      });
    });
    bindSlider("zeBlur", function (v) { S.effects.blur = v; S.dirty = true; applyPreview(); });
  }

  function fxChip(key, label, val) {
    return '<button class="ze-chip' + (val > 0 ? " active" : "") + '" data-fx="' + key + '">' + label + (val > 0 ? " &#10003;" : "") + "</button>";
  }

  function renderEditsPanel() {
    var a = S.adjust;
    var html = '<div class="ze-panel-title">Adjust</div>' +
      sliderRow("zeBright", "Brightness", a.brightness, 50, 150, "%") +
      sliderRow("zeContrast", "Contrast", a.contrast, 50, 150, "%") +
      sliderRow("zeSat", "Saturation", a.saturation, 0, 200, "%") +
      sliderRow("zeWarm", "Warmth", a.warmth, -100, 100, "") +
      sliderRow("zeFade", "Fade", a.fade, 0, 100, "%");
    html += '<div class="ze-panel-title" style="margin-top:6px">Transform</div>' +
      '<div class="ze-chips">' +
        '<button class="ze-chip" data-tr="rot">&#8635; Rotate 90&deg;</button>' +
        '<button class="ze-chip' + (S.transform.flipH ? " active" : "") + '" data-tr="fliph">&#8646; Flip H</button>' +
        '<button class="ze-chip' + (S.transform.flipV ? " active" : "") + '" data-tr="flipv">&#8645; Flip V</button>' +
        '<button class="ze-chip" data-tr="reset">Reset</button>' +
      "</div>";
    html += '<div class="ze-panel-title" style="margin-top:14px">Aspect Ratio</div><div class="ze-chips">';
    ASPECTS.forEach(function (x) {
      html += '<button class="ze-chip' + (x.id === S.aspect ? " active" : "") + '" data-asp="' + x.id + '">' + x.name + "</button>";
    });
    html += "</div>";
    if (S.kind === "video") {
      html += '<div class="ze-panel-title" style="margin-top:14px">Trim</div>' +
        sliderRow("zeTrimStart", "Start", S.trim.start, 0, Math.max(0.1, S.trim.duration), "s") +
        sliderRow("zeTrimEnd", "End", S.trim.end, 0, Math.max(0.1, S.trim.duration), "s");
    }
    el.panel.innerHTML = html;

    bindSlider("zeBright", function (v) { a.brightness = v; S.dirty = true; applyPreview(); });
    bindSlider("zeContrast", function (v) { a.contrast = v; S.dirty = true; applyPreview(); });
    bindSlider("zeSat", function (v) { a.saturation = v; S.dirty = true; applyPreview(); });
    bindSlider("zeWarm", function (v) { a.warmth = v; S.dirty = true; applyPreview(); });
    bindSlider("zeFade", function (v) { a.fade = v; S.dirty = true; applyPreview(); });

    el.panel.querySelectorAll("[data-tr]").forEach(function (n) {
      n.addEventListener("click", function () {
        var k = n.getAttribute("data-tr");
        if (k === "rot") S.transform.rotate = (S.transform.rotate + 90) % 360;
        else if (k === "fliph") S.transform.flipH = !S.transform.flipH;
        else if (k === "flipv") S.transform.flipV = !S.transform.flipV;
        else { S.transform = { rotate: 0, flipH: false, flipV: false }; S.aspect = "original"; }
        S.dirty = true;
        applyAspect(); applyPreview(); renderEditsPanel();
      });
    });
    el.panel.querySelectorAll("[data-asp]").forEach(function (n) {
      n.addEventListener("click", function () {
        S.aspect = n.getAttribute("data-asp"); S.dirty = true;
        applyAspect(); renderTexts(); renderEditsPanel();
      });
    });
    if (S.kind === "video") {
      bindSlider("zeTrimStart", function (v) { S.trim.start = Math.min(v, S.trim.end - 0.2); S.dirty = true; });
      bindSlider("zeTrimEnd", function (v) { S.trim.end = Math.max(v, S.trim.start + 0.2); S.dirty = true; });
    }
  }

  function sliderRow(id, label, val, min, max, unit) {
    return '<div class="ze-row">' +
      '<span class="ze-label">' + label + '</span>' +
      '<input type="range" class="ze-range" id="' + id + '" min="' + min + '" max="' + max + '" step="1" value="' + val + '">' +
      '<span class="ze-val" id="' + id + 'V">' + Math.round(val) + unit + '</span>' +
    "</div>";
  }

  function bindSlider(id, cb) {
    var input = $(id), out = $(id + "V");
    if (!input) return;
    input.addEventListener("input", function () {
      var v = parseFloat(input.value);
      if (out) out.textContent = Math.round(v) + (id.indexOf("Trim") >= 0 ? "s" : (id === "zeWarm" ? "" : "%"));
      cb(v);
    });
  }

  function renderTextPanel() {
    var t = selectedText();
    var html = '<div class="ze-panel-title">Text</div>';
    if (!t) {
      html += '<div class="ze-empty">Koi text add karein aur usse video/photo par drag karein.</div>' +
              '<button class="ze-btn ze-btn-primary" id="zeAddText">&#65291; Add Text</button>';
      el.panel.innerHTML = html;
      $("zeAddText").addEventListener("click", addText);
      return;
    }
    html += '<div class="ze-text-tools">' +
      '<input type="text" id="zeTextInput" value="' + escapeAttr(t.text) + '" placeholder="Type something..." style="width:100%;box-sizing:border-box;background:#1c1c22;border:1px solid #33333c;color:#fff;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px;outline:none">' +
      '<div class="ze-swatches" id="zeSwatches">' +
        TEXT_COLORS.map(function (c) { return '<span class="ze-swatch' + (c === t.color ? " active" : "") + '" data-c="' + c + '" style="background:' + c + '"></span>'; }).join("") +
      "</div>" +
      '<div class="ze-font-row" id="zeFonts">' +
        TEXT_FONTS.map(function (f) { return '<button class="ze-font-btn' + (f.id === t.font ? " active" : "") + '" data-f="' + f.id + '" style="font-family:' + f.css + '">' + f.name + "</button>"; }).join("") +
      "</div>" +
      '<div class="ze-chips" id="zeBgChips">' +
        '<button class="ze-chip' + (t.bg === "shadow" ? " active" : "") + '" data-bg="shadow">Shadow</button>' +
        '<button class="ze-chip' + (t.bg === "solid" ? " active" : "") + '" data-bg="solid">Solid BG</button>' +
        '<button class="ze-chip' + (t.bg === "outline" ? " active" : "") + '" data-bg="outline">Outline</button>' +
      "</div>" +
      sliderRow("zeTextSize", "Size", Math.round(t.size * 100), 3, 20, "%") +
      '<div style="display:flex;gap:8px">' +
        '<button class="ze-btn ze-btn-ghost" id="zeAddText2">&#65291; Add</button>' +
        '<button class="ze-btn ze-btn-danger" id="zeDelText">&#128465; Delete</button>' +
      "</div>" +
    "</div>";
    el.panel.innerHTML = html;

    $("zeTextInput").addEventListener("input", function () { t.text = this.value; S.dirty = true; renderTexts(); });
    $("zeAddText2").addEventListener("click", addText);
    $("zeDelText").addEventListener("click", function () {
      S.texts = S.texts.filter(function (x) { return x.id !== t.id; });
      S.selectedTextId = S.texts.length ? S.texts[0].id : null;
      S.dirty = true; renderTexts(); renderTextPanel();
    });
    el.panel.querySelectorAll("#zeSwatches .ze-swatch").forEach(function (n) {
      n.addEventListener("click", function () { t.color = n.getAttribute("data-c"); S.dirty = true; renderTexts(); renderTextPanel(); });
    });
    el.panel.querySelectorAll("#zeFonts .ze-font-btn").forEach(function (n) {
      n.addEventListener("click", function () { t.font = n.getAttribute("data-f"); S.dirty = true; renderTexts(); renderTextPanel(); });
    });
    el.panel.querySelectorAll("#zeBgChips .ze-chip").forEach(function (n) {
      n.addEventListener("click", function () { t.bg = n.getAttribute("data-bg"); S.dirty = true; renderTexts(); renderTextPanel(); });
    });
    bindSlider("zeTextSize", function (v) { t.size = v / 100; S.dirty = true; renderTexts(); });
  }

  function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }

  /* ---------------- Rendering (bake) ---------------- */
  function noiseCanvas() {
    if (noiseCanvas._c) return noiseCanvas._c;
    var c = document.createElement("canvas"); c.width = 128; c.height = 128;
    var ctx = c.getContext("2d");
    var img = ctx.createImageData(128, 128);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.random() * 255 | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    noiseCanvas._c = c;
    return c;
  }

  var _flatC = null, _flatCtx = null;
  function flattenMedia() {
    var m = S.kind === "video" ? el.vid : el.img;
    var n = mediaNatural();
    var sw = n.w, sh = n.h;
    var rot = ((S.transform.rotate % 360) + 360) % 360;
    var swap = rot === 90 || rot === 270;
    var cw = swap ? sh : sw, ch = swap ? sw : sh;
    if (!_flatC) { _flatC = document.createElement("canvas"); _flatCtx = _flatC.getContext("2d"); }
    var c = _flatC;
    if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; }
    var x = _flatCtx;
    x.clearRect(0, 0, cw, ch);
    x.save();
    x.translate(cw / 2, ch / 2);
    x.rotate(rot * Math.PI / 180);
    x.scale(S.transform.flipH ? -1 : 1, S.transform.flipV ? -1 : 1);
    x.drawImage(m, -sw / 2, -sh / 2, sw, sh);
    x.restore();
    return c;
  }

  function targetSize(fw, fh, cap) {
    var asp = ASPECTS.filter(function (x) { return x.id === S.aspect; })[0] || ASPECTS[0];
    var ratio = asp.ratio || (fw / fh);
    var base = Math.max(fw, fh);
    var W, H;
    if (ratio >= 1) { W = base; H = Math.round(base / ratio); }
    else { H = base; W = Math.round(base * ratio); }
    cap = cap || 1920;
    if (Math.max(W, H) > cap) { var k = cap / Math.max(W, H); W = Math.round(W * k); H = Math.round(H * k); }
    return { w: Math.max(2, W), h: Math.max(2, H) };
  }

  function drawCover(ctx, src, W, H, srcW, srcH) {
    var sw = srcW || src.width, sh = srcH || src.height;
    var sr = sw / sh, dr = W / H;
    var cw, ch, cx, cy;
    if (sr > dr) { ch = sh; cw = sh * dr; cx = (sw - cw) / 2; cy = 0; }
    else { cw = sw; ch = sw / dr; cx = 0; cy = (sh - ch) / 2; }
    ctx.drawImage(src, cx, cy, cw, ch, 0, 0, W, H);
  }

  function drawEffects(ctx, W, H) {
    var e = S.effects, a = S.adjust;
    if (a.warmth > 0) { ctx.globalCompositeOperation = "soft-light"; ctx.fillStyle = "rgba(255,140,0," + (a.warmth / 100 * 0.5) + ")"; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "source-over"; }
    if (a.warmth < 0) { ctx.globalCompositeOperation = "soft-light"; ctx.fillStyle = "rgba(0,120,255," + (Math.abs(a.warmth) / 100 * 0.5) + ")"; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "source-over"; }
    if (e.vignette > 0) {
      var g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0," + (e.vignette / 100 * 0.85) + ")");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (e.glow > 0) {
      ctx.globalCompositeOperation = "screen";
      var gg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      gg.addColorStop(0, "rgba(255,255,255," + (e.glow / 100 * 0.35) + ")"); gg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "source-over";
    }
    if (e.leak > 0) {
      ctx.globalCompositeOperation = "screen";
      var lg = ctx.createLinearGradient(0, 0, W, H);
      lg.addColorStop(0.4, "rgba(255,120,0,0)");
      lg.addColorStop(0.65, "rgba(255,150,40," + (e.leak / 100 * 0.5) + ")");
      lg.addColorStop(1, "rgba(255,60,120," + (e.leak / 100 * 0.35) + ")");
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = "source-over";
    }
    if (e.grain > 0) {
      var n = noiseCanvas();
      ctx.globalAlpha = e.grain / 100 * 0.35; ctx.globalCompositeOperation = "overlay";
      for (var y = 0; y < H; y += n.height) for (var x = 0; x < W; x += n.width) ctx.drawImage(n, x, y);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTexts(ctx, W, H) {
    S.texts.forEach(function (t) {
      var fs = Math.max(8, t.size * W);
      ctx.save();
      ctx.font = t.weight + " " + fs + "px " + (t.font === "inherit" ? "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" : t.font);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      var x = t.x * W, y = t.y * H;
      var lines = String(t.text).split("\n");
      var lineH = fs * 1.2, totalH = lineH * lines.length;
      if (t.bg === "solid") {
        var maxW = 0;
        lines.forEach(function (l) { maxW = Math.max(maxW, ctx.measureText(l).width); });
        var padX = fs * 0.35, padY = fs * 0.22;
        ctx.fillStyle = t.bgColor || "#000";
        roundRect(ctx, x - maxW / 2 - padX, y - totalH / 2 - padY, maxW + padX * 2, totalH + padY * 2, fs * 0.25);
        ctx.fill();
      }
      lines.forEach(function (l, i) {
        var ly = y - totalH / 2 + lineH * (i + 0.5);
        if (t.bg === "outline") { ctx.lineWidth = Math.max(2, fs * 0.09); ctx.strokeStyle = "#000"; ctx.strokeText(l, x, ly); }
        else if (t.bg !== "solid") { ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = fs * 0.18; ctx.shadowOffsetY = fs * 0.03; }
        ctx.fillStyle = t.color; ctx.fillText(l, x, ly);
      });
      ctx.restore();
    });
  }

  function exportImage() {
    return new Promise(function (resolve, reject) {
      try {
        var flat = flattenMedia();
        var sz = targetSize(flat.width, flat.height);
        var c = document.createElement("canvas"); c.width = sz.w; c.height = sz.h;
        var ctx = c.getContext("2d");
        ctx.filter = buildFilter() || "none";
        drawCover(ctx, flat, sz.w, sz.h);
        ctx.filter = "none";
        drawEffects(ctx, sz.w, sz.h);
        drawTexts(ctx, sz.w, sz.h);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error("blob")); }, "image/jpeg", 0.92);
      } catch (e) { reject(e); }
    });
  }

  function pickVideoMime() {
    var list = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
    for (var i = 0; i < list.length; i++) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(list[i])) return list[i];
    }
    return "";
  }

  function exportVideo(onProgress) {
    return new Promise(function (resolve, reject) {
      try {
        var v = el.vid;
        var flat = flattenMedia();
        var sz = targetSize(flat.width, flat.height, 1280);
        var out = document.createElement("canvas"); out.width = sz.w; out.height = sz.h;
        var octx = out.getContext("2d");
        var fps = 30;
        var stream = out.captureStream ? out.captureStream(fps) : null;
        if (!stream) return reject(new Error("captureStream unsupported"));

        // try to mix audio
        var ac = null;
        try {
          if (!v.__zeAudio) {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (AC) {
              ac = new AC();
              var src = ac.createMediaElementSource(v);
              var dest = ac.createMediaStreamDestination();
              src.connect(dest); src.connect(ac.destination);
              v.__zeAudio = { ac: ac, dest: dest };
            }
          } else { ac = v.__zeAudio.ac; }
          if (v.__zeAudio && v.__zeAudio.dest) v.__zeAudio.dest.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });
        } catch (eA) { /* audio optional */ }

        var mime = pickVideoMime();
        var rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6000000 } : undefined);
        var chunks = [];
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        var stopped = new Promise(function (res) { rec.onstop = function () { res(new Blob(chunks, { type: mime || "video/webm" })); }; });

        var t0 = S.trim.start, t1 = S.trim.end > t0 ? S.trim.end : (v.duration || t0 + 5);
        var dur = Math.max(0.3, t1 - t0);

        v.loop = false; // must not loop, or the export never ends
        rec.start(100);
        v.muted = false;

        // draw the current video frame with filter + effects + text
        function drawFrame() {
          var n = mediaNatural();
          var rot = ((S.transform.rotate % 360) + 360) % 360;
          var identity = rot === 0 && !S.transform.flipH && !S.transform.flipV;
          octx.filter = buildFilter() || "none";
          if (identity) {
            drawCover(octx, v, sz.w, sz.h, n.w, n.h);
          } else {
            drawCover(octx, flattenMedia(), sz.w, sz.h);
          }
          octx.filter = "none";
          drawEffects(octx, sz.w, sz.h);
          drawTexts(octx, sz.w, sz.h);
        }

        function finish() {
          try { v.pause(); } catch (e) {}
          try { v.loop = true; } catch (e) {}
          try { rec.stop(); } catch (e) {}
          stopped.then(resolve).catch(reject);
        }

        // start the capture loop (robust against a no-op seek)
        var started = false;
        function startLoop() {
          if (started) return;
          started = true;
          v.removeEventListener("seeked", onSeek);
          v.play().then(function () {
            function loop() {
              if (v.currentTime >= t1 || v.ended) { finish(); return; }
              drawFrame();
              if (onProgress) onProgress(Math.min(1, (v.currentTime - t0) / dur));
              requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);
          }).catch(reject);
        }
        var onSeek = function () { startLoop(); };
        var wasAt = v.currentTime;
        v.currentTime = t0;
        if (Math.abs(wasAt - t0) < 0.05) startLoop();
        else v.addEventListener("seeked", onSeek);
        setTimeout(startLoop, 1500);
      } catch (e) { reject(e); }
    });
  }

  /* ---------------- WebM duration fix ----------------
     MediaRecorder does not write a Duration element, so the exported
     WebM reports duration = Infinity (breaks seeking / trimming).
     We inject a Duration element into the Info section. */
  function fixWebmDuration(blob, durationMs) {
    return new Promise(function (resolve) {
      try {
        var fr = new FileReader();
        fr.onload = function () {
          try {
            var d = new Uint8Array(fr.result);
            var out = patchWebmDuration(d, durationMs);
            resolve(out ? new Blob([out], { type: blob.type }) : blob);
          } catch (e) { resolve(blob); }
        };
        fr.onerror = function () { resolve(blob); };
        fr.readAsArrayBuffer(blob);
      } catch (e) { resolve(blob); }
    });
  }

  function patchWebmDuration(d, durationMs) {
    function vl(b) { for (var i = 0; i < 8; i++) if (b & (0x80 >> i)) return i + 1; return 0; }
    function rid(p) { var l = vl(d[p]); if (!l) return null; var v = 0; for (var i = 0; i < l; i++) v = v * 256 + d[p + i]; return { v: v, l: l }; }
    function rsz(p) { var l = vl(d[p]); if (!l) return null; var v = d[p] & (0xff >> l); var unk = (v === (0xff >> l)); for (var i = 1; i < l; i++) { v = v * 256 + d[p + i]; if (d[p + i] !== 0xff) unk = false; } return { v: v, l: l, unk: unk }; }

    // locate Segment (0x18538067) at top level
    var p = 0, segStart = -1, segEnd = -1;
    while (p < d.length) {
      var id0 = rid(p); if (!id0) break;
      var sz0 = rsz(p + id0.l); if (!sz0) break;
      var cs0 = p + id0.l + sz0.l;
      if (id0.v === 0x18538067) { segStart = cs0; segEnd = sz0.unk ? d.length : cs0 + sz0.v; break; }
      if (sz0.unk) break;
      p = cs0 + sz0.v;
    }
    if (segStart < 0) return null;

    // locate Info (0x1549A966) inside the Segment
    var infoSizePos = -1, infoSizeLen = 0, infoContentStart = -1, infoSize = -1;
    p = segStart;
    while (p < segEnd) {
      var id = rid(p); if (!id) break;
      var sz = rsz(p + id.l); if (!sz) break;
      var cs = p + id.l + sz.l;
      if (id.v === 0x1549a966) { infoSizePos = p + id.l; infoSizeLen = sz.l; infoContentStart = cs; infoSize = sz.v; break; }
      if (sz.unk) break;
      p = cs + sz.v;
    }
    if (infoContentStart < 0 || infoSize < 0) return null;

    // scan Info children for TimecodeScale + existing Duration
    var q = infoContentStart, infoEnd = infoContentStart + infoSize, durPos = -1, durLen = 0, timecodeScale = 1000000;
    while (q < infoEnd) {
      var id2 = rid(q); if (!id2) break;
      var sz2 = rsz(q + id2.l); if (!sz2) break;
      var cs2 = q + id2.l + sz2.l;
      if (id2.v === 0x2ad7b1) { var ts = 0; for (var i = 0; i < sz2.v; i++) ts = ts * 256 + d[cs2 + i]; if (ts > 0) timecodeScale = ts; }
      if (id2.v === 0x4489) { durPos = cs2; durLen = sz2.v; }
      q = cs2 + sz2.v;
    }

    var durVal = durationMs * 1000000 / timecodeScale;

    if (durPos >= 0) {
      var out = d.slice();
      var dv = new DataView(out.buffer);
      if (durLen === 4) dv.setFloat32(durPos, durVal);
      else if (durLen === 8) dv.setFloat64(durPos, durVal);
      else return null;
      return out;
    }

    // build a new Duration element (8-byte float)
    var elem = new Uint8Array(11);
    elem[0] = 0x44; elem[1] = 0x89; elem[2] = 0x88;
    new DataView(elem.buffer).setFloat64(3, durVal);

    var newSize = infoSize + elem.length;
    var sizeLen = infoSizeLen;
    while (newSize > (Math.pow(2, 7 * sizeLen) - 2)) sizeLen++;
    var sizeBytes = new Uint8Array(sizeLen);
    var tmp = newSize;
    for (var j = sizeLen - 1; j >= 0; j--) { sizeBytes[j] = tmp & 0xff; tmp = Math.floor(tmp / 256); }
    sizeBytes[0] |= (0x80 >> (sizeLen - 1));

    var parts = [d.slice(0, infoSizePos), sizeBytes, d.slice(infoContentStart, infoEnd), elem, d.slice(infoEnd)];
    var total = 0; parts.forEach(function (x) { total += x.length; });
    var res = new Uint8Array(total), off = 0;
    parts.forEach(function (x) { res.set(x, off); off += x.length; });
    return res;
  }

  function finalizeVideo(blob) {
    var isWebm = /webm/i.test(blob.type || "");
    if (!isWebm) return Promise.resolve(blob);
    var durMs = Math.max(0.1, (S.trim.end - S.trim.start)) * 1000;
    return fixWebmDuration(blob, durMs);
  }

  /* ---------------- Next -> surface ---------------- */
  function onNext() {
    if (!S.file) return;
    el.next.disabled = true;
    el.next.textContent = "…";

    var finish = function (fileOut) {
      el.next.disabled = false;
      el.next.textContent = "Next";
      el.render.classList.remove("show");
      el.renderFill.style.width = "0%";
      el.overlay.classList.remove("show");
      handoff(fileOut);
    };

    // no edits -> pass original through
    if (!S.dirty) { finish(S.file); return; }

    if (S.kind === "image") {
      showRender("Rendering your edit…", "Applying filters, effects and text.", 0);
      exportImage().then(function (blob) {
        var f = new File([blob], "zyro-edit-" + Date.now() + ".jpg", { type: "image/jpeg" });
        finish(f);
      }).catch(function (e) {
        console.warn("Image export failed", e);
        toast("⚠️ Export failed — original use kiya ja raha hai");
        finish(S.file);
      });
    } else {
      showRender("Rendering video…", "Recording frames with your edits. Please wait.", 0);
      exportVideo(function (p) { updateRender(p); }).then(function (blob) {
        if (!blob || blob.size < 1000) throw new Error("empty");
        return finalizeVideo(blob).then(function (fixed) {
          var isWebm = /webm/i.test(fixed.type || "");
          var f = new File([fixed], "zyro-edit-" + Date.now() + (isWebm ? ".webm" : ".mp4"), { type: fixed.type || "video/webm" });
          finish(f);
        });
      }).catch(function (e) {
        console.warn("Video export failed", e);
        toast("⚠️ Video render failed — original use kiya ja raha hai");
        finish(S.file);
      });
    }
  }

  function showRender(text, sub, p) {
    el.renderText.textContent = text;
    el.renderSub.textContent = sub;
    el.renderFill.style.width = (p * 100) + "%";
    el.render.classList.add("show");
  }
  function updateRender(p) { el.renderFill.style.width = (p * 100) + "%"; }

  function handoff(fileOut) {
    try {
      if (S.kind === "video") {
        if (typeof window.__zeOrigVideoEditor === "function") {
          window.__zeOrigVideoEditor(fileOut, S.category || "reel");
          return;
        }
      } else {
        if (typeof window.openCreatePostModal === "function") window.openCreatePostModal("photo");
        if (typeof window.__zeOrigPostMedia === "function") { window.__zeOrigPostMedia(fileOut); return; }
      }
    } catch (e) { console.warn("handoff error", e); }
    // last resort
    toast("✅ Edit ready");
  }

  /* ---------------- Integration ---------------- */
  function install() {
    if (typeof window.handleVideoSelectedForEditor === "function" && !window.__zeOrigVideoEditor) {
      window.__zeOrigVideoEditor = window.handleVideoSelectedForEditor;
      window.handleVideoSelectedForEditor = function (file, category) {
        var cat = category || window.currentVeCategory || "reel";
        openEditor(file, "video", cat);
      };
    }
    if (typeof window.handlePostMediaSelected === "function" && !window.__zeOrigPostMedia) {
      window.__zeOrigPostMedia = window.handlePostMediaSelected;
      window.handlePostMediaSelected = function (file) {
        if (!file) return;
        var isVid = (file.type && file.type.indexOf("video/") === 0) || /\.(mp4|mov|webm|mkv|3gp|m4v)$/i.test(file.name || "");
        if (isVid) openEditor(file, "video", window.currentCreateType || "reel");
        else openEditor(file, "image", "photo");
      };
    }
  }

  window.zyroOpenEditor = openEditor;
  window.zyroEditorState = S;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
  // also retry shortly in case app scripts define handlers later
  setTimeout(install, 800);
  setTimeout(install, 2000);
})();
