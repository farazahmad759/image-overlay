import { createSVGWindow } from "svgdom";
import { SVG, registerWindow, Shape } from "@svgdotjs/svg.js";
import sharp from "sharp";
import fs from "fs";
import {
  debug_api_convert_svg_to_png,
  debug_api_2by4_images,
} from "./../../config/debug.js";
// import { query, validationResult } from "express-validator";
import validate from "validate.js";
let validationConstraints = {
  file: {
    presence: true,
    type: "string",
    length: {
      minimum: 4,
      message: "must be at least 4 characters",
    },
  },
  data: {
    presence: true,
    type: "string",
    length: {
      minimum: 6,
      message: "must be at least 6 characters",
    },
  },
  width: {
    presence: true,
    type: "integer",
  },
};
let validationErrors = null;
// import Snap from "snapsvg";
const LOGO_FILE_PATH = "assets/2020/12/MK_logo.png";
const SVG_FILE_PATH = "assets/2021/03/CAN-of-WHOOPASS-Final.svg";

const window = createSVGWindow();
const { document } = window;
export const svgToPngConverter = async (req, res) => {
  // validation
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  if (req.query.file.substring(0, 7) !== "assets/") {
    req.query.file = "assets/" + req.query.file;
  }
  req.query.width = req.query.width ? parseInt(req.query.width) : 1008;
  validationErrors = validate({ ...req.query }, validationConstraints);
  if (validationErrors) {
    return res.send(validationErrors);
  }
  try {
    req.query.data = JSON.parse(req.query.data);
  } catch (e) {
    res.send("ERROR: Cannot parse data");
    return null;
  }
  // perform conversion
  registerWindow(window, document);

  try {
    let haha = await modifySVG(req.query.file, req.query.data, {
      width: req.query.width,
    });
    res.end(Buffer.from(haha, "utf-8"));
  } catch (e) {
    res.send(e);
  }
};

const modifySVG = async (file, data, options = {}) => {
  return new Promise(async (resolve, reject) => {
    let fileContent = null;
    if (!fs.existsSync(file)) {
      reject("ERROR: File does not exist");
      return null;
    }
    fileContent = fs.readFileSync(file, "utf8");
    fileContent = fileContent.split("?>");
    fileContent = fileContent.pop().split("-->");
    fileContent = fileContent.pop().trim();
    let newFileName = "./downloads/" + file.split("/").pop() + Date.now();
    fs.writeFileSync(newFileName, fileContent, "utf-8");
    fileContent = fs.readFileSync(newFileName, "utf-8");
    let rootCanvas = SVG(fileContent);
    for (let i = 0; i < data.length; i++) {
      let obj = data[i];
      if (!obj.id || !obj.property || !obj.value) {
        reject("ERROR: Data's id, property and value cannot be null");
        return null;
      }
      rootCanvas = await modifySvgProperty(rootCanvas, obj);
    }
    let finalData = rootCanvas.svg();
    finalData = finalData.replace("svgjs:data", "svgjs");
    fs.writeFileSync(newFileName, finalData, "utf-8");
    try {
      let out = await sharp(newFileName)
        .resize({ width: parseInt(options.width) })
        .png()
        .toBuffer();
      resolve(out);
    } catch (e) {
      debug_api_2by4_images("ERROR: ", e);
      reject("ERROR");
    }
  });
};

async function modifySvgProperty(rootCanvas, propertyData) {
  if (propertyData.property === "background-colour") {
    propertyData.property = "background-color";
  }
  return new Promise((resolve, reject) => {
    if (propertyData.property === "background-color") {
      modifyBackgroundColor(rootCanvas, propertyData);
      resolve(rootCanvas);
    } else if (propertyData.property === "background-image") {
      modifyBackgroundImage(rootCanvas, propertyData);
      resolve(rootCanvas);
    } else {
      reject("ERROR: ");
    }
  });
}

function modifyBackgroundColor(rootCanvas, propertyData) {
  let { id, property, value } = propertyData;
  let element = rootCanvas.find(`#${id}`);
  let hexValue = "#" + value;
  element.map((inner) => {
    if (inner.type === "g") {
      //its a group, fill the children
      inner.find("path").fill(hexValue);
    } else {
      //is not a group, fill the element
      inner.fill(hexValue);
    }
  });
}

