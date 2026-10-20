import math
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ---------------------------------------------------------
# 1. REMOVE FOOTER & 2 FLOATING BUTTONS (LINK & WHATSAPP/CHAT)
# ---------------------------------------------------------
# Remove <footer class="channel-footer">...</footer>
html = re.sub(
    r'<footer class="channel-footer">.*?</footer>',
    '',
    html,
    flags=re.DOTALL
)

# Remove <div class="quick-actions" id="quickActions">...</div>
html = re.sub(
    r'<div class="quick-actions" id="quickActions">.*?</div>\s*<button id="quickActionsToggle".*?</button>\s*</div>',
    '',
    html,
    flags=re.DOTALL
)

# Remove <a class="share-float" ...>...</a>
html = re.sub(
    r'<a class="share-float"[^>]*>.*?</a>',
    '',
    html,
    flags=re.DOTALL
)

# Also hide via CSS just in case any dynamic script recreates them
hide_floating_css = '''
/* Hide removed footer & floating buttons */
.channel-footer, .quick-actions, #quickActions, .share-float { display: none !important; }
'''

# ---------------------------------------------------------
# 2. GENERATE SMOOTH 10-LOBED 3D ZYRO VERIFIED BLUE TICK & COBRA VERIFIED SHIELD SVGS
# ---------------------------------------------------------
def make_scalloped_path(cx, cy, r_base, amp, lobes=10, steps=120):
    pts = []
    for i in range(steps):
        theta = (2 * math.pi * i) / steps - (math.pi / 2)
        r = r_base + amp * math.cos(lobes * (theta + math.pi / 2))
        x = cx + r * math.cos(theta)
        y = cy + r * math.sin(theta)
        pts.append((round(x, 2), round(y, 2)))
    d = f"M {pts[0][0]} {pts[0][1]} "
    for p in pts[1:]:
        d += f"L {p[0]} {p[1]} "
    d += "Z"
    return d

outer_rosette = make_scalloped_path(12, 12, 10.35, 1.15, lobes=10, steps=120)
inner_rosette = make_scalloped_path(12, 12, 9.15, 0.92, lobes=10, steps=120)

