// src/layouts/VendedorLayout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styled, { createGlobalStyle, keyframes, css } from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import {
  LogOut,
  Home,
  ClipboardList,
  Calendar,
  Sun,
  Moon,
  LayoutDashboard,
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
  min-width: 86px;
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

/* =========================================================================================================================
                                                        COMPONENT
============================================================================================================================ */
export function VendedorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const isDark = (theme?.name ?? theme) === "dark";
  const currentPath = location.pathname;

  const NAV_ITEMS = useMemo(
    () => [
      { path: "/vendedor/dashboard", title: "Inicio", icon: Home },
      { path: "/vendedor/catalogo", title: "Catálogo", icon: ClipboardList },
      { path: "/vendedor/historial", title: "Historial", icon: Calendar },
    ],
    []
  );

  useEffect(() => {
    verificarSesion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (error || !perfil || perfil.rol !== "vendedor") {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "No tienes permisos para esta sección.",
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
              Pre-Ventas <TitleSub>— Vendedor</TitleSub>
            </Title>

            <UserInfo>
              <ThemeToggleButton onClick={toggleTheme} title="Cambiar tema">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </ThemeToggleButton>

              <Email title={user?.email}>
                {user?.user_metadata?.full_name ||
                  user?.user_metadata?.name ||
                  user?.email}
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
