import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteTask,
  getTasks,
  updateTaskStatus,
} from "../services/task.service";
import { getCategories } from "../services/category.service";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

const [filters, setFilters] = useState({
  search: "",
  status: "",
  priority: "",
  category: "",
  sort: "createdAt",
});

  async function loadTasks(currentFilters = filters) {
    try {
      setError("");

      const data = await getTasks(currentFilters);

      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      setError(error.message);
    }
  }

  function getCategoryName(categoryId) {
    if (!categoryId) {
      return "Sin categoría";
    }

    const category = categories.find(
      (category) => category.id === categoryId
    );

    return category?.name ?? "Sin categoría";
  }

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  async function handleApplyFilters(event) {
    event.preventDefault();

    await loadTasks(filters);
  }

  async function handleClearFilters() {
    const emptyFilters = {
      search: "",
      status: "",
      priority: "",
      category: "",
      sort: "createdAt",
    };

    setFilters(emptyFilters);

    await loadTasks(emptyFilters);
  }
  async function handleStatusChange(taskId, status) {
    try {
      const updatedTask = await updateTaskStatus(
        taskId,
        status
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDelete(taskId) {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta tarea?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <p>Cargando tareas...</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
                    
          <p className="mt-2 text-gray-500">
            Administra tus tareas personales.
          </p>
        </div>
        <Link
            to="/tasks/new"
            className="rounded-lg bg-black px-4 py-2 text-white"
        >
            Nueva tarea
        </Link>
      </div>

      <form
        onSubmit={handleApplyFilters}
        className="mb-8 rounded-xl border p-5"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label
              htmlFor="search"
              className="mb-1 block text-sm font-medium"
            >
              Buscar
            </label>

            <input
              id="search"
              name="search"
              type="text"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Buscar tarea..."
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium"
            >
              Estado
            </label>

            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border p-2"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">
                En progreso
              </option>
              <option value="COMPLETED">
                Completada
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="mb-1 block text-sm font-medium"
            >
              Prioridad
            </label>

            <select
              id="priority"
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full rounded-lg border p-2"
            >
              <option value="">Todas</option>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium"
            >
              Categoría
            </label>

            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full rounded-lg border p-2"
            >
              <option value="">Todas</option>

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

          <div>
            <label
              htmlFor="sort"
              className="mb-1 block text-sm font-medium"
            >
              Ordenar
            </label>

            <select
              id="sort"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="w-full rounded-lg border p-2"
            >
              <option value="createdAt">
                Más recientes
              </option>

              <option value="dueDate">
                Fecha límite
              </option>

              <option value="priority">
                Prioridad
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Aplicar filtros
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-lg border px-4 py-2"
          >
            Limpiar
          </button>
        </div>
      </form>


      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-500">
            Todavía no tienes tareas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="rounded-xl border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {task.title}
                  </h2>

                  {task.description && (
                    <p className="mt-2 text-gray-500">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span>
                      Prioridad: {task.priority}
                    </span>

                    <span>
                      Estado: {task.status}
                    </span>

                    <span>
                      Categoría: {getCategoryName(task.categoryId)}
                    </span>
                  </div>
                  
                </div>
                <div className="flex gap-3">
                <Link
                    to={`/tasks/${task.id}/edit`}
                    className="text-blue-600"
                >
                    Editar
                </Link>

                <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600"
                >
                    Eliminar
                </button>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor={`status-${task.id}`}
                  className="mr-2 text-sm font-medium"
                >
                  Estado:
                </label>

                <select
                  id={`status-${task.id}`}
                  value={task.status}
                  onChange={(event) =>
                    handleStatusChange(
                      task.id,
                      event.target.value
                    )
                  }
                  className="rounded-lg border p-2"
                >
                  <option value="PENDING">
                    Pendiente
                  </option>

                  <option value="IN_PROGRESS">
                    En progreso
                  </option>

                  <option value="COMPLETED">
                    Completada
                  </option>
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Tasks;