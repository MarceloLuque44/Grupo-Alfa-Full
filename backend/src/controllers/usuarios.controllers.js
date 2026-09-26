import { pool } from "../db.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt";

const PUBLIC_COLUMNS =
  "id_usuario, nro_carnet, apellido_paterno, apellido_materno, nombre, fecha_nacimiento, correo_electronico, usuario_vigente";

const sanitize = (row) => {
  if (!row) return row;
  const { contraseña, ...rest } = row;
  return rest;
};

const existePorCarnet = async (nro_carnet) => {
  if (nro_carnet == null) return false;
  const { rows } = await pool.query("SELECT 1 FROM usuarios WHERE nro_carnet = $1", [nro_carnet]);
  return rows.length > 0;
};

const existePorCorreo = async (correo_electronico) => {
  if (!correo_electronico) return false;
  const { rows } = await pool.query("SELECT 1 FROM usuarios WHERE correo_electronico = $1", [correo_electronico]);
  return rows.length > 0;
};

export const getUsuarios = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM usuarios ORDER BY id_usuario ASC`);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const getUsuarioById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID debe ser numérico" });
    }
    const { rows } = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM usuarios WHERE id_usuario = $1`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createUsuario = async (req, res, next) => {
  try {
    const {
      nro_carnet,
      apellido_paterno,
      apellido_materno,
      nombre,
      fecha_nacimiento,
      correo_electronico,
      contraseña,
      usuario_vigente,
    } = req.body;

    if (await existePorCarnet(nro_carnet)) {
      return res.status(409).json({ error: "El nro de carnet ya existe" });
    }
    if (await existePorCorreo(correo_electronico)) {
      return res.status(409).json({ error: "El correo electrónico ya existe" });
    }

    const sal = await bcrypt.genSalt(10);
    const contraEncriptada = await bcrypt.hash(contraseña, sal);

    const { rows } = await pool.query(
      `INSERT INTO usuarios
       (nro_carnet, apellido_paterno, apellido_materno, nombre, fecha_nacimiento, correo_electronico, contraseña, usuario_vigente)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING ${PUBLIC_COLUMNS}`,
      [nro_carnet, apellido_paterno, apellido_materno, nombre, fecha_nacimiento, correo_electronico, contraEncriptada, usuario_vigente ?? true]
    );

    const token = generateToken(rows[0].id_usuario, res);

    res.status(201).json({
      estado: "exito",
      datos: rows[0],
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { id_usuario, nro_carnet, correo_electronico, contraseña } = req.body;

    let rows;
    if (id_usuario != null) {
      const r = await pool.query("SELECT * FROM usuarios WHERE id_usuario = $1", [id_usuario]);
      rows = r.rows;
    } else if (nro_carnet != null) {
      const r = await pool.query("SELECT * FROM usuarios WHERE nro_carnet = $1", [nro_carnet]);
      rows = r.rows;
    } else {
      const r = await pool.query("SELECT * FROM usuarios WHERE correo_electronico = $1", [correo_electronico]);
      rows = r.rows;
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: "No existe en la base de datos" });
    }

    const user = rows[0];
    const esValido = await bcrypt.compare(contraseña, user.contraseña);

    if (!esValido) {
      return res.status(401).json({ error: "Usuario o contraseña erróneos" });
    }

    const token = generateToken(user.id_usuario, res);

    res.status(200).json({
      estado: "exito",
      datos: sanitize(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    status: "Exito",
    message: "El usuario ya no esta logeado",
  });
};

export const updateUsuario = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID debe ser numérico" });
    }

    const existente = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM usuarios WHERE id_usuario = $1`, [id]);
    if (existente.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const {
      nro_carnet,
      apellido_paterno,
      apellido_materno,
      nombre,
      fecha_nacimiento,
      correo_electronico,
      contraseña,
      usuario_vigente,
    } = req.body;

    // chequeo conflicto nro_carnet si cambia
    if (nro_carnet && nro_carnet !== existente.rows[0].nro_carnet) {
      if (await existePorCarnet(nro_carnet)) {
        return res.status(409).json({ error: "El nro de carnet ya existe" });
      }
    }

    // chequeo conflicto correo si cambia
    if (correo_electronico && correo_electronico !== existente.rows[0].correo_electronico) {
      if (await existePorCorreo(correo_electronico)) {
        return res.status(409).json({ error: "El correo electrónico ya existe" });
      }
    }

    let contraEncriptada = null;
    if (contraseña) {
      const sal = await bcrypt.genSalt(10);
      contraEncriptada = await bcrypt.hash(contraseña, sal);
    }

    // update dinámico: COALESCE mantiene valor actual si no se envía
    const { rows } = await pool.query(
      `UPDATE usuarios
       SET nro_carnet = COALESCE($1, nro_carnet),
           apellido_paterno = COALESCE($2, apellido_paterno),
           apellido_materno = COALESCE($3, apellido_materno),
           nombre = COALESCE($4, nombre),
           fecha_nacimiento = COALESCE($5, fecha_nacimiento),
           correo_electronico = COALESCE($6, correo_electronico),
           contraseña = COALESCE($7, contraseña),
           usuario_vigente = COALESCE($8, usuario_vigente)
       WHERE id_usuario = $9
       RETURNING ${PUBLIC_COLUMNS}`,
      [nro_carnet ?? null, apellido_paterno ?? null, apellido_materno ?? null, nombre ?? null, fecha_nacimiento ?? null, correo_electronico ?? null, contraEncriptada, usuario_vigente ?? null, id]
    );

    return res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteUsuario = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID debe ser numérico" });
    }
    const { rowCount } = await pool.query("DELETE FROM usuarios WHERE id_usuario = $1", [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
