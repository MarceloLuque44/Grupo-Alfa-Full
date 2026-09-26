export const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const flatErrors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      return res.status(400).json({ message: flatErrors.join(", ") });
    }

    // normaliza alias (ej. password -> contraseña) y coerciones
    req.body = result.data;
    next();
  };
};
