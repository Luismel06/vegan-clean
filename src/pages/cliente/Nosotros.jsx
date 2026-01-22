// src/pages/cliente/Nosotros.jsx
import { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ShieldCheck, Users, Target, ArrowRight, Leaf } from "lucide-react";

/* =========================
   Motion
========================= */
const floatIn = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.06 * i, ease: [0.21, 0.98, 0.24, 1] },
  }),
};

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

/* =========================
   Shell
========================= */
const Wrapper = styled.section`
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
    height: 380px;
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
  padding: 5.25rem 1.25rem 3rem;

  @media (max-width: 768px) {
    padding: 4.75rem 1rem 2.5rem;
  }
`;

/* =========================
   Header
========================= */
const Header = styled.div`
  display: grid;
  gap: 0.9rem;
  max-width: 80ch;
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
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.86 : 0.9)};
  line-height: 1.7;
  font-size: 1rem;
`;

/* =========================
   Hero Card
========================= */
const Hero = styled(motion.section)`
  margin-top: 1.6rem;
  width: 100%;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  box-shadow: 0 18px 45px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.22 : 0.10)});
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const HeroMedia = styled.div`
  position: relative;
  min-height: 320px;
  background: ${({ theme }) => (theme.mode === "dark" ? "#0b1220" : "#f3f6fb")};

  @media (max-width: 980px) {
    min-height: 260px;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(60% 60% at 30% 25%, rgba(22, 163, 74, 0.22) 0%, transparent 60%),
      linear-gradient(180deg, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.55) 100%);
    pointer-events: none;
  }
`;

const HeroImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const HeroContent = styled.div`
  padding: 1.35rem 1.35rem 1.5rem;
  display: grid;
  align-content: center;
  gap: 0.85rem;

  @media (max-width: 520px) {
    padding: 1.15rem;
  }
`;

const HeroTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  padding: 0.42rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.text};
  font-weight: 900;
  font-size: 0.84rem;
`;

const HeroH2 = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 950;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.heading};
`;

const HeroText = styled.p`
  margin: 0;
  line-height: 1.75;
  font-size: 0.98rem;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.86 : 0.9)};

  strong {
    color: ${({ theme }) => theme.heading};
    font-weight: 950;
  }
`;

const HeroCTA = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  padding: 0.75rem 0.95rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.accent};
  text-decoration: none;
  font-weight: 950;
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

/* =========================
   Values / Mission / Vision
========================= */
const Section = styled.section`
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.heading};
`;

const SectionSub = styled.p`
  margin: 0.35rem 0 0;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.9)};
  line-height: 1.65;
  max-width: 85ch;
`;

const Cards = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.article)`
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  padding: 1.15rem 1.1rem 1.2rem;
  box-shadow: 0 16px 40px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.10)});
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 20px 46px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.22 : 0.12)});
  }

  h3 {
    margin: 0.75rem 0 0;
    font-size: 1.05rem;
    font-weight: 950;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.heading};
  }

  p {
    margin: 0.5rem 0 0;
    font-size: 0.95rem;
    line-height: 1.65;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.9)};
  }
`;

const CardIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.accent};
`;

/* =========================
   Timeline
========================= */
const TimelineWrap = styled.section`
  margin-top: 1.75rem;
`;

const TimelineTitle = styled.h2`
  margin: 0;
  text-align: center;
  color: ${({ theme }) => theme.heading};
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.01em;
`;

const Timeline = styled.div`
  margin: 1.1rem auto 0;
  width: min(920px, 100%);
  position: relative;
  padding-left: 2.1rem;

  &::before {
    content: "";
    position: absolute;
    left: 18px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${({ theme }) => theme.accent};
    border-radius: 999px;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    padding-left: 1.6rem;

    &::before {
      left: 10px;
    }
  }
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 1.1rem;
  padding: 0.95rem 1rem 1rem 1.15rem;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  box-shadow: 0 14px 32px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.14 : 0.08)});

  &::before {
    content: "";
    position: absolute;
    left: -15px;
    top: 18px;
    width: 12px;
    height: 12px;
    background-color: ${({ theme }) => theme.accent};
    border-radius: 50%;
    box-shadow: 0 0 0 5px ${({ theme }) => theme.background};
  }

  @media (max-width: 768px) {
    &::before {
      left: -13px;
    }
  }

  h4 {
    margin: 0;
    color: ${({ theme }) => theme.accent};
    font-weight: 950;
    letter-spacing: -0.01em;
    font-size: 0.98rem;
  }

  p {
    margin: 0.45rem 0 0;
    font-size: 0.95rem;
    line-height: 1.6;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.9)};
  }
`;

const YearPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.heading};
  font-weight: 950;
  font-size: 0.85rem;
`;

/* =========================
   Small Support (optional)
========================= */
const Note = styled.div`
  margin: 1.25rem auto 0;
  width: min(920px, 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.88 : 0.92)};
  font-weight: 850;

  svg {
    color: ${({ theme }) => theme.accent};
  }
