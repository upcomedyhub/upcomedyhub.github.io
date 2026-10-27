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
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
- Do NOT randomly promote or praise UPComedyHub/Zyro in normal conversation.
- Only share UPComedyHub/Zyro team or developer details if the user specifically asks about them:
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
    return 'Zyro के director **Mayank Bhai** हैं! 🎬🔥';
  }

  // Team
  if (
    /(?:upcomedyhub|zyro).*team|team.*(?:upcomedyhub|zyro)|actors.*(?:upcomedyhub|zyro)|(?:upcomedyhub|zyro).*actors/i.test(text)
  ) {
    return `Zyro की टीम में ये धुरंधर हैं भाई: 🔥

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

async function getGoogleGenAIClass() {
  if (!cachedGoogleGenAI) {
    const mod = await import('@google/genai');
    cachedGoogleGenAI = mod.GoogleGenAI;
  }
  return cachedGoogleGenAI;
}

function shouldUseWebSearch(promptText) {
  if (!promptText) return false;
  const t = promptText.toLowerCase();
  // Only trigger live Google Search grounding when the user asks for current events, news, live info, or factual lookups
  return /\b(news|latest|today|aaj|kal|weather|mausam|score|match|ipl|cricket|price|rate|bitcoin|stock|share|2024|2025|2026|current|live|search|google|who is|what is|where is|when is|kaun hai|kon hai|kya hai|kab hai|kahan hai|update|president|pm|minister|movie|film|box office|result)\b/i.test(t);
}

async function askGemini({ prompt, image, userFacts }) {
  const key = cleanText(
    process.env.GEMINI_API_KEY || '',
    1000
  );

  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const GoogleGenAI = await getGoogleGenAIClass();

  const ai = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const imagePart = extractImage(image);
  const cleanFacts = cleanText(userFacts, 2500);

  // Feature 1: Inject Personalized Dynamic Memory inside [USER PROFILE CONTEXT]
  const contextPrefix = cleanFacts
    ? `[USER PROFILE CONTEXT]\nThe following are verified facts about this user. Use them naturally if relevant:\n${cleanFacts}\n[END OF CONTEXT]\n\n`
    : '';

  const defaultPhotoPrompt =
    'इस फोटो को अपने करीबी दोस्त (bro) की नज़र से देखो! अगर ये सेल्फी या आउटफिट है तो फुल स्वैग में तारीफ और हाइप करो ("एकदम कंटाप/बवाल लग रहे हो भाई! 🔥"), और अगर कोई प्रॉब्लम या स्क्रीनशॉट है तो भाई की तरह सीधा मदद करो।';

  const contents = imagePart
    ? [
        {
          role: 'user',
          parts: [
            {
              inlineData: imagePart
            },
            {
              text: `${contextPrefix}User Message: ${prompt || defaultPhotoPrompt}`
            }
          ]
        }
      ]
    : (contextPrefix ? `${contextPrefix}User Message: ${prompt}` : prompt);

  // Primary: gemini-2.5-flash, followed by Gemini 3+ Flash backup models
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest'
  ];

  let lastError = null;

  const useSearch = !imagePart && shouldUseWebSearch(prompt);

  for (const model of modelsToTry) {
    try {
      const config = {
        systemInstruction: UPCH_SYSTEM_PROMPT,
        temperature: 0.85,
        topP: 0.95
      };

      // Disable thinking budget on gemini-2.5 normal chat for instant sub-second replies
      if (model.startsWith('gemini-2.5') && !useSearch) {
        config.thinkingConfig = { thinkingBudget: 0 };
      }

      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });

      const text = cleanText(
        response?.text,
        12000
      );

      if (text) {
        return text;
      }
    } catch (err) {
      lastError = err;

      console.warn(
        `Gemini model ${model} failed:`,
        err?.message || err
      );

      // Safe fallback: try without tools/thinkingConfig if search grounding was rejected
      if (useSearch) {
        try {
          const fallbackResp = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: UPCH_SYSTEM_PROMPT,
              temperature: 0.85,
              topP: 0.95
            }
          });
          const fbText = cleanText(fallbackResp?.text, 12000);
          if (fbText) return fbText;
        } catch (e2) {}
      }
    }
  }

  throw (
    lastError ||
    new Error('Gemini returned an empty response')
  );
}

// =====================================================
// AI CHAT ENDPOINT
// =====================================================

app.post('/api/ai/chat', async (req, res) => {
  const body = req.body || {};

  const prompt = cleanText(
    body.prompt,
    6000
  );

  const userFacts = cleanText(
    body.userFacts,
    2500
  );

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

  try {
    const text = await askGemini({
      prompt,
      image,
      userFacts
    });

    return res.json({
      success: true,
      text,
      mode: 'gemini'
    });
  } catch (err) {
    console.warn(
      'Gemini unavailable; using offline fallback:',
      err?.message || err
    );

    const text = image
      ? photoFallback()
      : getDesiComedyReply(prompt);

    return res.json({
      success: true,
      text,
      mode: 'offline'
    });
  }
});

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

