import express from 'express';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));

// CORS — GitHub Pages aur Vercel dono se accessible
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

तुम UPComedyHub ऐप के AI assistant हो। तुम्हारा काम हर user से natural, helpful, respectful और context-aware तरीके से बातचीत करना है।

IMPORTANT BEHAVIOR RULES:

1. बातचीत का अंदाज़
- हमेशा friendly, natural और conversational हिंदी/हिंग्लिश में बात करो।
- हर जवाब में UPComedyHub की तारीफ़ मत करो।
- हर जवाब में "भाई" या "भइया" कहना जरूरी नहीं है।
- User जिस भाषा और tone में बात करे, उसी के अनुसार natural जवाब दो।
- User ने जो पूछा है, उसी का जवाब दो। बिना जरूरत topic को UPComedyHub की तरफ मत मोड़ो।

2. Greetings
- अगर user "Ram Ram", "राम राम" या इसी तरह का अभिवादन करे, तभी जवाब में "राम-राम" इस्तेमाल करो।
- अगर user "Hi", "Hello" या "Hey" कहे, तो natural तरीके से Hi/Hello/Hey से जवाब दो।
- सुबह के context में जरूरत हो तो "Good morning" कह सकते हो।
- रात के context में जरूरत हो तो "Good night" कह सकते हो।
- हर conversation की शुरुआत "राम-राम" से मत करो।
- Greeting को user के actual message और context के अनुसार रखो।

3. UPComedyHub की जानकारी
UPComedyHub की internal/team information तभी बताओ जब user specifically UPComedyHub, उसके founder/developer/director/team या उससे संबंधित जानकारी पूछे।

UPComedyHub का मुख्य developer:
- Mayank

Mayank का मुख्य दोस्त:
- Saurabh

यदि user पूछे "UPComedyHub का developer कौन है?", तभी बताओ:
"UPComedyHub के developer Mayank हैं।"

यदि user पूछे "Mayank का main दोस्त कौन है?", तभी बताओ:
"Mayank के main दोस्त Saurabh हैं।"

4. UPComedyHub Director और Team
यदि user specifically पूछे:
- "UPComedyHub का director कौन है?"
- "UPComedyHub की team कौन है?"
- "UPComedyHub को कौन चलाता है?"
- या इसी तरह का कोई specific सवाल,

तभी उपलब्ध official team information बताओ।

Director:
- Mayank (Mayank)

Team/Actors:
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

6. UPComedyHub के बारे में सामान्य सवाल
अगर user specifically UPComedyHub के बारे में पूछता है, तभी ऐप के features, creators, videos, community या उपलब्ध जानकारी के आधार पर जवाब दो।

7. Personal information
Mayank, Saurabh या team members की जानकारी तभी बताओ जब user specifically उस जानकारी के बारे में पूछे।
बिना जरूरत personal/team information repeat मत करो।

8. Safety
- गाली-गलौज, अश्लीलता, नफरत, harassment या किसी को नुकसान पहुंचाने में मदद मत करो।
- जरूरत होने पर साफ-सुथरे और safe alternative की तरफ guide करो।

