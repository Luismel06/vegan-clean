// src/pages/cliente/Publicaciones.jsx
import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion, useReducedMotion } from "framer-motion";
import { mostrarPublicaciones } from "../../supabase/crudPublicaciones";
import PublicacionCard from "../../components/templates/PublicacionCard";
import { Loader2, Newspaper, RefreshCw, Search } from "lucide-react";

/* =========================
   Animations
========================= */
const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const floatIn = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.06 * i, ease: [0.21, 0.98, 0.24, 1] },
  }),
};

/* =========================
   Shell
========================= */
const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Backdrop = styled.div`
  position: relative;
  isolation: isolate;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: -40px -20px auto -20px;
    height: 360px;
    z-index: -1;
    background:
      radial-gradient(60% 85% at 20% 35%, ${({ theme }) => theme.accentSoft} 0%, transparent 62%),
      radial-gradient(55% 80% at 85% 10%, ${({ theme }) => theme.accentSoft} 0%, transparent 58%),
      linear-gradient(
        180deg,
        ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)")} 0%,
        transparent 70%
      );
    pointer-events: none;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 5.25rem 1.25rem 2.75rem;

  @media (max-width: 768px) {
    padding: 4.75rem 1rem 2.25rem;
  }
`;

/* =========================
   Header
========================= */
const Header = styled.div`
  display: grid;
  gap: 0.9rem;
`;

const Eyebrow = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  width: fit-content;
  padding: 0.42rem 0.8rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  font-size: 0.85rem;
  font-weight: 900;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.accent};
  box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled(motion.h1)`
  margin: 0;
  font-weight: 950;
  letter-spacing: -0.02em;
  line-height: 1.06;
  color: ${({ theme }) => theme.heading};
  font-size: clamp(1.9rem, 2vw + 1.1rem, 2.7rem);
`;

const Subtitle = styled(motion.p)`
  margin: 0;
  max-width: 75ch;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.86 : 0.9)};
  line-height: 1.7;
  font-size: 1rem;
`;

/* =========================
   Controls
========================= */
const Controls = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const ControlBtn = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  border-radius: 999px;
  padding: 0.65rem 0.9rem;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.accent};
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accentSoft};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchWrap = styled.div`
  position: relative;
  min-width: min(420px, 100%);

  @media (max-width: 520px) {
    min-width: 100%;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7;
  display: grid;
  place-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.78rem 0.95rem 0.78rem 2.55rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &::placeholder {
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

/* =========================
   Grid
========================= */
const Grid = styled.div`
  margin-top: 1.35rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

/* =========================
   Empty + Loading
========================= */
const Center = styled.div`
  margin-top: 2.5rem;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 0.65rem;
`;

const EmptyCard = styled(motion.div)`
  width: min(560px, 100%);
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  padding: 1.25rem;
  box-shadow: 0 16px 40px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.10)});

  h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 950;
    color: ${({ theme }) => theme.heading};
    letter-spacing: -0.01em;
  }

  p {
    margin: 0.45rem 0 0;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.9)};
    line-height: 1.6;
  }
`;

const LoadingWrap = styled.div`
  margin-top: 3.25rem;
  display: grid;
  place-items: center;
  gap: 0.8rem;
  color: ${({ theme }) => theme.accent};
`;

const Spinner = styled(Loader2)`
  animation: spin 0.9s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/* =========================
   Skeleton Cards (safe fallback)
   - PublicacionCard ya maneja imágenes/estilos, pero esto evita salto visual.
========================= */
const SkeletonCard = styled.div`
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  overflow: hidden;

  .shimmer {
    background: linear-gradient(
      90deg,
      ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")} 0%,
      ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)")} 50%,
      ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")} 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.35s ease infinite;
  }

  .img {
    aspect-ratio: 16 / 10;
  }

  .body {
    padding: 0.95rem 1rem 1.05rem;
  }

  .line {
    height: 12px;
    border-radius: 999px;
    margin-top: 0.65rem;
  }

  .w60 {
    width: 60%;
  }
  .w90 {
    width: 90%;
  }
