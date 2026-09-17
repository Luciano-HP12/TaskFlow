import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Token de autenticación requerido",
      });
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Formato de token inválido",
      });
    }

    const decoded = jwt.verify(
      token,
      env.jwtSecret
    );

    req.user = {
      id: decoded.userId,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
}