`;

/* =========================
   Component
========================= */
export default function Nosotros() {
  const prefersReducedMotion = useReducedMotion();
  const motionProps = useMemo(() => {
    if (prefersReducedMotion) return { initial: false, animate: false };
    return { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.15 } };
  }, [prefersReducedMotion]);

  const timeline = [
    {
      year: "2019",
      text:
        "Inicio de Vega Clean, nace gracias a la visión y esfuerzo de su emprendedor fundador, con el objetivo de ofrecer insumos de limpieza de calidad y un servicio confiable para empresas y hogares.",
    },
    {
      year: "2026 - Actualidad",
      text:
        "Crecimiento sostenido, implementación de plataforma digital para solicitud de servicios y expansión de nuestra base de clientes en toda República Dominicana.",
    },
    {
      year: "Próximamente",
      text:
        "Planes de expansión hacia nuevas áreas tecnológicas, incluyendo automatización, IoT y soluciones inteligentes para empresas y hogares.",
    },
  ];

  return (
    <Wrapper>
      <Backdrop>
        <Container>
          {/* Header */}
          <Header>
            <Eyebrow as={motion.div} {...motionProps} variants={floatIn} custom={0}>
              <Dot aria-hidden="true" />
              Conoce nuestra historia
            </Eyebrow>

            <Title as={motion.h1} {...motionProps} variants={floatIn} custom={1}>
              Nosotros
            </Title>

            <Subtitle as={motion.p} {...motionProps} variants={floatIn} custom={2}>
              En Vega Clean trabajamos para que tu operación se mantenga impecable, con productos confiables,
              asesoría y reposición continua en toda República Dominicana.
            </Subtitle>
          </Header>

          {/* Hero */}
          <Hero as={motion.section} {...motionProps} variants={floatIn} custom={3}>
            <HeroMedia>
              <HeroImg src="/nosotros.png" alt="Equipo de trabajo" loading="eager" />
            </HeroMedia>

            <HeroContent>
              <HeroTitleRow>
                <HeroBadge>
                  <Leaf size={16} />
                  Higiene · Calidad · Servicio
                </HeroBadge>
                <HeroH2>Sobre Vega Clean</HeroH2>
              </HeroTitleRow>

              <HeroText>
                En <strong>Vega Clean</strong> nos especializamos en la fabricación, importación y distribución
                de insumos y equipos de limpieza para hogares, comercios e instituciones en toda República
                Dominicana. Nuestro compromiso es ofrecer productos de alta calidad que garanticen higiene,
                seguridad y excelentes resultados en cada uso.
              </HeroText>

              <HeroCTA href="/contacto">
                Contáctanos <ArrowRight size={16} />
              </HeroCTA>
            </HeroContent>
          </Hero>

          {/* Mission / Vision / Values */}
          <Section>
            <SectionTitle>Misión, visión y valores</SectionTitle>
            <SectionSub>
              Principios que guían nuestra forma de trabajar y cómo buscamos crecer con nuestros clientes.
            </SectionSub>

            <Cards>
              <Card as={motion.article} {...motionProps} variants={floatIn} custom={0}>
                <CardIcon aria-hidden="true">
                  <Target size={18} />
                </CardIcon>
                <h3>Misión</h3>
                <p>
                  Brindar insumos y equipos de limpieza de alta calidad, ofreciendo soluciones confiables y
                  eficientes para hogares, comercios e instituciones en República Dominicana, garantizando un
                  servicio ágil, atención personalizada y entregas oportunas.
                </p>
              </Card>

              <Card as={motion.article} {...motionProps} variants={floatIn} custom={1}>
                <CardIcon aria-hidden="true">
                  <ShieldCheck size={18} />
                </CardIcon>
                <h3>Visión</h3>
                <p>
                  Ser la empresa líder en distribución y fabricación de productos de limpieza en República
                  Dominicana, reconocida por la calidad de sus productos, su compromiso con la higiene y su
                  capacidad de adaptarse a las necesidades de clientes modernos y exigentes.
                </p>
              </Card>

              <Card as={motion.article} {...motionProps} variants={floatIn} custom={2}>
                <CardIcon aria-hidden="true">
                  <Users size={18} />
                </CardIcon>
                <h3>Valores</h3>
                <p>
                  <strong>• Calidad:</strong> Productos confiables que cumplen altos estándares.<br />
                  <strong>• Compromiso:</strong> Responsabilidad y seriedad en cada entrega y servicio.<br />
                  <strong>• Atención al cliente:</strong> Trato cercano, rápido y personalizado.<br />
                  <strong>• Integridad:</strong> Transparencia y confianza en cada relación comercial.<br />
                  <strong>• Innovación:</strong> Mejora constante en productos, procesos y servicio.
                </p>
              </Card>
            </Cards>
          </Section>

          {/* Timeline */}
          <TimelineWrap>
            <TimelineTitle>Nuestra historia</TimelineTitle>

            <Timeline>
              {timeline.map((item, index) => (
                <TimelineItem
                  key={index}
                  as={motion.div}
                  {...motionProps}
                  variants={floatIn}
                  custom={index}
                >
                  <YearPill>
                    <Sparkles size={14} />
                    {item.year}
                  </YearPill>
                  <p style={{ marginTop: "0.55rem" }}>{item.text}</p>
                </TimelineItem>
              ))}
            </Timeline>

            <Note>
              <Sparkles size={18} />
              Evolucionamos contigo: calidad, reposición y soporte continuo.
            </Note>
          </TimelineWrap>
        </Container>
      </Backdrop>
    </Wrapper>
  );
}
