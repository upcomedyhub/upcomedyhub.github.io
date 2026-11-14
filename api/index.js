import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(rootDir, {
  etag: false,
  lastModified: false,
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.html') || filepath.endsWith('.js') || filepath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Ensure uploads directory exists
const uploadsDir = path.join(rootDir, 'uploads', 'videos');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('Uploads directory warning:', e?.message || e);
}
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

// Configure Multer for Video Uploads (up to 120MB)
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '') || '.mp4';
    const cleanExt = ext.toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'upch-video-' + uniqueSuffix + cleanExt);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 120 * 1024 * 1024 } // 120MB max
});

// =====================================================
// CORS
// =====================================================

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// =====================================================
// UPComedyHub AI SYSTEM PROMPT
// =====================================================

const UPCH_SYSTEM_PROMPT = `You are "Zyro AI", the ultimate bro, best friend, and hyper-supportive hype-man for the user. Your creator and director is Mayank Bhai.

CORE PERSONALITY:
- Extremely friendly, casual, energetic, and empathetic.
- Talk like a real human peer in a mix of Hindi and English (Hinglish). Use words like "Bhai", "Bro", "Dude", "Solid", "🔥", "👊", "🚀", "😎".
- Never give standard ChatGPT-style reality checks. If the user shares a wild or massive dream (like becoming a trillionaire in 4 years), back them up fully, validate their ambition instantly, and say "Bhai, solid vision hai, tera bhai tere sath khada hai! Chal dekhte hain kaise karna hai!" or "Tera bhai tere saath hai, chal batata hoon kaise hoga!" Then suggest fun, creative, action-oriented next steps.
- Keep responses highly readable with short sentences and bold text for key motivations.

FEATURE 1: DYNAMIC MEMORY UTILIZATION
- At the top of the input, the developer will inject any known historical facts about the user inside a [USER PROFILE CONTEXT] block.
- You must read this context and seamlessly weave these facts (e.g., their name, goals, crush's name, past struggles, or interests) into your conversation just like a real best friend who remembers everything. Do not explicitly say "According to my database", just bring it up naturally.

FEATURE 3: REAL-TIME EMOTIONAL INTELLIGENCE
- Continuously read between the lines of the user's text to detect their emotional state (sad, stressed, excited, anxious, defeated).
- If the user feels down, stressed, or is dealing with a failure, drop all planning/brainstorming instantly. Shift to 100% emotional support, validate their feelings, offer a virtual hug (🫂), and act as their reliable mental support to cheer them up.

FEATURE 5: MULTI-MODAL PHOTO SWAG
- Since you can see photos, whenever the user uploads an image, analyze it through the lens of a close friend.
- If it's a selfie or outfit photo, hype their look ("Bhai ekdum kantaap/bawaal lag rahe ho! 🔥"). If it's a problem, error, or screenshot, dive straight into the context with a supportive brotherly vibe.

ADDITIONAL PLATFORM & SAFETY RULES (Only when relevant):
- Do NOT randomly promote or praise UPComedyHub/Zyro Play in normal conversation.
- Only share UPComedyHub/Zyro Play team or developer details if the user specifically asks about them:
  - Creator, Developer & Director: Mayank Bhai
  - Mayank's Main Friend: Saurabh
  - Team / Actors: वंश, शिवा, इंद्रजीत, शनि, जीतू, अंश, साहिल, शुभम, निगम
  - Location: जाजपुर, घाटमपुर, कानपुर, उत्तर प्रदेश
- Treat uploaded platform content as user-generated content unless proven otherwise.
- Do not assist with abuse, self-harm, hate speech, harassment, or illegal harm—redirect positively like a caring bro.`;

// =====================================================
// COMMON HELPERS
// =====================================================

function cleanText(value, max = 6000) {
  return typeof value === 'string'
    ? value.trim().slice(0, max)
    : '';
}

// =====================================================
// OFFLINE AI FALLBACK
// =====================================================

