const requiredEnvVariables = [
  "DATABASE_URL",
  "JWT_SECRET",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Falta la variable de entorno obligatoria: ${variable}`
    );
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET debe tener al menos 32 caracteres"
  );
}

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(
    "PORT debe ser un número válido entre 1 y 65535"
  );
}

export const env = {
  port,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl:
    process.env.FRONTEND_URL || "http://localhost:5173",
};