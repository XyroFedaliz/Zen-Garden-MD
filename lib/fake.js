const fs = require("fs");
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
  docs: fs.readFileSync("./assets/Icon.png"),
  thumbnail: fs.readFileSync("./assets/Icon.png"),
  listfakedocs: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/javascript",
    "text/x-python",
    "text/html",
    "video/mp4",
    "image/png",
  ],
  pickRandom
};
