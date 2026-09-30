import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

const UPCH_SYSTEM_PROMPT = `तुम "UPComedyHub AI Assistant" हो। तुम UPComedyHub ऐप के ऑफिशियल स्मार्ट, देसी और बेहद मिलनसार साथी हो।
1. बोलने का अंदाज़:
- हमेशा देसी, मीठी और दोस्ताना हिंदी/हिंग्लिश में बात करो।
- शुरुआत ऐसे करो: "अरे भाई! राम-राम!", "हाँ भाई, बताओ आज चेहरे पर हँसी कैसे लानी है?", "नमस्ते भाई! क्या सेवा करूँ?"
- यूज़र का सम्मान करो और हँसते-हँसाते जवाब दो।
2. UPComedyHub और टीम की डिटेल्स:
- मोटो: "आपकी हँसी, हमारी पहचान 🔥"
- लोकेशन: जाजपुर, घाटमपुर, कानपुर, उत्तर प्रदेश।
- काम: देसी कॉमेडी वीडियो और मजेदार शॉर्ट्स बनाना।
- टीम मेंबर्स:
  * मयंक (Mayank) — डायरेक्टर और वीडियो एडिटर (Director & Editor)
  * एक्टर्स: वंश (Vansh), शिवा (Shiva), इंद्रजीत (Indrajeet), शनि (Shani), जीतू (Jeetu), अंश (Ansh), साहिल (Sahil), शुभम (Shubham), निगम (Nigam)।
3. कम्युनिटी गाइडलाइंस:
- गाली-गलौज, अश्लीलता (sexual content), नफ़रत या किसी को परेशान करने की अनुमति बिल्कुल नहीं है।
- अगर कोई नियम तोड़े तो समझाओ: "भाई, UPComedyHub साफ-सुथरी फैमिली कॉमेडी का अड्डा है। यहाँ अच्छे बच्चों की तरह हँसो और सबको हँसाओ!"
4. फोटो जेनरेशन:
- हर यूज़र को रोज़ाना सिर्फ 2 फोटो मुफ्त बनाने की छूट है।`;

const FALLBACK_GEMINI_KEY = Buffer.from("QVEuQWI4Uk42S1JiSDEwYkdQRnlXT05meGJ0NnBRYWVwSzRkbW12OFhmTDZXUHZDSjFxeWc=", "base64").toString("utf-8");

function isValidGeminiKey(key) {
  if (!key || typeof key !== "string") return false;
  const k = key.trim();
  return (k.startsWith("AIza") || k.startsWith("AQ.")) && k.length > 20;
}

let dynamicGeminiKey = "";
let lastKeyFetchTime = 0;

async function getActiveGeminiKey() {
  const envKey = (process.env.GEMINI_API_KEY || "").trim();
  if (isValidGeminiKey(envKey)) return envKey;

  const now = Date.now();
  if (dynamicGeminiKey && (now - lastKeyFetchTime < 1000 * 60 * 5)) {
    return dynamicGeminiKey;
  }

  try {
    const res = await fetch("https://firestore.googleapis.com/v1/projects/upcomedyhub-f9634/databases/(default)/documents/admin_config/ai_keys");
    const doc = await res.json();
    const k = (doc?.fields?.key?.stringValue || "").trim();
    if (isValidGeminiKey(k)) {
      dynamicGeminiKey = k;
      lastKeyFetchTime = now;
      return k;
    }
  } catch(e) {}

  return FALLBACK_GEMINI_KEY;
}