new_verified_symbols = f'''<symbol id="i-verified-blue" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="zyroBlueRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67E8F9"/>
      <stop offset="45%" stop-color="#00A6FF"/>
      <stop offset="100%" stop-color="#0044DD"/>
    </linearGradient>
    <linearGradient id="zyroBlueCore" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#0088FF"/>
      <stop offset="100%" stop-color="#0051FF"/>
    </linearGradient>
    <linearGradient id="zyroCheckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E0F2FE"/>
    </linearGradient>
  </defs>
  <!-- 3D Outer Beveled 10-Lobe Rosette Seal (Zyro Verified) -->
  <path fill="url(#zyroBlueRim)" d="{outer_rosette}"/>
  <!-- 3D Inner Cushioned Rosette Core -->
  <path fill="url(#zyroBlueCore)" d="{inner_rosette}"/>
  <!-- Subtle Top-Left 3D Specular Highlight -->
  <path fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="0.65" stroke-linecap="round" d="M 6.5 6.8 A 7.8 7.8 0 0 1 16.8 5.8"/>
  <!-- Crisp 3D Drop Shadow for Checkmark -->
  <path fill="rgba(0,30,110,0.28)" d="M 10.35 16.55 L 6.35 12.55 C 5.95 12.15 5.95 11.55 6.35 11.15 L 7.25 10.25 C 7.65 9.85 8.25 9.85 8.65 10.25 L 11.05 12.65 L 15.85 7.85 C 16.25 7.45 16.85 7.45 17.25 7.85 L 18.15 8.75 C 18.55 9.15 18.55 9.75 18.15 10.15 L 11.75 16.55 C 11.35 16.95 10.75 16.95 10.35 16.55 Z"/>
  <!-- Bold 3D White Checkmark -->
  <path fill="url(#zyroCheckGrad)" d="M 10.2 16.1 L 6.3 12.2 C 5.95 11.85 5.95 11.3 6.3 10.95 L 7.2 10.05 C 7.55 9.7 8.1 9.7 8.45 10.05 L 10.85 12.45 L 15.65 7.65 C 16.0 7.3 16.55 7.3 16.9 7.65 L 17.8 8.55 C 18.15 8.9 18.15 9.45 17.8 9.8 L 11.5 16.1 C 11.15 16.45 10.55 16.45 10.2 16.1 Z"/>
</symbol>
<symbol id="i-verified-cobra" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="cobraShieldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF"/>
      <stop offset="45%" stop-color="#3B82F6"/>
      <stop offset="75%" stop-color="#D946EF"/>
      <stop offset="100%" stop-color="#FF2E93"/>
    </linearGradient>
    <linearGradient id="cobraShieldCore" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#0B132B"/>
      <stop offset="60%" stop-color="#110B29"/>
      <stop offset="100%" stop-color="#1F0826"/>
    </linearGradient>
    <linearGradient id="cobraScaleCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67E8F9"/>
      <stop offset="50%" stop-color="#00D2FF"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="cobraPinkGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF2E93"/>
      <stop offset="100%" stop-color="#9333EA"/>
    </linearGradient>
  </defs>
  <!-- Outer Beveled Cyber Shield -->
  <path fill="url(#cobraShieldRim)" d="M12 1.2 L20.8 4.6 L21.4 11.6 C21.4 16.8 17.5 20.6 12 22.9 C6.5 20.6 2.6 16.8 2.6 11.6 L3.2 4.6 Z"/>
  <!-- Inner Dark Obsidian Shield Core -->
  <path fill="url(#cobraShieldCore)" d="M12 2.5 L19.5 5.4 L20.0 11.4 C20.0 15.9 16.6 19.3 12 21.4 C7.4 19.3 4.0 15.9 4.0 11.4 L4.5 5.4 Z"/>
  <!-- Inner Neon Magenta Side Highlights -->
  <path fill="none" stroke="url(#cobraPinkGlow)" stroke-width="0.85" d="M4.8 6.2 L4.4 11.4 C4.4 15.2 7.2 18.2 12 20.3 C16.8 18.2 19.6 15.2 19.6 11.4 L19.2 6.2"/>
  <!-- Cobra Spread Hood (Magenta & Cyan Armor) -->
  <path fill="url(#cobraPinkGlow)" d="M12 4.2 C7.2 4.2 4.8 7.5 5.2 11.5 C5.5 14.0 7.6 15.8 9.4 16.6 L12 18.2 L14.6 16.6 C16.4 15.8 18.5 14.0 18.8 11.5 C19.2 7.5 16.8 4.2 12 4.2 Z"/>
  <path fill="url(#cobraScaleCyan)" d="M12 3.6 L9.5 2.7 L10.1 4.6 C7.2 5.2 5.7 7.6 6.1 10.9 C6.4 12.9 8.0 14.4 9.5 15.2 L10.3 13.2 L8.5 11.5 L9.8 7.2 L12 6.2 L14.2 7.2 L15.5 11.5 L13.7 13.2 L14.5 15.2 C16.0 14.4 17.6 12.9 17.9 10.9 C18.3 7.6 16.8 5.2 13.9 4.6 L14.5 2.7 Z"/>
  <!-- Cobra Armored Crown & Head -->
  <path fill="url(#cobraScaleCyan)" d="M12 5.0 L8.8 6.8 L8.2 10.4 L10.2 13.5 L12 14.4 L13.8 13.5 L15.8 10.4 L15.2 6.8 Z"/>
  <!-- Fierce Glowing Gold-Orange Eyes -->
  <polygon fill="#FFB800" points="9.2,9.3 11.2,10.2 9.7,10.7"/>
  <polygon fill="#FFB800" points="14.8,9.3 12.8,10.2 14.3,10.7"/>
  <!-- Open Mouth & White Fangs -->
  <path fill="#FF1493" d="M10.3 12.8 L12 11.9 L13.7 12.8 L12.9 15.3 L12 16.0 L11.1 15.3 Z"/>
  <polygon fill="#FFFFFF" points="10.6,12.9 11.1,12.9 10.85,14.4"/>
  <polygon fill="#FFFFFF" points="13.4,12.9 12.9,12.9 13.15,14.4"/>
  <!-- Glowing Cyan V-Chevron at Shield Base -->
  <path fill="#00F0FF" d="M8.8 16.5 L12 19.7 L15.2 16.5 L14.1 15.7 L12 17.8 L9.9 15.7 Z"/>
</symbol>
<symbol id="i-verified-gold" viewBox="0 0 24 24">
  <use href="#i-verified-blue"></use>
</symbol>'''

html = re.sub(
    r'<symbol id="i-verified-blue" viewBox="0 0 24 24">.*?</symbol>\s*<symbol id="i-verified-gold" viewBox="0 0 24 24">.*?</symbol>',
    new_verified_symbols,
    html,
    flags=re.DOTALL
)

# ---------------------------------------------------------
# 3. ADD CSS FOR ZYRO VERIFIED & COBRA VERIFIED BADGES & PILLS
# ---------------------------------------------------------
badge_extra_css = hide_floating_css + '''
/* Zyro Verified & Cobra Verified Badge Styles */
.verified-badge-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  margin-left: 5px;
  gap: 4px;
  flex-shrink: 0;
  line-height: 1;
}
.verified-badge-wrap svg {
  display: block;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 4px rgba(0, 149, 246, 0.45));
  transition: transform 0.2s ease, filter 0.2s ease;
}
.verified-badge-wrap.cobra-verified svg {
  filter: drop-shadow(0 1px 6px rgba(0, 240, 255, 0.55)) drop-shadow(0 0 8px rgba(217, 70, 239, 0.35));
}
.verified-badge-wrap:hover svg {
  transform: scale(1.12);
}
.cobra-verified-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.14), rgba(217, 70, 239, 0.14));
  border: 1px solid rgba(0, 229, 255, 0.45);
  color: #0095F6;
  font-size: 11.5px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
  margin-top: 4px;
  margin-bottom: 4px;
  box-shadow: 0 2px 10px rgba(0, 212, 255, 0.12);
}
.dark-mode .cobra-verified-tag {
  color: #38bdf8;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.18), rgba(217, 70, 239, 0.18));
}
</style>'''

html = html.replace('</style>', badge_extra_css, 1)

