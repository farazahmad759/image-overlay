"use strict";
import axios from "axios";
let url =
  "https://matchkicks.com/wp-content/uploads/2021/01/Sneaker-Mocks-2021-01-20T205048.889-300x300.png";

import sharp from "sharp";
import { performance } from "perf_hooks";
import yargs from "yargs";
import fs from "fs";
import {
  makeOverlayImage,
  sendLogoImage,
  createOutputFileName,
} from "./../helpers/index.js";
import sizeOf from "image-size";
import { apiCounters } from "./../apiCounters.js";

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
  console.log(" == API COUNTERS == ", apiCounters);
  // ---------------------------------------------------------------
  // Validate Data
  // ---------------------------------------------------------------
  if (!req.query.productType) {
    let mkCustomMessage = "ERROR: productType is not provided";
    console.error(mkCustomMessage);
    res.set("MK-Custom-Message", mkCustomMessage);
    sendLogoImage(req, res);
    apiCounters.overlayImages.error++;
    return null;
  }
  if (!req.query.background) {
    let mkCustomMessage = "ERROR: background is not provided";
    console.error(mkCustomMessage);
    res.set("MK-Custom-Message", mkCustomMessage);
    sendLogoImage(req, res);
    apiCounters.overlayImages.error++;
    return null;
  }
  req.query.productType = req.query.productType.toLowerCase();
  req.query.background = req.query.background.toLowerCase();
  if (req.query.background === "grey") {
    req.query.background = "gray";
  }
  if (!["t-shirt", "hoodie"].includes(req.query.productType)) {
    let mkCustomMessage = "ERROR: Invalid Prouct-type";
    console.error(mkCustomMessage);
    res.set("MK-Custom-Message", mkCustomMessage);
    sendLogoImage(req, res);
    apiCounters.overlayImages.error++;
    return null;
  }
  if (!["white", "black", "gray"].includes(req.query.background)) {
    let mkCustomMessage = "ERROR: Invalid background color";
    console.error(mkCustomMessage);
    res.set("MK-Custom-Message", mkCustomMessage);
    sendLogoImage(req, res);
    apiCounters.overlayImages.error++;
    return null;
  }

  if (!req.query.mainUrl) {
    req.query.mainUrl = mainUrls[req.query.productType][req.query.background];
  }

  if (!req.query.logoUrl) {
    req.query.logoUrl = "assets/2020/12/MK_logo.png";
  }

  if (!req.query.mainUrl || !req.query.logoUrl || !req.query.sneakerUrl) {
    let mkCustomMessage = "ERROR: Make sure you provide all parameters";
    console.error(mkCustomMessage);
    res.set("MK-Custom-Message", mkCustomMessage);
    sendLogoImage(req, res);
    apiCounters.overlayImages.error++;
    return null;
  }
  if (
    !fs.existsSync(`./${req.query.mainUrl}`) ||
    !fs.existsSync(`./${req.query.logoUrl}`) ||
    !fs.existsSync(`./${req.query.sneakerUrl}`)
  ) {
    let mkCustomMessage = "ERROR: Image doesn't exist at specified path";
    console.error(mkCustomMessage);
    res.set("MK-Custom-Message", mkCustomMessage);
    sendLogoImage(req, res);
    apiCounters.overlayImages.error++;
    return null;
  }

  let out = await makeOverlayImage(req, res);

  if (!out || out.error) {
    let mkCustomMessage = out ? out.error : "ERROR: unknown error";
    console.error(mkCustomMessage);
    res.set("MK-Custom-Message", mkCustomMessage);
    sendLogoImage(req, res);
    apiCounters.overlayImages.error++;
    return null;
  }
  if (out.msg) {
    res.sendFile(out.msg["get-file-from-path"], { root: process.cwd() + "/" });
    apiCounters.overlayImages.success_cached++;
    return null;
  }
  apiCounters.overlayImages.success_fresh++;
  res.set("MK-Custom-Message", "Success");
  res.end(Buffer.from(out, "utf-8"));
}

/****************************************
 * get4by4Image
 * @param {*} req
 * @param {*} res
 * **************************************
 */

