import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { loginUser } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ListTodo,
} from "lucide-react";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* =========================================
     MANEJAR CAMBIOS
  ========================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  /* =========================================
     INICIAR SESIÓN
  ========================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      const data = await loginUser(form);

      login(data.user, data.token);

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* =====================================
            PANEL IZQUIERDO
        ===================================== */}

        <section className="hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          {/* MARCA */}

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900">
              <ListTodo size={22} />
            </div>

            <div>
              <p className="text-xl font-bold">
                TaskFlow
              </p>

              <p className="text-sm text-slate-400">
                Organiza tu trabajo
              </p>
            </div>
          </div>

          {/* MENSAJE */}

          <div className="max-w-lg">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
              Productividad personal
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Mantén tus tareas organizadas y tus objetivos
              bajo control.
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Centraliza tus actividades, establece
              prioridades y realiza seguimiento de tu
              progreso desde un solo lugar.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />
                Organiza tus tareas por categorías
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />
                Controla prioridades y fechas límite
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />
                Visualiza tu progreso desde el dashboard
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            TaskFlow · Gestión personal de tareas
          </p>
        </section>

        {/* =====================================
            LOGIN
        ===================================== */}

        <section className="flex min-h-screen items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* LOGO MOBILE */}

            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ListTodo size={20} />
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  TaskFlow
                </p>

                <p className="text-xs text-slate-500">
                  Organiza tu trabajo
                </p>
              </div>
            </div>

            {/* HEADER */}

            <header className="mb-8">
              <p className="mb-2 text-sm font-medium text-slate-500">
                Bienvenido de nuevo
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Iniciar sesión
              </h2>

              <p className="mt-2 text-slate-500">
                Ingresa tus credenciales para acceder a
                TaskFlow.
              </p>
            </header>

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Ingresando..."
                  : "Iniciar sesión"}

                {!loading && (
                  <ArrowRight size={17} />
                )}
              </button>
            </form>

            {/* REGISTER */}

            <p className="mt-7 text-center text-sm text-slate-500">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="font-semibold text-slate-900 transition hover:text-slate-600"
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;