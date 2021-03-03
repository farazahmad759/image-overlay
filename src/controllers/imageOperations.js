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
  var t0 = performance.now();
  let { logoUrl, sneakerUrl, designUrl, mainUrl } = req.query;
  // if (
  //   !logoUrl
  //   // || !sneakerUrl || !designUrl || !mainUrl
  // ) {
  //   res.send({
  //     error: "Please provide all necessary parameters",
  //   });
  //   return null;
  // }
  const mainImg = mainUrl
    ? Buffer.from(
        (await axios.get(mainUrl, { responseType: "arraybuffer" })).data,
        "utf-8"
      )
    : "./images/shirt-resized.png";
  // const logoImg = Buffer.from(
  //   (await axios.get(logoUrl, { responseType: "arraybuffer" })).data,
  //   "utf-8"
  // );
  const designImg = designUrl
    ? Buffer.from(
        (await axios.get(designUrl, { responseType: "arraybuffer" })).data,
        "utf-8"
      )
    : "./images/design-resized.png";
  const sneakerImg = sneakerUrl
    ? Buffer.from(
        (await axios.get(sneakerUrl, { responseType: "arraybuffer" })).data,
        "utf-8"
      )
    : "./images/sneaker-resized.png";
  sharp(mainImg)
    .resize(1200, 1500)
    .composite([
      {
        input: "./images/logo-resized.png",
        gravity: "southeast",
        top: 10,
        left: 700,
      },
      {
        input: designImg,
      },
      {
        input: sneakerImg,
        gravity: "southeast",
        top: 900,
        left: 10,
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