# ---------------------------------------------------------
# 4. UPDATE PROFILE IDENTITY BLOCK TO INCLUDE COBRA VERIFIED TAG SLOT
# ---------------------------------------------------------
old_name_block = '<div class="ig-name-block">\n        <div id="userName" class="ig-name">User</div>'
new_name_block = '''<div class="ig-name-block">
        <div id="userName" class="ig-name">User</div>
        <div id="profileCobraTagSlot" style="display:none">
          <span class="cobra-verified-tag">
            <svg viewBox="0 0 24 24" style="width:14px;height:14px"><use href="#i-verified-cobra"></use></svg>
            <span>Cobra Verified</span>
          </span>
        </div>'''
if old_name_block in html:
    html = html.replace(old_name_block, new_name_block, 1)

# Update Settings Row label to show "Zyro & Cobra Verification"
html = html.replace(
    '<span class="snr-label" style="font-weight:700">Cobra Verified</span>',
    '<span class="snr-label" style="font-weight:700">Zyro &amp; Cobra Verified</span>'
)

# ---------------------------------------------------------
# 5. UPDATE VERIFICATION MODAL HTML (ZYRO VERIFIED + COBRA VERIFIED GUIDE)
# ---------------------------------------------------------
new_verification_modal = '''<div class="verification-overlay" id="verificationModal">
  <div class="verification-modal">
    <div class="verification-modal-header">
      <div style="display:flex;align-items:center;gap:8px">
        <svg viewBox="0 0 24 24" style="width:24px;height:24px;flex-shrink:0"><use href="#i-verified-blue"></use></svg>
        <svg viewBox="0 0 24 24" style="width:24px;height:24px;flex-shrink:0"><use href="#i-verified-cobra"></use></svg>
        <span style="font-weight:900;font-size:16px">Zyro &amp; Cobra Verification</span>
      </div>
      <button type="button" class="likes-close" id="closeVerificationBtn" aria-label="Close" style="cursor:pointer;background:none;border:none;font-size:18px"><svg class="ico" style="width:18px;height:18px"><use href="#i-close"></use></svg></button>
    </div>

    <div class="verification-modal-body">
      <!-- Status Card if already verified -->
      <div id="verifiedActiveBanner" style="display:none;background:linear-gradient(135deg,rgba(0,149,246,0.12),rgba(217,70,239,0.08));border:1.5px solid #0095F6;border-radius:16px;padding:14px;margin-bottom:16px;text-align:center">
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;font-weight:800;color:#0095F6;font-size:15px">
          <svg viewBox="0 0 24 24" style="width:22px;height:22px" id="activeVerifiedBannerIcon"><use href="#i-verified-blue"></use></svg>
          <span id="activeVerifiedPlanTitle">Your Account is Verified!</span>
        </div>
        <p id="activeVerifiedDetails" style="font-size:12px;color:#888;margin:6px 0 0">Official badge active on your profile.</p>
      </div>

      <!-- Mode Selector Tabs: 1. Zyro Verified (Blue Tick) | 2. Cobra Verified (Admin Award) | 3. Public Figure -->
      <div style="display:flex;background:rgba(128,128,128,0.12);border-radius:12px;padding:4px;gap:4px;margin-bottom:16px">
        <button type="button" id="tabVerifyCreators" onclick="switchVerificationTab('creators')" class="ig-btn" style="flex:1;background:#fff;color:#111;border:none;box-shadow:0 2px 6px rgba(0,0,0,.08);font-weight:800;font-size:12px;padding:8px 6px;display:flex;align-items:center;justify-content:center;gap:5px">
          <svg viewBox="0 0 24 24" style="width:15px;height:15px;flex-shrink:0"><use href="#i-verified-blue"></use></svg>
          <span>Zyro Verified</span>
        </button>
        <button type="button" id="tabVerifyCobra" onclick="switchVerificationTab('cobra')" class="ig-btn" style="flex:1;background:transparent;border:none;font-weight:800;font-size:12px;padding:8px 6px;color:#888;display:flex;align-items:center;justify-content:center;gap:5px">
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;flex-shrink:0"><use href="#i-verified-cobra"></use></svg>
          <span>Cobra Verified</span>
        </button>
        <button type="button" id="tabVerifyCelebrity" onclick="switchVerificationTab('celebrity')" class="ig-btn" style="flex:1;background:transparent;border:none;font-weight:700;font-size:12px;padding:8px 6px;color:#888;display:flex;align-items:center;justify-content:center;gap:4px">
          <span>👑 Public Figure</span>
        </button>
      </div>

      <!-- Section 1: Zyro Verified (Paid Blue Tick Plans) -->
      <div id="verifyCreatorPlansSection">
        <div style="background:linear-gradient(135deg,#071326,#0c2340);border:1px solid rgba(0,180,255,0.3);border-radius:16px;padding:16px;margin-bottom:14px;color:#fff;text-align:center">
          <div style="display:flex;justify-content:center;align-items:center;gap:14px;margin-bottom:10px">
            <div style="text-align:center">
              <svg viewBox="0 0 24 24" style="width:54px;height:54px;filter:drop-shadow(0 0 12px rgba(0,166,255,0.6))"><use href="#i-verified-blue"></use></svg>
              <div style="font-size:10px;color:#93c5fd;margin-top:2px">64px</div>
            </div>
            <div style="text-align:center">
              <svg viewBox="0 0 24 24" style="width:32px;height:32px"><use href="#i-verified-blue"></use></svg>
              <div style="font-size:10px;color:#93c5fd;margin-top:2px">32px</div>
            </div>
            <div style="text-align:center">
              <svg viewBox="0 0 24 24" style="width:18px;height:18px"><use href="#i-verified-blue"></use></svg>
              <div style="font-size:10px;color:#93c5fd;margin-top:2px">16px</div>
            </div>
          </div>
          <div style="display:inline-block;background:rgba(0,149,246,0.22);border:1px solid rgba(0,180,255,0.45);color:#67e8f9;font-size:10.5px;font-weight:800;padding:2px 10px;border-radius:999px;margin-bottom:6px">Purchase Available</div>
          <h4 style="font-size:18px;font-weight:900;margin:0 0 4px;color:#fff">Zyro Verified (Blue Tick)</h4>
          <p style="font-size:12px;color:#94a3b8;margin:0">Standard verification for eligible users &amp; creators. Simple · Clean · Trusted.</p>
        </div>

        <div style="background:rgba(128,128,128,0.08);border:1px dashed #9a9a9a;border-radius:12px;padding:8px 12px;font-size:12px;color:#888;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px">
          <svg class="ico" style="width:14px;height:14px;flex-shrink:0"><use href="#i-flame"></use></svg>
          <span>Launch Offer: Pehle mahine special introductory price, iske baad agla renewal 2x hoga.</span>
        </div>

        <div class="verification-plans-grid">
          <!-- Plan 1: Starter -->
          <div class="verification-plan-card">
            <div class="plan-name"><span>Starter Creator</span></div>
            <div class="plan-price-wrap">
              <span class="plan-price">₹49</span>
              <span class="plan-period">/ 1st month</span>
              <div class="plan-renewal">Agla renewal: ₹98/month (2x)</div>
            </div>
            <ul class="plan-features">
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>Official Zyro Verified Blue Tick</span></li>
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>1.5x Algorithm Reach Push</span></li>
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>Badge on username, comments &amp; search</span></li>
            </ul>
            <button type="button" class="plan-action-btn" data-plan-id="creator_starter" data-plan-name="Zyro Verified Starter" data-price="49" data-renewal="98">
              <svg class="ico"><use href="#i-check"></use></svg>
              <span>Apply (₹49)</span>
            </button>
          </div>

          <!-- Plan 2: Pro (Featured) -->
          <div class="verification-plan-card featured">
            <span class="plan-popular-tag">POPULAR</span>
            <div class="plan-name"><span>Pro Creator</span></div>
            <div class="plan-price-wrap">
              <span class="plan-price">₹99</span>
              <span class="plan-period">/ 1st month</span>
              <div class="plan-renewal">Agla renewal: ₹198/month (2x)</div>
            </div>
            <ul class="plan-features">
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>Official Zyro Verified Blue Tick</span></li>
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>2.5x Algorithm Super Boost</span></li>
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>Suggested Creators priority</span></li>
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>HD Video upload support</span></li>
            </ul>
            <button type="button" class="plan-action-btn" data-plan-id="creator_pro" data-plan-name="Zyro Verified Pro" data-price="99" data-renewal="198" style="background:#0095F6;color:#fff">
              <svg class="ico"><use href="#i-rocket"></use></svg>
              <span>Apply (₹99)</span>
            </button>
          </div>

          <!-- Plan 3: Elite -->
          <div class="verification-plan-card">
            <div class="plan-name"><span>Elite VIP Creator</span></div>
            <div class="plan-price-wrap">
              <span class="plan-price">₹299</span>
              <span class="plan-period">/ 1st month</span>
              <div class="plan-renewal">Agla renewal: ₹598/month (2x)</div>
            </div>
            <ul class="plan-features">
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>Zyro Verified VIP Blue Tick</span></li>
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>5x Mega Viral Push on Explore</span></li>
              <li><svg class="ico"><use href="#i-check"></use></svg> <span>Top Priority Support &amp; Feature</span></li>
            </ul>
            <button type="button" class="plan-action-btn" data-plan-id="creator_elite" data-plan-name="Zyro Verified Elite VIP" data-price="299" data-renewal="598">
              <svg class="ico"><use href="#i-star"></use></svg>
              <span>Apply (₹299)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Section 2: Cobra Verified (Exclusive Admin Award Showcase) -->
      <div id="verifyCobraSection" style="display:none">
        <div style="background:linear-gradient(145deg,#060B19 0%,#0E1329 55%,#1A0B2E 100%);border:1.5px solid rgba(0,240,255,0.35);border-radius:18px;padding:18px;color:#fff;box-shadow:0 12px 32px rgba(0,0,0,0.45)">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:16px">
            <div style="flex-shrink:0;text-align:center;margin:0 auto">
              <svg viewBox="0 0 24 24" style="width:88px;height:88px;filter:drop-shadow(0 0 16px rgba(0,240,255,0.55)) drop-shadow(0 0 22px rgba(217,70,239,0.4))"><use href="#i-verified-cobra"></use></svg>
            </div>
            <div style="flex:1;min-width:200px">
              <div style="font-size:12px;font-weight:800;color:#93c5fd;letter-spacing:0.5px">UPComedyHub</div>
              <div style="font-size:24px;font-weight:900;background:linear-gradient(90deg,#00F0FF,#38BDF8,#D946EF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.15;margin:2px 0">Cobra Verified</div>
              <div style="font-size:12.5px;font-weight:700;color:#38bdf8;margin-bottom:8px">Trusted Creators &nbsp;|&nbsp; Admin Award</div>
              <p style="font-size:12px;color:#cbd5e1;line-height:1.5;margin:0">
                Cobra Verified ek exclusive badge hai jo un trusted creators ko diya jata hai jinhone community me apna positive impact, authenticity and consistency prove kiya hai.
              </p>
            </div>
          </div>

          <!-- 4 Pillars Row -->
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;padding:12px 8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:14px">
            <div>
              <div style="font-size:16px;color:#00F0FF">🛡️</div>
              <div style="font-size:10.5px;font-weight:700;color:#e2e8f0;margin-top:3px">Trust</div>
            </div>
            <div>
              <div style="font-size:16px;color:#00F0FF">⭐</div>
              <div style="font-size:10.5px;font-weight:700;color:#e2e8f0;margin-top:3px">Authenticity</div>
            </div>
            <div>
              <div style="font-size:16px;color:#00F0FF">👥</div>
              <div style="font-size:10.5px;font-weight:700;color:#e2e8f0;margin-top:3px">Community Impact</div>
            </div>
            <div>
              <div style="font-size:16px;color:#00F0FF">👑</div>
              <div style="font-size:10.5px;font-weight:700;color:#e2e8f0;margin-top:3px">Exclusive Recognition</div>
            </div>
          </div>

          <!-- Icon Preview Sizes -->
          <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(0,240,255,0.2);border-radius:12px;padding:12px;margin-bottom:14px">
            <div style="font-size:12px;font-weight:800;color:#fff;margin-bottom:10px">Icon Preview <span style="font-size:11px;color:#38bdf8;font-weight:600">(Different Sizes)</span></div>
            <div style="display:flex;align-items:flex-end;justify-content:space-around;gap:10px;text-align:center">
              <div>
                <svg viewBox="0 0 24 24" style="width:56px;height:56px"><use href="#i-verified-cobra"></use></svg>
                <div style="font-size:10px;color:#cbd5e1;font-weight:700;margin-top:4px">Large</div>
                <div style="font-size:9px;color:#64748b">(128px)</div>
              </div>
              <div>
                <svg viewBox="0 0 24 24" style="width:40px;height:40px"><use href="#i-verified-cobra"></use></svg>
                <div style="font-size:10px;color:#cbd5e1;font-weight:700;margin-top:4px">Medium</div>
                <div style="font-size:9px;color:#64748b">(64px)</div>
              </div>
              <div>
                <svg viewBox="0 0 24 24" style="width:26px;height:26px"><use href="#i-verified-cobra"></use></svg>
                <div style="font-size:10px;color:#cbd5e1;font-weight:700;margin-top:4px">Small</div>
                <div style="font-size:9px;color:#64748b">(32px)</div>
              </div>
              <div>
                <svg viewBox="0 0 24 24" style="width:18px;height:18px"><use href="#i-verified-cobra"></use></svg>
                <div style="font-size:10px;color:#cbd5e1;font-weight:700;margin-top:4px">Profile</div>
                <div style="font-size:9px;color:#64748b">(20px)</div>
              </div>
            </div>
          </div>

          <!-- How It Will Work (4 Steps) -->
          <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(217,70,239,0.25);border-radius:12px;padding:14px;margin-bottom:14px">
            <div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:10px">How It Will Work</div>
            <div style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;align-items:flex-start;gap:10px">
                <span style="width:22px;height:22px;border-radius:50%;background:rgba(0,149,246,0.25);border:1.5px solid #0095F6;color:#60a5fa;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</span>
                <div>
                  <div style="font-size:12px;font-weight:800;color:#fff">Admin Review</div>
                  <div style="font-size:11px;color:#94a3b8">Content, behaviour &amp; community contribution ke basis par.</div>
                </div>
              </div>
              <div style="display:flex;align-items:flex-start;gap:10px">
                <span style="width:22px;height:22px;border-radius:50%;background:rgba(168,85,247,0.25);border:1.5px solid #a855f7;color:#c084fc;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</span>
                <div>
                  <div style="font-size:12px;font-weight:800;color:#fff">Selected Creators</div>
                  <div style="font-size:11px;color:#94a3b8">Sirf trusted aur valuable creators ko admin se diya jayega.</div>
                </div>
              </div>
              <div style="display:flex;align-items:flex-start;gap:10px">
                <span style="width:22px;height:22px;border-radius:50%;background:rgba(6,182,212,0.25);border:1.5px solid #06b6d4;color:#22d3ee;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</span>
                <div>
                  <div style="font-size:12px;font-weight:800;color:#fff">Cannot Be Purchased</div>
                  <div style="font-size:11px;color:#94a3b8">Ye badge paise dekar directly nahi mil sakta.</div>
                </div>
              </div>
              <div style="display:flex;align-items:flex-start;gap:10px">
                <span style="width:22px;height:22px;border-radius:50%;background:rgba(244,63,94,0.25);border:1.5px solid #f43f5e;color:#fb7185;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">4</span>
                <div>
                  <div style="font-size:12px;font-weight:800;color:#fff">Can Be Revoked</div>
                  <div style="font-size:11px;color:#94a3b8">Misconduct ya rule violation par admin ise remove kar sakta hai.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comparison Box: Zyro Verified vs Cobra Verified -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;gap:12px">
              <svg viewBox="0 0 24 24" style="width:36px;height:36px;flex-shrink:0"><use href="#i-verified-blue"></use></svg>
              <div>
                <div style="display:flex;align-items:center;gap:6px">
                  <strong style="font-size:13px;color:#fff">Zyro Verified (Blue Tick)</strong>
                  <span style="font-size:9.5px;font-weight:800;background:rgba(0,149,246,0.25);color:#60a5fa;padding:2px 7px;border-radius:999px">Purchase Available</span>
                </div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">Standard verification for eligible users. Available through payment.</div>
              </div>
            </div>
            <div style="height:1px;background:rgba(255,255,255,0.08)"></div>
            <div style="display:flex;align-items:center;gap:12px">
              <svg viewBox="0 0 24 24" style="width:36px;height:36px;flex-shrink:0"><use href="#i-verified-cobra"></use></svg>
              <div>
                <div style="display:flex;align-items:center;gap:6px">
                  <strong style="font-size:13px;color:#fff">Cobra Verified</strong>
                  <span style="font-size:9.5px;font-weight:800;background:rgba(168,85,247,0.28);color:#c084fc;padding:2px 7px;border-radius:999px">Admin Only</span>
                </div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">Exclusive badge for trusted creators. Given by admin based on authenticity &amp; community value.</div>
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-top:12px;font-size:12px;font-weight:800;color:#38bdf8;font-style:italic">
            "Not Just a Badge — It's a Trust"
          </div>
        </div>
      </div>'''

