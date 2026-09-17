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
}

export async function getAll(req, res) {
  const categories = await getCategoriesByUser(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    data: {
      categories,
    },
  });
}

export async function update(req, res) {
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
}

export async function remove(req, res) {
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
}