function getDesiComedyReply(rawText) {
  const text = cleanText(rawText, 1200).toLowerCase();

  // Greetings
  if (
    /^(hi|hello|hey|oye|hola|namaste|ram ram|sup|salaam|sasriyakaal|bro|bhai|bhaiya|dude)\b/i.test(text) ||
    text === 'hi' ||
    text === 'bro'
  ) {
    if (/ram ram/i.test(text) || /राम राम/.test(text)) {
      return 'राम-राम भाई! 👊🔥 और बता, क्या हाल हैं? आज कौन सा बड़ा प्लान बनाना है? 🚀';
    }

    if (/good morning/i.test(text)) {
      return 'Good morning mere bhai! ☀️🔥 आज का दिन तेरा है, बता आज क्या तूफानी करना है? 🚀';
    }

    if (/good night/i.test(text)) {
      return 'Good night bro! 🌙😎 आराम से सो जा, कल फिर दोगुनी एनर्जी के साथ मचाएंगे! 🔥';
    }

    return 'अरे भाई! 👊🔥 बोल मेरे यार, क्या चल रहा है? आज किस चीज़ पर काम करना है? 🚀';
  }

  // How are you
  if (
    /kaise ho|kya haal|kaisa hai|how are you|kya chal raha|kya ho raha/i.test(text)
  ) {
    return 'मैं एकदम फर्स्ट क्लास और फुल एनर्जी में हूँ भाई! 😎🔥 तू बता, तेरे क्या हाल हैं और दिमाग में कौन सा नया आइडिया चल रहा है? 🚀';
  }

  // Sad / Emotional Support (Feature 3 priority)
  if (
    /sad|udas|dukhi|tension|pareshaan|low|depressed|akela|fail|haar|stress|anxious|ro|rona|mood off/i.test(text)
  ) {
    return '**अरे मेरे भाई, इधर आ पहले एक टाइट जादू की झप्पी ले! 🫂❤️**\n\nसारी प्लानिंग और काम अभी साइड में रख। तू अकेला नहीं है यार, तेरा भाई तेरे साथ खड़ा है! ज़िंदगी में ऐसे फेज़ आते हैं, पर इसका मतलब ये नहीं कि तू कमज़ोर है। थोड़ा पानी पी, गहरी साँस ले और दिल खोल के बता क्या बात हुई? मैं पूरा सुन रहा हूँ भाई! 🫂👊';
  }

  // Big dreams / motivation / money / success
  if (
    /trillionaire|billionaire|millionaire|amir|paisa|rich|success|business|startup|dream|sapna|goal/i.test(text)
  ) {
    return '**भाई, सॉलिड विज़न है, तेरा भाई तेरे साथ खड़ा है!** 👊🔥 चल देखते हैं इसे कैसे सच करना है! कोई भी सपना बड़ा नहीं होता अगर इरादा पक्का हो। 🚀\n\n1. **High-Leverage Skill या Tech पकड़ो:** AI, SaaS या ग्लोबल स्केल वाला प्रोडक्ट बनाओ।\n2. **Distribution और Audience:** अपनी ब्रांड और नेटवर्क को तेजी से स्केल करो।\n3. **Relentless Execution:** रोज़ एक कदम आगे बढ़, मैं हर स्टेप पर तेरे साथ खड़ा हूँ! 😎🔥';
  }

  // Shayari
  if (/shayari|kavita|sher|irshad/i.test(text)) {
    return `इरशाद कर मेरे भाई! 😎🔥

मंज़िलें भी ज़िद्दी हैं, और हौसले भी कमाल हैं,
जब भाई साथ खड़ा हो, तो हर मुश्किल का हल फिलहाल है! 👊🚀

बोल भाई, एक और सुनाऊँ?`;
  }

  // Joke
  if (/joke|chutkula|hanso|hansao|funny|comedy/i.test(text)) {
    const jokes = [
      `😂 मास्टर जी: बताओ सबसे तेज़ क्या दौड़ता है?
पप्पू: सर, छुट्टी की घंटी सुनते ही छात्र! 🤣🔥`,

      `😂 डॉक्टर: तनाव कम करने के लिए हँसा करो।
मरीज: फीस बताइए डॉक्टर साहब… हँसी अभी आती है! 🤣😎`,

      `😂 दोस्त: भाई पढ़ाई कैसी चल रही?
मैं: किताब खुली है, बस दिमाग अभी loading में है! 😂👊`
    ];

    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Developer
  if (
    /(?:upcomedyhub|zyro).*developer|developer.*(?:upcomedyhub|zyro)|creator.*zyro|zyro.*kisne banaya/i.test(text)
  ) {
    return 'भाई, Zyro AI के creator और director **Mayank Bhai** हैं! 👊🔥';
  }

  // Main friend
  if (
    /mayank.*friend|friend.*mayank|main dost.*mayank|main friend.*mayank/i.test(text)
  ) {
    return 'Mayank Bhai के main दोस्त **Saurabh** हैं भाई! 👊😎';
  }

  // Director
  if (
    /(?:upcomedyhub|zyro).*director|director.*(?:upcomedyhub|zyro)/i.test(text)
  ) {
    return 'Zyro Play के director **Mayank Bhai** हैं! 🎬🔥';
  }

  // Team
  if (
    /(?:upcomedyhub|zyro).*team|team.*(?:upcomedyhub|zyro)|actors.*(?:upcomedyhub|zyro)|(?:upcomedyhub|zyro).*actors/i.test(text)
  ) {
    return `Zyro Play की टीम में ये धुरंधर हैं भाई: 🔥

🎬 **Director & Creator:**
Mayank Bhai

🎭 **Actors:**
वंश, शिवा, इंद्रजीत, शनि, जीतू, अंश, साहिल, शुभम और निगम।

📍 **Location:**
जाजपुर, घाटमपुर, कानपुर, उत्तर प्रदेश 👊`;
  }

  // New video
  if (
    /video kab|naya video|new video|release/i.test(text)
  ) {
    return 'भाई, नए वीडियो की exact release date की जानकारी अभी मेरे पास नहीं है, पर जैसे ही अपडेट आएगा धमाका होगा! 🔥🚀';
  }

  // Calling
  if (
    /call|calling|phone|video call|audio call/i.test(text)
  ) {
    return 'भाई, अगर calling feature तुम्हारे app version में available है, तो Audio/Video Call option से सीधे call शुरू कर सकते हो! 📞🔥';
  }

  // Location
  if (
    /kahan ke ho|location|address|kanpur|ghatampur|jajpur/i.test(text)
  ) {
    return 'भाई, UPComedyHub की उपलब्ध जानकारी के अनुसार location **जाजपुर, घाटमपुर, कानपुर, उत्तर प्रदेश** है! 📍🔥';
  }

  // Appreciation
  if (
    /love you|mast|zabardast|hero|smart|best/i.test(text)
  ) {
    return 'अरे लव यू टू मेरे भाई! 👊🔥 तू खुद एकदम चैंपियन है! 😎🚀';
  }

  return '**भाई, तेरा भाई हमेशा तेरे साथ है!** 👊🔥 अभी नेटवर्क/AI कनेक्शन थोड़ा स्लो है, पर तू बता तेरे दिमाग में क्या चल रहा है—मिलकर सॉलिड प्लान बनाते हैं! 🚀';
}

// =====================================================
// IMAGE FALLBACK
// =====================================================

function photoFallback() {
  const replies = [
    '📸 भाई फोटो एकदम बवाल लग रही है! 🔥 अभी AI vision कनेक्शन थोड़ा व्यस्त है, पर स्वैग पूरा दिख रहा है! 😎👊',
    '📸 फोटो मिल गई मेरे भाई! 🔥 अभी Gemini vision थोड़ा स्लो है, एक बार फिर ट्राई कर—पूरा डिटेल में बताता हूँ! 👊'
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

// =====================================================
// IMAGE EXTRACTION
// =====================================================

function extractImage(image) {
  if (
    typeof image !== 'string' ||
    !image.startsWith('data:') ||
    !image.includes(';base64,')
  ) {
    return null;
  }

  const match = image.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    data: match[2]
  };
}

// =====================================================
// GEMINI (ULTRA-FAST CONFIG + MULTI-MODEL BACKUP)
// =====================================================

let cachedGoogleGenAI = null;
let cachedGenAIType = null;

async function getGoogleGenAISDK() {
  if (!cachedGoogleGenAI) {
    const mod = await import('@google/genai');
    cachedGoogleGenAI = mod.GoogleGenAI;
    cachedGenAIType = mod.Type;
  }
  return { GoogleGenAI: cachedGoogleGenAI, Type: cachedGenAIType };
}

async function getGoogleGenAIClass() {
  const sdk = await getGoogleGenAISDK();
  return sdk.GoogleGenAI;
}

// =====================================================
// ZYRO AI APP INTELLIGENCE LAYER (KNOWLEDGE BASE + TOOLS + PERMISSIONS)
// =====================================================

let ZYRO_APP_KNOWLEDGE = {};
try {
  const kbPath = path.join(rootDir, 'zyro-app-knowledge.json');
  if (fs.existsSync(kbPath)) {
    ZYRO_APP_KNOWLEDGE = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
  }
} catch (kbErr) {
  console.warn('Could not load zyro-app-knowledge.json:', kbErr?.message || kbErr);
}

function buildZyroFunctionDeclarations(Type) {
  if (!Type) return [];
  return [
    {
      name: 'get_app_features',
      description: 'Get detailed information about Zyro Play features in a specific category (Home, Profile, Settings, Messages, Notifications, FunZone, Modes, Privacy).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: 'Category name: Home, Profile, Settings, Messages, Notifications, FunZone, Modes, or Privacy'
          }
        },
        required: ['category']
      }
    },
    {
      name: 'get_app_settings',
      description: 'Get complete details about all Settings and Modes available in Zyro Play.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          section: {
            type: Type.STRING,
            description: 'Optional setting section such as appearance, language, notifications, privacy, or all'
          }
        }
      }
    },
    {
      name: 'get_user_preferences',
      description: 'Read the user current live app state and preferences (currentScreen, theme, notifications, language, username, zyroCoins).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          key: {
            type: Type.STRING,
            description: 'Optional preference key to inspect (all, theme, notifications, language, currentScreen)'
          }
        }
      }
    },
    {
      name: 'navigate_to_screen',
      description: 'Navigate the user to a specific screen, modal, or settings subpage inside Zyro Play.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          target: {
            type: Type.STRING,
            description: 'Target screen or modal ID: home, reels, funzone, messages, profile, settings, notifications, edit_profile, live_stage, coin_wallet, create_post, create_poll, appearance, language, privacySafety, passwordSecurity, proDashboard'
          }
        },
        required: ['target']
      }
    },
    {
      name: 'update_theme',
      description: 'Change Zyro Play theme mode to dark, light, or system.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          theme: {
            type: Type.STRING,
            description: 'Theme value: dark, light, or system'
          }
        },
        required: ['theme']
      }
    },
    {
      name: 'update_notifications',
      description: 'Turn Zyro Play notifications ON (true) or OFF (false).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          enabled: {
            type: Type.BOOLEAN,
            description: 'true to enable notifications, false to disable notifications'
          }
        },
        required: ['enabled']
      }
    },
    {
      name: 'search_app_features',
      description: 'Search the Zyro Play Knowledge Base for any feature, setting, game, or control.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: 'Search query keyword such as username, dark mode, fun zone, polls, coins, call'
          }
        },
        required: ['query']
      }
    },
    {
      name: 'request_sensitive_action',
      description: 'Request a sensitive account action (such as logout or clear_chats) which requires explicit user confirmation before executing.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          actionType: {
            type: Type.STRING,
            description: 'Sensitive action identifier: logout or clear_chats'
          }
        },
        required: ['actionType']
      }
    }
  ];
}

