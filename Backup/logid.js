module.exports = async (zen, msg, sender, pushname, args) => {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    if (isGroup) {
        console.log("🟢 Grup ID:", from);
    } else {
        console.log("👤 Nomor Pengirim:", sender);
    }

    // Jangan balas apa pun ke user
};

module.exports.help = {
    name: "log",
    description: "Log ID grup atau nomor pengirim ke konsol"
};