import { db } from "../prisma/db.ts";


function normalizeCategoryName(name) {
  return name.trim().toLocaleLowerCase("es");
}

export async function createCategory(userId, categoryData) {
  const categories = await db.orm.public.Category
    .where({ userId })
    .all();

  const normalizedName = normalizeCategoryName(
    categoryData.name
  );

  const existingCategory = categories.find(
    (category) =>
      normalizeCategoryName(category.name) === normalizedName
  );

  if (existingCategory) {
    const error = new Error(
      "Ya existe una categoría con ese nombre"
    );
    error.statusCode = 409;
    throw error;
  }

  const category = await db.orm.public.Category.create({
    name: categoryData.name.trim(),
    userId,
  });

  return category;
}

export async function getCategoriesByUser(userId) {
  const categories = await db.orm.public.Category
    .where({ userId })
    .all();

  return categories;
}

export async function updateCategory(
  userId,
  categoryId,
  categoryData
) {
  const existingCategory = await db.orm.public.Category
    .where({
      id: categoryId,
      userId,
    })
    .first();

  if (!existingCategory) {
    const error = new Error("Categoría no encontrada");
    error.statusCode = 404;
    throw error;
  }

  const categories = await db.orm.public.Category
    .where({ userId })
    .all();

  const normalizedName = normalizeCategoryName(
    categoryData.name
  );

  const duplicatedCategory = categories.find(
    (category) =>
      category.id !== categoryId &&
      normalizeCategoryName(category.name) === normalizedName
  );

  if (duplicatedCategory) {
    const error = new Error(
      "Ya existe una categoría con ese nombre"
    );
    error.statusCode = 409;
    throw error;
  }

  const category = await db.orm.public.Category
    .where({
      id: categoryId,
      userId,
    })
    .update({
      name: categoryData.name.trim(),
    });

  return category;
}

export async function deleteCategory(userId, categoryId) {
  const existingCategory = await db.orm.public.Category
    .where({
      id: categoryId,
      userId,
    })
    .first();

  if (!existingCategory) {
    const error = new Error("Categoría no encontrada");
    error.statusCode = 404;
    throw error;
  }

  await db.orm.public.Category
    .where({
      id: categoryId,
      userId,
    })
    .delete();

  return existingCategory;
}