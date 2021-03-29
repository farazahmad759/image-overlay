import { createSVGWindow } from "svgdom";
import { SVG, registerWindow } from "@svgdotjs/svg.js";
import sharp from "sharp";
import fs from "fs";
import {
  debug_api_convert_svg_to_png,
  debug_api_2by4_images,
} from "./../../config/debug.js";
// import Snap from "snapsvg";
const LOGO_FILE_PATH = "assets/2020/12/MK_logo.png";
const SVG_FILE_PATH = "assets/2021/03/CAN-of-WHOOPASS-Final.svg";

const window = createSVGWindow();
const { document } = window;
export const svgToPngConverter = async (req, res) => {
  // validation
  if (!req.query.file) {
    res.send("ERROR: File not provided");
    return null;
  }
  if (!req.query.data) {
    res.send("ERROR: Data cannot be empty");
    return null;
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
    let haha = await modifySVG(req.query.file, req.query.data);
    res.end(Buffer.from(haha, "utf-8"));
  } catch (e) {
    res.send(e);
  }
};

const modifySVG = async (file, data) => {
  //
  return new Promise(async (resolve, reject) => {
    //
    let fileContent = null;
    if (!fs.existsSync(file)) {
      reject("ERROR: File does not exist");
      return null;
    }
    fileContent = fs.readFileSync(file, "utf8");
    fileContent = fileContent.split("?>");
    fileContent = fileContent.pop().split("-->");
    fileContent = fileContent.pop().trim();
    let newFileName = "./downloads/" + file.split("/").pop();
    fs.writeFileSync(newFileName, fileContent, "utf-8");
    fileContent = fs.readFileSync(newFileName, "utf-8");
    let rootCanvas = SVG(fileContent);
    for (let i = 0; i < data.length; i++) {
      let obj = data[i];
      if (!obj.id || !obj.property || !obj.value) {
        reject("ERROR: Data's id, property and value cannot be null");
        return null;
      }
      console.log(" EROOR ================== ", rootCanvas.type);
      rootCanvas = await modifySvgProperty(rootCanvas, obj);
      //   console.log("BEFORE");
    }
    // data.forEach(async (obj) => {
    //   if (!obj.id || !obj.property || !obj.value) {
    //     reject("ERROR: Data's id, property and value cannot be null");
    //     return null;
    //   }
    //   rootCanvas = await modifySvgProperty(rootCanvas, obj);
    //   console.log("BEFORE");
    // });
    let finalData = rootCanvas.svg();
    finalData = finalData.replace("svgjs:data", "svgjs");
    fs.writeFileSync(newFileName, finalData, "utf-8");
    let out = await sharp(newFileName).png().toBuffer();
    resolve(out);
  });
};

async function modifySvgProperty(rootCanvas, propertyData) {
  if (propertyData.property === "background-colour") {
    propertyData.property = "background-color";
  }
  //
  return new Promise((resolve, reject) => {
    //
    if (propertyData.property === "background-color") {
      modifyBackgroundColor(rootCanvas, propertyData);
    }
    resolve(rootCanvas);
  });
}

function modifyBackgroundColor(rootCanvas, propertyData) {
  let { id, property, value } = propertyData;
  let element = rootCanvas.find(`#${id}`);
  let hexValue = "#" + value;
  element.map((inner) => {
    debug_api_convert_svg_to_png(inner);
    if (inner.type === "g") {
      //its a group, fill the children
      inner.find("path").fill(hexValue);
    } else {
      //is not a group, fill the element
      inner.fill(hexValue);
    }
  });
}
