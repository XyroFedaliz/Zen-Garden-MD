const fs = require("fs");
const path = require("path");

module.exports = async (zen, msg, sender) => {
  const stickerDir = "./stickers/zen/";
  if (!fs.existsSync(stickerDir)) {
    return await zen.sendMessage(sender, {
      text: "❌ Belum ada stiker yang tersimpan. Gunakan /sticker dulu."
    }, { quoted: msg });
  }

  const files = fs.readdirSync(stickerDir).filter(f => f.endsWith(".webp"));
  if (!files.length) {
    return await zen.sendMessage(sender, {
      text: "❌ Folder stiker kosong."
    }, { quoted: msg });
  }

  await zen.sendMessage(sender, {
    text: `📦 Mengirim paket stiker Zen (${files.length} item)...`
  }, { quoted: msg });

  for (const file of files) {
    const buffer = fs.readFileSync(path.join(stickerDir, file));
    await zen.sendMessage(sender, { sticker: buffer }, { quoted: msg });
    await new Promise(res => setTimeout(res, 1000)); // delay agar tidak flood
  }
};

module.exports.help = {
  name: "pack",
  description: "Mengirim semua stiker yang disimpan dari /sticker"
};
