const ig = require("../lib/instagram");

module.exports = async (zen, msg, sender, pushname, args) => {
  const query = args.join(" ");
  if (!query || !query.startsWith("http")) {
    await zen.sendMessage(sender, {
      text: "❌ Gunakan: */ig <link Instagram>*",
    }, { quoted: msg });
    return;
  }

  try {
    const videoUrl = await ig.instagramDownload(query);

    await zen.sendMessage(sender, {
      video: { url: videoUrl },
      mimetype: "video/mp4",
      caption: "📥 Video Instagram berhasil diunduh.",
      fileName: "instagram.mp4"
    }, { quoted: msg });
  } catch (error) {
    console.error("❌ IG command error:", error.message);
    await zen.sendMessage(sender, {
      text: "❌ Gagal mengambil video dari Instagram. Pastikan link valid.",
    }, { quoted: msg });
  }
};

module.exports.help = {
  name: "ig",
  description: "Download video dari Instagram"
};