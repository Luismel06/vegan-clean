// src/pages/admin/LoginAdmin.jsx
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import { useEffect } from "react";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.background};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  width: 380px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  font-weight: 700;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem;
  margin: 0.6rem 0;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.accent};
  color: #000000;
  border: none;
  border-radius: 8px;
  padding: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: 0.3s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }

  &::before {
    margin-right: 0.75em;
  }
  &::after {
    margin-left: 0.75em;
  }
`;

const BackButton = styled.button`
  margin-top: 1rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.accent};
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`;

function normalizeRole(v) {
  return String(v || "").trim().toLowerCase();
}

export default function LoginAdmin() {
  const navigate = useNavigate();

  // === Login con Google ===
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Mantén esto si ya te funciona con tu configuración
        redirectTo: window.location.origin + "/admin/login",
      },
    });

    if (error) {
      Swal.fire("Error", "Hubo un problema al iniciar sesión con Google.", "error");
    }
  };

  // === Redirigir si ya hay sesión (pero dependiendo del rol) ===
  useEffect(() => {
    const validateAndRedirect = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;

      if (!user?.email) return;

      // Buscar el rol del usuario en la tabla usuarios
      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("email", user.email)
        .maybeSingle();

      if (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo validar tu usuario.", "error");
        return;
      }

      if (!usuario) {
        await supabase.auth.signOut();
        Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "Tu cuenta no está registrada en el sistema.",
          confirmButtonColor: "#00bcd4",
        });
        return;
      }

      const rol = normalizeRole(usuario.rol);

      // Redirigir según el rol
      if (["admin", "administrador"].includes(rol)) {
        navigate("/admin", { replace: true });
        return;
      }

      if (["vendedor"].includes(rol)) {
        navigate("/vendedor/catalogo", { replace: true });
        return;
      }

      if (["almacenista"].includes(rol)) {
        navigate("/almacen/cotizaciones", { replace: true });
        return;
      }

      Swal.fire({
        icon: "warning",
        title: "Rol no válido",
        text: "Tu cuenta no tiene un rol asignado válido.",
        confirmButtonColor: "#00bcd4",
      });
    };

    validateAndRedirect();
  }, [navigate]);

  return (
    <Container>
      <Card>
        <Title>Acceso al panel</Title>
        <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
          Inicia sesión para acceder a tu cuenta.
        </p>

        {/* Login manual (deshabilitado por ahora) */}
        <Input type="email" placeholder="Correo electrónico" />
        <Input type="password" placeholder="Contraseña" />
        <Button disabled>Iniciar sesión</Button>

        <Divider>o</Divider>

        {/* Botón de Google */}
        <Button onClick={handleGoogleLogin}>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            style={{ width: "20px", marginRight: "8px", verticalAlign: "middle" }}
          />
          Acceder con Google
        </Button>

        <BackButton onClick={() => navigate("/")}>Volver al inicio</BackButton>
      </Card>
    </Container>
  );
}
