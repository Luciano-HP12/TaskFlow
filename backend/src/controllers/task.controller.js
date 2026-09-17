import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
} from "../validators/task.validator.js";

import {
  createTask,
  getTasksByUser,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../services/task.service.js";

export async function create(req, res) {
  const validation = createTaskSchema.safeParse(req.body);

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

  const task = await createTask(
    req.user.id,
    validation.data
  );

  return res.status(201).json({
    success: true,
    message: "Tarea creada correctamente",
    data: {
      task,
    },
  });
}

export async function getAll(req, res) {
  const validation = taskQuerySchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Filtros inválidos",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const tasks = await getTasksByUser(
    req.user.id,
    validation.data
  );

  return res.status(200).json({
    success: true,
    data: {
      tasks,
    },
  });
}

export async function getById(req, res) {
  const task = await getTaskById(
    req.user.id,
    req.params.id
  );

  return res.status(200).json({
    success: true,
    data: {
      task,
    },
  });
}

export async function update(req, res) {
  const validation = updateTaskSchema.safeParse(req.body);

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

  const task = await updateTask(
    req.user.id,
    req.params.id,
    validation.data
  );

  return res.status(200).json({
    success: true,
    message: "Tarea actualizada correctamente",
    data: {
      task,
    },
  });
}

export async function remove(req, res) {
  const task = await deleteTask(
    req.user.id,
    req.params.id
  );

  return res.status(200).json({
    success: true,
    message: "Tarea eliminada correctamente",
    data: {
      task,
    },
  });
}

export async function updateStatus(req, res) {
  const validation = updateTaskStatusSchema.safeParse(req.body);

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

  const task = await updateTaskStatus(
    req.user.id,
    req.params.id,
    validation.data.status
  );

  return res.status(200).json({
    success: true,
    message: "Estado de la tarea actualizado correctamente",
    data: {
      task,
    },
  });
}