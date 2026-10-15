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

  /* ---------------- Sticker & Overlay Packs (Instagram / YouTube style) ---------------- */
  function _svg(vb, inner) { return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>'; }

  var STICKER_PACKS = [
    { id: "trending", name: "Trending", items: [
      { id: "sub",    kind: "svg", svg: _svg("0 0 220 84", '<rect x="4" y="6" width="212" height="72" rx="36" fill="#ff0033"/><text x="110" y="54" font-family="Arial,Helvetica,sans-serif" font-size="36" font-weight="700" fill="#ffffff" text-anchor="middle">SUBSCRIBE</text>') },
      { id: "like",   kind: "svg", svg: _svg("0 0 100 100", '<path d="M50 88C20 66 8 50 8 33 8 18 20 8 33 8c8 0 14 4 17 10 3-6 9-10 17-10 13 0 25 10 25 25 0 17-12 33-42 55z" fill="#ff2d55"/><path d="M50 88C20 66 8 50 8 33 8 18 20 8 33 8c8 0 14 4 17 10 3-6 9-10 17-10 13 0 25 10 25 25 0 17-12 33-42 55z" fill="none" stroke="#ffffff" stroke-width="5"/>') },
      { id: "new",    kind: "svg", svg: _svg("0 0 170 84", '<g transform="rotate(-8 85 42)"><rect x="6" y="8" width="158" height="68" rx="16" fill="#ff3d00"/><text x="85" y="56" font-family="Arial,sans-serif" font-size="42" font-weight="800" fill="#ffffff" text-anchor="middle">NEW</text></g>') },
      { id: "live",   kind: "svg", svg: _svg("0 0 150 80", '<rect x="4" y="10" width="142" height="60" rx="14" fill="#e60023"/><circle cx="34" cy="40" r="9" fill="#ffffff"/><text x="92" y="53" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle">LIVE</text>') },
      { id: "trend",  kind: "svg", svg: _svg("0 0 100 100", '<path d="M14 62l22-24 16 16 34-34" fill="none" stroke="#00e676" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M64 20h22v22" fill="none" stroke="#00e676" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>') },
      { id: "fire",   kind: "emoji", ch: "🔥" },
      { id: "viral",  kind: "emoji", ch: "🚀" },
      { id: "crown",  kind: "emoji", ch: "👑" }
    ]},
    { id: "youtube", name: "YouTube", items: [
      { id: "yt-play",    kind: "svg", svg: _svg("0 0 100 100", '<rect x="6" y="20" width="88" height="60" rx="18" fill="#ff0000"/><path d="M42 36l24 14-24 14z" fill="#ffffff"/>') },
      { id: "yt-bell",    kind: "svg", svg: _svg("0 0 100 100", '<path d="M50 12a20 20 0 0 0-20 20v14l-8 14h56l-8-14V32a20 20 0 0 0-20-20z" fill="#ffca28"/><path d="M42 66a8 8 0 0 0 16 0z" fill="#ffca28"/>') },
      { id: "yt-comment", kind: "svg", svg: _svg("0 0 100 100", '<path d="M12 20h76v44H40L22 84V64H12z" fill="#ffffff" stroke="#0f0f0f" stroke-width="5" stroke-linejoin="round"/>') },
      { id: "yt-share",   kind: "svg", svg: _svg("0 0 100 100", '<path d="M18 74c0-24 16-38 40-38V18l30 26-30 26V52c-18 0-28 6-40 22z" fill="#0f9d58"/>') },
      { id: "yt-subs",    kind: "svg", svg: _svg("0 0 210 72", '<rect x="4" y="6" width="202" height="60" rx="30" fill="#ffffff" stroke="#0f0f0f" stroke-width="4"/><text x="105" y="46" font-family="Arial,sans-serif" font-size="27" font-weight="700" fill="#0f0f0f" text-anchor="middle">Subscribed</text>') },
      { id: "yt-views",   kind: "svg", svg: _svg("0 0 200 72", '<rect x="4" y="6" width="192" height="60" rx="12" fill="rgba(0,0,0,0.72)"/><text x="100" y="46" font-family="Arial,sans-serif" font-size="27" font-weight="700" fill="#ffffff" text-anchor="middle">1.2M views</text>') },
      { id: "yt-mic",     kind: "emoji", ch: "🎤" },
      { id: "yt-cam",     kind: "emoji", ch: "🎬" }
    ]},
    { id: "badges", name: "Badges", items: [
      { id: "verified", kind: "svg", svg: _svg("0 0 100 100", '<path d="M50 6l10 10 14-2 4 14 14 6-6 14 6 14-14 6-4 14-14-2-10 10-10-10-14 2-4-14-14-6 6-14-6-14 14-6 4-14 14 2z" fill="#1da1f2"/><path d="M34 52l12 12 22-24" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>') },
      { id: "pin",      kind: "svg", svg: _svg("0 0 100 100", '<path d="M50 6a28 28 0 0 0-28 28c0 20 28 60 28 60s28-40 28-60A28 28 0 0 0 50 6z" fill="#e63946"/><circle cx="50" cy="34" r="11" fill="#ffffff"/>') },
      { id: "hashtag",  kind: "svg", svg: _svg("0 0 100 100", '<text x="50" y="74" font-family="Arial,sans-serif" font-size="80" font-weight="800" fill="#00d2ff" text-anchor="middle">#</text>') },
      { id: "mention",  kind: "svg", svg: _svg("0 0 100 100", '<circle cx="50" cy="50" r="30" fill="none" stroke="#b388ff" stroke-width="8"/><circle cx="50" cy="50" r="12" fill="none" stroke="#b388ff" stroke-width="8"/><path d="M62 50v8a12 12 0 0 0 24 0" fill="none" stroke="#b388ff" stroke-width="8" stroke-linecap="round"/>') },
      { id: "gif",      kind: "svg", svg: _svg("0 0 140 72", '<rect x="4" y="8" width="132" height="56" rx="12" fill="#111111"/><text x="70" y="48" font-family="Arial,sans-serif" font-size="32" font-weight="800" fill="#ffffff" text-anchor="middle">GIF</text>') },
      { id: "poll",     kind: "emoji", ch: "📊" },
      { id: "star",     kind: "emoji", ch: "⭐" },
      { id: "100",      kind: "emoji", ch: "💯" }
    ]},
    { id: "shapes", name: "Shapes", items: [
      { id: "circle", kind: "svg", svg: _svg("0 0 100 100", '<circle cx="50" cy="50" r="44" fill="#ff007f"/>') },
      { id: "square", kind: "svg", svg: _svg("0 0 100 100", '<rect x="8" y="8" width="84" height="84" rx="14" fill="#00d2ff"/>') },
      { id: "heart",  kind: "svg", svg: _svg("0 0 100 100", '<path d="M50 86C22 66 10 51 10 35 10 21 21 11 34 11c7 0 13 3 16 9 3-6 9-9 16-9 13 0 24 10 24 24 0 16-12 31-40 51z" fill="#ff2d55"/>') },
      { id: "arrow",  kind: "svg", svg: _svg("0 0 100 100", '<path d="M12 50h58M52 30l22 20-22 20" fill="none" stroke="#ffd700" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>') },
      { id: "bubble", kind: "svg", svg: _svg("0 0 100 100", '<path d="M12 16h76v52H44L24 88V68H12z" fill="#ffffff"/>') },
      { id: "frame",  kind: "svg", svg: _svg("0 0 100 100", '<rect x="6" y="6" width="88" height="88" rx="10" fill="none" stroke="#ffffff" stroke-width="6"/>') },
      { id: "spark",  kind: "emoji", ch: "✨" },
      { id: "burst",  kind: "emoji", ch: "💥" }
    ]},
    { id: "emoji", name: "Emoji", items: [
      "😂","🤣","❤️","🔥","😍","👍","🙌","🎉","💯","✨",
      "😎","🥺","👑","🎵","⚡","💖","😊","🙏","💪","🎯",
      "🌟","😱","🤯","😭","😡","🍿","🚀","🏆","🥳","🤙"
    ].map(function (ch, i) { return { id: "em" + i, kind: "emoji", ch: ch }; }) }
  ];

  var OVERLAY_PACKS = [
    { id: "frames", name: "Frames", items: [
      { id: "ov-frame-white",  kind: "svg", svg: _svg("0 0 100 100", '<rect x="4" y="4" width="92" height="92" rx="4" fill="none" stroke="#ffffff" stroke-width="3"/>') },
      { id: "ov-frame-neon",   kind: "svg", svg: _svg("0 0 100 100", '<rect x="4" y="4" width="92" height="92" rx="14" fill="none" stroke="#00e5ff" stroke-width="3.5"/><rect x="4" y="4" width="92" height="92" rx="14" fill="none" stroke="#ff00e5" stroke-width="1.4"/>') },
      { id: "ov-polaroid",     kind: "svg", svg: _svg("0 0 100 120", '<rect x="4" y="4" width="92" height="112" rx="3" fill="#ffffff"/><rect x="10" y="10" width="80" height="80" fill="#c9c9c9"/>') },
      { id: "ov-filmstrip",    kind: "svg", svg: _svg("0 0 100 100", '<rect x="0" y="0" width="100" height="100" fill="none"/><rect x="0" y="0" width="100" height="12" fill="#111"/><rect x="0" y="88" width="100" height="12" fill="#111"/><g fill="#f2f2f2"><rect x="6" y="3" width="8" height="6" rx="1"/><rect x="22" y="3" width="8" height="6" rx="1"/><rect x="38" y="3" width="8" height="6" rx="1"/><rect x="54" y="3" width="8" height="6" rx="1"/><rect x="70" y="3" width="8" height="6" rx="1"/><rect x="86" y="3" width="8" height="6" rx="1"/><rect x="6" y="91" width="8" height="6" rx="1"/><rect x="22" y="91" width="8" height="6" rx="1"/><rect x="38" y="91" width="8" height="6" rx="1"/><rect x="54" y="91" width="8" height="6" rx="1"/><rect x="70" y="91" width="8" height="6" rx="1"/><rect x="86" y="91" width="8" height="6" rx="1"/></g>') },
      { id: "ov-vignette",     kind: "svg", svg: _svg("0 0 100 100", '<defs><radialGradient id="ovv" cx="50%" cy="50%" r="72%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.72"/></radialGradient></defs><rect x="0" y="0" width="100" height="100" fill="url(#ovv)"/>') },
      { id: "ov-gradient",     kind: "svg", svg: _svg("0 0 100 100", '<defs><linearGradient id="ovg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff2d55" stop-opacity="0.55"/><stop offset="100%" stop-color="#7b2ff7" stop-opacity="0.55"/></linearGradient></defs><rect x="0" y="0" width="100" height="100" fill="url(#ovg)"/>') }
    ]},
    { id: "light", name: "Light", items: [
      { id: "ov-leak-warm", kind: "svg", svg: _svg("0 0 100 100", '<defs><radialGradient id="ovlw" cx="82%" cy="18%" r="70%"><stop offset="0%" stop-color="#ffb347" stop-opacity="0.9"/><stop offset="100%" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs><rect x="0" y="0" width="100" height="100" fill="url(#ovlw)"/>') },
      { id: "ov-leak-pink", kind: "svg", svg: _svg("0 0 100 100", '<defs><radialGradient id="ovlp" cx="18%" cy="82%" r="70%"><stop offset="0%" stop-color="#ff2d9b" stop-opacity="0.85"/><stop offset="100%" stop-color="#ff2d9b" stop-opacity="0"/></radialGradient></defs><rect x="0" y="0" width="100" height="100" fill="url(#ovlp)"/>') },
      { id: "ov-glow",      kind: "svg", svg: _svg("0 0 100 100", '<defs><radialGradient id="ovgc" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect x="0" y="0" width="100" height="100" fill="url(#ovgc)"/>') },
      { id: "ov-bokeh",     kind: "svg", svg: _svg("0 0 100 100", '<g fill="#fff" opacity="0.55"><circle cx="20" cy="26" r="7"/><circle cx="72" cy="18" r="4"/><circle cx="84" cy="62" r="9"/><circle cx="34" cy="76" r="5"/><circle cx="56" cy="48" r="3"/></g>') },
      { id: "ov-sun",       kind: "svg", svg: _svg("0 0 100 100", '<g stroke="#ffd54f" stroke-width="4" stroke-linecap="round" opacity="0.85"><path d="M50 4v14M50 82v14M4 50h14M82 50h14M18 18l10 10M72 72l10 10M82 18l-10 10M28 72l-10 10"/></g><circle cx="50" cy="50" r="12" fill="#ffca28" opacity="0.9"/>') }
    ]},
    { id: "shapes", name: "Shapes", items: [
      { id: "ov-blob",   kind: "svg", svg: _svg("0 0 100 100", '<path d="M74 16c12 8 20 24 16 40s-20 30-38 30S14 72 12 54 22 20 38 14s24-6 36 2z" fill="#7b2ff7" opacity="0.85"/>') },
      { id: "ov-tri",    kind: "svg", svg: _svg("0 0 100 100", '<path d="M50 10l44 76H6z" fill="#ff9800" opacity="0.9"/>') },
      { id: "ov-ring",   kind: "svg", svg: _svg("0 0 100 100", '<circle cx="50" cy="50" r="38" fill="none" stroke="#00e5ff" stroke-width="10"/>') },
      { id: "ov-dots",   kind: "svg", svg: _svg("0 0 100 100", '<g fill="#fff" opacity="0.7"><circle cx="16" cy="16" r="3"/><circle cx="38" cy="16" r="3"/><circle cx="60" cy="16" r="3"/><circle cx="82" cy="16" r="3"/><circle cx="16" cy="38" r="3"/><circle cx="38" cy="38" r="3"/><circle cx="60" cy="38" r="3"/><circle cx="82" cy="38" r="3"/><circle cx="16" cy="60" r="3"/><circle cx="38" cy="60" r="3"/><circle cx="60" cy="60" r="3"/><circle cx="82" cy="60" r="3"/><circle cx="16" cy="82" r="3"/><circle cx="38" cy="82" r="3"/><circle cx="60" cy="82" r="3"/><circle cx="82" cy="82" r="3"/></g>') },
      { id: "ov-wave",   kind: "svg", svg: _svg("0 0 100 100", '<path d="M4 60c14-22 30-22 44 0s30 22 44 0" fill="none" stroke="#ffd700" stroke-width="6" stroke-linecap="round"/>') },
      { id: "ov-star",   kind: "svg", svg: _svg("0 0 100 100", '<path d="M50 8l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3z" fill="#ffd700"/>') }
    ]},
    { id: "text", name: "Text", items: [
      { id: "ov-swipeup", kind: "svg", svg: _svg("0 0 220 90", '<rect x="4" y="6" width="212" height="78" rx="18" fill="rgba(0,0,0,0.72)"/><text x="110" y="46" font-family="Arial,sans-serif" font-size="30" font-weight="800" fill="#ffffff" text-anchor="middle">SWIPE UP</text><path d="M104 62l6-8 6 8" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>') },
      { id: "ov-linkbio", kind: "svg", svg: _svg("0 0 240 84", '<rect x="4" y="6" width="232" height="72" rx="36" fill="#ffffff"/><text x="120" y="52" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#111111" text-anchor="middle">Link in Bio</text>') },
      { id: "ov-follow",  kind: "svg", svg: _svg("0 0 220 84", '<rect x="4" y="6" width="212" height="72" rx="36" fill="#ff2d55"/><text x="110" y="52" font-family="Arial,sans-serif" font-size="30" font-weight="800" fill="#ffffff" text-anchor="middle">Follow Me</text>') },
      { id: "ov-dm",      kind: "svg", svg: _svg("0 0 200 84", '<rect x="4" y="6" width="192" height="72" rx="36" fill="#00d2ff"/><text x="100" y="52" font-family="Arial,sans-serif" font-size="30" font-weight="800" fill="#062b33" text-anchor="middle">DM Me</text>') },
      { id: "ov-tag",     kind: "svg", svg: _svg("0 0 260 84", '<rect x="4" y="6" width="252" height="72" rx="36" fill="#7b2ff7"/><text x="130" y="52" font-family="Arial,sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle">Tag a Friend</text>') },
      { id: "ov-newpost", kind: "svg", svg: _svg("0 0 220 84", '<rect x="4" y="6" width="212" height="72" rx="36" fill="#111111"/><text x="110" y="52" font-family="Arial,sans-serif" font-size="30" font-weight="800" fill="#ffffff" text-anchor="middle">NEW POST</text>') }
    ]}
  ];

  // Flatten packs into a lookup array; compute aspect ratio from viewBox
  var STICKERS = [];
  function _flattenPacks(packs, layer, out) {
    packs.forEach(function (p) {
      p.items.forEach(function (it) {
        it.pack = p.id;
        it.layer = layer;
        it.ar = 1;
        if (it.kind === "svg") {
          var m = /viewBox="([^"]+)"/.exec(it.svg);
          if (m) {
            var parts = m[1].split(/\s+/);
            var vw = parseFloat(parts[2]), vh = parseFloat(parts[3]);
            if (vw && vh) it.ar = vw / vh;
          }
        }
        out.push(it);
      });
    });
  }
  _flattenPacks(STICKER_PACKS, "sticker", STICKERS);
  _flattenPacks(OVERLAY_PACKS, "overlay", STICKERS);

  function stickerById(id) {
    for (var i = 0; i < STICKERS.length; i++) { if (STICKERS[i].id === id) return STICKERS[i]; }
    return null;
  }

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
  var SVG_PLAY = ic('<polygon points="6 4 20 12 6 20 6 4"/>', ' style="width:15px;height:15px;fill:currentColor;stroke:none;"');
  var SVG_PAUSE = ic('<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>', ' style="width:15px;height:15px;fill:currentColor;stroke:none;"');

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
            '<div class="ze-overlay-layer" id="zeOverlayLayer"></div>' +
            '<div class="ze-text-layer" id="zeTextLayer"></div>' +
            '<div class="ze-sticker-layer" id="zeStickerLayer"></div>' +
          '</div>' +
        '</div>' +
        '<div class="ze-trash-zone" id="zeTrashZone" aria-hidden="true">' +
          ic('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', ' style="width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;"') +
          '<span>Delete</span>' +
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
          railBtn("save", "Save", ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>')) +
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
            '<button class="ze-tl-playhead-btn" id="zeTlPlayToggle" title="Play/Pause">' + SVG_PLAY + '</button>' +
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
              '<span>' + ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', ' style="width:12px;height:12px;display:inline;stroke:currentColor;fill:none;vertical-align:-1px;"') + ' <span id="zeTlAudioName">No audio added</span></span>' +
              '<div class="ze-tl-audio-wave"><div class="ze-tl-wave-bar" style="height:6px"></div><div class="ze-tl-wave-bar" style="height:12px"></div><div class="ze-tl-wave-bar" style="height:8px"></div><div class="ze-tl-wave-bar" style="height:14px"></div></div>' +
            '</div>' +
            '<div class="ze-tl-overlay-lane" id="zeTlOverlayLane"></div>' +
            '<div class="ze-tl-text-lane" id="zeTlTextLane"></div>' +
          '</div>' +
          '<div class="ze-tl-tools" id="zeTlTools"></div>' +
          '<div class="ze-speed-row" id="zeSpeedRow" style="display:none"></div>' +
        '</div>' +
        '<!-- Full-screen Sound Picker -->' +
        '<div class="ze-sound-picker" id="zeSoundPicker">' +
          '<div class="ze-sp-header">' +
            '<button class="ze-sp-back" id="zeSoundPickerBack" aria-label="Back">' + ic('<path d="M19 12H5M12 19l-7-7 7-7"/>') + '</button>' +
            '<div class="ze-sp-title">Sounds</div>' +
            '<button class="ze-sp-create" id="zeSoundPickerCreate">' + ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', ' style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:5px;"') + 'Create</button>' +
          '</div>' +
          '<div class="ze-sp-body" id="zeSoundPickerBody"></div>' +
        '</div>' +
        '<!-- Master Volume Popover -->' +
        '<div class="ze-vol-pop" id="zeVolPop">' +
          '<div class="ze-vol-head">' + ic('<path d="M11 5 6 9H2v6h4l5 4V5Z"/>', ' style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;"') + '<span>Volume</span></div>' +
          '<div class="ze-vol-row"><span>Video</span><input type="range" id="zeVolVideo" min="0" max="100" value="100"><b id="zeVolVideoV">100%</b></div>' +
          '<div class="ze-vol-row"><span>Music</span><input type="range" id="zeVolMusic" min="0" max="100" value="80"><b id="zeVolMusicV">80%</b></div>' +
          '<button class="ze-vol-mute" id="zeVolMute">Mute all</button>' +
        '</div>' +
        '<!-- Hidden file inputs -->' +
        '<input type="file" id="zeDeviceAudioFile" accept="audio/*" style="display:none">' +
        '<input type="file" id="zeExtractVideoFile" accept="video/*" style="display:none">' +
        '<!-- Voiceover Console -->' +
        '<div class="ze-vo-overlay" id="zeVoiceoverOverlay">' +
          '<div class="ze-vo-panel">' +
            '<div class="ze-vo-header">' +
              '<div class="ze-vo-title">' + ic('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>') + '<span>Voiceover Studio</span></div>' +
              '<button class="ze-vo-close" id="zeVoClose">' + ic('<path d="M18 6 6 18M6 6l12 12"/>', ' style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.4;"') + '</button>' +
            '</div>' +
            '<div class="ze-vo-sub" id="zeVoSub">Tap the microphone to record your voice over the video</div>' +
            '<div class="ze-vo-timer" id="zeVoTimer">0:00.0</div>' +
            '<div class="ze-vo-meter" id="zeVoMeter"></div>' +
            '<button class="ze-vo-mic-btn" id="zeVoMicBtn" title="Record Voiceover">' +
              ic('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>') +
            '</button>' +
            '<label class="ze-vo-mute-toggle">' +
              '<input type="checkbox" id="zeVoMuteVideo" checked> Mute video audio while recording' +
            '</label>' +
            '<div class="ze-vo-actions" id="zeVoActions" style="display:none">' +
              '<button class="ze-vo-btn ze-vo-btn-secondary" id="zeVoPlayBtn">' + ic('<polygon points="6 4 20 12 6 20 6 4"/>', ' style="width:13px;height:13px;fill:currentColor;stroke:none;vertical-align:-2px;margin-right:4px;"') + 'Play</button>' +
              '<button class="ze-vo-btn ze-vo-btn-secondary" id="zeVoRetakeBtn">' + ic('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', ' style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.2;vertical-align:-2px;margin-right:4px;"') + 'Retake</button>' +
              '<button class="ze-vo-btn ze-vo-btn-primary" id="zeVoAddBtn">' + ic('<path d="M20 6 9 17l-5-5"/>', ' style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.6;vertical-align:-2px;margin-right:4px;"') + 'Add to Timeline</button>' +
              '<button class="ze-vo-btn ze-vo-btn-secondary" id="zeVoSaveBtn" title="Save audio to phone">' + ic('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>', ' style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:4px;"') + 'Save</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<!-- Audio Extraction & Export Tools -->' +
        '<div class="ze-at-overlay" id="zeAudioToolsOverlay">' +
          '<div class="ze-at-panel">' +
            '<div class="ze-at-header">' +
              '<div class="ze-at-title">' + ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>') + '<span>Audio Options</span></div>' +
              '<button class="ze-vo-close" id="zeAtClose">' + ic('<path d="M18 6 6 18M6 6l12 12"/>', ' style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.4;"') + '</button>' +
            '</div>' +
            '<div class="ze-at-card" id="zeAtExtractDeviceVideoBtn">' +
              '<div class="ze-at-icon">' + ic('<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>', ' style="width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.9;"') + '</div>' +
              '<div class="ze-at-info"><b>Extract Audio from Device Video</b><small>Pick any video from your phone to extract its soundtrack</small></div>' +
            '</div>' +
            '<div class="ze-at-card" id="zeAtExtractCurrentVideoBtn">' +
              '<div class="ze-at-icon">' + ic('<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m22 8-6 4 6 4V8z"/>', ' style="width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.9;"') + '</div>' +
              '<div class="ze-at-info"><b>Extract Current Video Audio</b><small>Separate this video sound into an editable timeline track</small></div>' +
            '</div>' +
            '<div class="ze-at-card" id="zeAtExportProjectAudioBtn">' +
              '<div class="ze-at-icon">' + ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', ' style="width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.9;"') + '</div>' +
              '<div class="ze-at-info"><b>Export Audio to Device</b><small>Download project music / voiceover mix as an audio file</small></div>' +
            '</div>' +
          '</div>' +
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
    el.overlayLayer = $("zeOverlayLayer");
    el.textLayer = $("zeTextLayer");
    el.stickerLayer = $("zeStickerLayer");
    el.soundBtn = $("zeSoundBtn");
    el.soundLabel = $("zeSoundLabel");
    el.volBtn = $("zeVolBtn");
    el.trashZone = $("zeTrashZone");
    el.soundPicker = $("zeSoundPicker");
    el.volPop = $("zeVolPop");
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
    el.tlOverlayLane = $("zeTlOverlayLane");
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
    el.soundBtn.addEventListener("click", function () { openSoundPicker(); });
    el.volBtn.addEventListener("click", openVolumeControl);
    el.sheetClose.addEventListener("click", closeSheet);
    el.tlClose.addEventListener("click", closeTimeline);

    if (el.tlAudioLane) {
      el.tlAudioLane.addEventListener("click", function () { openSoundPicker(); });
    }
    if (el.tlPlayToggle) {
      el.tlPlayToggle.addEventListener("click", togglePlayback);
    }

    if ($("zeSoundPickerBack")) $("zeSoundPickerBack").addEventListener("click", closeSoundPicker);
    if ($("zeSoundPickerCreate")) $("zeSoundPickerCreate").addEventListener("click", function () {
      var si = $("zeSoundSearch"); if (si) si.focus();
    });
    wireVolumePopover();

    qsa(".ze-rail-btn", el.rail).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tool = btn.getAttribute("data-tool");
        if (tool === "save") { saveMediaToDevice(); return; }
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
      if (el.tlPlayToggle) el.tlPlayToggle.innerHTML = SVG_PAUSE;
      if (S.music && S.music.el && S.music.el.paused) {
        try { S.music.el.play(); } catch (e) {}
      }
    });
    el.vid.addEventListener("pause", function () {
      if (el.tlPlayToggle) el.tlPlayToggle.innerHTML = SVG_PLAY;
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

  function stickerInner(st) {
    if (st.kind === "emoji") return '<span class="ze-sticker-glyph">' + st.ch + '</span>';
    return '<span class="ze-sticker-glyph ze-sticker-svg">' + st.svg + '</span>';
  }

  function renderStickers() {
    var boxW = el.canvas.clientWidth || 300;
    var stickerHtml = "", overlayHtml = "";
    S.stickers.forEach(function (s) {
      var fs = Math.max(20, s.size * boxW);
      var st = "left:" + (s.x * 100) + "%;top:" + (s.y * 100) + "%;";
      if (s.kind === "emoji") st += "font-size:" + fs + "px;";
      else st += "width:" + fs + "px;height:" + (fs / (s.ar || 1)) + "px;";
      var isOv = s.layer === "overlay";
      var cls = "ze-sticker-item" + (isOv ? " ze-overlay-item" : "") + (s.id === S.selectedStickerId ? " selected" : "");
      var node = '<div class="' + cls + '" data-id="' + s.id + '" style="' + st + '">' + stickerInner(s) + '</div>';
      if (isOv) overlayHtml += node; else stickerHtml += node;
    });
    if (el.stickerLayer) el.stickerLayer.innerHTML = stickerHtml;
    if (el.overlayLayer) el.overlayLayer.innerHTML = overlayHtml;
  }

  function svgDataUrl(svg) { return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); }

  function preloadStickerImage(item) {
    if (!item || item.kind !== "svg" || item.img) return;
    var img = new Image();
    img.onload = function () { item._loaded = true; };
    img.src = svgDataUrl(item.svg);
    item.img = img;
  }

  function preloadAllStickerImages() {
    var pending = [];
    S.stickers.forEach(function (s) {
      if (s.kind === "svg") {
        if (!s.img) preloadStickerImage(s);
        if (s.img && !s._loaded) {
          pending.push(new Promise(function (res) {
            s.img.addEventListener("load", res, { once: true });
            s.img.addEventListener("error", res, { once: true });
          }));
        }
      }
    });
    return Promise.all(pending);
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

  function overlayItems() {
    return S.stickers.filter(function (s) { return s.layer === "overlay"; });
  }

  function updateTimelineOverlayBlocks() {
    if (!el.tlOverlayLane) return;
    var ovs = overlayItems();
    if (!ovs.length) {
      el.tlOverlayLane.innerHTML = '<span style="font-size:10.5px;color:#6d6d78;padding-left:4px">No overlay added</span>';
      return;
    }
    el.tlOverlayLane.innerHTML = ovs.map(function (o) {
      var label = o.kind === "emoji" ? o.ch : (stickerById(o.id) ? (stickerById(o.id).pack || "overlay") : "overlay");
      return '<div class="ze-tl-overlay-block" data-oid="' + o.id + '">' + escapeHtml(String(label)) + '</div>';
    }).join("");
    qsa(".ze-tl-overlay-block", el.tlOverlayLane).forEach(function (b) {
      b.addEventListener("click", function () {
        S.selectedStickerId = b.getAttribute("data-oid");
        S.selectedTextId = null;
        renderStickers();
        openSheet("overlay");
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
    showTrash(true);

    if (S.activeSheet === "text" && !drag.sticker) {
      renderSheet();
    }
  }

  /* ---------------- Drag-to-Delete (Instagram style) ---------------- */
  function showTrash(show) {
    if (!el.trashZone) return;
    el.trashZone.classList.toggle("show", !!show);
    if (!show) el.trashZone.classList.remove("hot");
  }
  function isOverTrash(cx, cy) {
    if (!el.trashZone || !el.trashZone.classList.contains("show")) return false;
    var r = el.trashZone.getBoundingClientRect();
    var pad = 18;
    return cx >= r.left - pad && cx <= r.right + pad && cy >= r.top - pad && cy <= r.bottom + pad;
  }
  function deleteDecorById(id) {
    var before = S.stickers.length;
    S.stickers = S.stickers.filter(function (k) { return k.id !== id; });
    if (S.stickers.length !== before) {
      if (S.selectedStickerId === id) S.selectedStickerId = null;
      S.dirty = true;
      renderStickers();
      updateTimelineOverlayBlocks();
      toast("Deleted");
      return true;
    }
    var b2 = S.texts.length;
    S.texts = S.texts.filter(function (k) { return k.id !== id; });
    if (S.texts.length !== b2) {
      if (S.selectedTextId === id) S.selectedTextId = null;
      S.dirty = true;
      renderTexts();
      toast("Deleted");
      return true;
    }
    return false;
  }

  function onPointerMove(e) {
    if (!drag) return;
    var r = drag.rect;
    var x = clamp((e.clientX - r.left) / r.width, 0.04, 0.96);
    var y = clamp((e.clientY - r.top) / r.height, 0.04, 0.96);

    var overTrash = isOverTrash(e.clientX, e.clientY);
    if (el.trashZone) el.trashZone.classList.toggle("hot", overTrash);

    if (drag.sticker) {
      var s = S.stickers.filter(function (k) { return k.id === drag.id; })[0];
      if (s) {
        s.x = x; s.y = y;
        var node = el.canvas.querySelector('[data-id="' + s.id + '"]');
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

  function onPointerUp(e) {
    if (drag) {
      var d = drag;
      drag = null;
      var overTrash = e ? isOverTrash(e.clientX, e.clientY) : false;
      showTrash(false);
      if (overTrash) { deleteDecorById(d.id); }
      else { S.dirty = true; }
    } else {
      showTrash(false);
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
        showTrash(true);
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
      if (el.trashZone) el.trashZone.classList.toggle("hot", isOverTrash(touch.clientX, touch.clientY));
      if (drag.sticker) {
        var s = S.stickers.filter(function (k) { return k.id === drag.id; })[0];
        if (s) {
          s.x = x; s.y = y;
          var node = el.canvas.querySelector('[data-id="' + s.id + '"]');
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

  function onTouchEnd(e) {
    if (drag) {
      var d = drag; drag = null;
      var t = e && e.changedTouches && e.changedTouches[0];
      var overTrash = t ? isOverTrash(t.clientX, t.clientY) : false;
      showTrash(false);
      if (overTrash) deleteDecorById(d.id); else S.dirty = true;
    } else { showTrash(false); }
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
    else if (n === "overlay") renderOverlaySheet();
    else if (n === "adjust") renderAdjustSheet();
    else if (n === "ratio") renderRatioSheet();
    else if (n === "transform") renderTransformSheet();
    else if (n === "save") renderSaveSheet();
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
        '<button class="ze-btn ze-btn-primary" id="zeAddTextBtn">' + ic('<path d="M12 5v14M5 12h14"/>', ' style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2.4;vertical-align:-2px;margin-right:5px;"') + 'Add Text</button></div>';
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
        '<button class="ze-btn ze-btn-ghost" id="zeDupTextBtn">' + ic('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>', ' style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:5px;"') + 'Duplicate</button>' +
        '<button class="ze-btn ze-btn-danger" id="zeDelTextBtn">' + ic('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', ' style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:5px;"') + 'Delete</button>' +
      '</div>' +
      '<div style="height:8px"></div>' +
      '<button class="ze-btn ze-btn-ghost" id="zeAddNewTextBtn">' + ic('<path d="M12 5v14M5 12h14"/>', ' style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.4;vertical-align:-2px;margin-right:5px;"') + 'Add Another Text</button>' +
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
      '<button class="ze-btn ze-btn-primary" id="zeCreateCustomCap">' + ic('<path d="M12 5v14M5 12h14"/>', ' style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2.4;vertical-align:-2px;margin-right:5px;"') + 'Add Custom Caption</button>';

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
  function addSticker(st) {
    if (typeof st === "string") st = stickerById(st) || { id: "x", kind: "emoji", ch: st };
    var id = "s_" + Date.now() + "_" + Math.floor(Math.random() * 999);
    var isOv = st.layer === "overlay";
    var item = {
      id: id, kind: st.kind, ch: st.ch, svg: st.svg, ar: st.ar || 1,
      layer: isOv ? "overlay" : "sticker",
      x: 0.5, y: 0.5,
      size: isOv ? 0.55 : (st.kind === "emoji" ? 0.22 : 0.32)
    };
    S.stickers.push(item);
    S.selectedStickerId = id;
    S.selectedTextId = null;
    S.dirty = true;
    if (item.kind === "svg") preloadStickerImage(item);
    renderStickers();
    updateTimelineOverlayBlocks();
    toast((isOv ? "Overlay" : "Sticker") + " added — drag anywhere");
  }

  function _renderDecorSheet(packs, isOverlay) {
    var tabs = packs.map(function (p, i) {
      return '<button class="ze-sticker-cat' + (i === 0 ? " active" : "") + '" data-cat="' + p.id + '">' + p.name + '</button>';
    }).join("");
    el.sheetBody.innerHTML =
      '<div class="ze-sticker-tabs" id="zeStickerTabs">' + tabs + '</div>' +
      '<div class="ze-sticker-grid" id="zeStickerGrid"></div>';
    var grid = $("#zeStickerGrid");
    function paint(catId) {
      var pack = packs.filter(function (p) { return p.id === catId; })[0] || packs[0];
      grid.innerHTML = pack.items.map(function (it) {
        return '<button class="ze-sticker-btn' + (isOverlay ? " ze-overlay-btn" : "") + '" data-sid="' + it.id + '">' + stickerInner(it) + '</button>';
      }).join("");
      qsa(".ze-sticker-btn", grid).forEach(function (btn) {
        btn.addEventListener("click", function () { addSticker(stickerById(btn.getAttribute("data-sid"))); });
      });
    }
    paint(packs[0].id);
    qsa(".ze-sticker-cat", el.sheetBody).forEach(function (b) {
      b.addEventListener("click", function () {
        qsa(".ze-sticker-cat", el.sheetBody).forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        paint(b.getAttribute("data-cat"));
      });
    });
  }

  function renderStickersSheet() {
    setSheetTitle("Stickers");
    _renderDecorSheet(STICKER_PACKS, false);
  }

  function renderOverlaySheet() {
    setSheetTitle("Overlay");
    _renderDecorSheet(OVERLAY_PACKS, true);
  }

  /* ---------------- 6. MORE SHEET (SAVE TO DEVICE AT VERY TOP) ---------------- */
  function renderSaveSheet() {
    setSheetTitle("Save to Device");
    var html =
      '<div class="ze-save-device-card" id="zeSaveCard">' +
        '<div class="ze-save-device-top">' +
          '<span class="ze-save-device-badge">' + ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', ' style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.4;"') + ' GALLERY EXPORT</span>' +
        '</div>' +
        '<div class="ze-save-device-title">Save to Device / Gallery</div>' +
        '<div class="ze-save-device-sub">Export full-quality video/reel with all your edits, filters, text & audio directly to your phone gallery</div>' +
        '<button class="ze-btn ze-save-download-btn" id="zeSaveToDeviceBtn">' +
          ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', ' style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.2;"') +
          '<span>Save to Phone Gallery / Download</span>' +
        '</button>' +
      '</div>';
    el.sheetBody.innerHTML = html;
    $("zeSaveToDeviceBtn").addEventListener("click", function () { saveMediaToDevice(); });
  }

  function renderAdjustSheet() {
    setSheetTitle("Adjust");
    var a = S.adjust;
    var html = '<div class="ze-panel-title">Fine Adjustments</div>' +
      sliderRow("zeBright", "Brightness", a.brightness, 50, 150, "%") +
      sliderRow("zeContrast", "Contrast", a.contrast, 50, 150, "%") +
      sliderRow("zeSat", "Saturation", a.saturation, 0, 200, "%") +
      sliderRow("zeWarm", "Warmth", a.warmth, -100, 100, "") +
      sliderRow("zeFade", "Fade", a.fade, 0, 100, "%") +
      '<div class="ze-chips" style="margin-top:12px"><button class="ze-chip" id="zeAdjustReset">' +
      ic('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', ' style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.2;vertical-align:-2px;margin-right:5px;"') +
      'Reset Adjustments</button></div>';
    el.sheetBody.innerHTML = html;
    bindSlider("zeBright", function (v) { a.brightness = v; S.dirty = true; applyPreview(); });
    bindSlider("zeContrast", function (v) { a.contrast = v; S.dirty = true; applyPreview(); });
    bindSlider("zeSat", function (v) { a.saturation = v; S.dirty = true; applyPreview(); });
    bindSlider("zeWarm", function (v) { a.warmth = v; S.dirty = true; applyPreview(); });
    bindSlider("zeFade", function (v) { a.fade = v; S.dirty = true; applyPreview(); });
    $("#zeAdjustReset").addEventListener("click", function () {
      S.adjust = { brightness: 100, contrast: 100, saturation: 100, warmth: 0, fade: 0 };
      S.dirty = true; applyPreview(); renderAdjustSheet();
    });
  }

  function renderRatioSheet() {
    setSheetTitle("Aspect Ratio");
    var html = '<div class="ze-panel-title">Aspect Ratio</div><div class="ze-chips">' +
      ASPECTS.map(function (x) {
        return '<button class="ze-chip' + (x.id === S.aspect ? " active" : "") + '" data-asp="' + x.id + '">' + x.name + '</button>';
      }).join("") + '</div>';
    el.sheetBody.innerHTML = html;
    qsa("[data-asp]", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () {
        S.aspect = n.getAttribute("data-asp");
        S.dirty = true; applyAspect(); renderTexts(); renderStickers(); renderRatioSheet();
      });
    });
  }

  function renderTransformSheet() {
    setSheetTitle("Transform");
    var html = '<div class="ze-panel-title">Transform</div><div class="ze-chips">' +
      '<button class="ze-chip" data-tr="rot">' + ic('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/>', ' style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.2;vertical-align:-2px;margin-right:5px;"') + 'Rotate 90°</button>' +
      '<button class="ze-chip' + (S.transform.flipH ? " active" : "") + '" data-tr="fliph">' + ic('<path d="M12 3v18M7 8l-4 4 4 4M17 8l4 4-4 4"/>', ' style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.2;vertical-align:-2px;margin-right:5px;"') + 'Flip H</button>' +
      '<button class="ze-chip' + (S.transform.flipV ? " active" : "") + '" data-tr="flipv">' + ic('<path d="M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4"/>', ' style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.2;vertical-align:-2px;margin-right:5px;"') + 'Flip V</button>' +
      '<button class="ze-chip" data-tr="reset">' + ic('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', ' style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.2;vertical-align:-2px;margin-right:5px;"') + 'Reset</button></div>';
    el.sheetBody.innerHTML = html;
    qsa("[data-tr]", el.sheetBody).forEach(function (n) {
      n.addEventListener("click", function () {
        var k = n.getAttribute("data-tr");
        if (k === "rot") S.transform.rotate = (S.transform.rotate + 90) % 360;
        else if (k === "fliph") S.transform.flipH = !S.transform.flipH;
        else if (k === "flipv") S.transform.flipV = !S.transform.flipV;
        else { S.transform = { rotate: 0, flipH: false, flipV: false }; }
        S.dirty = true; applyAspect(); applyPreview(); renderTransformSheet();
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

  function _tabSvg(path) {
    return ic(path, ' style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:5px;"');
  }

  function buildSoundUI(container) {
    var html = "";

    // Active music banner
    if (S.music) {
      html += '<div class="ze-cur-music-card">' +
        '<div class="ze-cur-music-left">' +
          '<div class="ze-sound-ic">' + ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', ' style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"') + '</div>' +
          '<div class="ze-sound-meta">' +
            '<b>' + escapeHtml(S.music.name) + '</b>' +
            '<small>' + (S.music.artist ? escapeHtml(S.music.artist) : 'Active Soundtrack') + '</small>' +
          '</div>' +
        '</div>' +
        '<button class="ze-cur-music-remove" id="zeCurMusicRemove">Remove</button>' +
      '</div>' +
      sliderRow("zeMusicVol", "Music Volume", Math.round(S.musicVol * 100), 0, 100, "%");
    }

    // Search bar
    html += '<div class="ze-search-wrap">' +
      '<span class="ze-search-icon">' + ic('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', ' style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.2;"') + '</span>' +
      '<input type="text" class="ze-input" id="zeSoundSearch" placeholder="Search Bollywood, Punjabi, Comedy sounds...">' +
      '<button class="ze-search-clear" id="zeSoundSearchClear" style="display:none">' + ic('<path d="M18 6 6 18M6 6l12 12"/>', ' style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2.4;"') + '</button>' +
    '</div>';

    // Genre pill tabs (SVG icons)
    html += '<div class="ze-sound-tabs">' +
      '<button class="ze-sound-tab active" data-scat="trending">' + _tabSvg('<path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1 0-2-1-3 3 1 5 4 5 7a7 7 0 1 1-14 0c0-5 4-6 4-10 0-1 1-2 3-3z"/>') + 'Trending</button>' +
      '<button class="ze-sound-tab" data-scat="story">' + _tabSvg('<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>') + 'Comedy</button>' +
      '<button class="ze-sound-tab" data-scat="bollywood">' + _tabSvg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>') + 'Bollywood</button>' +
      '<button class="ze-sound-tab" data-scat="punjabi">' + _tabSvg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>') + 'Punjabi</button>' +
      '<button class="ze-sound-tab" data-scat="desi">' + _tabSvg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>') + 'Desi Hits</button>' +
      '<button class="ze-sound-tab" data-scat="lofi">' + _tabSvg('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/>') + 'Lo-Fi</button>' +
      '<button class="ze-sound-tab" data-scat="meme">' + _tabSvg('<path d="m12 3-1.9 5.8L4 10.7l5.8 1.9L12 18l1.9-5.4L20 10.7l-6.1-1.9Z"/>') + 'Memes</button>' +
    '</div>';

    // Song list container
    html += '<div class="ze-sound-list" id="zeSoundListContainer">' +
      '<div style="text-align:center;padding:24px 16px;color:#8e8e9c"><div class="ze-spinner" style="margin:0 auto 10px;width:24px;height:24px;border-width:2px"></div>Loading songs...</div>' +
    '</div>';

    container.innerHTML = html;

    if ($("zeMusicVol")) {
      bindSlider("zeMusicVol", function (v) {
        S.musicVol = v / 100;
        if (S.music && S.music.el) S.music.el.volume = S.musicVol;
      });
    }

    if ($("zeCurMusicRemove")) {
      $("zeCurMusicRemove").addEventListener("click", function () {
        if (S.music && S.music.el) { try { S.music.el.pause(); } catch (e) {} }
        S.music = null;
        updateSoundLabel();
        if (S.timelineOpen) renderTimeline();
        buildSoundUI(container);
        toast("Audio removed");
      });
    }

    var searchInput = $("zeSoundSearch");
    var clearBtn = $("zeSoundSearchClear");
    var searchTimer = null;

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        var q = (this.value || "").trim();
        if (clearBtn) clearBtn.style.display = q ? "flex" : "none";
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          if (!q) loadSoundCategory("trending");
          else fetchItunesSounds(q);
        }, 350);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (searchInput) { searchInput.value = ""; searchInput.focus(); }
        clearBtn.style.display = "none";
        loadSoundCategory("trending");
      });
    }

    qsa(".ze-sound-tab", container).forEach(function (tab) {
      tab.addEventListener("click", function () {
        qsa(".ze-sound-tab", container).forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        loadSoundCategory(tab.getAttribute("data-scat"));
      });
    });

    loadSoundCategory("trending");
  }

  function renderSoundSheet() {
    setSheetTitle("Add Music");
    buildSoundUI(el.sheetBody);
  }

  function openSoundPicker() {
    if (!el.soundPicker) return;
    closeSheet();
    el.sheetBody.innerHTML = "";
    el.soundPicker.classList.add("open");
    buildSoundUI($("zeSoundPickerBody"));
  }

  function closeSoundPicker() {
    if (el.soundPicker) el.soundPicker.classList.remove("open");
    if (activeAudioPreview) { try { activeAudioPreview.pause(); } catch (e) {} }
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
        '<button class="ze-audio-play-btn" data-play-idx="' + idx + '" title="Preview">' + SVG_PLAY + '</button>' +
        '<div class="ze-sound-ic">' + (s.icon ? s.icon : ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', ' style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"')) + '</div>' +
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
          btn.innerHTML = SVG_PLAY;
          btn.classList.remove("playing");
          return;
        }

        if (activeAudioPreview) {
          try { activeAudioPreview.pause(); } catch (er) {}
          qsa(".ze-audio-play-btn", container).forEach(function (b) { b.innerHTML = SVG_PLAY; b.classList.remove("playing"); });
        }

        activeAudioPreview = new Audio(s.previewUrl);
        activeAudioPreview._url = s.previewUrl;
        activeAudioPreview.volume = 0.9;
        activeAudioPreview.play().then(function () {
          btn.innerHTML = SVG_PAUSE;
          btn.classList.add("playing");
        }).catch(function () {});
        activeAudioPreview.onended = function () {
          btn.innerHTML = SVG_PLAY;
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

  function syncVolLabels() {
    var vv = $("zeVolVideo"), vm = $("zeVolMusic");
    if ($("zeVolVideoV")) $("zeVolVideoV").textContent = (vv ? vv.value : 100) + "%";
    if ($("zeVolMusicV")) $("zeVolMusicV").textContent = (vm ? vm.value : 0) + "%";
  }

  function applyMasterVolume() {
    el.vid.volume = S.volume;
    el.vid.muted = S.muted || S.volume === 0;
    if (S.music && S.music.el) {
      S.music.el.volume = S.musicVol;
      S.music.el.muted = S.musicVol === 0;
    }
    el.volBtn.classList.toggle("on", S.muted || S.volume === 0);
  }

  function wireVolumePopover() {
    var vv = $("zeVolVideo"), vm = $("zeVolMusic"), muteBtn = $("zeVolMute");
    if (vv) {
      vv.addEventListener("input", function () {
        S.volume = vv.value / 100;
        S.muted = S.volume === 0;
        applyMasterVolume();
        syncVolLabels();
      });
    }
    if (vm) {
      vm.addEventListener("input", function () {
        S.musicVol = vm.value / 100;
        applyMasterVolume();
        syncVolLabels();
      });
    }
    if (muteBtn) {
      muteBtn.addEventListener("click", function () {
        var anyOn = (S.volume > 0) || (S.musicVol > 0);
        if (anyOn) {
          S._prevVol = S.volume; S._prevMusicVol = S.musicVol;
          S.volume = 0; S.musicVol = 0; S.muted = true;
        } else {
          S.volume = S._prevVol != null ? S._prevVol : 1;
          S.musicVol = S._prevMusicVol != null ? S._prevMusicVol : 0.8;
          S.muted = false;
        }
        applyMasterVolume();
        if (vv) vv.value = Math.round(S.volume * 100);
        if (vm) vm.value = Math.round(S.musicVol * 100);
        syncVolLabels();
        toast(anyOn ? "Muted all" : "Sound on");
      });
    }
  }

  function openVolumeControl() {
    var pop = el.volPop;
    if (!pop) return;
    var open = pop.classList.toggle("open");
    if (open) {
      var vv = $("zeVolVideo"), vm = $("zeVolMusic");
      if (vv) vv.value = Math.round(S.volume * 100);
      if (vm) vm.value = Math.round(S.musicVol * 100);
      syncVolLabels();
    }
    el.volBtn.classList.toggle("on", open);
  }

  function toggleMute() {
    S.muted = !S.muted;
    applyMasterVolume();
    toast(S.muted ? "Muted" : "Sound on");
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

    // Overlay lane blocks (above text)
    updateTimelineOverlayBlocks();

    // CapCut & Instagram Reel Action Toolbar with complete Audio Suite
    el.tlTools.innerHTML =
      tlTool("split", "Split", ic('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>')) +
      tlTool("speed", "Speed", ic('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>')) +
      tlTool("flip", "Flip", ic('<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>')) +
      tlTool("delete", "Delete", ic('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>')) +
      tlTool("dup", "Duplicate", ic('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>')) +
      tlTool("addclip", "Add Clip", ic('<path d="M12 5v14M5 12h14"/>')) +
      tlTool("text", "Text", ic('<path d="M4 7V5h16v2M9 19h6M12 5v14"/>')) +
      tlTool("overlay", "Overlay", ic('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/>')) +
      tlTool("adjust", "Adjust", ic('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>')) +
      tlTool("ratio", "Ratio", ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14"/>')) +
      tlTool("transform", "Transform", ic('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>')) +
      tlTool("voiceover", "Voiceover", ic('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>')) +
      tlTool("importaudio", "Import Audio", ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>')) +
      tlTool("exportaudio", "Audio Tools", ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')) +
      tlTool("sound", "Music", ic('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'));

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
    if (tool === "voiceover") return openVoiceoverModal();
    if (tool === "importaudio") return triggerImportAudio();
    if (tool === "exportaudio") return openAudioToolsModal();
    if (tool === "sound") { openSheet("sound"); return; }
    if (tool === "addclip") return triggerAddClip();
    if (tool === "text") { openSheet("text"); return; }
    if (tool === "overlay") { openSheet("overlay"); return; }
    if (tool === "adjust") { openSheet("adjust"); return; }
    if (tool === "ratio") { openSheet("ratio"); return; }
    if (tool === "transform") { openSheet("transform"); return; }
  }

  /* ---------------- CapCut Timeline Audio Actions ---------------- */
  function triggerImportAudio() {
    var inp = $("zeDeviceAudioFile");
    if (!inp) return;
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var au = new Audio(url);
      au.loop = true;
      au.volume = S.musicVol;
      S.music = {
        name: f.name.replace(/\.[^.]+$/, ""),
        artist: "Imported from Device",
        url: url,
        el: au,
        isLocal: true
      };
      updateSoundLabel();
      renderTimeline();
      try { if (!el.vid.paused) au.play(); } catch (e) {}
      toast("📁 Audio imported: " + S.music.name);
      inp.value = "";
    };
    inp.click();
  }

  /* ---------------- CapCut Voiceover Recording System ---------------- */
  var voStream = null;
  var voRecorder = null;
  var voChunks = [];
  var voAudioCtx = null;
  var voAnalyser = null;
  var voTimerInterval = null;
  var voMeterAnim = null;
  var isVoRecording = false;
  var voStartTime = 0;
  var voDuration = 0;
  var voBlob = null;
  var voUrl = "";
  var voAudio = null;
  var voPrevMuted = false;
  var voEventsWired = false;

  function openVoiceoverModal() {
    var overlay = $("zeVoiceoverOverlay");
    if (!overlay) return;
    overlay.classList.add("show");

    var meter = $("zeVoMeter");
    if (meter) {
      var barsHtml = "";
      for (var b = 0; b < 18; b++) {
        barsHtml += '<div class="ze-vo-meter-bar" style="height:6px"></div>';
      }
      meter.innerHTML = barsHtml;
    }

    var sub = $("zeVoSub");
    if (sub) sub.textContent = "Start at " + fmt(el.vid.currentTime) + " · Tap mic to record voiceover";
    var timer = $("zeVoTimer");
    if (timer) timer.textContent = "0:00.0";
    var act = $("zeVoActions");
    if (act) act.style.display = "none";
    var mic = $("zeVoMicBtn");
    if (mic) {
      mic.classList.remove("recording");
      mic.innerHTML = ic('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>');
    }

    wireVoEventsOnce();
  }

  function closeVoiceoverModal() {
    if (isVoRecording) stopVoiceoverRecording();
    if (voAudio) { try { voAudio.pause(); } catch (e) {} }
    var overlay = $("zeVoiceoverOverlay");
    if (overlay) overlay.classList.remove("show");
  }

  function wireVoEventsOnce() {
    if (voEventsWired) return;
    voEventsWired = true;

    var closeBtn = $("zeVoClose");
    if (closeBtn) closeBtn.addEventListener("click", closeVoiceoverModal);

    var micBtn = $("zeVoMicBtn");
    if (micBtn) {
      micBtn.addEventListener("click", function () {
        if (!isVoRecording) startVoiceoverRecording();
        else stopVoiceoverRecording();
      });
    }

    var playBtn = $("zeVoPlayBtn");
    if (playBtn) {
      playBtn.addEventListener("click", function () {
        if (!voAudio) return;
        if (!voAudio.paused) {
          voAudio.pause();
          playBtn.innerHTML = SVG_PLAY + "<span>Play</span>";
        } else {
          voAudio.currentTime = 0;
          voAudio.play().then(function () {
            playBtn.innerHTML = SVG_PAUSE + "<span>Pause</span>";
          }).catch(function () {});
          voAudio.onended = function () { playBtn.innerHTML = SVG_PLAY + "<span>Play</span>"; };
        }
      });
    }

    var retakeBtn = $("zeVoRetakeBtn");
    if (retakeBtn) {
      retakeBtn.addEventListener("click", function () {
        if (voAudio) { try { voAudio.pause(); } catch (e) {} }
        voBlob = null;
        voUrl = "";
        voAudio = null;
        $("zeVoActions").style.display = "none";
        $("zeVoTimer").textContent = "0:00.0";
        $("zeVoSub").textContent = "Ready to re-record. Tap mic to start";
        var bars = qsa(".ze-vo-meter-bar", $("zeVoMeter"));
        bars.forEach(function (bar) { bar.style.height = "6px"; bar.classList.remove("active"); });
      });
    }

    var addBtn = $("zeVoAddBtn");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (!voBlob || !voUrl) {
          toast("No voiceover recorded yet");
          return;
        }
        var au = new Audio(voUrl);
        au.loop = true;
        au.volume = S.musicVol;
        S.music = {
          name: "Voiceover (" + fmt(voDuration) + ")",
          artist: "Recorded Voiceover",
          url: voUrl,
          el: au,
          isLocal: true,
          blob: voBlob
        };
        updateSoundLabel();
        if (S.timelineOpen) renderTimeline();
        closeVoiceoverModal();
        toast("🎙️ Voiceover added to timeline!");
      });
    }

    var saveBtn = $("zeVoSaveBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (!voBlob) {
          toast("No voiceover to save");
          return;
        }
        downloadBlob(voBlob, "upcomedyhub_voiceover_" + Date.now() + ".webm");
        toast("💾 Voiceover audio saved to device!");
      });
    }
  }

  function startVoiceoverRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast("⚠️ Audio recording not supported in browser");
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      voStream = stream;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          voAudioCtx = new AC();
          var src = voAudioCtx.createMediaStreamSource(stream);
          voAnalyser = voAudioCtx.createAnalyser();
          voAnalyser.fftSize = 64;
          src.connect(voAnalyser);
        }
      } catch (e) {}

      voChunks = [];
      try {
        voRecorder = new MediaRecorder(stream);
      } catch (e) {
        toast("⚠️ MediaRecorder not available");
        return;
      }

      voRecorder.ondataavailable = function (e) {
        if (e.data && e.data.size > 0) voChunks.push(e.data);
      };

      voRecorder.onstop = function () {
        voBlob = new Blob(voChunks, { type: "audio/webm" });
        voUrl = URL.createObjectURL(voBlob);
        voAudio = new Audio(voUrl);
        voDuration = (Date.now() - voStartTime) / 1000;
        showVoFinishedState();
      };

      voRecorder.start(80);
      isVoRecording = true;
      voStartTime = Date.now();

      var muteCheck = $("zeVoMuteVideo");
      voPrevMuted = el.vid.muted;
      if (muteCheck && muteCheck.checked) {
        el.vid.muted = true;
      }
      try { el.vid.play(); } catch (e) {}

      var mic = $("zeVoMicBtn");
      mic.classList.add("recording");
      mic.innerHTML = ic('<rect x="6" y="6" width="12" height="12" rx="2"/>', ' style="width:22px;height:22px;fill:currentColor;stroke:none;"');
      $("zeVoSub").textContent = "🔴 Recording Voiceover... Tap to stop";
      $("zeVoActions").style.display = "none";

      clearInterval(voTimerInterval);
      voTimerInterval = setInterval(updateVoTimer, 80);
      animateVoMeter();
    }).catch(function (err) {
      toast("⚠️ Microphone permission needed for Voiceover");
    });
  }

  function stopVoiceoverRecording() {
    if (!isVoRecording) return;
    isVoRecording = false;
    clearInterval(voTimerInterval);
    if (voMeterAnim) cancelAnimationFrame(voMeterAnim);

    if (voRecorder && voRecorder.state !== "inactive") {
      try { voRecorder.stop(); } catch (e) {}
    }
    if (voStream) {
      voStream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
    }
    if (voAudioCtx) {
      try { voAudioCtx.close(); } catch (e) {}
    }

    try { el.vid.pause(); } catch (e) {}
    el.vid.muted = voPrevMuted;

    var mic = $("zeVoMicBtn");
    if (mic) {
      mic.classList.remove("recording");
      mic.innerHTML = ic('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>');
    }
  }

  function updateVoTimer() {
    var elapsed = (Date.now() - voStartTime) / 1000;
    var t = $("zeVoTimer");
    if (t) t.textContent = fmt(elapsed);
  }

  function animateVoMeter() {
    if (!isVoRecording) return;
    var bars = qsa(".ze-vo-meter-bar", $("zeVoMeter"));
    if (voAnalyser && bars.length) {
      var arr = new Uint8Array(voAnalyser.frequencyBinCount);
      voAnalyser.getByteFrequencyData(arr);
      bars.forEach(function (bar, idx) {
        var val = arr[idx % arr.length] || 0;
        var h = Math.max(6, Math.min(32, Math.round(val / 8)));
        bar.style.height = h + "px";
        bar.classList.toggle("active", h > 12);
      });
    } else if (bars.length) {
      bars.forEach(function (bar) {
        var h = 6 + Math.round(Math.random() * 22);
        bar.style.height = h + "px";
        bar.classList.toggle("active", h > 14);
      });
    }
    voMeterAnim = requestAnimationFrame(animateVoMeter);
  }

  function showVoFinishedState() {
    $("zeVoSub").textContent = "✓ Voiceover recorded (" + fmt(voDuration) + ") · Review & apply below";
    $("zeVoActions").style.display = "flex";
    var bars = qsa(".ze-vo-meter-bar", $("zeVoMeter"));
    bars.forEach(function (bar) { bar.style.height = "8px"; bar.classList.remove("active"); });
  }

  /* ---------------- CapCut Audio Tools (Extract & Export) ---------------- */
  var atEventsWired = false;
  function openAudioToolsModal() {
    var overlay = $("zeAudioToolsOverlay");
    if (!overlay) return;
    overlay.classList.add("show");
    wireAudioToolsEventsOnce();
  }

  function closeAudioToolsModal() {
    var overlay = $("zeAudioToolsOverlay");
    if (overlay) overlay.classList.remove("show");
  }

  function wireAudioToolsEventsOnce() {
    if (atEventsWired) return;
    atEventsWired = true;

    var closeBtn = $("zeAtClose");
    if (closeBtn) closeBtn.addEventListener("click", closeAudioToolsModal);

    var extractDevBtn = $("zeAtExtractDeviceVideoBtn");
    var extractInput = $("zeExtractVideoFile");
    if (extractDevBtn && extractInput) {
      extractDevBtn.addEventListener("click", function () {
        extractInput.click();
      });
      extractInput.addEventListener("change", function () {
        var f = extractInput.files && extractInput.files[0];
        if (!f) return;
        var vUrl = URL.createObjectURL(f);
        var au = new Audio(vUrl);
        au.loop = true;
        au.volume = S.musicVol;
        S.music = {
          name: f.name.replace(/\.[^.]+$/, "") + " (Audio)",
          artist: "Extracted from Video",
          url: vUrl,
          el: au,
          isLocal: true
        };
        updateSoundLabel();
        if (S.timelineOpen) renderTimeline();
        try { if (!el.vid.paused) au.play(); } catch (e) {}
        closeAudioToolsModal();
        toast("🔊 Extracted audio from " + f.name);
        extractInput.value = "";
      });
    }

    var extractCurBtn = $("zeAtExtractCurrentVideoBtn");
    if (extractCurBtn) {
      extractCurBtn.addEventListener("click", function () {
        var src = el.vid.currentSrc || el.vid.src;
        if (!src && (!S.segments || !S.segments.length)) {
          toast("No active video found to extract audio from");
          return;
        }
        var au = new Audio(src);
        au.loop = true;
        au.volume = S.musicVol;
        S.music = {
          name: "Original Video Soundtrack",
          artist: "Extracted Audio Track",
          url: src,
          el: au,
          isLocal: true
        };
        updateSoundLabel();
        if (S.timelineOpen) renderTimeline();
        closeAudioToolsModal();
        toast("🔊 Current video audio separated to audio track!");
      });
    }

    var exportProjBtn = $("zeAtExportProjectAudioBtn");
    if (exportProjBtn) {
      exportProjBtn.addEventListener("click", function () {
        if (S.music && S.music.blob) {
          downloadBlob(S.music.blob, (S.music.name.replace(/[^a-zA-Z0-9_-]/g, "_") || "audio_export") + ".webm");
          closeAudioToolsModal();
          toast("💾 Audio saved to device!");
        } else if (S.music && S.music.url) {
          fetch(S.music.url).then(function (r) { return r.blob(); }).then(function (blob) {
            downloadBlob(blob, (S.music.name.replace(/[^a-zA-Z0-9_-]/g, "_") || "soundtrack") + ".mp3");
            closeAudioToolsModal();
            toast("💾 Audio saved to device!");
          }).catch(function () {
            var a = document.createElement("a");
            a.href = S.music.url;
            a.download = (S.music.name || "soundtrack") + ".mp3";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            closeAudioToolsModal();
            toast("💾 Audio downloaded to device!");
          });
        } else if (el.vid.src) {
          fetch(el.vid.src).then(function (r) { return r.blob(); }).then(function (blob) {
            downloadBlob(blob, "video_soundtrack.webm");
            closeAudioToolsModal();
            toast("💾 Video audio saved to device!");
          }).catch(function () {
            toast("Unable to export video audio directly");
          });
        } else {
          toast("No audio or video found in project to export");
        }
      });
    }
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
      if (s.kind === "emoji") {
        ctx.save();
        ctx.font = fs + "px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.ch, s.x * W, s.y * H);
        ctx.restore();
      } else if (s.img && s.img.complete && s.img.naturalWidth) {
        var w = fs, h = fs / (s.ar || 1);
        ctx.save();
        ctx.drawImage(s.img, s.x * W - w / 2, s.y * H - h / 2, w, h);
        ctx.restore();
      }
    });
  }

  /* ---------------- EXPORT (Images & Videos) ---------------- */
  function exportImage() {
    return preloadAllStickerImages().then(function () {
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
    return preloadAllStickerImages().then(function () {
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
        if (!file) return;
        var cat = category || window.currentVeCategory || "reel";
        // POINT 8: Any video <= 3 minutes opens the Reel editor directly.
        // Videos longer than 3 minutes first show the YouTube-style preview
        // screen ("Edit into a Reel" + "Next") before any editor is opened.
        if (typeof window.probeVideoDuration === "function") {
          window.probeVideoDuration(file, function (dur) {
            if (dur > 180 && typeof window.showReelPreview === "function") {
              window.showReelPreview(file, cat);
            } else {
              openEditor(file, "video", "reel");
            }
          });
        } else {
          openEditor(file, "video", "reel");
        }
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
