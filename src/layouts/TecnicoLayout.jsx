import { Outlet, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import {
  LogOut,
  Home,
  ClipboardList,
  Calendar,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext"; // ← usa tu propio hook
import logo from "../assets/logo_veganclean.png";

// === GLOBAL FIX ===
const NoPaddingGlobal = createGlobalStyle`
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden;
    box-sizing: border-box;
  }
`;

// === ANIMACIÓN DEL LOGO ===
const spin = keyframes`
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
`;

const LoadingScreen = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.text};
`;

const SpinningLogo = styled.img`
  width: 90px;
  height: 90px;
  animation: ${spin} 2.5s linear infinite;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.accent};
  margin-top: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
`;

// === LAYOUT BASE ===
const Layout = styled.div`
  display: flex;
  height: 100vh;
  background: ${({ theme }) => theme.background};
`;

// === SIDEBAR ===
const Sidebar = styled.aside`
  width: 240px;
  background: ${({ theme }) => theme.cardBackground};
  border-right: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  gap: 2rem;
  z-index: 2000;

  @media (max-width: 900px) {
    position: fixed;
    height: 100vh;
    top: 0;
    left: 0;
    transform: ${({ open }) => (open ? "translateX(0)" : "translateX(-100%)")};
    transition: transform 0.3s ease;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1500;
  @media (min-width: 901px) {
    display: none;
  }
`;

// LOGO TEXTO DEL SIDEBAR
const LogoText = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
  text-align: center;
  margin-bottom: 1rem;
`;

// ITEMS DEL SIDEBAR
const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  background: ${({ active, theme }) =>
    active ? theme.accent + "22" : "transparent"};

  &:hover {
    background: ${({ theme }) => theme.accent + "33"};
  }
`;

// TOGGLE MODO OSCURO/CLARO
const ThemeToggle = styled.button`
  margin-top: auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0.5rem 0.7rem;
  font-size: 0.85rem;
  background: ${({ theme }) => theme.cardBackground};
  cursor: pointer;
  display: flex;
  gap: 0.4rem;
  width: 100%;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.hover};
  }
`;

// === TOPBAR ===
const TopBar = styled.header`
  width: 100%;
  background: ${({ theme }) => theme.cardBackground};
  padding: 0.8rem 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;

  @media (max-width: 900px) {
    display: flex;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const UserInfo = styled.div`
  text-align: right;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
`;

const Email = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.accent};
`;

const LogoutButton = styled.button`
  margin-left: 1rem;
  background: ${({ theme }) => theme.accent};
  color: white;
  border: none;
  padding: 0.55rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    transform: scale(1.05);
    opacity: 0.9;
  }
`;

// === MAIN CONTENT ===
const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

export function TecnicoLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme(); // ← usa tu contexto real
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  async function verificarSesion() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      navigate("/admin/login", { replace: true });
      return;
    }

    // Obtener rol
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("email", data.user.email)
      .single();

    if (!perfil || perfil.rol !== "tecnico") {
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
    navigate("/admin/login");
  };

  if (checking) {
    return (
      <LoadingScreen>
        <SpinningLogo src={logo} />
        <LoadingText>Verificando credenciales...</LoadingText>
      </LoadingScreen>
    );
  }

  return (
    <>
      <NoPaddingGlobal />

      <Layout>
        {/* OVERLAY */}
        {sidebarOpen && <Overlay onClick={() => setSidebarOpen(false)} />}

        {/* SIDEBAR */}
        <Sidebar open={sidebarOpen}>
          <LogoText>Vega Clean</LogoText>

          <MenuContainer>
            <MenuItem onClick={() => { navigate("/tecnico/dashboard"); setSidebarOpen(false); }}>
              <Home size={18} /> Dashboard
            </MenuItem>

            <MenuItem onClick={() => { navigate("/tecnico/tickets"); setSidebarOpen(false); }}>
              <ClipboardList size={18} /> Tickets
            </MenuItem>

            <MenuItem onClick={() => { navigate("/tecnico/calendario"); setSidebarOpen(false); }}>
              <Calendar size={18} /> Calendario
            </MenuItem>
          </MenuContainer>

          <ThemeToggle onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </ThemeToggle>
        </Sidebar>

        {/* TOPBAR */}
        <div style={{ width: "100%" }}>
          <TopBar>
            <TopLeft>
              <HamburgerButton onClick={() => setSidebarOpen(true)}>
                <Menu size={22} />
              </HamburgerButton>

              <Title>Panel Pre-Ventas</Title>
            </TopLeft>

            <div style={{ display: "flex", alignItems: "center" }}>
              <UserInfo>
                <strong>{user?.user_metadata?.full_name || "Técnico"}</strong>
                <Email>{user?.email}</Email>
              </UserInfo>

              <LogoutButton onClick={logout}>
                <LogOut size={18} /> Salir
              </LogoutButton>
            </div>
          </TopBar>

          <MainContent>
            <Outlet />
          </MainContent>
        </div>
      </Layout>
    </>
  );
}