# Replace in verificationModal from <div class="verification-overlay" id="verificationModal"> up to <!-- Section 2: Celebrity
html = re.sub(
    r'<div class="verification-overlay" id="verificationModal">.*?<!-- Section 2: Celebrity',
    new_verification_modal + '\n\n      <!-- Section 2: Celebrity',
    html,
    flags=re.DOTALL
)

# ---------------------------------------------------------
# 6. UPDATE ADMIN PANEL TIER SELECT & USER LIST CONTROLS
# ---------------------------------------------------------
old_admin_select = re.search(r'<select class="admin-input" id="adminVerifyTierSelect">.*?</select>', html, re.DOTALL)
new_admin_select = '''<select class="admin-input" id="adminVerifyTierSelect">
            <option value="zyro_blue" selected>Zyro Verified — Blue Tick (Standard)</option>
            <option value="cobra">Cobra Verified 🛡️ — Exclusive Admin Award</option>
            <option value="both">Zyro Blue Tick + Cobra Verified (Both Badges)</option>
            <option value="celebrity_free">Zyro Verified — Public Figure (100% Free)</option>
            <option value="creator_starter">Zyro Verified — Starter Creator (₹49/mo)</option>
            <option value="creator_pro">Zyro Verified — Pro Creator (₹99/mo)</option>
            <option value="creator_elite">Zyro Verified — Elite VIP Creator (₹299/mo)</option>
          </select>'''
