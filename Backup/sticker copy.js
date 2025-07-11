const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const path = require("path");

module.exports = async (zen, msg, sender, pushname) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const message = msg.message;

    const isQuotedImage = quoted?.imageMessage;
    const isQuotedVideo = quoted?.videoMessage;
    const isDirectImage = message?.imageMessage;
    const isDirectVideo = message?.videoMessage;

    // Deteksi jenis media
    const mediaType = isQuotedImage || isDirectImage ? "image" : isQuotedVideo || isDirectVideo ? "video" : null;
    const mediaMessage = isQuotedImage ? quoted.imageMessage :
                         isQuotedVideo ? quoted.videoMessage :
                         isDirectImage ? message.imageMessage :
                         isDirectVideo ? message.videoMessage :
                         null;


    if (!mediaType || !mediaMessage) {
        await zen.sendMessage(sender, {
            text: "❌ Kirim atau balas gambar/video (maks 8 detik) dengan caption */s* untuk membuat stiker.",
        }, { quoted: msg });
        return;
    }

    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const filename = `./tmp/input-${Date.now()}`;
    const inputExt = mediaType === "image" ? "jpg" : "mp4";
    const inputPath = `${filename}.${inputExt}`;
    const outputPath = `${filename}.webp`;

    const fileBuffer = [];
    for await (const chunk of stream) fileBuffer.push(chunk);
    fs.writeFileSync(inputPath, Buffer.concat(fileBuffer));

    const ffmpegCommand = ffmpeg(inputPath)
        .outputOptions([
            "-vcodec", "libwebp",
            "-lossless", "1",
            "-preset", "default",
            "-loop", "0",
            "-an", "-vsync", "0"
        ])
        .videoFilters([
            "scale=600:600:flags=lanczos:force_original_aspect_ratio=decrease",
            "format=rgba",
            "pad=600:600:(ow-iw)/2:(oh-ih)/2:color=#00000000",
            "setsar=1"
        ])
        .on("end", async () => {
            const stickerData = fs.readFileSync(outputPath);
            await zen.sendMessage(sender, { sticker: stickerData }, { quoted: msg });
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        })
        .on("error", async (err) => {
            console.error("FFmpeg error:", err);
            await zen.sendMessage(sender, {
                text: "❌ Gagal mengonversi media menjadi stiker.",
            }, { quoted: msg });
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        });

    if (mediaType === "video") {
        ffmpegCommand.duration(8); // maksimal 8 detik
    }

    ffmpegCommand.save(outputPath);
};
