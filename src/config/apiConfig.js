const apiKey = process.env.NEXT_PUBLIC_API_KEY || "lexxganz"; // Ganti dengan API KEY milikmu

const BASE = "https://api.maelyn.sbs/api/otakudesu";
const JADWAL_BASE = "https://api.maelyn.sbs/api/jadwal/anime";

const apiConfig = {
  SEARCH: (q) => ({
    url: `${BASE}/search?q=${encodeURIComponent(q)}`,
    options: { method: "GET", headers: { "mg-apikey": apiKey } },
  }),
  DETAIL: (urlAnime) => ({
    url: `${BASE}/detail?url=${encodeURIComponent(urlAnime)}`,
    options: { method: "GET", headers: { "mg-apikey": apiKey } },
  }),
  JADWAL: () => ({
    url: JADWAL_BASE,
    options: { method: "GET", headers: { "mg-apikey": apiKey } },
  }),
  STREAM: (urlEpisode) => ({
    url: `${BASE}/stream?url=${encodeURIComponent(urlEpisode)}`,
    options: { method: "GET", headers: { "mg-apikey": apiKey } },
  }),
  DOWNLOAD: (urlEpisode) => ({
    url: `${BASE}/download?url=${encodeURIComponent(urlEpisode)}`,
    options: { method: "GET", headers: { "mg-apikey": apiKey } },
  }),
  LASTUPDATE: () => ({
    url: `${BASE}/lastupdate`,
    options: { method: "GET", headers: { "mg-apikey": apiKey } },
  }),
  ONGOING: () => ({
    url: `${BASE}/ongoing`,
    options: { method: "GET", headers: { "mg-apikey": apiKey } },
  }),
  COMPLETED: () => ({
    url: `${BASE}/completed`,
    options: { method: "GET", headers: { "mg-apikey": apiKey } },
  }),
  EPISODE: (urlEpisode) => ({
    url: `${BASE}/episode?url=${encodeURIComponent(urlEpisode)}`,
    options: { method: "GET", headers: { "mg-apikey": apiKey } },
  }),
};

export default apiConfig;
