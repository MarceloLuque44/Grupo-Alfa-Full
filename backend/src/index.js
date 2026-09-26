import express from "express";
import usuariosRoutes from "./routes/usuarios.routes.js";
import materiasRoutes from "./routes/materias.routes.js";
import asesoresRoutes from "./routes/asesores.routes.js";
import capacitacionesRoutes from "./routes/capacitaciones.routes.js";
import temasRoutes from "./routes/temas.routes.js";
import estudiantesRoutes from "./routes/estudiantes.routes.js";
import administrativosRoutes from "./routes/administrativos.routes.js";
import apoderadosRoutes from "./routes/apoderados.routes.js";
import morgan from "morgan";
import { PORT } from "./config.js";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

config();

if (!process.env.JWT_SECRET) {
  console.warn("ADVERTENCIA: JWT_SECRET no definido en .env");
}

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", usuariosRoutes);
app.use("/api", materiasRoutes);
app.use("/api", asesoresRoutes);
app.use("/api", capacitacionesRoutes);
app.use("/api", temasRoutes);
app.use("/api", estudiantesRoutes);
app.use("/api", administrativosRoutes);
app.use("/api", apoderadosRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT);
// eslint-disable-next-line no-console
console.log("Server on port", PORT);
