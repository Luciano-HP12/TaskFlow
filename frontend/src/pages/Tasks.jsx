import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteTask,
  getTasks,
  updateTaskStatus,
} from "../services/task.service";
import { getCategories } from "../services/category.service";
import {
  CalendarDays,
  Filter,
  ListTodo,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";

/* ======================================================
   COMPONENTE REUTILIZABLE PARA LOS SELECT DE LOS FILTROS
====================================================== */

function FilterSelect({
  label,
  name,
  value,
  onChange,
  disabled,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {children}
      </select>
    </div>
  );
}

/* ======================================================
   PÁGINA TASKS
====================================================== */

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Guarda el ID de la tarea cuyo estado se está actualizando.
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    category: "",
    sort: "createdAt",
  });

  /* ======================================================
     CARGAR TAREAS
  ====================================================== */

  async function loadTasks(currentFilters = filters) {
    try {
      setError("");
      setLoading(true);

      const data = await getTasks(currentFilters);

      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
     CARGAR CATEGORÍAS
  ====================================================== */

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      setError(error.message);
    }
  }

  /* ======================================================
     OBTENER NOMBRE DE CATEGORÍA
  ====================================================== */

  function getCategoryName(categoryId) {
    if (!categoryId) {
      return "Sin categoría";
    }

    const category = categories.find(
      (category) => category.id === categoryId
    );

    return category?.name ?? "Sin categoría";
  }

  /* ======================================================
     CARGA INICIAL
  ====================================================== */

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  /* ======================================================
     FILTROS
  ====================================================== */

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  async function handleApplyFilters(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    await loadTasks(filters);
  }

  async function handleClearFilters() {
    if (loading) {
      return;
    }

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

  /* ======================================================
     CAMBIAR ESTADO
  ====================================================== */

  async function handleStatusChange(taskId, status) {
    if (updatingTaskId) {
      return;
    }

    try {
      setError("");
      setUpdatingTaskId(taskId);

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
    } finally {
      setUpdatingTaskId(null);
    }
  }

  /* ======================================================
     ELIMINAR TAREA
  ====================================================== */

  async function handleDelete() {
    if (!taskToDelete || deleting) {
      return;
    }

    try {
      setError("");
      setDeleting(true);

      await deleteTask(taskToDelete.id);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== taskToDelete.id
        )
      );

      setTaskToDelete(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  }

  /* ======================================================
     INTERFAZ
  ====================================================== */

  return (
    <div>
      {/* ================= HEADER ================= */}

      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">
            Gestión de tareas
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Mis tareas
          </h1>

          <p className="mt-2 text-slate-500">
            Organiza, prioriza y realiza seguimiento de tus
            actividades.
          </p>
        </div>

        <Link
          to="/tasks/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          <Plus size={18} />
          Nueva tarea
        </Link>
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

      {/* ================= FILTROS ================= */}

      <form
        onSubmit={handleApplyFilters}
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <Filter
            size={18}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-900">
            Filtros
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {/* BUSCADOR */}

          <div>
            <label
              htmlFor="search"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Buscar
            </label>

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="search"
                name="search"
                type="text"
                value={filters.search}
                onChange={handleFilterChange}
                disabled={loading}
                placeholder="Nombre de tarea..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* ESTADO */}

          <FilterSelect
            label="Estado"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            disabled={loading}
          >
            <option value="">Todos</option>
            <option value="PENDING">
              Pendiente
            </option>
            <option value="IN_PROGRESS">
              En progreso
            </option>
            <option value="COMPLETED">
              Completada
            </option>
          </FilterSelect>

          {/* PRIORIDAD */}

          <FilterSelect
            label="Prioridad"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            disabled={loading}
          >
            <option value="">Todas</option>
            <option value="HIGH">
              Alta
            </option>
            <option value="MEDIUM">
              Media
            </option>
            <option value="LOW">
              Baja
            </option>
          </FilterSelect>

          {/* CATEGORÍA */}

          <FilterSelect
            label="Categoría"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            disabled={loading}
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
          </FilterSelect>

          {/* ORDENAMIENTO */}

          <FilterSelect
            label="Ordenar"
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            disabled={loading}
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
          </FilterSelect>
        </div>

        {/* BOTONES FILTROS */}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Filter size={16} />

              {loading
                ? "Aplicando..."
                : "Aplicar filtros"}
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Limpiar
            </button>
          </div>

          {!loading && (
            <p className="text-sm text-slate-500">
              {tasks.length === 1
                ? "1 tarea encontrada"
                : `${tasks.length} tareas encontradas`}
            </p>
          )}
        </div>
      </form>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Cargando tareas...
          </p>
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}

      {!loading && tasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <ListTodo
              size={22}
              className="text-slate-500"
            />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            No encontramos tareas
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            No hay tareas que coincidan con los filtros
            seleccionados.
          </p>

          <button
            type="button"
            onClick={handleClearFilters}
            disabled={loading}
            className="mt-5 text-sm font-medium text-slate-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* ================= LISTA DE TAREAS ================= */}

      {!loading && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isUpdating =
              updatingTaskId === task.id;

            return (
              <article
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  {/* INFORMACIÓN */}

                  <div className="min-w-0 flex-1">
                    {/* BADGES */}

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={task.status}
                      />

                      <PriorityBadge
                        priority={task.priority}
                      />

                      {task.categoryId && (
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/10">
                          {getCategoryName(
                            task.categoryId
                          )}
                        </span>
                      )}
                    </div>

                    {/* TÍTULO */}

                    <h2 className="mt-3 text-lg font-semibold text-slate-900">
                      {task.title}
                    </h2>

                    {/* DESCRIPCIÓN */}

                    {task.description && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {task.description}
                      </p>
                    )}

                    {/* FECHA */}

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      {task.dueDate ? (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={16} />

                          <span>
                            {new Date(
                              task.dueDate
                            ).toLocaleString(
                              "es-PE",
                              {
                                dateStyle:
                                  "medium",
                                timeStyle:
                                  "short",
                              }
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={16} />
                          <span>
                            Sin fecha límite
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACCIONES */}

                  <div className="flex flex-col gap-3 lg:min-w-48">
                    <div>
                      <label
                        htmlFor={`status-${task.id}`}
                        className="mb-1.5 block text-xs font-medium text-slate-500"
                      >
                        {isUpdating
                          ? "Actualizando..."
                          : "Cambiar estado"}
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
                        disabled={Boolean(
                          updatingTaskId
                        )}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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

                    <div className="flex gap-2">
                      <Link
                        to={`/tasks/${task.id}/edit`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Pencil size={15} />
                        Editar
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setTaskToDelete(task)
                        }
                        disabled={Boolean(
                          updatingTaskId
                        )}
                        className="inline-flex items-center justify-center rounded-xl border border-red-100 px-3 py-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Eliminar tarea"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ================= MODAL ELIMINAR ================= */}

      <ConfirmModal
        open={Boolean(taskToDelete)}
        title="Eliminar tarea"
        description={
          taskToDelete
            ? `¿Deseas eliminar "${taskToDelete.title}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Eliminar tarea"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setTaskToDelete(null);
          }
        }}
      />
    </div>
  );
}

export default Tasks;