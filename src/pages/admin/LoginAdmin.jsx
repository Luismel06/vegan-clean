import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import { GoogleLogin } from "@react-oauth/google";
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

export default function LoginAdmin() {
  const navigate = useNavigate();

  //   Si ya hay sesión, redirigir directamente
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        navigate("/admin");
      }
    };
    checkSession();
  }, [navigate]);

  // === Iniciar sesión con Google ===
  const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/admin/login",
    },
  });

  if (error) {
    Swal.fire("Error", "Hubo un problema al iniciar sesión con Google.", "error");
  }
};



  // === Validar usuario al iniciar sesión ===
  useEffect(() => {
    const validateUser = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;

      if (user?.email) {
        // Buscar el rol del usuario en la tabla usuarios
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("email", user.email)
          .single();

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

        // Redirigir según el rol
        if (["admin", "administrador"].includes(usuario.rol)) {
  navigate("/admin", { replace: true });
} else if (["tecnico", "técnico"].includes(usuario.rol)) {
  navigate("/tecnico/tickets", { replace: true });
} else {
  Swal.fire({
    icon: "warning",
    title: "Rol no válido",
    text: `Tu cuenta (${usuario.rol}) no tiene un rol asignado válido.`,
    confirmButtonColor: "#00bcd4",
  });
}

      }
    };
    validateUser();
  }, [navigate]);

  return (
    <Container>
      <Card>
        <Title>Acceso al panel</Title>
        <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
          Inicia sesión para acceder a tu cuenta.
        </p>

        {/* Login manual (para futuro uso con usuarios) */}
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

        {/* Volver al inicio */}
        <BackButton onClick={() => navigate("/")}>Volver al inicio</BackButton>
      </Card>
    </Container>
  );
}