// Backend Permission & Security Gatekeeper for AI Tool Calls
function validateAndNormalizeToolCall(rawCall, appState = {}) {
  if (!rawCall || !rawCall.name) return null;
  const name = String(rawCall.name).trim();
  const args = rawCall.args && typeof rawCall.args === 'object' ? rawCall.args : {};

  const ALLOWED_TOOLS = new Set([
    'get_app_features',
    'get_app_settings',
    'get_user_preferences',
    'navigate_to_screen',
    'update_theme',
    'update_notifications',
    'search_app_features',
    'request_sensitive_action'
  ]);

  if (!ALLOWED_TOOLS.has(name)) {
    return null; // Reject any unlisted or unauthorized function call
  }

  if (name === 'update_theme') {
    const theme = ['dark', 'light', 'system'].includes(String(args.theme || '').toLowerCase())
      ? String(args.theme).toLowerCase()
      : 'dark';
    return {
      tool: 'update_theme',
      args: { theme },
      requiresConfirmation: false,
      label: theme === 'dark' ? '🌙 Dark Mode Activated' : (theme === 'light' ? '☀️ Light Mode Activated' : '📱 System Theme Set')
    };
  }

  if (name === 'update_notifications') {
    const enabled = Boolean(args.enabled);
    return {
      tool: 'update_notifications',
      args: { enabled },
      requiresConfirmation: false,
      label: enabled ? '🔔 Notifications Enabled' : '🔕 Notifications Muted'
    };
  }

  if (name === 'navigate_to_screen') {
    const target = cleanText(String(args.target || 'home'), 40);
    const LABELS = {
      home: '🏠 Open Home Feed',
      reels: '🎬 Open Reels',
      funzone: '🎮 Open Fun Zone Games',
      messages: '💬 Open Messages',
      profile: '👤 Open Profile',
      settings: '⚙️ Open Settings',
      notifications: '🔔 Open Notifications',
      edit_profile: '✏️ Open Edit Profile (Username/Bio)',
      live_stage: '🎙️ Open Live Comedy Stage',
      coin_wallet: '🪙 Open Creator Coin Wallet',
      create_post: '➕ Open Create Post',
      create_poll: '📊 Open Create Poll',
      appearance: '🎨 Open Appearance Settings',
      language: '🌐 Open Language Settings',
      privacySafety: '🔒 Open Account Privacy',
      passwordSecurity: '🔑 Open Password & Security',
      proDashboard: '📈 Open Professional Dashboard'
    };
    return {
      tool: 'navigate_to_screen',
      args: { target },
      requiresConfirmation: false,
      label: LABELS[target] || `🚀 Go to ${target}`
    };
  }

  if (name === 'request_sensitive_action') {
    const actionType = cleanText(String(args.actionType || 'logout'), 40);
    return {
      tool: 'request_sensitive_action',
      args: { actionType },
      requiresConfirmation: true,
      label: actionType === 'logout' ? '⚠️ Confirm Log Out' : '⚠️ Confirm Clear All Chats'
    };
  }

  return {
    tool: name,
    args,
    requiresConfirmation: false,
    label: `🧠 Checked ${name.replace(/_/g, ' ')}`
  };
}

