/* ============================================================
   ZYRO MEDIA EDITOR v2.5 — Instagram Reels & Shorts Editor
   Full-screen preview + right tool rail + top sound bar
   + bottom Edit/Next + multi-track Instagram Reels timeline.
   ============================================================ */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function fmt(sec) {
    if (isNaN(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    var ms = Math.floor((sec % 1) * 10);
    return m + ":" + (s < 10 ? "0" : "") + s + "." + ms;
  }
  function fmtShort(sec) {
    if (isNaN(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ---------------- State ---------------- */
  var S = {
    file: null,
    kind: "video",          // "video" | "image"
    category: "reel",
    dirty: false,
    duration: 0,
    aspect: "original",
    filterId: "none",
    filterIntensity: 0.85,  // 0 to 1
    effects: { vignette: 0, grain: 0, glow: 0, leak: 0, blur: 0, bars: 0, vhs: 0, rgb: 0 },
    adjust: { brightness: 100, contrast: 100, saturation: 100, warmth: 0, fade: 0 },
    transform: { rotate: 0, flipH: false, flipV: false },
    texts: [],              // { id, text, x, y, size, font, color, weight, bg, bgColor, cap, align }
    stickers: [],           // { id, emoji, x, y, size }
    trim: { start: 0, end: 0, duration: 0 },
    segments: [],           // [{ start, end }]
    selSeg: 0,
    speed: 1,               // 0.3, 0.5, 0.75, 1, 1.25, 1.5, 2
    loopTimeline: true,
    playhead: 0,
    volume: 1,
    muted: false,
    music: null,            // { name, url, el, artist, duration, isLocal }
    musicVol: 0.8,
    thumbs: [],
    activeSheet: null,
    timelineOpen: false,
    selectedTextId: null,
    selectedStickerId: null,
    _ac: null,
    _dest: null
  };

  /* ---------------- Presets ---------------- */
  var FILTERS = [
    { id: "none",        name: "Normal",      css: "" },
    { id: "clarendon",   name: "Clarendon",   css: "contrast(1.22) saturate(1.3) brightness(1.05)" },
    { id: "juno",        name: "Juno",        css: "saturate(1.4) contrast(1.15) hue-rotate(-6deg)" },
    { id: "ludwig",      name: "Ludwig",      css: "sepia(0.2) saturate(1.2) contrast(1.08)" },
    { id: "valencia",    name: "Valencia",    css: "sepia(0.3) saturate(1.15) brightness(1.08) contrast(0.95)" },
    { id: "tokyo",       name: "Tokyo",       css: "contrast(1.15) hue-rotate(12deg) saturate(1.15) brightness(1.02)" },
    { id: "rio",         name: "Rio",         css: "saturate(1.45) contrast(1.1) brightness(1.06) sepia(0.15)" },
    { id: "cyberpunk",   name: "Cyberpunk",   css: "contrast(1.35) saturate(1.6) hue-rotate(-22deg)" },
    { id: "noir",        name: "Noir",        css: "grayscale(1) contrast(1.4) brightness(0.92)" },
    { id: "vintage90s",  name: "90s Retro",   css: "sepia(0.45) contrast(0.95) saturate(0.9) brightness(1.08)" },
    { id: "moody",       name: "Moody",       css: "contrast(1.25) saturate(0.85) brightness(0.92)" },
    { id: "emerald",     name: "Emerald",     css: "hue-rotate(20deg) saturate(1.35) contrast(1.12)" },
    { id: "golden",      name: "Golden Hour", css: "sepia(0.35) saturate(1.3) hue-rotate(-12deg) brightness(1.06)" },
    { id: "pastel",      name: "Pastel Dream",css: "brightness(1.15) saturate(1.18) contrast(0.9)" }
  ];

  var EFFECTS = [
    { id: "vhs",       name: "VHS Glitch" },
    { id: "grain",     name: "Film Grain" },
    { id: "vignette",  name: "Vignette" },
    { id: "leak",      name: "Light Leak" },
    { id: "glow",      name: "Cinema Glow" },
    { id: "bars",      name: "Cinema Bars" },
    { id: "blur",      name: "Soft Blur" }
  ];

  var ASPECTS = [
    { id: "original", name: "Original", ratio: 0 },
    { id: "9:16",     name: "9:16 Reel", ratio: 9 / 16 },
    { id: "1:1",      name: "1:1 Square",ratio: 1 },
    { id: "4:5",      name: "4:5 Portrait", ratio: 4 / 5 },
    { id: "16:9",     name: "16:9 Landscape", ratio: 16 / 9 }
  ];

  var TEXT_COLORS = [
    "#ffffff", "#000000", "#ffeb3b", "#e63946", "#25d366", "#00d2ff",
    "#ff007f", "#ff9800", "#9c27b0", "#ffd700", "#80d8ff", "#76ff03",
    "#ff5252", "#b388ff"
  ];

  var TEXT_FONTS = [
    { id: "system-ui, sans-serif", name: "Modern", css: "system-ui, -apple-system, sans-serif" },
    { id: "Impact, 'Arial Black', sans-serif", name: "Meme", css: "Impact, 'Arial Black', sans-serif" },
    { id: "'Courier New', monospace", name: "Typewriter", css: "'Courier New', monospace" },
    { id: "Georgia, serif", name: "Editorial", css: "Georgia, serif" },
    { id: "'Brush Script MT', cursive, sans-serif", name: "Script", css: "'Brush Script MT', cursive, sans-serif" },
    { id: "'Trebuchet MS', sans-serif", name: "Punchy", css: "'Trebuchet MS', sans-serif" }
  ];

  var TEXT_STYLES = [
    { id: "none",     name: "Clean",    desc: "Drop Shadow" },
    { id: "solid",    name: "Solid",    desc: "Dark Box" },
    { id: "pill",     name: "Pill",     desc: "Rounded Pill" },
    { id: "gradient", name: "Gradient", desc: "Insta Glow" },
    { id: "outline",  name: "3D Stroke",desc: "Black Outline" },
    { id: "neon",     name: "Neon Glow",desc: "Electric" },
    { id: "invert",   name: "Invert",   desc: "White Box" }
  ];

  var VIRAL_HOOKS = [
    "😂 Wait for the end",
    "💀 Bhai ye kya dekh liya?!",
    "🤣 POV: Desi Ghar Pe",
    "😭 100% Sach Hai Ye",
    "🔥 Tag your best friend",
    "🤫 Kisi ko mat batana",
    "👀 Last tak dekhna pakka",
    "🤯 Mind blown"
  ];

  var STICKERS = [
    "😂","🤣","❤️","🔥","😍","👍","🙌","🎉","💯","✨",
    "😎","🥺","👑","🎵","⚡","💖","😊","🙏","💪","🎯",
    "🌟","😱","🤯","😭","😡","🍿","🚀","🏆","🥳","🤙"
  ];

  var CAPTION_STYLES = [
    { id: "hormozi",  name: "Hormozi Pop", desc: "Yellow Bold Outline" },
    { id: "highlight",name: "Karaoke Box", desc: "Red Highlight Pill" },
    { id: "minimal",  name: "Clean Dark",  desc: "Frosted Capsule" },
    { id: "neon",     name: "Cyber Neon",  desc: "Cyan Glow" },
    { id: "outline",  name: "Bold Stroke", desc: "Heavy Outline" }
  ];

  /* ---------------- Elements Cache ---------------- */
  var el = {}, domReady = false;

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
            '<video class="ze-media" id="zeVid" playsinline webkit-playsinline style="display:none"></video>' +
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
          railBtn("text", "Text", '<span style="font-weight:900;font-size:16px;font-family:Georgia,serif">Aa</span>') +
          railBtn("filters", "Filters", ic('<circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/>')) +
          railBtn("effects", "Effects", ic('<path d="m12 3-1.9 5.8L4 10.7l5.8 1.9L12 18l1.9-5.4L20 10.7l-6.1-1.9Z"/>')) +
          railBtn("captions", "Captions", ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 12h3M14 12h3"/>')) +
          railBtn("stickers", "Stickers", ic('<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>')) +
          railBtn("more", "More", ic('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>', ' fill="currentColor" stroke="none"')) +
        '</div>' +
        '<div class="ze-swipe" id="zeSwipe">' + ic('<path d="m18 15-6-6-6 6"/>') + '<span>Swipe up to edit</span></div>' +
        '<div class="ze-bottombar">' +
          '<button class="ze-btn-edit" id="zeEditBtn">' + ic('<path d="m18 2 4 4-14 14H4v-4L18 2z"/>', ' style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"') + '<span>Edit Timeline</span></button>' +
          '<button class="ze-btn-next" id="zeNext">Next</button>' +
        '</div>' +
        '<div class="ze-sheet" id="zeSheet">' +
          '<div class="ze-sheet-grab"></div>' +
          '<div class="ze-sheet-head"><div class="ze-sheet-title" id="zeSheetTitle">Text</div>' +
            '<button class="ze-sheet-close" id="zeSheetClose">' + ic('<path d="M18 6 6 18M6 6l12 12"/>') + '</button></div>' +
          '<div class="ze-sheet-body" id="zeSheetBody"></div>' +
        '</div>' +
        '<div class="ze-timeline" id="zeTimeline">' +
          '<div class="ze-tl-head">' +
            '<button class="ze-tl-playhead-btn" id="zeTlPlayToggle" title="Play/Pause">▶</button>' +
            '<div class="ze-tl-title">Reel Editor</div>' +
            '<div class="ze-tl-time" id="zeTlTime">0:00.0 / 0:00.0</div>' +
            '<button class="ze-tl-close" id="zeTlClose">' + ic('<path d="M18 6 6 18M6 6l12 12"/>') + '</button>' +
          '</div>' +
          '<div class="ze-tl-multitrack">' +
            '<div class="ze-tl-trackwrap" id="zeTlWrap">' +
              '<div class="ze-tl-track"><div class="ze-tl-strip" id="zeTlStrip"></div></div>' +
              '<div id="zeTlSegs" style="position:absolute;inset:0"></div>' +
              '<div class="ze-tl-play" id="zeTlPlay" style="left:0"></div>' +
            '</div>' +
            '<div class="ze-tl-ruler" id="zeTlRuler"></div>' +
            '<div class="ze-tl-audio-lane" id="zeTlAudioLane" title="Tap to adjust music">' +
              '<span>🎵 ' + ic('<path d="M9 18V5l12-2v13"/>', ' style="width:12px;height:12px;display:inline;stroke:currentColor;fill:none;"') + ' <span id="zeTlAudioName">No audio added</span></span>' +
              '<div class="ze-tl-audio-wave"><div class="ze-tl-wave-bar" style="height:6px"></div><div class="ze-tl-wave-bar" style="height:12px"></div><div class="ze-tl-wave-bar" style="height:8px"></div><div class="ze-tl-wave-bar" style="height:14px"></div></div>' +
            '</div>' +
            '<div class="ze-tl-text-lane" id="zeTlTextLane"></div>' +
          '</div>' +
          '<div class="ze-tl-tools" id="zeTlTools"></div>' +
          '<div class="ze-speed-row" id="zeSpeedRow" style="display:none"></div>' +
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
    el.soundBtn = $("zeSoundBtn");
    el.soundLabel = $("zeSoundLabel");
    el.volBtn = $("zeVolBtn");
    el.cancel = $("zeCancel");
    el.editBtn = $("zeEditBtn");
    el.next = $("zeNext");
    el.swipe = $("zeSwipe");
    el.rail = $("zeRail");
    el.sheet = $("zeSheet");
    el.sheetTitle = $("zeSheetTitle");
    el.sheetBody = $("zeSheetBody");
    el.sheetClose = $("zeSheetClose");
    el.timeline = $("zeTimeline");
    el.tlWrap = $("zeTlWrap");
    el.tlStrip = $("zeTlStrip");
    el.tlSegs = $("zeTlSegs");
    el.tlPlay = $("zeTlPlay");
    el.tlPlayToggle = $("zeTlPlayToggle");
    el.tlTime = $("zeTlTime");
    el.tlRuler = $("zeTlRuler");
    el.tlTools = $("zeTlTools");
    el.tlClose = $("zeTlClose");
    el.tlAudioLane = $("zeTlAudioLane");
    el.tlAudioName = $("zeTlAudioName");
    el.tlTextLane = $("zeTlTextLane");
    el.speedRow = $("zeSpeedRow");
    el.render = $("zeRender");
    el.renderText = $("zeRenderText");
    el.renderFill = $("zeRenderFill");
    el.renderSub = $("zeRenderSub");

    wireEvents();
    domReady = true;
  }

  function toast(msg) {
    var t = $("zeToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "zeToast";
      t.className = "ze-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._tm);
    toast._tm = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  /* ---------------- Event Wiring ---------------- */
  function wireEvents() {
    el.cancel.addEventListener("click", closeEditor);
    el.next.addEventListener("click", onNext);
    el.editBtn.addEventListener("click", onEditBtn);
    el.soundBtn.addEventListener("click", function () { openSheet("sound"); });
    el.volBtn.addEventListener("click", toggleMute);
    el.sheetClose.addEventListener("click", closeSheet);
    el.tlClose.addEventListener("click", closeTimeline);

    if (el.tlAudioLane) {
      el.tlAudioLane.addEventListener("click", function () { openSheet("sound"); });
    }
    if (el.tlPlayToggle) {
      el.tlPlayToggle.addEventListener("click", togglePlayback);
    }

    qsa(".ze-rail-btn", el.rail).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tool = btn.getAttribute("data-tool");
        openSheet(tool);
      });
    });

    window.addEventListener("resize", function () {
      if (el.overlay.classList.contains("show")) {
        applyAspect();
        renderTexts();
        renderStickers();
        if (S.timelineOpen) renderTimeline();
      }
    });

    // Unified pointer & touch drag on canvas
    initDragHandling();

    // Video events
    el.vid.addEventListener("timeupdate", onTimeUpdate);
    el.vid.addEventListener("play", function () {
      if (el.tlPlayToggle) el.tlPlayToggle.textContent = "⏸";
      if (S.music && S.music.el && S.music.el.paused) {
        try { S.music.el.play(); } catch (e) {}
      }
    });
    el.vid.addEventListener("pause", function () {
      if (el.tlPlayToggle) el.tlPlayToggle.textContent = "▶";
      if (S.music && S.music.el && !S.music.el.paused) {
        try { S.music.el.pause(); } catch (e) {}
      }
    });
  }

  function togglePlayback() {
    if (S.kind !== "video") return;
    if (el.vid.paused) {
      el.vid.play().catch(function () {});
    } else {
      el.vid.pause();
    }
  }

  /* ---------------- Open / Close ---------------- */
  function openEditor(file, kind, category) {
    buildUI();
    resetState();
    S.file = file;
    S.kind = kind || "video";
    S.category = category || "reel";
    S.dirty = false;

    el.overlay.classList.add("show");
    el.render.classList.remove("show");
    el.sheet.classList.remove("open");
    el.timeline.classList.remove("open");
    el.swipe.classList.remove("hide");

    if (S.kind === "image") {
      el.vid.style.display = "none";
      el.img.style.display = "block";
      el.editBtn.style.display = "none";
      var url = URL.createObjectURL(file);
      el.img.onload = function () {
        applyAspect();
        applyPreview();
      };
      el.img.src = url;
    } else {
      el.img.style.display = "none";
      el.vid.style.display = "block";
      el.editBtn.style.display = "flex";
      var vurl = URL.createObjectURL(file);
      el.vid.src = vurl;
      el.vid.muted = S.muted;
      el.vid.volume = S.volume;
      el.vid.playbackRate = S.speed;
      el.vid.loop = true;
      el.vid.onloadedmetadata = function () {
        var d = el.vid.duration || 1;
        S.duration = d;
        S.trim = { start: 0, end: d, duration: d };
        S.segments = [{ start: 0, end: d }];
        S.selSeg = 0;
        applyAspect();
        applyPreview();
        captureThumbs();
        renderTimeline();
      };
      el.vid.play().catch(function () {});
    }
    updateSoundLabel();
  }

  function closeEditor() {
    try { el.vid.pause(); } catch (e) {}
    try { el.vid.removeAttribute("src"); el.vid.load(); } catch (e) {}
    if (S.music && S.music.el) {
      try { S.music.el.pause(); } catch (e) {}
    }
    el.overlay.classList.remove("show", "panel-open", "tl-open");
    el.sheet.classList.remove("open");
    el.timeline.classList.remove("open");
    S.timelineOpen = false;
    resetState();
  }

  function resetState() {
    S.filterId = "none";
    S.filterIntensity = 0.85;
    S.effects = { vignette: 0, grain: 0, glow: 0, leak: 0, blur: 0, bars: 0, vhs: 0, rgb: 0 };
    S.adjust = { brightness: 100, contrast: 100, saturation: 100, warmth: 0, fade: 0 };
    S.transform = { rotate: 0, flipH: false, flipV: false };
    S.texts = [];
    S.stickers = [];
    S.segments = [];
    S.selSeg = 0;
    S.speed = 1;
    S.loopTimeline = true;
    S.playhead = 0;
    S.aspect = "original";
    S.volume = 1;
    S.muted = false;
    if (S.music && S.music.el) { try { S.music.el.pause(); } catch(e){} }
    S.music = null;
    S.musicVol = 0.8;
    S.thumbs = [];
    S.selectedTextId = null;
    S.selectedStickerId = null;
    S.activeSheet = null;
    S.timelineOpen = false;
    if (el.soundBtn) el.soundBtn.classList.remove("active");
  }

  /* ---------------- Sizing & Aspect ---------------- */
  function mediaNatural() {
    if (S.kind === "video") {
      return { w: el.vid.videoWidth || 720, h: el.vid.videoHeight || 1280 };
    }
    return { w: el.img.naturalWidth || 720, h: el.img.naturalHeight || 1280 };
  }

  function applyAspect() {
    var n = mediaNatural();
    var natW = n.w, natH = n.h;
    var rot = ((S.transform.rotate % 360) + 360) % 360;
    if (rot === 90 || rot === 270) { var tmp = natW; natW = natH; natH = tmp; }

    var asp = ASPECTS.filter(function (x) { return x.id === S.aspect; })[0] || ASPECTS[0];
    var targetRatio = asp.ratio || (natW / natH);

    var stageW = el.stage.clientWidth || window.innerWidth;
    var stageH = el.stage.clientHeight || window.innerHeight;
    var maxW = stageW - 12;
    var maxH = stageH - 12;

    var cw, ch;
    if (targetRatio >= (maxW / maxH)) {
      cw = maxW;
      ch = maxW / targetRatio;
    } else {
      ch = maxH;
      cw = maxH * targetRatio;
    }
    el.canvas.style.width = Math.round(cw) + "px";
    el.canvas.style.height = Math.round(ch) + "px";
  }

  /* ---------------- Preview Filter / Effects ---------------- */
  function buildFilter() {
    var f = FILTERS.filter(function (x) { return x.id === S.filterId; })[0];
    var fcss = (f && f.css) ? f.css : "";

    var a = S.adjust;
    var parts = [];
    if (a.brightness !== 100) parts.push("brightness(" + (a.brightness / 100) + ")");
    if (a.contrast !== 100) parts.push("contrast(" + (a.contrast / 100) + ")");
    if (a.saturation !== 100) parts.push("saturate(" + (a.saturation / 100) + ")");
    if (a.fade > 0) parts.push("contrast(" + (1 - a.fade / 250) + ") brightness(" + (1 + a.fade / 500) + ")");

    var adj = parts.join(" ");
    if (fcss && adj) return fcss + " " + adj;
    return fcss || adj || "none";
  }

  function applyPreview() {
    var m = S.kind === "video" ? el.vid : el.img;
    var rot = ((S.transform.rotate % 360) + 360) % 360;
    var scaleX = S.transform.flipH ? -1 : 1;
    var scaleY = S.transform.flipV ? -1 : 1;
    m.style.transform = "rotate(" + rot + "deg) scale(" + scaleX + "," + scaleY + ")";
    m.style.filter = buildFilter();

    // Effects overlay layers
    var fxHtml = "";
    var e = S.effects;
    if (e.vignette > 0) fxHtml += '<div class="ze-fx ze-fx-vignette" style="opacity:' + (e.vignette / 100) + '"></div>';
    if (e.grain > 0) fxHtml += '<div class="ze-fx ze-fx-grain" style="opacity:' + (e.grain / 100) + '"></div>';
    if (e.glow > 0) fxHtml += '<div class="ze-fx ze-fx-glow" style="opacity:' + (e.glow / 100) + '"></div>';
    if (e.leak > 0) fxHtml += '<div class="ze-fx ze-fx-leak" style="opacity:' + (e.leak / 100) + '"></div>';
    if (e.bars > 0) fxHtml += '<div class="ze-fx ze-fx-bars"></div>';
    if (e.vhs > 0) fxHtml += '<div class="ze-fx ze-fx-vhs" style="opacity:' + (e.vhs / 100) + '"></div>';
    if (e.blur > 0) m.style.filter += " blur(" + (e.blur / 20) + "px)";

    el.fx.innerHTML = fxHtml;
  }

  /* ---------------- Text & Sticker Rendering ---------------- */
  function renderTexts() {
    var boxW = el.canvas.clientWidth || 300;
    var html = "";
    S.texts.forEach(function (t) {
      var fs = Math.max(12, t.size * boxW);
      var st = "left:" + (t.x * 100) + "%;top:" + (t.y * 100) + "%;font-size:" + fs + "px;font-family:" + (t.font || "system-ui") + ";color:" + (t.color || "#ffffff") + ";";
      if (t.align) st += "text-align:" + t.align + ";";

      var cls = "ze-text-item" + (t.id === S.selectedTextId ? " selected" : "");

      if (t.cap) {
        cls += " ze-caption-item";
        if (t.cap === "hormozi") {
          st += "color:#ffeb3b;-webkit-text-stroke:3px #000;paint-order:stroke fill;font-family:Impact,sans-serif;font-weight:900;";
        } else if (t.cap === "highlight") {
          st += "background:" + (t.bgColor || "#e63946") + ";border-radius:8px;padding:6px 14px;color:#fff;";
        } else if (t.cap === "minimal") {
          st += "background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);border-radius:999px;padding:6px 16px;color:#fff;";
        } else if (t.cap === "neon") {
          st += "color:#00ffff;text-shadow:0 0 10px #00ffff, 0 0 20px #00ffff;";
        } else if (t.cap === "outline") {
          st += "-webkit-text-stroke:2.5px #000;paint-order:stroke fill;color:#fff;";
        }
      } else {
        if (t.bg === "solid") cls += " ze-bg-solid";
        else if (t.bg === "pill") cls += " ze-bg-pill";
        else if (t.bg === "gradient") cls += " ze-bg-gradient";
        else if (t.bg === "outline") cls += " ze-bg-outline";
        else if (t.bg === "neon") cls += " ze-bg-neon";
        else if (t.bg === "invert") cls += " ze-bg-invert";
      }

      html += '<div class="' + cls + '" data-id="' + t.id + '" style="' + st + '">' + escapeHtml(t.text) + '</div>';
    });
    el.textLayer.innerHTML = html;
    updateTimelineTextBlocks();
  }

  function renderStickers() {
    var boxW = el.canvas.clientWidth || 300;
    var html = "";
    S.stickers.forEach(function (s) {
      var fs = Math.max(20, s.size * boxW);
      var st = "left:" + (s.x * 100) + "%;top:" + (s.y * 100) + "%;font-size:" + fs + "px;";
      var cls = "ze-sticker-item" + (s.id === S.selectedStickerId ? " selected" : "");
      html += '<div class="' + cls + '" data-id="' + s.id + '" style="' + st + '">' + s.emoji + '</div>';
    });
    el.stickerLayer.innerHTML = html;
  }

  function updateTimelineTextBlocks() {
    if (!el.tlTextLane) return;
    if (!S.texts.length) {
      el.tlTextLane.innerHTML = '<span style="font-size:10.5px;color:#6d6d78;padding-left:4px">No text added</span>';
      return;
    }
    el.tlTextLane.innerHTML = S.texts.map(function (t) {
      return '<div class="ze-tl-text-block" data-tid="' + t.id + '">Aa: ' + escapeHtml(t.text.slice(0, 14)) + '</div>';
    }).join("");
    qsa(".ze-tl-text-block", el.tlTextLane).forEach(function (b) {
      b.addEventListener("click", function () {
        var tid = b.getAttribute("data-tid");
        S.selectedTextId = tid;
        renderTexts();
        openSheet("text");
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }

  /* ---------------- DRAG ENGINE (Pointer + Touch) ---------------- */
  var drag = null;

  function initDragHandling() {
    el.canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    // Fallback touch events for older mobile browsers
    el.canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
  }

  function onPointerDown(e) {
    var item = e.target.closest ? e.target.closest(".ze-text-item,.ze-sticker-item") : null;
    if (!item) {
      if (!e.target.closest("#zeRail, #zeTopBar, #zeBottomBar, .ze-sheet, .ze-timeline")) {
        S.selectedTextId = null;
        S.selectedStickerId = null;
        renderTexts();
        renderStickers();
      }
      return;
    }

    var id = item.getAttribute("data-id");
    var isSticker = item.classList.contains("ze-sticker-item");
    if (isSticker) {
      S.selectedStickerId = id;
      S.selectedTextId = null;
    } else {
      S.selectedTextId = id;
      S.selectedStickerId = null;
    }
    renderTexts();
    renderStickers();

    var rect = el.canvas.getBoundingClientRect();
    drag = {
      id: id,
      rect: rect,
      sticker: isSticker,
      pointerId: e.pointerId
    };

    if (item.setPointerCapture && e.pointerId != null) {
      try { item.setPointerCapture(e.pointerId); } catch (err) {}
    }
    e.preventDefault();

    if (S.activeSheet === "text" && !drag.sticker) {
      renderSheet();
    }
  }

  function onPointerMove(e) {
    if (!drag) return;
    var r = drag.rect;
    var x = clamp((e.clientX - r.left) / r.width, 0.04, 0.96);
    var y = clamp((e.clientY - r.top) / r.height, 0.04, 0.96);

    if (drag.sticker) {
      var s = S.stickers.filter(function (k) { return k.id === drag.id; })[0];
      if (s) {
        s.x = x; s.y = y;
        var node = el.stickerLayer.querySelector('[data-id="' + s.id + '"]');
        if (node) { node.style.left = (x * 100) + "%"; node.style.top = (y * 100) + "%"; }
      }
    } else {
      var t = S.texts.filter(function (k) { return k.id === drag.id; })[0];
      if (t) {
        t.x = x; t.y = y;
        var tnode = el.textLayer.querySelector('[data-id="' + t.id + '"]');
        if (tnode) {
          tnode.style.left = (x * 100) + "%";
          tnode.style.top = (y * 100) + "%";
        }
      }
    }
  }

  function onPointerUp() {
    if (drag) {
      drag = null;
      S.dirty = true;
    }
  }

  function onTouchStart(e) {
    if (e.touches && e.touches.length === 1) {
      var touch = e.touches[0];
      var target = document.elementFromPoint(touch.clientX, touch.clientY);
      var item = target ? target.closest(".ze-text-item,.ze-sticker-item") : null;
      if (item) {
        var id = item.getAttribute("data-id");
        var isSticker = item.classList.contains("ze-sticker-item");
        if (isSticker) { S.selectedStickerId = id; S.selectedTextId = null; }
        else { S.selectedTextId = id; S.selectedStickerId = null; }
        renderTexts(); renderStickers();
        drag = { id: id, rect: el.canvas.getBoundingClientRect(), sticker: isSticker };
        e.preventDefault();
      }
    }
  }

  function onTouchMove(e) {
    if (drag && e.touches && e.touches.length === 1) {
      var touch = e.touches[0];
      var r = drag.rect;
      var x = clamp((touch.clientX - r.left) / r.width, 0.04, 0.96);
      var y = clamp((touch.clientY - r.top) / r.height, 0.04, 0.96);
      if (drag.sticker) {
        var s = S.stickers.filter(function (k) { return k.id === drag.id; })[0];
        if (s) {
          s.x = x; s.y = y;
          var node = el.stickerLayer.querySelector('[data-id="' + s.id + '"]');
          if (node) { node.style.left = (x * 100) + "%"; node.style.top = (y * 100) + "%"; }
        }
      } else {
        var t = S.texts.filter(function (k) { return k.id === drag.id; })[0];
        if (t) {
          t.x = x; t.y = y;
          var tnode = el.textLayer.querySelector('[data-id="' + t.id + '"]');
          if (tnode) { tnode.style.left = (x * 100) + "%"; tnode.style.top = (y * 100) + "%"; }
        }
      }
      e.preventDefault();
    }
  }

  function onTouchEnd() {
    if (drag) { drag = null; S.dirty = true; }
  }

  /* ---------------- Sheets Controller ---------------- */
  function openSheet(name) {
    S.activeSheet = name;
    el.sheet.classList.add("open");
    el.overlay.classList.add("panel-open");
    el.swipe.classList.add("hide");
    if (S.timelineOpen) { S.timelineOpen = false; el.timeline.classList.remove("open"); }

    qsa(".ze-rail-btn", el.rail).forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tool") === name);
    });

    renderSheet();
  }

  function closeSheet() {
    S.activeSheet = null;
    el.sheet.classList.remove("open");
    el.overlay.classList.remove("panel-open");
    qsa(".ze-rail-btn", el.rail).forEach(function (b) { b.classList.remove("active"); });
  }

  function renderSheet() {
    var n = S.activeSheet;
    if (n === "text") renderTextSheet();
    else if (n === "filters") renderFiltersSheet();
    else if (n === "effects") renderEffectsSheet();
    else if (n === "captions") renderCaptionsSheet();
    else if (n === "stickers") renderStickersSheet();
    else if (n === "more") renderMoreSheet();
    else if (n === "sound") renderSoundSheet();
  }

  function setSheetTitle(t) { el.sheetTitle.textContent = t; }

  /* ---------------- 1. TEXT SHEET ---------------- */
  function selectedText() {
    return S.texts.filter(function (x) { return x.id === S.selectedTextId; })[0] || null;
  }

  function addText(initialStr) {
    var id = "t_" + Date.now();
    var t = {
      id: id,
      text: initialStr || "Type something...",
      x: 0.5,
      y: 0.45,
      size: 0.08,
      font: "system-ui, sans-serif",
      color: "#ffffff",
      weight: "800",
      bg: "none",
      bgColor: "#000000",
      cap: null,
      align: "center"
    };
    S.texts.push(t);
    S.selectedTextId = id;
    S.selectedStickerId = null;
    S.dirty = true;
    renderTexts();
    renderTextSheet();
    toast("✨ Text added — drag anywhere on screen!");
  }

  function renderTextSheet() {
    setSheetTitle("Text Editor");
    var t = selectedText();
    if (!t) {
      el.sheetBody.innerHTML =
        '<div class="ze-empty">Add text, subtitles or hooks to your reel.<br>Drag anywhere, pinch or style.' +
        '<div style="height:14px"></div>' +
        '<button class="ze-btn ze-btn-primary" id="zeAddTextBtn">➕ Add Text</button></div>';
      $("zeAddTextBtn").addEventListener("click", function () { addText(); });
      return;
    }

    var html = '<div class="ze-text-tools">' +
      '<input type="text" class="ze-input" id="zeTextInput" value="' + escapeAttr(t.text) + '" placeholder="Type your text...">' +
      '<div class="ze-panel-title">Font Style</div>' +
      '<div class="ze-font-row">' +
        TEXT_FONTS.map(function (f) {
          return '<button class="ze-font-btn' + (f.id === t.font ? " active" : "") + '" data-font="' + f.id + '">' + f.name + '</button>';
        }).join("") +
      '</div>' +
      '<div class="ze-panel-title">Background Style</div>' +
      '<div class="ze-chips">' +
        TEXT_STYLES.map(function (st) {
          return '<button class="ze-chip' + ((t.bg === st.id) ? " active" : "") + '" data-bg="' + st.id + '">' + st.name + '</button>';
        }).join("") +
      '</div>' +
      '<div class="ze-panel-title">Text Color</div>' +
      '<div class="ze-swatches">' +
        TEXT_COLORS.map(function (c) {
          return '<span class="ze-swatch' + (c === t.color ? " active" : "") + '" data-c="' + c + '" style="background:' + c + '"></span>';
        }).join("") +
      '</div>' +
      sliderRow("zeTextSize", "Font Size", Math.round(t.size * 500), 15, 80, "px") +
      '<div style="display:flex;gap:8px;margin-top:10px">' +
        '<button class="ze-btn ze-btn-ghost" id="zeDupTextBtn">📋 Duplicate</button>' +
        '<button class="ze-btn ze-btn-danger" id="zeDelTextBtn">🗑️ Delete</button>' +
      '</div>' +
      '<div style="height:8px"></div>' +
      '<button class="ze-btn ze-btn-ghost" id="zeAddNewTextBtn">➕ Add Another Text</button>' +
    '</div>';

    el.sheetBody.innerHTML = html;

    var inp = $("zeTextInput");
    inp.focus();
    inp.addEventListener("input", function () {
      t.text = this.value || " ";
      S.dirty = true;
      renderTexts();
    });

    qsa(".ze-font-btn", el.sheetBody).forEach(function (btn) {
      btn.addEventListener("click", function () {
        t.font = btn.getAttribute("data-font");
        S.dirty = true;
        renderTexts();
        renderTextSheet();
      });
    });

    qsa("[data-bg]", el.sheetBody).forEach(function (btn) {
      btn.addEventListener("click", function () {
        t.bg = btn.getAttribute("data-bg");
        t.cap = null;
        S.dirty = true;
        renderTexts();
        renderTextSheet();
      });
    });

    qsa(".ze-swatch", el.sheetBody).forEach(function (sw) {
      sw.addEventListener("click", function () {
        t.color = sw.getAttribute("data-c");
        S.dirty = true;
        renderTexts();
        renderTextSheet();
      });
    });

    bindSlider("zeTextSize", function (v) {
      t.size = v / 500;
      S.dirty = true;
      renderTexts();
    });

    $("zeDupTextBtn").addEventListener("click", function () {
      var copy = Object.assign({}, t, { id: "t_" + Date.now(), y: clamp(t.y + 0.08, 0.1, 0.9) });
      S.texts.push(copy);
      S.selectedTextId = copy.id;
      S.dirty = true;
      renderTexts();
      renderTextSheet();
      toast("📋 Text duplicated");
    });

    $("zeDelTextBtn").addEventListener("click", function () {
      S.texts = S.texts.filter(function (x) { return x.id !== t.id; });
      S.selectedTextId = null;
      S.dirty = true;
      renderTexts();
      renderTextSheet();
      toast("🗑️ Text removed");
    });

    $("zeAddNewTextBtn").addEventListener("click", function () {
      addText();
    });
  }

  /* ---------------- 2. FILTERS SHEET (Instagram Presets) ---------------- */
  var _thumbSrc = null;
  function getThumbSrc() {
    if (_thumbSrc) return _thumbSrc;
    if (S.kind === "image" && el.img.src) { _thumbSrc = el.img.src; return _thumbSrc; }
    if (S.thumbs && S.thumbs.length) { _thumbSrc = S.thumbs[Math.floor(S.thumbs.length / 2)]; return _thumbSrc; }
    return "";
  }

  function renderFiltersSheet() {
    setSheetTitle("Filters");
    var thumb = getThumbSrc();
    var html = '<div class="ze-filter-strip">';
    FILTERS.forEach(function (f) {
      var isAct = f.id === S.filterId;
      var st = f.css ? 'style="filter:' + f.css + '"' : "";
      html += '<div class="ze-filter-thumb' + (isAct ? " active" : "") + '" data-fid="' + f.id + '">' +
        (thumb ? '<img class="ze-ft-img" src="' + thumb + '" ' + st + '>' : '<div class="ze-ft-img"></div>') +
        '<span class="ze-ft-name">' + f.name + '</span></div>';
    });
    html += '</div>';

    html += '<div class="ze-panel-title">Filter Intensity</div>' +
      sliderRow("zeFilterIntensity", "Intensity", Math.round(S.filterIntensity * 100), 0, 100, "%");

    el.sheetBody.innerHTML = html;

    qsa(".ze-filter-thumb", el.sheetBody).forEach(function (th) {
      th.addEventListener("click", function () {
        S.filterId = th.getAttribute("data-fid");
        S.dirty = true;
        applyPreview();
        renderFiltersSheet();
      });
    });

    bindSlider("zeFilterIntensity", function (v) {
      S.filterIntensity = v / 100;
      S.dirty = true;
      applyPreview();
    });
  }

  /* ---------------- 3. EFFECTS SHEET ---------------- */
  function renderEffectsSheet() {
    setSheetTitle("Effects");
    var thumb = getThumbSrc();
    var html = '<div class="ze-fx-grid">';
    EFFECTS.forEach(function (fx) {
      var isAct = (S.effects[fx.id] || 0) > 0;
      html += '<div class="ze-fx-card' + (isAct ? " active" : "") + '" data-fx="' + fx.id + '">' +
        (thumb ? '<img src="' + thumb + '">' : '<div style="height:74px;background:#222"></div>') +
        (isAct ? '<span class="ze-fx-badge">ON</span>' : '') +
        '<span>' + fx.name + '</span></div>';
    });
    html += '</div>';

    html += '<div class="ze-panel-title">Effect Adjustments</div>' +
      sliderRow("zeVignette", "Vignette", S.effects.vignette, 0, 100, "%") +
      sliderRow("zeGrain", "Film Grain", S.effects.grain, 0, 100, "%") +
      sliderRow("zeGlow", "Cinema Glow", S.effects.glow, 0, 100, "%") +
      sliderRow("zeLeak", "Light Leak", S.effects.leak, 0, 100, "%") +
      sliderRow("zeBlur", "Soft Focus", S.effects.blur, 0, 100, "%");

    el.sheetBody.innerHTML = html;

    qsa(".ze-fx-card", el.sheetBody).forEach(function (card) {
      card.addEventListener("click", function () {
        var k = card.getAttribute("data-fx");
        S.effects[k] = S.effects[k] > 0 ? 0 : 75;
        S.dirty = true;
        applyPreview();
        renderEffectsSheet();
      });
    });

    bindSlider("zeVignette", function (v) { S.effects.vignette = v; S.dirty = true; applyPreview(); });
    bindSlider("zeGrain", function (v) { S.effects.grain = v; S.dirty = true; applyPreview(); });
    bindSlider("zeGlow", function (v) { S.effects.glow = v; S.dirty = true; applyPreview(); });
    bindSlider("zeLeak", function (v) { S.effects.leak = v; S.dirty = true; applyPreview(); });
    bindSlider("zeBlur", function (v) { S.effects.blur = v; S.dirty = true; applyPreview(); });
  }

  /* ---------------- 4. CAPTIONS & VIRAL HOOKS ---------------- */
  function addCaption(styleId, initialText) {
    var id = "cap_" + Date.now();
    var t = {
      id: id,
      text: initialText || "Wait for the end 😂",
      x: 0.5,
      y: 0.78,
      size: 0.085,
      font: styleId === "hormozi" ? "Impact, 'Arial Black', sans-serif" : "system-ui, sans-serif",
      color: styleId === "hormozi" ? "#ffeb3b" : "#ffffff",
      weight: "900",
      bg: "none",
      bgColor: "#e63946",
      cap: styleId || "hormozi",
      align: "center"
    };
    S.texts.push(t);
    S.selectedTextId = id;
    S.dirty = true;
    renderTexts();
    toast("🔥 Caption added! Drag anywhere to place.");
  }

  function renderCaptionsSheet() {
    setSheetTitle("Reel Captions & Hooks");
    var html = '<div class="ze-panel-title">1-Tap Viral Hooks</div>' +
      '<div class="ze-hooks-row">' +
        VIRAL_HOOKS.map(function (h) {
          return '<button class="ze-hook-chip" data-hook="' + escapeAttr(h) + '">' + h + '</button>';
        }).join("") +
      '</div>' +
      '<div class="ze-panel-title">Caption Preset Styles</div>' +
      '<div class="ze-cap-grid">' +
        CAPTION_STYLES.map(function (c) {
          var previewSt = "color:#fff;";
          if (c.id === "hormozi") previewSt = "color:#ffeb3b;-webkit-text-stroke:2px #000;font-family:Impact;";
          if (c.id === "highlight") previewSt = "background:#e63946;color:#fff;border-radius:4px;padding:2px 8px;";
          if (c.id === "minimal") previewSt = "background:rgba(0,0,0,0.6);border-radius:999px;padding:2px 10px;";
          if (c.id === "neon") previewSt = "color:#00ffff;text-shadow:0 0 8px #00ffff;";
          return '<div class="ze-cap-card" data-cap="' + c.id + '">' +
            '<b style="' + previewSt + '">Aa Caption</b>' +
            '<small>' + c.name + ' · ' + c.desc + '</small></div>';
        }).join("") +
      '</div>' +
      '<div style="height:14px"></div>' +
      '<button class="ze-btn ze-btn-primary" id="zeCreateCustomCap">➕ Add Custom Caption</button>';

    el.sheetBody.innerHTML = html;

    qsa(".ze-hook-chip", el.sheetBody).forEach(function (chip) {
      chip.addEventListener("click", function () {
        var txt = chip.getAttribute("data-hook");
        addCaption("hormozi", txt);
      });
    });

    qsa(".ze-cap-card", el.sheetBody).forEach(function (card) {
      card.addEventListener("click", function () {
        var capId = card.getAttribute("data-cap");
        addCaption(capId);
      });
    });

    $("zeCreateCustomCap").addEventListener("click", function () {
      addCaption("hormozi");
      openSheet("text");
    });
  }

  /* ---------------- 5. STICKERS ---------------- */
  function addSticker(emoji) {
    var id = "s_" + Date.now();
    S.stickers.push({ id: id, emoji: emoji, x: 0.5, y: 0.5, size: 0.22 });
    S.selectedStickerId = id;
    S.selectedTextId = null;
    S.dirty = true;
    renderStickers();
    toast("Sticker added — drag anywhere");
  }

  function renderStickersSheet() {
    setSheetTitle("Stickers");
    var html = '<div class="ze-sticker-grid">' +
      STICKERS.map(function (s) {
        return '<button class="ze-sticker-btn" data-s="' + s + '">' + s + '</button>';
      }).join("") +
      '</div>';
    el.sheetBody.innerHTML = html;
    qsa(".ze-sticker-btn", el.sheetBody).forEach(function (btn) {
      btn.addEventListener("click", function () {
        addSticker(btn.getAttribute("data-s"));
      });
    });
  }

  /* ---------------- 6. MORE SHEET (SAVE TO DEVICE AT VERY TOP) ---------------- */
  function renderMoreSheet() {
    setSheetTitle("More Options");
    var a = S.adjust;

    // SAVE TO DEVICE HERO CARD AT THE VERY TOP (User Requirement!)
    var html =
      '<div class="ze-save-device-card" id="zeSaveCard">' +
        '<div class="ze-save-device-top">' +
          '<span class="ze-save-device-badge">📥 GALLERY EXPORT</span>' +
        '</div>' +
        '<div class="ze-save-device-title">Save to Device / Gallery</div>' +
        '<div class="ze-save-device-sub">Export full-quality video/reel with all your edits, filters, text & audio directly to your phone gallery</div>' +
        '<button class="ze-btn ze-save-download-btn" id="zeSaveToDeviceBtn">' +
          ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', ' style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.2;"') +
          '<span>Save to Phone Gallery / Download</span>' +
        '</button>' +
      '</div>';

    html += '<div class="ze-panel-title">Fine Adjustments</div>' +
      sliderRow("zeBright", "Brightness", a.brightness, 50, 150, "%") +
      sliderRow("zeContrast", "Contrast", a.contrast, 50, 150, "%") +
      sliderRow("zeSat", "Saturation", a.saturation, 0, 200, "%") +
      sliderRow("zeWarm", "Warmth", a.warmth, -100, 100, "") +
      sliderRow("zeFade", "Fade", a.fade, 0, 100, "%");

    html += '<div class="ze-panel-title">Transform</div><div class="ze-chips">' +
      '<button class="ze-chip" data-tr="rot">⟳ Rotate 90°</button>' +
      '<button class="ze-chip' + (S.transform.flipH ? " active" : "") + '" data-tr="fliph">⇄ Flip H</button>' +
      '<button class="ze-chip' + (S.transform.flipV ? " active" : "") + '" data-tr="flipv">⇅ Flip V</button>' +
      '<button class="ze-chip" data-tr="reset">Reset</button></div>';

    html += '<div class="ze-panel-title">Aspect Ratio</div><div class="ze-chips">' +
      ASPECTS.map(function (x) {
        return '<button class="ze-chip' + (x.id === S.aspect ? " active" : "") + '" data-asp="' + x.id + '">' + x.name + '</button>';
      }).join("") +
      '</div>';

    el.sheetBody.innerHTML = html;

    // Save to Device handler
    $("zeSaveToDeviceBtn").addEventListener("click", function () {
      saveMediaToDevice();
    });

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
        S.dirty = true;
        applyAspect();
        applyPreview();
        renderMoreSheet();
      });
    });

    qsa("[data-asp]", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () {
        S.aspect = n.getAttribute("data-asp");
        S.dirty = true;
        applyAspect();
        renderTexts();
        renderStickers();
        renderMoreSheet();
      });
    });
  }

  function saveMediaToDevice() {
    closeSheet();
    if (S.kind === "image") {
      showRender("Saving photo to gallery...", "Applying high-res edits and text.", 0.3);
      exportImage().then(function (blob) {
        hideRender();
        downloadBlob(blob, "zyro_photo_" + Date.now() + ".jpg");
        toast("✅ Photo gallery me save ho gayi!");
      }).catch(function (e) {
        hideRender();
        console.warn("Export failed", e);
        toast("⚠️ Save failed, retrying...");
      });
    } else {
      showRender("Exporting video to gallery...", "Rendering your reel with all edits & sound.", 0.05);
      exportVideo(function (p) { updateRender(p); }).then(function (blob) {
        return finalizeVideo(blob).then(function (fixed) {
          hideRender();
          var isWebm = /webm/i.test(fixed.type || "");
          var ext = isWebm ? ".webm" : ".mp4";
          downloadBlob(fixed, "zyro_reel_" + Date.now() + ext);
          toast("✅ Video gallery me save ho gaya!");
        });
      }).catch(function (e) {
        hideRender();
        console.warn("Save video error", e);
        toast("⚠️ Video save error: " + (e.message || e));
      });
    }
  }

  function downloadBlob(blob, filename) {
    try {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 4000);

      // Also trigger Web Share API if supported on mobile
      if (navigator.canShare && window.File) {
        try {
          var f = new File([blob], filename, { type: blob.type });
          if (navigator.canShare({ files: [f] })) {
            navigator.share({
              files: [f],
              title: "Save Video to Gallery",
              text: "Zyro Reel"
            }).catch(function () {});
          }
        } catch (er) {}
      }
    } catch (e) {
      console.warn("Download error", e);
    }
  }

  /* ---------------- 7. SOUND SHEET (Story Music + Device Import) ---------------- */
  var storySoundsCache = [];
  var activeAudioPreview = null;

  function renderSoundSheet() {
    setSheetTitle("Add Music & Audio");
    var html = '<div class="ze-panel-title">Volume Control</div>' +
      sliderRow("zeVol", "Video Sound", Math.round(S.volume * 100), 0, 100, "%") +
      '<div class="ze-chips"><button class="ze-chip' + (S.muted ? " active" : "") + '" id="zeMuteChip">' + (S.muted ? "🔇 Muted" : "🔊 Sound On") + '</button></div>';

    if (S.music) {
      html += '<div class="ze-panel-title">Selected Music</div>' +
        '<div class="ze-sound-row active" id="zeCurMusic">' +
          '<div class="ze-sound-ic">🎵</div>' +
          '<div class="ze-sound-meta"><b>' + escapeHtml(S.music.name) + '</b><small>' + (S.music.artist ? escapeHtml(S.music.artist) + ' · ' : '') + 'Tap to remove</small></div>' +
          '<button class="ze-btn-danger" style="width:auto;padding:6px 10px;font-size:11px;border-radius:8px">Remove</button>' +
        '</div>' +
        sliderRow("zeMusicVol", "Music Vol", Math.round(S.musicVol * 100), 0, 100, "%");
    }

    // Prominent "Import Audio from Device" button (User Requirement!)
    html += '<div class="ze-panel-title">Import Audio</div>' +
      '<button class="ze-btn ze-btn-primary" id="zeImportDeviceBtn" style="margin-bottom:12px">' +
        ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>', ' style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"') +
        '<span>📁 Import Audio from Device (MP3 / Audio)</span>' +
      '</button>' +
      '<input type="file" id="zeDeviceAudioFile" accept="audio/*" style="display:none">';

    // Story Songs & Search
    html += '<div class="ze-panel-title">App Story Songs & Beats</div>' +
      '<input type="text" class="ze-input" id="zeSoundSearch" placeholder="🔍 Search Bollywood, Punjabi, Comedy sounds...">' +
      '<div class="ze-sound-tabs" style="margin-top:8px">' +
        '<button class="ze-sound-tab active" data-scat="trending">🔥 Trending</button>' +
        '<button class="ze-sound-tab" data-scat="story">😂 Story Sounds</button>' +
        '<button class="ze-sound-tab" data-scat="bollywood">🎬 Bollywood</button>' +
        '<button class="ze-sound-tab" data-scat="punjabi">⚡ Punjabi</button>' +
        '<button class="ze-sound-tab" data-scat="desi">🎶 Desi Hits</button>' +
      '</div>' +
      '<div class="ze-sound-list" id="zeSoundListContainer">' +
        '<div style="text-align:center;padding:16px;color:#888">Loading songs...</div>' +
      '</div>';

    el.sheetBody.innerHTML = html;

    bindSlider("zeVol", function (v) {
      S.volume = v / 100;
      el.vid.volume = S.volume;
      if (S.volume > 0 && S.muted) {
        S.muted = false;
        el.vid.muted = false;
        el.volBtn.classList.remove("on");
      }
    });

    if ($("zeMusicVol")) {
      bindSlider("zeMusicVol", function (v) {
        S.musicVol = v / 100;
        if (S.music && S.music.el) S.music.el.volume = S.musicVol;
      });
    }

    $("zeMuteChip").addEventListener("click", function () {
      toggleMute();
      renderSoundSheet();
    });

    if ($("zeCurMusic")) {
      $("zeCurMusic").addEventListener("click", function () {
        if (S.music && S.music.el) { try { S.music.el.pause(); } catch (e) {} }
        S.music = null;
        updateSoundLabel();
        renderSoundSheet();
        toast("Audio removed");
      });
    }

    // Device audio import
    $("zeImportDeviceBtn").addEventListener("click", function () {
      $("zeDeviceAudioFile").click();
    });
    $("zeDeviceAudioFile").addEventListener("change", function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var au = new Audio(url);
      au.loop = true;
      au.volume = S.musicVol;
      S.music = {
        name: f.name.replace(/\.[^.]+$/, ""),
        artist: "Device Storage",
        url: url,
        el: au,
        isLocal: true
      };
      updateSoundLabel();
      try { if (!el.vid.paused) au.play(); } catch (e) {}
      renderSoundSheet();
      toast("📁 " + S.music.name + " imported!");
    });

    // Sound Search & Categories
    var searchInput = $("zeSoundSearch");
    var searchTimer = null;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimer);
      var q = (this.value || "").trim();
      searchTimer = setTimeout(function () {
        if (!q) loadSoundCategory("trending");
        else fetchItunesSounds(q);
      }, 400);
    });

    qsa(".ze-sound-tab", el.sheetBody).forEach(function (tab) {
      tab.addEventListener("click", function () {
        qsa(".ze-sound-tab", el.sheetBody).forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var cat = tab.getAttribute("data-scat");
        loadSoundCategory(cat);
      });
    });

    loadSoundCategory("trending");
  }

  function loadSoundCategory(cat) {
    if (cat === "story") {
      var curated = (window.CURATED_COMEDY_SOUNDS && window.CURATED_COMEDY_SOUNDS.length)
        ? window.CURATED_COMEDY_SOUNDS
        : [];
      renderSoundList(curated);
    } else if (cat === "bollywood") {
      fetchItunesSounds("bollywood hit songs");
    } else if (cat === "punjabi") {
      fetchItunesSounds("punjabi top beat");
    } else if (cat === "desi") {
      fetchItunesSounds("desi comedy background music");
    } else {
      // Trending: combine curated + trending
      var cur = (window.CURATED_COMEDY_SOUNDS && window.CURATED_COMEDY_SOUNDS.length)
        ? window.CURATED_COMEDY_SOUNDS
        : [];
      if (cur.length) {
        renderSoundList(cur);
      } else {
        fetchItunesSounds("indian viral reel songs");
      }
    }
  }

  async function fetchItunesSounds(term) {
    var c = $("zeSoundListContainer");
    if (c) c.innerHTML = '<div style="text-align:center;padding:16px;color:#888">⏳ Searching audio...</div>';
    try {
      var res = await fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(term) + "&entity=song&limit=15").catch(function () { return null; });
      if (!res || !res.ok) {
        fallbackSounds();
        return;
      }
      var data = await res.json().catch(function () { return {}; });
      if (data && Array.isArray(data.results) && data.results.length) {
        var items = data.results.filter(function (r) { return r.previewUrl; }).map(function (r) {
          return {
            id: "itunes_" + r.trackId,
            title: r.trackName,
            artist: r.artistName,
            icon: "🎵",
            previewUrl: r.previewUrl
          };
        });
        renderSoundList(items);
      } else {
        fallbackSounds();
      }
    } catch (e) {
      fallbackSounds();
    }
  }

  function fallbackSounds() {
    var cur = (window.CURATED_COMEDY_SOUNDS && window.CURATED_COMEDY_SOUNDS.length)
      ? window.CURATED_COMEDY_SOUNDS
      : [];
    renderSoundList(cur);
  }

  function renderSoundList(items) {
    var container = $("zeSoundListContainer");
    if (!container) return;
    if (!items || !items.length) {
      container.innerHTML = '<div style="text-align:center;padding:16px;color:#888">No sounds found. Try searching.</div>';
      return;
    }

    storySoundsCache = items;
    var html = "";
    items.forEach(function (s, idx) {
      var isCur = S.music && S.music.url === s.previewUrl;
      html += '<div class="ze-sound-row' + (isCur ? " active" : "") + '">' +
        '<button class="ze-audio-play-btn" data-play-idx="' + idx + '" title="Preview">▶</button>' +
        '<div class="ze-sound-ic">' + (s.icon || "🎵") + '</div>' +
        '<div class="ze-sound-meta"><b>' + escapeHtml(s.title) + '</b><small>' + escapeHtml(s.artist || "UPComedyHub Audio") + '</small></div>' +
        '<button class="ze-sound-use-btn" data-use-idx="' + idx + '">+ Use</button>' +
      '</div>';
    });
    container.innerHTML = html;

    qsa(".ze-audio-play-btn", container).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute("data-play-idx"), 10);
        var s = storySoundsCache[idx];
        if (!s || !s.previewUrl) return;

        if (activeAudioPreview && activeAudioPreview._url === s.previewUrl && !activeAudioPreview.paused) {
          activeAudioPreview.pause();
          btn.textContent = "▶";
          btn.classList.remove("playing");
          return;
        }

        if (activeAudioPreview) {
          try { activeAudioPreview.pause(); } catch (er) {}
          qsa(".ze-audio-play-btn", container).forEach(function (b) { b.textContent = "▶"; b.classList.remove("playing"); });
        }

        activeAudioPreview = new Audio(s.previewUrl);
        activeAudioPreview._url = s.previewUrl;
        activeAudioPreview.volume = 0.9;
        activeAudioPreview.play().then(function () {
          btn.textContent = "⏸";
          btn.classList.add("playing");
        }).catch(function () {});
        activeAudioPreview.onended = function () {
          btn.textContent = "▶";
          btn.classList.remove("playing");
        };
      });
    });

    qsa(".ze-sound-use-btn", container).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute("data-use-idx"), 10);
        var s = storySoundsCache[idx];
        if (!s || !s.previewUrl) return;

        if (activeAudioPreview) {
          try { activeAudioPreview.pause(); } catch (er) {}
        }
        if (S.music && S.music.el) {
          try { S.music.el.pause(); } catch (er) {}
        }

        var au = new Audio(s.previewUrl);
        au.loop = true;
        au.volume = S.musicVol;
        S.music = {
          name: s.title,
          artist: s.artist || "UPComedyHub Sound",
          url: s.previewUrl,
          el: au,
          isLocal: false
        };
        updateSoundLabel();
        try { if (!el.vid.paused) au.play(); } catch (er) {}
        renderSoundSheet();
        toast("🎵 Added: " + s.title);
      });
    });
  }

  function toggleMute() {
    S.muted = !S.muted;
    el.vid.muted = S.muted;
    el.volBtn.classList.toggle("on", S.muted);
    if (S.music && S.music.el) S.music.el.muted = S.muted;
    toast(S.muted ? "🔇 Muted" : "🔊 Sound on");
  }

  function updateSoundLabel() {
    if (S.music) {
      el.soundLabel.textContent = S.music.name;
      el.soundBtn.classList.add("active");
      if (el.tlAudioName) el.tlAudioName.textContent = S.music.name;
    } else {
      el.soundLabel.textContent = "Add sound";
      el.soundBtn.classList.remove("active");
      if (el.tlAudioName) el.tlAudioName.textContent = "No audio added";
    }
  }

  function sliderRow(id, label, val, min, max, unit) {
    return '<div class="ze-row"><span class="ze-label">' + label + '</span>' +
      '<input type="range" class="ze-range" id="' + id + '" min="' + min + '" max="' + max + '" step="1" value="' + val + '">' +
      '<span class="ze-val" id="' + id + 'V">' + Math.round(val) + unit + '</span></div>';
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

  /* ---------------- 8. INSTAGRAM REELS TIMELINE EDITOR ---------------- */
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
    renderTimeline();
    applyAspect();
  }

  function closeTimeline() {
    S.timelineOpen = false;
    el.timeline.classList.remove("open");
    el.overlay.classList.remove("tl-open");
    applyAspect();
  }

  function activeSegments() {
    return S.segments.length ? S.segments : [{ start: 0, end: S.trim.duration || S.duration || 1 }];
  }

  function segAt(t) {
    var segs = activeSegments();
    for (var i = 0; i < segs.length; i++) {
      if (t >= segs[i].start - 0.001 && t <= segs[i].end + 0.001) return { seg: segs[i], i: i };
    }
    return null;
  }

  function onTimeUpdate() {
    if (S.kind !== "video") return;
    var segs = activeSegments();
    var cur = el.vid.currentTime;
    S.playhead = cur;
    var hit = segAt(cur);
    if (hit && cur >= hit.seg.end - 0.05) {
      var next = segs[hit.i + 1];
      if (next) {
        el.vid.currentTime = next.start + 0.01;
      } else {
        el.vid.currentTime = segs[0].start + 0.01;
      }
    }
    if (S.timelineOpen) updatePlayhead();
  }

  function updatePlayhead() {
    var dur = S.trim.duration || S.duration || 1;
    var pct = clamp((el.vid.currentTime || 0) / dur * 100, 0, 100);
    el.tlPlay.style.left = pct + "%";
    el.tlTime.textContent = fmt(el.vid.currentTime) + " / " + fmt(dur);
  }

  function renderTimeline() {
    var dur = S.trim.duration || S.duration || 1;

    // Thumbnails strip
    if (S.thumbs && S.thumbs.length) {
      el.tlStrip.innerHTML = S.thumbs.map(function (u) {
        return u ? '<img src="' + u + '">' : "";
      }).join("");
    } else {
      el.tlStrip.innerHTML = "";
    }

    // Segments with yellow Instagram handles
    var html = "";
    S.segments.forEach(function (seg, i) {
      var l = seg.start / dur * 100, w = (seg.end - seg.start) / dur * 100;
      html += '<div class="ze-tl-seg' + (i === S.selSeg ? " sel" : "") + '" data-i="' + i + '" style="left:' + l + '%;width:' + w + '%"></div>';
    });

    if (S.segments.length) {
      var sel = S.segments[S.selSeg] || S.segments[0];
      var sl = sel.start / dur * 100;
      var sr = sel.end / dur * 100;
      html += '<div class="ze-tl-handle" data-h="start" style="left:calc(' + sl + '% - 11px)"><i></i></div>';
      html += '<div class="ze-tl-handle" data-h="end" style="left:calc(' + sr + '% - 11px)"><i></i></div>';
    }
    el.tlSegs.innerHTML = html;

    // Ruler
    var ticks = 6, r = "";
    for (var k = 0; k <= ticks; k++) {
      r += "<span>" + fmtShort(dur * k / ticks) + "</span>";
    }
    el.tlRuler.innerHTML = r;

    // Audio lane text
    updateSoundLabel();

    // Text lane blocks
    updateTimelineTextBlocks();

    // Instagram Reel Action Toolbar
    el.tlTools.innerHTML =
      tlTool("split", "Split", ic('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>')) +
      tlTool("speed", "Speed", ic('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>')) +
      tlTool("delete", "Delete", ic('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>')) +
      tlTool("dup", "Duplicate", ic('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>')) +
      tlTool("flip", "Flip", ic('<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>')) +
      tlTool("sound", "Sound", ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')) +
      tlTool("addclip", "Add Clip", ic('<path d="M12 5v14M5 12h14"/>'));

    qsa(".ze-tl-tool", el.tlTools).forEach(function (b) {
      b.addEventListener("click", function () {
        onTlTool(b.getAttribute("data-tool"));
      });
    });

    // Segment click
    qsa(".ze-tl-seg", el.tlSegs).forEach(function (n) {
      n.addEventListener("click", function () {
        S.selSeg = parseInt(n.getAttribute("data-i"), 10) || 0;
        var seg = S.segments[S.selSeg];
        if (seg) {
          try { el.vid.currentTime = seg.start + 0.01; } catch (e) {}
        }
        renderTimeline();
      });
    });

    // Yellow trim handles drag
    qsa(".ze-tl-handle", el.tlSegs).forEach(function (h) {
      h.addEventListener("pointerdown", function (e) {
        startHandleDrag(e, h.getAttribute("data-h"));
      });
    });

    // Scrubber click on track
    el.tlWrap.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".ze-tl-handle")) return;
      scrubTo(e);
      el.tlWrap.addEventListener("pointermove", scrubMove);
      window.addEventListener("pointerup", scrubEnd);
    });

    updatePlayhead();
  }

  function tlTool(tool, label, inner) {
    return '<button class="ze-tl-tool" data-tool="' + tool + '"><span class="ze-tl-tool-ic">' + inner + '</span><span>' + label + '</span></button>';
  }

  function scrubTo(e) {
    var r = el.tlWrap.getBoundingClientRect();
    var t = clamp((e.clientX - r.left) / r.width, 0, 1) * (S.trim.duration || S.duration || 0);
    S.playhead = t;
    try { el.vid.currentTime = t; } catch (er) {}
    updatePlayhead();
  }
  function scrubMove(e) { scrubTo(e); }
  function scrubEnd() {
    el.tlWrap.removeEventListener("pointermove", scrubMove);
    window.removeEventListener("pointerup", scrubEnd);
  }

  var hDrag = null;
  function startHandleDrag(e, which) {
    hDrag = { which: which, rect: el.tlWrap.getBoundingClientRect() };
    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
    e.preventDefault();
    e.stopPropagation();
  }
  function handleDragMove(e) {
    if (!hDrag) return;
    var dur = S.trim.duration || S.duration || 1;
    var t = clamp((e.clientX - hDrag.rect.left) / hDrag.rect.width, 0, 1) * dur;
    var sel = S.segments[S.selSeg] || S.segments[0];
    if (!sel) return;

    if (hDrag.which === "start") {
      sel.start = clamp(t, 0, sel.end - 0.2);
      try { el.vid.currentTime = sel.start; } catch (er) {}
    } else {
      sel.end = clamp(t, sel.start + 0.2, dur);
      try { el.vid.currentTime = sel.end - 0.05; } catch (er) {}
    }
    S.dirty = true;
    renderTimeline();
  }
  function handleDragEnd() {
    hDrag = null;
    window.removeEventListener("pointermove", handleDragMove);
    window.removeEventListener("pointerup", handleDragEnd);
  }

  function onTlTool(tool) {
    if (tool === "split") return splitAt();
    if (tool === "delete") return deleteSeg();
    if (tool === "dup") return dupSeg();
    if (tool === "flip") return flipClip();
    if (tool === "speed") return toggleSpeedMenu();
    if (tool === "sound") { openSheet("sound"); return; }
    if (tool === "addclip") return triggerAddClip();
  }

  function splitAt() {
    var segs = S.segments;
    var cur = el.vid.currentTime;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (cur > s.start + 0.3 && cur < s.end - 0.3) {
        var oldEnd = s.end;
        s.end = cur;
        segs.splice(i + 1, 0, { start: cur, end: oldEnd });
        S.selSeg = i + 1;
        S.dirty = true;
        renderTimeline();
        toast("✂️ Clip split at " + fmt(cur));
        return;
      }
    }
    toast("Clip too short to split here");
  }

  function deleteSeg() {
    if (S.segments.length <= 1) { toast("Can't delete the only clip"); return; }
    S.segments.splice(S.selSeg, 1);
    S.selSeg = Math.max(0, S.selSeg - 1);
    S.dirty = true;
    renderTimeline();
    toast("🗑️ Clip deleted");
  }

  function dupSeg() {
    var sel = S.segments[S.selSeg];
    if (!sel) return;
    var copy = { start: sel.start, end: sel.end };
    S.segments.splice(S.selSeg + 1, 0, copy);
    S.selSeg = S.selSeg + 1;
    S.dirty = true;
    renderTimeline();
    toast("🔁 Clip duplicated");
  }

  function flipClip() {
    S.transform.flipH = !S.transform.flipH;
    S.dirty = true;
    applyPreview();
    toast("⇄ Video flipped");
  }

  function toggleSpeedMenu() {
    var row = el.speedRow;
    if (!row) return;
    if (row.style.display !== "none") {
      row.style.display = "none";
      return;
    }
    var speeds = [0.3, 0.5, 0.75, 1, 1.25, 1.5, 2];
    row.innerHTML = speeds.map(function (sp) {
      return '<button class="ze-speed-chip' + (S.speed === sp ? " active" : "") + '" data-sp="' + sp + '">' + sp + 'x</button>';
    }).join("");
    row.style.display = "flex";

    qsa(".ze-speed-chip", row).forEach(function (chip) {
      chip.addEventListener("click", function () {
        var sp = parseFloat(chip.getAttribute("data-sp"));
        S.speed = sp;
        el.vid.playbackRate = sp;
        S.dirty = true;
        toast("⚡ Speed set to " + sp + "x");
        toggleSpeedMenu();
      });
    });
  }

  function triggerAddClip() {
    var inp = $("zeAddClipInput");
    if (!inp) {
      inp = document.createElement("input");
      inp.id = "zeAddClipInput";
      inp.type = "file";
      inp.accept = "video/*,image/*";
      inp.style.display = "none";
      document.body.appendChild(inp);
    }
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      toast("➕ Clip added: " + f.name);
      // Append a duplicate segment as placeholder
      var last = S.segments[S.segments.length - 1];
      if (last) {
        S.segments.push({ start: 0, end: Math.min(5, S.duration) });
        renderTimeline();
      }
    };
    inp.click();
  }

  /* ---------------- Thumbnails ---------------- */
  function captureThumbs() {
    if (S.kind !== "video") return;
    var dur = S.duration;
    if (!dur) return;
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

  /* ---------------- 2D Canvas Baking for Export ---------------- */
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
    if (a.warmth > 0) {
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = "rgba(255,140,0," + (a.warmth / 100 * 0.5) + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    if (a.warmth < 0) {
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = "rgba(0,120,255," + (Math.abs(a.warmth) / 100 * 0.5) + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    if (e.vignette > 0) {
      var g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0," + (e.vignette / 100 * 0.85) + ")");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    if (e.glow > 0) {
      ctx.globalCompositeOperation = "screen";
      var gg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      gg.addColorStop(0, "rgba(255,255,255," + (e.glow / 100 * 0.35) + ")");
      gg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    if (e.leak > 0) {
      ctx.globalCompositeOperation = "screen";
      var lg = ctx.createLinearGradient(0, 0, W, H);
      lg.addColorStop(0.4, "rgba(255,120,0,0)");
      lg.addColorStop(0.65, "rgba(255,150,40," + (e.leak / 100 * 0.5) + ")");
      lg.addColorStop(1, "rgba(255,60,120," + (e.leak / 100 * 0.35) + ")");
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    if (e.grain > 0) {
      var n = noiseCanvas();
      ctx.globalAlpha = e.grain / 100 * 0.35;
      ctx.globalCompositeOperation = "overlay";
      for (var y = 0; y < H; y += n.height) {
        for (var x = 0; x < W; x += n.width) ctx.drawImage(n, x, y);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    if (e.bars > 0) {
      var barH = H * 0.1;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, barH);
      ctx.fillRect(0, H - barH, W, barH);
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
      var fs = Math.max(10, t.size * W);
      ctx.save();
      ctx.font = t.weight + " " + fs + "px " + (t.font || "system-ui, sans-serif");
      ctx.textAlign = t.align || "center";
      ctx.textBaseline = "middle";
      var x = t.x * W, y = t.y * H;
      var lines = String(t.text).split("\n");
      var lineH = fs * 1.25, totalH = lineH * lines.length;

      if (t.cap === "hormozi") {
        ctx.fillStyle = "#ffeb3b";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = Math.max(3, fs * 0.18);
        ctx.lineJoin = "round";
        lines.forEach(function (l, i) {
          var ly = y - totalH / 2 + lineH * (i + 0.5);
          ctx.strokeText(l, x, ly);
          ctx.fillText(l, x, ly);
        });
      } else if (t.cap === "highlight" || t.bg === "pill") {
        var mw = 0; lines.forEach(function (l) { mw = Math.max(mw, ctx.measureText(l).width); });
        var px = fs * 0.45, py = fs * 0.28;
        ctx.fillStyle = t.bgColor || "#e63946";
        roundRect(ctx, x - mw / 2 - px, y - totalH / 2 - py, mw + px * 2, totalH + py * 2, fs * 0.4);
        ctx.fill();
        ctx.fillStyle = t.color || "#ffffff";
        lines.forEach(function (l, i) {
          ctx.fillText(l, x, y - totalH / 2 + lineH * (i + 0.5));
        });
      } else if (t.bg === "solid" || t.cap === "minimal") {
        var mw2 = 0; lines.forEach(function (l) { mw2 = Math.max(mw2, ctx.measureText(l).width); });
        var px2 = fs * 0.35, py2 = fs * 0.22;
        ctx.fillStyle = "rgba(0,0,0,0.78)";
        roundRect(ctx, x - mw2 / 2 - px2, y - totalH / 2 - py2, mw2 + px2 * 2, totalH + py2 * 2, fs * 0.25);
        ctx.fill();
        ctx.fillStyle = t.color || "#ffffff";
        lines.forEach(function (l, i) {
          ctx.fillText(l, x, y - totalH / 2 + lineH * (i + 0.5));
        });
      } else {
        lines.forEach(function (l, i) {
          var ly = y - totalH / 2 + lineH * (i + 0.5);
          if (t.bg === "outline" || t.cap === "outline") {
            ctx.lineWidth = Math.max(2.5, fs * 0.12);
            ctx.strokeStyle = "#000000";
            ctx.strokeText(l, x, ly);
          } else {
            ctx.shadowColor = "rgba(0,0,0,0.65)";
            ctx.shadowBlur = fs * 0.2;
          }
          ctx.fillStyle = t.color || "#ffffff";
          ctx.fillText(l, x, ly);
        });
      }
      ctx.restore();
    });
  }

  function drawStickers(ctx, W, H) {
    S.stickers.forEach(function (s) {
      var fs = Math.max(14, s.size * W);
      ctx.save();
      ctx.font = fs + "px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.emoji, s.x * W, s.y * H);
      ctx.restore();
    });
  }

  /* ---------------- EXPORT (Images & Videos) ---------------- */
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
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error("blob")); }, "image/jpeg", 0.94);
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
        var stopped = new Promise(function (res) {
          rec.onstop = function () { res(new Blob(chunks, { type: mime || "video/webm" })); };
        });

        var segs = activeSegments();
        var totalDur = segs.reduce(function (a, s) { return a + (s.end - s.start); }, 0) || 1;
        var doneDur = 0;
        v.loop = false;
        rec.start(100);
        v.muted = S.muted;
        v.volume = S.volume;
        if (S.music && S.music.el) {
          try { S.music.el.currentTime = 0; S.music.el.volume = S.musicVol; S.music.el.play(); } catch (e) {}
        }

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
          else {
            v.addEventListener("seeked", begin);
            v.currentTime = seg.start;
            setTimeout(begin, 1200);
          }
        }
        playSeg();
      } catch (e) { reject(e); }
    });
  }

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

  /* ---------------- NEXT BUTTON (Publish / Flow Handoff) ---------------- */
  function onNext() {
    if (!S.file) return;
    el.next.disabled = true;
    el.next.textContent = "…";
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

    if (!S.dirty && S.segments.length <= 1) { finish(S.file); return; }

    if (S.kind === "image") {
      showRender("Rendering your edit…", "Applying filters, effects and text.", 0);
      exportImage().then(function (blob) {
        finish(new File([blob], "zyro-edit-" + Date.now() + ".jpg", { type: "image/jpeg" }));
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
          finish(new File([fixed], "zyro-edit-" + Date.now() + (isWebm ? ".webm" : ".mp4"), { type: fixed.type || "video/webm" }));
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
  function hideRender() { el.render.classList.remove("show"); }

  function handoff(fileOut) {
    try {
      if (S.kind === "video") {
        if (typeof window.__zeOrigVideoEditor === "function") {
          window.__zeOrigVideoEditor(fileOut, S.category || "reel");
          return;
        }
      } else {
        if (typeof window.openCreatePostModal === "function") window.openCreatePostModal("photo");
        if (typeof window.__zeOrigPostMedia === "function") {
          window.__zeOrigPostMedia(fileOut);
          return;
        }
      }
    } catch (e) { console.warn("handoff error", e); }
    toast("✅ Edit ready for upload");
  }

  /* ---------------- Auto-Wrap Install ---------------- */
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