function modifyBackgroundImage(rootCanvas, propertyData) {
  return new Promise((resolve, reject) => {
    let { id, property, value } = propertyData;
    if (value.substring(0, 7) !== "assets/") {
      value = "assets/" + value;
    }

    if (!fs.existsSync(value, "base64")) {
      reject("ERROR: background image does not exist");
      return null;
    }
    const toBase64 = fs.readFileSync(value, "base64");
    //svg processing
    const box = rootCanvas.find(`#${id}`);

    const polygon = document.createElement("defs");
    const patternName = `hello-${id}-${Date.now()}`;
    try {
      //try to get the bbox on the first children of a group
      // console.log("======================== ", box.children());
      const childrenEl = box.children()[0].bbox();
      const { height, width, x, y } = childrenEl.pop();

      if (value.toLowerCase().indexOf("gradient") !== -1) {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="100%" height="25%" x="0" y="${y}" preserveAspectRatio="xMidYMin meet">
                <image href='data:image/jpeg;base64,${toBase64}' url='' width="100%" height="25%" preserveAspectRatio="xMidYMin slice" overflow="visible"  />
                </pattern>`;
      } else if (value.toLowerCase().indexOf("pattern") !== -1) {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="25%" height="25%" x="${x}" y="${y}" preserveAspectRatio="xMinYMid slice">
                <image href='data:image/jpeg;base64,${toBase64}' url='' width="25%" height="25%" preserveAspectRatio="xMinYMid slice" overflow="visible"  />
                </pattern>`;
      } else {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="${width}" height="${height}" x="${x}" y="${y}">
                <image href='data:image/jpeg;base64,${toBase64}' url='' width="${width}" height="${height}" preserveAspectRatio="none"  />
                </pattern>`;
      }

      box.add(polygon);
      box.find(`path`).fill(`url('#${patternName}')`);
    } catch (err) {
      //bbox not present, check other option
      //could indicate is the outmost group
      console.log(
        "---> error with the bbox, trying with the parent element itself",
        err
      );
      let topSVG = box.parent()[0];

      let rootWidth = "100%";
      let rootHeight = "100%";
      let rootX = 0;
      let rootY = 0;

      if (topSVG && topSVG.width()) {
        rootWidth = topSVG.width();
      }
      if (topSVG && topSVG.height()) {
        rootWidth = topSVG.height();
      }

      if (value.toLowerCase().indexOf("gradient") !== -1) {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="100%" height="25%" x="0" y="${rootY}" preserveAspectRatio="xMidYMin meet">
                <image href='data:image/jpeg;base64,${toBase64}' url='' width="100%" height="25%" preserveAspectRatio="xMidYMin slice" overflow="visible"  />
                </pattern>`;
      } else if (value.toLowerCase().indexOf("pattern") !== -1) {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="25%" height="25%" x="${rootX}" y="${rootY}" preserveAspectRatio="xMinYMid slice">
                <image href='data:image/jpeg;base64,${toBase64}' url='' width="25%" height="25%" preserveAspectRatio="xMinYMid slice" overflow="visible"  />
                </pattern>`;
      } else {
        //just a plain image
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="${rootWidth}" height="${rootHeight}" x="${rootX}" y="${rootY}">
                <image href='data:image/jpeg;base64,${toBase64}' url='' width="${rootWidth}" height="${rootHeight}" preserveAspectRatio="none"  />
                </pattern>`;
      }

      //load the children
      let childrenPath = box.find("path");
      //check the children length
      if (childrenPath[0].length > 0) {
        box.add(polygon);
        box.find(`path`).fill(`url('#${patternName}')`);
      } else {
        //other type of svg structure, for example from https://www.flaticon.com/
        console.log("using last resort parsing");
        const _bbox = box.bbox()[0];
        const { height, width, x, y } = _bbox;

        if (value.toLowerCase().indexOf("gradient") !== -1) {
          polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="100%" height="25%" x="0" y="${y}" preserveAspectRatio="xMidYMin meet">
                  <image href='data:image/jpeg;base64,${toBase64}' url='' width="100%" height="25%" preserveAspectRatio="none" overflow="visible"  />
                  </pattern>`;
        } else if (value.toLowerCase().indexOf("pattern") !== -1) {
          polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="25%" height="25%" x="${x}" y="${y}" preserveAspectRatio="xMinYMid slice">
                  <image href='data:image/jpeg;base64,${toBase64}' url='' width="25%" height="25%" preserveAspectRatio="xMinYMid slice" overflow="visible"  />
                  </pattern>`;
        } else {
          polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="${width}" height="${height}" x="${x}" y="${y}">
                  <image href='data:image/jpeg;base64,${toBase64}' url='' width="${width}" height="${height}" preserveAspectRatio="none"  />
                  </pattern>`;
        }
        rootCanvas.add(polygon);
        rootCanvas.find(`#${id}`).fill(`url('#${patternName}')`);
      }
    }
  });
}
