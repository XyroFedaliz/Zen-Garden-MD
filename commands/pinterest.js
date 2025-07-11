const pinterest = require("../lib/pinterest");

module.exports = async (zen, msg, sender, pushname, args) => {
  const query = args.join(" ");
  if (!query) {
    await zen.sendMessage(sender, {
      text: "❌ Gunakan: */pinterest kata kunci* atau */pinterest <link>*",
    }, { quoted: msg });
    return;
  }

  try {
    if (query.startsWith("http")) {
      // Link Pinterest (video)
      const videoUrl = await pinterest.pinterestURL(query);

      await zen.sendMessage(sender, {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: "📥 Pinterest Video berhasil diunduh.",
        fileName: "pinterest.mp4"
      }, { quoted: msg });

    } else {
      // Pencarian berdasarkan kata kunci
      const data = await pinterest.pinterestSearch(query);

      await zen.sendMessage(sender, {
        document: { url: data.url },
        mimetype: "image/jpeg",
        fileName: `${query}.jpg`,
        caption: `📌 Hasil pencarian Pinterest:\n\n📎 Judul: ${data.caption || "-"}\n📝 Deskripsi: ${data.desc || "-"}`
      }, { quoted: msg });
    }

  } catch (error) {
    console.error("❌ Pinterest command error:", error.message);
    await zen.sendMessage(sender, {
      text: "❌ Gagal mengambil data dari Pinterest.\nCoba periksa kembali link atau kata kunci.",
    }, { quoted: msg });
  }
};

module.exports.help = {
  name: "pdl",
  description: "Download gambar atau video dari Pinterest"
};
