import { z } from "zod";

const uuidSchema = z.string().uuid();

export function validateUuidParam(req, res, next) {
  const validation = uuidSchema.safeParse(req.params.id);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "El identificador no es válido",
    });
  }

  next();
}