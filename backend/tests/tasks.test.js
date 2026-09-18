import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { cleanDatabase } from "./helpers/database.js";

/* ======================================================
   HELPER: CREAR USUARIO AUTENTICADO
====================================================== */

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

/* ======================================================
   TASKS API
====================================================== */

describe("Tasks API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  /* ====================================================
     POST /api/tasks
  ==================================================== */

  describe("POST /api/tasks", () => {
    it("debe crear una tarea para el usuario autenticado", async () => {
      const { token } =
        await createAuthenticatedUser();

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Aprender testing",
          description:
            "Crear tests automatizados para TaskFlow",
          priority: "HIGH",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      expect(response.body.data.task).toMatchObject({
        title: "Aprender testing",
        description:
          "Crear tests automatizados para TaskFlow",
        priority: "HIGH",
        status: "PENDING",
      });

      expect(response.body.data.task.id).toBeDefined();
    });

    it("debe utilizar los valores por defecto de estado y prioridad", async () => {
      const { token } =
        await createAuthenticatedUser();

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Tarea con valores por defecto",
        });

      expect(response.status).toBe(201);

      expect(response.body.data.task.status).toBe(
        "PENDING"
      );

      expect(response.body.data.task.priority).toBe(
        "MEDIUM"
      );
    });

    it("debe rechazar la creación de una tarea sin autenticación", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({
          title: "Tarea no autorizada",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  /* ====================================================
     GET /api/tasks
  ==================================================== */

  describe("GET /api/tasks", () => {
    it("debe listar únicamente las tareas del usuario autenticado", async () => {
      const userOne =
        await createAuthenticatedUser({
          name: "Usuario Uno",
          email: "uno@test.com",
        });

      await request(app)
        .post("/api/tasks")
        .set(
          "Authorization",
          `Bearer ${userOne.token}`
        )
        .send({
          title: "Tarea del usuario uno",
        });

      const userTwo =
        await createAuthenticatedUser({
          name: "Usuario Dos",
          email: "dos@test.com",
        });

      await request(app)
        .post("/api/tasks")
        .set(
          "Authorization",
          `Bearer ${userTwo.token}`
        )
        .send({
          title: "Tarea del usuario dos",
        });

      const response = await request(app)
        .get("/api/tasks")
        .set(
          "Authorization",
          `Bearer ${userOne.token}`
        );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.tasks).toHaveLength(1);

      expect(
        response.body.data.tasks[0].title
      ).toBe("Tarea del usuario uno");
    });
  });

  /* ====================================================
     GET /api/tasks/:id
  ==================================================== */

  describe("GET /api/tasks/:id", () => {
    it("debe devolver el detalle de una tarea propia", async () => {
      const { token } =
        await createAuthenticatedUser();

      const createResponse = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Tarea detallada",
          description: "Descripción de prueba",
        });

      const taskId =
        createResponse.body.data.task.id;

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.task).toMatchObject({
        id: taskId,
        title: "Tarea detallada",
        description: "Descripción de prueba",
      });
    });
  });

  describe("Task ownership", () => {
  it("no debe permitir consultar una tarea de otro usuario", async () => {
    const owner = await createAuthenticatedUser({
      name: "Propietario",
      email: "owner@test.com",
    });

    const otherUser = await createAuthenticatedUser({
      name: "Otro Usuario",
      email: "other@test.com",
    });

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        title: "Tarea privada",
      });

    const taskId = createResponse.body.data.task.id;

    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set(
        "Authorization",
        `Bearer ${otherUser.token}`
      );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("no debe permitir editar una tarea de otro usuario", async () => {
    const owner = await createAuthenticatedUser({
      name: "Propietario",
      email: "owner@test.com",
    });

    const otherUser = await createAuthenticatedUser({
      name: "Otro Usuario",
      email: "other@test.com",
    });

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        title: "Tarea original",
      });

    const taskId = createResponse.body.data.task.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(
        "Authorization",
        `Bearer ${otherUser.token}`
      )
      .send({
        title: "Tarea modificada",
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);

    const ownerResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(ownerResponse.status).toBe(200);
    expect(ownerResponse.body.data.task.title).toBe(
      "Tarea original"
    );
  });

  it("no debe permitir cambiar el estado de una tarea de otro usuario", async () => {
    const owner = await createAuthenticatedUser({
      name: "Propietario",
      email: "owner@test.com",
    });

    const otherUser = await createAuthenticatedUser({
      name: "Otro Usuario",
      email: "other@test.com",
    });

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        title: "Tarea protegida",
      });

    const taskId = createResponse.body.data.task.id;

    const response = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set(
        "Authorization",
        `Bearer ${otherUser.token}`
      )
      .send({
        status: "COMPLETED",
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);

    const ownerResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(ownerResponse.body.data.task.status).toBe(
      "PENDING"
    );
  });

  it("no debe permitir eliminar una tarea de otro usuario", async () => {
    const owner = await createAuthenticatedUser({
      name: "Propietario",
      email: "owner@test.com",
    });

    const otherUser = await createAuthenticatedUser({
      name: "Otro Usuario",
      email: "other@test.com",
    });

    const createResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        title: "Tarea que debe permanecer",
      });

    const taskId = createResponse.body.data.task.id;

    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set(
        "Authorization",
        `Bearer ${otherUser.token}`
      );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);

    const ownerResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(ownerResponse.status).toBe(200);
    expect(ownerResponse.body.data.task.id).toBe(taskId);
  });

  describe("Task filters and sorting", () => {
  it("debe buscar tareas por título sin distinguir mayúsculas y minúsculas", async () => {
    const { token } = await createAuthenticatedUser();

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Aprender Prisma" });

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Estudiar React" });

    const response = await request(app)
      .get("/api/tasks?search=PRISMA")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.tasks).toHaveLength(1);
    expect(response.body.data.tasks[0].title).toBe(
      "Aprender Prisma"
    );
  });

  it("debe filtrar tareas por estado", async () => {
    const { token } = await createAuthenticatedUser();

    const firstTask = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Tarea pendiente" });

    const secondTask = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Tarea completada" });

    await request(app)
      .patch(
        `/api/tasks/${secondTask.body.data.task.id}/status`
      )
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "COMPLETED" });

    const response = await request(app)
      .get("/api/tasks?status=COMPLETED")
      .set("Authorization", `Bearer ${token}`);

    expect(firstTask.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body.data.tasks).toHaveLength(1);

    expect(response.body.data.tasks[0]).toMatchObject({
      title: "Tarea completada",
      status: "COMPLETED",
    });
  });

  it("debe filtrar tareas por prioridad", async () => {
    const { token } = await createAuthenticatedUser();

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Prioridad baja",
        priority: "LOW",
      });

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Prioridad alta",
        priority: "HIGH",
      });

    const response = await request(app)
      .get("/api/tasks?priority=HIGH")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.tasks).toHaveLength(1);

    expect(response.body.data.tasks[0]).toMatchObject({
      title: "Prioridad alta",
      priority: "HIGH",
    });
  });

  it("debe combinar búsqueda, estado y prioridad", async () => {
    const { token } = await createAuthenticatedUser();

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Implementar API",
        priority: "HIGH",
      });

    const targetTask = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Documentar API",
        priority: "HIGH",
      });

    await request(app)
      .patch(
        `/api/tasks/${targetTask.body.data.task.id}/status`
      )
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "COMPLETED",
      });

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Documentar frontend",
        priority: "LOW",
      });

    const response = await request(app)
      .get(
        "/api/tasks?search=API&status=COMPLETED&priority=HIGH"
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.tasks).toHaveLength(1);

    expect(response.body.data.tasks[0]).toMatchObject({
      title: "Documentar API",
      priority: "HIGH",
      status: "COMPLETED",
    });
  });

  it("debe ordenar las tareas por prioridad HIGH, MEDIUM y LOW", async () => {
    const { token } = await createAuthenticatedUser();

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarea baja",
        priority: "LOW",
      });

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarea alta",
        priority: "HIGH",
      });

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarea media",
        priority: "MEDIUM",
      });

    const response = await request(app)
      .get("/api/tasks?sort=priority")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(
      response.body.data.tasks.map(
        (task) => task.priority
      )
    ).toEqual([
      "HIGH",
      "MEDIUM",
      "LOW",
    ]);
  });

  it("debe ordenar las tareas por fecha límite ascendente", async () => {
    const { token } = await createAuthenticatedUser();

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarea posterior",
        dueDate: "2030-12-20T10:00:00.000Z",
      });

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarea próxima",
        dueDate: "2030-01-10T10:00:00.000Z",
      });

    const response = await request(app)
      .get("/api/tasks?sort=dueDate")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.tasks).toHaveLength(2);

    expect(
      response.body.data.tasks.map(
        (task) => task.title
      )
    ).toEqual([
      "Tarea próxima",
      "Tarea posterior",
    ]);
  });
  });
  });

  describe("Task management", () => {
    it("debe permitir editar una tarea propia", async () => {
      const { token } = await createAuthenticatedUser();

      const createResponse = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Título original",
          description: "Descripción original",
          priority: "LOW",
        });

      const taskId = createResponse.body.data.task.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Título actualizado",
          description: "Descripción actualizada",
          priority: "HIGH",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.task).toMatchObject({
        id: taskId,
        title: "Título actualizado",
        description: "Descripción actualizada",
        priority: "HIGH",
      });
    });

    it("debe marcar una tarea como COMPLETED y establecer completedAt", async () => {
      const { token } = await createAuthenticatedUser();

      const createResponse = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Completar testing",
        });

      const taskId = createResponse.body.data.task.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "COMPLETED",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.task.status).toBe(
        "COMPLETED"
      );

      expect(
        response.body.data.task.completedAt
      ).not.toBeNull();

      expect(
        response.body.data.task.completedAt
      ).toBeDefined();
    });

    it("debe limpiar completedAt al volver una tarea a un estado incompleto", async () => {
      const { token } = await createAuthenticatedUser();

      const createResponse = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Reabrir tarea",
        });

      const taskId = createResponse.body.data.task.id;

      const completedResponse = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "COMPLETED",
        });

      expect(
        completedResponse.body.data.task.completedAt
      ).not.toBeNull();

      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "IN_PROGRESS",
        });

      expect(response.status).toBe(200);

      expect(response.body.data.task.status).toBe(
        "IN_PROGRESS"
      );

      expect(
        response.body.data.task.completedAt
      ).toBeNull();
    });

    it("debe eliminar una tarea propia", async () => {
      const { token } = await createAuthenticatedUser();

      const createResponse = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Tarea para eliminar",
        });

      const taskId = createResponse.body.data.task.id;

      const deleteResponse = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });

    it("debe responder 400 cuando el ID de la tarea no es un UUID válido", async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get("/api/tasks/id-invalido")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "El identificador no es válido"
      );
    });

    it("debe responder 404 cuando la tarea no existe", async () => {
      const { token } = await createAuthenticatedUser();

      const nonexistentTaskId =
        "11111111-1111-4111-8111-111111111111";

      const response = await request(app)
        .get(`/api/tasks/${nonexistentTaskId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Task categories", () => {
  it("debe permitir asignar una categoría propia al crear una tarea", async () => {
    const { token } = await createAuthenticatedUser();

    const categoryResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Universidad",
      });

    const categoryId =
      categoryResponse.body.data.category.id;

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Estudiar testing",
        categoryId,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task.categoryId).toBe(
      categoryId
    );
  });

  it("no debe permitir crear una tarea usando una categoría de otro usuario", async () => {
    const owner = await createAuthenticatedUser({
      name: "Propietario",
      email: "owner@test.com",
    });

    const otherUser = await createAuthenticatedUser({
      name: "Otro Usuario",
      email: "other@test.com",
    });

    const categoryResponse = await request(app)
      .post("/api/categories")
      .set(
        "Authorization",
        `Bearer ${owner.token}`
      )
      .send({
        name: "Categoría privada",
      });

    const categoryId =
      categoryResponse.body.data.category.id;

    const response = await request(app)
      .post("/api/tasks")
      .set(
        "Authorization",
        `Bearer ${otherUser.token}`
      )
      .send({
        title: "Intento no autorizado",
        categoryId,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("no debe permitir asignar mediante edición una categoría de otro usuario", async () => {
    const owner = await createAuthenticatedUser({
      name: "Propietario",
      email: "owner@test.com",
    });

    const otherUser = await createAuthenticatedUser({
      name: "Otro Usuario",
      email: "other@test.com",
    });

    const categoryResponse = await request(app)
      .post("/api/categories")
      .set(
        "Authorization",
        `Bearer ${owner.token}`
      )
      .send({
        name: "Categoría privada",
      });

    const categoryId =
      categoryResponse.body.data.category.id;

    const taskResponse = await request(app)
      .post("/api/tasks")
      .set(
        "Authorization",
        `Bearer ${otherUser.token}`
      )
      .send({
        title: "Tarea del otro usuario",
      });

    const taskId = taskResponse.body.data.task.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(
        "Authorization",
        `Bearer ${otherUser.token}`
      )
      .send({
        categoryId,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);

    const taskAfterAttempt = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set(
        "Authorization",
        `Bearer ${otherUser.token}`
      );

    expect(
      taskAfterAttempt.body.data.task.categoryId
    ).toBeNull();
  });

  it("debe permitir quitar una categoría de una tarea estableciendo categoryId en null", async () => {
    const { token } = await createAuthenticatedUser();

    const categoryResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Universidad",
      });

    const categoryId =
      categoryResponse.body.data.category.id;

    const taskResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarea categorizada",
        categoryId,
      });

    const taskId = taskResponse.body.data.task.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: null,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.task.categoryId).toBeNull();
  });

  it("debe filtrar las tareas por categoría", async () => {
    const { token } = await createAuthenticatedUser();

    const universityResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Universidad",
      });

    const workResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Trabajo",
      });

    const universityId =
      universityResponse.body.data.category.id;

    const workId =
      workResponse.body.data.category.id;

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Estudiar arquitectura",
        categoryId: universityId,
      });

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Preparar informe",
        categoryId: workId,
      });

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Tarea sin categoría",
      });

    const response = await request(app)
      .get(`/api/tasks?category=${universityId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.tasks).toHaveLength(1);

    expect(response.body.data.tasks[0]).toMatchObject({
      title: "Estudiar arquitectura",
      categoryId: universityId,
    });
  });
  });
});