import express from "express";
import { resizeImages, overlayImages, getAnImageLocally, getAnImageFromApi, convertSvgToPng } from "../controllers/imageOperations.js";
var router = express.Router();
router.get("/v1/convertSvgToPng", convertSvgToPng);
router.get("/v1/resizeImages", resizeImages);
router.get("/v1/overlayImages", overlayImages);
router.get("/v1/getAnImageLocally", getAnImageLocally);
router.get("/v1/getAnImageFromApi", getAnImageFromApi);
export default router;