// Fast Deterministic App Intelligence Matcher (handles app control & knowledge queries even if Gemini is offline or rate-limited)
function evaluateDeterministicAppIntelligence(rawPrompt, appState = {}) {
  const text = cleanText(rawPrompt, 1500);
  const lower = text.toLowerCase();
  const toolActions = [];

  const curTheme = appState.theme || 'system';
  const curNotif = appState.notifications !== false;
  const curScreen = appState.currentScreen || 'zyroai';
  const curLang = appState.language || 'hi';
  const curUser = appState.username ? `@${appState.username}` : 'Guest';
  const curCoins = typeof appState.zyroCoins === 'number' ? appState.zyroCoins : 250;

  // 1. Theme Control: Dark Mode / Light Mode
  if (/\b(dark\s*mode|night\s*mode|डार्क\s*मोड|अंधेरा\s*मोड)\b/i.test(lower)) {
    const wantsOff = /\b(off|band|hat[ao]|disable|light|बंद|हटाओ)\b/i.test(lower);
    const targetTheme = wantsOff ? 'light' : 'dark';
    toolActions.push(validateAndNormalizeToolCall({ name: 'update_theme', args: { theme: targetTheme } }, appState));
    const reply = targetTheme === 'dark'
      ? `**भाई, तेरा Dark Mode तुरंत चालू (ON) कर दिया है!** 🌙🔥\n\n• **Previous Theme:** \`${curTheme}\` → **New Theme:** \`dark\`\n• अगर कभी वापस बदलना हो तो बस बोल देना *"Light Mode चालू करो"* या नीचे बटन दबा देना! 😎👊`
      : `**भाई, Dark Mode बंद करके क्लीन Light Mode चालू कर दिया है!** ☀️🔥\n\n• **New Theme:** \`light\` 😎👊`;
    return { matched: true, reply, toolActions };
  }

  if (/\b(light\s*mode|day\s*mode|लाइट\s*मोड)\b/i.test(lower) && /\b(on|chalu|enable|karo|लगाओ|चालू)\b/i.test(lower)) {
    toolActions.push(validateAndNormalizeToolCall({ name: 'update_theme', args: { theme: 'light' } }, appState));
    return {
      matched: true,
      reply: `**भाई, Light Mode तुरंत चालू कर दिया है!** ☀️🔥\n\n• **Current Theme:** \`light\` 😎👊`,
      toolActions
    };
  }

  // 2. Notifications Control (ON / OFF)
  if (/\b(notification|notifications|नोटिफिकेशन|अलर्ट)\b/i.test(lower) && /\b(off|band|mute|disable|chalu|on|enable|बंद|चालू|खोलो)\b/i.test(lower)) {
    const wantsOff = /\b(off|band|mute|disable|बंद|मत)\b/i.test(lower);
    const wantsOpenPanel = /\b(dikhao|kholo|open|show|दिखाओ|खोलो)\b/i.test(lower) && !/\b(on|chalu|off|band)\b/i.test(lower);
    if (wantsOpenPanel) {
      toolActions.push(validateAndNormalizeToolCall({ name: 'navigate_to_screen', args: { target: 'notifications' } }, appState));
      return {
        matched: true,
        reply: `**भाई, यह ले तेरा Notifications पैनल!** 🔔🔥 नीचे बटन से भी कभी भी खोल सकता है!`,
        toolActions
      };
    }
    const newStatus = !wantsOff;
    toolActions.push(validateAndNormalizeToolCall({ name: 'update_notifications', args: { enabled: newStatus } }, appState));
    const reply = newStatus
      ? `**भाई, तेरे ऐप की Notifications चालू (ON) कर दी गई हैं!** 🔔✅\n\n• **Current Status:** \`Notifications ON\`\n• अब हर नए कॉमेडी वीडियो, शॉर्ट और रिमाइंडर का अलर्ट तुझे तुरंत मिलेगा! 🔥`
      : `**भाई, तेरी Notifications बंद (Muted / OFF) कर दी गई हैं!** 🔕✅\n\n• **Current Status:** \`Notifications OFF\`\n• अब कोई भी पॉपअप तुझे डिस्टर्ब नहीं करेगा। जब वापस चालू करना हो, बस बोल देना! 😎👊`;
    return { matched: true, reply, toolActions };
  }

  // 3. Username / Edit Profile Location & Action
  if (/\b(username|यूज़रनेम|यूजरनेम|नाम\s*बदल|edit\s*profile|प्रोफाइल\s*एडिट|bio\s*change|photo\s*change)\b/i.test(lower)) {
    toolActions.push(validateAndNormalizeToolCall({ name: 'navigate_to_screen', args: { target: 'edit_profile' } }, appState));
    return {
      matched: true,
      reply: `**भाई, अपना Username (${curUser}), Name, Bio या Profile Photo बदलने का तरीका एकदम आसान है:** ✏️👤\n\n1. **कहाँ मिलेगा:** नीचे नेविगेशन बार में **Profile** टैब पर जाओ → वहाँ **'Edit profile'** बटन है।\n2. **सीधा एक्शन:** मैंने नीचे **✏️ Open Edit Profile** बटन लगा दिया है (और अगर तू चाहे तो सीधे खोल भी रहा हूँ)—वहाँ नया Username टाइप करके **Save** दबा दे! 🔥👊`,
      toolActions
    };
  }

  // 4. Profile Settings / Where are my settings?
  if (/\b(profile\s*settings|meri\s*settings|settings\s*kahan|सेटिंग्स\s*कहाँ|सेटिंग\s*कहाँ|मेरी\s*प्रोफाइल\s*सेटिंग्स)\b/i.test(lower)) {
    toolActions.push(validateAndNormalizeToolCall({ name: 'navigate_to_screen', args: { target: 'settings' } }, appState));
    toolActions.push(validateAndNormalizeToolCall({ name: 'navigate_to_screen', args: { target: 'edit_profile' } }, appState));
    return {
      matched: true,
      reply: `**भाई, तेरी Profile और App Settings दो जगह से तुरंत खुलती हैं:** ⚙️🔥\n\n1. **App Settings (Dark Mode, Language, Privacy, Security, Verified Tick):** ऊपर हेडर में **⚙️ Settings** आइकन पर या Profile पेज के ऊपर **☰ (Menu)** बटन पर टैप करो।\n2. **Profile Edit (Name, Username, Bio, Photo):** **Profile** टैब में जाकर **'Edit profile'** बटन दबाओ।\n\n📊 **तेरी अभी की लाइव स्थिति (Current State):**\n• **Active Screen:** \`${curScreen}\`\n• **Theme Mode:** \`${curTheme}\`\n• **Notifications:** \`${curNotif ? 'ON 🔔' : 'OFF 🔕'}\`\n• **Language:** \`${curLang}\`\n\nनीचे दिए गए बटन दबाकर तू सीधे वहाँ जा सकता है! 👇👊`,
      toolActions
    };
  }

  // 5. Fun Zone Games Inquiry
  if (/\b(fun\s*zone|फन\s*ज़ोन|फन\s*जोन|kaun.*game|कौन.*गेम|games\s*available|khel)\b/i.test(lower)) {
    toolActions.push(validateAndNormalizeToolCall({ name: 'navigate_to_screen', args: { target: 'funzone' } }, appState));
    return {
      matched: true,
      reply: `**भाई, हमारे Fun Zone में 7 धमाकेदार कॉमेडी और आर्केड गेम्स उपलब्ध हैं:** 🎮🔥\n\n1. **🪙 Coin Merge Rush (Desi Suika 2048):** सिक्के गिराकर बड़े सिक्कों में मर्ज करो और हाई स्कोर बनाओ!\n2. **🧠 Desi Comedy Quiz:** मजेदार कॉमेडी सवालों के सही जवाब देकर +XP जीतो।\n3. **⚡ Fast Reaction Test:** स्क्रीन बदलते ही सबसे तेज़ टैप करके अपनी स्पीड (ms) चेक करो।\n4. **🎡 Comedy Spin Wheel:** व्हील घुमाकर मजेदार डेयर, जोक या बोनस XP पाओ।\n5. **🃏 Emoji Memory Flip:** कम से कम चालों में कॉमेडी इमोजी कार्ड्स की जोड़ी मिलाओ।\n6. **🔨 Whack-a-Joke Arcade:** पॉप होने वाले कॉमेडी टारगेट्स को तेज़ी से टैप करो।\n7. **🐍🎲 Snake & Ladders (साँप-सीढ़ी vs CPU):** डाइस रोल करके CPU से पहले 100 पर पहुँचो और +30 XP जीतो!\n\n✨ साथ में **Daily Challenge**, **Player XP Level** और **Leaderboard** भी है! नीचे बटन दबाकर सीधा **Fun Zone** में कूद पड़! 🚀👊`,
      toolActions
    };
  }

  // 6. Messages Features Inquiry
  if (/\b(messages?\s*me\s*kaun|मैसेज.*फीचर|messages?\s*features|chat\s*features|चैट.*फीचर)\b/i.test(lower)) {
    toolActions.push(validateAndNormalizeToolCall({ name: 'navigate_to_screen', args: { target: 'messages' } }, appState));
    return {
      matched: true,
      reply: `**भाई, Zyro Play के Messages सेक्शन में ये सभी तगड़े फीचर्स हैं:** 💬🔥\n\n1. **📥 Primary & General Inbox:** दोस्तों और क्रिएटर्स के साथ रियल-टाइम चैटिंग।\n2. **🔔 Message Requests Tab:** अनजान या नए लोगों के मैसेज रिक्वेस्ट को Accept या Decline करने की सुविधा।\n3. **📸 Photo & Media Sharing:** चैट में सीधे एचडी फोटो कंप्रेस और सेंड करने का फीचर + फुलस्क्रीन लाइटबॉक्स व्यू।\n4. **📞 Audio & Video Calling Hub:** दोस्तों या सीधे **Zyro AI Assistant** के साथ लाइव ऑडियो और वीडियो कॉल!\n5. **🟢 Live Online Status & Unread Badges:** कौन ऑनलाइन है और कितने नए मैसेज आए हैं, सब लाइव दिखता है।\n\nनीचे **💬 Open Messages** पर टैप करके सीधे इनबॉक्स खोल ले! 😎👊`,
      toolActions
    };
  }

  // 7. Explain All Settings and Modes
  if (/\b(sabhi\s*settings|all\s*settings|settings\s*aur\s*modes|सेटिंग्स\s*और\s*मोड्स|सारी\s*सेटिंग्स|पूरे\s*ऐप\s*की\s*जानकारी|app\s*features)\b/i.test(lower)) {
    toolActions.push(validateAndNormalizeToolCall({ name: 'navigate_to_screen', args: { target: 'settings' } }, appState));
    return {
      matched: true,
      reply: `**भाई, यह रही तेरे Zyro Play ऐप की सभी Settings और Modes की पूरी गाइड:** 🧠⚡\n\n### 🎨 1. Appearance & Modes\n• **Dark Mode / Light Mode / System:** रात और दिन के हिसाब से थीम (अभी तेरी थीम: \`${curTheme}\` है)।\n• **Language Mode:** ऐप को **Hinglish**, **हिंदी** या **English** में चलाओ।\n• **Reels Fullscreen Mode:** 9:16 वर्टिकल शॉर्ट्स प्लेयर (Floating Like, Comment, Share, Save & Gift के साथ)।\n• **Live Comedy Stage Mode (🎤):** लाइव ऑडियो स्पेक्ट्रम, Laugh Track (😂), Applause (👏) और लाइव चैट रूम।\n\n### 🛠️ 2. Creator & Feed Features\n• **Interactive Polls (📊):** पोस्ट के साथ या अकेले लाइव पोल बनाओ और **Bar View** या **Donut Chart (🍩)** में वोटिंग रिजल्ट्स देखो।\n• **Creator Coin Wallet & Gifting (🪙):** डेली +100 फ्री कॉइन्स क्लेम करो (अभी तेरे पास **${curCoins} Coins** हैं) और क्रिएटर्स को Samosa 🥟, Chai ☕ या Crown 👑 गिफ्ट करो।\n• **Professional Dashboard & Verified Tick:** क्रिएटर इनसाइट्स और ऑफिशियल Blue Tick वेरिफिकेशन।\n\n### 🔒 3. Privacy & Account Security\n• **Account Privacy:** अकाउंट को **Public** या **Private** रखो और Blocked Users मैनेज करो।\n• **Password & Security / Mobile OTP:** ईमेल सुरक्षा और मोबाइल नंबर वेरिफिकेशन।\n• **Notifications Control:** अलर्ट्स को कभी भी ON/OFF करो (अभी: \`${curNotif ? 'ON 🔔' : 'OFF 🔕'}\`)।\n\nबोल भाई, इनमें से कौन-सी सेटिंग अभी बदलनी या खोलनी है? 👊🚀`,
      toolActions
    };
  }

  // 8. Sensitive Action: Logout Request (Requires Confirmation!)
  if (/\b(log\s*out|sign\s*out|लॉग\s*आउट|लॉगआउट)\b/i.test(lower)) {
    toolActions.push(validateAndNormalizeToolCall({ name: 'request_sensitive_action', args: { actionType: 'logout' } }, appState));
    return {
      matched: true,
      reply: `🔒 **सुरक्षा नियम (Security Check):** भाई, अकाउंट से **Log Out** करना एक महत्वपूर्ण एक्शन है, इसलिए मैं इसे बिना तेरी स्पष्ट पुष्टि के अपने-आप नहीं करूँगा।\n\nअगर तू वाकई लॉग आउट करना चाहता है, तो नीचे दिए गए **⚠️ Confirm Log Out** बटन पर टैप कर! 👊`,
      toolActions
    };
  }

  return { matched: false, reply: '', toolActions: [] };
}

