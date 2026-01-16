// src/layouts/AdminLayout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ShoppingBag,
  LogOut,
  Wrench,
  FileText,
  Menu,
  X,
  Sun,
  Moon, //   Íconos para modo día/noche
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import logo from "../assets/logo_veganclean.png";
import { DollarSign } from "lucide-react";
import { useTheme } from "../context/ThemeContext"; //   Usa el hook correcto

const NoPaddingGlobal = createGlobalStyle`
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden;
    box-sizing: border-box;
  }
`;

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
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  letter-spacing: 0.5px;
`;

const Layout = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.nav`
  width: 80px;
  background-color: ${({ theme }) => theme.cardBackground};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  z-index: 1200;

  @media (max-width: 900px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    transform: ${({ $open }) => ($open ? "translateX(0)" : "translateX(-100%)")};
    background-color: ${({ theme }) => theme.cardBackground};
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  margin: 1rem 0;
  color: ${({ $active, theme }) => ($active ? theme.accent : theme.text)};
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.accent};
    transform: scale(1.2);
  }
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const TopBar = styled.header`
  width: 100%;
  background-color: ${({ theme }) => theme.cardBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
  text-align: right;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
  }
`;

const Email = styled.span`
  font-weight: 500;
`;

const LogoutButton = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #030778;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: 0.3s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  display: none;
  @media (max-width: 900px) {
    display: block;
  }

  svg {
    stroke: ${({ theme }) => theme.text};
  }
`;

//   Nuevo botón de cambio de tema
const ThemeToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  transition: color 0.3s ease, transform 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.accent};
    transform: rotate(15deg);
  }
`;

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { theme, toggleTheme } = useTheme(); //   usa el hook del ThemeContext

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
        await supabase.from("usuarios").insert([{ email: userEmail, rol: "tecnico" }]);
        navigate("/tecnico", { replace: true });
        return;
      }

      if (perfil.rol === "admin") {
        setUser(data.user);
        setCheckingAuth(false);
      } else if (perfil.rol === "tecnico") {
        navigate("/tecnico", { replace: true });
        return;
      } else {
        await Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "Tu rol no tiene permisos para acceder a esta sección.",
          confirmButtonColor: "#00bcd4",
        });
        navigate("/", { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("sb-coyghdbczlwnvfjvrdao-auth-token");
    sessionStorage.clear();
    navigate("/admin/login", { replace: true });
  };

  if (checkingAuth) {
    return (
      <LoadingScreen>
        <SpinningLogo src={logo} alt="Vega Clean Logo" />
        <LoadingText>Verificando credenciales...</LoadingText>
      </LoadingScreen>
    );
  }

  const currentPath = location.pathname;

  return (
    <>
      <NoPaddingGlobal />

      <Layout>
        <Sidebar $open={menuOpen}>
          <IconButton onClick={() => setMenuOpen(false)}>
            <X size={26} />
          </IconButton>

          <IconButton
            onClick={() => navigate("/admin")}
            $active={currentPath === "/admin"}
            title="Dashboard"
          >
            <LayoutDashboard size={24} />
          </IconButton>

          <IconButton
            onClick={() => navigate("/admin/Usuarios")}
            $active={currentPath === "/admin/Usuarios"}
            title="Usuarios"
          >
            <Users size={24} />
          </IconButton>

          <IconButton
            onClick={() => navigate("/admin/servicios")}
            $active={currentPath === "/admin/servicios"}
            title="Servicios"
          >
            <Wrench size={24} />
          </IconButton>

          <IconButton
            onClick={() => navigate("/admin/productos")}
            $active={currentPath === "/admin/productos"}
            title="Productos"
          >
            <ShoppingBag size={24} />
          </IconButton>

          <IconButton
            onClick={() => navigate("/admin/tickets")}
            $active={currentPath === "/admin/tickets"}
            title="Tickets"
          >
            <ClipboardList size={24} />
          </IconButton>

          <IconButton
            onClick={() => navigate("/admin/publicaciones")}
            $active={currentPath === "/admin/publicaciones"}
            title="Publicaciones"
          >
            <FileText size={24} />
          </IconButton>
          <IconButton
            onClick={() => navigate("/admin/cotizaciones")}
            $active={currentPath === "/admin/cotizaciones"}
            title="Cotizaciones"
          >
  <DollarSign size={24} />
</IconButton>

        </Sidebar>

        <Content>
          <TopBar>
            <Title>
              <MobileMenuButton onClick={() => setMenuOpen(!menuOpen)}>
                <Menu size={22} />
              </MobileMenuButton>
              Dashboard
            </Title>

            <UserInfo>
              {/*   Nuevo botón de modo día/noche */}
              <ThemeToggleButton onClick={toggleTheme} title="Cambiar tema">
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </ThemeToggleButton>

              <div>
                <strong>Vega Clean</strong>
                <br />
                <Email>{user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}</Email>
              </div>
              <LogoutButton onClick={handleLogout}>
                <LogOut size={18} /> Salir
              </LogoutButton>
            </UserInfo>
          </TopBar>

          <Outlet />
        </Content>
      </Layout>
    </>
  );
}
