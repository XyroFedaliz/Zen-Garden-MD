const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { docs, listfakedocs, pickRandom, thumbnail } = require("../lib/fake")
const { author, packname, profile, my } = require("../config/metadata");

module.exports = async (zen, msg, sender, pushname, args) => {
  try {
    const botname = "ZenGarden";
    const owner = ["628xxx@s.whatsapp.net"];
    const commandDir = path.join(__dirname);
    const files = fs.readdirSync(commandDir).filter(file => file.endsWith(".js") && file !== "menu.js");

    const commandList = [];
    for (const file of files) {
      const commandPath = path.join(commandDir, file);
      const command = require(commandPath);
      const name = command?.help?.name || file.replace(".js", "");
      const description = command?.help?.description || "Tidak ada deskripsi.";
      commandList.push(`• /${name} → ${description}`);
    }

    const hari = moment().tz("Asia/Jakarta").format("dddd");
    const tanggal = moment().tz("Asia/Jakarta").format("DD/MM/YYYY");
    const jam = moment().tz("Asia/Jakarta").format("HH:mm:ss");
    const ucapanWaktu =
      jam < "05:00:00" ? "Selamat Pagi 🌉" :
      jam < "11:00:00" ? "Selamat Pagi 🌄" :
      jam < "15:00:00" ? "Selamat Siang 🏙" :
      jam < "18:00:00" ? "Selamat Sore 🌅" :
      "Selamat Malam 🌌";

    const menuText = `
*🍀 Zen Garden - Menu 🍀*
This bot offers a variety of commands to assist you with different tasks.
Feel free to explore the available features and enjoy a seamless experience.
Thank you for choosing Zen Garden. ✨🌿

👤 Hai, *${pushname || "Pengguna"}*!
Berikut adalah daftar perintah :

- */allmenu*
- */sticker*
- */brat*

🔧 Other :

*Nama Bot* : ${botname}
*Tanggal* : ${tanggal}
*Hari* : ${hari}
*Jam* : ${jam} WIB
*Powered* : @0
    `.trim();
	await zen.sendMessage(sender, {
		document: docs,
		fileName: '✧ Zen-Garden ✧',
		mimetype: pickRandom(listfakedocs),
		fileLength: "100000000000000",
		pageCount: "999",
		caption: menuText,
		contextInfo: {
		  mentionedJid: [sender, "0@s.whatsapp.net", owner[0]],
		  forwardingScore: 10,
		  isForwarded: true,
		  externalAdReply: {
			title: author,
			body: packname,
			showAdAttribution: true,
			thumbnail: thumbnail,
			thumbnailUrl: profile,
			mediaType: 1,
			previewType: 0,
			renderLargerThumbnail: true,
			mediaUrl: my.gh,
			sourceUrl: my.gh
		  }
		}
	  }, { quoted: msg });

  } catch (err) {
    console.error("❌ Menu Error:", err.message);
    await zen.sendMessage(sender, {
      text: "❌ Gagal menampilkan menu."
    }, { quoted: msg });
  }
};

module.exports.help = {
  name: "help",
  description: "Menampilkan info menu bot"
};
