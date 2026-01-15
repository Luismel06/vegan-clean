import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import logo from "../../assets/logo_veganclean.png";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const NavWrapper = styled.nav`
  width: 100%;
  background-color: ${({ theme }) => theme.navBackground};
  color: ${({ theme }) => theme.text};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, color 0.3s ease;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;

  img {
    width: 38px;
    height: 38px;
  }

  h1 {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
  }
`;

const MenuLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  a {
    color: ${({ theme }) => theme.text};
    text-decoration: none;
    font-weight: 500;
    position: relative;
    transition: color 0.3s ease;

    &:hover {
      color: ${({ theme }) => theme.accent};
    }

    &.active::after {
      content: "";
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${({ theme }) => theme.accent};
      border-radius: 2px;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const RightButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AccessButton = styled(Link)`
  background-color: ${({ theme }) => theme.accent};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  &:hover {
    opacity: 0.9;
  }
`;

const ThemeToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text};
  transition: color 0.3s ease, transform 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.accent};
    transform: scale(1.1);
  }

  svg {
    stroke: currentColor;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }

  svg {
    stroke: currentColor;
  }
`;

const MobileMenuOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  background-color: ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(15, 15, 15, 0.65)"
      : "rgba(255, 255, 255, 0.6)"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
`;

const MobileLogo = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 1.8rem;
  filter: drop-shadow(0 0 12px ${({ theme }) => theme.accent});
  transition: transform 0.3s ease;
  animation: fadeIn 0.6s ease forwards;

  &:hover {
    transform: scale(1.1);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const MobileLink = styled(Link)`
  font-size: 1.6rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0.8rem 0;
  text-decoration: none;
  transition: 0.3s;

  &:hover {
    color: ${({ theme }) => theme.accent};
    transform: scale(1.05);
  }
`;

export default function NavbarTemplate() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: "Inicio", path: "/" },
    { name: "Servicios", path: "/servicios" },
    { name: "Publicaciones", path: "/publicaciones" },
    { name: "Nosotros", path: "/nosotros" },
    { name: "Contacto", path: "/contacto" },
  ];

  return (
    <>
      <NavWrapper>
        <LogoContainer to="/">
          <img src={logo} alt="logo" />
          <h1>Vegan Clean</h1>
        </LogoContainer>

        <MenuLinks>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? "active" : ""}
            >
              {link.name}
            </Link>
          ))}
        </MenuLinks>

        <RightButtons>
          {/* 🌞🌙 Toggle con animación */}
          <ThemeToggleButton onClick={toggleTheme}>
            <motion.div
              key={theme.name} //   Forzar re-render al cambiar de tema
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {theme.name === "light" ? <Sun size={22} /> : <Moon size={22} />}
            </motion.div>
          </ThemeToggleButton>

          <AccessButton to="/admin/login">Acceder</AccessButton>

          <MobileMenuButton onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </MobileMenuButton>
        </RightButtons>
      </NavWrapper>

      <AnimatePresence>
        {menuOpen && (
          <MobileMenuOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MobileLogo src={logo} alt="logo" />
            {links.map((link) => (
              <MobileLink
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </MobileLink>
            ))}
            <AccessButton to="/admin/login" onClick={() => setMenuOpen(false)}>
  Acceder
</AccessButton>

          </MobileMenuOverlay>
        )}
      </AnimatePresence>
    </>
  );
}
