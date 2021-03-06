import axios from "axios";
let url =
  "https://matchkicks.com/wp-content/uploads/2021/01/Sneaker-Mocks-2021-01-20T205048.889-300x300.png";

import sharp from "sharp";
import { performance } from "perf_hooks";
import yargs from "yargs";
import fs from "fs";
import sizeOf from "image-size";
import processImage from "../server/codec/index.js";

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
  if (!mainUrl || !logoUrl || !sneakerUrl) {
    res.send({
      error: "Please provide all necessary parameters",
    });
    return null;
  }
  if (
    !fs.existsSync(`./${mainUrl}`) ||
    !fs.existsSync(`./${logoUrl}`) ||
    !fs.existsSync(`./${sneakerUrl}`)
  ) {
    res.send({
      error: "Image does not exist",
    });
    return null;
  }

  let mainImg = await sharp("./" + mainUrl);
  let logoImg = await sharp("./" + logoUrl)
    .resize({ width: 190 })
    .toBuffer();
  let sneakerImg = await sharp("./" + sneakerUrl)
    .resize({ width: 400 })
    .toBuffer();
  let designImg = "./images/design-resized.png";
  // if (designUrl) {
  //   if (fs.existsSync(`./${designUrl}`)) {
  //     designImg = await sharp("./" + designUrl)
  //       .resize(400, 600)
  //       .toBuffer();
  //   } else {
  //     designImg = Buffer.from(
  //       (await axios.get(designUrl, { responseType: "arraybuffer" })).data,
  //       "utf-8"
  //     );
  //   }
  // }
  req.query.designImgWidth = 400;
  req.query.file = req.query.designUrl;
  req.query.data = req.query.designData;
  designImg = await generateDesignImage(req, res);

  // get dimensions
  let metadata = {};
  metadata.mainImg = await mainImg.metadata();
  metadata.logoImg = sizeOf(logoImg);
  metadata.sneakerImg = sizeOf(sneakerImg);

  // console.log(metadata);
  // get output image
  let currentData = Date.now();
  if (!designImg) {
    return null;
  }
  let outputImg = await sharp("./" + mainUrl)
    // .resize({ width: 400 })
    .composite([
      {
        input: logoImg,
        gravity: "southeast",
        top: 0,
        left: metadata.mainImg.width - metadata.logoImg.width,
      },
      {
        input: designImg,
      },
      {
        input: sneakerImg,
        gravity: "southeast",
        top: metadata.mainImg.height - metadata.sneakerImg.height,
        left: 10,
      },
    ])
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    //   .toBuffer();
    // .then((data) => {
    //   // sharp(data)
    //   //   .resize(300, 400)
    //   //   .toBuffer()
    //   //   .then((d) => {
    //   //     res.end(Buffer.from(d, "base64"));
    //   //   });
    // });
    .toFile(`./images/sharp/output-${currentData}.jpg`, function (err) {
      console.log("error: ", err);
      var t1 = performance.now();

      res.sendFile(`output-${currentData}.jpg`, {
        root: process.cwd() + "/images/sharp/",
      });
    });
  // res.end(Buffer.from(outputImg, "base64"));
}

/**
 * Convert SVG to PNG
 */

export async function convertSvgToPng(req, res) {
  let out = await generateDesignImage(req, res);
  res.end(Buffer.from(out, "base64"));
}

function getImgFromSymlink(path) {
  let outImg = Buffer.from("./" + path);

  // const logoImg = logoUrl ? await sharp(Buffer.from(
  //   (await axios.get(logoUrl, { responseType: "arraybuffer" })).data,
  //   "utf-8"
  // )).resize(200,300).toBuffer(): "./images/logo-resized.png";
}

export async function getAnImageLocally(req, res) {
  //
  let t0 = performance.now();
  if (!req.query.path) {
    res.send({
      error: "Please provide a path to image",
    });
    return null;
  }
  if (!fs.existsSync(req.query.path)) {
    res.send({
      error: "The file you are trying to access is not available",
    });
    return null;
  }
  // res.sendFile(req.query.path, { root: process.cwd() });

  let out = await sharp(req.query.path).toBuffer();
  let t1 = performance.now();
  // console.log("Time (ms) to fetch an Image by an API = ", t1 - t0);
  res.end(Buffer.from(out, "base64"));
}

export async function getAnImageFromApi(req, res) {
  //
  let t0 = performance.now();
  if (!req.query.path) {
    res.send({
      error: "Please provide a path to image",
    });
    return null;
  }

  const out = await sharp(
    Buffer.from(
      (
        await axios.get(
          `http://localhost:80/api/v1/getAnImageLocally?path=${req.query.path}`,
          { responseType: "arraybuffer" }
        )
      ).data,
      "utf-8"
    )
  ).toBuffer();

  let t1 = performance.now();
  // console.log(
  //   "Time (ms) to fetch an Image by an API from another API = ",
  //   t1 - t0
  // );
  res.end(Buffer.from(out, "base64"));
}

async function generateDesignImage(req, res) {
  //
  const { data, file } = req.query;
  if (!file) {
    res.send("File not provided");
    return null;
  }
  //parse data
  let decodedData = [];
  try {
    decodedData = data ? JSON.parse(data) : [];
  } catch (e) {
    res.send("Invalid svg data");
    return null;
    // handle error
  }
  //process to edit and get the image file
  const pngBinaryResponse = await processImage(file, decodedData).catch(
    (err) => {
      //should be able to debug here too; process itself error should be shown here
      console.log("----> processImageError: ", err, "<-------");
      return null;
    }
  );
  if (!pngBinaryResponse) {
    res.send({
      error: "Invalid binaryResponse",
    });
    return null;
  }
  let strBase64 = Buffer.from(pngBinaryResponse);
  let out = await sharp(strBase64)
    .png()
    .resize({
      width: req.query.designImgWidth ? req.query.designImgWidth : 275,
    })
    .sharpen()
    .toBuffer();

  return out;
}
