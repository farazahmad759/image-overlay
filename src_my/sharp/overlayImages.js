const axios = require("axios");
let url =
  "https://matchkicks.com/wp-content/uploads/2021/01/Sneaker-Mocks-2021-01-20T205048.889-300x300.png";

const sharp = require("sharp");
const { performance } = require("perf_hooks");
const { background } = require("jimp");
const { options } = require("yargs");
var t0 = performance.now();

async function overlayImages() {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "utf-8");
  sharp("./images/shirt-resized.png")
    .resize(1200, 1500)
    .composite([
      {
        input: "./images/logo-resized.png",
        gravity: "southeast",
        top: 10,
        left: 700,
      },
      {
        input: "./images/sneaker-resized.png",
        gravity: "southeast",
        top: 900,
        left: 10,
      },
      {
        input: "./images/design-resized.png",
      },
    ])
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .toFile("./images/sharp/output.jpg", function (err) {
      console.log("error: ", err);
      var t1 = performance.now();
      console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
    });
}
exports.overlayImages = overlayImages;
module.exports = overlayImages;
