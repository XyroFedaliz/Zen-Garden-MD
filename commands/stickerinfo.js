const fs = require("fs");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const webpmux = require("node-webpmux");

module.exports = async (zen, msg, sender) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = quoted?.stickerMessage;

    if (!stickerMsg) {
        return zen.sendMessage(sender, {
            text: "❌ Balas stiker dengan perintah */stickerinfo* untuk melihat informasi pack.",
        }, { quoted: msg });
    }

    const stream = await downloadContentFromMessage(stickerMsg, "sticker");
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);

    const inputPath = `./temp/info-${Date.now()}.webp`;
    fs.writeFileSync(inputPath, Buffer.concat(chunks));

    try {
        const img = new webpmux.Image();
        await img.load(inputPath);

        if (!img.exif) throw new Error("Exif kosong");

        const exifStr = img.exif.toString("utf-8");
        const jsonStr = exifStr.substring(exifStr.indexOf("{"), exifStr.lastIndexOf("}") + 1);
        const json = JSON.parse(jsonStr);

        const pack = json["sticker-pack-name"] || "❓ Tidak diketahui";
        const author = json["sticker-pack-publisher"] || "❓ Tidak diketahui";
        const website = json["sticker-pack-publisher-website"] || null;
        const androidApp = json["android-app-store-link"] || null;
        const iosApp = json["ios-app-store-link"] || null;

        let text = `📦 *Pack:* ${pack}\n✍️ *Author:* ${author}`;

        if (website) text += `\n🌐 *Website:* ${website}`;
        if (androidApp) text += `\n📱 *Android:* ${androidApp}`;
        if (iosApp) text += `\n🍏 *iOS:* ${iosApp}`;

        await zen.sendMessage(sender, { text }, { quoted: msg });
    } catch (e) {
        console.error("EXIF parse error:", e);
        await zen.sendMessage(sender, {
            text: "⚠️ Tidak dapat membaca info stiker ini (mungkin tidak ada metadata).",
        }, { quoted: msg });
    } finally {
        fs.existsSync(inputPath) && fs.unlinkSync(inputPath);
    }
};

module.exports.help = {
    name: "snf",
    description: "Tampilkan informasi pack dari stiker yang dibalas"
};