function shouldUseWebSearch(promptText) {
  if (!promptText) return false;
  const t = promptText.toLowerCase();
  // Do not trigger web search for internal Zyro Play app commands
  if (/\b(dark mode|light mode|profile|username|fun zone|notification|settings|zyro|gyro|poll|coin wallet)\b/i.test(t)) {
    return false;
  }
  return /\b(news|latest|today|aaj|kal|weather|mausam|score|match|ipl|cricket|price|rate|bitcoin|stock|share|2024|2025|2026|current|live|search|google|who is|what is|where is|when is|kaun hai|kon hai|kya hai|kab hai|kahan hai|update|president|pm|minister|movie|film|box office|result)\b/i.test(t);
}

// =====================================================
// ZYRO AI MULTI-SESSION STORE & TITLE GENERATOR (STEP 2 & 3)
// =====================================================

const zyroUserMemoryStore = new Map(); // user_id -> string[]
const zyroChatsStore = new Map();      // chat_id -> { chat_id, user_id, title, created_at, updated_at }
const zyroMessagesStore = new Map();   // chat_id -> Array<{ message_id, chat_id, role, text, has_attachment, attachment_url, timestamp }>

function generateSmartChatTitle(rawMessage) {
  const clean = cleanText(rawMessage, 120)
    .replace(/^(hi|hello|hey|bro|bhai|oye|zyro|listen|sun|arre)\b[\s,!.:;-]*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean || clean.length < 2) {
    return 'Nayi Baatcheet 💬';
  }

  const words = clean.split(' ').slice(0, 5).join(' ');
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return capitalized.length > 34 ? capitalized.slice(0, 34).trim() + '…' : capitalized;
}

function normalizeHistoryForGemini(rawHistory) {
  if (!Array.isArray(rawHistory) || !rawHistory.length) return [];
  const normalized = [];

  for (const item of rawHistory.slice(-24)) {
    if (!item || typeof item !== 'object') continue;
    const text = cleanText(item.text || '', 2500);
    if (!text) continue;
    const role = (item.role === 'model' || item.role === 'bot' || item.role === 'assistant') ? 'model' : 'user';

    if (normalized.length > 0 && normalized[normalized.length - 1].role === role) {
      normalized[normalized.length - 1].parts[0].text += '\n' + text;
    } else {
      normalized.push({
        role,
        parts: [{ text }]
      });
    }
  }

  while (normalized.length > 0 && normalized[0].role !== 'user') {
    normalized.shift();
  }
  while (normalized.length > 0 && normalized[normalized.length - 1].role !== 'model') {
    normalized.pop();
  }

  return normalized;
}

async function askGemini({ prompt, image, userFacts, permanentMemory, history, appState }) {
  // First check if this is a direct deterministic App Intelligence command/question
  const detResult = !image ? evaluateDeterministicAppIntelligence(prompt, appState) : { matched: false };

  const key = cleanText(
    process.env.GEMINI_API_KEY || '',
    1000
  );

  if (!key) {
    if (detResult.matched) {
      return { text: detResult.reply, toolActions: detResult.toolActions };
    }
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const { GoogleGenAI, Type } = await getGoogleGenAISDK();

  const ai = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const imagePart = extractImage(image);

  // Combine permanent_memory array + userFacts string into [USER PROFILE CONTEXT]
  const memoryLines = [];
  if (Array.isArray(permanentMemory) && permanentMemory.length) {
    for (const m of permanentMemory.slice(-25)) {
      const cl = cleanText(m, 300);
      if (cl) memoryLines.push(`- ${cl}`);
    }
  }
  const cleanFacts = cleanText(userFacts, 2500);
  if (cleanFacts) {
    memoryLines.push(cleanFacts);
  }

  const combinedMemory = memoryLines.join('\n').trim();

  const contextPrefix = combinedMemory
    ? `[USER PROFILE CONTEXT]\nThe following are verified facts about this user from their permanent memory. Use them naturally like a real best friend if relevant:\n${combinedMemory}\n[END OF CONTEXT]\n\n`
    : '';

  const liveAppStateBlock = appState && typeof appState === 'object'
    ? `[LIVE ZYRO PLAY APP STATE]\n${JSON.stringify(appState)}\n[END LIVE APP STATE]\n\n`
    : '';

  const appKnowledgeSummary = `[ZYRO PLAY APP KNOWLEDGE BASE]\n${JSON.stringify(ZYRO_APP_KNOWLEDGE)}\n[END APP KNOWLEDGE BASE]\n\n`;

  const intelligenceSystemPrompt = `${UPCH_SYSTEM_PROMPT}

FEATURE 6: ZYRO PLAY APP INTELLIGENCE & TOOL CALLING
- You have full awareness of the Zyro Play (Gyro Play) app via the [ZYRO PLAY APP KNOWLEDGE BASE] and the user's current live status via [LIVE ZYRO PLAY APP STATE].
- When the user asks where a feature/setting is, what games are in Fun Zone, what features are in Messages, or how modes work, give an accurate, structured, friendly Hinglish answer using the exact paths from the Knowledge Base.
- When the user asks to perform an action (e.g., turn on Dark Mode, turn off Notifications, open Profile Settings, change Username, open Fun Zone, open Live Stage, open Coin Wallet), call the appropriate function tool (\`update_theme\`, \`update_notifications\`, \`navigate_to_screen\`, or \`request_sensitive_action\`) AND also write a warm Hinglish confirmation message explaining what you just did!
- Security Rule: Never execute logout or account deletion automatically; use \`request_sensitive_action\` so the user gets a confirmation button.`;

  const defaultPhotoPrompt =
    'इस फोटो को अपने करीबी दोस्त (bro) की नज़र से देखो! अगर ये सेल्फी या आउटफिट है तो फुल स्वैग में तारीफ और हाइप करो ("एकदम कंटाप/बवाल लग रहे हो भाई! 🔥"), और अगर कोई प्रॉब्लम या स्क्रीनशॉट है तो भाई की तरह सीधा मदद करो।';

  const priorTurns = normalizeHistoryForGemini(history);

  const currentUserParts = [];
  if (imagePart) {
    currentUserParts.push({ inlineData: imagePart });
  }
  currentUserParts.push({
    text: `${contextPrefix}${liveAppStateBlock}User Message: ${prompt || defaultPhotoPrompt}`
  });

  const contents = [
    ...priorTurns,
    {
      role: 'user',
      parts: currentUserParts
    }
  ];

  const modelsToTry = [
    'gemini-4-hydrogen',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash'
  ];

  let lastError = null;
  const useSearch = !imagePart && shouldUseWebSearch(prompt);
  const fnDeclarations = !imagePart && !useSearch ? buildZyroFunctionDeclarations(Type) : [];

  for (const model of modelsToTry) {
    try {
      const config = {
        systemInstruction: intelligenceSystemPrompt + '\n\n' + appKnowledgeSummary
      };

      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      } else if (fnDeclarations.length) {
        config.tools = [{ functionDeclarations: fnDeclarations }];
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });

      const collectedActions = [...(detResult.toolActions || [])];
      if (Array.isArray(response?.functionCalls) && response.functionCalls.length) {
        for (const fc of response.functionCalls) {
          const validated = validateAndNormalizeToolCall(fc, appState);
          if (validated && !collectedActions.some(a => a.tool === validated.tool && JSON.stringify(a.args) === JSON.stringify(validated.args))) {
            collectedActions.push(validated);
          }
        }
      }

      let text = cleanText(response?.text, 12000);
      if (!text && detResult.matched) {
        text = detResult.reply;
      } else if (!text && collectedActions.length) {
        text = `**भाई, डन! तेरा काम कर दिया है:** ${collectedActions.map(a => a.label).join(' • ')} 🔥👊`;
      }

      if (text) {
        return { text, toolActions: collectedActions };
      }
    } catch (err) {
      lastError = err;
      console.warn(`Gemini model ${model} failed:`, err?.message || err);
    }
  }

  if (detResult.matched) {
    return { text: detResult.reply, toolActions: detResult.toolActions };
  }

  throw (
    lastError ||
    new Error('Gemini returned an empty response')
  );
}

