import { useEffect, useState } from "react";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/category.service";

import {
  FolderOpen,
  Pencil,
  Plus,
  Save,
  Tags,
  Trash2,
  X,
} from "lucide-react";

import ConfirmModal from "../components/ConfirmModal";

function Categories() {
  /* =========================================
     ESTADOS
  ========================================= */

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categoryToDelete, setCategoryToDelete] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  /* =========================================
     CARGAR CATEGORÍAS
  ========================================= */

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

  /* =========================================
     CREAR / EDITAR CATEGORÍA
  ========================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "El nombre de la categoría es obligatorio"
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingCategory) {
        const updatedCategory =
          await updateCategory(
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
        const newCategory =
          await createCategory({
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

  /* =========================================
     EDITAR
  ========================================= */

  function handleEdit(category) {
    setEditingCategory(category);
    setName(category.name);
    setError("");
  }

  /* =========================================
     REINICIAR FORMULARIO
  ========================================= */

  function resetForm() {
    setEditingCategory(null);
    setName("");
    setError("");
  }

  /* =========================================
     ABRIR MODAL DE ELIMINACIÓN
  ========================================= */

  function handleOpenDeleteModal(category) {
    setCategoryToDelete(category);
    setError("");
  }

  /* =========================================
     CERRAR MODAL DE ELIMINACIÓN
  ========================================= */

  function handleCloseDeleteModal() {
    if (deleting) {
      return;
    }

    setCategoryToDelete(null);
  }

  /* =========================================
     ELIMINAR
  ========================================= */

  async function handleDelete() {
    if (!categoryToDelete) {
      return;
    }

    try {
      setError("");
      setDeleting(true);

      await deleteCategory(categoryToDelete.id);

      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) =>
            currentCategory.id !==
            categoryToDelete.id
        )
      );

      if (
        editingCategory?.id ===
        categoryToDelete.id
      ) {
        resetForm();
      }

      setCategoryToDelete(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  }

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Cargando categorías...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     INTERFAZ
  ========================================= */

  return (
    <div className="mx-auto max-w-5xl">
      {/* ================= HEADER ================= */}

      <header className="mb-8">
        <p className="mb-1 text-sm font-medium text-slate-500">
          Organización
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Categorías
        </h1>

        <p className="mt-2 text-slate-500">
          Crea categorías para organizar y encontrar tus
          tareas con mayor facilidad.
        </p>
      </header>

      {/* ================= ERROR ================= */}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* ================= FORMULARIO ================= */}

      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* CABECERA FORMULARIO */}

        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              {editingCategory ? (
                <Pencil size={19} />
              ) : (
                <Plus size={19} />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                {editingCategory
                  ? "Editar categoría"
                  : "Nueva categoría"}
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                {editingCategory
                  ? `Estás editando "${editingCategory.name}".`
                  : "Agrega una nueva categoría para clasificar tus tareas."}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO FORMULARIO */}

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
          <label
            htmlFor="category-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nombre de la categoría *
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              maxLength={100}
              required
              disabled={saving}
              placeholder="Ej. Universidad"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            {/* GUARDAR / CREAR */}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editingCategory ? (
                <Save size={17} />
              ) : (
                <Plus size={17} />
              )}

              {saving
                ? "Guardando..."
                : editingCategory
                  ? "Guardar cambios"
                  : "Crear categoría"}
            </button>

            {/* CANCELAR EDICIÓN */}

            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={17} />

                Cancelar
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Máximo 100 caracteres. No puedes tener dos
            categorías con el mismo nombre.
          </p>
        </form>
      </section>

      {/* ================= LISTADO HEADER ================= */}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">
            Mis categorías
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {categories.length === 1
              ? "1 categoría creada"
              : `${categories.length} categorías creadas`}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Tags size={19} />
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <FolderOpen
              size={22}
              className="text-slate-500"
            />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            Todavía no tienes categorías
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Crea tu primera categoría para comenzar a
            organizar tus tareas.
          </p>
        </div>
      ) : (
        /* ================= LISTA ================= */

        <div className="space-y-3">
          {categories.map((category) => {
            const isBeingEdited =
              editingCategory?.id === category.id;

            return (
              <article
                key={category.id}
                className={`flex flex-col justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm transition sm:flex-row sm:items-center ${
                  isBeingEdited
                    ? "border-slate-400 ring-2 ring-slate-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* INFORMACIÓN */}

                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Tags size={18} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">
                      {category.name}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Categoría de tareas
                    </p>
                  </div>
                </div>

                {/* ACCIONES */}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(category)
                    }
                    disabled={saving || deleting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    <Pencil size={15} />

                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenDeleteModal(category)
                    }
                    disabled={saving || deleting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title={`Eliminar ${category.name}`}
                  >
                    <Trash2 size={16} />

                    <span className="sm:hidden">
                      Eliminar
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ================= INFORMACIÓN ================= */}

      {categories.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs leading-5 text-slate-500">
            Al eliminar una categoría, las tareas asociadas
            no se eliminarán. Esas tareas quedarán sin
            categoría.
          </p>
        </div>
      )}

      {/* ================= MODAL ELIMINAR ================= */}

      <ConfirmModal
        open={Boolean(categoryToDelete)}
        title="Eliminar categoría"
        description={
          categoryToDelete
            ? `¿Deseas eliminar "${categoryToDelete.name}"? Las tareas asociadas no serán eliminadas y quedarán sin categoría.`
            : ""
        }
        confirmText="Eliminar categoría"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={handleCloseDeleteModal}
      />
    </div>
  );
}

export default Categories;