if old_admin_select:
    html = html[:old_admin_select.start()] + new_admin_select + html[old_admin_select.end():]

# ---------------------------------------------------------
# 7. UPDATE getVerifiedBadge, switchVerificationTab, loadProfileIdentity, adminGrantVerification, & Users List
# ---------------------------------------------------------
old_get_badge = re.search(r'function getVerifiedBadge\(.*?\n\}', html, re.DOTALL)
new_get_badge = '''function getVerifiedBadge(isVerified, type = "blue", size = 15) {
  if (!isVerified && type !== "cobra" && type !== "both") return "";
  const t = String(type || "blue").toLowerCase();
  if (t === "both") {
    return `<span class="verified-badge-wrap" title="Zyro Verified ✔️ &amp; Cobra Verified 🛡️" aria-label="Zyro and Cobra Verified">` +
      `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;vertical-align:middle" aria-hidden="true"><use href="#i-verified-blue"></use></svg>` +
      `<svg viewBox="0 0 24 24" style="width:${Math.round(size*1.12)}px;height:${Math.round(size*1.12)}px;vertical-align:middle" aria-hidden="true"><use href="#i-verified-cobra"></use></svg>` +
      `</span>`;
  }
  if (t === "cobra") {
    const cSize = Math.round(size * 1.12);
    return `<span class="verified-badge-wrap cobra-verified" title="Cobra Verified 🛡️ (Trusted Creator · Admin Award)" aria-label="Cobra Verified">` +
      `<svg viewBox="0 0 24 24" style="width:${cSize}px;height:${cSize}px;vertical-align:middle" aria-hidden="true"><use href="#i-verified-cobra"></use></svg>` +
      `</span>`;
  }
  return `<span class="verified-badge-wrap zyro-verified" title="Zyro Verified ✔️" aria-label="Zyro Verified">` +
    `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;vertical-align:middle" aria-hidden="true"><use href="#i-verified-blue"></use></svg>` +
    `</span>`;
}'''
if old_get_badge:
    html = html[:old_get_badge.start()] + new_get_badge + html[old_get_badge.end():]

