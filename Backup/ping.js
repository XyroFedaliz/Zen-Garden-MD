module.exports = async (zen, msg, sender, pushname) => {
    await zen.sendMessage(sender, { text: `Halo ${pushname}, saya Zen!` }, { quoted: msg });
};

module.exports.help = {
    name: "ping",
    description: "Cek apakah bot masih aktif"
};
