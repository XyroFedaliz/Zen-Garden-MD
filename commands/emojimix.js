const axios = require("axios");
const { writeExif } = require("../lib/exif");
const fs = require("fs");
const { default: fetch } = require("node-fetch");

module.exports = async (zen, msg, sender, pushname, args) => {
  if (!args.join(" ")) {
    return await zen.sendMessage(sender, {
      text: "❌ Contoh: /emojimix 😅+🤔",
    }, { quoted: msg });
  }

  const [emoji1, emoji2] = args.join(" ").split("+");
  if (!emoji1 || !emoji2) {
    return await zen.sendMessage(sender, {
      text: "❌ Format salah. Contoh: /emojimix 😅+🤔",
    }, { quoted: msg });
  }

  try {
    const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
    const res = await axios.get(url);
    const results = res.data.results;

    if (!results || results.length === 0) {
      return await zen.sendMessage(sender, {
        text: `❌ Mix emoji *${emoji1}+${emoji2}* tidak ditemukan.`,
      }, { quoted: msg });
    }

    const mediaUrl = results[0].url;
    const response = await fetch(mediaUrl);
    const buffer = await response.buffer();

    const stickerPath = await writeExif(buffer, {
      packname: "ZenEmoji",
      author: pushname || "Zen",
    });
    const sticker = fs.readFileSync(stickerPath);

    await zen.sendMessage(sender, { sticker }, { quoted: msg });
    fs.unlinkSync(stickerPath);

  } catch (err) {
    console.error("❌ Emojimix error:", err);
    await zen.sendMessage(sender, {
      text: "❌ Gagal mix emoji. Coba lagi nanti.",
    }, { quoted: msg });
  }
};

module.exports.help = {
  name: "emojimix",
  description: "Gabungkan dua emoji menjadi stiker lucu"
};
