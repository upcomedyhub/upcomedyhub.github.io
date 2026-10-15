# Zyro / UPComedyHub — Improvement Points (User Requests)

> Status: COLLECTING POINTS (build not started yet)
> Repo: upcomedyhub/upcomedyhub.github.io (branch: main)

---

## POINT 1 — Remove YouTube link from everyone's profile
**Status:** NOTED ✅ (pending build)

**What user wants:**
- In every user's profile, the external link "youtube.com/@up_comedyhub" (shown with a 🔗 chain icon under the bio) should be REMOVED.

**Where in code (found):**
- `index.html` line ~4189-4191: static HTML element
  - `<a id="profileBioLink" class="ig-bio-link" href="https://youtube.com/@up_comedyhub" ...>`
  - `<span id="profileBioLinkText">youtube.com/@up_comedyhub</span>`
- `index.html` line ~8633-8634: JS that sets it dynamically
  - `bioLinkEl.href = "https://youtube.com/@up_comedyhub";`
  - `bioLinkText.textContent = "youtube.com/@up_comedyhub";`
- Related CSS: `.ig-bio-link` at line ~1334-1336

**Note:** This is the profile bio link. Need to hide/remove it so it does NOT show on any profile.
(Confirm during build: remove entirely, or only hide when empty?)

---

## POINT 2 — Editor: Replace "More" with single "Save to Device" SVG button; move Adjust/Ratio/Transform into Edit Timeline
**Status:** NOTED ✅ (pending build)

**What user wants:**
- Currently the editor has a "More" option in the side rail. Tapping it opens a "More Options" sheet containing:
  1. Save to Device / Gallery (hero card + download button)
  2. Fine Adjustments (Brightness, Contrast, Saturation, Warmth, Fade)
  3. Transform (Rotate 90°, Flip H, Flip V, Reset)
  4. Aspect Ratio (Original, 9:16, 1:1, 4:5, 16:9)
