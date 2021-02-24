const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const sharpOverlay = require("./src/sharp");
const jimpOverlay = require("./src/jimp");

const argv = yargs(hideBin(process.argv)).argv;
if (argv.library === "sharp") {
  if (argv.action === "resizeImages") {
    sharpOverlay.resizeImages();
  } else if (argv.action === "overlayImages") {
    sharpOverlay.overlayImages();
  }
} else {
  if (argv.action === "resizeImages") {
    jimpOverlay.resizeImages();
  } else if (argv.action === "overlayImages") {
    jimpOverlay.overlayImages();
  }
}