9. सबसे जरूरी rule
User के सवाल का direct और useful answer दो।
UPComedyHub को promote या praise करना तभी करो जब user specifically UPComedyHub के बारे में पूछ रहा हो या promotion मांग रहा हो।
Normal conversation में AI एक सामान्य intelligent assistant की तरह behave करे।`;
function cleanText(value, max = 6000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function getDesiComedyReply(rawText) {
  const text = cleanText(rawText, 1200).toLowerCase();

  if (/^(hi|hello|hey|oye|hola|namaste|ram ram|sup|salaam|sasriyakaal|bro|bhai|bhaiya)\b/i.test(text) || text === 'bro' || text === 'hi') {
    const greetings = [
      'अरे भाई! राम-राम 🙏 क्या हाल-चाल? UPComedyHub के अड्डे पर आपका स्वागत है! बताओ आज क्या तगड़ा करना है! 🔥',
      'हाँ भाई, एकदम मौज में! बताओ आज क्या सेवा करूँ? कोई जोक सुनोगे या टीम की बातें करें? 😂',
      'राम-राम भइया! UPComedyHub में स्वागत है! बताओ आज क्या देखना या पूछना है? 🎬🔥',
      'अरे भाई! मैसेज करके दिल खुश कर दिया! कैसे हो? 😄'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (/kaise ho|kya haal|kaisa hai|how are you|kya chal raha|kya ho raha/i.test(text)) {
    return 'अरे भाई, हम तो एकदम लल्लनटॉप हैं! 🔥 बस आप लोगों के लिए नए-नए देसी कॉमेडी सीन्स और रील्स की तैयारी चल रही है। आप सुनाओ, आज का दिन कैसा बीता? 😂';
  }

  if (/shayari|kavita|sher|irshad/i.test(text)) {
    return 'इरशाद करो भाई! अर्ज़ है:\n\'चाय की प्याली और हँसी का नज़ारा,\nUPComedyHub ने कर दिया दिन तुम्हारा प्यारा!\nटेंशन को भेजो छुट्टी पर,\nऔर हँसी को बनाओ अपना सहारा!\' 🎙️🤣🔥';
  }

  if (/joke|chutkula|hanso|hansao|funny|comedy/i.test(text)) {
    const jokes = [
      '😂 मास्टर जी: बताओ सबसे तेज़ क्या दौड़ता है?\nपप्पू: सर, छुट्टी की घंटी सुनते ही छात्र! 🤣',
      '😂 डॉक्टर: तनाव कम करने के लिए हँसा करो।\nमरीज: फीस बताइए डॉक्टर साहब… हँसी अभी आती है! 🤣',
      '😂 दोस्त: भाई पढ़ाई कैसी चल रही?\nमैं: किताब खुली है, बस दिमाग अभी loading में है! 😂'
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (/mayank|director|editor/i.test(text)) {
    return '🎬 मयंक (Mayank) भाई UPComedyHub के डायरेक्टर और वीडियो एडिटर हैं! वही मजेदार सीन्स को शूट और एडिट करके कॉमेडी का तड़का लगाते हैं! 🎥✨';
  }

  if (/vansh|shiva|indrajeet|shani|jeetu|ansh|sahil|shubham|nigam/i.test(text)) {
    return '🎭 वंश, शिवा, इंद्रजीत, शनि, जीतू, अंश, साहिल, शुभम और निगम हमारे एक्टर्स हैं! कैमरे के सामने आते ही हँसी का भौकाल शुरू! 🎬🤣';
  }

  if (/team|actor|members|crew|squad/i.test(text)) {
    return '🔥 UPComedyHub टीम:\n🎬 डायरेक्टर & एडिटर: मयंक (Mayank)\n🎭 एक्टर्स: वंश, शिवा, इंद्रजीत, शनि, जीतू, अंश, साहिल, शुभम, निगम।\n📍 जाजपुर, घाटमपुर, कानपुर (UP)।';
  }

  if (/video kab|naya video|new video|release/i.test(text)) {
    return '🎬 नया धमाकेदार वीडियो बहुत जल्द! तब तक UPComedyHub के Shorts और पुराने वीडियो का मज़ा लो भाई! 🍿🔥';
  }

  if (/call|calling|phone|video call|audio call/i.test(text)) {
    return '📞 कॉलिंग फीचर ऐप में उपलब्ध हो तो ऊपर दिए Audio/Video Call विकल्प से शुरू कर सकते हो। अगर नेटवर्क या WebRTC उपलब्ध न हो तो बाद में फिर कोशिश करना।';
  }

  if (/kahan ke ho|location|address|kanpur|ghatampur|jajpur/i.test(text)) {
    return '📍 UPComedyHub का अड्डा जाजपुर, घाटमपुर, कानपुर (उत्तर प्रदेश) है। 🔥';
  }

  if (/sad|udas|dukhi|tension|pareshaan/i.test(text)) {
    return 'अरे भाई, थोड़ा ब्रेक लो, पानी पीओ, किसी भरोसेमंद अपने से बात करो और मन हल्का करो। ❤️ चाहो तो मैं तुम्हारा ध्यान किसी हल्की-फुल्की बात या जोक की तरफ मोड़ देता हूँ।';
  }

  if (/love you|mast|zabardast|hero|smart|best/i.test(text)) {
    return 'अरे भाई! आपके प्यार और सपोर्ट के लिए दिल से शुक्रिया! 🙏 ऐसे ही प्यार बनाए रखो, भौकाल टाइट रहेगा! 🔥❤️';
  }

  return 'अरे भाई! आपकी बात समझ गया 🙏 UPComedyHub AI अभी offline fallback mode में है, लेकिन मैं फिर भी बेसिक सवालों, जोक्स और UPComedyHub की जानकारी में मदद कर सकता हूँ। Gemini वापस आते ही full AI responses फिर चालू हो जाएंगे! 🔥😊';
}

function photoFallback() {
  const replies = [
    'अरे भाई! फोटो मिल गई 📸✨ Gemini अभी available नहीं है, इसलिए offline mode में हूँ। फोटो के बारे में detailed AI analysis Gemini वापस आने पर कर पाऊँगा। 🔥',
    'वाह भाई! 📸 फोटो receive हो गई। अभी offline fallback चल रहा है, इसलिए full vision analysis नहीं कर पा रहा। Gemini online होते ही detail में देखूँगा! 😄',
    '📸 फोटो आ गई भाई! अभी offline mode active है। Basic chat चल रही है; photo vision analysis के लिए Gemini service वापस online होने का इंतज़ार करना पड़ेगा।'
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function extractImage(image) {
  if (typeof image !== 'string' || !image.startsWith('data:') || !image.includes(';base64,')) return null;
  const match = image.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

async function askGemini({ prompt, image }) {
  const key = cleanText(process.env.GEMINI_API_KEY || '', 1000);
  if (!key) throw new Error('GEMINI_API_KEY is not configured');

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: key });

  const imagePart = extractImage(image);

  const contents = imagePart
    ? [{
        role: 'user',
        parts: [
          { inlineData: imagePart },
          {
            text:
              prompt ||
              'इस फोटो को देखो और एक मजेदार यूपी कॉमेडी स्टाइल रिएक्शन दो भाई!'
          }
        ]
      }]
    : prompt;

  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: UPCH_SYSTEM_PROMPT,
          temperature: 0.85,
          topP: 0.95
        }
      });

      const text = cleanText(response?.text, 12000);

      if (text) return text;
    } catch (err) {
      lastError = err;
      console.warn(
        `Gemini model ${model} failed:`,
        err?.message || err
      );
    }
  }

  throw lastError || new Error('Gemini returned an empty response');
}

// Main AI endpoint
app.post('/api/ai/chat', async (req, res) => {
  const body = req.body || {};
  const prompt = cleanText(body.prompt, 6000);
  const image = typeof body.image === 'string' ? body.image : '';

  if (!prompt && !image) {
    return res.status(400).json({ success: false, error: 'Prompt or image is required' });
  }

  try {
    const text = await askGemini({ prompt, image });
    return res.json({ success: true, text, mode: 'gemini' });
  } catch (err) {
    console.warn('Gemini unavailable; using offline fallback:', err?.message || err);
    const text = image ? photoFallback() : getDesiComedyReply(prompt);
    return res.json({ success: true, text, mode: 'offline' });
  }
});

// Image generation endpoint
app.get('/api/ai/image', (req, res) => {
  const prompt = cleanText(req.query.prompt || 'funny desi comedy stage', 300) || 'funny desi comedy stage';
  const seed = Math.floor(Math.random() * 10000000);
  const encoded = encodeURIComponent(`${prompt}, funny desi comedy comic style, vibrant, high detail`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true&seed=${seed}`;
  return res.json({ success: true, prompt, imageUrl });
});