# Update switchVerificationTab to support 3 tabs: 'creators', 'cobra', 'celebrity'
old_switch_vtab = re.search(r'function switchVerificationTab\(tab\)\{.*?\n\}', html, re.DOTALL)
new_switch_vtab = '''function switchVerificationTab(tab){
  const creatorsSec = document.getElementById("verifyCreatorPlansSection");
  const cobraSec = document.getElementById("verifyCobraSection");
  const celebSec = document.getElementById("verifyCelebritySection");
  const tabCr = document.getElementById("tabVerifyCreators");
  const tabCo = document.getElementById("tabVerifyCobra");
  const tabCe = document.getElementById("tabVerifyCelebrity");
  const cBox = document.getElementById("verifyConfirmBox");
  if(cBox) cBox.style.display = "none";

  if(creatorsSec) creatorsSec.style.display = (tab === "creators") ? "block" : "none";
  if(cobraSec) cobraSec.style.display = (tab === "cobra") ? "block" : "none";
  if(celebSec) celebSec.style.display = (tab === "celebrity") ? "block" : "none";

  [
    [tabCr, tab === "creators"],
    [tabCo, tab === "cobra"],
    [tabCe, tab === "celebrity"]
  ].forEach(([btn, active]) => {
    if(!btn) return;
    btn.style.background = active ? "#fff" : "transparent";
    btn.style.color = active ? "#111" : "#888";
    btn.style.boxShadow = active ? "0 2px 6px rgba(0,0,0,.08)" : "none";
  });
}'''
if old_switch_vtab:
    html = html[:old_switch_vtab.start()] + new_switch_vtab + html[old_switch_vtab.end():]

