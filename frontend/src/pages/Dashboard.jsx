import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../services/task.service";
import {
  CircleCheck,
  CircleDashed,
  Clock3,
  Plus,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import StatCard from "../components/StatCard";

function Dashboard() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================
     CARGAR DASHBOARD
  ========================================= */

  async function loadDashboard() {
    try {
      setError("");
      setLoading(true);

      const data = await getTasks();

      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================================
     ESTADÍSTICAS
  ========================================= */

  const pendingTasks = tasks.filter(
    (task) => task.status === "PENDING"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;

  const now = new Date();

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }

    return (
      task.status !== "COMPLETED" &&
      new Date(task.dueDate) < now
    );
  }).length;

  const upcomingTasks = tasks
    .filter((task) => {
      if (!task.dueDate) {
        return false;
      }

      if (task.status === "COMPLETED") {
        return false;
      }

      return new Date(task.dueDate) >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.dueDate) - new Date(b.dueDate)
    )
    .slice(0, 5);

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div>
        <header className="mb-8">
          <p className="mb-1 text-sm font-medium text-slate-500">
            Dashboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Hola, {user?.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Estamos preparando el resumen de tus tareas.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw
            size={24}
            className="mx-auto animate-spin text-slate-400"
          />

          <p className="mt-3 text-sm text-slate-500">
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     ERROR
  ========================================= */

  if (error) {
    return (
      <div>
        <header className="mb-8">
          <p className="mb-1 text-sm font-medium text-slate-500">
            Dashboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Hola, {user?.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Aquí tienes un resumen de tus tareas.
          </p>
        </header>

        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
        >
          <TriangleAlert
            size={30}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 font-semibold text-red-800">
            No pudimos cargar el dashboard
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     DASHBOARD
  ========================================= */

  return (
    <div>
      {/* HEADER */}

      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">
            Dashboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Hola, {user?.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Aquí tienes un resumen de tus tareas.
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

      {/* ESTADÍSTICAS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Pendientes"
          value={pendingTasks}
          icon={CircleDashed}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="En progreso"
          value={inProgressTasks}
          icon={Clock3}
          iconClassName="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Completadas"
          value={completedTasks}
          icon={CircleCheck}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Vencidas"
          value={overdueTasks}
          icon={TriangleAlert}
          iconClassName="bg-red-50 text-red-600"
        />
      </section>

      {/* PRÓXIMAS TAREAS */}

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Próximas tareas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tareas pendientes ordenadas por fecha límite.
            </p>
          </div>

          <Link
            to="/tasks"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Ver todas
          </Link>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CircleCheck
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-700">
              Todo está bajo control
            </p>

            <p className="mt-1 text-sm text-slate-500">
              No tienes próximas tareas con fecha límite.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col justify-between gap-3 px-6 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {task.title}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        task.priority === "HIGH"
                          ? "bg-red-50 text-red-700"
                          : task.priority === "MEDIUM"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.priority === "HIGH"
                        ? "Alta"
                        : task.priority === "MEDIUM"
                          ? "Media"
                          : "Baja"}
                    </span>

                    <span className="text-xs text-slate-500">
                      {task.status === "PENDING"
                        ? "Pendiente"
                        : "En progreso"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 size={16} />

                  {new Date(task.dueDate).toLocaleString(
                    "es-PE",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;