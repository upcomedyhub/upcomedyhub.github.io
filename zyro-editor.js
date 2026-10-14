/* ============================================================
   ZYRO MEDIA EDITOR  v2  —  YouTube Shorts style
   Full-screen preview + right tool rail (Text / Effects / Filters /
   Stickers / Captions / More) + top "Add sound" + volume control
   + bottom Edit / Next + timeline editor (trim / split / delete).
   Self-contained. Hooks into the app by wrapping existing handlers.
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
    texts: [],                // { id, text, x, y, size, color, bg, bgColor, font, weight, cap }
    stickers: [],             // { id, emoji, x, y, size }
    segments: [],             // video: [{ start, end }]
    selSeg: 0,
    trim: { start: 0, end: 0, duration: 0 },
    volume: 1,
    muted: false,
    music: null,              // { name, url, el }
    musicVol: 0.8,
    thumbs: [],
    activeSheet: null,
    timelineOpen: false,
    selectedTextId: null,
    selectedStickerId: null,
    _ac: null, _dest: null
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

  var EFFECTS = [
    { id: "vignette", name: "Vignette" },
    { id: "grain",    name: "Grain" },
    { id: "glow",     name: "Glow" },
    { id: "leak",     name: "Light Leak" },
    { id: "blur",     name: "Blur" }
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
  var STICKERS = ["\uD83D\uDE02","\u2764\uFE0F","\uD83D\uDD25","\uD83D\uDE0D","\uD83D\uDC4D","\uD83D\uDE4C","\uD83C\uDF89","\uD83D\uDCAF","\u2728","\uD83D\uDE0E","\uD83E\uDD79","\uD83D\uDC51","\uD83C\uDFB5","\u26A1","\uD83D\uDC96","\uD83D\uDE0A","\uD83D\uDE4F","\uD83D\uDCAA","\uD83C\uDFAF","\uD83C\uDF1F","\uD83D\uDE31","\uD83E\uDD2F","\uD83D\uDE22","\uD83D\uDE21"];
  var CAPTION_STYLES = [
    { id: "classic",   name: "Classic",   desc: "Clean white" },
    { id: "bold",      name: "Bold",      desc: "Thick outline" },
    { id: "highlight", name: "Highlight", desc: "Boxed" },
    { id: "outline",   name: "Outline",   desc: "Stroke" }
  ];

  /* ---------------- DOM refs ---------------- */
  var el = {};
  var domReady = false;

  function $(id) { return document.getElementById(id); }
  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function fmt(s) { s = Math.max(0, s || 0); var m = Math.floor(s / 60); var ss = Math.floor(s % 60); return m + ":" + (ss < 10 ? "0" : "") + ss; }

  function toast(msg) {
    if (typeof window.showToast === "function") { try { window.showToast(msg); return; } catch (e) {} }
    var t = $("zeToast");
    if (!t) { t = document.createElement("div"); t.id = "zeToast"; t.className = "ze-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t.__tm); t.__tm = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  /* ---------------- Build UI ---------------- */
  function railBtn(tool, label, inner) {
    return '<button class="ze-rail-btn" data-tool="' + tool + '"><span class="ze-rail-ic">' + inner + '</span><span>' + label + '</span></button>';
  }
  function ic(path, extra) { return '<svg viewBox="0 0 24 24"' + (extra || "") + '>' + path + '</svg>'; }

  function buildUI() {
    if (domReady) return;
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="ze-overlay" id="zeOverlay">' +

        '<div class="ze-stage" id="zeStage">' +
          '<div class="ze-canvas" id="zeCanvas">' +
            '<img class="ze-media" id="zeImg" alt="preview" style="display:none">' +
            '<video class="ze-media" id="zeVid" playsinline style="display:none"></video>' +
            '<div class="ze-fx-layer" id="zeFxLayer"></div>' +
            '<div class="ze-text-layer" id="zeTextLayer"></div>' +
            '<div class="ze-sticker-layer" id="zeStickerLayer"></div>' +
          '</div>' +
        '</div>' +

        '<div class="ze-topbar">' +
          '<button class="ze-icon-btn" id="zeCancel" aria-label="Close">' + ic('<path d="M18 6 6 18M6 6l12 12"/>') + '</button>' +
          '<button class="ze-sound" id="zeSoundBtn">' + ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>') + '<span id="zeSoundLabel">Add sound</span></button>' +
          '<button class="ze-icon-btn" id="zeVolBtn" aria-label="Volume">' + ic('<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>') + '</button>' +
        '</div>' +

        '<div class="ze-rail" id="zeRail">' +
          railBtn("text", "Text", '<span style="font-weight:800;font-size:16px;font-family:Georgia,serif">Aa</span>') +
          railBtn("effects", "Effects", ic('<path d="m12 3-1.9 5.8L4 10.7l5.8 1.9L12 18l1.9-5.4L20 10.7l-6.1-1.9Z"/>')) +
          railBtn("filters", "Filters", ic('<circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/>')) +
          railBtn("stickers", "Stickers", ic('<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>')) +
          railBtn("captions", "Captions", ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 12h3M14 12h3"/>')) +
          railBtn("more", "More", ic('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>', ' fill="currentColor" stroke="none"')) +
        '</div>' +

        '<div class="ze-swipe" id="zeSwipe">' + ic('<path d="m18 15-6-6-6 6"/>') + '<span>Swipe up to edit</span></div>' +

        '<div class="ze-bottombar">' +
          '<button class="ze-btn-edit" id="zeEditBtn">Edit</button>' +
          '<button class="ze-btn-next" id="zeNext">Next</button>' +
        '</div>' +

        '<div class="ze-sheet" id="zeSheet">' +
          '<div class="ze-sheet-grab"></div>' +
          '<div class="ze-sheet-head"><div class="ze-sheet-title" id="zeSheetTitle">Text</div>' +
            '<button class="ze-sheet-close" id="zeSheetClose">' + ic('<path d="M18 6 6 18M6 6l12 12"/>') + '</button></div>' +
          '<div class="ze-sheet-body" id="zeSheetBody"></div>' +
        '</div>' +

        '<div class="ze-timeline" id="zeTimeline">' +
          '<div class="ze-tl-head"><div class="ze-tl-title">Timeline</div>' +
            '<div class="ze-tl-time" id="zeTlTime">0:00 / 0:00</div>' +
            '<button class="ze-tl-close" id="zeTlClose">' + ic('<path d="M18 6 6 18M6 6l12 12"/>') + '</button></div>' +
          '<div class="ze-tl-trackwrap" id="zeTlWrap">' +
            '<div class="ze-tl-track"><div class="ze-tl-strip" id="zeTlStrip"></div></div>' +
            '<div id="zeTlSegs" style="position:absolute;inset:0"></div>' +
            '<div class="ze-tl-play" id="zeTlPlay" style="left:0"></div>' +
          '</div>' +
          '<div class="ze-tl-ruler" id="zeTlRuler"></div>' +
          '<div class="ze-tl-tools" id="zeTlTools"></div>' +
        '</div>' +

        '<div class="ze-render" id="zeRender">' +
          '<div class="ze-spinner"></div>' +
          '<div class="ze-render-text" id="zeRenderText">Processing&hellip;</div>' +
          '<div class="ze-render-bar"><div class="ze-render-fill" id="zeRenderFill"></div></div>' +
          '<div class="ze-render-sub" id="zeRenderSub">Please keep this window open.</div>' +
        '</div>' +

      '</div>';
    document.body.appendChild(wrap);

    el.overlay = $("zeOverlay");
    el.stage = $("zeStage");
    el.canvas = $("zeCanvas");
    el.img = $("zeImg");
    el.vid = $("zeVid");
    el.fx = $("zeFxLayer");
    el.textLayer = $("zeTextLayer");
    el.stickerLayer = $("zeStickerLayer");
    el.cancel = $("zeCancel");
    el.soundBtn = $("zeSoundBtn");
    el.soundLabel = $("zeSoundLabel");
    el.volBtn = $("zeVolBtn");
    el.rail = $("zeRail");
    el.swipe = $("zeSwipe");
    el.editBtn = $("zeEditBtn");
    el.next = $("zeNext");
    el.sheet = $("zeSheet");
    el.sheetTitle = $("zeSheetTitle");
    el.sheetClose = $("zeSheetClose");
    el.sheetBody = $("zeSheetBody");
    el.timeline = $("zeTimeline");
    el.tlTime = $("zeTlTime");
    el.tlClose = $("zeTlClose");
    el.tlWrap = $("zeTlWrap");
    el.tlStrip = $("zeTlStrip");
    el.tlSegs = $("zeTlSegs");
    el.tlPlay = $("zeTlPlay");
    el.tlRuler = $("zeTlRuler");
    el.tlTools = $("zeTlTools");
    el.render = $("zeRender");
    el.renderText = $("zeRenderText");
    el.renderFill = $("zeRenderFill");
    el.renderSub = $("zeRenderSub");

    el.cancel.addEventListener("click", closeEditor);
    el.next.addEventListener("click", onNext);
    el.editBtn.addEventListener("click", onEditBtn);
    el.soundBtn.addEventListener("click", function () { openSheet("sound"); });
    el.volBtn.addEventListener("click", toggleMute);
    el.sheetClose.addEventListener("click", closeSheet);
    el.tlClose.addEventListener("click", closeTimeline);

    qsa(".ze-rail-btn", el.rail).forEach(function (b) {
      b.addEventListener("click", function () { openSheet(b.getAttribute("data-tool")); });
    });

    // drag text + stickers
    el.textLayer.addEventListener("pointerdown", onPointerDown);
    el.stickerLayer.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", function () {
      if (el.overlay.classList.contains("show")) { applyAspect(); renderTexts(); renderStickers(); if (S.timelineOpen) renderTimeline(); }
    });

    domReady = true;
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
    S.texts = []; S.stickers = []; S.segments = []; S.selSeg = 0;
    S.trim = { start: 0, end: 0, duration: 0 };
    S.volume = 1; S.muted = false; S.music = null; S.musicVol = 0.8;
    S.thumbs = []; S.selectedTextId = null; S.selectedStickerId = null;
    S.activeSheet = null; S.timelineOpen = false;

    if (S.url) { try { URL.revokeObjectURL(S.url); } catch (e) {} }
    S.url = URL.createObjectURL(file);

    el.overlay.classList.add("show");
    el.overlay.classList.remove("panel-open", "tl-open");
    el.sheet.classList.remove("open");
    el.timeline.classList.remove("open");
    el.render.classList.remove("show");
    el.renderFill.style.width = "0%";
    el.next.disabled = false;
    el.next.textContent = "Next";
    el.editBtn.textContent = "Edit";
    el.soundLabel.textContent = "Add sound";
    el.soundBtn.classList.remove("active");
    el.volBtn.classList.remove("on");
    qsa(".ze-rail-btn", el.rail).forEach(function (b) { b.classList.remove("active"); });
    el.swipe.classList.remove("hide");
    setTimeout(function () { el.swipe.classList.add("hide"); }, 3400);

    el.img.style.display = "none"; el.img.removeAttribute("src");
    el.vid.style.display = "none"; el.vid.removeAttribute("src");
    el.textLayer.innerHTML = ""; el.stickerLayer.innerHTML = ""; el.fx.innerHTML = "";
    _thumbSrc = null;

    if (S.kind === "video") {
      el.vid.src = S.url;
      el.vid.style.display = "block";
      el.vid.loop = true;
      el.vid.muted = false;
      el.vid.volume = 1;
      el.vid.onloadedmetadata = function () {
        var d = el.vid.duration || 0;
        S.trim.duration = d; S.trim.start = 0; S.trim.end = d;
        S.segments = [{ start: 0, end: d }];
        applyAspect();
        try { el.vid.play().catch(function () {}); } catch (e) {}
        setTimeout(captureThumbs, 400);
      };
      el.vid.addEventListener("timeupdate", onTimeUpdate);
      el.vid.onseeked = function () { updatePlayhead(); };
    } else {
      el.img.src = S.url;
      el.img.style.display = "block";
      el.img.onload = function () { applyAspect(); renderTexts(); renderStickers(); };
    }
    applyPreview();
  }

  function closeEditor() {
    el.overlay.classList.remove("show", "panel-open", "tl-open");
    el.sheet.classList.remove("open");
    el.timeline.classList.remove("open");
    S.timelineOpen = false;
    try { el.vid.pause(); } catch (e) {}
    if (S.music && S.music.el) { try { S.music.el.pause(); } catch (e) {} }
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
    var b = a.brightness / 100, c = a.contrast / 100, s = a.saturation / 100;
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
    renderStickers();
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

  /* ---------------- Aspect (fills the screen) ---------------- */
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

    var cs = getComputedStyle(el.stage);
    var padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var stageW = Math.max(60, el.stage.clientWidth - padX);
    var stageH = Math.max(60, el.stage.clientHeight - padY);
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
    S.texts.push({ id: id, text: "Your text", x: 0.5, y: 0.42, size: 0.08, color: "#ffffff", bg: "shadow", bgColor: "#000000", font: "inherit", weight: 800, cap: null });
    S.selectedTextId = id; S.selectedStickerId = null; S.dirty = true;
    renderTexts();
    openSheet("text");
  }
  function addCaption(style) {
    var id = "c" + Date.now();
    S.texts.push({ id: id, text: "Your caption here", x: 0.5, y: 0.84, size: 0.055, color: "#ffffff", bg: "shadow", bgColor: "#000000", font: "inherit", weight: 900, cap: style });
    S.selectedTextId = id; S.selectedStickerId = null; S.dirty = true;
    renderTexts(); renderSheet();
    toast("Caption added \u2014 drag to move, tap to edit");
  }
  function addSticker(emoji) {
    var id = "s" + Date.now();
    S.stickers.push({ id: id, emoji: emoji, x: 0.5, y: 0.5, size: 0.2 });
    S.selectedStickerId = id; S.selectedTextId = null; S.dirty = true;
    renderStickers();
    toast("Sticker added \u2014 drag to move");
  }

  function renderTexts() {
    var boxW = el.canvas.clientWidth || 300;
    var html = "";
    S.texts.forEach(function (t) {
      var fs = Math.max(10, t.size * boxW);
      var st = "left:" + (t.x * 100) + "%;top:" + (t.y * 100) + "%;font-size:" + fs + "px;font-family:" + t.font + ";font-weight:" + t.weight + ";color:" + t.color + ";";
      var cls = "ze-text-item" + (t.id === S.selectedTextId ? " selected" : "");
      if (t.cap) {
        cls += " ze-caption-item";
        st += "top:auto;bottom:" + ((1 - t.y) * 100) + "%;";
        if (t.cap === "highlight") st += "background:" + (t.bgColor || "#e63946") + ";";
        else if (t.cap === "bold") st += "-webkit-text-stroke:3px #000;paint-order:stroke;text-shadow:none;";
        else if (t.cap === "outline") st += "-webkit-text-stroke:2px #000;text-shadow:none;";
      } else {
        if (t.bg === "solid") { cls += " ze-bg-solid"; st += "background:" + t.bgColor + ";"; }
        else if (t.bg === "outline") { cls += " ze-bg-outline"; }
      }
      html += '<div class="' + cls + '" data-id="' + t.id + '" style="' + st + '">' + escapeHtml(t.text) + "</div>";
    });
    el.textLayer.innerHTML = html;
  }
  function renderStickers() {
    var boxW = el.canvas.clientWidth || 300;
    var html = "";
    S.stickers.forEach(function (s) {
      var fs = Math.max(18, s.size * boxW);
      var st = "left:" + (s.x * 100) + "%;top:" + (s.y * 100) + "%;font-size:" + fs + "px;";
      var cls = "ze-sticker-item" + (s.id === S.selectedStickerId ? " selected" : "");
      html += '<div class="' + cls + '" data-id="' + s.id + '" style="' + st + '">' + s.emoji + "</div>";
    });
    el.stickerLayer.innerHTML = html;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }

  /* ---------------- Drag (text + stickers) ---------------- */
  var drag = null;
  function onPointerDown(e) {
    var item = e.target.closest ? e.target.closest(".ze-text-item,.ze-sticker-item") : null;
    if (!item) {
      S.selectedTextId = null; S.selectedStickerId = null;
      renderTexts(); renderStickers();
      return;
    }
    var id = item.getAttribute("data-id");
    if (item.classList.contains("ze-sticker-item")) { S.selectedStickerId = id; S.selectedTextId = null; }
    else { S.selectedTextId = id; S.selectedStickerId = null; }
    renderTexts(); renderStickers();
    drag = { id: id, rect: el.canvas.getBoundingClientRect(), sticker: item.classList.contains("ze-sticker-item") };
    if (item.setPointerCapture) { try { item.setPointerCapture(e.pointerId); } catch (er) {} }
    e.preventDefault();
    if (S.activeSheet === "text" && !drag.sticker) renderSheet();
  }
  function onPointerMove(e) {
    if (!drag) return;
    var r = drag.rect;
    var x = clamp((e.clientX - r.left) / r.width, 0, 1);
    var y = clamp((e.clientY - r.top) / r.height, 0, 1);
    if (drag.sticker) {
      var s = S.stickers.filter(function (k) { return k.id === drag.id; })[0];
      if (s) { s.x = x; s.y = y; var n = el.stickerLayer.querySelector('[data-id="' + s.id + '"]'); if (n) { n.style.left = (x * 100) + "%"; n.style.top = (y * 100) + "%"; } }
    } else {
      var t = S.texts.filter(function (k) { return k.id === drag.id; })[0];
      if (t) {
        t.x = x; t.y = y;
        var n2 = el.textLayer.querySelector('[data-id="' + t.id + '"]');
        if (n2) { n2.style.left = (x * 100) + "%"; if (t.cap) { n2.style.top = "auto"; n2.style.bottom = ((1 - y) * 100) + "%"; } else { n2.style.top = (y * 100) + "%"; } }
      }
    }
  }
  function onPointerUp() { if (drag) { drag = null; S.dirty = true; } }

  function selectedText() { return S.texts.filter(function (x) { return x.id === S.selectedTextId; })[0] || null; }

  /* ---------------- Sheets (tool panels) ---------------- */
  function openSheet(name) {
    S.activeSheet = name;
    qsa(".ze-rail-btn", el.rail).forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tool") === name); });
    el.sheet.classList.add("open");
    el.overlay.classList.add("panel-open");
    el.overlay.classList.remove("tl-open");
    if (S.timelineOpen) { S.timelineOpen = false; el.timeline.classList.remove("open"); }
    renderSheet();
    applyAspect();
    setTimeout(function () { el.sheetBody.scrollTop = 0; }, 30);
  }
  function closeSheet() {
    S.activeSheet = null;
    el.sheet.classList.remove("open");
    el.overlay.classList.remove("panel-open");
    qsa(".ze-rail-btn", el.rail).forEach(function (b) { b.classList.remove("active"); });
    applyAspect();
  }
  function renderSheet() {
    var n = S.activeSheet;
    if (n === "text") renderTextSheet();
    else if (n === "filters") renderFiltersSheet();
    else if (n === "effects") renderEffectsSheet();
    else if (n === "stickers") renderStickersSheet();
    else if (n === "captions") renderCaptionsSheet();
    else if (n === "more") renderMoreSheet();
    else if (n === "sound") renderSoundSheet();
  }
  function setSheetTitle(t) { el.sheetTitle.textContent = t; }

  /* --- Text sheet --- */
  function renderTextSheet() {
    setSheetTitle("Text");
    var t = selectedText();
    if (!t) {
      el.sheetBody.innerHTML = '<div class="ze-empty">Add text to your video or photo.<br>Tap a text to edit it, drag to move.</div>' +
        '<button class="ze-btn ze-btn-primary" id="zeAddText">&#65291; Add Text</button>';
      $("zeAddText").addEventListener("click", addText);
      return;
    }
    var html = '<div class="ze-text-tools">' +
      '<input type="text" class="ze-input" id="zeTextInput" value="' + escapeAttr(t.text) + '" placeholder="Type something...">' +
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
      sliderRow("zeTextSize", "Size", Math.round(t.size * 100), 3, 22, "%") +
      '<div style="display:flex;gap:8px">' +
        '<button class="ze-btn ze-btn-ghost" id="zeAddText2">&#65291; Add</button>' +
        '<button class="ze-btn ze-btn-danger" id="zeDelText">&#128465; Delete</button>' +
      "</div></div>";
    el.sheetBody.innerHTML = html;

    $("zeTextInput").addEventListener("input", function () { t.text = this.value; S.dirty = true; renderTexts(); });
    $("zeAddText2").addEventListener("click", addText);
    $("zeDelText").addEventListener("click", function () {
      S.texts = S.texts.filter(function (x) { return x.id !== t.id; });
      S.selectedTextId = S.texts.length ? S.texts[0].id : null;
      S.dirty = true; renderTexts(); renderSheet();
    });
    qsa("#zeSwatches .ze-swatch", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () { t.color = n.getAttribute("data-c"); S.dirty = true; renderTexts(); renderSheet(); });
    });
    qsa("#zeFonts .ze-font-btn", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () { t.font = n.getAttribute("data-f"); S.dirty = true; renderTexts(); renderSheet(); });
    });
    qsa("#zeBgChips .ze-chip", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () { t.bg = n.getAttribute("data-bg"); S.dirty = true; renderTexts(); renderSheet(); });
    });
    bindSlider("zeTextSize", function (v) { t.size = v / 100; S.dirty = true; renderTexts(); });
  }

  /* --- Filters sheet --- */
  function renderFiltersSheet() {
    setSheetTitle("Filters");
    var thumbSrc = thumbSource();
    var html = '<div class="ze-filter-strip">';
    FILTERS.forEach(function (f) {
      html += '<div class="ze-filter-thumb' + (f.id === S.filterId ? " active" : "") + '" data-fid="' + f.id + '">' +
                '<img class="ze-ft-img" src="' + thumbSrc + '" style="filter:' + (f.css || "none") + '" alt="' + f.name + '">' +
                '<span class="ze-ft-name">' + f.name + '</span></div>';
    });
    html += "</div>";
    el.sheetBody.innerHTML = html;
    qsa(".ze-filter-thumb", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () {
        S.filterId = n.getAttribute("data-fid"); S.dirty = true;
        applyPreview(); renderFiltersSheet();
      });
    });
  }

  var _thumbSrc = null;
  function thumbSource() {
    if (_thumbSrc) return _thumbSrc;
    try {
      if (S.kind === "image") { _thumbSrc = el.img.src; return _thumbSrc; }
      if (S.thumbs && S.thumbs.length) { _thumbSrc = S.thumbs[Math.floor(S.thumbs.length / 2)]; return _thumbSrc; }
      var c = document.createElement("canvas"); c.width = 120; c.height = 120;
      var ctx = c.getContext("2d");
      var vw = el.vid.videoWidth || 120, vh = el.vid.videoHeight || 120;
      var s = Math.min(vw, vh);
      ctx.drawImage(el.vid, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, 120, 120);
      _thumbSrc = c.toDataURL("image/jpeg", 0.6);
    } catch (e) { _thumbSrc = ""; }
    return _thumbSrc;
  }

  /* --- Effects sheet --- */
  function renderEffectsSheet() {
    setSheetTitle("Effects");
    var thumbSrc = thumbSource();
    var html = '<div class="ze-fx-grid">';
    EFFECTS.forEach(function (fx) {
      var on = S.effects[fx.id] > 0;
      var preview = '<img src="' + thumbSrc + '" style="filter:' + (fx.id === "blur" ? "blur(3px)" : "none") + '">';
      if (fx.id === "vignette") preview = '<img src="' + thumbSrc + '" style="box-shadow:inset 0 0 40px 14px rgba(0,0,0,.85)">';
      if (fx.id === "grain") preview = '<img src="' + thumbSrc + '" style="opacity:.75">';
      if (fx.id === "glow") preview = '<img src="' + thumbSrc + '" style="filter:brightness(1.25) saturate(1.2)">';
      if (fx.id === "leak") preview = '<img src="' + thumbSrc + '" style="filter:sepia(.4) saturate(1.4) hue-rotate(-15deg) brightness(1.1)">';
      html += '<div class="ze-fx-card' + (on ? " active" : "") + '" data-fx="' + fx.id + '">' + preview +
              (on ? '<span class="ze-fx-badge">ON</span>' : "") + '<span>' + fx.name + '</span></div>';
    });
    html += "</div>";
    html += sliderRow("zeBlur", "Blur", S.effects.blur, 0, 100, "%");
    el.sheetBody.innerHTML = html;

    qsa(".ze-fx-card", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () {
        var k = n.getAttribute("data-fx");
        S.effects[k] = S.effects[k] > 0 ? 0 : 70;
        S.dirty = true; applyPreview(); renderEffectsSheet();
      });
    });
    bindSlider("zeBlur", function (v) { S.effects.blur = v; S.dirty = true; applyPreview(); });
  }

  /* --- Stickers sheet --- */
  function renderStickersSheet() {
    setSheetTitle("Stickers");
    var html = '<div class="ze-sticker-grid">' +
      STICKERS.map(function (s) { return '<button class="ze-sticker-btn" data-s="' + s + '">' + s + "</button>"; }).join("") +
      "</div>";
    el.sheetBody.innerHTML = html;
    qsa(".ze-sticker-btn", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () { addSticker(n.getAttribute("data-s")); });
    });
  }

  /* --- Captions sheet --- */
  function renderCaptionsSheet() {
    setSheetTitle("Captions");
    var html = '<div class="ze-panel-title">Caption style</div><div class="ze-cap-grid">' +
      CAPTION_STYLES.map(function (c) {
        var st = "color:#fff;";
        if (c.id === "highlight") st += "background:#e63946;border-radius:6px;padding:2px 8px;";
        if (c.id === "bold") st += "-webkit-text-stroke:2px #000;";
        if (c.id === "outline") st += "-webkit-text-stroke:1.5px #000;color:#fff;";
        return '<div class="ze-cap-card" data-cap="' + c.id + '"><b style="' + st + '">Aa</b><small>' + c.name + " \u00b7 " + c.desc + "</small></div>";
      }).join("") + "</div>";
    html += '<div style="height:14px"></div><button class="ze-btn ze-btn-primary" id="zeAddCap">&#65291; Add caption</button>';
    el.sheetBody.innerHTML = html;
    qsa(".ze-cap-card", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () { addCaption(n.getAttribute("data-cap")); });
    });
    $("zeAddCap").addEventListener("click", function () { addCaption("classic"); });
  }

  /* --- More sheet (adjust / transform / aspect) --- */
  function renderMoreSheet() {
    setSheetTitle("More");
    var a = S.adjust;
    var html = '<div class="ze-panel-title">Adjust</div>' +
      sliderRow("zeBright", "Brightness", a.brightness, 50, 150, "%") +
      sliderRow("zeContrast", "Contrast", a.contrast, 50, 150, "%") +
      sliderRow("zeSat", "Saturation", a.saturation, 0, 200, "%") +
      sliderRow("zeWarm", "Warmth", a.warmth, -100, 100, "") +
      sliderRow("zeFade", "Fade", a.fade, 0, 100, "%");
    html += '<div class="ze-panel-title">Transform</div><div class="ze-chips">' +
      '<button class="ze-chip" data-tr="rot">&#8635; Rotate 90&deg;</button>' +
      '<button class="ze-chip' + (S.transform.flipH ? " active" : "") + '" data-tr="fliph">&#8646; Flip H</button>' +
      '<button class="ze-chip' + (S.transform.flipV ? " active" : "") + '" data-tr="flipv">&#8645; Flip V</button>' +
      '<button class="ze-chip" data-tr="reset">Reset</button></div>';
    html += '<div class="ze-panel-title">Aspect ratio</div><div class="ze-chips">' +
      ASPECTS.map(function (x) { return '<button class="ze-chip' + (x.id === S.aspect ? " active" : "") + '" data-asp="' + x.id + '">' + x.name + "</button>"; }).join("") +
      "</div>";
    el.sheetBody.innerHTML = html;

    bindSlider("zeBright", function (v) { a.brightness = v; S.dirty = true; applyPreview(); });
    bindSlider("zeContrast", function (v) { a.contrast = v; S.dirty = true; applyPreview(); });
    bindSlider("zeSat", function (v) { a.saturation = v; S.dirty = true; applyPreview(); });
    bindSlider("zeWarm", function (v) { a.warmth = v; S.dirty = true; applyPreview(); });
    bindSlider("zeFade", function (v) { a.fade = v; S.dirty = true; applyPreview(); });

    qsa("[data-tr]", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () {
        var k = n.getAttribute("data-tr");
        if (k === "rot") S.transform.rotate = (S.transform.rotate + 90) % 360;
        else if (k === "fliph") S.transform.flipH = !S.transform.flipH;
        else if (k === "flipv") S.transform.flipV = !S.transform.flipV;
        else { S.transform = { rotate: 0, flipH: false, flipV: false }; S.aspect = "original"; }
        S.dirty = true; applyAspect(); applyPreview(); renderMoreSheet();
      });
    });
    qsa("[data-asp]", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () {
        S.aspect = n.getAttribute("data-asp"); S.dirty = true;
        applyAspect(); renderTexts(); renderStickers(); renderMoreSheet();
      });
    });
  }

  /* --- Sound sheet --- */
  function renderSoundSheet() {
    setSheetTitle("Sound");
    var html = '<div class="ze-panel-title">Volume</div>' +
      sliderRow("zeVol", "Volume", Math.round(S.volume * 100), 0, 100, "%") +
      '<div class="ze-chips"><button class="ze-chip' + (S.muted ? " active" : "") + '" id="zeMuteChip">' + (S.muted ? "\uD83D\uDD07 Muted" : "\uD83D\uDD0A Sound on") + "</button></div>";
    html += '<div class="ze-panel-title">Music</div>';
    if (S.music) {
      html += '<div class="ze-sound-row active"><div class="ze-sound-ic">' + ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>') + '</div>' +
        '<div class="ze-sound-meta"><b>' + escapeHtml(S.music.name) + '</b><small>Added \u00b7 tap to remove</small></div></div>';
      html += sliderRow("zeMusicVol", "Music vol", Math.round(S.musicVol * 100), 0, 100, "%");
    }
    html += '<div style="height:10px"></div><button class="ze-btn ze-btn-ghost" id="zeAddMusic">&#65291; Add music from device</button>' +
      '<input type="file" id="zeMusicFile" accept="audio/*" hidden>';
    el.sheetBody.innerHTML = html;

    bindSlider("zeVol", function (v) { S.volume = v / 100; el.vid.volume = S.volume; if (S.volume > 0 && S.muted) { S.muted = false; el.vid.muted = false; el.volBtn.classList.remove("on"); } });
    if ($("zeMusicVol")) bindSlider("zeMusicVol", function (v) { S.musicVol = v / 100; if (S.music && S.music.el) S.music.el.volume = S.musicVol; });
    $("zeMuteChip").addEventListener("click", function () { toggleMute(); renderSoundSheet(); });
    if (S.music) {
      qs(".ze-sound-row", el.sheetBody).addEventListener("click", function () {
        try { S.music.el.pause(); } catch (e) {}
        S.music = null; renderSoundSheet(); updateSoundLabel();
      });
    }
    $("zeAddMusic").addEventListener("click", function () { $("zeMusicFile").click(); });
    $("zeMusicFile").addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return;
      var url = URL.createObjectURL(f);
      var au = new Audio(url); au.loop = true; au.volume = S.musicVol;
      S.music = { name: f.name.replace(/\.[^.]+$/, ""), url: url, el: au };
      updateSoundLabel();
      try { if (!el.vid.paused) au.play(); } catch (e) {}
      renderSoundSheet();
      toast("\uD83C\uDFB5 Music added");
    });
  }

  function toggleMute() {
    S.muted = !S.muted;
    el.vid.muted = S.muted;
    el.volBtn.classList.toggle("on", S.muted);
    if (S.music && S.music.el) S.music.el.muted = S.muted;
    toast(S.muted ? "\uD83D\uDD07 Muted" : "\uD83D\uDD0A Sound on");
  }
  function updateSoundLabel() {
    if (S.music) { el.soundLabel.textContent = S.music.name; el.soundBtn.classList.add("active"); }
    else { el.soundLabel.textContent = "Add sound"; el.soundBtn.classList.remove("active"); }
  }

  function sliderRow(id, label, val, min, max, unit) {
    return '<div class="ze-row"><span class="ze-label">' + label + '</span>' +
      '<input type="range" class="ze-range" id="' + id + '" min="' + min + '" max="' + max + '" step="1" value="' + val + '">' +
      '<span class="ze-val" id="' + id + 'V">' + Math.round(val) + unit + "</span></div>";
  }
  function bindSlider(id, cb) {
    var input = $(id), out = $(id + "V");
    if (!input) return;
    input.addEventListener("input", function () {
      var v = parseFloat(input.value);
      if (out) out.textContent = Math.round(v) + (id === "zeWarm" ? "" : "%");
      cb(v);
    });
  }

  /* ---------------- Timeline ---------------- */
  function onEditBtn() {
    if (S.kind !== "video") { openSheet("more"); return; }
    openTimeline();
  }
  function openTimeline() {
    S.timelineOpen = true;
    closeSheet();
    el.timeline.classList.add("open");
    el.overlay.classList.add("tl-open");
    el.swipe.classList.add("hide");
    try { el.vid.pause(); } catch (e) {}
    renderTimeline();
    applyAspect();
  }
  function closeTimeline() {
    S.timelineOpen = false;
    el.timeline.classList.remove("open");
    el.overlay.classList.remove("tl-open");
    applyAspect();
  }
  function activeSegments() { return S.segments.length ? S.segments : [{ start: 0, end: S.trim.duration || 0 }]; }
  function segAt(t) {
    var segs = activeSegments();
    for (var i = 0; i < segs.length; i++) if (t >= segs[i].start - 0.001 && t <= segs[i].end + 0.001) return { seg: segs[i], i: i };
    return null;
  }
  function onTimeUpdate() {
    if (S.kind !== "video") return;
    var segs = activeSegments();
    var cur = el.vid.currentTime;
    var hit = segAt(cur);
    if (hit && cur >= hit.seg.end - 0.06) {
      var next = segs[hit.i + 1];
      if (next) { el.vid.currentTime = next.start + 0.01; }
      else { el.vid.currentTime = segs[0].start + 0.01; }
    }
    if (S.timelineOpen) updatePlayhead();
  }
  function updatePlayhead() {
    var dur = S.trim.duration || 1;
    var pct = clamp((el.vid.currentTime || 0) / dur * 100, 0, 100);
    el.tlPlay.style.left = pct + "%";
    el.tlTime.textContent = fmt(el.vid.currentTime) + " / " + fmt(dur);
  }
  function renderTimeline() {
    var dur = S.trim.duration || 1;
    if (S.thumbs.length) el.tlStrip.innerHTML = S.thumbs.map(function (u) { return u ? '<img src="' + u + '">' : ""; }).join("");
    else el.tlStrip.innerHTML = "";
    var html = "";
    S.segments.forEach(function (seg, i) {
      var l = seg.start / dur * 100, w = (seg.end - seg.start) / dur * 100;
      html += '<div class="ze-tl-seg' + (i === S.selSeg ? " sel" : "") + '" data-i="' + i + '" style="left:' + l + '%;width:' + w + '%"></div>';
    });
    if (S.segments.length) {
      var f = S.segments[0], last = S.segments[S.segments.length - 1];
      html += '<div class="ze-tl-handle" data-h="start" style="left:calc(' + (f.start / dur * 100) + '% - 9px)"><i></i></div>';
      html += '<div class="ze-tl-handle" data-h="end" style="left:calc(' + (last.end / dur * 100) + '% - 9px)"><i></i></div>';
    }
    el.tlSegs.innerHTML = html;
    var ticks = 5, r = "";
    for (var k = 0; k <= ticks; k++) r += "<span>" + fmt(dur * k / ticks) + "</span>";
    el.tlRuler.innerHTML = r;
    el.tlTools.innerHTML =
      tlTool("split", "Split", ic('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>')) +
      tlTool("delete", "Delete", ic('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>')) +
      tlTool("volume", "Volume", ic('<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>')) +
      tlTool("audio", "Add audio", ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')) +
      tlTool("mute", "Mute", ic('<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m23 9-6 6M17 9l6 6"/>'));
    qsa(".ze-tl-tool", el.tlTools).forEach(function (b) {
      b.addEventListener("click", function () { onTlTool(b.getAttribute("data-tool")); });
    });
    qsa(".ze-tl-seg", el.tlSegs).forEach(function (n) {
      n.addEventListener("click", function () {
        S.selSeg = parseInt(n.getAttribute("data-i"), 10) || 0;
        var seg = S.segments[S.selSeg];
        if (seg) { try { el.vid.currentTime = seg.start + 0.01; } catch (e) {} }
        renderTimeline();
      });
    });
    qsa(".ze-tl-handle", el.tlSegs).forEach(function (h) {
      h.addEventListener("pointerdown", function (e) { startHandleDrag(e, h.getAttribute("data-h")); });
    });
    el.tlWrap.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".ze-tl-handle") || e.target.closest(".ze-tl-seg")) return;
      scrubTo(e);
      el.tlWrap.addEventListener("pointermove", scrubMove);
      window.addEventListener("pointerup", scrubEnd);
    });
    updatePlayhead();
  }
  function tlTool(tool, label, inner) {
    return '<button class="ze-tl-tool" data-tool="' + tool + '"><span class="ze-tl-tool-ic">' + inner + '</span><span>' + label + "</span></button>";
  }
  function scrubTo(e) {
    var r = el.tlWrap.getBoundingClientRect();
    var t = clamp((e.clientX - r.left) / r.width, 0, 1) * (S.trim.duration || 0);
    try { el.vid.currentTime = t; } catch (er) {}
    updatePlayhead();
  }
  function scrubMove(e) { scrubTo(e); }
  function scrubEnd() { el.tlWrap.removeEventListener("pointermove", scrubMove); window.removeEventListener("pointerup", scrubEnd); }

  var hDrag = null;
  function startHandleDrag(e, which) {
    hDrag = { which: which, rect: el.tlWrap.getBoundingClientRect() };
    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
    e.preventDefault(); e.stopPropagation();
  }
  function handleDragMove(e) {
    if (!hDrag) return;
    var dur = S.trim.duration || 1;
    var t = clamp((e.clientX - hDrag.rect.left) / hDrag.rect.width, 0, 1) * dur;
    if (hDrag.which === "start") {
      var f = S.segments[0];
      f.start = clamp(t, 0, f.end - 0.2);
    } else {
      var last = S.segments[S.segments.length - 1];
      last.end = clamp(t, last.start + 0.2, dur);
    }
    S.dirty = true;
    renderTimeline();
  }
  function handleDragEnd() { hDrag = null; window.removeEventListener("pointermove", handleDragMove); window.removeEventListener("pointerup", handleDragEnd); }

  function onTlTool(tool) {
    if (tool === "split") return splitAt();
    if (tool === "delete") return deleteSeg();
    if (tool === "volume" || tool === "audio") { openSheet("sound"); return; }
    if (tool === "mute") { toggleMute(); }
  }
  function splitAt() {
    var cur = el.vid.currentTime || 0;
    var segs = S.segments;
    for (var i = 0; i < segs.length; i++) {
      if (cur > segs[i].start + 0.15 && cur < segs[i].end - 0.15) {
        var end = segs[i].end;
        segs[i].end = cur;
        segs.splice(i + 1, 0, { start: cur, end: end });
        S.selSeg = i + 1; S.dirty = true;
        renderTimeline();
        toast("\u2702\uFE0F Split at " + fmt(cur));
        return;
      }
    }
    toast("Move the playhead inside a clip to split");
  }
  function deleteSeg() {
    if (S.segments.length <= 1) { toast("Can't delete the only clip"); return; }
    S.segments.splice(S.selSeg, 1);
    S.selSeg = Math.max(0, S.selSeg - 1);
    S.dirty = true;
    renderTimeline();
    toast("\uD83D\uDDD1\uFE0F Clip removed");
  }

  /* ---------------- Thumbnails for timeline ---------------- */
  function captureThumbs() {
    if (S.kind !== "video") return;
    var dur = S.trim.duration; if (!dur) return;
    var N = 8, out = [], i = 0;
    var wasMuted = el.vid.muted, wasTime = el.vid.currentTime, wasPaused = el.vid.paused;
    el.vid.muted = true;
    try { el.vid.pause(); } catch (e) {}
    function step() {
      if (i >= N) {
        S.thumbs = out;
        el.vid.muted = wasMuted;
        try { el.vid.currentTime = wasTime; } catch (e) {}
        if (!wasPaused) { try { el.vid.play().catch(function () {}); } catch (e) {} }
        _thumbSrc = null;
        if (S.timelineOpen) renderTimeline();
        if (S.activeSheet === "filters") renderFiltersSheet();
        if (S.activeSheet === "effects") renderEffectsSheet();
        return;
      }
      var t = (i + 0.5) / N * dur;
      var done = false;
      var onSeek = function () {
        if (done) return; done = true;
        el.vid.removeEventListener("seeked", onSeek);
        try {
          var c = document.createElement("canvas"); c.width = 72; c.height = 72;
          var x = c.getContext("2d");
          var vw = el.vid.videoWidth || 72, vh = el.vid.videoHeight || 72;
          var s = Math.min(vw, vh);
          x.drawImage(el.vid, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, 72, 72);
          out.push(c.toDataURL("image/jpeg", 0.5));
        } catch (e) { out.push(""); }
        i++; setTimeout(step, 20);
      };
      el.vid.addEventListener("seeked", onSeek);
      try { el.vid.currentTime = t; } catch (e) { i++; setTimeout(step, 20); return; }
      setTimeout(function () { if (!done) onSeek(); }, 700);
    }
    step();
  }

  /* ---------------- Baking ---------------- */
  function noiseCanvas() {
    if (noiseCanvas._c) return noiseCanvas._c;
    var c = document.createElement("canvas"); c.width = 128; c.height = 128;
    var ctx = c.getContext("2d");
    var img = ctx.createImageData(128, 128);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.random() * 255 | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
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
  function fontCss(f) { return f === "inherit" ? "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" : f; }
  function drawTexts(ctx, W, H) {
    S.texts.forEach(function (t) {
      var fs = Math.max(8, t.size * W);
      ctx.save();
      ctx.font = t.weight + " " + fs + "px " + fontCss(t.font);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      var x = t.x * W, y = t.y * H;
      var lines = String(t.text).split("\n");
      var lineH = fs * 1.2, totalH = lineH * lines.length;
      var isCap = !!t.cap;
      if (!isCap && t.bg === "solid") {
        var maxW = 0; lines.forEach(function (l) { maxW = Math.max(maxW, ctx.measureText(l).width); });
        var padX = fs * 0.35, padY = fs * 0.22;
        ctx.fillStyle = t.bgColor || "#000";
        roundRect(ctx, x - maxW / 2 - padX, y - totalH / 2 - padY, maxW + padX * 2, totalH + padY * 2, fs * 0.25);
        ctx.fill();
      }
      if (isCap && t.cap === "highlight") {
        var mw = 0; lines.forEach(function (l) { mw = Math.max(mw, ctx.measureText(l).width); });
        var px = fs * 0.4, py = fs * 0.25;
        ctx.fillStyle = t.bgColor || "#e63946";
        roundRect(ctx, x - mw / 2 - px, y - totalH / 2 - py, mw + px * 2, totalH + py * 2, fs * 0.28);
        ctx.fill();
      }
      lines.forEach(function (l, i) {
        var ly = y - totalH / 2 + lineH * (i + 0.5);
        if (isCap && (t.cap === "bold" || t.cap === "outline")) {
          ctx.lineWidth = Math.max(3, fs * (t.cap === "bold" ? 0.16 : 0.1));
          ctx.strokeStyle = "#000"; ctx.lineJoin = "round"; ctx.strokeText(l, x, ly);
        } else if (!isCap && t.bg === "outline") {
          ctx.lineWidth = Math.max(2, fs * 0.09); ctx.strokeStyle = "#000"; ctx.strokeText(l, x, ly);
        } else if ((!isCap && t.bg !== "solid") || (isCap && t.cap === "classic")) {
          ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = fs * 0.18; ctx.shadowOffsetY = fs * 0.03;
        }
        ctx.fillStyle = t.color; ctx.fillText(l, x, ly);
      });
      ctx.restore();
    });
  }
  function drawStickers(ctx, W, H) {
    S.stickers.forEach(function (s) {
      var fs = Math.max(12, s.size * W);
      ctx.save();
      ctx.font = fs + "px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(s.emoji, s.x * W, s.y * H);
      ctx.restore();
    });
  }

  /* ---------------- Export ---------------- */
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
        drawStickers(ctx, sz.w, sz.h);
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
  function ensureAudioGraph() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!S._ac) S._ac = new AC();
    var ac = S._ac;
    if (ac.state === "suspended") { try { ac.resume(); } catch (e) {} }
    if (!S._dest) S._dest = ac.createMediaStreamDestination();
    if (!el.vid.__src) { try { el.vid.__src = ac.createMediaElementSource(el.vid); el.vid.__src.connect(ac.destination); } catch (e) {} }
    if (S.music && S.music.el && !S.music.el.__src) { try { S.music.el.__src = ac.createMediaElementSource(S.music.el); S.music.el.__src.connect(ac.destination); } catch (e) {} }
    return { ac: ac, dest: S._dest };
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

        var graph = ensureAudioGraph();
        if (graph) {
          try { if (v.__src) v.__src.connect(graph.dest); } catch (e) {}
          try { if (S.music && S.music.el && S.music.el.__src) S.music.el.__src.connect(graph.dest); } catch (e) {}
          graph.dest.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });
        }

        var mime = pickVideoMime();
        var rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6000000 } : undefined);
        var chunks = [];
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        var stopped = new Promise(function (res) { rec.onstop = function () { res(new Blob(chunks, { type: mime || "video/webm" })); }; });

        var segs = activeSegments();
        var totalDur = segs.reduce(function (a, s) { return a + (s.end - s.start); }, 0) || 1;
        var doneDur = 0;

        v.loop = false;
        rec.start(100);
        v.muted = S.muted;
        v.volume = S.volume;
        if (S.music && S.music.el) { try { S.music.el.currentTime = 0; S.music.el.volume = S.musicVol; S.music.el.play(); } catch (e) {} }

        function drawFrame() {
          var n = mediaNatural();
          var rot = ((S.transform.rotate % 360) + 360) % 360;
          var identity = rot === 0 && !S.transform.flipH && !S.transform.flipV;
          octx.filter = buildFilter() || "none";
          if (identity) drawCover(octx, v, sz.w, sz.h, n.w, n.h);
          else drawCover(octx, flattenMedia(), sz.w, sz.h);
          octx.filter = "none";
          drawEffects(octx, sz.w, sz.h);
          drawTexts(octx, sz.w, sz.h);
          drawStickers(octx, sz.w, sz.h);
        }

        function finish() {
          try { v.pause(); } catch (e) {}
          try { v.loop = true; } catch (e) {}
          if (S.music && S.music.el) { try { S.music.el.pause(); } catch (e) {} }
          try { rec.stop(); } catch (e) {}
          stopped.then(resolve).catch(reject);
        }

        var si = 0, started = false;
        function playSeg() {
          if (si >= segs.length) { finish(); return; }
          var seg = segs[si];
          started = false;
          var begin = function () {
            if (started) return; started = true;
            v.removeEventListener("seeked", begin);
            v.play().then(function () {
              function loop() {
                if (v.currentTime >= seg.end - 0.02 || v.ended) {
                  doneDur += (seg.end - seg.start);
                  si++; playSeg(); return;
                }
                drawFrame();
                if (onProgress) onProgress(Math.min(1, (doneDur + (v.currentTime - seg.start)) / totalDur));
                requestAnimationFrame(loop);
              }
              requestAnimationFrame(loop);
            }).catch(reject);
          };
          if (Math.abs(v.currentTime - seg.start) < 0.05) begin();
          else { v.addEventListener("seeked", begin); v.currentTime = seg.start; setTimeout(begin, 1200); }
        }
        playSeg();
      } catch (e) { reject(e); }
    });
  }

  /* ---------------- WebM duration fix ---------------- */
  function fixWebmDuration(blob, durationMs) {
    return new Promise(function (resolve) {
      try {
        var fr = new FileReader();
        fr.onload = function () {
          try { var d = new Uint8Array(fr.result); var out = patchWebmDuration(d, durationMs); resolve(out ? new Blob([out], { type: blob.type }) : blob); }
          catch (e) { resolve(blob); }
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
    if (!/webm/i.test(blob.type || "")) return Promise.resolve(blob);
    var segs = activeSegments();
    var durMs = segs.reduce(function (a, s) { return a + (s.end - s.start); }, 0) * 1000;
    return fixWebmDuration(blob, Math.max(100, durMs));
  }

  /* ---------------- Next -> surface ---------------- */
  function onNext() {
    if (!S.file) return;
    el.next.disabled = true;
    el.next.textContent = "\u2026";

    var finish = function (fileOut) {
      el.next.disabled = false;
      el.next.textContent = "Next";
      el.render.classList.remove("show");
      el.renderFill.style.width = "0%";
      el.overlay.classList.remove("show", "panel-open", "tl-open");
      el.sheet.classList.remove("open");
      el.timeline.classList.remove("open");
      S.timelineOpen = false;
      try { el.vid.pause(); } catch (e) {}
      if (S.music && S.music.el) { try { S.music.el.pause(); } catch (e) {} }
      handoff(fileOut);
    };

    if (!S.dirty) { finish(S.file); return; }

    if (S.kind === "image") {
      showRender("Rendering your edit\u2026", "Applying filters, effects and text.", 0);
      exportImage().then(function (blob) {
        finish(new File([blob], "zyro-edit-" + Date.now() + ".jpg", { type: "image/jpeg" }));
      }).catch(function (e) {
        console.warn("Image export failed", e);
        toast("\u26A0\uFE0F Export failed \u2014 original use kiya ja raha hai");
        finish(S.file);
      });
    } else {
      showRender("Rendering video\u2026", "Recording frames with your edits. Please wait.", 0);
      exportVideo(function (p) { updateRender(p); }).then(function (blob) {
        if (!blob || blob.size < 1000) throw new Error("empty");
        return finalizeVideo(blob).then(function (fixed) {
          var isWebm = /webm/i.test(fixed.type || "");
          finish(new File([fixed], "zyro-edit-" + Date.now() + (isWebm ? ".webm" : ".mp4"), { type: fixed.type || "video/webm" }));
        });
      }).catch(function (e) {
        console.warn("Video export failed", e);
        toast("\u26A0\uFE0F Video render failed \u2014 original use kiya ja raha hai");
        finish(S.file);
      });
    }
  }
  function showRender(text, sub, p) {
    el.renderText.textContent = text; el.renderSub.textContent = sub;
    el.renderFill.style.width = (p * 100) + "%";
    el.render.classList.add("show");
  }
  function updateRender(p) { el.renderFill.style.width = (p * 100) + "%"; }

  function handoff(fileOut) {
    try {
      if (S.kind === "video") {
        if (typeof window.__zeOrigVideoEditor === "function") { window.__zeOrigVideoEditor(fileOut, S.category || "reel"); return; }
      } else {
        if (typeof window.openCreatePostModal === "function") window.openCreatePostModal("photo");
        if (typeof window.__zeOrigPostMedia === "function") { window.__zeOrigPostMedia(fileOut); return; }
      }
    } catch (e) { console.warn("handoff error", e); }
    toast("\u2705 Edit ready");
  }

  /* ---------------- Integration ---------------- */
  function install() {
    if (typeof window.handleVideoSelectedForEditor === "function" && !window.__zeOrigVideoEditor) {
      window.__zeOrigVideoEditor = window.handleVideoSelectedForEditor;
      window.handleVideoSelectedForEditor = function (file, category) {
        openEditor(file, "video", category || window.currentVeCategory || "reel");
      };
    }
    if (typeof window.handlePostMediaSelected === "function" && !window.__zeOrigPostMedia) {
      window.__zeOrigPostMedia = window.handlePostMediaSelected;
      window.handlePostMediaSelected = function (file) {
        if (!file) return;
        var isVid = (file.type && file.type.indexOf("video/") === 0) || /\.(mp4|mov|webm|mkv|3gp|m4v)$/i.test(file.name || "");
        openEditor(file, isVid ? "video" : "image", isVid ? (window.currentCreateType || "reel") : "photo");
      };
    }
  }

  window.zyroOpenEditor = openEditor;
  window.zyroEditorState = S;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
  setTimeout(install, 800);
  setTimeout(install, 2000);
})();
