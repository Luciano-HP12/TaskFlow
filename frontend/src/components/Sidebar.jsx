import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  ListTodo,
  Tags,
  LogOut,
  X,
} from "lucide-react";

function Sidebar({ mobileOpen = false, onMobileClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Tareas",
      path: "/tasks",
      icon: ListTodo,
    },
    {
      name: "Categorías",
      path: "/categories",
      icon: Tags,
    },
  ];

  function handleLogout() {
    onMobileClose?.();
    logout();
    navigate("/login");
  }

  function handleNavigation() {
    onMobileClose?.();
  }

  function NavigationContent({ mobile = false }) {
    return (
      <>
        {/* ================= LOGO ================= */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              TaskFlow
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Organiza tu trabajo
            </p>
          </div>

          {mobile && (
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={21} />
            </button>
          )}
        </div>

        {/* ================= NAVEGACIÓN ================= */}

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={19} />

                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* ================= USUARIO ================= */}

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 min-w-0 px-3">
            <p className="truncate text-sm font-medium text-slate-900">
              {user?.name}
            </p>

            <p className="truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />

            Cerrar sesión
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ==================================================
          SIDEBAR ESCRITORIO
      ================================================== */}

      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <NavigationContent />
      </aside>

      {/* ==================================================
          OVERLAY MÓVIL
      ================================================== */}

      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* ==================================================
          SIDEBAR MÓVIL
      ================================================== */}

      <aside
        id="mobile-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <NavigationContent mobile />
      </aside>
    </>
  );
}

export default Sidebar;