import axios from "axios";
let url =
  "https://matchkicks.com/wp-content/uploads/2021/01/Sneaker-Mocks-2021-01-20T205048.889-300x300.png";

import sharp from "sharp";
import { performance } from "perf_hooks";
import yargs from "yargs";
import fs from "fs";
let { options } = yargs;

export function resizeImages(req, res) {
  let MKStandardWidth = 1008;
  let MKStandardHeight = 1152;
  sharp("./images/shirt.png")
    .resize(MKStandardWidth, MKStandardHeight)
    .toFile("./images/shirt-resized.png", function (err) {
      if (err) {
        console.log("error: ", err);
      }
    });
  sharp("./images/design.png")
    .resize((MKStandardWidth - 100) * 0.5, (MKStandardHeight - 100) * 0.5)
    .toFile("./images/design-resized.png", function (err) {
      if (err) {
        console.log("error: ", err);
      }
    });
  sharp("./images/logo.png")
    .resize(300, 100)
    .toFile("./images/logo-resized.png", function (err) {
      if (err) {
        console.log("error: ", err);
      }
    });
  sharp("./images/sneaker.png")
    .resize(300, 100)
    .toFile("./images/sneaker-resized.png", function (err) {
      if (err) {
        console.log("error: ", err);
      }
    });

  res.send({
    done: "done",
  });
}

/**
 * overlayImages
 */
export async function overlayImages(req, res) {
  //
  if (fs.existsSync(`./downloads/jjj.png`)) {
    fs.unlinkSync(`./downloads/jjj.png`, (err) => {
      if (err) {
        console.log("couldnt delete the file", err);
      } else {
        console.log("file was deleted successfully");
      }
    });
  } else {
    console.log("file does not exist");
  }

  //
  var t0 = performance.now();

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
    // .toBuffer()
    // .then((data) => {
    //   // sharp(data)
    //   //   .resize(300, 400)
    //   //   .toBuffer()
    //   //   .then((d) => {
    //   //     res.end(Buffer.from(d, "base64"));
    //   //   });
    // });
    .toFile("./images/sharp/output.jpg", function (err) {
      console.log("error: ", err);
      var t1 = performance.now();
      res.sendFile("output.jpg", { root: process.cwd() + "/images/sharp/" });
    });
}
