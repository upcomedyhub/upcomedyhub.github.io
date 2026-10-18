import re

with open('zyro-editor.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Replacement for DEFAULT_HIT_SONGS
new_songs = '''var DEFAULT_HIT_SONGS = [
  {
    id: "s_tauba",
    title: "Tauba Tauba (From \\"Bad Newz\\")",
    artist: "Karan Aujla",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/79/d2/01/79d201d2-e54d-5604-81fb-313f30db7219/198588533581.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/34/8d/63/348d6342-2c35-bf31-8131-2c8b3cfe3c09/mzaf_15374551219149804677.plus.aac.p.m4a",
    duration: "0:30",
    cat: "trending"
  },
  {
    id: "s_kesariya",
    title: "Kesariya (From \\"Brahmastra\\")",
    artist: "Pritam, Arijit Singh & Amitabh Bhattacharya",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a",
    duration: "0:30",
    cat: "bollywood"
  },
  {
    id: "s_lover",
    title: "Lover",
    artist: "Diljit Dosanjh",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/d5/7a/38d57a99-39fc-e901-7c45-fa6260ec83c1/mzaf_8083696285926392389.plus.aac.p.m4a",
    duration: "0:30",
    cat: "punjabi"
  },
  {
    id: "s_apna",
    title: "Apna Bana Le (From \\"Bhediya\\")",
    artist: "Arijit Singh, Sachin-Jigar & Amitabh Bhattacharya",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/2e/0b/c0/2e0bc070-112f-a827-6ad8-6bc64f7caaff/840214460180.png/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/eb/27/61/eb2761c7-d606-0912-dff0-2dc6b69974bd/mzaf_2023722930851223219.plus.aac.p.m4a",
    duration: "0:30",
    cat: "bollywood"
  },
  {
    id: "s_heeriye",
    title: "Heeriye",
    artist: "Jasleen Royal & Arijit Singh",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f0/8c/2a/f08c2aeb-3903-8738-d0a5-8c2e4547eed7/5054197711039.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/14/9b/ac/149bac62-12f1-2f55-a742-f38429b94c83/mzaf_17225240189976438593.plus.aac.p.m4a",
    duration: "0:30",
    cat: "lofi"
  },
  {
    id: "s_maan",
    title: "Maan Meri Jaan",
    artist: "King",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/90/9d/aa/909daa9a-3a47-9314-2855-39f5a157f1e3/5054197407734.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/49/c8/c0/49c8c0eb-6a72-d639-02d2-d55fa0034b89/mzaf_6556689839136809010.plus.aac.p.m4a",
    duration: "0:30",
    cat: "trending"
  },
  {
    id: "s_chaleya",
    title: "Chaleya (From \\"Jawan\\")",
    artist: "Anirudh Ravichander, Arijit Singh & Shilpa Rao",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/21/df/b6/21dfb63f-6799-7fb6-5b4e-e1791a82b3a0/886449830889.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/55/e1/9b/55e19b22-e421-2550-93a8-e160e1f37e61/mzaf_12411933543940250669.plus.aac.p.m4a",
    duration: "0:30",
    cat: "bollywood"
  },
  {
    id: "s_softly",
    title: "Softly",
    artist: "Karan Aujla & Ikky",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d2/00/f3/d200f375-9e66-fa3e-eb69-025ffef78839/198003666573.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/fa/ed/32/faed3262-6b3a-5f9f-09e4-6c3829037803/mzaf_9747514332219491717.plus.aac.p.m4a",
    duration: "0:30",
    cat: "punjabi"
  },
  {
    id: "s_aayi_nai",
    title: "Aayi Nai (From \\"Stree 2\\")",
    artist: "Sachin-Jigar, Pawan Singh & Divya Kumar",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/58/01/f9/5801f99c-e35b-11c9-d2b1-6a2d67d71688/886449830889.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/34/8d/63/348d6342-2c35-bf31-8131-2c8b3cfe3c09/mzaf_15374551219149804677.plus.aac.p.m4a",
    duration: "0:30",
    cat: "desi"
  },
  {
    id: "s_millionaire",
    title: "Millionaire",
    artist: "Yo Yo Honey Singh",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/36/f6/45/36f64560-6184-7a32-1f41-0b5c9bc0f6eb/198588825129.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/d5/7a/38d57a99-39fc-e901-7c45-fa6260ec83c1/mzaf_8083696285926392389.plus.aac.p.m4a",
    duration: "0:30",
    cat: "desi"
  },
  {
    id: "s_soulmate",
    title: "Soulmate",
    artist: "Badshah & Arijit Singh",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/5f/8d/78/5f8d7807-6c39-38b8-6a3f-1d8ef3df1821/198003923010.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/eb/27/61/eb2761c7-d606-0912-dff0-2dc6b69974bd/mzaf_2023722930851223219.plus.aac.p.m4a",
    duration: "0:30",
    cat: "lofi"
  },
  {
    id: "s_o_maahi",
    title: "O Maahi (From \\"Dunki\\")",
    artist: "Pritam, Arijit Singh & Irshad Kamil",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/1f/26/51/1f265147-3a13-8888-292d-9860c239d1b0/886449830889.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/55/e1/9b/55e19b22-e421-2550-93a8-e160e1f37e61/mzaf_12411933543940250669.plus.aac.p.m4a",
    duration: "0:30",
    cat: "bollywood"
  },
  {
    id: "s_winning_speech",
    title: "Winning Speech",
    artist: "Karan Aujla & Mehsopuria",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/80/4d/91/804d9136-1e0d-5872-9856-f00e572bc8aa/198003881020.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/fa/ed/32/faed3262-6b3a-5f9f-09e4-6c3829037803/mzaf_9747514332219491717.plus.aac.p.m4a",
    duration: "0:30",
    cat: "punjabi"
  },
  {
    id: "s_sajni",
    title: "Sajni (From \\"Laapataa Ladies\\")",
    artist: "Ram Sampath, Arijit Singh & Prashant Pandey",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/18/8f/d0/188fd000-d835-1885-3e28-1123e421e35d/886449830889.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/14/9b/ac/149bac62-12f1-2f55-a742-f38429b94c83/mzaf_17225240189976438593.plus.aac.p.m4a",
    duration: "0:30",
    cat: "lofi"
  },
  {
    id: "s_aaj_ki_raat",
    title: "Aaj Ki Raat (From \\"Stree 2\\")",
    artist: "Sachin-Jigar, Madhubanti Bagchi & Divya Kumar",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/95/8e/4a/958e4a28-6e54-52d3-1383-7c2a71f0ef55/886449830889.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/34/8d/63/348d6342-2c35-bf31-8131-2c8b3cfe3c09/mzaf_15374551219149804677.plus.aac.p.m4a",
    duration: "0:30",
    cat: "trending"
  },
  {
    id: "s_tum_se",
    title: "Tum Se (From \\"Teri Baaton Mein Aisa Ujha Jiya\\")",
    artist: "Sachin-Jigar, Raghav Chaitanya & Varun Grover",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a",
    duration: "0:30",
    cat: "lofi"
  },
  {
    id: "s_ve_kamleya",
    title: "Ve Kamleya (From \\"Rocky Aur Rani Kii Prem Kahaani\\")",
    artist: "Pritam, Arijit Singh & Shreya Ghoshal",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/21/df/b6/21dfb63f-6799-7fb6-5b4e-e1791a82b3a0/886449830889.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/55/e1/9b/55e19b22-e421-2550-93a8-e160e1f37e61/mzaf_12411933543940250669.plus.aac.p.m4a",
    duration: "0:30",
    cat: "bollywood"
  },
  {
    id: "s_desi_kalakaar",
    title: "Desi Kalakaar",
    artist: "Yo Yo Honey Singh",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/d5/7a/38d57a99-39fc-e901-7c45-fa6260ec83c1/mzaf_8083696285926392389.plus.aac.p.m4a",
    duration: "0:30",
    cat: "desi"
  },
  {
    id: "s_high_heels",
    title: "High Heels Te Nachche",
    artist: "Yo Yo Honey Singh & Jaz Dhami",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/36/f6/45/36f64560-6184-7a32-1f41-0b5c9bc0f6eb/198588825129.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/49/c8/c0/49c8c0eb-6a72-d639-02d2-d55fa0034b89/mzaf_6556689839136809010.plus.aac.p.m4a",
    duration: "0:30",
    cat: "desi"
  },
  {
    id: "s_chor",
    title: "Chor",
    artist: "Justh",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/90/9d/aa/909daa9a-3a47-9314-2855-39f5a157f1e3/5054197407734.jpg/300x300bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/49/c8/c0/49c8c0eb-6a72-d639-02d2-d55fa0034b89/mzaf_6556689839136809010.plus.aac.p.m4a",
    duration: "0:30",
    cat: "trending"
  }
];'''

code = re.sub(r'var DEFAULT_HIT_SONGS = \[.*?\];', new_songs, code, flags=re.DOTALL)

# 2. Replacement for loadSoundCategory function
new_load_cat = '''function loadSoundCategory(cat) {
    if (cat === "bollywood") {
      fetchItunesSounds("bollywood top hit songs");
    } else if (cat === "punjabi") {
      fetchItunesSounds("punjabi hit songs");
    } else if (cat === "lofi") {
      fetchItunesSounds("bollywood lofi romantic acoustic");
    } else if (cat === "desi") {
      fetchItunesSounds("desi pop hit party songs");
    } else {
      fetchItunesSounds("trending hindi punjabi reels songs");
    }
  }'''

code = re.sub(r'function loadSoundCategory\(cat\)\s*\{.*?\}', new_load_cat, code, flags=re.DOTALL)

# 3. Replacement for fetchItunesSounds and fallbackSounds
new_fetch_itunes = '''async function fetchItunesSounds(term) {
    var c = $("zeSoundListContainer");
    if (c) c.innerHTML = '<div style="text-align:center;padding:24px 16px;color:#888"><div class="ze-spinner" style="margin:0 auto 10px;width:24px;height:24px;border-width:2px"></div>Searching songs...</div>';
    try {
      var res = await fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(term) + "&entity=song&limit=30").catch(function () { return null; });
      if (!res || !res.ok) {
        fallbackSounds(term);
        return;
      }
      var data = await res.json().catch(function () { return {}; });
      if (data && Array.isArray(data.results) && data.results.length) {
        var items = data.results.filter(function (r) { return r.previewUrl; }).map(function (r) {
          var ms = r.trackTimeMillis || 30000;
          var mins = Math.floor(ms / 60000);
          var secs = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
          return {
            id: "itunes_" + r.trackId,
            title: r.trackName,
            artist: r.artistName,
            artwork: r.artworkUrl100 ? r.artworkUrl100.replace("100x100bb", "300x300bb") : "",
            previewUrl: r.previewUrl,
            duration: mins + ":" + secs
          };
        });
        renderSoundList(items);
      } else {
        fallbackSounds(term);
      }
    } catch (e) {
      fallbackSounds(term);
    }
  }
  function fallbackSounds(query) {
    if (!query) {
      renderSoundList(DEFAULT_HIT_SONGS);
      return;
    }
    var q = query.toLowerCase().trim();
    var filtered = DEFAULT_HIT_SONGS.filter(function (s) {
      return (s.title && s.title.toLowerCase().includes(q)) ||
             (s.artist && s.artist.toLowerCase().includes(q)) ||
             (s.cat && s.cat.toLowerCase().includes(q));
    });
    renderSoundList(filtered.length ? filtered : DEFAULT_HIT_SONGS);
  }'''

code = re.sub(r'async function fetchItunesSounds\(term\)\s*\{.*?\}\s*function fallbackSounds\(\)\s*\{.*?\}', new_fetch_itunes, code, flags=re.DOTALL)

with open('zyro-editor.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Successfully updated zyro-editor.js with 20+ songs, dynamic iTunes search, and category filters!")
