"use strict";
import axios from "axios";
let url =
  "https://matchkicks.com/wp-content/uploads/2021/01/Sneaker-Mocks-2021-01-20T205048.889-300x300.png";

import sharp from "sharp";
import { performance } from "perf_hooks";
import yargs from "yargs";
import fs from "fs";
import sizeOf from "image-size";
import processImage from "../server/codec/index.js";
import crypto from "crypto";

let { options } = yargs;
let mainUrls = {
  "t-shirt": {
    white: "assets/2020/07/MK-WhiteTshirt-MockUp-Blank-1.png",
    black: "assets/2020/11/MK-BlackTshirt-MockUp-Blank.png",
    gray: "assets/2020/11/MK-GreyTshirt-MockUp-Blank.png",
  },
  hoodie: {
    white: "assets/2021/01/MK-White-Hoodie-Mock.png",
    black: "assets/2021/01/MK-Black-Hoodie-Mock.png",
    gray: "assets/2021/01/MK-Grey-Hoodie-Mock-2.png",
  },
};

/**
 * overlayImages
 */
export async function overlayImages(req, res) {
  // ---------------------------------------------------------------
  // Validate Data
  // ---------------------------------------------------------------
  if (!req.query.productType) {
    console.error("ERROR: productType is not provided");
    sendLogoImage(req, res);
    return null;
  }
  if (!req.query.background) {
    console.error("ERROR: background is not provided");
    sendLogoImage(req, res);
    return null;
  }
  req.query.productType = req.query.productType.toLowerCase();
  req.query.background = req.query.background.toLowerCase();
  if (req.query.background === "grey") {
    req.query.background = "gray";
  }
  if (!["t-shirt", "hoodie"].includes(req.query.productType)) {
    console.error("ERROR: Invalid Prouct-type");
    sendLogoImage(req, res);
    return null;
  }
  if (!["white", "black", "gray"].includes(req.query.background)) {
    console.error("ERROR: Invalid background color");
    sendLogoImage(req, res);
    return null;
  }

  if (!req.query.mainUrl) {
    req.query.mainUrl = mainUrls[req.query.productType][req.query.background];
  }

  if (!req.query.logoUrl) {
    req.query.logoUrl = "assets/2020/12/MK_logo.png";
  }

  if (!req.query.mainUrl || !req.query.logoUrl || !req.query.sneakerUrl) {
    console.error("ERROR: Make sure you provide all parameters");
    sendLogoImage(req, res);
    return null;
  }
  if (
    !fs.existsSync(`./${req.query.mainUrl}`) ||
    !fs.existsSync(`./${req.query.logoUrl}`) ||
    !fs.existsSync(`./${req.query.sneakerUrl}`)
  ) {
    console.error("ERROR: Image doesn't exist at specified path");
    sendLogoImage(req, res);
    return null;
  }

  let out = await makeOverlayImage(req, res);

  if (!out || out.error) {
    console.error(out ? out.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    return null;
  }
  if (out.msg) {
    res.sendFile(out.msg["get-file-from-path"], { root: process.cwd() + "/" });
    return null;
  }

  res.end(Buffer.from(out, "utf-8"));
}

/**
 * makeOverlayImage
 * @param {} req
 * @param {*} res
 */

async function makeOverlayImage(req, res) {
  // create output file name using md5
  let outputFileName = createOutputFileName(req);

  // check if the file already exists for this API
  if (fs.existsSync(outputFileName) && req.query.forceRefresh != "true") {
    return {
      msg: {
        "get-file-from-path": outputFileName,
      },
    };
  }

  req.query.mkStandardWidth = 1008;
  req.query.mkStandardHeight = 1152;

  const scalingFactor = req.query.scalingFactor
    ? parseFloat(req.query.scalingFactor)
    : 1;

  let metadata = {};

  metadata.mainImg = {
    height: req.query.mkStandardHeight * scalingFactor,
    width: req.query.mkStandardWidth * scalingFactor,
  };

  // logo
  let logoImg = await sharp("./" + req.query.logoUrl)
    .resize({
      width: parseInt(192 * scalingFactor),
    })
    .toBuffer();
  metadata.logoImg = sizeOf(logoImg);

  // sneaker
  let sneakerImg = await sharp("./" + req.query.sneakerUrl)
    .resize(
      parseInt(300 * 1.5 * scalingFactor),
      parseInt(140 * 1.5 * scalingFactor)
    )
    .toBuffer();
  metadata.sneakerImg = sizeOf(sneakerImg);

  // design
  let designImg = "./images/design-resized.png";
  if (req.query.productType === "t-shirt") {
    req.query.designImgWidth = parseInt(
      (req.query.mkStandardWidth - 100) * 0.5 * scalingFactor
    );
  } else {
    req.query.designImgWidth = parseInt(
      (req.query.mkStandardWidth - 220) * 0.5 * scalingFactor
    );
  }
  req.query.file = req.query.designUrl;
  req.query.data = req.query.designData;

  designImg = await generateDesignImage(req, res);
  if (!designImg || designImg.error) {
    return {
      error: designImg
        ? designImg.error
        : "ERROR: designImg is either null or undefined",
    };
  }
  metadata.designImg = sizeOf(designImg);

  // get output image
  let arrCompositeImages = [
    {
      input: logoImg,
      gravity: "southeast",
      top: 0,
      left: parseInt(metadata.mainImg.width - metadata.logoImg.width),
    },
    {
      input: designImg,
      top: parseInt(250 * scalingFactor),
      left: parseInt((metadata.mainImg.width - metadata.designImg.width) * 0.5),
    },
  ];
  if (req.query.hideSneaker !== "true") {
    arrCompositeImages.push({
      input: sneakerImg,
      gravity: "southeast",
      top:
        req.query.productType === "t-shirt"
          ? parseInt(metadata.mainImg.height - 260 * scalingFactor)
          : parseInt(metadata.mainImg.height - 50 * scalingFactor),
      left: 0,
    });
  }

  if (req.query.outputFormat === "from-file") {
    sharp("./" + req.query.mainUrl)
      .resize({
        width: parseInt(metadata.mainImg.width),
        height: parseInt(metadata.mainImg.height),
      })
      .composite([...arrCompositeImages])
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toFile(outputFileName, function (err) {
        if (err) {
          console.log("error: ", err);
        }
        res.sendFile(outputFileName, {
          root: process.cwd() + "/",
        });
      });
  } else {
    let out = await sharp("./" + req.query.mainUrl)
      .resize({
        width: parseInt(metadata.mainImg.width),
        height: parseInt(metadata.mainImg.height),
      })
      .composite([...arrCompositeImages])
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toBuffer();

    return out;
  }
}

/****************************************
 * get4by4Image
 * @param {*} req
 * @param {*} res
 * **************************************
 */

export async function get4by4Image(req, res) {
  req.query.image1 = JSON.parse(req.query.image1);
  req.query.image2 = JSON.parse(req.query.image2);
  req.query.image3 = JSON.parse(req.query.image3);
  req.query.image4 = JSON.parse(req.query.image4);
  // ---------------------------------------------------------------
  // Validate Data
  // ---------------------------------------------------------------
  if (!req.query.image1.productType) {
    console.error("ERROR: productType is not provided");
    sendLogoImage(req, res);
    return null;
  }
  if (!req.query.image1.background) {
    console.error("ERROR: background is not provided");
    sendLogoImage(req, res);
    return null;
  }
  req.query.image1.productType = req.query.image1.productType.toLowerCase();
  req.query.image1.background = req.query.image1.background.toLowerCase();
  if (req.query.image1.background === "grey") {
    req.query.image1.background = "gray";
  }
  if (!["t-shirt", "hoodie"].includes(req.query.image1.productType)) {
    console.error("ERROR: Invalid Prouct-type");
    sendLogoImage(req, res);
    return null;
  }
  if (!["white", "black", "gray"].includes(req.query.image1.background)) {
    console.error("ERROR: Invalid background color");
    sendLogoImage(req, res);
    return null;
  }

  if (!req.query.image1.mainUrl) {
    req.query.image1.mainUrl =
      mainUrls[req.query.image1.productType][req.query.image1.background];
  }

  if (!req.query.image1.logoUrl) {
    req.query.image1.logoUrl = "assets/2020/12/MK_logo.png";
  }

  if (
    !req.query.image1.mainUrl ||
    !req.query.image1.logoUrl ||
    !req.query.image1.sneakerUrl
  ) {
    console.error("ERROR: Make sure you provide all parameters");
    sendLogoImage(req, res);
    return null;
  }
  if (
    !fs.existsSync(`./${req.query.image1.mainUrl}`) ||
    !fs.existsSync(`./${req.query.image1.logoUrl}`) ||
    !fs.existsSync(`./${req.query.image1.sneakerUrl}`)
  ) {
    console.error("ERROR: Image doesn't exist at specified path");
    sendLogoImage(req, res);
    return null;
  }

  let customQs = {
    q1: {
      query: req.query.image1,
    },
    q2: {
      query: req.query.image2,
    },
    q3: {
      query: req.query.image3,
    },
    q4: {
      query: req.query.image4,
    },
  };
  let out1 = await makeOverlayImage(customQs.q1, res);
  let out2 = await makeOverlayImage(customQs.q2, res);
  let out3 = await makeOverlayImage(customQs.q3, res);
  let out4 = await makeOverlayImage(customQs.q4, res);
  if (!out1 || out1.error) {
    console.error(out1 ? out1.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    return null;
  }
  if (out1.msg) {
    res.sendFile(out1.msg["get-file-from-path"], { root: process.cwd() + "/" });
    return null;
  }
  // out2
  if (!out2 || out2.error) {
    console.error(out2 ? out2.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    return null;
  }
  if (out2.msg) {
    res.sendFile(out2.msg["get-file-from-path"], { root: process.cwd() + "/" });
    return null;
  }
  // out3
  if (!out3 || out3.error) {
    console.error(out3 ? out3.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    return null;
  }
  if (out3.msg) {
    res.sendFile(out3.msg["get-file-from-path"], { root: process.cwd() + "/" });
    return null;
  }
  // out4
  if (!out4 || out4.error) {
    console.error(out4 ? out4.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    return null;
  }
  if (out4.msg) {
    res.sendFile(out4.msg["get-file-from-path"], {
      root: process.cwd() + "/",
    });
    return null;
  }

  res.end(Buffer.from(out1, "utf-8"));
}

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

/***************************************
 * Convert SVG to PNG
 * *************************************
 */

export async function convertSvgToPng(req, res) {
  let out = await generateDesignImage(req, res);
  res.end(Buffer.from(out, "base64"));
}

async function generateDesignImage(req, res) {
  const { data, file } = req.query;
  if (!file) {
    return {
      error: "ERROR: Design File not provided",
    };
  }

  // parse data
  let decodedData = [];
  try {
    decodedData = data ? JSON.parse(data) : [];
  } catch (e) {
    return {
      error: "ERROR: Invalid svg data",
    };
  }

  //process to edit and get the image file
  let pngBinaryResponse = await processImage(file, decodedData).catch((err) => {
    //should be able to debug here too; process itself error should be shown here
    return {
      error: "ERROR: processImageError",
      errorInfo: err,
    };
  });
  if (!pngBinaryResponse || typeof pngBinaryResponse !== "string") {
    return {
      error: "ERROR: Invalid binaryResponse",
    };
  }

  pngBinaryResponse = pngBinaryResponse.replace("svgjs:data", "svgjs");
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

/************************************
 * SEND LOGO IMAGE
 * **********************************
 */
async function sendLogoImage(req, res) {
  let d = await sharp("./assets/2020/12/MK_logo.png")
    .resize({ width: 300 })
    .toBuffer();
  res.end(Buffer.from(d, "utf-8"));
}

/************************************
 * EXTRAS
 * **********************************
 */
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

function getImgFromSymlink(path) {
  let outImg = Buffer.from("./" + path);

  // const logoImg = logoUrl ? await sharp(Buffer.from(
  //   (await axios.get(logoUrl, { responseType: "arraybuffer" })).data,
  //   "utf-8"
  // )).resize(200,300).toBuffer(): "./images/logo-resized.png";
}
function createOutputFileName(req) {
  let md5sum = crypto.createHash("md5");
  let data =
    req.query.productType +
    req.query.background +
    req.query.logoUrl +
    req.query.designUrl +
    req.query.designData +
    req.query.sneakerUrl +
    req.query.scalingFactor +
    req.query.mainUrl;
  md5sum.update(data ? data : "default-name");
  let outputFileName = "./images/sharp/output-" + md5sum.digest("hex") + ".jpg";
  return outputFileName;
}
