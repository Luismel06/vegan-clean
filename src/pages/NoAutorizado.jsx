export default function NoAutorizado() {
  return (
    <div
      style={{
        padding: "5rem",
        textAlign: "center",
        color: "#00bcd4",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Acceso denegado</h1>
      <p>No tienes permisos para acceder a esta sección.</p>

      <a
        href="/"
        style={{
          marginTop: "1.5rem",
          display: "inline-block",
          padding: "0.7rem 1.2rem",
          background: "#00bcd4",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
        }}
      >
        Volver al inicio
      </a>
    </div>
  );
}
