// src/layouts/AlmacenLayout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styled, { createGlobalStyle, keyframes, css } from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import {
  LogOut,
  ClipboardList,
  Sun,
  Moon,
  History,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import logo from "../assets/logo_veganclean.png";

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

const Sidebar = styled.nav`
  width: 86px;
  background-color: ${({ theme }) => theme.cardBackground};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.9rem 0;
  box-shadow: 2px 0 14px rgba(0, 0, 0, 0.1);
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

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.header`
  width: 100%;
  backdrop-filter: blur(18px) saturate(180%);
  background-color: ${({ theme }) => theme.cardBackground};
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

const StockReqButton = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border-radius: 14px;
  padding: 0.52rem 0.72rem;
  cursor: pointer;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: transform 0.12s ease, opacity 0.12s ease, border-color 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
    border-color: ${({ theme }) => theme.accent + "55"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 600px) {
    span {
      display: none;
    }
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: 900px) {
    padding-bottom: 78px; /* espacio para bottom nav */
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
    background-color: ${({ theme }) => theme.cardBackground};
    border: 1px solid ${({ theme }) => theme.border};
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.20);
    overflow-x: auto;
    overflow-y: hidden;

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
  min-width: 96px;
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
   HELPERS
========================= */
function normalizeThemeName(t) {
  if (!t) return "dark";
  if (typeof t === "string") return t;
  return t.name || "dark";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const LOW_STOCK_LIMIT = 10;
const RPC_CREATE_STOCK_REQUEST = "admin_crear_solicitud_stock";

/* =========================
   COMPONENT
========================= */
export function AlmacenLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [sendingStockReq, setSendingStockReq] = useState(false);

  const themeName = normalizeThemeName(theme);
  const isDark = themeName === "dark";
  const currentPath = location.pathname;

  const NAV_ITEMS = useMemo(
    () => [
      { path: "/almacen/cotizaciones", title: "Cotizaciones", icon: ClipboardList },
      { path: "/almacen/historial", title: "Historial", icon: History },
    ],
    []
  );

  useEffect(() => {
    verificarSesion();
  }, []);

  async function verificarSesion() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      navigate("/admin/login", { replace: true });
      return;
    }

    const { data: perfil, error } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("email", data.user.email)
      .single();

    if (error || !perfil || perfil.rol !== "almacenista") {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "No tienes permisos para la sección de Almacén.",
      });
      navigate("/", { replace: true });
      return;
    }

    setUser(data.user);
    setChecking(false);
  }

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  async function abrirSolicitudStock() {
    if (sendingStockReq) return;

    try {
      setSendingStockReq(true);

      const [prodRes, eqRes] = await Promise.all([
        supabase
          .from("productos")
          .select("id, nombre, cantidad")
          .lte("cantidad", LOW_STOCK_LIMIT)
          .order("cantidad", { ascending: true })
          .order("nombre", { ascending: true })
          .limit(250),
        supabase
          .from("equipos")
          .select("id, nombre, cantidad")
          .lte("cantidad", LOW_STOCK_LIMIT)
          .order("cantidad", { ascending: true })
          .order("nombre", { ascending: true })
          .limit(250),
      ]);

      if (prodRes.error) throw prodRes.error;
      if (eqRes.error) throw eqRes.error;

      const productos = (prodRes.data || []).map((x) => ({
        id: Number(x.id),
        nombre: String(x.nombre || `Producto #${x.id}`),
        cantidad: Number(x.cantidad || 0),
      }));

      const equipos = (eqRes.data || []).map((x) => ({
        id: Number(x.id),
        nombre: String(x.nombre || `Equipo #${x.id}`),
        cantidad: Number(x.cantidad || 0),
      }));

      if (!productos.length && !equipos.length) {
        Swal.fire(
          "Sin alertas",
          `No hay productos ni equipos con stock <= ${LOW_STOCK_LIMIT}.`,
          "info"
        );
        return;
      }

      const renderOptions = (list) =>
        list
          .map(
            (it) =>
              `<option value="${it.id}">${escapeHtml(it.nombre)} (stock: ${it.cantidad})</option>`
          )
          .join("");

      const { isConfirmed, value } = await Swal.fire({
        title: "Solicitud de reposicion",
        width: 760,
        showCancelButton: true,
        confirmButtonText: "Enviar solicitud",
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        html: `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; text-align:left;">
            <div>
              <label style="font-weight:800; display:block; margin-bottom:6px;">Tipo</label>
              <select id="sol_tipo" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;">
                <option value="producto">Producto</option>
                <option value="equipo">Equipo</option>
              </select>
            </div>
            <div>
              <label style="font-weight:800; display:block; margin-bottom:6px;">Item</label>
              <select id="sol_item" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;"></select>
              <div id="sol_hint" style="margin-top:6px; font-size:12px; opacity:.75;"></div>
            </div>
            <div style="grid-column:1/-1;">
              <label style="font-weight:800; display:block; margin-bottom:6px;">Nota (opcional)</label>
              <textarea id="sol_nota" rows="3" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;" placeholder="Ej: Se necesita para entregas de esta semana."></textarea>
            </div>
          </div>
        `,
        didOpen: () => {
          const tipoEl = document.getElementById("sol_tipo");
          const itemEl = document.getElementById("sol_item");
          const hintEl = document.getElementById("sol_hint");

          const getList = () => (tipoEl.value === "producto" ? productos : equipos);

          if (!productos.length && equipos.length) {
            tipoEl.value = "equipo";
          }

          const renderItems = () => {
            const list = getList();
            itemEl.innerHTML = renderOptions(list);
            itemEl.disabled = list.length === 0;
            hintEl.textContent = list.length
              ? `${list.length} items con stock <= ${LOW_STOCK_LIMIT}.`
              : `No hay items de este tipo con stock <= ${LOW_STOCK_LIMIT}.`;
          };

          tipoEl.addEventListener("change", renderItems);
          renderItems();
        },
        preConfirm: () => {
          const tipoEl = document.getElementById("sol_tipo");
          const itemEl = document.getElementById("sol_item");
          const notaEl = document.getElementById("sol_nota");

          const itemTipo = tipoEl.value === "equipo" ? "equipo" : "producto";
          const list = itemTipo === "producto" ? productos : equipos;
          if (!list.length) {
            Swal.showValidationMessage("No hay items disponibles para ese tipo.");
            return null;
          }

          const itemId = Number(itemEl.value);
          const selected = list.find((x) => x.id === itemId);
          if (!selected) {
            Swal.showValidationMessage("Debes elegir un item valido.");
            return null;
          }

          const nota = String(notaEl?.value || "").trim();
          return {
            itemTipo,
            itemId,
            itemNombre: selected.nombre,
            cantidadActual: selected.cantidad,
            nota,
          };
        },
      });

      if (!isConfirmed || !value) return;

      const { data: notifId, error: rpcErr } = await supabase.rpc(RPC_CREATE_STOCK_REQUEST, {
        p_item_tipo: value.itemTipo,
        p_item_id: value.itemId,
        p_cantidad_actual: value.cantidadActual,
        p_limite: LOW_STOCK_LIMIT,
        p_nota: value.nota || null,
        p_solicitante_email: user?.email || null,
      });
      if (rpcErr) throw rpcErr;

      Swal.fire(
        "Solicitud enviada",
        `Se notifico al administrador sobre ${value.itemNombre}.${notifId ? ` Ref #${notifId}` : ""}`,
        "success"
      );
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudo enviar la solicitud de reposicion.", "error");
    } finally {
      setSendingStockReq(false);
    }
  }

  if (checking) {
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

      <Layout>
        {/* Desktop rail */}
        <Sidebar>
          <RailLogo title="Vega Clean">
            <img src={logo} alt="Logo" />
          </RailLogo>
          <RailDivider />

          {NAV_ITEMS.map((it) => {
            const Icon = it.icon;
            const active = currentPath.startsWith(it.path);
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
              Almacén <TitleSub>— Vega Clean</TitleSub>
            </Title>

            <UserInfo>
              <StockReqButton
                onClick={abrirSolicitudStock}
                disabled={sendingStockReq}
                title="Solicitar reposicion de stock"
              >
                <AlertTriangle size={18} />
                <span>{sendingStockReq ? "Enviando..." : "Solicitar stock"}</span>
              </StockReqButton>

              <ThemeToggleButton onClick={toggleTheme} title="Cambiar tema">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </ThemeToggleButton>

              <Email title={user?.email}>
                {user?.user_metadata?.full_name ||
                  user?.user_metadata?.name ||
                  user?.email ||
                  "Almacenista"}
              </Email>

              <LogoutButton onClick={logout} title="Cerrar sesión">
                <LogOut size={18} />
                <span>Salir</span>
              </LogoutButton>
            </UserInfo>
          </TopBar>

          <Body>
            <Outlet />
          </Body>

          {/* Mobile bottom nav */}
          <BottomNav>
            {NAV_ITEMS.map((it) => {
              const Icon = it.icon;
              const active = currentPath.startsWith(it.path);
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
