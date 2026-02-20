// src/layouts/AdminLayout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styled, { createGlobalStyle, keyframes, css } from "styled-components";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ShoppingBag,
  LogOut,
  Wrench,
  FileText,
  Sun,
  Moon,
  DollarSign,
  TrendingUp,
  UserSearchIcon,
  Bell,
  CheckCheck,
  X,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import logo from "../assets/logo_veganclean.png";
import { useTheme } from "../context/ThemeContext";

const surfaceColor = (theme) => theme.cardBackground || theme.surface || theme.background;

/* =========================
   GLOBAL
========================= */
const NoPaddingGlobal = createGlobalStyle`
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden;
    box-sizing: border-box;
  }
`;

/* =========================
   LOADING
========================= */
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  text-align: center;
  gap: 1rem;
`;

const SpinningLogo = styled.img`
  width: 90px;
  height: 90px;
  animation: ${spin} 2.5s linear infinite;
  filter: drop-shadow(0 0 10px ${({ theme }) => theme.accent});
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
  letter-spacing: 0.5px;
`;

/* =========================
   LAYOUT
========================= */
const Layout = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

/* Desktop rail */
const Sidebar = styled.nav`
  width: 86px;
  background-color: ${({ theme }) => surfaceColor(theme)};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.9rem 0;
  box-shadow: 2px 0 14px rgba(0, 0, 0, 0.10);
  z-index: 1200;

  @media (max-width: 900px) {
    display: none;
  }
`;

const RailLogo = styled.div`
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  margin-bottom: 10px;

  img {
    width: 34px;
    height: 34px;
    object-fit: contain;
  }
`;

const RailDivider = styled.div`
  width: 44px;
  height: 1px;
  background: ${({ theme }) => theme.border};
  margin: 10px 0 6px;
  opacity: 0.9;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  margin: 0.45rem 0;
  color: ${({ $active, theme }) => ($active ? theme.accent : theme.text)};
  cursor: pointer;
  transition: transform 0.12s ease, opacity 0.12s ease, color 0.12s ease;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 16px;

  ${({ $active }) =>
    $active &&
    css`
      background: rgba(0, 0, 0, 0.06);
    `}

  &:hover {
    color: ${({ theme }) => theme.accent};
    transform: translateY(-1px);
    opacity: 0.98;
  }
`;

/* Main */
const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

/* Sticky top bar */
const TopBar = styled.header`
  width: 100%;
  backdrop-filter: blur(18px) saturate(180%);
  background-color: ${({ theme }) => surfaceColor(theme)};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.2rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1100;

  @media (max-width: 900px) {
    padding: 0.75rem 0.95rem;
  }
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  font-weight: 900;
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  letter-spacing: 0.2px;

  @media (max-width: 900px) {
    font-size: 1.05rem;
  }
`;

const TitleSub = styled.span`
  font-size: 0.95rem;
  font-weight: 800;
  opacity: 0.85;
  color: ${({ theme }) => theme.text};

  @media (max-width: 900px) {
    display: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  text-align: right;

  @media (max-width: 600px) {
    gap: 0.55rem;
  }
`;

const Email = styled.span`
  font-weight: 700;
  opacity: 0.92;
  max-width: 340px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 600px) {
    max-width: 180px;
    font-size: 0.88rem;
  }
`;

const LogoutButton = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 0.58rem 0.85rem;
  cursor: pointer;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: transform 0.12s ease, opacity 0.12s ease;

  &:hover {
    opacity: 0.95;
    transform: translateY(-1px);
  }

  @media (max-width: 600px) {
    padding: 0.52rem 0.7rem;
    border-radius: 12px;

    span {
      display: none;
    }
  }
`;

const ThemeToggleButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  transition: transform 0.12s ease, opacity 0.12s ease, border-color 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
    border-color: ${({ theme }) => theme.accent + "55"};
  }
`;

const NotifWrap = styled.div`
  position: relative;
`;

const NotifButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  transition: transform 0.12s ease, opacity 0.12s ease, border-color 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
    border-color: ${({ theme }) => theme.accent + "55"};
  }
`;

const NotifBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  border: 2px solid ${({ theme }) => surfaceColor(theme)};
  font-size: 11px;
  line-height: 1;
  font-weight: 900;
  display: grid;
  place-items: center;
  padding: 0 4px;
`;

const NotifPanel = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: min(380px, 92vw);
  max-height: 68vh;
  overflow: auto;
  border-radius: 14px;
  background: ${({ theme }) => surfaceColor(theme)};
  backdrop-filter: none;
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
  z-index: 2100;
`;

const NotifHeader = styled.div`
  position: sticky;
  top: 0;
  background: ${({ theme }) => surfaceColor(theme)};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding: 0.7rem 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const NotifTitle = styled.div`
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
`;

const NotifAction = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.35rem 0.55rem;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;

  &:hover {
    opacity: 0.9;
  }
`;

const NotifList = styled.div`
  display: grid;
`;

const NotifItem = styled.button`
  width: 100%;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ $unread, theme }) => ($unread ? theme.accent + "14" : "transparent")};
  color: ${({ theme }) => theme.text};
  padding: 0.72rem 0.8rem;
  text-align: left;
  cursor: pointer;
  display: grid;
  gap: 0.25rem;

  &:hover {
    background: ${({ theme }) => theme.accent + "1a"};
  }
`;

const NotifItemTitle = styled.div`
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
`;

const NotifItemText = styled.div`
  font-size: 0.88rem;
  opacity: 0.9;
  line-height: 1.35;
`;

const NotifItemMeta = styled.div`
  font-size: 0.76rem;
  opacity: 0.72;
`;

const EmptyNotif = styled.div`
  padding: 1rem 0.9rem;
  opacity: 0.8;
  font-size: 0.9rem;
`;

const toastIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const ToastStack = styled.div`
  position: fixed;
  right: 14px;
  top: 14px;
  z-index: 3500;
  display: grid;
  gap: 8px;
  width: min(360px, calc(100vw - 20px));

  @media (max-width: 900px) {
    top: 74px;
  }
`;

const ToastCard = styled.div`
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => surfaceColor(theme)};
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  animation: ${toastIn} 0.2s ease;
`;

const ToastTop = styled.div`
  padding: 0.5rem 0.65rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const ToastTitle = styled.div`
  font-weight: 900;
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

const ToastClose = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

const ToastBody = styled.div`
  padding: 0.55rem 0.65rem 0.66rem;
  font-size: 0.84rem;
  line-height: 1.35;
  opacity: 0.92;
`;

/* Scroll area for pages */
const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  /* espacio para la barra inferior en mobile */
  padding-bottom: 0;

  @media (max-width: 900px) {
    padding-bottom: 78px;
  }
`;

/* =========================
   MOBILE BOTTOM NAV
========================= */
const BottomNav = styled.nav`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 12px;
    height: 64px;
    border-radius: 18px;
    padding: 8px;
    gap: 6px;
    z-index: 2000;

    backdrop-filter: blur(18px) saturate(180%);
    background-color: ${({ theme }) => surfaceColor(theme)};
    border: 1px solid ${({ theme }) => theme.border};
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.20);
    overflow-x: auto;
    overflow-y: hidden;

    /* mejor scroll horizontal si hay muchos items */
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const NavItem = styled.button`
  border: none;
  cursor: pointer;
  background: transparent;
  color: ${({ theme }) => theme.text};
  min-width: 74px;
  height: 100%;
  border-radius: 14px;
  display: grid;
  place-items: center;
  gap: 4px;
  padding: 6px 10px;
  transition: transform 0.12s ease, opacity 0.12s ease, background 0.12s ease;

  ${({ $active, theme }) =>
    $active &&
    css`
      background: ${theme.accent + "22"};
      color: ${theme.accent};
    `}

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }
`;

const NavLabel = styled.span`
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.2px;
  opacity: 0.95;
`;