# Update openVerificationModal banner text for Zyro vs Cobra
old_open_vmodal = re.search(r'function openVerificationModal\(\)\{.*?\n\}', html, re.DOTALL)
new_open_vmodal = '''function openVerificationModal(){
  const modal = document.getElementById("verificationModal");
  if(!modal) return;
  modal.classList.add("show");
  const profile = cachedCurrentUserProfile || {};
  const banner = document.getElementById("verifiedActiveBanner");
  const titleEl = document.getElementById("activeVerifiedPlanTitle");
  const detEl = document.getElementById("activeVerifiedDetails");
  const iconEl = document.getElementById("activeVerifiedBannerIcon");
  const isCobra = profile.verifiedType === "cobra" || profile.verifiedType === "both" || profile.isCobraVerified;
  if((profile.isVerified || isCobra) && banner){
    banner.style.display = "block";
    if(iconEl) iconEl.innerHTML = `<use href="#${isCobra ? 'i-verified-cobra' : 'i-verified-blue'}"></use>`;
    if(titleEl) titleEl.textContent = isCobra ? "Cobra Verified Account 🛡️" : "Zyro Verified Account ✔️";
    if(detEl) {
      const planName = profile.verifiedPlan || (isCobra ? "Cobra Verified (Admin Award)" : "Zyro Verified");
      const duration = profile.verifiedDuration ? " · Validity: " + profile.verifiedDuration : "";
      detEl.textContent = planName + duration + " · Official badge active on your profile.";
    }
  } else if(banner) {
    banner.style.display = "none";
  }
  switchVerificationTab("creators");
  const cBox = document.getElementById("verifyConfirmBox");
  if(cBox) cBox.style.display = "none";
}'''
if old_open_vmodal:
    html = html[:old_open_vmodal.start()] + new_open_vmodal + html[old_open_vmodal.end():]

# Update loadProfileIdentity to toggle profileCobraTagSlot and update settingsVerifiedStatus
html = html.replace(
    'const isV = !!data.isVerified;\n    const vBadge = getVerifiedBadge(isV, data.verifiedType || "blue", 16);',
    '''const isCobra = data.verifiedType === "cobra" || data.verifiedType === "both" || !!data.isCobraVerified;
    const isV = !!data.isVerified || isCobra;
    const badgeType = (data.verifiedType === "both" || (data.isVerified && data.isCobraVerified && data.verifiedType !== "cobra")) ? "both" : (isCobra ? "cobra" : (data.verifiedType || "zyro_blue"));
    const vBadge = getVerifiedBadge(isV, badgeType, 16);
    const cobraSlot = document.getElementById("profileCobraTagSlot");
    if(cobraSlot) cobraSlot.style.display = isCobra ? "block" : "none";'''
)

html = html.replace(
    'if(vSetStatus) vSetStatus.textContent = isV ? "Verified ✓" : "Get Verified";',
    'if(vSetStatus) vSetStatus.textContent = isCobra ? "Cobra Verified 🛡️" : (isV ? "Zyro Verified ✓" : "Get Verified");'
)

