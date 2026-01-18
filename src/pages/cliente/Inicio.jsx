// src/pages/cliente/Inicio.jsx
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../supabase/supabase.config.jsx";
import { Wrench, ShieldCheck, Clock, ArrowRight } from "lucide-react";

// ========== WRAPPER PRINCIPAL ==========
const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  padding-top: 4rem; /* ← FIX para que no se pegue al header */
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
  width: 100%;
  margin-top: auto;
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

// ========== SECCIONES ==========
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
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  transition: 0.25s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 175px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => (theme.mode === "dark" ? "#0b1220" : "#f3f6fb")};
`;

const ProductName = styled.h4`
  margin: 0.85rem 0 0;
  color: ${({ theme }) => theme.accent};
  font-weight: 800;
  font-size: 1rem;
  line-height: 1.2;
`;
const ProductDesc = styled.p`
  margin: 0.45rem 0 0;
  opacity: 0.9;
  font-size: 0.92rem;
  line-height: 1.45;
`;


const SeeAll = styled(Link)`
  color: ${({ theme }) => theme.accent};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
`;

const MediaBg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;


// ===== Helper: obtener URL pública desde Storage (bucket público) =====
function getPublicImageUrl(bucket, path) {
  if (!path) return "";
  // Si ya viene una URL completa, la devolvemos tal cual.
  if (/^https?:\/\//i.test(path)) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || "";
}

export default function Inicio() {
  const [productos, setProductos] = useState([]);
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    // Productos (bucket: productos)
    supabase
      .from("productos")
      .select("id, nombre, descripcion, imagen_url")
      .order("id", { ascending: true })
      .limit(4)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error cargando productos:", error);
          return;
        }
        setProductos(data || []);
      });

    // Equipos (bucket: equipos)
    supabase
      .from("equipos")
      .select("id, nombre, descripcion, imagen_url")
      .order("id", { ascending: true })
      .limit(4)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error cargando equipos:", error);
          return;
        }
        setEquipos(data || []);
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
              {/* Ajusta la ruta si tu página de productos es otra */}
              <BtnPrimary to="/servicios">
                Ver productos <ArrowRight size={16} />
              </BtnPrimary>
            </Actions>

            <KPIRow>
              <KPI>
                <strong>Calidad</strong>Productos confiables
              </KPI>
              <KPI>
                <strong>+50</strong>Clientes atendidos
              </KPI>
              <KPI>
                <strong>Stock</strong>Reposición continua
              </KPI>
            </KPIRow>
          </div>

          {/* HERO MEDIA */}
          <MediaCard>
  <MediaBg src="/inicio.png" alt="Vega Clean" />
  <Overlay>
    <OverlayTitle>Higiene que se nota</OverlayTitle>
    <OverlayText>
      Jabón de manos, desinfectantes, detergentes y soluciones para alto tráfico.
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
            <IconBox>
              <Wrench size={18} />
            </IconBox>
            <div>
              <h4>Asesoría y dosificación</h4>
              <p>Te ayudamos a elegir y aplicar el producto correcto.</p>
            </div>
          </FeatureCard>

          <FeatureCard>
            <IconBox>
              <ShieldCheck size={18} />
            </IconBox>
            <div>
              <h4>Calidad y seguridad</h4>
              <p>Soluciones pensadas para entornos exigentes.</p>
            </div>
          </FeatureCard>

          <FeatureCard>
            <IconBox>
              <Clock size={18} />
            </IconBox>
            <div>
              <h4>Entrega y reposición</h4>
              <p>Disponibilidad y despacho para tu operación diaria.</p>
            </div>
          </FeatureCard>
        </Features>

        {/* PRODUCTOS */}
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
            {productos.length === 0 ? (
              <p>Cargando productos...</p>
            ) : (
              productos.map((p) => {
                const img = getPublicImageUrl("productos", p.imagen_url);
                return (
                  <ServiceCard key={p.id}>
                    <ProductImage
                      src={img || "/placeholder-producto.png"}
                      alt={p.nombre || "producto"}
                      loading="lazy"
                    />
                    <ProductName>{p.nombre}</ProductName>
                    {p.descripcion && <ProductDesc>{p.descripcion}</ProductDesc>}
                  </ServiceCard>
                );
              })
            )}
          </ServicesGrid>
        </ServicesSection>

        {/* EQUIPOS */}
        <ServicesSection>
          <SectionHeader>
            <div>
              <h3>Equipos principales</h3>
              <p>Equipos recomendados para complementar tu operación.</p>
            </div>

            <SeeAll to="/servicios">
              Ver todos <ArrowRight size={14} />
            </SeeAll>
          </SectionHeader>

          <ServicesGrid>
            {equipos.length === 0 ? (
              <p>Cargando equipos...</p>
            ) : (
              equipos.map((e) => {
                const img = getPublicImageUrl("equipos", e.imagen_url);
                return (
                  <ServiceCard key={e.id}>
                    <ProductImage
                      src={img || "/placeholder-equipo.png"}
                      alt={e.nombre || "equipo"}
                      loading="lazy"
                    />
                    <ProductName>{e.nombre}</ProductName>
                    {e.descripcion && <ProductDesc>{e.descripcion}</ProductDesc>}
                  </ServiceCard>
                );
              })
            )}
          </ServicesGrid>
        </ServicesSection>
      </Container>
    </Wrapper>
  );
}
