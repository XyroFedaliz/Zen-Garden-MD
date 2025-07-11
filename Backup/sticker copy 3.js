const fs = require("fs");
const path = require("path");
const Crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const webp = require("node-webpmux");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// Convert image buffer to webp
async function imageToWebp(media) {
    const tmpFileIn = path.join("temp", `${Crypto.randomBytes(6).toString("hex")}.jpg`);
    const tmpFileOut = path.join("temp", `${Crypto.randomBytes(6).toString("hex")}.webp`);
    fs.writeFileSync(tmpFileIn, media);

    await new Promise((resolve, reject) => {
        ffmpeg(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"
            ])
            .toFormat("webp")
            .save(tmpFileOut);
    });

    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    fs.unlinkSync(tmpFileOut);
    return buff;
}

// Convert video buffer to webp
async function videoToWebp(media) {
    const tmpFileIn = path.join("temp", `${Crypto.randomBytes(6).toString("hex")}.mp4`);
    const tmpFileOut = path.join("temp", `${Crypto.randomBytes(6).toString("hex")}.webp`);
    fs.writeFileSync(tmpFileIn, media);

    await new Promise((resolve, reject) => {
        ffmpeg(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
                "-loop", "0",
                "-ss", "00:00:00.0",
                "-t", "00:00:05.0",
                "-preset", "default",
                "-an", "-vsync", "0"
            ])
            .toFormat("webp")
            .save(tmpFileOut);
    });

    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    fs.unlinkSync(tmpFileOut);
    return buff;
}

// Tambahkan metadata Exif ke file webp
async function writeExif(mediaBuffer, metadata) {
    const tmpFileIn = path.join("temp", `${Crypto.randomBytes(6).toString("hex")}.webp`);
    const tmpFileOut = path.join("temp", `${Crypto.randomBytes(6).toString("hex")}.webp`);
    fs.writeFileSync(tmpFileIn, mediaBuffer);

    const img = new webp.Image();
    await img.load(tmpFileIn);

    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00,
        0x00, 0x00
    ]);

    const json = {
        "sticker-pack-id": metadata.packId || "com.zen.pack",
        "sticker-pack-name": metadata.packName || "Zen Pack",
        "sticker-pack-publisher": metadata.packPublish || "ZenBot",
        "sticker-pack-publisher-email": metadata.packEmail || "zen@example.com",
        "sticker-pack-publisher-website": metadata.packWebsite || "https://zenbot.local",
        "android-app-store-link": metadata.androidApp || "https://play.google.com/store/apps/details?id=com.whatsapp",
        "ios-app-store-link": metadata.iOSApp || "https://apps.apple.com/app/whatsapp-messenger/id310633997",
        "emojis": metadata.emojis || ["😄"],
        "is-avatar-sticker": metadata.isAvatar || false
    };

    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
    exifAttr.writeUIntLE(jsonBuff.length, 14, 4);
    const exif = Buffer.concat([exifAttr, jsonBuff]);

    img.exif = exif;
    await img.save(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    return tmpFileOut;
}

module.exports = async (zen, msg, sender, pushname) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const message = msg.message;

    const isQuotedImage = quoted?.imageMessage;
    const isQuotedVideo = quoted?.videoMessage;
    const isDirectImage = message?.imageMessage;
    const isDirectVideo = message?.videoMessage;

    const mediaType = isQuotedImage || isDirectImage ? "image" :
                      isQuotedVideo || isDirectVideo ? "video" : null;
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
    const fileBuffer = [];
    for await (const chunk of stream) fileBuffer.push(chunk);
    const mediaData = Buffer.concat(fileBuffer);

    try {
        const webpBuffer = mediaType === "image"
            ? await imageToWebp(mediaData)
            : await videoToWebp(mediaData);

        const metadata = {
            packId: "com.zen.bot",
            packName: "Zen Pack",
            packPublish: pushname,
            packEmail: "zen@example.com",
            packWebsite: "https://zenbot.local",
            androidApp: "https://play.google.com/store/apps/details?id=com.whatsapp",
            iOSApp: "https://apps.apple.com/app/whatsapp-messenger/id310633997",
            emojis: ["🔥", "💫"],
            isAvatar: false
        };

        const stickerPath = await writeExif(webpBuffer, metadata);
        const stickerData = fs.readFileSync(stickerPath);

        await zen.sendMessage(sender, { sticker: stickerData }, { quoted: msg });
        fs.unlinkSync(stickerPath);
    } catch (err) {
        console.error("❌ Gagal membuat stiker:", err);
        await zen.sendMessage(sender, {
            text: "❌ Terjadi kesalahan saat membuat stiker.",
        }, { quoted: msg });
    }
};
