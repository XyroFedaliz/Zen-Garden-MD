const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async (zen, msg, sender, pushname, args) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const message = msg.message;

    const body = msg.message.conversation ||
                 msg.message.imageMessage?.caption ||
                 msg.message.videoMessage?.caption ||
                 msg.message.extendedTextMessage?.text || "";

    // Parsing pack | author dari argumen
    let author = pushname || "ZenBot";
    let pack = "ZenGarden";
    if (args.length > 0) {
        const joined = args.join(" ");
        const [customAuthor, customPack] = joined.split("|").map(s => s.trim());
        if (customAuthor) author = customAuthor;
        if (customPack) pack = customPack;
    }

    const isQuotedImage = quoted?.imageMessage;
    const isQuotedVideo = quoted?.videoMessage;
    const isDirectImage = message?.imageMessage;
    const isDirectVideo = message?.videoMessage;

    const mediaType = isQuotedImage || isDirectImage ? "image"
                    : isQuotedVideo || isDirectVideo ? "video"
                    : null;

    const mediaMessage = isQuotedImage ? quoted.imageMessage
                        : isQuotedVideo ? quoted.videoMessage
                        : isDirectImage ? message.imageMessage
                        : isDirectVideo ? message.videoMessage
                        : null;

    if (!mediaType || !mediaMessage) {
        await zen.sendMessage(sender, {
            text: "❌ Balas atau kirim gambar/video (maks 8 detik) dengan perintah */sticker [author | pack]*",
        }, { quoted: msg });
        return;
    }

    const filename = `./tmp/sticker-${Date.now()}`;
    const inputExt = mediaType === "image" ? "jpg" : "mp4";
    const inputPath = `${filename}.${inputExt}`;

    // Download
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = [];
    for await (const chunk of stream) buffer.push(chunk);
    fs.writeFileSync(inputPath, Buffer.concat(buffer));

    // Convert to sticker
    try {
        const sticker = await createSticker(inputPath, {
            type: StickerTypes.FULL,
            pack: pack,
            author: author,
            quality: 100,
        });

        await zen.sendMessage(sender, { sticker }, { quoted: msg });
    } catch (err) {
        console.error("❌ Gagal buat stiker:", err);
        await zen.sendMessage(sender, {
            text: "❌ Gagal membuat stiker.",
        }, { quoted: msg });
    } finally {
        fs.existsSync(inputPath) && fs.unlinkSync(inputPath);
    }
};
