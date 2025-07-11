const { default: Sticker } = require("wa-sticker-formatter");
const stickerCommand = require("./sticker");

module.exports = {
    s: stickerCommand,
    sticker: stickerCommand,
    tg: require("./toimg"),
    bg: require("./rembg"),
    snf: require("./stickerinfo"),
    pdl: require("./pinterest"),
    ig: require("./igdl"),
    sc: require("./stickercrp"),
    help: require("./help"),
    menu: require("./menu"),
    allmenu: require("./allmenu"),
    emojimix: require("./emojimix"),
    brat: require("./brat"),
    steal: require("./steal"),
    hitamkan: require("./hitamkan"),
};
