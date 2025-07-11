const { writeExif } = require("../lib/exif");
const fs = require("fs");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = async (zen, msg, sender, pushname, args) => {
  try {
    const message = msg.message;
    const quoted = message?.extendedTextMessage?.contextInfo?.quotedMessage;

    const mimeType =
      quoted && Object.keys(quoted)[0] ||
      message?.imageMessage && "imageMessage" ||
      message?.videoMessage && "videoMessage";

    if (!mimeType || !/image|video|sticker/.test(mimeType)) {
      return await zen.sendMessage(sender, {
        text: "❌ Kirim atau balas gambar/video/gif dengan caption */sticker [pack|author]*\nDurasi maksimal 10 detik.",
      }, { quoted: msg });
    }

    const mediaMessage =
      quoted?.[mimeType] ||
      message?.[mimeType];

    const mediaStream = await downloadContentFromMessage(
      mediaMessage,
      mimeType.replace("Message", "")
    );

    const buffer = [];
    for await (const chunk of mediaStream) buffer.push(chunk);
    const fullBuffer = Buffer.concat(buffer);

    const [packname, author] = (args.join(" ") || `ZenGarden|${pushname}`).split("|").map(x => x.trim());
    const stickerPath = await writeExif(fullBuffer, { packname, author });
    const sticker = fs.readFileSync(stickerPath);

    await zen.sendMessage(sender, { sticker }, { quoted: msg });
    fs.unlinkSync(stickerPath);

  } catch (err) {
    console.error("❌ Error:", err);
    await zen.sendMessage(sender, { text: "❌ Gagal membuat stiker." }, { quoted: msg });
  }
};

module.exports.help = {
  name: "sticker",
  description: "Buat stiker dari gambar, video atau gif dengan watermark pack/author"
};
