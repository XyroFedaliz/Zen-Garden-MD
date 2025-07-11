const chalk = require("chalk");
const commands = require("./commands");


module.exports = async (zen, m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const body = msg.message.conversation ||
                 msg.message.extendedTextMessage?.text ||
                 msg.message.imageMessage?.caption ||
                 msg.message.videoMessage?.caption ||
                 msg.message.buttonsResponseMessage?.selectedButtonId ||
                 msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
                 msg.message.templateButtonReplyMessage?.text || "";

    const sender = msg.key.remoteJid;
    const pushname = msg.pushName || "Zen";

    // Cek prefix (!, /, atau ,)
    const prefixRegex = /^[!,/]/;
    if (!prefixRegex.test(body)) return;

    // Ekstrak command tanpa prefix
    const [rawCommand, ...args] = body.slice(1).trim().split(" ");
    const command = rawCommand.toLowerCase();    

    // console.log(chalk.blue(`Pesan Diterima: ${command}`));

    // Command handling
    if (commands[command]) {
        await commands[command](zen, msg, sender, pushname, args);
    } else {
        await zen.sendMessage(sender, { text: `Perintah "${command}" tidak dikenal.` }, { quoted: msg });
    }
    
};

