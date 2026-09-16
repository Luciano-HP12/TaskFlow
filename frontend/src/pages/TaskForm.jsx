import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createTask,
  getTaskById,
  updateTask,
} from "../services/task.service";

import { getCategories } from "../services/category.service";

import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Save,
} from "lucide-react";

function TaskForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  /* =========================================
     ESTADOS
  ========================================= */

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =========================================
     CARGAR TAREA AL EDITAR
  ========================================= */

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    async function loadTask() {
      try {
        setError("");

        const task = await getTaskById(id);

        setForm({
          title: task.title,
          description: task.description ?? "",
          priority: task.priority,
          dueDate: task.dueDate
            ? task.dueDate.slice(0, 16)
            : "",
          categoryId: task.categoryId ?? "",
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [id, isEditing]);

  /* =========================================
     CARGAR CATEGORÍAS
  ========================================= */

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();

        setCategories(data);
      } catch (error) {
        setError(error.message);
      }
    }

    loadCategories();
  }, []);

  /* =========================================
     MANEJAR CAMBIOS
  ========================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  /* =========================================
     GUARDAR
  ========================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setSaving(true);

      const taskData = {
        title: form.title,
        description: form.description || null,
        priority: form.priority,

        dueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : null,

        categoryId: form.categoryId || null,
      };

      if (isEditing) {
        await updateTask(id, taskData);
      } else {
        await createTask(taskData);
      }

      navigate("/tasks");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Cargando tarea...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     INTERFAZ
  ========================================= */

  return (
    <div className="mx-auto max-w-4xl">
      {/* VOLVER */}

      <Link
        to="/tasks"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Volver a tareas
      </Link>

      {/* HEADER */}

      <header className="mb-8">
        <p className="mb-1 text-sm font-medium text-slate-500">
          {isEditing ? "Editar tarea" : "Nueva tarea"}
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {isEditing
            ? "Editar tarea"
            : "Crear nueva tarea"}
        </h1>

        <p className="mt-2 text-slate-500">
          {isEditing
            ? "Actualiza la información de esta tarea."
            : "Completa la información para organizar tu nueva actividad."}
        </p>
      </header>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORMULARIO */}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {/* CABECERA */}

        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Información de la tarea
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Los campos marcados con * son obligatorios.
              </p>
            </div>
          </div>
        </div>

        {/* CAMPOS */}

        <div className="space-y-6 p-6">
          {/* TÍTULO */}

          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Título *
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej. Terminar informe de investigación"
              required
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          {/* DESCRIPCIÓN */}

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Descripción
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              disabled={saving}
              placeholder="Describe brevemente lo que necesitas realizar..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          {/* PRIORIDAD + CATEGORÍA */}

          <div className="grid gap-5 md:grid-cols-2">
            {/* PRIORIDAD */}

            <div>
              <label
                htmlFor="priority"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Prioridad
              </label>

              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="LOW">
                  Baja
                </option>

                <option value="MEDIUM">
                  Media
                </option>

                <option value="HIGH">
                  Alta
                </option>
              </select>
            </div>

            {/* CATEGORÍA */}

            <div>
              <label
                htmlFor="categoryId"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Categoría
              </label>

              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  Sin categoría
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FECHA LÍMITE */}

          <div>
            <label
              htmlFor="dueDate"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Fecha límite
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={form.dueDate}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              Puedes dejar este campo vacío si la tarea no
              tiene una fecha límite.
            </p>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <Link
            to="/tasks"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />

            {saving
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear tarea"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;