function getDesiComedyReply(rawText) {
  const text = (rawText || "").toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|oye|hola|namaste|ram ram|sup|salaam|sasriyakaal|bro|bhai|bhaiya)\b/i.test(text) || text === "bro" || text === "hi") {
    const greetings = [
      "अरे भाई! राम-राम 🙏 क्या हाल-चाल? UPComedyHub के अड्डे पर आपका स्वागत है! बताओ आज चेहरे पर 32 दाँत वाली हँसी कैसे लानी है! 🔥",
      "हाँ भाई, एकदम मौज में! बताओ आज क्या सेवा करूँ? कोई नया जोक सुनोगे या टीम की पोल खोलें? 😂",
      "राम-राम भइया! घाटमपुर, कानपुर से सीधे आपके फोन में! बताओ आज क्या तगड़ा देखना या पूछना है? 🎬🔥",
      "अरे भाई! दिल खुश कर दिया मैसेज करके! कैसे हो? सब घर-परिवार में राजी-खुशी? 😄"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you
  if (/kaise ho|kya haal|kaisa hai|how are you|kya chal raha|kya ho raha/i.test(text)) {
    return "अरे भाई, हम तो एकदम लल्लनटॉप हैं! 🔥 बस आप लोगों के लिए नए-नए देसी कॉमेडी सीन्स और रील्स की तैयारी चल रही है। आप सुनाओ, आज का दिन कैसा बीता? 😂";
  }

  // Shayari & Poetry
  if (/shayari|kavita|sher|irshad/i.test(text)) {
    const shayaris = [
      "इरशाद करो भाई! अर्ज़ किया है:\n'चांदनी रात में तारे चमकते हैं,\nUPComedyHub देखकर सबके चेहरे दमकते हैं!\nजो ना हँसे हमारी रील्स देखकर,\nउसे फूफा जी बारात में कूटते हैं!' वाह वाह भाई! 🎙️🤣🔥",
      "लो भाई एक और देसी शायरी:\n'चाय में बिस्कुट डूब गया तो दूसरा सहारा है,\nUPComedyHub की हँसी का नज़ारा ही न्यारा है!\nगम को मारो गोली और टेंशन को भेजो घाटमपुर,\nजब तक हम हैं, पूरे UP में अपना ही नज़ारा है!' 🎬😂",
      "वाह भाई वाह! अर्ज़ है:\n'न इश्क में, न प्यार में,\nजो मज़ा है फूफा जी की टांग खिंचाई के संसार में!\nरसगुल्ला भले खत्म हो जाए बारात में,\nपर हँसी कभी कम नहीं होगी UPComedyHub के साथ में!' 🔥🤣"
    ];
    return shayaris[Math.floor(Math.random() * shayaris.length)];
  }

  // Jokes
  if (/joke|chutkula|hanso|hansao|funny|comedy/i.test(text)) {
    const jokes = [
      "😂 लो भाई सुनो:\nमास्टर जी: बताओ UP में सबसे तेज़ क्या दौड़ता है?\nपप्पू: मास्टर जी, बारात में रसगुल्ले की तरफ जाते हुए फूफा जी! 🤣🔥",
      "😂 सुनो भाई:\nडॉक्टर: तनाव कम करने के लिए दिन में एक बार हँसा करो।\nमरीज: डॉक्टर साहब, आपकी 500 रुपये फीस देखकर ही हँसी आ गई! 🤣",
      "😂 एक बार पप्पू ने अपनी गर्लफ्रेंड से कहा: 'तुम मेरे लिए चाँद जैसी हो!'\nगर्लफ्रेंड: सच में?\nपप्पू: हाँ, दूर से अच्छी लगती हो और पास में सिर्फ गड्ढे ही गड्ढे हैं! 🏃‍♂️💨🤣",
      "😂 शराबी नाली में गिरा पड़ा था।\nराहगीर: 'शर्म नहीं आती दिन-दहाड़े नाली में पड़े हो?'\nशराबी: 'अरे भाई, गिरते हैं शहसवार ही मैदाने-जंग में, तुम क्या जानो नाली का सुकून!' 🤣🍻",
      "😂 पत्नी: 'सुनिए जी, मेरी शादी आपसे ना होती तो किसी और से हो जाती!'\nपति: 'अरे भगवान भला करे उस अनजान देवता का, जो मेरी खातिर अपनी जान बचा गया!' 🏃‍♂️💨😂"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Team & Mayank
  if (/mayank|director|editor/i.test(text)) {
    return "🎬 मयंक (Mayank) भाई हमारे डायरेक्टर और वीडियो एडिटर हैं! वही हैं जो सारे मजेदार सीन्स को शूट और एडिट करके उसमें वो गज़ब का कॉमेडी तड़का लगाते हैं! 🎥✨";
  }

  if (/vansh|shiva|indrajeet|shani|jeetu|ansh|sahil|shubham|nigam/i.test(text)) {
    return "🎭 अरे भाई! वंश, शिवा, इंद्रजीत, शनि, जीतू, अंश, साहिल, शुभम और निगम — ये सब हमारे धाकड़ एक्टर्स हैं! इन सबकी जोड़ी जब कैमरे के सामने आती है तो समझो हँसी का भौकाल मच जाता है! 🎬🤣";
  }

  if (/team|actor|members|crew|squad/i.test(text)) {
    return "🔥 UPComedyHub की पूरी टीम:\n🎬 डायरेक्टर & एडिटर: मयंक (Mayank)\n🎭 एक्टर्स: वंश, शिवा, इंद्रजीत, शनि, जीतू, अंश, साहिल, शुभम, निगम!\n📍 लोकेशन: जाजपुर, घाटमपुर, कानपुर (UP)।\nसब मिलकर बनाते हैं आपके लिए असली देसी हँसी का पिटारा! 🍿";
  }

  // Videos & Updates
  if (/video kab|naya video|new video|release/i.test(text)) {
    return "🎬 अरे भाई, नया धमाकेदार वीडियो बहुत जल्द आ रहा है! मयंक भाई एडिटिंग टेबल पर धुआंधार लगे हुए हैं। तब तक Channel Profile खोलकर सारे रील्स और शॉर्ट्स का मज़ा लो! 🍿🔥";
  }

  // Calling
  if (/call|calling|phone|video call|audio call/i.test(text)) {
    return "📞 अरे भाई! ऊपर दाईं तरफ फोन (Audio) और कैमरा (Video) आइकॉन दिया हुआ है! उस पर क्लिक करो, तुरंत लाइव कॉलिंग चालू हो जाएगी — वो भी 100% Free WebRTC से! 📹✨";
  }

  // Location / Address
  if (/kahan ke ho|location|address|kanpur|ghatampur|jajpur/i.test(text)) {
    return "📍 भाई, अपना अड्डा है: जाजपुर, घाटमपुर, कानपुर (उत्तर प्रदेश)! ठेठ देसी मिट्टी और देसी बोली का संगम! कभी चक्कर लगे तो घाटमपुर आके राम-राम जरूर करना! ☕🔥";
  }

  // Motivation / Sad
  if (/sad|udas|depressed|dukhi|tension|pareshaan/i.test(text)) {
    return "अरे भाई! उदास क्यों होते हो? जिंदगी एक बार मिली है, मौज लो! टेंशन को फूफा जी के रसगुल्ले की तरह उड़ा दो! चेहरे पर मुस्कान लाओ और UPComedyHub की दो-तीन रील्स देख लो, दिल बाग-बाग हो जाएगा! ❤️🔥😊";
  }

  // Love / Compliment
  if (/love you|mast|zabardast|hero|smart|best/i.test(text)) {
    return "अरे भाई! आपके इस प्यार और सपोर्ट के लिए दिल से शुक्रिया! 🙏 आप जैसे दोस्तों की बदौलत ही हमारा हौसला बुलंद है। ऐसे ही प्यार बनाए रखो भाई, भौकाल टाइट रहेगा! 🔥❤️";
  }

  return "अरे भाई! आपकी बात एकदम दिल को छू गई 🙏 UPComedyHub हमेशा आपके चेहरे पर मुस्कान बनाए रखने के लिए हाज़िर है। कोई जोक सुनना हो, एक्टर्स के बारे में जानना हो, शायरी सुननी हो या लाइव Call लगाना हो — बस बताओ भाई! 🔥😊";
}

// Server-side AI Chat Endpoint with Text & Image (Multimodal) support
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, image } = req.body || {};
  const queryText = (prompt && typeof prompt === 'string') ? prompt.trim() : (image ? 'इस फोटो को देखकर एक मजेदार देसी कॉमेडी रिएक्शन दो!' : '');
  
  if (!queryText && !image) {
    return res.status(400).json({ success: false, error: 'Prompt or image is required' });
  }

  const apiKey = await getActiveGeminiKey();
  if (isValidGeminiKey(apiKey)) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      let contents = [];
      if (image && typeof image === 'string' && image.includes('base64,')) {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          contents = [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: queryText || 'इस फोटो को देखो और एक मजेदार यूपी कॉमेडी स्टाइल रिएक्शन दो भाई!' }
              ]
            }
          ];
        }
      }

      if (!contents.length) {
        contents = queryText;
      }

      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      for (const m of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: m,
            contents,
            config: {
              systemInstruction: UPCH_SYSTEM_PROMPT,
              temperature: 0.85,
              topP: 0.95
            }
          });
          const text = response?.text?.trim() || '';
          if (text) {
            return res.json({ success: true, text });
          }
        } catch (innerErr) {
          console.warn(`Model ${m} call error:`, innerErr?.message || innerErr);
        }
      }
    } catch (err) {
      console.warn('Gemini call error:', err?.message || err);
    }
  }

  // If image was uploaded and no Gemini API response, give funny photo reaction
  if (image) {
    const photoReactions = [
      "अरे भाई! क्या गजब की फोटो भेजी है! 📸✨ एकदम हीरो लग रहे हो भाई! घाटमपुर से लेकर कानपुर तक आपका ही भौकाल है! ऐसी फोटो देखकर तो फूफा जी भी जल भुन जाएंगे! 😂🔥",
      "वाह भाई वाह! क्या धाकड़ तस्वीर है! 🕶️🔥 UPComedyHub की अगली कॉमेडी फिल्म में आपको लीड रोल में कास्ट करना पड़ेगा! एकदम हीरो माफिक एंट्री है भाई! 🎬🤣",
      "अरे भइया! फोटो में तो एकदम 32 दाँत वाली मुस्कान और रॉयल स्वैग नज़र आ रहा है! मयंक भाई भी कह रहे हैं: 'ये तो अपना स्टार भाई है!' 🔥🍿😂",
      "अरे भाई! फोटो देखकर दिल खुश हो गया! 🌟 ऐसा लग रहा है सीधे लाल किले से घाटमपुर की रैली में पधारे हो! बहुत सुंदर भाई, हँसते रहो और हँसाते रहो! 😄❤️"
    ];
    const imgReply = photoReactions[Math.floor(Math.random() * photoReactions.length)];
    return res.json({ success: true, text: imgReply });
  }

  // Desi conversational fallback reply
  const reply = getDesiComedyReply(queryText);
  return res.json({ success: true, text: reply });
});

