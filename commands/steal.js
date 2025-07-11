const fs = require("fs");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { writeExif } = require("../lib/exif");

module.exports = async (zen, msg, sender, pushname, args) => {
  try {
    const message = msg.message;
    const quoted = message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMessage = quoted?.stickerMessage || message?.stickerMessage;

    if (!stickerMessage) {
      return await zen.sendMessage(sender, {
        text: "❌ Kirim atau balas stiker dengan perintah */curi [pack|author]*",
      }, { quoted: msg });
    }

    const mediaStream = await downloadContentFromMessage(
      stickerMessage,
      "sticker"
    );
    const buffer = [];
    for await (const chunk of mediaStream) buffer.push(chunk);
    const stickerBuffer = Buffer.concat(buffer);

    const [packname, author] = (args.join(" ") || "ZenGarden|Zen").split("|").map(x => x.trim());

    const stickerPath = await writeExif(stickerBuffer, {
      packname,
      author
    });

    const result = fs.readFileSync(stickerPath);
    await zen.sendMessage(sender, { sticker: result }, { quoted: msg });
    fs.unlinkSync(stickerPath);

  } catch (err) {
    console.error("❌ Error curi:", err);
    await zen.sendMessage(sender, {
      text: "❌ Gagal mengambil stiker.",
    }, { quoted: msg });
  }
};

module.exports.help = {
  name: "steal",
  description: "Ambil stiker dan ubah watermark pack/author"
};
