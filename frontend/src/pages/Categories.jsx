import { useEffect, useState } from "react";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/category.service";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      setError("");

      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingCategory) {
        const updatedCategory = await updateCategory(
          editingCategory.id,
          {
            name: name.trim(),
          }
        );

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === editingCategory.id
              ? updatedCategory
              : category
          )
        );
      } else {
        const newCategory = await createCategory({
          name: name.trim(),
        });

        setCategories((currentCategories) => [
          ...currentCategories,
          newCategory,
        ]);
      }

      resetForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category) {
    setEditingCategory(category);
    setName(category.name);
    setError("");
  }

  function resetForm() {
    setEditingCategory(null);
    setName("");
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(
      `¿Deseas eliminar la categoría "${category.name}"? Las tareas asociadas no serán eliminadas.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteCategory(category.id);

      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) =>
            currentCategory.id !== category.id
        )
      );

      if (editingCategory?.id === category.id) {
        resetForm();
      }
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <p>Cargando categorías...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Categorías
        </h1>

        <p className="mt-2 text-gray-500">
          Organiza tus tareas mediante categorías.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl border p-5"
      >
        <h2 className="mb-4 text-lg font-semibold">
          {editingCategory
            ? "Editar categoría"
            : "Nueva categoría"}
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            placeholder="Ej. Universidad"
            className="flex-1 rounded-lg border p-3"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : editingCategory
              ? "Guardar"
              : "Crear"}
          </button>

          {editingCategory && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border px-5 py-3"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-gray-500">
            Todavía no tienes categorías.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="flex items-center justify-between rounded-xl border p-5"
            >
              <div>
                <h2 className="font-semibold">
                  {category.name}
                </h2>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleEdit(category)}
                  className="text-blue-600"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  className="text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Categories;