# Update showUserProfileModal to also show Cobra Verified pill below @username when viewing a Cobra Verified user
html = html.replace(
    '+ \'<div class="rp-username">@\' + escapeHtml(userData.username || "user") + getVerifiedBadge(userData.isVerified, userData.verifiedType || "blue", 15) + \'</div>\'',
    '+ \'<div class="rp-username">@\' + escapeHtml(userData.username || "user") + getVerifiedBadge(userData.isVerified || userData.isCobraVerified, userData.verifiedType || (userData.isCobraVerified ? "cobra" : "blue"), 16) + \'</div>\''
    + ' + ((userData.verifiedType === "cobra" || userData.verifiedType === "both" || userData.isCobraVerified) ? \'<div><span class="cobra-verified-tag"><svg viewBox="0 0 24 24" style="width:13px;height:13px"><use href="#i-verified-cobra"></use></svg><span>Cobra Verified</span></span></div>\' : \'\')'
)

# Update adminGrantVerification to support Cobra Verified & Zyro Verified labels and fields
old_plan_labels = '''    let planLabel = "Electric Blue Verified";
    if(tierVal === "celebrity_free") planLabel = "Celebrity VIP (100% Free)";
    else if(tierVal === "creator_starter") planLabel = "Starter Creator (₹49/mo)";
    else if(tierVal === "creator_pro") planLabel = "Pro Creator (₹99/mo)";
    else if(tierVal === "creator_elite") planLabel = "Elite VIP Creator (₹299/mo)";'''

new_plan_labels = '''    let planLabel = "Zyro Verified (Blue Tick)";
    if(tierVal === "cobra") planLabel = "Cobra Verified 🛡️ (Trusted Creator · Admin Award)";
    else if(tierVal === "both") planLabel = "Zyro Verified + Cobra Verified 🛡️";
    else if(tierVal === "celebrity_free") planLabel = "Zyro Verified · Celebrity (Free)";
    else if(tierVal === "creator_starter") planLabel = "Zyro Verified · Starter (₹49/mo)";
    else if(tierVal === "creator_pro") planLabel = "Zyro Verified · Pro (₹99/mo)";
    else if(tierVal === "creator_elite") planLabel = "Zyro Verified · Elite VIP (₹299/mo)";'''

html = html.replace(old_plan_labels, new_plan_labels)

html = html.replace(
    '''    const updatePayload = {
      isVerified: true,
      verifiedType: tierVal,''',
    '''    const updatePayload = {
      isVerified: true,
      isCobraVerified: (tierVal === "cobra" || tierVal === "both"),
      verifiedType: tierVal,'''
)

html = html.replace(
    '''    const updatePayload = {
      isVerified: false,
      verifiedType: null,''',
    '''    const updatePayload = {
      isVerified: false,
      isCobraVerified: false,
      verifiedType: null,'''
)

# Update Admin Users list quick buttons so Admin can grant Zyro Blue Tick OR Cobra Verified directly with 1 click!
old_user_list_btns = '''          '<div style="display:flex;gap:4px;flex-shrink:0">' +
            (isV 
              ? '<button type="button" class="admin-mini-btn red" data-user-rev="'+doc.id+'" title="Revoke"><svg class="ico" style="width:12px;height:12px"><use href="#i-trash"></use></svg> Revoke</button>'
              : '<button type="button" class="admin-mini-btn green" data-user-grant="'+doc.id+'" title="Grant Blue Tick"><svg class="ico" style="width:12px;height:12px"><use href="#i-check"></use></svg> Verify Blue Tick</button>') +
          '</div>' +
        '</div>'; 
      }).join("");
      list.querySelectorAll("[data-user-grant]").forEach(b => {
        b.addEventListener("click", async () => {
          const uid = b.getAttribute("data-user-grant");
          await adminGrantVerification(uid, "blue", 0, "Granted from Users list");
          luBtn.click();
        });
      });'''

new_user_list_btns = '''          '<div style="display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap">' +
            '<button type="button" class="admin-mini-btn green" data-user-grant-zyro="'+doc.id+'" title="Grant Zyro Verified (Blue Tick)" style="background:#0095F6;color:#fff">Zyro ✓</button>' +
            '<button type="button" class="admin-mini-btn" data-user-grant-cobra="'+doc.id+'" title="Grant Cobra Verified (Admin Award)" style="background:linear-gradient(135deg,#00c6ff,#9333ea);color:#fff;border:none;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">Cobra 🛡️</button>' +
            (isV ? '<button type="button" class="admin-mini-btn red" data-user-rev="'+doc.id+'" title="Revoke">Revoke</button>' : '') +
          '</div>' +
        '</div>'; 
      }).join("");
      list.querySelectorAll("[data-user-grant-zyro]").forEach(b => {
        b.addEventListener("click", async () => {
          const uid = b.getAttribute("data-user-grant-zyro");
          await adminGrantVerification(uid, "zyro_blue", 0, "Zyro Verified granted from Users list");
          luBtn.click();
        });
      });
      list.querySelectorAll("[data-user-grant-cobra]").forEach(b => {
        b.addEventListener("click", async () => {
          const uid = b.getAttribute("data-user-grant-cobra");
          await adminGrantVerification(uid, "cobra", 0, "Cobra Verified granted by Admin");
          luBtn.click();
        });
      });'''

if old_user_list_btns in html:
    html = html.replace(old_user_list_btns, new_user_list_btns)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESSFULLY_UPDATED_ALL_BADGES_AND_UI")
