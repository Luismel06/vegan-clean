// src/pages/cliente/Contacto.jsx
import { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { motion, useReducedMotion } from "framer-motion";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";

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
   Page Shell
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
    pointer-events: none;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1120px;
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
  gap: 0.65rem;
  max-width: 70ch;
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
  font-weight: 800;
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
  font-size: clamp(2rem, 2.1vw + 1.2rem, 2.8rem);
`;

const Subtitle = styled(motion.p)`
  margin: 0;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.86 : 0.9)};
  line-height: 1.7;
  font-size: 1rem;
`;

/* =========================
   Layout Grid
========================= */
const Grid = styled.div`
  margin-top: 1.75rem;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

/* =========================
   Cards + Info
========================= */
const Panel = styled(motion.div)`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.22 : 0.10)});
`;

const PanelHead = styled.div`
  padding: 1.1rem 1.15rem 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;

  h2 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 950;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.heading};
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.88)};
  }

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PanelBody = styled.div`
  padding: 1rem 1.15rem 1.15rem;
`;

const InfoList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled(motion.div)`
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? "rgba(255,255,255,0.03)"
      : "rgba(255,255,255,0.75)"};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 18px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  min-width: 0;

  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 14px 30px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.08)});
  }

  h3 {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 950;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.heading};
  }

  p {
    margin: 0.35rem 0 0;
    font-size: 0.92rem;
    line-height: 1.45;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.9)};
    word-break: break-word;
  }

  a {
    color: ${({ theme }) => theme.text};
    text-decoration: none;
    font-weight: 800;
  }

  a:hover {
    color: ${({ theme }) => theme.accent};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const IconBox = styled.div`
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.accent};
  border: 1px solid ${({ theme }) => theme.border};
`;

const InlineMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.9rem;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SmallHint = styled.div`
  font-size: 0.9rem;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.88)};
  line-height: 1.5;
`;

const ActionLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 0.85rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.accent};
  text-decoration: none;
  font-weight: 900;
  font-size: 0.92rem;
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
   Form
========================= */
const Form = styled(motion.form)`
  display: grid;
  gap: 0.9rem;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 0.45rem;

  label {
    font-size: 0.9rem;
    font-weight: 850;
    color: ${({ theme }) => theme.heading};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 0.95rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

  &::placeholder {
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.85rem 0.95rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  resize: vertical;
  min-height: 140px;
  max-height: 260px;
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

const BtnRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const BtnPrimary = styled.button`
  background: ${({ theme }) => theme.accent};
  color: #fff;
  border: 1px solid transparent;
  padding: 0.9rem 1.15rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;

  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);

  &:hover {
    transform: translateY(-2px);
    opacity: 0.98;
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.16);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accentSoft};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
  }
`;

const MutedNote = styled.div`
  font-size: 0.88rem;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.84 : 0.88)};
  line-height: 1.45;
`;

/* =========================
   Map
========================= */
const MapContainer = styled(motion.div)`
  width: 100%;
  height: 350px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  box-shadow: 0 16px 40px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.10)});
`;

const MapSkeleton = styled.div`
  width: 100%;
  height: 100%;

  background: linear-gradient(
    90deg,
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")} 0%,
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)")} 50%,
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.35s ease infinite;
`;

/* =========================
   Component
========================= */
export default function Contacto() {
  const prefersReducedMotion = useReducedMotion();

  const motionProps = useMemo(() => {
    if (prefersReducedMotion) return { initial: false, animate: false };
    return { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.2 } };
  }, [prefersReducedMotion]);

  // Ajusta aquí tus datos reales
  const phoneDisplay = "+1 (809) 365-6666";
  const phoneHref = "tel:+18093656666";

  const emailDisplay = "modificarcorreo@gmail.com";
  const emailHref = "mailto:modificarcorreo@gmail.com";

  const addressDisplay = "Calle garcia godoy, La Vega 41000";
  const mapsLink =
    "https://www.google.com/maps?q=Calle%20garcia%20godoy%2C%20La%20Vega%2041000";
  return (
    <Wrapper>
      <Backdrop>
        <Container>
          {/* Header */}
          <Header>
            <Eyebrow as={motion.div} {...motionProps} variants={floatIn} custom={0}>
              <Dot aria-hidden="true" />
              Respuesta rápida
            </Eyebrow>

            <Title as={motion.h1} {...motionProps} variants={floatIn} custom={1}>
              Contáctanos
            </Title>

            <Subtitle as={motion.p} {...motionProps} variants={floatIn} custom={2}>
              Estamos aquí para ayudarte. Escríbenos y te orientamos con productos, dosificación y reposición.
            </Subtitle>
          </Header>

          {/* Main Grid */}
          <Grid>
            {/* Left: Contact + Form */}
            <Panel as={motion.div} {...motionProps} variants={floatIn} custom={3}>
              <PanelHead>
                <div>
                  <h2>Información y mensaje</h2>
                  <p>Elige el canal que prefieras</p>
                </div>
                <ActionLink href={mapsLink} target="_blank" rel="noreferrer">
                  Ver ubicación <ArrowRight size={16} />
                </ActionLink>
              </PanelHead>

              <PanelBody>
                <InfoList>
                  <InfoCard whileTap={{ scale: 0.99 }}>
                    <IconBox aria-hidden="true">
                      <Phone size={18} />
                    </IconBox>
                    <div>
                      <h3>Teléfono</h3>
                      <p>
                        <a href={phoneHref}>{phoneDisplay}</a>
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard whileTap={{ scale: 0.99 }}>
                    <IconBox aria-hidden="true">
                      <Mail size={18} />
                    </IconBox>
                    <div>
                      <h3>Correo</h3>
                      <p>
                        <a href={emailHref}>{emailDisplay}</a>
                      </p>
                    </div>
                  </InfoCard>

                  <InfoCard whileTap={{ scale: 0.99 }}>
                    <IconBox aria-hidden="true">
                      <MapPin size={18} />
                    </IconBox>
                    <div>
                      <h3>Dirección</h3>
                      <p>{addressDisplay}</p>
                    </div>
                  </InfoCard>
                </InfoList>

                <InlineMeta>
                  <SmallHint>
                    Horario sugerido: Lun – Sab 8:00am–6:00pm. Si escribes fuera de horario, te respondemos al
                    siguiente día hábil.
                  </SmallHint>
                </InlineMeta>
              </PanelBody>
            </Panel>

            {/* Right: Map */}
            <Panel as={motion.div} {...motionProps} variants={floatIn} custom={4}>
              <PanelHead>
                <div>
                  <h2>Ubicación</h2>
                  <p>Encuéntranos en Google Maps.</p>
                </div>
              </PanelHead>

              <MapContainer>
        <iframe
          title="Mapa de Vega Clean"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.835769000521!2d-70.50279379999999!3d19.202374199999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eb02b7b426f4933%3A0x2f679fcbc25772e8!2sLa%20vega%20clean!5e0!3m2!1sen!2sdo!4v1768523827617!5m2!1sen!2sdo"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </MapContainer>
            </Panel>
          </Grid>
        </Container>
      </Backdrop>
    </Wrapper>
  );
}
