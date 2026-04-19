import { Router } from "express";
import {
  createProperty,
  getPropertyById,
  getPropertyReadme,
  importPropertyMedia,
  listProperties,
} from "../controllers/propertyController.js";

const router = Router();

router.get("/", listProperties);
router.post("/", createProperty);
router.get("/:id", getPropertyById);
router.post("/:id/import-drive", importPropertyMedia);
router.get("/:id/readme", getPropertyReadme);

export default router;
