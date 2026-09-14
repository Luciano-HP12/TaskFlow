import bcrypt from "bcryptjs";
import { db } from "../prisma/db.ts";
import jwt from "jsonwebtoken";

export async function registerUser({ name, email, password }) {
  const existingUser = await db.orm.public.User
    .where({ email })
    .first();

  if (existingUser) {
    const error = new Error("El correo electrónico ya está registrado");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.orm.public.User.create({
    name,
    email,
    passwordHash,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function loginUser({ email, password }) {
  const user = await db.orm.public.User
    .where({ email })
    .first();

  if (!user) {
    const error = new Error("Credenciales incorrectas");
    error.statusCode = 401;
    throw error;
  }

  const passwordIsValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordIsValid) {
    const error = new Error("Credenciales incorrectas");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function getCurrentUser(userId) {
  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}