/* =========================
   NOTIFICATIONS HELPERS
========================= */
const LOW_STOCK_LIMIT = 5;
const RPC_SYNC_NOTIF_STOCK = "admin_sync_notificaciones_stock";
const RPC_GET_NOTIF_USER = "admin_get_notificaciones_usuario";
const RPC_MARK_NOTIF_READ_USER = "admin_mark_notificaciones_read_for_user";
const RPC_CLEANUP_NOTIF = "admin_cleanup_notificaciones";
const NOTIF_KEEP_DAYS = 30;
const TOAST_RECENT_MS = 5 * 60 * 1000;

function formatNotifTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-DO");
}

function notifTimestamp(row) {
  const t = new Date(row?.actualizada_en || row?.creada_en || 0).getTime();
  return Number.isFinite(t) ? t : 0;
}

function sortNotificationsDesc(rows) {
  return [...(rows || [])].sort((a, b) => notifTimestamp(b) - notifTimestamp(a));
}

/* =========================
   COMPONENT
========================= */
export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [toastItems, setToastItems] = useState([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const notifWrapRef = useRef(null);
  const announcedToastKeysRef = useRef(new Set());

  const { theme, toggleTheme } = useTheme();

  const isDark = (theme?.name ?? theme) === "dark";
  const currentPath = location.pathname;
  const userId = user?.id || null;
  const unreadCount = useMemo(() => notifications.filter((n) => !n.leida).length, [notifications]);

  const NAV_ITEMS = useMemo(
    () => [
      { path: "/admin", title: "Dashboard", icon: LayoutDashboard },
      { path: "/admin/finanzas", title: "Finanzas", icon: TrendingUp },
      { path: "/admin/Usuarios", title: "Usuarios", icon: Users },
      { path: "/admin/clientes", title: "Clientes", icon: UserSearchIcon },
      { path: "/admin/equipos", title: "Equipos", icon: Wrench },
      { path: "/admin/productos", title: "Productos", icon: ShoppingBag },
      { path: "/admin/publicaciones", title: "Posts", icon: FileText },
      { path: "/admin/tickets", title: "Tickets", icon: ClipboardList },
      { path: "/admin/cotizaciones", title: "Cotiz.", icon: DollarSign },
    ],
    []
  );

  function normalizeNotificationRow(row) {
    const moduloRaw = String(row?.modulo || "").toLowerCase();
    const moduloLabel = moduloRaw
      ? moduloRaw.charAt(0).toUpperCase() + moduloRaw.slice(1)
      : "Sistema";
    return {
      ...row,
      title: row?.titulo || "Notificación",
      text: row?.mensaje || "",
      moduloLabel,
    };
  }

  function dismissToast(toastId) {
    setToastItems((prev) => prev.filter((t) => t.id !== toastId));
  }

  function pushToast(notif) {
    const toastId = `${notif.id}-${Date.now()}`;
    setToastItems((prev) => {
      const next = [{ id: toastId, notif }, ...prev];
      return next.slice(0, 4);
    });

    window.setTimeout(() => {
      dismissToast(toastId);
    }, 5000);
  }

  async function markNotificationsRead(ids = null) {
    if (!userId) return;
    const payload = ids && ids.length ? ids : null;
    const { error } = await supabase.rpc(RPC_MARK_NOTIF_READ_USER, {
      p_usuario_id: userId,
      p_ids: payload,
    });
    if (error) throw error;

    if (!payload) {
      const nowIso = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true, leida_en: nowIso })));
      return;
    }

    const idSet = new Set(payload.map((x) => Number(x)));
    const nowIso = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (idSet.has(Number(n.id)) ? { ...n, leida: true, leida_en: nowIso } : n))
    );
  }

  async function markAllNotificationsRead() {
    const unreadIds = notifications.filter((n) => !n.leida).map((n) => Number(n.id));
    if (!unreadIds.length) return;
    await markNotificationsRead(unreadIds);
  }

  async function fetchAdminNotifications() {
    if (!userId) return;

    const { error: syncErr } = await supabase.rpc(RPC_SYNC_NOTIF_STOCK, { p_limite: LOW_STOCK_LIMIT });
    if (syncErr) {
      console.warn("No se pudo sincronizar notificaciones de stock:", syncErr);
    }

    const { error: cleanupErr } = await supabase.rpc(RPC_CLEANUP_NOTIF, { p_keep_days: NOTIF_KEEP_DAYS });
    if (cleanupErr) {
      console.warn("No se pudo ejecutar limpieza de notificaciones:", cleanupErr);
    }

    const { data, error } = await supabase.rpc(RPC_GET_NOTIF_USER, {
      p_usuario_id: userId,
      p_limit: 150,
    });

    if (error) throw error;

    const nextNotifications = sortNotificationsDesc((data || []).map(normalizeNotificationRow));
    setNotifications(nextNotifications);

    const now = Date.now();
    for (const notif of nextNotifications) {
      const t = new Date(notif.actualizada_en || notif.creada_en).getTime();
      const isRecent = Number.isFinite(t) ? now - t <= TOAST_RECENT_MS : false;
      const toastKey = `${notif.id}:${notif.actualizada_en || notif.creada_en}`;
      if (!notif.leida && isRecent && !announcedToastKeysRef.current.has(toastKey)) {
        announcedToastKeysRef.current.add(toastKey);
        pushToast(notif);
      }
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const userEmail = data.user.email;

      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("email", userEmail)
        .single();

      if (perfilError || !perfil) {
        await supabase.from("usuarios").insert([{ email: userEmail, rol: "vendedor" }]);
        navigate("/vendedor", { replace: true });
        return;
      }

      if (perfil.rol === "admin") {
        setUser(data.user);
        setCheckingAuth(false);
        return;
      }

      if (perfil.rol === "vendedor") {
        navigate("/vendedor", { replace: true });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "Tu rol no tiene permisos para acceder a esta seccion.",
        confirmButtonColor: "#00bcd4",
      });
      navigate("/", { replace: true });
    };

    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (checkingAuth || !userId) return undefined;

    let cancelled = false;

    const run = async () => {
      try {
        if (cancelled) return;
        await fetchAdminNotifications();
      } catch (e) {
        console.error("No se pudieron cargar notificaciones:", e);
      }
    };

    run();
    const id = window.setInterval(run, 45000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingAuth, userId]);

  useEffect(() => {
    if (!notifPanelOpen) return undefined;

    const onPointerDown = (e) => {
      if (!notifWrapRef.current?.contains(e.target)) {
        setNotifPanelOpen(false);
      }
    };

    const onEsc = (e) => {
      if (e.key === "Escape") setNotifPanelOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [notifPanelOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("sb-coyghdbczlwnvfjvrdao-auth-token");
    sessionStorage.clear();
    navigate("/admin/login", { replace: true });
  };

  function toggleNotifPanel() {
    const willOpen = !notifPanelOpen;
    setNotifPanelOpen(willOpen);
    if (willOpen) {
      markAllNotificationsRead().catch((e) => {
        console.error("No se pudieron marcar notificaciones como leidas:", e);
      });
    }
  }

  if (checkingAuth) {
    return (
      <LoadingScreen>
        <SpinningLogo src={logo} alt="Vega Clean Logo" />
        <LoadingText>Verificando credenciales...</LoadingText>
      </LoadingScreen>
    );
  }

  return (
    <>
      <NoPaddingGlobal />

      {toastItems.length > 0 ? (
        <ToastStack>
          {toastItems.map((toast) => (
            <ToastCard key={toast.id}>
              <ToastTop>
                <ToastTitle>
                  <AlertTriangle size={14} />
                  {toast.notif.title}
                </ToastTitle>
                <ToastClose onClick={() => dismissToast(toast.id)} title="Cerrar">
                  <X size={14} />
                </ToastClose>
              </ToastTop>
              <ToastBody>{toast.notif.text}</ToastBody>
            </ToastCard>
          ))}
        </ToastStack>
      ) : null}

      <Layout>
        {/* Desktop: rail izquierdo */}
        <Sidebar>
          <RailLogo title="Vega Clean">
            <img src={logo} alt="Logo" />
          </RailLogo>
          <RailDivider />

          {NAV_ITEMS.map((it) => {
            const Icon = it.icon;
            const active = currentPath === it.path;
            return (
              <IconButton
                key={it.path}
                onClick={() => navigate(it.path)}
                $active={active}
                title={it.title}
              >
                <Icon size={24} />
              </IconButton>
            );
          })}
        </Sidebar>

        <Content>
          <TopBar>
            <Title>
              Dashboard <TitleSub>- Administrador</TitleSub>
            </Title>

            <UserInfo>
              <NotifWrap ref={notifWrapRef}>
                <NotifButton onClick={toggleNotifPanel} title="Notificaciones">
                  <Bell size={18} />
                </NotifButton>
                {unreadCount > 0 ? (
                  <NotifBadge>{unreadCount > 99 ? "99+" : unreadCount}</NotifBadge>
                ) : null}

                {notifPanelOpen ? (
                  <NotifPanel>
                    <NotifHeader>
                      <NotifTitle>
                        <Bell size={16} />
                        Notificaciones
                      </NotifTitle>
                      <NotifAction onClick={() => { markAllNotificationsRead().catch((e) => console.error("No se pudieron marcar notificaciones como leidas:", e)); }}>
                        <CheckCheck size={14} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                        Marcar leidas
                      </NotifAction>
                    </NotifHeader>

                    <NotifList>
                      {notifications.length === 0 ? (
                        <EmptyNotif>No hay alertas por ahora.</EmptyNotif>
                      ) : (
                        notifications.map((n) => (
                          <NotifItem
                            key={n.id}
                            $unread={!n.leida}
                            onClick={async () => {
                              try {
                                if (!n.leida) await markNotificationsRead([Number(n.id)]);
                              } catch (e) {
                                console.error("No se pudo marcar notificacion como leida:", e);
                              }
                              setNotifPanelOpen(false);
                              if (n.modulo === "productos") navigate("/admin/productos");
                              else if (n.modulo === "equipos") navigate("/admin/equipos");
                              else if (n.modulo === "finanzas") navigate("/admin/finanzas");
                              else if (n.modulo === "cotizaciones") navigate("/admin/cotizaciones");
                              else if (n.modulo === "clientes") navigate("/admin/clientes");
                              else if (n.modulo === "usuarios") navigate("/admin/usuarios");
                            }}
                          >
                            <NotifItemTitle>
                              <span>{n.title}</span>
                              <span style={{ fontSize: 12, opacity: 0.78 }}>{n.moduloLabel}</span>
                            </NotifItemTitle>
                            <NotifItemText>{n.mensaje}</NotifItemText>
                            <NotifItemMeta>
                              {formatNotifTime(n.actualizada_en || n.creada_en)} - {n.estado === "activa" ? "Activa" : "Resuelta"}
                            </NotifItemMeta>
                          </NotifItem>
                        ))
                      )}
                    </NotifList>
                  </NotifPanel>
                ) : null}
              </NotifWrap>

              <ThemeToggleButton onClick={toggleTheme} title="Cambiar tema">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </ThemeToggleButton>

              <Email title={user?.email}>
                {user?.user_metadata?.full_name ||
                  user?.user_metadata?.name ||
                  user?.email}
              </Email>

              <LogoutButton onClick={handleLogout} title="Cerrar sesion">
                <LogOut size={18} />
                <span>Salir</span>
              </LogoutButton>
            </UserInfo>
          </TopBar>

          <Body>
            <Outlet />
          </Body>

          {/* Mobile: barra inferior */}
          <BottomNav>
            {NAV_ITEMS.map((it) => {
              const Icon = it.icon;
              const active = currentPath === it.path;
              return (
                <NavItem
                  key={it.path}
                  onClick={() => navigate(it.path)}
                  $active={active}
                  title={it.title}
                >
                  <Icon size={20} />
                  <NavLabel>{it.title}</NavLabel>
                </NavItem>
              );
            })}
          </BottomNav>
        </Content>
      </Layout>
    </>
  );
}

