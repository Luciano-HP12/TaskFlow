import { db } from "../prisma/db.ts";

export async function createTask(userId, taskData) {
  const task = await db.orm.public.Task.create({
    title: taskData.title,
    description: taskData.description ?? null,
    priority: taskData.priority ?? "MEDIUM",
    dueDate: taskData.dueDate ?? null,
    categoryId: taskData.categoryId ?? null,
    userId,
  });

  return task;
}

export async function getTasksByUser(userId) {
  const tasks = await db.orm.public.Task
    .where({ userId })
    .all();

  return tasks;
}

export async function getTaskById(userId, taskId) {
  const task = await db.orm.public.Task
    .where({
      id: taskId,
      userId,
    })
    .first();

  if (!task) {
    const error = new Error("Tarea no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return task;
}

export async function updateTask(userId, taskId, taskData) {
  const existingTask = await db.orm.public.Task
    .where({
      id: taskId,
      userId,
    })
    .first();

  if (!existingTask) {
    const error = new Error("Tarea no encontrada");
    error.statusCode = 404;
    throw error;
  }

  const task = await db.orm.public.Task
    .where({
      id: taskId,
      userId,
    })
    .update({
      ...taskData,
    });

  return task;
}

export async function deleteTask(userId, taskId) {
  const existingTask = await db.orm.public.Task
    .where({
      id: taskId,
      userId,
    })
    .first();

  if (!existingTask) {
    const error = new Error("Tarea no encontrada");
    error.statusCode = 404;
    throw error;
  }

  await db.orm.public.Task
    .where({
      id: taskId,
      userId,
    })
    .delete();

  return existingTask;
}

export async function updateTaskStatus(userId, taskId, status) {
  const existingTask = await db.orm.public.Task
    .where({
      id: taskId,
      userId,
    })
    .first();

  if (!existingTask) {
    const error = new Error("Tarea no encontrada");
    error.statusCode = 404;
    throw error;
  }

  const completedAt =
    status === "COMPLETED"
      ? new Date().toISOString()
      : null;

  const task = await db.orm.public.Task
    .where({
      id: taskId,
      userId,
    })
    .update({
      status,
      completedAt,
    });

  return task;
}