export async function get4by4Image(req, res) {
  console.log(" == API COUNTERS == ", apiCounters);
  // ---------------------------------------------------------------
  // Check for cached image
  // ---------------------------------------------------------------
  let outputFileName = createOutputFileName(req);
  if (fs.existsSync(outputFileName) && req.query.forceRefresh != "true") {
    res.sendFile(outputFileName, { root: process.cwd() + "/" });
    apiCounters.get4by4Image.success_cached++;
    return null;
  }
  // ---------------------------------------------------------------
  // Validate Data
  // ---------------------------------------------------------------
  if (
    !req.query.image1 ||
    !req.query.image2 ||
    !req.query.image3 ||
    !req.query.image4
  ) {
    console.error("ERROR: please provide all 4 images");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
    return null;
  }
  req.query.image1 = JSON.parse(req.query.image1);
  req.query.image2 = JSON.parse(req.query.image2);
  req.query.image3 = JSON.parse(req.query.image3);
  req.query.image4 = JSON.parse(req.query.image4);
  if (
    !req.query.image1.productType ||
    !req.query.image2.productType ||
    !req.query.image3.productType ||
    !req.query.image4.productType
  ) {
    console.error("ERROR: productType is not provided");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
    return null;
  }
  if (
    !req.query.image1.background ||
    !req.query.image2.background ||
    !req.query.image3.background ||
    !req.query.image4.background
  ) {
    console.error("ERROR: background is not provided");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
    return null;
  }
  req.query.image1.productType = req.query.image1.productType.toLowerCase();
  req.query.image2.productType = req.query.image2.productType.toLowerCase();
  req.query.image3.productType = req.query.image3.productType.toLowerCase();
  req.query.image4.productType = req.query.image4.productType.toLowerCase();
  req.query.image1.background = req.query.image1.background.toLowerCase();
  req.query.image2.background = req.query.image2.background.toLowerCase();
  req.query.image3.background = req.query.image3.background.toLowerCase();
  req.query.image4.background = req.query.image4.background.toLowerCase();
  if (req.query.image1.background === "grey") {
    req.query.image1.background = "gray";
  }
  if (req.query.image2.background === "grey") {
    req.query.image2.background = "gray";
  }
  if (req.query.image3.background === "grey") {
    req.query.image3.background = "gray";
  }
  if (req.query.image4.background === "grey") {
    req.query.image4.background = "gray";
  }
  if (
    !["t-shirt", "hoodie"].includes(req.query.image1.productType) ||
    !["t-shirt", "hoodie"].includes(req.query.image2.productType) ||
    !["t-shirt", "hoodie"].includes(req.query.image3.productType) ||
    !["t-shirt", "hoodie"].includes(req.query.image4.productType)
  ) {
    console.error("ERROR: Invalid Prouct-type");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
    return null;
  }
  if (
    !["white", "black", "gray"].includes(req.query.image1.background) ||
    !["white", "black", "gray"].includes(req.query.image2.background) ||
    !["white", "black", "gray"].includes(req.query.image3.background) ||
    !["white", "black", "gray"].includes(req.query.image4.background)
  ) {
    console.error("ERROR: Invalid background color");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
    return null;
  }

  if (
    !req.query.image1.mainUrl ||
    !req.query.image2.mainUrl ||
    !req.query.image3.mainUrl ||
    !req.query.image4.mainUrl
  ) {
    req.query.image1.mainUrl =
      mainUrls[req.query.image1.productType][req.query.image1.background];
    req.query.image2.mainUrl =
      mainUrls[req.query.image2.productType][req.query.image2.background];
    req.query.image3.mainUrl =
      mainUrls[req.query.image3.productType][req.query.image3.background];
    req.query.image4.mainUrl =
      mainUrls[req.query.image4.productType][req.query.image4.background];
  }

  if (
    !req.query.image1.logoUrl ||
    !req.query.image2.logoUrl ||
    !req.query.image3.logoUrl ||
    !req.query.image4.logoUrl
  ) {
    req.query.image1.logoUrl = "assets/2020/12/MK_logo.png";
    req.query.image2.logoUrl = "assets/2020/12/MK_logo.png";
    req.query.image3.logoUrl = "assets/2020/12/MK_logo.png";
    req.query.image4.logoUrl = "assets/2020/12/MK_logo.png";
  }

  if (
    !req.query.image1.mainUrl ||
    !req.query.image1.logoUrl ||
    !req.query.image1.sneakerUrl ||
    !req.query.image2.mainUrl ||
    !req.query.image2.logoUrl ||
    !req.query.image2.sneakerUrl ||
    !req.query.image3.mainUrl ||
    !req.query.image3.logoUrl ||
    !req.query.image3.sneakerUrl ||
    !req.query.image4.mainUrl ||
    !req.query.image4.logoUrl ||
    !req.query.image4.sneakerUrl
  ) {
    console.error("ERROR: Make sure you provide all parameters");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
    return null;
  }
  if (
    !fs.existsSync(`./${req.query.image1.mainUrl}`) ||
    !fs.existsSync(`./${req.query.image1.logoUrl}`) ||
    !fs.existsSync(`./${req.query.image1.sneakerUrl}`) ||
    !fs.existsSync(`./${req.query.image2.mainUrl}`) ||
    !fs.existsSync(`./${req.query.image2.logoUrl}`) ||
    !fs.existsSync(`./${req.query.image2.sneakerUrl}`) ||
    !fs.existsSync(`./${req.query.image3.mainUrl}`) ||
    !fs.existsSync(`./${req.query.image3.logoUrl}`) ||
    !fs.existsSync(`./${req.query.image3.sneakerUrl}`) ||
    !fs.existsSync(`./${req.query.image4.mainUrl}`) ||
    !fs.existsSync(`./${req.query.image4.logoUrl}`) ||
    !fs.existsSync(`./${req.query.image4.sneakerUrl}`)
  ) {
    console.error("ERROR: Image doesn't exist at specified path");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
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
    apiCounters.get4by4Image.error++;
    return null;
  }
  // out2
  if (!out2 || out2.error) {
    console.error(out2 ? out2.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
    return null;
  }
  // out3
  if (!out3 || out3.error) {
    console.error(out3 ? out3.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
    return null;
  }
  // out4
  if (!out4 || out4.error) {
    console.error(out4 ? out4.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    apiCounters.get4by4Image.error++;
    return null;
  }

  if (!req.query.scalingFactor) {
    req.query.scalingFactor = 1;
  }
  // comp1

  let comp1;
  let comp2;
  let comp3;
  let comp4;
  let compWidth = 192 * req.query.scalingFactor;
  let compPadding = req.query.compPadding
    ? Math.abs(parseInt(req.query.compPadding))
    : 8;
  // comp1
  if (out1.msg) {
    comp1 = await sharp("./" + out1.msg["get-file-from-path"])
      .resize({
        width: parseInt(compWidth),
      })
      .toBuffer();
  } else {
    comp1 = await sharp(out1)
      .resize({
        width: parseInt(compWidth),
      })
      .toBuffer();
  }
  // comp2
  if (out2.msg) {
    comp2 = await sharp("./" + out2.msg["get-file-from-path"])
      .resize({
        width: parseInt(compWidth),
      })
      .toBuffer();
  } else {
    comp2 = await sharp(out2)
      .resize({
        width: parseInt(compWidth),
      })
      .toBuffer();
  }
  // comp3
  if (out3.msg) {
    comp3 = await sharp("./" + out3.msg["get-file-from-path"])
      .resize({
        width: parseInt(compWidth),
      })
      .toBuffer();
  } else {
    comp3 = await sharp(out3)
      .resize({
        width: parseInt(compWidth),
      })
      .toBuffer();
  }
  // comp4
  if (out4.msg) {
    comp4 = await sharp("./" + out4.msg["get-file-from-path"])
      .resize({
        width: parseInt(compWidth),
      })
      .toBuffer();
  } else {
    comp4 = await sharp(out4)
      .resize({
        width: parseInt(compWidth),
      })
      .toBuffer();
  }
  let compDimensions = sizeOf(comp4);
  let compHeight = compDimensions.height;
  let tempOut = await sharp({
    create: {
      width: parseInt(compWidth * 2 + compPadding * 3),
      height: parseInt(compHeight * 2 + compPadding * 3),
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .composite([
      {
        input: comp1,
        gravity: "southeast",
        top: compPadding,
        left: parseInt(compPadding),
      },
      {
        input: comp2,
        gravity: "southeast",
        top: compPadding,
        left: parseInt(compWidth + 2 * compPadding),
      },
      {
        input: comp3,
        gravity: "southeast",
        top: compHeight + 2 * compPadding,
        left: parseInt(compPadding),
      },
      {
        input: comp4,
        gravity: "southeast",
        top: compHeight + 2 * compPadding,
        left: parseInt(compWidth + 2 * compPadding),
      },
    ])
    .toBuffer();
  fs.writeFile(outputFileName, tempOut, function (err) {
    if (err) return console.log(err);
    console.log("File saved --> ", outputFileName);
  });
  apiCounters.get4by4Image.success_fresh++;
  res.end(Buffer.from(tempOut, "utf-8"));
}
