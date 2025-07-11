const fs = require("fs");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = async (zen, msg, sender, pushname) => {
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mime = quoted?.imageMessage ? "image" : null;

    if (!mime) {
      return await zen.sendMessage(sender, {
        text: "❌ Balas gambar dengan caption */hitamkan* untuk mengubah ke hitam putih.",
      }, { quoted: msg });
    }

    // Unduh media dari pesan
    const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
    const buffer = [];
    for await (const chunk of stream) buffer.push(chunk);
    const fullBuffer = Buffer.concat(buffer);

    // Convert ke base64
    const base64Image = fullBuffer.toString("base64");

    // Proses ke API negro.consulting
    const res = await axios.post("https://negro.consulting/api/process-image", {
      filter: "hitam",
      imageData: "data:image/png;base64," + base64Image,
    }, {
      headers: { "Content-Type": "application/json" },
    });

    const resultBuffer = Buffer.from(
      res.data.processedImageUrl.replace("data:image/png;base64,", ""),
      "base64"
    );

    await zen.sendMessage(sender, {
      image: resultBuffer,
      caption: "✅ Gambar telah diubah ke hitam putih.",
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Hitamkan error:", err);
    await zen.sendMessage(sender, {
      text: "❌ Gagal memproses gambar. Server mungkin offline.",
    }, { quoted: msg });
  }
};

module.exports.help = {
  name: "hitamkan",
  description: "Ubah gambar menjadi hitam putih dengan filter AI"
};
