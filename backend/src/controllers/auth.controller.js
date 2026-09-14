import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth.service.js";

export async function register(req, res) {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const user = await registerUser(validation.data);

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function login(req, res) {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const result = await loginUser(validation.data);

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function me(req, res) {
  try {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}