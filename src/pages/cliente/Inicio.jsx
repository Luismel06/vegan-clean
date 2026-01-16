// src/pages/cliente/Inicio.jsx
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../supabase/supabase.config.jsx";
import { Wrench, ShieldCheck, Clock, ArrowRight } from "lucide-react";

// ========== WRAPPER PRINCIPAL ==========
const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  padding-top: 4rem; /* ← FIX para que no se pegue al header */
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? "linear-gradient(180deg, #02070b, #07131d, #0a1824)"
      : "linear-gradient(180deg, #f4fbff, #eef7ff, #eaf3ff)"};
  color: ${({ theme }) => theme.text};
  background: linear-gradient(180deg, #3a712dad, rgb(51 53 51 / 65%), #0136abb5);
  font-family: "Inter", sans-serif;
`;

// ========== CONTENIDO ==========
const Container = styled.div`
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
`;

// ========== HERO ==========
const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 3rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Title = styled(motion.h1)`
  font-size: 2.7rem;
  font-weight: 800;
  line-height: 1.15;
  color: ${({ theme }) => (theme.mode === "dark" ? "#0591e9" : "#feffff")};

  span {
    display: block;
    color: ${({ theme }) => (theme.mode === "dark" ? "#ffffff" : "#0591e9")};
  }

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const Subtitle = styled(motion.p)`
  margin-top: 1rem;
  opacity: 0.9;
  max-width: 550px;
  font-size: 1rem;
  line-height: 1.7;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 1.2rem 0;
`;

const Badge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? "rgba(0, 160, 255, 0.16)"
      : "rgba(0, 160, 255, 0.10)"};
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? "rgba(0, 200, 120, 0.35)"
        : "rgba(0, 200, 120, 0.40)"};
  color: ${({ theme }) => theme.accent};
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.7rem;
  flex-wrap: wrap;
`;

const BtnPrimary = styled(Link)`
  background: ${({ theme }) => theme.accent};
  padding: 0.85rem 1.7rem;
  color: #000000;
  border-radius: 999px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(0, 160, 255, 0.32);
  transition: 0.25s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const BtnSecondary = styled.button`
  padding: 0.85rem 1.5rem;
  background: transparent;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.cardBackground};
  }
`;

const KPIRow = styled.div`
  margin-top: 1.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  font-size: 0.9rem;
`;

const KPI = styled.div`
  strong {
    color: ${({ theme }) => theme.accent};
    display: block;
    font-size: 1.15rem;
  }
`;

// ========== HERO MEDIA ==========
const MediaCard = styled.div`
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.35);
`;

const VideoBg = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: #60876063;
  color: white;
`;

const OverlayLogo = styled.img`
  width: 70px;
  margin-bottom: 0.5rem;
`;

const OverlayTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.3rem;
`;

const OverlayText = styled.p`
  opacity: 0.9;
  font-size: 0.85rem;
  margin: 0;
`;

// ========== FEATURES ==========
const Features = styled.section`
  margin-top: 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.3rem 1rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  display: flex;
  gap: 0.7rem;
  align-items: start;
`;

const IconBox = styled.div`
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? "rgba(0, 200, 120, 0.18)"
      : "rgba(0, 200, 120, 0.12)"};
  padding: 0.5rem;
  border-radius: 999px;
`;

// ========== SERVICIOS ==========
const ServicesSection = styled.section`
  margin-top: 3rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.accent};
  }

  p {
    font-size: 0.85rem;
    opacity: 0.7;
    margin: 0;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
`;

const ServiceCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.2rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};

  h4 {
    margin: 0;
    color: ${({ theme }) => theme.accent};
  }

  p {
    opacity: 0.85;
    margin: 0.4rem 0;
  }

  small {
    opacity: 0.7;
  }
`;

const SeeAll = styled(Link)`
  color: ${({ theme }) => theme.accent};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
