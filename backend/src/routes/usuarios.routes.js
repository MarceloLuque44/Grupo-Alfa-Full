import { Router } from "express";
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  login,
  logout,
} from "../controllers/usuarios.controllers.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  loginUsuarioSchema,
} from "../validators/usuariosValidators.js";

const router = Router();

// públicas
router.post("/usuarios", validateRequest(createUsuarioSchema), createUsuario);
router.post("/usuarios/login", validateRequest(loginUsuarioSchema), login);
router.post("/usuarios/logout", logout);

// protegidas
router.get("/usuarios", authMiddleware, getUsuarios);
router.get("/usuarios/:id", authMiddleware, getUsuarioById);
router.put("/usuarios/:id", authMiddleware, validateRequest(updateUsuarioSchema), updateUsuario);
router.delete("/usuarios/:id", authMiddleware, deleteUsuario);

export default router;
