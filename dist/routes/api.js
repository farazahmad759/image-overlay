import express from "express";
import { resizeImages, overlayImages } from "../controllers/imageOperations.js";
var router = express.Router();

router.get("/v1/resizeImages", resizeImages);
router.get("/v1/overlayImages", overlayImages);

export default router;