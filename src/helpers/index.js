import crypto from "crypto";
import fs from "fs";
import sharp from "sharp";
import sizeOf from "image-size";
import processImage from "../server/codec/index.js";

/**
 * makeOverlayImage
 * @param {} req
 * @param {*} res
 */

export async function makeOverlayImage(req, res) {
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

  console.log("this is running ==========================", req.query);
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
    console.log(" ================ buffer");
    let out = await sharp("./" + req.query.mainUrl)
      .resize({
        width: parseInt(metadata.mainImg.width),
        height: parseInt(metadata.mainImg.height),
      })
      .composite([...arrCompositeImages])
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toBuffer();

    fs.writeFile(outputFileName, out, function (err) {
      if (err) return console.log(err);
      console.log("File saved --> ", outputFileName);
    });
    return out;
  }
}

export function createOutputFileName(req) {
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
  if (req.query.image1) {
    data += req.query.image1; // image1 is applicable for 4by4Image
  }
  if (req.query.image2) {
    data += req.query.image2; // image2 is applicable for 4by4Image
  }
  if (req.query.image3) {
    data += req.query.image3; // image3 is applicable for 4by4Image
  }
  if (req.query.image4) {
    data += req.query.image4; // image4 is applicable for 4by4Image
  }
  if (req.query.compPadding) {
    data += req.query.compPadding; // compPadding is applicable for 4by4Image
  }
  md5sum.update(data ? data : "default-name");
  let outputFileName = "./images/sharp/output-" + md5sum.digest("hex") + ".jpg";
  return outputFileName;
}

export async function generateDesignImage(req, res) {
  const { data, file } = req.query;
  if (!file) {
    return {
      error: "ERROR: Design File not provided",
    };
  }

  // parse data
  let decodedData = [];
  console.log(" ================svg data = ", data);
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
export async function sendLogoImage(req, res) {
  let d = await sharp("./assets/2020/12/MK_logo.png")
    .resize({ width: 300 })
    .toBuffer();
  res.end(Buffer.from(d, "utf-8"));
}
