import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getPropertyById,
  getPropertyReadme,
  importPropertyMedia,
  listProperties,
  streamPropertyImage,
  submitPropertyInterest,
  getInterests,
} from "../controllers/propertyController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", listProperties);
router.post("/", requireAuth, createProperty);
router.get("/interests/list", requireAuth, getInterests);
router.get("/:id", getPropertyById);
router.post("/:id/import-drive", requireAuth, importPropertyMedia);
router.get("/:id/readme", getPropertyReadme);
router.delete("/:id", requireAuth, deleteProperty);
router.post("/:id/interest", submitPropertyInterest);
router.get("/media/:fileId", streamPropertyImage);

export default router;
