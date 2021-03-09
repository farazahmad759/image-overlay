let Jimp = require("jimp");
const { performance } = require("perf_hooks");
let t0 = performance.now();

function resizeImages() {
  let MKStandardWidth = 1008;
  let MKStandardHeight = 1152;
  Jimp.read("./images/shirt.png")
    .then((lenna) => {
      return lenna
        .resize(MKStandardWidth, MKStandardHeight)
        .write("./images/jimp/shirt-resized.png");
    })
    .catch((err) => {
      console.error(err);
    });
  Jimp.read("./images/design.png")
    .then((lenna) => {
      return lenna
        .resize((MKStandardWidth - 100) * 0.5, (MKStandardHeight - 100) * 0.5)
        .write("./images/jimp/design-resized.png");
    })
    .catch((err) => {
      console.error(err);
    });
  Jimp.read("./images/logo.png")
    .then((lenna) => {
      return lenna.resize(300, 100).write("./images/jimp/logo-resized.png");
    })
    .catch((err) => {
      console.error(err);
    });
  Jimp.read("./images/sneaker.png")
    .then((lenna) => {
      return lenna.resize(300, 100).write("./images/jimp/sneaker-resized.png");
    })
    .catch((err) => {
      console.error(err);
    });
}

exports.resizeImages = resizeImages;

module.exports = resizeImages;
