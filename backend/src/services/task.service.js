import { db } from "../prisma/db.ts";

export async function createTask(userId, taskData) {
  if (taskData.categoryId) {
    const category = await db.orm.public.Category
      .where({
        id: taskData.categoryId,
        userId,
      })
      .first();

    if (!category) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }
  }

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

export async function getTasksByUser(userId, filters = {}) {
  let tasks = await db.orm.public.Task
    .where({ userId })
    .all();

  if (filters.status) {
    tasks = tasks.filter(
      (task) => task.status === filters.status
    );
  }

  if (filters.priority) {
    tasks = tasks.filter(
      (task) => task.priority === filters.priority
    );
  }

  if (filters.category) {
    tasks = tasks.filter(
      (task) => task.categoryId === filters.category
    );
  }

  if (filters.search) {
    const search = filters.search.toLocaleLowerCase("es");

    tasks = tasks.filter((task) =>
      task.title
        .toLocaleLowerCase("es")
        .includes(search)
    );
  }

  if (filters.sort === "createdAt") {
    tasks.sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  if (filters.sort === "dueDate") {
    tasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return (
        new Date(a.dueDate) -
        new Date(b.dueDate)
      );
    });
  }

  if (filters.sort === "priority") {
    const priorityOrder = {
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    tasks.sort(
      (a, b) =>
        priorityOrder[a.priority] -
        priorityOrder[b.priority]
    );
  }

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

  if (taskData.categoryId) {
    const category = await db.orm.public.Category
      .where({
        id: taskData.categoryId,
        userId,
      })
      .first();

    if (!category) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }
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