import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
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
  try {
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
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function getAll(req, res) {
  try {
    const tasks = await getTasksByUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function getById(req, res) {
  try {
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
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function update(req, res) {
  try {
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
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function remove(req, res) {
  try {
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
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}

export async function updateStatus(req, res) {
  try {
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
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}