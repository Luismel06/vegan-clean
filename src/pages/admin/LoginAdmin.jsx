// src/pages/admin/LoginAdmin.jsx
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

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
    transform: none;
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingManual, setLoadingManual] = useState(false);

  // === Login con Google ===
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/admin/login",
      },
    });

    if (error) {
      Swal.fire("Error", "Hubo un problema al iniciar sesión con Google.", "error");
    }
  };

  // === Login manual (email/password) ===
  const handleManualLogin = async () => {
    const e = String(email || "").trim();
    const p = String(password || "");

    if (!e || !p) {
      Swal.fire("Datos requeridos", "Completa el correo y la contraseña.", "warning");
      return;
    }

    try {
      setLoadingManual(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: e,
        password: p,
      });

      if (error) {
        Swal.fire("Error", error.message || "No se pudo iniciar sesión.", "error");
        return;
      }

      // Si login OK, el useEffect de abajo hace validate + redirect
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Ocurrió un error iniciando sesión.", "error");
    } finally {
      setLoadingManual(false);
    }
  };

  /**
   * PATCH: Guardar auth_uid automáticamente
   * - auth_uid = user.id (uuid de Supabase Auth)
   * - Solo actualiza si está null o es distinto
   */
  async function upsertAuthUid({ email, authUid }) {
    if (!email || !authUid) return;

    // Intentamos actualizar sin romper el flujo si falla
    try {
      // OJO: esto requiere que exista la columna auth_uid en usuarios
      const { error } = await supabase
        .from("usuarios")
        .update({ auth_uid: authUid })
        .eq("email", email)
        .or(`auth_uid.is.null,auth_uid.neq.${authUid}`);

      if (error) {
        // No bloqueamos login por esto, pero lo registramos
        console.warn("No se pudo guardar auth_uid:", error.message);
      }
    } catch (e) {
      console.warn("Error guardando auth_uid:", e);
    }
  }

  // === Validar sesión + rol + guardar auth_uid + redirigir ===
  useEffect(() => {
    const validateAndRedirect = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;

      if (!user?.email) return;

      // Traemos rol + auth_uid si existe
      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("rol, auth_uid")
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

      // PATCH auth_uid (si falta o cambió)
      if (!usuario.auth_uid || usuario.auth_uid !== user.id) {
        await upsertAuthUid({ email: user.email, authUid: user.id });
      }

      const rol = normalizeRole(usuario.rol);

      if (["admin", "administrador"].includes(rol)) {
        navigate("/admin", { replace: true });
        return;
      }

      if (rol === "vendedor") {
        navigate("/vendedor/catalogo", { replace: true });
        return;
      }

      if (rol === "almacenista") {
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

  const manualDisabled = loadingManual || !email.trim() || !password;

  return (
    <Container>
      <Card>
        <Title>Acceso al panel</Title>
        <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
          Inicia sesión para acceder a tu cuenta.
        </p>

        {/* Login manual (habilitado) */}
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleManualLogin();
          }}
        />

        <Button onClick={handleManualLogin} disabled={manualDisabled}>
          {loadingManual ? "Iniciando..." : "Iniciar sesión"}
        </Button>

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