`;

// ========== STEPS ==========
const Steps = styled.section`
  margin-top: 3.5rem;
  padding: 1.5rem;
  border-radius: 20px;
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.05)"};
`;

const StepList = styled.ol`
  margin-left: 1.2rem;

  li + li {
    margin-top: 0.4rem;
  }
`;

export default function Inicio() {
  const [servicios, setServicios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("servicios")
      .select("*")
      .order("id", { ascending: true })
      .then(({ data }) => {
        if (data) setServicios(data.slice(0, 4));
      });
  }, []);

  return (
    <Wrapper>
      <Container>
        {/* HERO */}
        <Hero>
          <div>
            <Title>
              Productos de limpieza profesional{" "}
              <span>para empresas y comercios</span>
              (Hoteles | Restaurantes | Hospitales).
            </Title>

            <Subtitle>
              Suministro de insumos, asesoría y reposición para que tu operación se
              mantenga impecable: higiene, desinfección y limpieza industrial.
            </Subtitle>

            <BadgeRow>
              <Badge>Insumos industriales</Badge>
              <Badge>Entrega y reposición</Badge>
              <Badge>Asesoría de uso</Badge>
            </BadgeRow>

            <Actions>
              <BtnPrimary to="/servicios">
                Ver productos <ArrowRight size={16} />
              </BtnPrimary>

            </Actions>

            <KPIRow>
              <KPI><strong>Calidad</strong>Productos confiables</KPI>
              <KPI><strong>+50</strong>Clientes atendidos</KPI>
              <KPI><strong>Stock</strong>Reposición continua</KPI>
            </KPIRow>
          </div>

          {/* HERO MEDIA */}
          <MediaCard>
            <VideoBg
              autoPlay
              muted
              loop
              playsInline
              src="https://videos.pexels.com/video-files/856184/856184-hd_1920_1080_24fps.mp4"
            />

            <Overlay>
              <OverlayLogo src="/logo_veganclean.png" alt="logo" />

              <OverlayTitle>Higiene que se nota</OverlayTitle>
              <OverlayText>
                Jabón de manos, desinfectantes, detergentes y soluciones para alto
                tráfico.
              </OverlayText>
              <OverlayText style={{ fontSize: "0.78rem", marginTop: "0.4rem" }}>
                ✓ Recomendación · ✓ Suministro · ✓ Seguimiento
              </OverlayText>
            </Overlay>
          </MediaCard>
        </Hero>

        {/* FEATURES */}
        <Features>
          <FeatureCard>
            <IconBox><Wrench size={18} /></IconBox>
            <div>
              <h4>Asesoría y dosificación</h4>
              <p>Te ayudamos a elegir y aplicar el producto correcto.</p>
            </div>
          </FeatureCard>

          <FeatureCard>
            <IconBox><ShieldCheck size={18} /></IconBox>
            <div>
              <h4>Calidad y seguridad</h4>
              <p>Soluciones pensadas para entornos exigentes.</p>
            </div>
          </FeatureCard>

          <FeatureCard>
            <IconBox><Clock size={18} /></IconBox>
            <div>
              <h4>Entrega y reposición</h4>
              <p>Disponibilidad y despacho para tu operación diaria.</p>
            </div>
          </FeatureCard>
        </Features>

        {/* SERVICIOS */}
        <ServicesSection>
          <SectionHeader>
            <div>
              <h3>Productos principales</h3>
              <p>Lo más solicitado por nuestros clientes.</p>
            </div>

            <SeeAll to="/servicios">
              Ver todos <ArrowRight size={14} />
            </SeeAll>
          </SectionHeader>

          <ServicesGrid>
            {servicios.length === 0 ? (
              <p>Cargando productos...</p>
            ) : (
              servicios.map((s) => (
                <ServiceCard key={s.id}>
                  <h4>{s.nombre}</h4>
                  <p>{s.descripcion}</p>
                  {s.precio && (
                    <small>Desde RD$ {Number(s.precio).toLocaleString()}</small>
                  )}
                </ServiceCard>
              ))
            )}
          </ServicesGrid>
        </ServicesSection>
      </Container>
    </Wrapper>
  );
}
