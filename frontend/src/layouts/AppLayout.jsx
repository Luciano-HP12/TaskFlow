import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import Sidebar from "../components/Sidebar";

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const location = useLocation();

  /* =========================================
     CERRAR MENÚ AL CAMBIAR DE RUTA
  ========================================= */

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /* =========================================
     CERRAR MENÚ CON ESCAPE
  ========================================= */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =========================================
     BLOQUEAR SCROLL CUANDO EL MENÚ ESTÁ ABIERTO
  ========================================= */

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= SIDEBAR ================= */}

      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() =>
          setMobileMenuOpen(false)
        }
      />

      {/* ================= HEADER MÓVIL ================= */}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:hidden">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            TaskFlow
          </h1>

          <p className="text-xs text-slate-500">
            Organiza tu trabajo
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(true)
          }
          aria-label="Abrir menú"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Menu size={21} />
        </button>
      </header>

      {/* ================= CONTENIDO ================= */}

      <main className="min-h-screen md:ml-64">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;