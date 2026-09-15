import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

import {
  createCategory,
  getCategoriesByUser,
  updateCategory,
  deleteCategory,
} from "../services/category.service.js";

export async function create(req, res) {
  try {
    const validation = createCategorySchema.safeParse(req.body);

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

    const category = await createCategory(
      req.user.id,
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: "Categoría creada correctamente",
      data: {
        category,
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
    const categories = await getCategoriesByUser(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: {
        categories,
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
    const validation = updateCategorySchema.safeParse(req.body);

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

    const category = await updateCategory(
      req.user.id,
      req.params.id,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Categoría actualizada correctamente",
      data: {
        category,
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
    const category = await deleteCategory(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Categoría eliminada correctamente",
      data: {
        category,
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