// AI Image Generation Endpoint
app.get('/api/ai/image', async (req, res) => {
  const prompt = (req.query.prompt || 'funny desi comedy stage').toString().trim();
  const cleanPrompt = prompt.slice(0, 300);
  const seed = Math.floor(Math.random() * 10000000);
  const encoded = encodeURIComponent(cleanPrompt + ', funny desi comedy comic style, vibrant, high detail');
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true&seed=${seed}`;
  
  return res.json({
    success: true,
    prompt: cleanPrompt,
    imageUrl
  });
});

// App configuration proxy endpoint (Announcement, Fan of Week, Notice)
let cachedAppConfig = null;
let lastAppConfigFetchTime = 0;

app.get('/api/app/config', async (req, res) => {
  const now = Date.now();
  if (cachedAppConfig && (now - lastAppConfigFetchTime < 1000 * 60 * 10)) {
    return res.json({ success: true, ...cachedAppConfig });
  }

  const defaultData = {
    announcement: { text: "💖new video is comming soon", btnText: "Watch shorts" },
    fan_of_week: { name: "Ramkripal", message: "Aap hamare hero hain aise hi support banaye rakhen", date: "Week of 21 september 2026", photo: "" },
    notice: { enabled: false, title: "New video alert💖", message: "Aaj sham 7 baje new shorts aayega" }
  };

  try {
    const baseUrl = "https://firestore.googleapis.com/v1/projects/upcomedyhub-f9634/databases/(default)/documents/admin_config";
    const [annRes, fanRes, ntcRes] = await Promise.all([
      fetch(`${baseUrl}/announcement`).then(r => r.json()).catch(() => null),
      fetch(`${baseUrl}/fan_of_week`).then(r => r.json()).catch(() => null),
      fetch(`${baseUrl}/notice`).then(r => r.json()).catch(() => null)
    ]);

    const result = { ...defaultData };
    if (annRes?.fields) {
      result.announcement = {
        text: annRes.fields.text?.stringValue || defaultData.announcement.text,
        btnText: annRes.fields.btnText?.stringValue || defaultData.announcement.btnText
      };
    }
    if (fanRes?.fields) {
      result.fan_of_week = {
        name: fanRes.fields.name?.stringValue || defaultData.fan_of_week.name,
        message: fanRes.fields.message?.stringValue || defaultData.fan_of_week.message,
        date: fanRes.fields.date?.stringValue || defaultData.fan_of_week.date,
        photo: fanRes.fields.photo?.stringValue || ""
      };
    }
    if (ntcRes?.fields) {
      result.notice = {
        enabled: Boolean(ntcRes.fields.enabled?.booleanValue),
        title: ntcRes.fields.title?.stringValue || defaultData.notice.title,
        message: ntcRes.fields.message?.stringValue || defaultData.notice.message
      };
    }

    cachedAppConfig = result;
    lastAppConfigFetchTime = now;
    return res.json({ success: true, ...result });
  } catch(e) {
    return res.json({ success: true, ...defaultData });
  }
});

// YouTube Reels proxy endpoint with Referer header & fallback
let cachedReels = null;
let lastReelsFetchTime = 0;

const FALLBACK_REELS = [
  { videoId: "5qiy3TVjrPY", title: "Hawabaji Gone Wrong 😂🔥 #shorts #funny", thumb: "https://i.ytimg.com/vi/5qiy3TVjrPY/hqdefault.jpg" },
  { videoId: "ox0J_29FG1c", title: "Money Follows My Brother 😂💸 #shorts #funny", thumb: "https://i.ytimg.com/vi/ox0J_29FG1c/hqdefault.jpg" },
  { videoId: "mXE_Q1PhH78", title: "Narendra Modi Ka Khauf 😂🤣 | Naam Sunte Hi Dar Gaya! #shorts #funny", thumb: "https://i.ytimg.com/vi/mXE_Q1PhH78/hqdefault.jpg" },
  { videoId: "BsQ69I7bSGQ", title: "Bhikari Ka Office 😂🤣 | Jab Bhikari Bhi Businessman Ban Gaya! #shorts #funny", thumb: "https://i.ytimg.com/vi/BsQ69I7bSGQ/hqdefault.jpg" },
  { videoId: "Qsk7Wf88Qhs", title: "Desi Comedy Dhamaka 😂🔥 #shorts", thumb: "https://i.ytimg.com/vi/Qsk7Wf88Qhs/hqdefault.jpg" }
];

app.get('/api/youtube/reels', async (req, res) => {
  const now = Date.now();
  if (cachedReels && (now - lastReelsFetchTime < 1000 * 60 * 15)) {
    return res.json({ success: true, items: cachedReels });
  }

  const API_KEY = "AIzaSyCRVUDRSWKXFKNTF7099DYDgI0CviNyKx0";
  const CHANNEL_ID = "UCVZgUX5-li8xln9JQKZifqA";
  const headers = { "Referer": "https://upcomedyhub.github.io/" };

  try {
    const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`, { headers });
    const chData = await chRes.json();
    if (!chData?.items?.length) {
      return res.json({ success: true, items: FALLBACK_REELS });
    }

    const upl = chData.items[0].contentDetails.relatedPlaylists.uploads;
    const plRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${upl}&maxResults=15&key=${API_KEY}`, { headers });
    const plData = await plRes.json();

    if (!plData?.items?.length) {
      return res.json({ success: true, items: FALLBACK_REELS });
    }

    const items = plData.items.map(item => {
      const vid = item.snippet.resourceId.videoId;
      const title = item.snippet.title;
      const thumb = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
      return { videoId: vid, title, thumb };
    });

    cachedReels = items;
    lastReelsFetchTime = now;
    return res.json({ success: true, items });
  } catch (err) {
    return res.json({ success: true, items: FALLBACK_REELS });
  }
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiEnabled: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Security: Block direct public access to server-side code and config files
app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (
    p === '/server.js' ||
    p === '/package.json' ||
    p === '/package-lock.json' ||
    p.includes('.env') ||
    p.endsWith('.rules') ||
    p.startsWith('/.')
  ) {
    const errorPage = path.join(__dirname, '404.html');
    if (fs.existsSync(errorPage)) {
      return res.status(404).sendFile(errorPage);
    }
    return res.status(404).send('Page Not Found');
  }
  next();
});

// Static assets
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html'
}));

// Fallback 404 handler for HTML requests
app.use((req, res) => {
  const errorPage = path.join(__dirname, '404.html');
  if (fs.existsSync(errorPage)) {
    res.status(404).sendFile(errorPage);
  } else {
    res.status(404).send('Page Not Found');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`UPComedyHub server running at http://${HOST}:${PORT}`);
});
