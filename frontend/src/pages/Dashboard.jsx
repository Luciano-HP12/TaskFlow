import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Bienvenido, {user.name}.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link
            to="/tasks"
            className="rounded-lg border px-4 py-2"
          >
            Ver tareas
          </Link>

          <Link
            to="/categories"
            className="rounded-lg border px-4 py-2"
          >
            Categorías
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Cerrar sesión      
          </button>
          </div>
      </div>
    </main>
  );
}

export default Dashboard;