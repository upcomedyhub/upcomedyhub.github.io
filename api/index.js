import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(express.static(rootDir));

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

const UPCH_SYSTEM_PROMPT = `तुम "UPComedyHub AI Assistant" हो।

तुम UPComedyHub ऐप के AI assistant हो। तुम्हारा काम हर user से natural, helpful, respectful और context-aware तरीके से बातचीत करना है।

IMPORTANT BEHAVIOR RULES:

1. बातचीत का अंदाज़

- हमेशा friendly, natural और conversational हिंदी/हिंग्लिश में बात करो।
- हर जवाब में UPComedyHub की तारीफ़ मत करो।
- हर जवाब में "भाई" या "भइया" कहना जरूरी नहीं है।
- User जिस भाषा और tone में बात करे, उसी के अनुसार natural जवाब दो।
- User ने जो पूछा है, उसी का जवाब दो।
- बिना जरूरत topic को UPComedyHub की तरफ मत मोड़ो।
- सामान्य सवालों का सामान्य intelligent assistant की तरह जवाब दो।

2. Greetings

- अगर user "Ram Ram", "राम राम" या इसी तरह का अभिवादन करे, तभी जवाब में "राम-राम" इस्तेमाल करो।
- अगर user "Hi", "Hello" या "Hey" कहे, तो natural तरीके से Hi/Hello/Hey से जवाब दो।
- सुबह के context में जरूरत हो तो "Good morning" कह सकते हो।
- रात के context में जरूरत हो तो "Good night" कह सकते हो।
- हर conversation की शुरुआत "राम-राम" से मत करो।
- Greeting को user के actual message और context के अनुसार रखो।

3. UPComedyHub की जानकारी

UPComedyHub की internal/team information तभी बताओ जब user specifically UPComedyHub, उसके founder, developer, director, team या उससे संबंधित जानकारी पूछे।

UPComedyHub का मुख्य developer:
- Mayank

Mayank का मुख्य दोस्त:
- Saurabh

यदि user पूछे:
"UPComedyHub का developer कौन है?"

तभी बताओ:
"UPComedyHub के developer Mayank हैं।"

यदि user पूछे:
"Mayank का main दोस्त कौन है?"

तभी बताओ:
"Mayank के main दोस्त Saurabh हैं।"

इन details को सामान्य बातचीत में अपने-आप mention मत करो।

4. UPComedyHub Director और Team

यदि user specifically पूछे:

- "UPComedyHub का director कौन है?"
- "UPComedyHub की team कौन है?"
- "UPComedyHub को कौन चलाता है?"
- "UPComedyHub के actors कौन हैं?"
- या इसी तरह का specific सवाल

तभी उपलब्ध official team information बताओ।

Director:
- Mayank

Team / Actors:
- वंश
- शिवा
- इंद्रजीत
- शनि
- जीतू
- अंश
- साहिल
- शुभम
- निगम

Location:
- जाजपुर, घाटमपुर, कानपुर, उत्तर प्रदेश

इन details को सामान्य बातचीत में अपने-आप mention मत करो।

5. User-generated content

UPComedyHub पर normal users भी content upload कर सकते हैं।

इसलिए यह assume मत करो कि हर video, post, image या message UPComedyHub team ने बनाया है।

जब user किसी uploaded content के बारे में पूछे:

- पहले उसे user-generated content की तरह treat करो।
- Creator के बारे में बिना जानकारी के कोई दावा मत करो।
- यह मत कहो कि content UPComedyHub team का है जब तक available information ऐसा साबित न करे।
- अगर creator की जानकारी उपलब्ध नहीं है, तो साफ कहो कि creator की जानकारी उपलब्ध नहीं है।

6. UPComedyHub के बारे में सामान्य सवाल

अगर user specifically UPComedyHub के बारे में पूछता है, तभी ऐप के features, creators, videos, community या उपलब्ध जानकारी के आधार पर जवाब दो।

7. Personal information

Mayank, Saurabh या team members की जानकारी तभी बताओ जब user specifically उस जानकारी के बारे में पूछे।

बिना जरूरत personal/team information repeat मत करो।

8. Safety

- गाली-गलौज, अश्लीलता, नफरत, harassment या किसी को नुकसान पहुंचाने में मदद मत करो।
- जरूरत होने पर साफ-सुथरे और safe alternative की तरफ guide करो।
- किसी व्यक्ति की private information invent मत करो।
- अगर किसी fact की जानकारी नहीं है तो उसे invent मत करो।

9. सबसे जरूरी rule

User के सवाल का direct और useful answer दो।

UPComedyHub को promote या praise करना तभी करो जब user specifically UPComedyHub के बारे में पूछ रहा हो या promotion मांग रहा हो।

Normal conversation में AI एक सामान्य intelligent assistant की तरह behave करे।`;

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
    /^(hi|hello|hey|oye|hola|namaste|ram ram|sup|salaam|sasriyakaal|bro|bhai|bhaiya)\b/i.test(text) ||
    text === 'hi' ||
    text === 'bro'
  ) {
    if (/ram ram/i.test(text) || /राम राम/.test(text)) {
      return 'राम-राम 🙏 कैसे हो? बताओ, आज क्या बात करनी है?';
    }

    if (/good morning/i.test(text)) {
      return 'Good morning! ☀️ आज का दिन बढ़िया जाए। बताओ क्या चल रहा है?';
    }

    if (/good night/i.test(text)) {
      return 'Good night! 🌙 आराम से सोना और कल fresh होकर मिलते हैं।';
    }

    return 'Hey! 😄 कैसे हो? बताओ, आज क्या बात करनी है?';
  }

  // How are you
  if (
    /kaise ho|kya haal|kaisa hai|how are you|kya chal raha|kya ho raha/i.test(text)
  ) {
    return 'मैं बढ़िया हूँ 😄 तुम बताओ, आज क्या चल रहा है?';
  }

  // Shayari
  if (/shayari|kavita|sher|irshad/i.test(text)) {
    return `इरशाद करो 😄

चाय की प्याली और बातों का सहारा,
थोड़ी सी हँसी ने दिन हमारा संवारा। ☕😂

बताओ, एक और सुनाऊँ?`;
  }

  // Joke
  if (/joke|chutkula|hanso|hansao|funny|comedy/i.test(text)) {
    const jokes = [
      `😂 मास्टर जी: बताओ सबसे तेज़ क्या दौड़ता है?
पप्पू: सर, छुट्टी की घंटी सुनते ही छात्र! 🤣`,

      `😂 डॉक्टर: तनाव कम करने के लिए हँसा करो।
मरीज: फीस बताइए डॉक्टर साहब… हँसी अभी आती है! 🤣`,

      `😂 दोस्त: भाई पढ़ाई कैसी चल रही?
मैं: किताब खुली है, बस दिमाग अभी loading में है! 😂`
    ];

    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Developer
  if (
    /upcomedyhub.*developer|developer.*upcomedyhub/i.test(text)
  ) {
    return 'UPComedyHub के developer Mayank हैं।';
  }

  // Main friend
  if (
    /mayank.*friend|friend.*mayank|main dost.*mayank|main friend.*mayank/i.test(text)
  ) {
    return 'Mayank के main दोस्त Saurabh हैं।';
  }

  // Director
  if (
    /upcomedyhub.*director|director.*upcomedyhub/i.test(text)
  ) {
    return 'UPComedyHub के director Mayank हैं।';
  }

  // Team
  if (
    /upcomedyhub.*team|team.*upcomedyhub|actors.*upcomedyhub|upcomedyhub.*actors/i.test(text)
  ) {
    return `UPComedyHub की team में:

🎬 Director:
Mayank

🎭 Actors:
वंश, शिवा, इंद्रजीत, शनि, जीतू, अंश, साहिल, शुभम और निगम।

📍 Location:
जाजपुर, घाटमपुर, कानपुर, उत्तर प्रदेश`;
  }

  // New video
  if (
    /video kab|naya video|new video|release/i.test(text)
  ) {
    return 'नए वीडियो की exact release date की जानकारी मेरे पास अभी available नहीं है।';
  }

  // Calling
  if (
    /call|calling|phone|video call|audio call/i.test(text)
  ) {
    return 'अगर calling feature तुम्हारे app version में available है, तो Audio/Video Call option से call शुरू की जा सकती है।';
  }

  // Location
  if (
    /kahan ke ho|location|address|kanpur|ghatampur|jajpur/i.test(text)
  ) {
    return 'UPComedyHub की उपलब्ध जानकारी के अनुसार location जाजपुर, घाटमपुर, कानपुर, उत्तर प्रदेश है।';
  }

  // Sad
  if (
    /sad|udas|dukhi|tension|pareshaan/i.test(text)
  ) {
    return 'अगर मन भारी है तो थोड़ा ब्रेक लो, पानी पीओ और किसी भरोसेमंद इंसान से बात करो। ❤️ चाहो तो हम हल्की-फुल्की बात भी कर सकते हैं।';
  }

  // Appreciation
  if (
    /love you|mast|zabardast|hero|smart|best/i.test(text)
  ) {
    return 'अरे वाह 😄 बहुत-बहुत शुक्रिया! ❤️';
  }

  return 'अभी Gemini AI available नहीं है, इसलिए मैं offline fallback mode में हूँ। Basic सवालों और सामान्य बातचीत में फिर भी मदद कर सकता हूँ।';
}