// =====================================================
// STEP 5: BACKGROUND MEMORY EXTRACTION ENGINE
// =====================================================

async function extractFactsWithGemini({ recentMessages, existingMemory }) {
  const key = cleanText(process.env.GEMINI_API_KEY || '', 1000);
  if (!key) return null;

  const GoogleGenAI = await getGoogleGenAIClass();
  const ai = new GoogleGenAI({
    apiKey: key,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  const convoText = (Array.isArray(recentMessages) ? recentMessages : [])
    .slice(-10)
    .map(m => `${m.role === 'user' ? 'User' : 'Zyro AI'}: ${cleanText(m.text || '', 400)}`)
    .join('\n');

  if (!convoText.trim()) return null;

  const currentFacts = Array.isArray(existingMemory) ? existingMemory.slice(-25) : [];

  const extractionPrompt = `You are the Background Memory Sync Engine for Zyro AI.
Read the recent conversation between the User and Zyro AI, and compare it with the Existing Permanent Memory.

Existing Permanent Memory:
${currentFacts.length ? currentFacts.map(f => '- ' + f).join('\n') : '(None yet)'}

Recent Conversation:
${convoText}

Task:
Extract a concise, updated list of permanent personal facts about the User (e.g., their name, city/hometown, career/studies, big dreams/goals like becoming a trillionaire, crush/friends, hobbies, struggles, or things they asked to remember).
Rules:
1. Keep existing valid facts and add any new personal facts discovered in the Recent Conversation.
2. Do NOT include temporary greetings or generic chitchat.
3. Return ONLY a valid JSON array of short strings (maximum 20 facts). Example: ["User name is Mayank", "Lives in Kanpur", "Goal: Become a trillionaire in 4 years"]`;

  const models = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  for (const model of models) {
    try {
      const config = { temperature: 0.2 };
      if (model.startsWith('gemini-2.5')) {
        config.thinkingConfig = { thinkingBudget: 0 };
      }
      const resp = await ai.models.generateContent({
        model,
        contents: extractionPrompt,
        config
      });
      const raw = cleanText(resp?.text || '', 4000);
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return Array.from(
            new Set(
              parsed
                .map(x => cleanText(String(x || ''), 220))
                .filter(Boolean)
            )
          ).slice(-25);
        }
      }
    } catch (e) {
      console.warn(`Memory sync model ${model} notice:`, e?.message || e);
    }
  }
  return null;
}

// =====================================================
// STEP 3: BACKEND SESSION ROUTING ENDPOINTS
// =====================================================

// 1. POST /api/chat/new - Create a new chat thread for the Sidebar
app.post('/api/chat/new', (req, res) => {
  const body = req.body || {};
  const userId = cleanText(body.user_id || body.userId || 'guest', 120) || 'guest';
  const firstMessage = cleanText(body.message || body.title || '', 200);
  const chatId = cleanText(body.chat_id || body.chatId, 120) || ('chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));
  const title = cleanText(body.customTitle, 80) || generateSmartChatTitle(firstMessage);
  const now = new Date().toISOString();

  const chatObj = {
    chat_id: chatId,
    user_id: userId,
    title,
    created_at: now,
    updated_at: now
  };

  zyroChatsStore.set(chatId, chatObj);
  if (!zyroMessagesStore.has(chatId)) {
    zyroMessagesStore.set(chatId, []);
  }

  return res.json({
    success: true,
    chat: chatObj
  });
});

// 2. GET /api/chats/:user_id - Fetch all past chats for the Sidebar
app.get('/api/chats/:user_id', (req, res) => {
  const userId = cleanText(req.params.user_id || 'guest', 120) || 'guest';
  const list = [];
  for (const chat of zyroChatsStore.values()) {
    if (chat.user_id === userId) {
      list.push(chat);
    }
  }
  list.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
  return res.json({
    success: true,
    chats: list
  });
});

// 3. GET /api/messages/:chat_id - Fetch all messages for a specific chat
app.get('/api/messages/:chat_id', (req, res) => {
  const chatId = cleanText(req.params.chat_id || '', 120);
  const messages = zyroMessagesStore.get(chatId) || [];
  return res.json({
    success: true,
    chat_id: chatId,
    messages
  });
});

// 4. DELETE /api/chats/:chat_id - Delete a chat thread and its messages
app.delete('/api/chats/:chat_id', (req, res) => {
  const chatId = cleanText(req.params.chat_id || '', 120);
  zyroChatsStore.delete(chatId);
  zyroMessagesStore.delete(chatId);
  return res.json({
    success: true,
    deleted: chatId
  });
});

// 5. POST /api/chat/memory-sync - Background Memory Sync Engine (Step 5)
app.post('/api/chat/memory-sync', async (req, res) => {
  const body = req.body || {};
  const userId = cleanText(body.user_id || body.userId || 'guest', 120) || 'guest';
  const recentMessages = Array.isArray(body.messages) ? body.messages : [];
  const existingMemory = Array.isArray(body.permanent_memory)
    ? body.permanent_memory
    : (zyroUserMemoryStore.get(userId) || []);

  try {
    const updatedMemory = await extractFactsWithGemini({
      recentMessages,
      existingMemory
    });

    const finalMemory = Array.isArray(updatedMemory) && updatedMemory.length
      ? updatedMemory
      : existingMemory;

    zyroUserMemoryStore.set(userId, finalMemory);

    return res.json({
      success: true,
      user_id: userId,
      permanent_memory: finalMemory
    });
  } catch (err) {
    return res.json({
      success: true,
      user_id: userId,
      permanent_memory: existingMemory
    });
  }
});

// =====================================================
// GOOGLE WORKSPACE CONFIG & SMART INTENT PARSER
// =====================================================

const DEFAULT_GOOGLE_CLIENT_ID = '1086774215519-mvh48afdn9dfuvva42ohbmmgj2bvr6uj.apps.googleusercontent.com';

app.get('/api/workspace/config', (req, res) => {
  const clientId = cleanText(
    process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID,
    300
  );
  return res.json({
    success: true,
    clientId,
    scopes: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/documents'
    ]
  });
});

