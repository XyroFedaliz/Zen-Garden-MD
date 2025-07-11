const axios = require("axios");
const { writeExif } = require("../lib/exif");
const fs = require("fs");
const { default: fetch } = require("node-fetch");

module.exports = async (zen, msg, sender, pushname, args) => {
  const quotedText =
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;
    
  const teks = args.join(" ") || quotedText;

  if (!teks) {
    return await zen.sendMessage(sender, {
      text: "❌ Kirim atau balas pesan teks dengan caption */brat Teksnya*",
    }, { quoted: msg });
  }

  try {
    const url1 = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(teks)}`;
    const res1 = await fetch(url1);
    const buffer1 = await res1.buffer();

    const stickerPath = await writeExif(buffer1, {
      packname: "ZenBrat",
      author: pushname || "Zen",
    });

    const sticker = fs.readFileSync(stickerPath);
    await zen.sendMessage(sender, { sticker }, { quoted: msg });
    fs.unlinkSync(stickerPath);
    
  } catch (e1) {
    try {
      const url2 = `https://aqul-brat.hf.space/?text=${encodeURIComponent(teks)}`;
      const res2 = await fetch(url2);
      const buffer2 = await res2.buffer();

      const stickerPath = await writeExif(buffer2, {
        packname: "ZenBrat",
        author: pushname || "Zen",
      });

      const sticker = fs.readFileSync(stickerPath);
      await zen.sendMessage(sender, { sticker }, { quoted: msg });
      fs.unlinkSync(stickerPath);
      
    } catch (e2) {
      await zen.sendMessage(sender, {
        text: "❌ Server Brat sedang offline di dua endpoint.",
      }, { quoted: msg });
    }
  }
};

module.exports.help = {
  name: "brat",
  description: "Buat stiker Brat dari teks"
};
