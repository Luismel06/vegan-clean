// styles/GlobalStyles.js (o donde tengas tu tema)
import { createGlobalStyle } from "styled-components";

export const lightTheme = {
  mode: "light",
  background: "#ffffff",        // blanco total
  surface: "#ffffff",           // tarjetas blancas
  surface2: "#f6f8fb",          // gris muy suave para secciones si quieres
  text: "#0b3a6f",              // AZUL para texto
  heading: "#063a74",           // AZUL un poco más fuerte para títulos
  accent: "#16a34a",            // VERDE (botones, líneas, resaltados)
  accentSoft: "rgba(22,163,74,0.12)",
  border: "rgba(2, 6, 23, 0.12)",
};

export const darkTheme = {
  mode: "dark",
  background: "#0b1220",
  surface: "#0f172a",
  surface2: "#111c33",
  text: "#e5eefb",
  heading: "#ffffff",
  accent: "#22c55e",
  accentSoft: "rgba(34,197,94,0.16)",
  border: "rgba(255,255,255,0.14)",
};

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Manrope", sans-serif;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    background: ${({ theme }) => theme.background};
  }

  body {
    color: ${({ theme }) => theme.text};
    transition: background-color 0.25s, color 0.25s;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 900;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.heading};
  }

  a {
    color: ${({ theme }) => theme.text};
    text-decoration: none;
  }

  ::selection {
    background-color: ${({ theme }) => theme.accent};
    color: #ffffff;
  }

  :root {
    --brand-blue: #0b3a6f;
    --brand-green: #16a34a;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