let cachedAppConfig = null;
let lastAppConfigFetchTime = 0;

app.get('/api/app/config', async (req, res) => {
  const now = Date.now();
  if (cachedAppConfig && now - lastAppConfigFetchTime < 10 * 60 * 1000) {
    return res.json({ success: true, ...cachedAppConfig });
  }

  const defaultData = {
    announcement: { text: '💖new video is comming soon', btnText: 'Watch shorts' },
    fan_of_week: { name: 'Ramkripal', message: 'Aap hamare hero hain aise hi support banaye rakhen', date: 'Week of 21 september 2026', photo: '' },
    notice: { enabled: false, title: 'New video alert💖', message: 'Aaj sham 7 baje new shorts aayega' }
  };

  try {
    const baseUrl = 'https://firestore.googleapis.com/v1/projects/upcomedyhub-f9634/databases/(default)/documents/admin_config';
    const [annRes, fanRes, ntcRes] = await Promise.all([
      fetch(`${baseUrl}/announcement`).then(r => r.json()).catch(() => null),
      fetch(`${baseUrl}/fan_of_week`).then(r => r.json()).catch(() => null),
      fetch(`${baseUrl}/notice`).then(r => r.json()).catch(() => null)
    ]);

    const result = { ...defaultData };
    if (annRes?.fields) result.announcement = {
      text: annRes.fields.text?.stringValue || defaultData.announcement.text,
      btnText: annRes.fields.btnText?.stringValue || defaultData.announcement.btnText
    };
    if (fanRes?.fields) result.fan_of_week = {
      name: fanRes.fields.name?.stringValue || defaultData.fan_of_week.name,
      message: fanRes.fields.message?.stringValue || defaultData.fan_of_week.message,
      date: fanRes.fields.date?.stringValue || defaultData.fan_of_week.date,
      photo: fanRes.fields.photo?.stringValue || ''
    };
    if (ntcRes?.fields) result.notice = {
      enabled: Boolean(ntcRes.fields.enabled?.booleanValue),
      title: ntcRes.fields.title?.stringValue || defaultData.notice.title,
      message: ntcRes.fields.message?.stringValue || defaultData.notice.message
    };

    cachedAppConfig = result;
    lastAppConfigFetchTime = now;
    return res.json({ success: true, ...result });
  } catch {
    return res.json({ success: true, ...defaultData });
  }
});

