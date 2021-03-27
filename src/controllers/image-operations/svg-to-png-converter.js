import { createSVGWindow } from "svgdom";
import { SVG, registerWindow } from "@svgdotjs/svg.js";
import sharp from "sharp";
import {
  debug_api_convert_svg_to_png,
  debug_api_2by4_images,
} from "./../../config/debug.js";
const LOGO_FILE_PATH = "assets/2020/12/MK_logo.png";
const SVG_FILE_PATH = "assets/2021/03/CAN-of-WHOOPASS-Final.svg";
const window = createSVGWindow();
const { document } = window;
export const svgToPngConverter = async (req, res) => {
  // validation
  debug_api_convert_svg_to_png("hello", "hello", { dd: "dd" });
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
    debug_api_convert_svg_to_png("Converted", req.query.data);
  } catch (e) {
    res.send("ERROR: Cannot parse data");
    return null;
  }
  // perform conversion
  let haha = await modifySVG(req.query.file, req.query.data);
  res.end(Buffer.from(haha, "utf-8"));
};

const modifySVG = async (file, data) => {
  //
  return new Promise(async (resolve, reject) => {
    //
    let out = await sharp(SVG_FILE_PATH)
      .resize({ width: 300 })
      .png()
      .toBuffer();
    resolve(out);
  });
};
