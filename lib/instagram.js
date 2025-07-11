const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  instagramDownload: async (igUrl = "") => {
    try {
      const res = await axios.post(
        "https://www.expertsphp.com/facebook-video-downloader.php",
        new URLSearchParams({ url: igUrl }).toString(),
        {
          headers: {
            "user-agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
            "content-type": "application/x-www-form-urlencoded"
          }
        }
      );

      const $ = cheerio.load(res.data);
      const videoUrl = $("video source").attr("src") || $("a.download-link").attr("href");

      if (!videoUrl) throw new Error("❌ Video tidak ditemukan.");
      return videoUrl;
    } catch (error) {
      console.error("❌ instagramDownload error:", error.message);
      throw new Error("Gagal mengambil video dari Instagram.");
    }
  }
};