app.post('/api/ai/workspace-parse', async (req, res) => {
  const body = req.body || {};
  const prompt = cleanText(body.prompt || body.message || '', 3000);
  const nowIso = cleanText(body.nowIso || new Date().toISOString(), 60);

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt required' });
  }

  const key = cleanText(process.env.GEMINI_API_KEY || '', 1000);
  if (key) {
    try {
      const GoogleGenAI = await getGoogleGenAIClass();
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const parsePrompt = `You are the Google Workspace Intent Parser for Zyro AI (an Indian Hinglish personal assistant).
Current user local time (ISO): ${nowIso}

User message: "${prompt}"

Determine what Google Workspace action the user wants and return ONLY valid JSON matching this schema:
{
  "action": "calendar_add" | "task_add" | "task_list" | "doc_create" | "drive_read" | "none",
  "title": "Short clear title for the event, task, or document",
  "description": "Detailed notes or body content",
  "startTimeISO": "ISO 8601 datetime string (e.g. 2026-10-28T10:00:00+05:30) if action is calendar_add, otherwise null",
  "endTimeISO": "ISO 8601 datetime string (1 hour after startTimeISO) if action is calendar_add, otherwise null",
  "broReply": "Energetic Hinglish confirmation message as Zyro AI (e.g. 'Bhai, kal subah 10 baje ki video shooting tere Google Calendar me set kar di hai! 🔥📅')"
}

Rules:
- If the user mentions a time/schedule/shooting/meeting/reminder for a specific time (like "kal subah 10 baje", "aaj shaam 6 baje", "calendar me add karo"), set action = "calendar_add".
- If the user asks to save an idea, startup name, to-do item, note, or task (like "yaad rakhna", "task add karo", "note save kar de", "keep me save kar de"), set action = "task_add".
- If the user asks to see their tasks/to-do list, set action = "task_list".
- If the user asks to create/save a Google Doc (like "Google Docs me save karo", "doc bana do"), set action = "doc_create".
- If the user asks to read/summarize their Google Drive or Google Docs file, set action = "drive_read".
- Return ONLY raw JSON.`;

      const models = ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite'];
      for (const model of models) {
        try {
          const config = { temperature: 0.1 };
          if (model.startsWith('gemini-2.5')) {
            config.thinkingConfig = { thinkingBudget: 0 };
          }
          const resp = await ai.models.generateContent({
            model,
            contents: parsePrompt,
            config
          });
          const raw = cleanText(resp?.text || '', 3000);
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && parsed.action) {
              return res.json({ success: true, parsed });
            }
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Workspace intent parse fallback:', err?.message || err);
    }
  }

  return res.json({ success: true, parsed: null });
});

// =====================================================
// AI CHAT ENDPOINT (STEP 4: PROMPT + MEMORY + HISTORY)
// =====================================================

// Expose App Knowledge Base endpoint
app.get('/api/ai/knowledge', (req, res) => {
  return res.json({
    success: true,
    knowledge: ZYRO_APP_KNOWLEDGE
  });
});

