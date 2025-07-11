const axios = require("axios");
const cheerio = require("cheerio");
const fetch = require("node-fetch");

module.exports = {
  // Fungsi untuk ambil video dari link Pinterest
  pinterestURL: async (url = "") => {
    try {
      const res = await axios.post(
        "https://www.expertsphp.com/facebook-video-downloader.php",
        new URLSearchParams({ url }).toString(),
        {
          headers: {
            "user-agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded",
          },
        }
      );

      const $ = cheerio.load(res.data);
      const videoUrl = $("video").attr("src");

      if (!videoUrl) {
        throw new Error("Gagal mendapatkan URL video.");
      }

      return videoUrl;
    } catch (error) {
      console.error("❌ pinterestURL error:", error.message);
      throw new Error("Gagal mengambil video dari Pinterest.");
    }
  },

  // Fungsi pencarian gambar berdasarkan keyword
  pinterestSearch: async (query = "") => {
    try {
      const res = await fetch(
        `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(
          query
        )}&data={"options":{"isPrefetch":false,"query":"${encodeURIComponent(
          query
        )}","scope":"pins","no_fetch_context_on_resource":false},"context":{}}`
      );

      const json = await res.json();
      const data = json.resource_response?.data?.results || [];

      if (!data.length) throw new Error("❌ Tidak ditemukan hasil gambar.");
      const result = data[Math.floor(Math.random() * data.length)];
      const imageUrl = result?.images?.orig?.url;

      if (!imageUrl) throw new Error("❌ Gambar tidak tersedia.");

      return {
        url: imageUrl,
        desc: result.description || "",
        caption: result.grid_title || ""
      };
    } catch (error) {
      console.error("❌ pinterestSearch error:", error.message);
      throw new Error("Gagal mencari gambar di Pinterest.");
    }
  }
};
