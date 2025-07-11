const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = async (zen, msg, sender) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = quoted?.stickerMessage;

    if (!stickerMsg) {
        return await zen.sendMessage(sender, {
            text: "❌ Balas stiker dengan perintah */toimg* untuk mengubahnya menjadi gambar.",
        }, { quoted: msg });
    }

    const stream = await downloadContentFromMessage(stickerMsg, "sticker");
    const buffer = [];
    for await (const chunk of stream) buffer.push(chunk);

    const tmpName = `./tmp/toimg-${Date.now()}`;
    const inputPath = `${tmpName}.webp`;
    const outputPath = `${tmpName}.jpg`;

    fs.writeFileSync(inputPath, Buffer.concat(buffer));

    ffmpeg(inputPath)
        .outputFormat("image2")
        .on("end", async () => {
            const jpg = fs.readFileSync(outputPath);
            await zen.sendMessage(sender, {
                image: jpg,
                caption: "✅ Ini hasil konversi stikermu."
            }, { quoted: msg });

            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        })
        .on("error", async (err) => {
            console.error("FFmpeg error:", err);
            await zen.sendMessage(sender, {
                text: "❌ Gagal mengonversi stiker menjadi gambar.",
            }, { quoted: msg });
            fs.existsSync(inputPath) && fs.unlinkSync(inputPath);
        })
        .save(outputPath);
};

module.exports.help = {
    name: "tg",
    description: "Ubah stiker yang dibalas menjadi gambar"
};