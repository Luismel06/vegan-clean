import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme, GlobalStyles } from "../styles/GlobalStyles";

const ThemeContext = createContext();

export function ThemeProviderApp({ children }) {
  //   Lee el modo almacenado en localStorage o usa 'light' por defecto
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  //   Función para alternar tema
  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme); // guarda la elección
      return newTheme;
    });
  };

  //   Mantiene sincronizado el valor del localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider theme={currentTheme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
