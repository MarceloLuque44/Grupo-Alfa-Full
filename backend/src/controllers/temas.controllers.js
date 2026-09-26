import { pool } from "../db.js";

const SELECT_TEMAS = `SELECT t.id_tema, t.nombre_tema, t.id_materia, m.nombre_materia
  FROM temas t LEFT JOIN materias m ON m.id_materia = t.id_materia`;

export const getTemas = async (req, res, next) => {
  try {
    const idMateria = req.query.id_materia ? parseInt(req.query.id_materia, 10) : null;
    if (req.query.id_materia && Number.isNaN(idMateria)) {
      return res.status(400).json({ message: "id_materia debe ser numérico" });
    }
    const { rows } = idMateria
      ? await pool.query(`${SELECT_TEMAS} WHERE t.id_materia = $1 ORDER BY t.id_tema ASC`, [idMateria])
      : await pool.query(`${SELECT_TEMAS} ORDER BY t.id_tema ASC`);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const getTemaById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID debe ser numérico" });
    const { rows } = await pool.query(`${SELECT_TEMAS} WHERE t.id_tema = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Tema no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createTema = async (req, res, next) => {
  try {
    const { nombre_tema, id_materia } = req.body;
    if (id_materia != null) {
      const m = await pool.query("SELECT 1 FROM materias WHERE id_materia = $1", [id_materia]);
      if (m.rows.length === 0) return res.status(409).json({ error: "La materia no existe" });
    }
    const { rows } = await pool.query(
      "INSERT INTO temas (nombre_tema, id_materia) VALUES ($1, $2) RETURNING *",
      [nombre_tema, id_materia ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateTema = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID debe ser numérico" });
    const { nombre_tema, id_materia } = req.body;
    if (id_materia != null) {
      const m = await pool.query("SELECT 1 FROM materias WHERE id_materia = $1", [id_materia]);
      if (m.rows.length === 0) return res.status(409).json({ error: "La materia no existe" });
    }
    const { rows } = await pool.query(
      `UPDATE temas SET nombre_tema = COALESCE($1, nombre_tema),
        id_materia = COALESCE($2, id_materia)
       WHERE id_tema = $3 RETURNING *`,
      [nombre_tema ?? null, id_materia ?? null, id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Tema no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteTema = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID debe ser numérico" });
    const { rowCount } = await pool.query("DELETE FROM temas WHERE id_tema = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ message: "Tema no encontrado" });
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
