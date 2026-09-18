import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { cleanDatabase } from "./helpers/database.js";

async function createAuthenticatedUser({
  name = "Luciano Test",
  email = "luciano@test.com",
  password = "Password123",
} = {}) {
  await request(app)
    .post("/api/auth/register")
    .send({
      name,
      email,
      password,
    });

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password,
    });

  return {
    token: loginResponse.body.data.token,
    user: loginResponse.body.data.user,
  };
}

async function createCategory(token, name) {
  return request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({ name });
}

describe("Categories API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /api/categories", () => {
    it("debe crear una categoría para el usuario autenticado", async () => {
      const { token } = await createAuthenticatedUser();

      const response = await createCategory(
        token,
        "Universidad"
      );

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      expect(response.body.data.category).toMatchObject({
        name: "Universidad",
      });

      expect(
        response.body.data.category.id
      ).toBeDefined();
    });

    it("debe rechazar la creación sin autenticación", async () => {
      const response = await request(app)
        .post("/api/categories")
        .send({
          name: "Universidad",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("debe rechazar un nombre inválido", async () => {
      const { token } = await createAuthenticatedUser();

      const response = await createCategory(token, "");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("debe rechazar nombres duplicados sin distinguir mayúsculas y minúsculas", async () => {
      const { token } = await createAuthenticatedUser();

      const firstResponse = await createCategory(
        token,
        "Universidad"
      );

      expect(firstResponse.status).toBe(201);

      const secondResponse = await createCategory(
        token,
        "UNIVERSIDAD"
      );

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.success).toBe(false);
    });

    it("debe permitir el mismo nombre de categoría a usuarios diferentes", async () => {
      const userOne = await createAuthenticatedUser({
        name: "Usuario Uno",
        email: "uno@test.com",
      });

      const userTwo = await createAuthenticatedUser({
        name: "Usuario Dos",
        email: "dos@test.com",
      });

      const firstResponse = await createCategory(
        userOne.token,
        "Universidad"
      );

      const secondResponse = await createCategory(
        userTwo.token,
        "Universidad"
      );

      expect(firstResponse.status).toBe(201);
      expect(secondResponse.status).toBe(201);
    });
  });

  describe("GET /api/categories", () => {
    it("debe listar únicamente las categorías del usuario autenticado", async () => {
      const userOne = await createAuthenticatedUser({
        name: "Usuario Uno",
        email: "uno@test.com",
      });

      const userTwo = await createAuthenticatedUser({
        name: "Usuario Dos",
        email: "dos@test.com",
      });

      await createCategory(
        userOne.token,
        "Universidad"
      );

      await createCategory(
        userTwo.token,
        "Trabajo"
      );

      const response = await request(app)
        .get("/api/categories")
        .set(
          "Authorization",
          `Bearer ${userOne.token}`
        );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(
        response.body.data.categories
      ).toHaveLength(1);

      expect(
        response.body.data.categories[0].name
      ).toBe("Universidad");
    });
  });

  describe("PUT /api/categories/:id", () => {
    it("debe permitir editar una categoría propia", async () => {
      const { token } = await createAuthenticatedUser();

      const createResponse = await createCategory(
        token,
        "Universidad"
      );

      const categoryId =
        createResponse.body.data.category.id;

      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Estudios",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.category).toMatchObject({
        id: categoryId,
        name: "Estudios",
      });
    });

    it("no debe permitir editar una categoría de otro usuario", async () => {
      const owner = await createAuthenticatedUser({
        name: "Propietario",
        email: "owner@test.com",
      });

      const otherUser = await createAuthenticatedUser({
        name: "Otro Usuario",
        email: "other@test.com",
      });

      const createResponse = await createCategory(
        owner.token,
        "Privada"
      );

      const categoryId =
        createResponse.body.data.category.id;

      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set(
          "Authorization",
          `Bearer ${otherUser.token}`
        )
        .send({
          name: "Modificada",
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);

      const categoriesResponse = await request(app)
        .get("/api/categories")
        .set(
          "Authorization",
          `Bearer ${owner.token}`
        );

      expect(
        categoriesResponse.body.data.categories[0].name
      ).toBe("Privada");
    });

    it("debe impedir convertir una categoría en un duplicado case-insensitive", async () => {
      const { token } = await createAuthenticatedUser();

      await createCategory(token, "Universidad");

      const workResponse = await createCategory(
        token,
        "Trabajo"
      );

      const workId =
        workResponse.body.data.category.id;

      const response = await request(app)
        .put(`/api/categories/${workId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "universidad",
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("debe eliminar una categoría propia", async () => {
      const { token } = await createAuthenticatedUser();

      const createResponse = await createCategory(
        token,
        "Temporal"
      );

      const categoryId =
        createResponse.body.data.category.id;

      const deleteResponse = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      const categoriesResponse = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${token}`);

      expect(
        categoriesResponse.body.data.categories
      ).toHaveLength(0);
    });

    it("no debe permitir eliminar una categoría de otro usuario", async () => {
      const owner = await createAuthenticatedUser({
        name: "Propietario",
        email: "owner@test.com",
      });

      const otherUser = await createAuthenticatedUser({
        name: "Otro Usuario",
        email: "other@test.com",
      });

      const createResponse = await createCategory(
        owner.token,
        "Privada"
      );

      const categoryId =
        createResponse.body.data.category.id;

      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set(
          "Authorization",
          `Bearer ${otherUser.token}`
        );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);

      const categoriesResponse = await request(app)
        .get("/api/categories")
        .set(
          "Authorization",
          `Bearer ${owner.token}`
        );

      expect(
        categoriesResponse.body.data.categories
      ).toHaveLength(1);
    });

    it("debe conservar la tarea y establecer categoryId en null al eliminar su categoría", async () => {
      const { token } = await createAuthenticatedUser();

      const categoryResponse = await createCategory(
        token,
        "Universidad"
      );

      const categoryId =
        categoryResponse.body.data.category.id;

      const taskResponse = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Estudiar testing",
          categoryId,
        });

      expect(taskResponse.status).toBe(201);
      expect(
        taskResponse.body.data.task.categoryId
      ).toBe(categoryId);

      const taskId = taskResponse.body.data.task.id;

      const deleteResponse = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);

      const taskAfterDeletion = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(taskAfterDeletion.status).toBe(200);
      expect(
        taskAfterDeletion.body.data.task.categoryId
      ).toBeNull();
    });
  });

  describe("Category ID validation", () => {
    it("debe responder 400 cuando el ID no es un UUID válido", async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .delete("/api/categories/id-invalido")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "El identificador no es válido"
      );
    });
  });
});