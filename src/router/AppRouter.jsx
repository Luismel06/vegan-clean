import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// --- Guards ---
import RouteGuard from "../components/RouteGuard";

// --- Layouts ---
import { ClienteLayout } from "../layouts/ClienteLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { VendedorLayout } from "../layouts/VendedorLayout";
import { AlmacenLayout } from "../layouts/AlmacenLayout";

// --- Páginas del cliente ---
import Inicio from "../pages/cliente/Inicio";
import Servicios from "../pages/cliente/Servicios";
import Publicaciones from "../pages/cliente/Publicaciones";
import Contacto from "../pages/cliente/Contacto";
import Nosotros from "../pages/cliente/Nosotros";

// --- Páginas del admin ---
import Dashboard from "../pages/admin/Dashboard";
import Usuarios from "../pages/admin/Usuarios";
import Tickets from "../pages/admin/Tickets";
import Productos from "../pages/admin/Productos";
import Equipos from "../pages/admin/Equipos";
import PreventaDetalle from "../pages/admin/PreventaDetalle";
import PublicacionesAdmin from "../pages/admin/Publicaciones";
import Cotizaciones from "../pages/admin/Cotizaciones";
import VistaCotizacion from "../pages/admin/VistaCotizacion";
import AdminClientes from "../pages/admin/AdminClientes.jsx";
import ClienteDetalle from "../pages/admin/ClienteDetalle.jsx";
import Finanzas from "../pages/admin/Finanzas.jsx";

// --- Páginas Vendedor ---
import VendedorCatalogo from "../pages/vendedor/VendedorCatalogo";
import VendedorHistorial from "../pages/vendedor/VendedorHistorial";
import DashboardVendedor from "../pages/vendedor/DashboardVendedor";

// --- Páginas Almacén ---
import AlmacenCotizaciones from "../pages/almacen/AlmacenCotizaciones.jsx";
import AlmacenDespacho from "../pages/almacen/AlmacenDespacho.jsx";
import HistorialCotizaciones from "../pages/almacen/HistorialCotizaciones.jsx";

// --- Login ---
import LoginAdmin from "../pages/admin/LoginAdmin";

// --- No autorizado ---
import NoAutorizado from "../pages/NoAutorizado";

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "5rem 1rem", color: "#00bcd4", fontFamily: "sans-serif" }}>
      <h1>404 - Página no encontrada</h1>
      <p>La ruta solicitada no existe.</p>
      <a
        href="/"
        style={{
          color: "white",
          background: "#00bcd4",
          padding: "0.6rem 1rem",
          borderRadius: "8px",
          textDecoration: "none",
          display: "inline-block",
          marginTop: "1rem",
        }}
      >
        Volver al inicio
      </a>
    </div>
  );
}

const router = createBrowserRouter([
  // === CLIENTE ===
  {
    path: "/",
    element: <ClienteLayout />,
    children: [
      { index: true, element: <Inicio /> },
      { path: "servicios", element: <Servicios /> },
      { path: "publicaciones", element: <Publicaciones /> },
      { path: "contacto", element: <Contacto /> },
      { path: "nosotros", element: <Nosotros /> },
    ],
  },

  // === ADMIN (solo admin) ===
  {
    path: "/admin",
    element: (
      <RouteGuard allowed={["admin"]}>
        <AdminLayout />
      </RouteGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "finanzas", element: <Finanzas /> },
      { path: "usuarios", element: <Usuarios /> },
      { path: "clientes", element: <AdminClientes /> },
      { path: "clientes/:id", element: <ClienteDetalle /> },
      { path: "productos", element: <Productos /> },
      { path: "equipos", element: <Equipos /> },
      { path: "tickets", element: <Tickets /> },
      { path: "preventa/:id", element: <PreventaDetalle /> },
      { path: "publicaciones", element: <PublicacionesAdmin /> },
      { path: "cotizaciones", element: <Cotizaciones /> },
      { path: "cotizaciones/:id", element: <VistaCotizacion /> },
    ],
  },

  // === VENDEDOR (solo vendedor) ===
  {
    path: "/vendedor",
    element: (
      <RouteGuard allowed={["vendedor"]}>
        <VendedorLayout />
      </RouteGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/vendedor/dashboard" replace /> },
      { path: "dashboard", element: <DashboardVendedor /> },
      { path: "catalogo", element: <VendedorCatalogo /> },
      { path: "historial", element: <VendedorHistorial /> },
    ],
  },

  // === ALMACEN (solo almacenista) ===
  {
    path: "/almacen",
    element: (
      <RouteGuard allowed={["almacenista"]}>
        <AlmacenLayout />
      </RouteGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/almacen/cotizaciones" replace /> }, // default
      { path: "cotizaciones", element: <AlmacenCotizaciones /> },
      { path: "cotizacion/:id", element: <AlmacenDespacho /> },
      { path: "historial", element: <HistorialCotizaciones /> },
    ],
  },

  // === Login ===
  { path: "/admin/login", element: <LoginAdmin /> },
  { path: "/login", element: <LoginAdmin /> },

  // === No autorizado ===
  { path: "/no-autorizado", element: <NoAutorizado /> },

  // === Error 404 ===
  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
