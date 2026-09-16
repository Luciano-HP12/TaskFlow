import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getTasks } from "../services/task.service";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");

        const data = await getTasks();

        setTasks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

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
    if (!task.dueDate) return false;

    return (
      task.status !== "COMPLETED" &&
      new Date(task.dueDate) < now
    );
  }).length;

  const upcomingTasks = tasks
    .filter((task) => {
      if (!task.dueDate) return false;
      if (task.status === "COMPLETED") return false;

      return new Date(task.dueDate) >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.dueDate) - new Date(b.dueDate)
    )
    .slice(0, 5);

  if (loading) {
    return (
      <main className="p-8">
        <p>Cargando dashboard...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenido, {user?.name}
          </h1>

          <p className="mt-2 text-gray-500">
            Aquí tienes un resumen de tus tareas.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/tasks/new"
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Nueva tarea
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-lg border px-4 py-2"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Pendientes
          </p>

          <p className="mt-2 text-3xl font-bold">
            {pendingTasks}
          </p>
        </article>

        <article className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            En progreso
          </p>

          <p className="mt-2 text-3xl font-bold">
            {inProgressTasks}
          </p>
        </article>

        <article className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Completadas
          </p>

          <p className="mt-2 text-3xl font-bold">
            {completedTasks}
          </p>
        </article>

        <article className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Vencidas
          </p>

          <p className="mt-2 text-3xl font-bold">
            {overdueTasks}
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-xl border p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Próximas tareas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Tus próximas fechas límite.
            </p>
          </div>

          <Link
            to="/tasks"
            className="text-sm text-blue-600"
          >
            Ver todas
          </Link>
        </div>

        {upcomingTasks.length === 0 ? (
          <p className="text-gray-500">
            No tienes próximas tareas con fecha límite.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <article
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div>
                  <h3 className="font-medium">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {task.status === "PENDING"
                      ? "Pendiente"
                      : "En progreso"}
                  </p>
                </div>

                <p className="text-sm font-medium">
                  {new Date(task.dueDate).toLocaleString(
                    "es-PE",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/tasks"
          className="rounded-lg border px-4 py-2"
        >
          Administrar tareas
        </Link>

        <Link
          to="/categories"
          className="rounded-lg border px-4 py-2"
        >
          Administrar categorías
        </Link>
      </section>
    </main>
  );
}

export default Dashboard;