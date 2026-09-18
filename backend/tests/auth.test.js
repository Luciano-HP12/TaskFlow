import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { cleanDatabase } from "./helpers/database.js";

describe("Auth API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  /* ======================================================
     REGISTER
  ====================================================== */

  describe("POST /api/auth/register", () => {
    it("debe registrar un usuario correctamente", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Luciano Test",
          email: "luciano@test.com",
          password: "Password123",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      expect(response.body.data.user).toMatchObject({
        name: "Luciano Test",
        email: "luciano@test.com",
      });

      expect(response.body.data.user.id).toBeDefined();

      expect(
        response.body.data.user.passwordHash
      ).toBeUndefined();
    });

    it("debe normalizar el email a minúsculas", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Luciano Test",
          email: "LUCIANO@TEST.COM",
          password: "Password123",
        });

      expect(response.status).toBe(201);

      expect(response.body.data.user.email).toBe(
        "luciano@test.com"
      );
    });

    it("debe rechazar un email duplicado", async () => {
      const user = {
        name: "Luciano Test",
        email: "luciano@test.com",
        password: "Password123",
      };

      const firstResponse = await request(app)
        .post("/api/auth/register")
        .send(user);

      expect(firstResponse.status).toBe(201);

      const secondResponse = await request(app)
        .post("/api/auth/register")
        .send({
          ...user,
          name: "Otro usuario",
        });

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.success).toBe(false);
    });

    it("debe rechazar datos inválidos", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "",
          email: "correo-invalido",
          password: "123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  /* ======================================================
     LOGIN
  ====================================================== */

  describe("POST /api/auth/login", () => {
    it("debe iniciar sesión y devolver un token JWT", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Luciano Test",
          email: "luciano@test.com",
          password: "Password123",
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "luciano@test.com",
          password: "Password123",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe(
        "string"
      );

      expect(response.body.data.user).toMatchObject({
        name: "Luciano Test",
        email: "luciano@test.com",
      });

      expect(
        response.body.data.user.passwordHash
      ).toBeUndefined();
    });

    it("debe rechazar una contraseña incorrecta", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Luciano Test",
          email: "luciano@test.com",
          password: "Password123",
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "luciano@test.com",
          password: "PasswordIncorrecto",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Credenciales incorrectas"
      );
    });

    it("debe rechazar un usuario inexistente con el mismo mensaje de credenciales", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "noexiste@test.com",
          password: "Password123",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Credenciales incorrectas"
      );
    });
  });

  /* ======================================================
     AUTH / ME
  ====================================================== */

  describe("GET /api/auth/me", () => {
    it("debe devolver el usuario autenticado con un token válido", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Luciano Test",
          email: "luciano@test.com",
          password: "Password123",
        });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "luciano@test.com",
          password: "Password123",
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.user).toMatchObject({
        name: "Luciano Test",
        email: "luciano@test.com",
      });

      expect(
        response.body.data.user.passwordHash
      ).toBeUndefined();
    });

    it("debe rechazar una petición sin token", async () => {
      const response = await request(app)
        .get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("debe rechazar un token inválido", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set(
          "Authorization",
          "Bearer token-invalido"
        );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});