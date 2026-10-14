# Zyro Editor v2 — YouTube Shorts–style Media Editor

A drop-in, full-screen media editor that matches the **YouTube Shorts upload flow**.
Two files, zero dependencies, works offline. Add them to your app and every photo/video
upload opens the new editor.

---

## 1. What's new in v2

| Area | v1 | v2 (this build) |
|------|----|-----------------|
| Layout | Small boxed preview | **Full-screen media preview** (reel fills the screen) |
| Tools | Bottom tabs | **Right-side vertical rail**: Text · Effects · Filters · Stickers · Captions · More |
| Sound | — | **Top-center "Add sound"** + **volume / mute control** beside it |
| Actions | — | **Bottom: "Edit" (left) + "Next" (right)** |
| Trim/Cut | — | **Tap "Edit" → timeline editor** with scrubber, thumbnails, **Split**, **Delete**, trim handles, duration |

Everything else from v1 (filters, effects, text, stickers, aspect, export) is retained.

---

## 2. Install (2 steps)

1. Copy `zyro-editor.css` and `zyro-editor.js` into your app folder (next to `index.html`).
2. Add these two lines to `index.html`:

```html
<!-- in <head>, after your own styles -->
<link rel="stylesheet" href="zyro-editor.css">

<!-- just before </body>, AFTER your existing upload handlers are defined -->
<script src="zyro-editor.js"></script>
```

That's it. The script auto-detects your existing functions and wraps them:

* `window.handleVideoSelectedForEditor(file, category)` → opens the editor in **video** mode.
* `window.handlePostMediaSelected(file)` → opens the editor in **image** or **video** mode
  (auto-detected from the file type).

When the user taps **Next**, the rendered file is handed back to your original function
(so your existing publish/upload flow continues unchanged).

> The script only wraps a handler **once** and never overwrites your code. If a handler
> doesn't exist yet, the editor simply stays dormant until it does.

---

## 3. Manual control (optional)

```js
// Open the editor directly
window.zyroOpenEditor(file, "image" | "video", "photo" | "reel" | "story");

// Inspect live state (filters, texts, segments, volume …)
console.log(window.zyroEditorState);
```

---

## 4. Feature map

**Right rail**
* **Text** — add / edit / drag overlays; colour, font, weight, background styles.
* **Effects** — vignette, grain, glow, light-leak, blur (each with intensity).
* **Filters** — 12 presets with live thumbnails (Original, Vivid, Warm, Cool, Mono,
  Sepia, Vintage, Cinema, Fade, Noir, Retro, Dreamy).
* **Stickers** — 24 emoji stickers, drag to place.
* **Captions** — 4 caption styles (classic / bold / highlight / outline).
* **More** — Adjust (brightness, contrast, saturation, warmth, fade), Transform
  (rotate 90°, flip H/V, reset), Aspect ratio (Original, 1:1, 4:3, 9:16, 16:9, 3:4).

**Top bar**
* **Add sound** — pick music from the device; volume slider + mute.
* **Volume / mute** icon — quick toggle.

**Bottom bar**
* **Edit** — video → opens the timeline; image → opens the More panel.
* **Next** — renders the edit and hands the file back to your app.

**Timeline (video)**
* Thumbnail strip with draggable **trim handles** (start / end).
* **Split** at the playhead, **Delete** the selected clip, **Volume / Add audio / Mute**.
* Live duration read-out (`0:00 / 0:10`).

---

## 5. Export details

* **Images** → baked to **JPEG** via a 2D canvas (filters, effects, text, stickers).
* **Videos** → recorded with **MediaRecorder** (WebM / VP9 + Opus) from a canvas
  `captureStream()`. Audio from the clip **and** any added music is mixed through the
  Web Audio API. A WebM duration patch fixes the "Infinity" duration bug in some players.
* Trimming is respected on export — only the kept segments are recorded.

---

## 6. Browser support

Chrome / Edge / Android Chrome (recommended), Safari 14+, Firefox.
`MediaRecorder` + `captureStream` are required for video export; image export works everywhere.

---

## 7. Files

```
zyro-editor.css   – all styles (scoped with the .ze- prefix)
zyro-editor.js    – the editor engine (IIFE, exposes window.zyroOpenEditor)
```
