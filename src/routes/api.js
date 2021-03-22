import express from "express";
import { overlayImages, get4by4Image } from "../controllers/imageOperations.js";
import {
  resizeImages,
  getAnImageLocally,
  getAnImageFromApi,
  convertSvgToPng,
} from "../controllers/tempOperations.js";
let router = express.Router();
router.get("/v1/convertSvgToPng", convertSvgToPng);
router.get("/v1/get4by4Image", get4by4Image);
router.get("/v1/resizeImages", resizeImages);
router.get("/v1/overlayImages", overlayImages);
router.get("/v1/getAnImageLocally", getAnImageLocally);
router.get("/v1/getAnImageFromApi", getAnImageFromApi);

export default router;
