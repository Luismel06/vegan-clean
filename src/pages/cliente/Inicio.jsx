// src/pages/cliente/Inicio.jsx
import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { supabase } from "../../supabase/supabase.config.jsx";
import { Wrench, ShieldCheck, Clock, ArrowRight } from "lucide-react";

/* =========================
   Util: Storage public URL
========================= */
function getPublicImageUrl(bucket, path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || "";
}

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
   Layout + Background
========================= */
const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  font-family: "Manrope", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
`;

const TopBackdrop = styled.div`
  position: relative;
  isolation: isolate;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: -40px -20px auto -20px;
    height: 420px;
    z-index: -1;
    background:
      radial-gradient(60% 80% at 20% 30%, ${({ theme }) => theme.accentSoft} 0%, transparent 60%),
      radial-gradient(55% 75% at 80% 10%, ${({ theme }) => theme.accentSoft} 0%, transparent 55%),
      linear-gradient(
        180deg,
        ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)")} 0%,
        transparent 65%
      );
    filter: blur(0px);
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
   Hero
========================= */
const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 2.25rem;
  align-items: center;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const HeroCopy = styled.div`
  min-width: 0;
`;

const Eyebrow = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.2px;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.accent};
  box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
`;

const Title = styled(motion.h1)`
  margin: 0.9rem 0 0;
  font-weight: 950;
  letter-spacing: -0.02em;
  line-height: 1.06;
  color: ${({ theme }) => theme.heading};
  font-size: clamp(2.05rem, 2.2vw + 1.35rem, 3.05rem);

  span {
    display: block;
    color: ${({ theme }) => theme.text};
    font-weight: 900;
    opacity: 0.96;
  }
`;

const Subtitle = styled(motion.p)`
  margin: 0.95rem 0 0;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.88 : 0.92)};
  max-width: 62ch;
  font-size: 1rem;
  line-height: 1.75;
`;

const BadgeRow = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.2rem 0 0;
`;

const Badge = styled.span`
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  background: ${({ theme }) => theme.accentSoft};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const Actions = styled(motion.div)`
  display: flex;
  gap: 0.8rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
`;

const BtnBase = styled(Link)`
  appearance: none;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.88rem 1.15rem;
  font-weight: 850;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease, background 0.18s ease,
    border-color 0.18s ease;
  will-change: transform;

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accentSoft};
    outline-offset: 3px;
  }
`;

const BtnPrimary = styled(BtnBase)`
  background: ${({ theme }) => theme.accent};
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);

  &:hover {
    transform: translateY(-2px);
    opacity: 0.98;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.16);
  }
`;

const BtnGhost = styled(BtnBase)`
  background: ${({ theme }) => theme.surface};
  border-color: ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.accent};
  }
`;

const KPIRow = styled(motion.div)`
  margin-top: 1.35rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const KPI = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 0.9rem 0.95rem;

  strong {
    color: ${({ theme }) => theme.accent};
    display: block;
    font-size: 1.05rem;
    line-height: 1.15;
    font-weight: 900;
    margin-bottom: 0.25rem;
    letter-spacing: -0.01em;
  }

  span {
    font-size: 0.92rem;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.86 : 0.9)};
  }
`;

/* =========================
   Hero Media
========================= */
const MediaCard = styled(motion.div)`
  border-radius: 22px;
  overflow: hidden;
  position: relative;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  box-shadow: 0 18px 45px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.28 : 0.12)});

  @media (max-width: 980px) {
    min-height: 260px;
  }
`;

const MediaBg = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transform: scale(1.02);
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: white;

  background:
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0.55) 78%,
      rgba(0, 0, 0, 0.75) 100%
    ),
    radial-gradient(60% 60% at 30% 30%, rgba(22, 163, 74, 0.28) 0%, transparent 60%);
`;

const OverlayTitle = styled.h3`
  margin: 0;
  font-size: 1.08rem;
  font-weight: 900;
  letter-spacing: -0.01em;
`;

const OverlayText = styled.p`
  margin: 0.35rem 0 0;
  opacity: 0.92;
  font-size: 0.9rem;
  line-height: 1.45;
`;

/* =========================
   Features
========================= */
const Features = styled.section`
  margin-top: 2.4rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  padding: 1.1rem 1.05rem;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.border};
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  min-width: 0;

  h4 {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 900;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.heading};
  }

  p {
    margin: 0.35rem 0 0;
    font-size: 0.92rem;
    line-height: 1.5;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.86 : 0.9)};
  }
`;

const IconBox = styled.div`
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.accent};
  border: 1px solid ${({ theme }) => theme.border};
`;

/* =========================
   Sections + Cards
========================= */
const ServicesSection = styled.section`
  margin-top: 2.7rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.heading};
    font-weight: 950;
    letter-spacing: -0.02em;
    font-size: 1.25rem;
  }

  p {
    margin: 0.35rem 0 0;
    font-size: 0.92rem;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.88)};
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const HeaderLeft = styled.div`
  min-width: 0;
