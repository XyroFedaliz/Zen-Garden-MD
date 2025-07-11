// Importing required modules
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const chalk = require("chalk");
const readline = require("readline");
const { resolve } = require("path");

// metode pairing
// True = Pairing Code || False = QR Code
const usePairingCode = true;

// prompt input terminal
async function question(prompt) {
    process.stdout.write(chalk.blue(prompt));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => rl.question("", (ans) => {
        rl.close();
        resolve(ans);
    }));
}

// koneksi whatsapp
async function connectToWhatsApp() {
    console.log(chalk.green("Memulai koneksi ke WhatsApp..."));

    // Menyimpan Sesi Login 
    const { state, saveCreds } = await useMultiFileAuthState(resolve(__dirname, "./ZenAuth"));

    // Mengambil versi terbaru dari WhatsApp
    const { version } = await fetchLatestBaileysVersion();

    // Membuat koneksi ke WhatsApp
    const zen = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.0"],
        version
    });

    // Metode Pairing Code
    if (usePairingCode && !zen.authState.creds.registered) {
        console.log(chalk.yellow("Silahkan masukkan nomor untuk pairing (contoh: +62):"));
        const phonenumber = await question("> ");
        const code = await zen.requestPairingCode(phonenumber.trim());
        console.log(chalk.yellow(`🎫 Pairing Code : ${code}`));
    }


    // Menyimpan sesi login
    zen.ev.on("creds.update", saveCreds);

    // Informasi login
    zen.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            console.log(chalk.red("🔘 Koneksi terputus!"));
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === "open") {
            console.log(chalk.green("☑️ Koneksi berhasil!"));
        }
    });

    // Respon pesan masuk
    zen.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]

        if (!msg.message) return

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId || msg.message.templateButtonReplyMessage?.text || ""
        const sender = msg.key.remoteJid
        const pushname = msg.pushName || "Zen"

        const listColor = ["red", "green", "yellow", "blue", "magenta", "cyan"]
        const randomColor = listColor[Math.floor(Math.random() * listColor.length)]

        console.log(
            chalk.yellow.bold("Credit By ZenGarden"),
            chalk.green("[ Whatsapp ]"),
            chalk[randomColor](pushname), 
            chalk[randomColor](" : "),
            chalk.white(body)
        )

        require("./zen")(zen, m)
    })
}

// Menjalankan koneksi
connectToWhatsApp();
