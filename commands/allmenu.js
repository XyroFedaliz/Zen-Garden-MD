const fs = require("fs");
const path = require("path");

module.exports = async (zen, msg, sender, pushname) => {
  try {
    const commandDir = path.join(__dirname);
    const files = fs.readdirSync(commandDir)
      .filter(file => file.endsWith(".js") && file !== "menu.js");

    const commandList = [];

    for (const file of files) {
      const commandPath = path.join(commandDir, file);
      const command = require(commandPath);
      const name = command?.help?.name || file.replace(".js", "");
      const description = command?.help?.description || "Tidak ada deskripsi.";
      commandList.push(`• /${name} → ${description}`);
    }

    // 2. Teks menu
    const menuText = `
*🍀 Zen Garden - Menu 🍀*
This bot offers a variety of commands to assist you with different tasks.
Feel free to explore the available features and enjoy a seamless experience.
Thank you for choosing Zen Garden. ✨🌿

👤 Hai, *${pushname || "Pengguna"}*!
Berikut adalah daftar perintah:

${commandList.join("\n")}

✨ Total: ${commandList.length} perintah
🔧 Bot by ZenGarden
    `.trim();

    const thumbnail = fs.readFileSync("./assets/static.png"); 
    await zen.sendMessage(sender, {
      text: menuText,
      contextInfo: {
        externalAdReply: {
          title: "Zen-Garden",
          body: "",
          thumbnail,
          thumbnailUrl: 'https://discord.gg/DEgDqbdkgP',
          sourceUrl: "delete this",
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          
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
