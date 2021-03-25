import fs from "fs";
import sharp from "sharp";
import sizeOf from "image-size";

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

export async function get2by4Image(req, res) {
  ////////////////////////////////////////////////
  // default values
  ////////////////////////////////////////////////
  if (!req.query.scalingFactor) {
    req.query.scalingFactor = 1;
  }
  req.query.scalingFactor = parseFloat(req.query.scalingFactor);
  if (!req.query.padding) {
    req.query.padding = 0;
  }
  if (!req.query.numImages) {
    req.query.numImages = 4;
  }
  ////////////////////////////////////////////////
  // validate request
  ////////////////////////////////////////////////
  if (!req.query.images || req.query.images.length < req.query.numImages) {
    res.send(
      "ERROR: images should be an array array having at least " +
        req.query.numImages +
        " images."
    );
    return null;
  }
  try {
    req.query.images = JSON.parse(req.query.images);
  } catch (err) {
    console.log(req.query.images);
    res.send("ERROR: images parameter should be a parseable as a JSON object");
    return null;
  }
  ////////////////////////////////////////////////
  // get individual images
  ////////////////////////////////////////////////
  let images = [];
  for (let i = 0; i < req.query.images.length; i++) {
    //
    let _img = null;
    try {
      _img = await fetchAnOverlayImage({
        ...req.query.images[i],
        scalingFactor: req.query.scalingFactor,
      });
      images.push(_img);
    } catch (err) {
      res.send(err);
      return null;
    }
  }
  console.log(" ==== images === ", images);
  ////////////////////////////////////////////////
  // combine overlay images
  ////////////////////////////////////////////////

  res.end(Buffer.from(images[0], "utf-8"));
  //   res.send("done");
}

async function fetchAnOverlayImage(params) {
  if (!params.scalingFactor) {
    params.scalingFactor = 1;
  }
  let dimensions = {
    outputImg: {
      width: parseInt(1008 * params.scalingFactor),
      height: parseInt(1152 * params.scalingFactor),
    },
    mainImg: {
      width: parseInt(1008 * params.scalingFactor),
      height: parseInt(1152 * params.scalingFactor),
    },
    logoImg: {
      width: parseInt(240 * params.scalingFactor),
      height: parseInt(0 * params.scalingFactor),
    },
    sneakerImg: {
      width: parseInt(500 * params.scalingFactor),
      height: parseInt(0 * params.scalingFactor),
    },
  };
  return new Promise(async (resolve, reject) => {
    // default values
    if (!params.logoUrl) {
      params.logoUrl = "assets/2020/12/MK_logo.png";
    }

    // validation
    if (!params.productType) {
      reject("ERROR: productType cannot be null");
    }
    if (!params.background) {
      reject("ERROR: background cannot be null");
    }
    if (!params.mainUrl) {
      reject("ERROR: mainUrl cannot be null");
    }
    if (!params.logoUrl) {
      reject("ERROR: logoUrl cannot be null");
    }
    if (!params.sneakerUrl) {
      reject("ERROR: sneakerUrl cannot be null");
    }

    params.productType = params.productType.toLowerCase();
    params.background = params.background.toLowerCase();
    if (params.background === "grey") {
      params.background = "gray";
    }
    if (!["t-shirt", "hoodie"].includes(params.productType)) {
      reject("ERROR: productType can be either a t-shirt or a hoodie only");
    }
    if (!["white", "black", "gray"].includes(params.background)) {
      reject("ERROR: invalid background color");
    }
    params.mainUrl = mainUrls[params.productType][params.background];

    // fetch individual images
    let _mainImg = null;
    let _logoImg = null;
    let _sneakerImg = null;
    try {
      _mainImg = await fetchAnImage({
        path: params.mainUrl,
        dimensions: dimensions.mainImg,
        trim: true,
      });
      _logoImg = await fetchAnImage({
        path: params.logoUrl,
        dimensions: dimensions.logoImg,
      });
      _sneakerImg = await fetchAnImage({
        path: params.sneakerUrl,
        dimensions: dimensions.sneakerImg,
        trim: true,
      });
    } catch (err) {
      reject(err);
    }
    dimensions.mainImg = sizeOf(_mainImg);
    dimensions.logoImg = sizeOf(_logoImg);
    dimensions.sneakerImg = sizeOf(_sneakerImg);

    let _out = null;
    try {
      _out = await sharp({
        create: {
          width: parseInt(dimensions.outputImg.width),
          height: parseInt(dimensions.outputImg.height),
          channels: 4,
          background: { r: 255, g: 255, b: 0, alpha: 1 },
        },
      })
        .composite([
          {
            input: _mainImg,
          },
          {
            input: _logoImg,
            top: parseInt(0),
            left: parseInt(
              dimensions.outputImg.width - dimensions.logoImg.width
            ),
          },
          {
            input: _sneakerImg,
            top: parseInt(
              dimensions.outputImg.height - dimensions.logoImg.height * 0.5
            ),
            left: parseInt(0),
          },
        ])
        .jpeg()
        .toBuffer();
    } catch (err) {
      reject(err);
    }
    resolve(_out);
  });
}

async function fetchAnImage(params) {
  return new Promise(async (resolve, reject) => {
    if (!params) {
      reject("ERROR: params is undefined ");
    }
    if (!params.path) {
      reject("ERROR: image's path cannot be null ");
    }
    if (!fs.existsSync(params.path)) {
      reject("ERROR: file does not exist at specified path --> " + params.path);
    }

    let _out = null;
    try {
      _out = sharp("./" + params.path).resize({
        width: parseInt(params.dimensions.width),
      });
      if (params.trim) {
        _out = _out.trim();
      }
      _out = await _out.toBuffer();
    } catch (err) {
      reject(err);
    }

    resolve(_out);
  });
}
