"use strict";
import axios from "axios";
let url =
  "https://matchkicks.com/wp-content/uploads/2021/01/Sneaker-Mocks-2021-01-20T205048.889-300x300.png";

import sharp from "sharp";
import { performance } from "perf_hooks";
import yargs from "yargs";
import fs from "fs";
import { makeOverlayImage, sendLogoImage } from "./../helpers/index.js";

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
    // res.sendFile(out1.msg["get-file-from-path"], { root: process.cwd() + "/" });
    // return null;
  } else {
  }
  // out2
  if (!out2 || out2.error) {
    console.error(out2 ? out2.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    return null;
  }
  if (out2.msg) {
    // res.sendFile(out2.msg["get-file-from-path"], { root: process.cwd() + "/" });
    // return null;
  }
  // out3
  if (!out3 || out3.error) {
    console.error(out3 ? out3.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    return null;
  }
  if (out3.msg) {
    // res.sendFile(out3.msg["get-file-from-path"], { root: process.cwd() + "/" });
    // return null;
  }
  // out4
  if (!out4 || out4.error) {
    console.error(out4 ? out4.error : "ERROR: unknown error");
    sendLogoImage(req, res);
    return null;
  }
  if (out4.msg) {
    // res.sendFile(out4.msg["get-file-from-path"], {
    //   root: process.cwd() + "/",
    // });
    // return null;
  }

  // comp1

  let comp1;
  let comp2;
  let comp3;
  let comp4;
  // comp1
  if (out1.msg) {
    comp1 = await sharp("./" + out1.msg["get-file-from-path"])
      .resize({
        width: parseInt(192),
      })
      .toBuffer();
  } else {
    comp1 = await sharp(out1)
      .resize({
        width: parseInt(192),
      })
      .toBuffer();
  }
  // comp2
  if (out2.msg) {
    comp2 = await sharp("./" + out2.msg["get-file-from-path"])
      .resize({
        width: parseInt(192),
      })
      .toBuffer();
  } else {
    comp2 = await sharp(out2)
      .resize({
        width: parseInt(192),
      })
      .toBuffer();
  }
  // comp3
  if (out3.msg) {
    comp3 = await sharp("./" + out3.msg["get-file-from-path"])
      .resize({
        width: parseInt(192),
      })
      .toBuffer();
  } else {
    comp3 = await sharp(out3)
      .resize({
        width: parseInt(192),
      })
      .toBuffer();
  }
  // comp4
  if (out4.msg) {
    comp4 = await sharp("./" + out4.msg["get-file-from-path"])
      .resize({
        width: parseInt(192),
      })
      .toBuffer();
  } else {
    comp4 = await sharp(out4)
      .resize({
        width: parseInt(192),
      })
      .toBuffer();
  }
  let tempOut = await sharp("./assets/blank.png")
    .resize({ width: 1000 })
    .composite([
      {
        input: comp1,
        gravity: "southeast",
        top: 0,
        left: parseInt(200),
      },
      {
        input: comp2,
        gravity: "southeast",
        top: 0,
        left: parseInt(0),
      },
      {
        input: comp3,
        gravity: "southeast",
        top: 300,
        left: parseInt(0),
      },
      {
        input: comp4,
        gravity: "southeast",
        top: 300,
        left: parseInt(200),
      },
    ])
    .toBuffer();

  res.end(Buffer.from(tempOut, "utf-8"));
}