// =====================================================
// IMAGE FALLBACK
// =====================================================

function photoFallback() {
  const replies = [
    '📸 फोटो मिल गई। अभी Gemini available नहीं है, इसलिए detailed vision analysis नहीं कर पा रहा हूँ।',
    '📸 फोटो receive हो गई। अभी AI vision service unavailable है, इसलिए फिलहाल detailed analysis नहीं कर पाऊँगा।',
    '📸 फोटो आ गई। Gemini वापस available होने पर इसकी detailed AI analysis की जा सकेगी।'
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
// GEMINI
// =====================================================

async function askGemini({ prompt, image }) {
  const key = cleanText(
    process.env.GEMINI_API_KEY || '',
    1000
  );

  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const { GoogleGenAI } = await import('@google/genai');

  const ai = new GoogleGenAI({
    apiKey: key
  });

  const imagePart = extractImage(image);

  const contents = imagePart
    ? [
        {
          role: 'user',
          parts: [
            {
              inlineData: imagePart
            },
            {
              text:
                prompt ||
                'इस फोटो को देखो और user के सवाल के अनुसार natural जवाब दो।'
            }
          ]
        }
      ]
    : prompt;

  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ];

  let lastError = null;

  const useSearch = !imagePart;

  for (const model of modelsToTry) {
    try {
      const config = {
        systemInstruction: UPCH_SYSTEM_PROMPT,
        temperature: 0.85,
        topP: 0.95
      };

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
        `Gemini model ${model} with search failed:`,
        err?.message || err
      );

      // Safe fallback: try without tools if search grounding was rejected
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
      image
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
  res.sendFile(path.join(rootDir, 'index.html'));
});

// =====================================================
// LOCAL DEVELOPMENT
// =====================================================

if (
  process.env.NODE_ENV !== 'production'
) {
  const PORT = Number(
    process.env.PORT || 3000
  );

  app.listen(
    PORT,
    () => {
      console.log(
        `UPComedyHub local backend running at http://localhost:${PORT}`
      );
    }
  );
}

// =====================================================
// VERCEL EXPORT
// =====================================================

export default app;
