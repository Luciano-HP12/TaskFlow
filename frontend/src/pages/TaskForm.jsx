import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createTask,
  getTaskById,
  updateTask,
} from "../services/task.service";

function TaskForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) {
      return;
    }

    async function loadTask() {
      try {
        const task = await getTaskById(id);

        setForm({
          title: task.title,
          description: task.description ?? "",
          priority: task.priority,
          dueDate: task.dueDate
            ? task.dueDate.slice(0, 16)
            : "",
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [editing, id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const taskData = {
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        dueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : null,
      };

      if (editing) {
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

  if (loading) {
    return (
      <main className="p-8">
        <p>Cargando tarea...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">
        {editing ? "Editar tarea" : "Nueva tarea"}
      </h1>

      <p className="mt-2 text-gray-500">
        {editing
          ? "Modifica la información de tu tarea."
          : "Registra una nueva tarea en TaskFlow."}
      </p>

      {error && (
        <div className="mt-6 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-1 block font-medium"
          >
            Título
          </label>

          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={150}
            className="w-full rounded-lg border p-3"
            placeholder="Ej. Terminar documentación"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block font-medium"
          >
            Descripción
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            maxLength={2000}
            className="w-full rounded-lg border p-3"
            placeholder="Describe la tarea..."
          />
        </div>

        <div>
          <label
            htmlFor="priority"
            className="mb-1 block font-medium"
          >
            Prioridad
          </label>

          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="mb-1 block font-medium"
          >
            Fecha límite
          </label>

          <input
            id="dueDate"
            name="dueDate"
            type="datetime-local"
            value={form.dueDate}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : editing
              ? "Guardar cambios"
              : "Crear tarea"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="rounded-lg border px-5 py-3"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}

export default TaskForm;