`;

/* =========================
   Component
========================= */
export default function Publicaciones() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [query, setQuery] = useState("");

  const prefersReducedMotion = useReducedMotion();
  const motionProps = useMemo(() => {
    if (prefersReducedMotion) return { initial: false, animate: false };
    return { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.15 } };
  }, [prefersReducedMotion]);

  const cargarDatos = async (opts = { soft: false }) => {
    try {
      if (opts.soft) setReloading(true);
      else setLoading(true);

      const data = await mostrarPublicaciones();
      setPublicaciones(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };

  useEffect(() => {
    cargarDatos({ soft: false });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publicaciones;

    return publicaciones.filter((p) => {
      const t = String(p?.titulo || "").toLowerCase();
      const d = String(p?.descripcion || "").toLowerCase();
      return t.includes(q) || d.includes(q);
    });
  }, [publicaciones, query]);

  const skeletons = Array.from({ length: 6 });

  return (
    <Wrapper>
      <Backdrop>
        <Container>
          {/* Header */}
          <Header>
            <Eyebrow as={motion.div} {...motionProps} variants={floatIn} custom={0}>
              <Dot aria-hidden="true" />
              Novedades y trabajos recientes
            </Eyebrow>

            <TitleRow>
              <div>
                <Title as={motion.h1} {...motionProps} variants={floatIn} custom={1}>
                  Servicios recientes
                </Title>
                <Subtitle as={motion.p} {...motionProps} variants={floatIn} custom={2}>
                  Explora publicaciones y servicios realizados. Usa el buscador para encontrar rápidamente lo que necesitas.
                </Subtitle>
              </div>

              <Controls as={motion.div} {...motionProps} variants={floatIn} custom={3}>
                <SearchWrap>
                  <SearchIcon aria-hidden="true">
                    <Search size={16} />
                  </SearchIcon>
                  <SearchInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por título o descripción..."
                    aria-label="Buscar publicaciones"
                  />
                </SearchWrap>

                <ControlBtn
                  type="button"
                  onClick={() => cargarDatos({ soft: true })}
                  disabled={loading || reloading}
                  aria-label="Recargar publicaciones"
                  title="Recargar"
                >
                  <RefreshCw size={16} />
                  {reloading ? "Actualizando..." : "Actualizar"}
                </ControlBtn>
              </Controls>
            </TitleRow>
          </Header>

          {/* Content */}
          {loading ? (
            <>
              <LoadingWrap>
                <Spinner size={28} />
                <div style={{ fontWeight: 900, opacity: 0.95 }}>Cargando publicaciones...</div>
              </LoadingWrap>

              <Grid>
                {skeletons.map((_, idx) => (
                  <SkeletonCard key={`sk-${idx}`} aria-hidden="true">
                    <div className="shimmer img" />
                    <div className="body">
                      <div className="shimmer line w60" />
                      <div className="shimmer line w90" />
                      <div className="shimmer line w90" />
                    </div>
                  </SkeletonCard>
                ))}
              </Grid>
            </>
          ) : filtered.length === 0 ? (
            <Center>
              <EmptyCard as={motion.div} {...motionProps} variants={floatIn} custom={0}>
                <div style={{ display: "grid", placeItems: "center", gap: "0.65rem" }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid currentColor",
                      color: "inherit",
                      opacity: 0.9,
                    }}
                    aria-hidden="true"
                  >
                    <Newspaper size={18} />
                  </div>
                  <h3>No hay publicaciones para mostrar</h3>
                  <p>
                    {query.trim()
                      ? "No encontramos resultados con ese filtro. Prueba con otras palabras."
                      : "Aún no hay publicaciones disponibles. Vuelve más tarde o actualiza la página."}
                  </p>
                </div>
              </EmptyCard>

              <ControlBtn
                type="button"
                onClick={() => cargarDatos({ soft: true })}
                disabled={reloading}
              >
                <RefreshCw size={16} />
                Intentar de nuevo
              </ControlBtn>
            </Center>
          ) : (
            <Grid>
              {filtered.map((p, idx) => (
                <motion.div
                  key={p.id}
                  {...motionProps}
                  variants={floatIn}
                  custom={idx}
                  style={{ minWidth: 0 }}
                >
                  <PublicacionCard
                    titulo={p.titulo}
                    descripcion={p.descripcion}
                    fecha={p.fecha}
                    imagenes_publicacion={p.imagenes_publicacion} // se mantiene
                  />
                </motion.div>
              ))}
            </Grid>
          )}
        </Container>
      </Backdrop>
    </Wrapper>
  );
}