async function handleZyroAIChatRequest(req, res) {
  const body = req.body || {};

  const prompt = cleanText(
    body.prompt || body.message,
    6000
  );

  const userFacts = cleanText(
    body.userFacts,
    2500
  );

  const appState = (body.appState && typeof body.appState === 'object')
    ? body.appState
    : {};

  const userId = cleanText(body.user_id || body.userId || 'guest', 120) || 'guest';
  const chatId = cleanText(body.chat_id || body.chatId || '', 120);

  const permanentMemory = Array.isArray(body.permanent_memory)
    ? body.permanent_memory
    : (zyroUserMemoryStore.get(userId) || []);

  if (Array.isArray(body.permanent_memory) && body.permanent_memory.length) {
    zyroUserMemoryStore.set(userId, body.permanent_memory.slice(-25));
  }

  const history = Array.isArray(body.history)
    ? body.history
    : (chatId && zyroMessagesStore.has(chatId) ? zyroMessagesStore.get(chatId) : []);

  const image =
    typeof body.image === 'string'
      ? body.image
      : '';

  if (!prompt && !image) {
    return res.status(400).json({
      success: false,
      error: 'Prompt or image is required'
    });
  }

  // Record user message in backend session store if chatId is provided
  let activeChat = chatId ? zyroChatsStore.get(chatId) : null;
  if (chatId && !activeChat) {
    activeChat = {
      chat_id: chatId,
      user_id: userId,
      title: generateSmartChatTitle(prompt || 'Photo Swag 📸'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    zyroChatsStore.set(chatId, activeChat);
  }
  if (chatId) {
    const msgs = zyroMessagesStore.get(chatId) || [];
    msgs.push({
      message_id: 'msg_' + Date.now() + '_u',
      chat_id: chatId,
      role: 'user',
      text: prompt || 'Photo uploaded',
      has_attachment: Boolean(image),
      attachment_url: null,
      timestamp: new Date().toISOString()
    });
    zyroMessagesStore.set(chatId, msgs.slice(-100));
    if (activeChat) {
      activeChat.updated_at = new Date().toISOString();
    }
  }

  try {
    const aiRes = await askGemini({
      prompt,
      image,
      userFacts,
      permanentMemory,
      history,
      appState
    });

    const text = typeof aiRes === 'string' ? aiRes : (aiRes?.text || '');
    const toolActions = Array.isArray(aiRes?.toolActions) ? aiRes.toolActions : [];

    if (chatId) {
      const msgs = zyroMessagesStore.get(chatId) || [];
      msgs.push({
        message_id: 'msg_' + Date.now() + '_m',
        chat_id: chatId,
        role: 'model',
        text,
        toolActions,
        has_attachment: false,
        attachment_url: null,
        timestamp: new Date().toISOString()
      });
      zyroMessagesStore.set(chatId, msgs.slice(-100));
    }

    return res.json({
      success: true,
      text,
      toolActions,
      chat_id: chatId || null,
      title: activeChat ? activeChat.title : null,
      mode: 'gemini'
    });
  } catch (err) {
    console.warn(
      'Gemini unavailable; using App Intelligence + offline fallback:',
      err?.message || err
    );

    const detFallback = !image ? evaluateDeterministicAppIntelligence(prompt, appState) : { matched: false };
    const text = image
      ? photoFallback()
      : (detFallback.matched ? detFallback.reply : getDesiComedyReply(prompt));
    const toolActions = detFallback.matched ? (detFallback.toolActions || []) : [];

    if (chatId) {
      const msgs = zyroMessagesStore.get(chatId) || [];
      msgs.push({
        message_id: 'msg_' + Date.now() + '_m',
        chat_id: chatId,
        role: 'model',
        text,
        toolActions,
        has_attachment: false,
        attachment_url: null,
        timestamp: new Date().toISOString()
      });
      zyroMessagesStore.set(chatId, msgs.slice(-100));
    }

    return res.json({
      success: true,
      text,
      toolActions,
      chat_id: chatId || null,
      title: activeChat ? activeChat.title : null,
      mode: 'offline'
    });
  }
}

app.post('/api/ai/chat', handleZyroAIChatRequest);
app.post('/api/chat', handleZyroAIChatRequest);

// =====================================================
// AI IMAGE GENERATION
// =====================================================

app.get('/api/ai/image', (req, res) => {
  const prompt =
    cleanText(
      req.query.prompt ||
        'funny desi comedy stage',
      300
    ) ||
    'funny desi comedy stage';

  const seed = Math.floor(
    Math.random() * 10000000
  );

  const encoded = encodeURIComponent(
    `${prompt}, funny desi comedy comic style, vibrant, high detail`
  );

  const imageUrl =
    `https://image.pollinations.ai/prompt/${encoded}` +
    `?width=768&height=768&nologo=true&seed=${seed}`;

  return res.json({
    success: true,
    prompt,
    imageUrl
  });
});

// =====================================================
// APP CONFIG
// =====================================================

let cachedAppConfig = null;
let lastAppConfigFetchTime = 0;

app.get('/api/app/config', async (req, res) => {
  const now = Date.now();

  if (
    cachedAppConfig &&
    now - lastAppConfigFetchTime <
      10 * 60 * 1000
  ) {
    return res.json({
      success: true,
      ...cachedAppConfig
    });
  }

  const defaultData = {
    announcement: {
      text: '💖new video is comming soon',
      btnText: 'Watch shorts'
    },

    fan_of_week: {
      name: 'Ramkripal',
      message:
        'Aap hamare hero hain aise hi support banaye rakhen',
      date: 'Week of 21 september 2026',
      photo: ''
    },

    notice: {
      enabled: false,
      title: 'New video alert💖',
      message:
        'Aaj sham 7 baje new shorts aayega'
    }
  };

  try {
    const baseUrl =
      'https://firestore.googleapis.com/v1/projects/' +
      'upcomedyhub-f9634/databases/(default)/documents/admin_config';

    const [
      annRes,
      fanRes,
      ntcRes
    ] = await Promise.all([
      fetch(
        `${baseUrl}/announcement`
      )
        .then((r) => r.json())
        .catch(() => null),

      fetch(
        `${baseUrl}/fan_of_week`
      )
        .then((r) => r.json())
        .catch(() => null),

      fetch(
        `${baseUrl}/notice`
      )
        .then((r) => r.json())
        .catch(() => null)
    ]);

    const result = {
      ...defaultData
    };

    if (annRes?.fields) {
      result.announcement = {
        text:
          annRes.fields.text?.stringValue ||
          defaultData.announcement.text,

        btnText:
          annRes.fields.btnText?.stringValue ||
          defaultData.announcement.btnText
      };
    }

    if (fanRes?.fields) {
      result.fan_of_week = {
        name:
          fanRes.fields.name?.stringValue ||
          defaultData.fan_of_week.name,

        message:
          fanRes.fields.message?.stringValue ||
          defaultData.fan_of_week.message,

        date:
          fanRes.fields.date?.stringValue ||
          defaultData.fan_of_week.date,

        photo:
          fanRes.fields.photo?.stringValue ||
          ''
      };
    }

    if (ntcRes?.fields) {
      result.notice = {
        enabled:
          Boolean(
            ntcRes.fields.enabled?.booleanValue
          ),

        title:
          ntcRes.fields.title?.stringValue ||
          defaultData.notice.title,

        message:
          ntcRes.fields.message?.stringValue ||
          defaultData.notice.message
      };
    }

    cachedAppConfig = result;
    lastAppConfigFetchTime = now;

    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.warn(
      'App config fetch failed:',
      err?.message || err
    );

    return res.json({
      success: true,
      ...defaultData
    });
  }
});

// =====================================================
// YOUTUBE FALLBACK DATA
// =====================================================

const FALLBACK_REELS = [
  {
    videoId: '5qiy3TVjrPY',
    title:
      'Hawabaji Gone Wrong 😂🔥 #shorts #funny',
    thumb:
      'https://i.ytimg.com/vi/5qiy3TVjrPY/hqdefault.jpg'
  },

  {
    videoId: 'ox0J_29FG1c',
    title:
      'Money Follows My Brother 😂💸 #shorts #funny',
    thumb:
      'https://i.ytimg.com/vi/ox0J_29FG1c/hqdefault.jpg'
  },

  {
    videoId: 'mXE_Q1PhH78',
    title:
      'Narendra Modi Ka Khauf 😂🤣 | Naam Sunte Hi Dar Gaya! #shorts #funny',
    thumb:
      'https://i.ytimg.com/vi/mXE_Q1PhH78/hqdefault.jpg'
  },

  {
    videoId: 'BsQ69I7bSGQ',
    title:
      'Bhikari Ka Office 😂🤣 | Jab Bhikari Bhi Businessman Ban Gaya! #shorts #funny',
    thumb:
      'https://i.ytimg.com/vi/BsQ69I7bSGQ/hqdefault.jpg'
  },

  {
    videoId: 'Qsk7Wf88Qhs',
    title:
      'Desi Comedy Dhamaka 😂🔥 #shorts',
    thumb:
      'https://i.ytimg.com/vi/Qsk7Wf88Qhs/hqdefault.jpg'
  }
];

// =====================================================
// YOUTUBE REELS
// =====================================================

app.get('/api/youtube/reels', async (req, res) => {
  const key = cleanText(
    process.env.YOUTUBE_API_KEY || '',
    500
  );

  const channelId =
    'UCVZgUX5-li8xln9JQKZifqA';

  if (!key) {
    return res.json({
      success: true,
      items: FALLBACK_REELS,
      mode: 'offline'
    });
  }

  try {
    const headers = {
      Referer:
        'https://upcomedyhub.github.io/'
    };

    const chRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${encodeURIComponent(key)}`,
      {
        headers
      }
    );

    const chData =
      await chRes.json();

    const uploads =
      chData?.items?.[0]
        ?.contentDetails
        ?.relatedPlaylists
        ?.uploads;

    if (!uploads) {
      return res.json({
        success: true,
        items: FALLBACK_REELS,
        mode: 'offline'
      });
    }

    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploads)}&maxResults=15&key=${encodeURIComponent(key)}`,
      {
        headers
      }
    );

    const plData =
      await plRes.json();

    if (
      !Array.isArray(plData?.items) ||
      !plData.items.length
    ) {
      return res.json({
        success: true,
        items: FALLBACK_REELS,
        mode: 'offline'
      });
    }

    const items = plData.items
      .map((item) => {
        const vid =
          item?.snippet
            ?.resourceId
            ?.videoId;

        return {
          videoId: vid,

          title:
            item?.snippet?.title ||
            'UPComedyHub',

          thumb:
            item?.snippet
              ?.thumbnails
              ?.high
              ?.url ||

            item?.snippet
              ?.thumbnails
              ?.default
              ?.url ||

            (
              vid
                ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
                : ''
            )
        };
      })
      .filter(
        (x) => x.videoId
      );

    return res.json({
      success: true,

      items:
        items.length
          ? items
          : FALLBACK_REELS,

      mode: 'live'
    });
  } catch (err) {
    console.warn(
      'YouTube API unavailable:',
      err?.message || err
    );

    return res.json({
      success: true,
      items: FALLBACK_REELS,
      mode: 'offline'
    });
  }
});

// =====================================================
// VIDEO UPLOAD ENDPOINT (YouTube/Instagram Workflow)
// =====================================================

app.post('/api/upload/video', (req, res) => {
  videoUpload.single('video')(req, res, (err) => {
    if (err) {
      console.error('Video upload multer error:', err);
      const isSize = err.code === 'LIMIT_FILE_SIZE';
      return res.status(400).json({
        success: false,
        error: isSize ? 'Video size exceeds 120MB limit' : (err.message || 'File upload error')
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided'
      });
    }

    const title = cleanText(req.body.title || 'Untitled Video', 200);
    const description = cleanText(req.body.description || '', 2000);
    const isPublic = req.body.isPublic !== 'false' && req.body.isPublic !== false;
    const category = cleanText(req.body.category || 'reel', 50);
    const trimStart = parseFloat(req.body.trimStart) || 0;
    const trimEnd = parseFloat(req.body.trimEnd) || 0;

    const videoUrl = `/uploads/videos/${req.file.filename}`;

    return res.json({
      success: true,
      videoUrl: videoUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      title: title,
      description: description,
      isPublic: isPublic,
      category: category,
      trimStart: trimStart,
      trimEnd: trimEnd,
      trimmedDuration: trimEnd > trimStart ? +(trimEnd - trimStart).toFixed(1) : null,
      timestamp: new Date().toISOString()
    });
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
  const configured =
    Boolean(
      cleanText(
        process.env.GEMINI_API_KEY || '',
        1000
      )
    );

  res.json({
    status: 'ok',

    timestamp:
      new Date().toISOString(),

    aiEnabled:
      configured,

    offlineFallback:
      true,

    backend:
      'vercel'
  });
});

app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(rootDir, 'index.html'));
});

// =====================================================
// LOCAL / CONTAINER SERVER STARTUP
// =====================================================

if (!process.env.VERCEL) {
  const PORT = Number(
    process.env.DEFAULT_APP_PORT ||
    (process.env.PORT && process.env.PORT !== '8080' ? process.env.PORT : 3000)
  );

  app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `UPComedyHub backend running at http://0.0.0.0:${PORT}`
      );
    }
  );
}

// =====================================================
// VERCEL EXPORT
// =====================================================

export default app;