- CHANGE: Replace the "More" option with ONLY a single "Save to Device" SVG button (like YouTube's download button).
- The Adjust, Ratio, Transform options should be MOVED INTO the "Edit Timeline" editor, shown as SVG buttons (in the timeline tools row).

**Where in code (found):**
- `zyro-editor.js` line ~152: `railBtn()` helper
- `zyro-editor.js` line ~172-178: rail buttons list — includes `railBtn("more", "More", ...)` (the "More" 3-dot button)
- `zyro-editor.js` line ~1122-1265: `renderMoreSheet()` — the whole "More Options" sheet (Save card + Adjust + Transform + Aspect Ratio)
- `zyro-editor.js` line ~1654-1664: `el.tlTools.innerHTML = ...` — timeline tools row (Split, Speed, Voiceover, Import Audio, Audio Tools, Music, Delete, Duplicate, Flip, Add Clip)
- `zyro-editor.js` line ~1702: `tlTool()` helper
- `zyro-editor.js` line ~1750: `onTlTool(tool)` handler
- `zyro-editor.js` line ~770: `openSheet(name)` / `renderSheet()` dispatcher (line ~791)
- `zyro-editor.js` line ~1200: `saveMediaToDevice()` function (reuse for the new Save button)
- CSS: `.ze-rail-btn`, `.ze-save-device-card`, `.ze-save-download-btn`, `.ze-tl-tool` in zyro-editor.css

**Plan (during build):**
- Replace rail "More" button with a "Save" button (download SVG icon, YouTube-style) that directly triggers `saveMediaToDevice()`.
- Add 3 new SVG tool buttons into the timeline tools row: "Adjust", "Ratio", "Transform".
- Wire them to open the corresponding panels/sheets (Adjust sliders, Aspect Ratio chips, Transform chips) — either as sheets or inline timeline panels.
- Remove the Save-to-Device card from the (now removed) More sheet.

---

## POINT 3 — Instagram-style drag-to-delete: drag text/sticker to bottom → red delete SVG button → drop to delete
**Status:** NOTED ✅ (pending build)

**What user wants:**
- When a text, overlay, or sticker is added anywhere on screen, the user can HOLD and DRAG it downward.
- While dragging toward the bottom, a RED DELETE button (trash SVG icon) should appear (like Instagram).
- If the user drops the item onto that red delete button, the text/sticker/overlay gets DELETED.
- Behavior should feel exactly like Instagram's drag-to-trash.

**Where in code (found):**
- `zyro-editor.js` line ~633-770: DRAG ENGINE (Pointer + Touch)
  - `initDragHandling()` (~636): attaches pointerdown/move/up + touch handlers
  - `onPointerDown(e)` (~648): picks up `.ze-text-item` / `.ze-sticker-item`, sets `drag = {id, rect, sticker, pointerId}`
  - `onPointerMove(e)` (~690): moves text/sticker by updating `t.x/t.y` or `s.x/s.y`
  - `onPointerUp()` (~716): ends drag
  - `onTouchStart/onTouchMove/onTouchEnd` (~723-766): touch fallback versions
- Text items rendered in `el.textLayer` (`.ze-text-item`, `data-id`), stickers in `el.stickerLayer` (`.ze-sticker-item`, `data-id`)
- `S.texts[]` array (text objects), `S.stickers[]` array (sticker objects)
- Existing delete buttons: `#zeDelTextBtn` (~869) in text sheet; timeline `delete` tool (~1661)

**Plan (during build):**
- Add a hidden red "trash zone" element (`.ze-trash-zone` with trash SVG) inside the editor overlay, near the bottom.
- In `onPointerMove` / `onTouchMove`: when the dragged item's Y goes below a threshold (near bottom), show the trash zone (add `.show` class) and highlight it when hovering over it.
- In `onPointerUp` / `onTouchEnd`: if the drop position is inside the trash zone, remove the item from `S.texts` or `S.stickers`, re-render, and hide the trash zone.
- Hide trash zone on drag end regardless.
- Add CSS for `.ze-trash-zone` (red circle, trash icon, scale-in animation) in zyro-editor.css.

---

## POINT 4 — Change ONLY the bottom-nav SVG icons to match the second screenshot (nothing else)
**Status:** NOTED ✅ (pending build) — CORRECTED
**Correction:** User clarified — do NOT redesign the whole reels section. ONLY make the bottom navigation icons look like the second photo's SVG icons. Nothing else should change.

**What user wants:**
- Replace/update ONLY the bottom navigation bar icons (Home, Reels, Create, Fun Zone, Profile) so they match the SVG icons in the second screenshot.
- No layout change, no full-screen redesign, no other section touched.

**Where in code (found):**
- `index.html` line ~6384-6391: `<nav class="bottom-nav" id="bottomNav">` with 5 buttons:
  - Home: `<use href="#i-home">`
  - Reels: `<use href="#i-reels-clapper">` (class `nav-reels-btn`)
  - Create: `.nav-create-btn` with `.nav-create-pill` + inline plus SVG (`#createUploadBtn`)
  - Fun Zone: `<use href="#i-gamepad">` (`#funZoneNavBtn`)
  - Profile: `<use href="#i-user">`
- SVG symbol defs: `#i-home` (~3555), `#i-reels-clapper` (~3559), `#i-reels` (~3571), `#i-user` (~3580), `#i-gamepad` (~3582)
- CSS: `.bottom-nav button.nav-create-btn` (~1038), `.nav-create-pill` (~1045), `.nav-reels-btn` (~898-1035)

**Plan (during build):**
- Update the SVG symbols / inline SVGs for the 5 bottom-nav icons so they visually match the second screenshot's icons (outline style).
- Create button: match the red/orange gradient rounded-square look from screenshot 2.
- Touch nothing else in the reels section.

---

## POINT 5 — Remove "CapCut" branding + make clean/professional SVG buttons + convert ALL emoji buttons to SVG buttons
**Status:** NOTED ✅ (pending build)

**What user wants:**
1. In Edit Timeline → Audio, the panel titled "Audio Options (CapCut)" — REMOVE the "CapCut" mention. Make it clean & professional.
2. In that Audio panel, the emoji icons (📱 phone, 🎬 clapperboard, 💾 floppy) should become clean, professional SVG buttons.
3. Throughout the app, ALL emoji buttons should be replaced with SVG buttons. (Only the buttons — not other text/emoji in body content.)

**Where in code (found):**
- `zyro-editor.js` line ~244-266: Audio Tools panel (`#zeAudioToolsOverlay`)
  - line ~248: `<span>Audio Options (CapCut)</span>` → remove "(CapCut)"
  - line ~253: `<div class="ze-at-icon">📱</div>` (Extract Audio from Device Video)
  - line ~257: `<div class="ze-at-icon">🎬</div>` (Extract Current Video Audio)
  - line ~261: `<div class="ze-at-icon">💾</div>` (Export Audio to Device)
- `zyro-editor.js` line ~217, 220, 244: HTML comments mention "CapCut" (cosmetic, can clean)
- `zyro-editor.js` line ~1653, 1763, 1790, 2053: JS comments mention CapCut (cosmetic)
- `zyro-editor.css` line ~518, 573: CSS comments mention CapCut (cosmetic)
- Emoji buttons found (examples):
  - `zyro-editor.js` ~238-240: `🔄 Retake`, `✓ Add to Timeline`, `💾 Save`
  - `zyro-editor.js` ~841: `➕ Add Text`; ~868: `📋 Duplicate`; ~869: `🗑️ Delete`; ~872: `➕ Add Another Text`
  - `zyro-editor.js` ~1072: `➕ Add Custom Caption`
  - `zyro-editor.js` ~1293-1299: sound tabs `🔥 Trending`, `😂 Comedy & Story`, `🎬 Bollywood`, `⚡ Punjabi`, `🎶 Desi Hits`, `🎧 Lo-Fi`, `💥 Memes`
  - `index.html`: ~2022 emoji total; **~153 buttons contain emoji** (need to convert those buttons' emoji → SVG). Examples: `Got It 👍`, `✓ Mark all read`, `🗑️ Clear old`, `📋 Copy`, `🔗 Copy Website Link`, `🚀 Send Enquiry`, `💳 Pay ₹100 via UPI`, arcade pills (`🌟 All Games`, `🔥 Trending`, `🏏 Sports`, `🎲 Board`, `🧘 Antistress`, `🍉 Action`, `🤖 AI Games`), admin buttons (`🔄 Refresh Stats`, `💾 Save ...`), etc.
- `.ze-at-icon` CSS at zyro-editor.css ~595

**Plan (during build):**
- Remove "(CapCut)" from the Audio panel title → e.g. "Audio Options".
- Replace the 3 emoji icons in the audio cards with clean SVG icons (phone, film/clapper, download).
- Sweep the app for emoji used INSIDE buttons and replace each with a matching inline SVG icon.
- Keep button labels/text; only swap the emoji glyph for an SVG icon.
- Add any needed CSS for consistent SVG sizing in buttons.

---

## POINT 6 — Make "Add Music" professional & clean (YouTube/Instagram style) + open FULL-SCREEN picker with a Back button
**Status:** NOTED ✅ (pending build)

**What user wants:**
- The "Add Music" / sound picker should look professional & clean like YouTube/Instagram music pickers.
- When the user taps "Add sound" / "Add Music", it should open as a FULL-SCREEN music picker (not a small bottom sheet).
- The full-screen picker must have a BACK button (to close/return).

**Where in code (found):**
- `zyro-editor.js` line ~1266-1364: `renderSoundSheet()` — builds the sound picker (current music card, search bar, genre tabs, song list). Currently rendered inside the bottom `.ze-sheet`.
- `zyro-editor.js` line ~1366-1384: `loadSoundCategory(cat)`
- `zyro-editor.js` line ~1386-1420: `fetchItunesSounds(term)` (uses iTunes search API)
- `zyro-editor.js` line ~1428-1520: `renderSoundList(items)` — renders each song row (play button, icon, title/artist, + Use button)
- `zyro-editor.js` line ~770: `openSheet(name)` — sound opened via `openSheet("sound")` (from `#zeSoundBtn` ~line 168, and timeline audio lane)
- `zyro-editor.js` line ~168: top bar `#zeSoundBtn` ("Add sound")
- CSS: `.ze-sheet` (~178-196), `.ze-sound` (~115-124), `.ze-sound-tabs` (~320), `.ze-sound-list` (~327), `.ze-sound-row` (~328-333), `.ze-sound-ic` (~334), `.ze-sound-use-btn` (~347), `.ze-cur-music-card` (~500), `.ze-search-wrap` (~512)

**Plan (during build):**
- Create a dedicated FULL-SCREEN music picker overlay (`.ze-music-fullscreen`) with:
  - Top bar: Back button (left) + title "Add Music" + optional create/search
  - Search bar, genre tabs, clean song list (album art, title, artist, duration, save/use)
  - YouTube/Instagram-style clean dark UI
- Wire `#zeSoundBtn` (and timeline audio lane) to open this full-screen picker instead of the bottom sheet.
- Keep the same logic (loadSoundCategory, fetchItunesSounds, renderSoundList) but render into the full-screen container.
- Add a Back button that closes the full-screen picker.
- Add CSS for the full-screen layout.

---

## POINT 7 — Speaker icon next to "Add sound" should control BOTH video audio AND added music (YouTube-style volume)
**Status:** NOTED ✅ (pending build)

**What user wants:**
- The speaker/volume icon (`#zeVolBtn`) next to "Add sound" currently only mutes the video's audio.
- Now it should control the sound of BOTH the video AND the added music together — like YouTube's volume control.
- (Implies a proper volume control/slider affecting both tracks, not just a video mute toggle.)

**Where in code (found):**
- `zyro-editor.js` line ~173: `#zeVolBtn` speaker button HTML
- `zyro-editor.js` line ~337: `el.volBtn.addEventListener("click", toggleMute)`
- `zyro-editor.js` line ~1517-1523: `toggleMute()` — currently: `S.muted = !S.muted; el.vid.muted = S.muted; ... if (S.music && S.music.el) S.music.el.muted = S.muted;`
- `zyro-editor.js` line ~52: `musicVol: 0.8`; line ~474: reset
- `zyro-editor.js` line ~1312-1313: music volume slider (`zeMusicVol`) sets `S.musicVol` and `S.music.el.volume`
- `zyro-editor.js` line ~423: `el.vid.muted = S.muted` (on load)

**Plan (during build):**
- Upgrade the speaker button into a YouTube-style volume control that adjusts BOTH the video volume and the music volume together (e.g. a volume slider popover on tap, plus mute toggle).
- Ensure changing volume updates `el.vid.volume` and `S.music.el.volume` proportionally.
- Keep mute behavior but make it a master mute for both tracks.

---

## POINT 8 — Video tab upload: YouTube-style "Edit into a Reel" flow + 3-minute rule
**Status:** NOTED ✅ (pending build)

**What user wants:**
- Currently, choosing the "Video" option opens the editor directly. User wants a YouTube-style upload flow instead.
- Reference (screenshot): YouTube shows a video preview screen with "**Edit into a Short**" (left) + "**Next**" (right).
- CHANGE: In our app it should say "**Edit into a Reel**" (not "Short"). Tapping "Edit into a Reel" → the REEL editor opens.
- VIDEO-TAB upload rule (duration-based):
  1. If the selected video is **UNDER 3 minutes** → open it **directly in the REEL section / reel editor**.
  2. If the selected video is **OVER 3 minutes** → open in the **Video tab** flow, showing the preview screen with "**Edit into a Reel**" + "**Next**".
  3. If video is **over 3 minutes and user taps "Next"** → the editor should **NOT open** (go straight to details/publish, like YouTube).

**Where in code (found):**
- `index.html` line ~5719-5760: `#createActionSheetOverlay` — create sheet with 5 options:
  - Reel → `triggerVideoFilePicker('reel')`
  - Video → `triggerVideoFilePicker('video')`
  - Post / Story / Go Live
- `index.html` line ~9724: `triggerVideoFilePicker(category)` — sets `currentVeCategory`, opens native file picker.
- `index.html` line ~9734: `handleVideoSelectedForEditor(file, category)` — **opens the video editor modal (`#videoEditorModal`) for BOTH reel & video**. Reads `player.duration` inside `player.onloadedmetadata`. **This is where the 3-minute check + routing must be added.**
- `index.html` line ~9858: `setVeCategory(cat)` — toggles Reel/Video chips + header title.
- `index.html` line ~5938: `#videoEditorModal` (video preview/editor overlay).
- `index.html` line ~6043-6044: category chips `#veCategoryReelBtn` ("Reel / Shorts (9:16)") / `#veCategoryVideoBtn` ("Video (16:9 / Long)").
- `index.html` line ~10167: `handlePostMediaSelected()` also routes chosen videos into the editor.
- `index.html` line ~10140-10161: `startVideoPublishWorkflow()` (publish + switch to reels/videos tab).

**Note / uncertainty:**
- grep for "Edit into a Short" / "Edit into a reel" / "into a short" returned **NO results** → this YouTube-style preview screen does **NOT exist yet** in the code. It must be **built new** (a small preview screen with "Edit into a Reel" + "Next" buttons), OR the exact wording differs.
- The reel editor = the existing `zyro-editor.js` module (opened via `openCreatePostModal('reel')` / reel flow).

**Plan (during build):**
- Add a duration check in `handleVideoSelectedForEditor` (or a new pre-step):
  - Read video duration (already available via `player.duration`).
  - **≤ 3 min (180s):** force `currentVeCategory = "reel"` and open the reel editor directly.
  - **> 3 min:** show a new YouTube-style preview screen with "Edit into a Reel" + "Next".
    - "Edit into a Reel" → open the reel editor (force reel category).
    - "Next" → skip the editor, go to details/publish (no editor).
- Build the new preview screen (HTML + CSS + JS) matching the screenshot layout (video on top, two bottom buttons).
- Ensure the existing "Video" (16:9) path still works for long videos when appropriate.

---

## POINT 9 — Editor upgrades: IG/YT-style stickers + timeline Overlay SVG + text-layer timeline option
**Status:** NOTED ✅ (pending build)

**What user wants:**
- **9a:** Tapping "Stickers" in the editor currently shows only emojis. Replace with Instagram/YouTube-style stickers (proper sticker graphics/categories).
- **9b:** Add an "Overlay" function in the Edit Timeline as an SVG button.
- **9c:** Add a timeline option ABOVE text (a text-layer timeline row/track).
- Free upgrade: make the editor section clean, professional, and fully working; complete any unfinished ("adhure") editor functions and make them advanced.

**Where in code (found):**
- `zyro-editor.js` line ~55-140: `STICKERS` = array of 30 emojis (9a target).
- `zyro-editor.js` line ~1116-1135: `addSticker(emoji)` + `renderStickersSheet()` renders `.ze-sticker-btn` emoji grid (9a target).
- `zyro-editor.js` line ~560-635: `renderStickers()` renders `s.emoji` as text; `drawStickers()` (~2400-2520) draws `s.emoji` on export (9a export target).
- `zyro-editor.js` line ~1546-1700: `renderTimeline()` builds `#zeTlTools` with tools split/speed/voiceover/importaudio/exportaudio/sound/delete/dup/flip/addclip → **add Overlay (9b) + Adjust/Ratio/Transform (POINT 2)**.
- `zyro-editor.js` line ~560-635: `updateTimelineTextBlocks()` renders `#zeTlTextLane` (9c area).
- `zyro-editor.css`: `.ze-sticker-grid/.ze-sticker-btn`, `.ze-tl-*` (timeline) classes.

**Plan (during build):**
- 9a: Build a sticker system with real SVG/graphic stickers (categories: Emoji, Shapes, Arrows, Badges, Speech, etc.) — render as inline SVG so they export correctly on canvas.
- 9b: Add an "Overlay" tool button (SVG icon) to `#zeTlTools` that opens an overlay picker (shapes/frames/graphics placed on the video).
- 9c: Add a dedicated text-layer timeline row above the main track (already partly present via `#zeTlTextLane`) — make it a proper selectable/movable row.

---
