import { createGlobalStyle } from "styled-components";

export const lightTheme = {
  mode: "light",
  background: "#f5fbf7",
  Hero: "#a3f3be",
  text: "#094c8f",
  cardBackground: "#a3f3be",
  accent: "#ffffff",     // AZUL (principal)
  accent2: "#00c27a",    // VERDE (secundario)
  border: "rgba(0,0,0,0.15)",
};

export const darkTheme = {
  mode: "dark",
  background: "#0c0f14",
  text: "#e4eaf0",
  cardBackground: "#0f1620",
  accent: "#73a6f3",     // AZUL (principal)
  accent2: "#00c27a",    // VERDE (secundario)
  border: "rgba(255,255,255,0.12)",
};

export const device = {
  mobile: "(max-width: 600px)",
  tablet: "(max-width: 900px)",
  laptop: "(max-width: 1200px)",
};

export const GlobalStyles = createGlobalStyle`
  /* Reset y configuración base */
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
  }

  body {
    margin: 0;
    padding: 0;
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: background-color 0.25s, color 0.25s;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: "Manrope", sans-serif;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  a {
    color: ${({ theme }) => theme.text};
    text-decoration: none;
  }

  ::selection {
    background-color: ${({ theme }) => theme.accent};
    color: #ffffff;
  }

  /* Variables de marca (para usar en cualquier componente) */
  :root {
    --brand-blue: #0b5ed7;
    --brand-green: #00c27a;
  }

  /*  Animación reutilizable (por ejemplo, para loaders) */
  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
