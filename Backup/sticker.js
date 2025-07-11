const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { createSticker, StickerTypes } = require("wa-sticker-formatter");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

function sanitize(text) {
    return text.replace(/[^a-z0-9_\-]/gi, "_").trim();
  }

module.exports = async (zen, msg, sender, pushname, args) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const message = msg.message;

    const body = msg.message.conversation ||
                 msg.message.imageMessage?.caption ||
                 msg.message.videoMessage?.caption ||
                 msg.message.extendedTextMessage?.text || "";

    // Ambil author dan pack dari argumen jika ada
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

    const tmp = `./tmp/sticker-${Date.now()}`;
    const inputExt = mediaType === "image" ? "jpg" : "mp4";
    const inputPath = `${tmp}.${inputExt}`;
    const outputPath = `${tmp}.webp`;

    // Download media
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = [];
    for await (const chunk of stream) buffer.push(chunk);
    fs.writeFileSync(inputPath, Buffer.concat(buffer));

    try {
        // Konversi video ke webp (jika video)
        if (mediaType === "video") {
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .outputOptions([
                        "-vcodec", "libwebp",
                        "-preset", "default",
                        "-loop", "0",
                        "-an",
                        "-vsync", "0",
                        "-s", "600:600",
                        "-t", "8"
                    ])
                    .videoFilters([
                        "fps=15",
                        "scale=600:600:force_original_aspect_ratio=decrease",
                        "pad=600:600:(ow-iw)/2:(oh-ih)/2:color=#00000000",
                        "format=yuv420p"
                    ])
                    .on("end", resolve)
                    .on("error", reject)
                    .save(outputPath);
            });
        }

        // Buat stiker dari file gambar atau hasil konversi
        const sticker = await createSticker(
            mediaType === "video" ? outputPath : inputPath,
            {
                type: StickerTypes.FULL,
                pack,
                author,
                quality: 80,
            }
        );

        await zen.sendMessage(sender, { sticker }, { quoted: msg });
        const saveDir = path.join("./stickers", sanitize(pack), sanitize(author));
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
        
        const outputStickerPath = path.join(saveDir, `${Date.now()}.webp`);
        fs.copyFileSync(mediaType === "video" ? outputPath : inputPath, outputStickerPath);
        console.log("✔️ Stiker disimpan ke:", outputStickerPath);        
    
      } catch (err) {
        console.error("❌ Gagal membuat stiker:", err);
        await zen.sendMessage(sender, {
          text: "❌ Gagal membuat stiker. Pastikan media valid dan berdurasi ≤ 8 detik.",
        }, { quoted: msg });
      } finally {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }
};

module.exports.help = {
    name: "s",
    description: "Untuk buat stiker"
};