`;

const SeeAll = styled(Link)`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.accent};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 850;
  font-size: 0.92rem;
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  transition: transform 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.accent};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accentSoft};
    outline-offset: 3px;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled(motion.article)`
  background: ${({ theme }) => theme.surface};
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 14px 32px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.22 : 0.10)});
  }
`;

const ImgWrap = styled.div`
  position: relative;
  aspect-ratio: 16 / 10;
  background: ${({ theme }) => (theme.mode === "dark" ? "#0b1220" : "#f3f6fb")};
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardBody = styled.div`
  padding: 0.95rem 0.95rem 1.05rem;
`;

const ProductName = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.heading};
  font-weight: 950;
  font-size: 1rem;
  line-height: 1.25;
  letter-spacing: -0.01em;
`;

const ProductDesc = styled.p`
  margin: 0.5rem 0 0;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.9)};
  font-size: 0.92rem;
  line-height: 1.5;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SkeletonCard = styled.div`
  border-radius: 18px;
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
    padding: 0.95rem;
  }

  .line {
    height: 12px;
    border-radius: 999px;
    margin-top: 0.6rem;
  }

  .line.w60 {
    width: 60%;
  }
  .line.w90 {
    width: 90%;
  }
`;

/* =========================
   Component
========================= */
export default function Inicio() {
  const [productos, setProductos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingEquipos, setLoadingEquipos] = useState(true);

  const prefersReducedMotion = useReducedMotion();

  const motionProps = useMemo(() => {
    if (prefersReducedMotion) return { initial: false, animate: false };
    return { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.2 } };
  }, [prefersReducedMotion]);

  useEffect(() => {
    let mounted = true;

    setLoadingProductos(true);
    supabase
      .from("productos")
      .select("id, nombre, descripcion, imagen_url")
      .order("id", { ascending: true })
      .limit(4)
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("Error cargando productos:", error);
          setProductos([]);
        } else {
          setProductos(data || []);
        }
        setLoadingProductos(false);
      });

    setLoadingEquipos(true);
    supabase
      .from("equipos")
      .select("id, nombre, descripcion, imagen_url")
      .order("id", { ascending: true })
      .limit(4)
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("Error cargando equipos:", error);
          setEquipos([]);
        } else {
          setEquipos(data || []);
        }
        setLoadingEquipos(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const skeletons = Array.from({ length: 4 });

  return (
    <Wrapper>
      <TopBackdrop>
        <Container>
          {/* HERO */}
          <Hero>
            <HeroCopy>
              <Eyebrow
                as={motion.div}
                {...motionProps}
                variants={floatIn}
                custom={0}
                aria-label="Propuesta de valor"
              >
                <Dot aria-hidden="true" />
                Higiene profesional para alto tráfico
              </Eyebrow>

              <Title as={motion.h1} {...motionProps} variants={floatIn} custom={1}>
                Productos de limpieza profesional{" "}
                <span>para empresas y comercios</span>
                (Hoteles | Restaurantes | Hospitales).
              </Title>

              <Subtitle as={motion.p} {...motionProps} variants={floatIn} custom={2}>
                Suministro de insumos, asesoría y reposición para que tu operación se mantenga impecable:
                higiene, desinfección y limpieza industrial.
              </Subtitle>

              <BadgeRow as={motion.div} {...motionProps} variants={floatIn} custom={3}>
                <Badge>Insumos industriales</Badge>
                <Badge>Entrega y reposición</Badge>
                <Badge>Asesoría de uso</Badge>
              </BadgeRow>

              <Actions as={motion.div} {...motionProps} variants={floatIn} custom={4}>
                <BtnPrimary to="/servicios">
                  Ver productos <ArrowRight size={16} />
                </BtnPrimary>
                <BtnGhost to="/contacto">Contáctanos</BtnGhost>
              </Actions>

              <KPIRow as={motion.div} {...motionProps} variants={floatIn} custom={5}>
                <KPI>
                  <strong>Calidad</strong>
                  <span>Productos confiables</span>
                </KPI>
                <KPI>
                  <strong>+50</strong>
                  <span>Clientes atendidos</span>
                </KPI>
                <KPI>
                  <strong>Stock</strong>
                  <span>Reposición continua</span>
                </KPI>
              </KPIRow>
            </HeroCopy>

            {/* HERO MEDIA */}
            <MediaCard
              {...motionProps}
              variants={floatIn}
              custom={2}
              aria-label="Imagen principal"
            >
              <MediaBg src="/inicio.png" alt="Vega Clean" loading="eager" />
              <Overlay>
                <OverlayTitle>Higiene que se nota</OverlayTitle>
                <OverlayText>
                  Jabón de manos, desinfectantes, detergentes y soluciones para alto tráfico.
                </OverlayText>
                <OverlayText style={{ fontSize: "0.82rem", marginTop: "0.55rem" }}>
                  ✓ Recomendación · ✓ Suministro · ✓ Seguimiento
                </OverlayText>
              </Overlay>
            </MediaCard>
          </Hero>

          {/* FEATURES */}
          <Features>
            <FeatureCard as={motion.div} {...motionProps} variants={floatIn} custom={0}>
              <IconBox aria-hidden="true">
                <Wrench size={18} />
              </IconBox>
              <div>
                <h4>Asesoría y dosificación</h4>
                <p>Te ayudamos a elegir y aplicar el producto correcto para tu operación.</p>
              </div>
            </FeatureCard>

            <FeatureCard as={motion.div} {...motionProps} variants={floatIn} custom={1}>
              <IconBox aria-hidden="true">
                <ShieldCheck size={18} />
              </IconBox>
              <div>
                <h4>Calidad y seguridad</h4>
                <p>Soluciones pensadas para entornos exigentes y uso continuo.</p>
              </div>
            </FeatureCard>

            <FeatureCard as={motion.div} {...motionProps} variants={floatIn} custom={2}>
              <IconBox aria-hidden="true">
                <Clock size={18} />
              </IconBox>
              <div>
                <h4>Entrega y reposición</h4>
                <p>Disponibilidad y despacho para mantener tu stock siempre al día.</p>
              </div>
            </FeatureCard>
          </Features>

          {/* PRODUCTOS */}
          <ServicesSection>
            <SectionHeader>
              <HeaderLeft>
                <h3>Productos principales</h3>
                <p>Lo más solicitado por nuestros clientes.</p>
              </HeaderLeft>

              <SeeAll to="/servicios" aria-label="Ver todos los productos">
                Ver todos <ArrowRight size={14} />
              </SeeAll>
            </SectionHeader>

            <ServicesGrid>
              {loadingProductos
                ? skeletons.map((_, idx) => (
                    <SkeletonCard key={`prod-skel-${idx}`} aria-hidden="true">
                      <div className="shimmer img" />
                      <div className="body">
                        <div className="shimmer line w60" />
                        <div className="shimmer line w90" />
                        <div className="shimmer line w90" />
                      </div>
                    </SkeletonCard>
                  ))
                : productos.length === 0
                ? (
                  <div style={{ opacity: 0.85, padding: "0.75rem 0.25rem" }}>
                    No hay productos para mostrar en este momento.
                  </div>
                )
                : productos.map((p, idx) => {
                    const img = getPublicImageUrl("productos", p.imagen_url);
                    return (
                      <ServiceCard
                        key={p.id}
                        as={motion.article}
                        {...motionProps}
                        variants={floatIn}
                        custom={idx}
                      >
                        <ImgWrap>
                          <ProductImage
                            src={img || "/placeholder-producto.png"}
                            alt={p.nombre || "Producto"}
                            loading="lazy"
                          />
                        </ImgWrap>
                        <CardBody>
                          <ProductName>{p.nombre}</ProductName>
                          {p.descripcion ? <ProductDesc>{p.descripcion}</ProductDesc> : null}
                        </CardBody>
                      </ServiceCard>
                    );
                  })}
            </ServicesGrid>
          </ServicesSection>

          {/* EQUIPOS */}
          <ServicesSection>
            <SectionHeader>
              <HeaderLeft>
                <h3>Equipos principales</h3>
                <p>Equipos recomendados para complementar tu operación.</p>
              </HeaderLeft>

              <SeeAll to="/servicios" aria-label="Ver todos los equipos">
                Ver todos <ArrowRight size={14} />
              </SeeAll>
            </SectionHeader>

            <ServicesGrid>
              {loadingEquipos
                ? skeletons.map((_, idx) => (
                    <SkeletonCard key={`eq-skel-${idx}`} aria-hidden="true">
                      <div className="shimmer img" />
                      <div className="body">
                        <div className="shimmer line w60" />
                        <div className="shimmer line w90" />
                        <div className="shimmer line w90" />
                      </div>
                    </SkeletonCard>
                  ))
                : equipos.length === 0
                ? (
                  <div style={{ opacity: 0.85, padding: "0.75rem 0.25rem" }}>
                    No hay equipos para mostrar en este momento.
                  </div>
                )
                : equipos.map((e, idx) => {
                    const img = getPublicImageUrl("equipos", e.imagen_url);
                    return (
                      <ServiceCard
                        key={e.id}
                        as={motion.article}
                        {...motionProps}
                        variants={floatIn}
                        custom={idx}
                      >
                        <ImgWrap>
                          <ProductImage
                            src={img || "/placeholder-equipo.png"}
                            alt={e.nombre || "Equipo"}
                            loading="lazy"
                          />
                        </ImgWrap>
                        <CardBody>
                          <ProductName>{e.nombre}</ProductName>
                          {e.descripcion ? <ProductDesc>{e.descripcion}</ProductDesc> : null}
                        </CardBody>
                      </ServiceCard>
                    );
                  })}
            </ServicesGrid>
          </ServicesSection>
        </Container>
      </TopBackdrop>
    </Wrapper>
  );
}
