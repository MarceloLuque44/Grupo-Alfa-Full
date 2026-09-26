import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ error: "No autorizado, token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await pool.query(
      `SELECT id_usuario, nro_carnet, apellido_paterno, apellido_materno, nombre, fecha_nacimiento, correo_electronico, usuario_vigente
       FROM usuarios WHERE id_usuario = $1`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario ya no existe" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(401).json({ error: "No autorizado, token inválido" });
  }
};
