const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = async (zen, msg, sender, pushname) => {
    try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const message = msg.message;

        const isQuotedImage = quoted?.imageMessage;
        const isDirectImage = message?.imageMessage;

        const mediaType = isQuotedImage ? "image" : isDirectImage ? "image" : null;
        const mediaMessage = isQuotedImage ? quoted.imageMessage : isDirectImage ? message.imageMessage : null;

        if (!mediaType || !mediaMessage) {
            await zen.sendMessage(sender, {
                text: "❌ Kirim atau balas gambar dengan caption */bg* untuk menghapus background.",
            }, { quoted: msg });
            return;
        }

        const waitMsg = await zen.sendMessage(sender, { text: "🔄 Menghapus background..." }, { quoted: msg });

        const stream = await downloadContentFromMessage(mediaMessage, mediaType);
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);

        const buffer = Buffer.concat(chunks);
        const tmpDir = path.join(__dirname, "../tmp");
        fs.mkdirSync(tmpDir, { recursive: true });

        const fileId = Date.now();
        const inputPath = path.join(tmpDir, `input_${fileId}.png`);
        const outputPath = path.join(tmpDir, `output_${fileId}.png`);
        fs.writeFileSync(inputPath, buffer);

        execFile("rembg", ["i", inputPath, outputPath], async (err) => {
            if (err || !fs.existsSync(outputPath)) {
                console.error("❌ Rembg error:", err);
                await zen.sendMessage(sender, { text: "❌ Gagal menghapus background." }, { quoted: msg });
                fs.existsSync(inputPath) && fs.unlinkSync(inputPath);
                return;
            }

            const resultBuffer = fs.readFileSync(outputPath);
            await zen.sendMessage(sender, {
                image: resultBuffer,
                caption: "✅ Background berhasil dihapus.",
            }, { quoted: msg });

            await zen.sendMessage(sender, { delete: waitMsg.key }).catch(() => {});

            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error("❌ Error saat removebg:", error);
        await zen.sendMessage(sender, {
            text: "❌ Terjadi kesalahan saat memproses gambar.",
        }, { quoted: msg });
    }
};

module.exports.help = {
    name: "bg",
    description: "Hapus background dari gambar"
};