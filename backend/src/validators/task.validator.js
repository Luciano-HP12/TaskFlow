import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio")
    .max(150, "El título es demasiado largo"),

  description: z
    .string()
    .trim()
    .max(2000, "La descripción es demasiado larga")
    .optional()
    .nullable(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .optional(),

  dueDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable(),

  categoryId: z
    .string()
    .uuid("La categoría no es válida")
    .optional()
    .nullable(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio")
    .max(150, "El título es demasiado largo")
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000, "La descripción es demasiado larga")
    .optional()
    .nullable(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .optional(),

  dueDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable(),

  categoryId: z
    .string()
    .uuid("La categoría no es válida")
    .optional()
    .nullable(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Debe enviar al menos un campo para actualizar",
  }
);

export const updateTaskStatusSchema = z.object({
  status: z.enum(
    ["PENDING", "IN_PROGRESS", "COMPLETED"],
    {
      message: "El estado no es válido",
    }
  ),
});