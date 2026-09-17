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
  let query = db.orm.public.Task.where({ userId });

  if (filters.status) {
    query = query.where({
      status: filters.status,
    });
  }

  if (filters.priority) {
    query = query.where({
      priority: filters.priority,
    });
  }

  if (filters.category) {
    query = query.where({
      categoryId: filters.category,
    });
  }

  if (filters.search) {
    query = query.where((task) =>
      task.title.ilike(`%${filters.search}%`)
    );
  }

  if (filters.sort === "createdAt") {
    query = query.orderBy((task) =>
      task.createdAt.desc()
    );
  }

  if (filters.sort === "dueDate") {
    query = query.orderBy((task) =>
      task.dueDate.asc()
    );
  }

  let tasks = await query.all();

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