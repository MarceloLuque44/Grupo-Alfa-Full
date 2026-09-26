import { Router } from "express";
import {
  getAdministrativos,
  getAdministrativoById,
  createAdministrativo,
  updateAdministrativo,
  deleteAdministrativo,
} from "../controllers/administrativos.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAdministrativoSchema,
  updateAdministrativoSchema,
} from "../validators/administrativosValidators.js";

const router = Router();

router.get("/administrativos", authMiddleware, getAdministrativos);
router.get("/administrativos/:id", authMiddleware, getAdministrativoById);
router.post("/administrativos", authMiddleware, validateRequest(createAdministrativoSchema), createAdministrativo);
router.put("/administrativos/:id", authMiddleware, validateRequest(updateAdministrativoSchema), updateAdministrativo);
router.delete("/administrativos/:id", authMiddleware, deleteAdministrativo);

export default router;