const FALLBACK_REELS = [
  { videoId: '5qiy3TVjrPY', title: 'Hawabaji Gone Wrong 😂🔥 #shorts #funny', thumb: 'https://i.ytimg.com/vi/5qiy3TVjrPY/hqdefault.jpg' },
  { videoId: 'ox0J_29FG1c', title: 'Money Follows My Brother 😂💸 #shorts #funny', thumb: 'https://i.ytimg.com/vi/ox0J_29FG1c/hqdefault.jpg' },
  { videoId: 'mXE_Q1PhH78', title: 'Narendra Modi Ka Khauf 😂🤣 | Naam Sunte Hi Dar Gaya! #shorts #funny', thumb: 'https://i.ytimg.com/vi/mXE_Q1PhH78/hqdefault.jpg' },
  { videoId: 'BsQ69I7bSGQ', title: 'Bhikari Ka Office 😂🤣 | Jab Bhikari Bhi Businessman Ban Gaya! #shorts #funny', thumb: 'https://i.ytimg.com/vi/BsQ69I7bSGQ/hqdefault.jpg' },
  { videoId: 'Qsk7Wf88Qhs', title: 'Desi Comedy Dhamaka 😂🔥 #shorts', thumb: 'https://i.ytimg.com/vi/Qsk7Wf88Qhs/hqdefault.jpg' }
];

app.get('/api/youtube/reels', async (req, res) => {
  const key = cleanText(process.env.YOUTUBE_API_KEY, 500);
  const channelId = 'UCVZgUX5-li8xln9JQKZifqA';

  if (!key) return res.json({ success: true, items: FALLBACK_REELS, mode: 'offline' });

  try {
    const headers = { Referer: 'https://upcomedyhub.github.io/' };
    const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${encodeURIComponent(key)}`, { headers });
    const chData = await chRes.json();
    const uploads = chData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) return res.json({ success: true, items: FALLBACK_REELS, mode: 'offline' });

    const plRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploads)}&maxResults=15&key=${encodeURIComponent(key)}`, { headers });
    const plData = await plRes.json();
    if (!Array.isArray(plData?.items) || !plData.items.length) {
      return res.json({ success: true, items: FALLBACK_REELS, mode: 'offline' });
    }

    const items = plData.items.map(item => {
      const vid = item?.snippet?.resourceId?.videoId;
      return {
        videoId: vid,
        title: item?.snippet?.title || 'UPComedyHub',
        thumb: item?.snippet?.thumbnails?.high?.url || item?.snippet?.thumbnails?.default?.url || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : '')
      };
    }).filter(x => x.videoId);

    return res.json({ success: true, items: items.length ? items : FALLBACK_REELS, mode: 'live' });
  } catch {
    return res.json({ success: true, items: FALLBACK_REELS, mode: 'offline' });
  }
});

app.get('/api/health', (req, res) => {
  const configured = Boolean(cleanText(process.env.GEMINI_API_KEY || '', 1000));
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiEnabled: configured,
    offlineFallback: true,
    backend: 'vercel'
  });
});

// Local dev mode (only when run directly)
if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, () => {
    console.log(`UPComedyHub local backend running at http://localhost:${PORT}`);
  });
}

export default app;
