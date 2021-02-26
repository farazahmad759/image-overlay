var Jimp = require("jimp");
const { performance } = require("perf_hooks");
var t0 = performance.now();

async function overlayImages() {
  let MKStandardWidth = 1008;
  let MKStandardHeight = 1152;
  let shirt = await Jimp.read("./images/jimp/shirt-resized.png");
  let design = await Jimp.read("./images/jimp/design-resized.png");
  // design = await Jimp.read(
  //   `https://cdn2-183fe.kxcdn.com/api/v1/convert?data=[{"id":"Grunge","value":"fb504c","property":"background-colour","i":1},{"id":"Swirls","value":"709eae","property":"background-colour","i":2},{"id":"Bone","value":"0a0a0a","property":"background-colour","i":3},{"id":"Hand","value":"d1cac8","property":"background-colour","i":4},{"id":"Halftone","value":"d1cac8","property":"background-colour","i":5}]&file=2020/11/Inner-Peace.svg`
  // );
  let sneaker = await Jimp.read("./images/jimp/sneaker-resized.png");
  let ssneaker = await Jimp.read(
    "https://matchkicks.com/wp-content/uploads/2021/01/Sneaker-Mocks-2021-01-20T205048.889-300x300.png"
  );
  // ssneaker.write("./images/jimp/sneaker-resized.png");

  let logo = await Jimp.read("./images/jimp/logo-resized.png");
  shirt
    .background(0xffffffff)
    .composite(design, shirt.getWidth() * 0.25, shirt.getHeight() * 0.25)
    .composite(sneaker, 0, shirt.getHeight() - sneaker.getHeight())
    .composite(logo, shirt.getWidth() - logo.getWidth(), 0)
    .write("./images/jimp/output.jpg");
  var t1 = performance.now();
  console.log("Composite image created in " + (t1 - t0) + " milliseconds.");
}
exports.overlayImages = overlayImages;
module.exports = overlayImages;
