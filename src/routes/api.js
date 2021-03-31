import express from "express";
import { overlayImages, get4by4Image } from "../controllers/imageOperations.js";
import { get2by4Image } from "../controllers/image-operations/get-2by4-image.js";
import { svgToPngConverter } from "../controllers/image-operations/svg-to-png-converter.js";
import {
  resizeImages,
  getAnImageLocally,
  getAnImageFromApi,
  convertSvgToPng,
} from "../controllers/tempOperations.js";
// import { query, body } from "express-validator";

// console.log(query().isString());
let router = express.Router();
router.get(
  "/v1/convertSvgToPng",
  // query("file").isString(),
  // query("data").isString(),
  // query("width").isInt(),
  svgToPngConverter
);
router.get("/v1/get4by4Image", get4by4Image);
router.get("/v1/get2by4Image", get2by4Image);
//
router.get("/v1/resizeImages", resizeImages);
router.get("/v1/overlayImages", overlayImages);
router.get("/v1/getAnImageLocally", getAnImageLocally);
router.get("/v1/getAnImageFromApi", getAnImageFromApi);

export default router;
