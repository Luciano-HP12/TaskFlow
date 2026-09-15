import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre de la categoría es obligatorio")
    .max(100, "El nombre de la categoría es demasiado largo"),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre de la categoría es obligatorio")
    .max(100, "El nombre de la categoría es demasiado largo"),
});