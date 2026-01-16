import styled from "styled-components";
import { motion } from "framer-motion";

const Container = styled.section`
background: linear-gradient(180deg, #3a712dad, rgb(51 53 51 / 65%), #0136abb5);
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(72px + 2rem) 1rem 4rem; /* ⬅️ FIX */
  gap: 3rem;
`;


/*  Sección principal */
const Hero = styled(motion.div)`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) =>
    theme.name === "light"
      ? "rgba(22, 154, 10, 0.6)"
      : "rgba(37, 169, 4, 0.5)"};
  backdrop-filter: blur(14px);
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  padding: 2rem;

  img {
    width: 400px;
    max-width: 90%;
    border-radius: 16px;
    margin-right: 2rem;

    @media (max-width: 768px) {
      margin-right: 0;
      margin-bottom: 1.5rem;
    }
  }

  div {
    flex: 1;
    text-align: left;

    h2 {
      color: ${({ theme }) => theme.accent};
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
      line-height: 1.7;
      color: white
    }
  }
`;

/*  Misión, Visión, Valores */
const Section = styled.section`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
`;

const Card = styled(motion.div)`
  flex: 1 1 300px;
  background-color: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  }

  h3 {
    color: ${({ theme }) => theme.accent};
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }

  p {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  img {
    width: 70px;
    margin-bottom: 1rem;
  }
`;

/* 🕓 Línea de tiempo */
const Timeline = styled.section`
  width: 100%;
  max-width: 900px;
  position: relative;
  margin-top: 2rem;
  padding-left: 2rem;

  &::before {
    content: "";
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${({ theme }) => theme.accent};
  }

  @media (max-width: 768px) {
    padding-left: 1.5rem;
    &::before {
      left: 10px;
    }
  }
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 2rem;
  padding-left: 2rem;

  &::before {
    content: "";
    position: absolute;
    left: -8px;
    top: 8px;
    width: 16px;
    height: 16px;
    background-color: ${({ theme }) => theme.accent};
    border-radius: 50%;
    box-shadow: 0 0 0 4px ${({ theme }) => theme.cardBackground};
  }

  h4 {
    color: ${({ theme }) => theme.accent};
    margin-bottom: 0.3rem;
  }

  p {
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

export default function Nosotros() {
  const timeline = [
  {
    year: "2019",
    text: "Inicio de Vega Clean, nace gracias a la visión y esfuerzo de su emprendedor fundador, con el objetivo de ofrecer insumos de limpieza de calidad y un servicio confiable para empresas y hogares.",
  },
  {
    year: "2026 - Actualidad",
    text: "Crecimiento sostenido, implementación de plataforma digital para solicitud de servicios y expansión de nuestra base de clientes en toda República Dominicana.",
  },
  {
    year: "Próximamente",
    text: "Planes de expansión hacia nuevas áreas tecnológicas, incluyendo automatización, IoT y soluciones inteligentes para empresas y hogares.",
  },

  ];

  return (
    <Container>
      {/* 🌟 Sección principal */}
      <Hero
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src="/nosotros.png"
          alt="Equipo de trabajo"
        />
        <div>
          <h2>Sobre Vega Clean</h2>
          <p>
            En <strong>Vega Clean</strong> nos especializamos en la fabricación, importación y distribución de insumos y equipos de limpieza
            para hogares, comercios e instituciones en toda República Dominicana.
            Nuestro compromiso es ofrecer productos de alta calidad que garanticen higiene, s
            eguridad y excelentes resultados en cada uso.
          </p>
        </div>
      </Hero>

      {/* 🎯 Misión, Visión, Valores */}
      <Section>
        <Card
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="https://dmo.kku.edu.sa/themes/custom/deanships/images/targeting.png"
            alt="Misión"
          />
          <h3>Misión</h3>
          <p>
            Brindar insumos y equipos de limpieza de alta calidad,
            ofreciendo soluciones confiables y eficientes para hogares,
            comercios e instituciones en República Dominicana, garantizando un servicio ágil,
            atención personalizada y entregas oportunas.
          </p>
        </Card>

        <Card
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135789.png"
            alt="Visión"
          />
          <h3>Visión</h3>
          <p>
            Ser la empresa líder en distribución y fabricación de productos de limpieza en República Dominicana,
            reconocida por la calidad de sus productos, su compromiso con la higiene y su capacidad de adaptarse a las necesidades de clientes
            modernos y exigentes.
          </p>
        </Card>

        <Card
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
            alt="Valores"
          />
          <h3>Valores</h3>
          <p>
            • Calidad: Productos confiables que cumplen altos estándares.<br />
            • Compromiso: Responsabilidad y seriedad en cada entrega y servicio. <br />
            • Atención al cliente: Trato cercano, rápido y personalizado. <br />
            • Integridad: Transparencia y confianza en cada relación comercial. <br />
            • Innovación: Mejora constante en productos, procesos y servicio.
          </p>
        </Card>
      </Section>

      {/* 🕓 Línea de tiempo */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 style={{ color: "#00bcd4", marginBottom: "2rem", textAlign: "center" }}>
          Nuestra Historia
        </h2>
        <Timeline>
          {timeline.map((item, index) => (
            <TimelineItem
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h4>{item.year}</h4>
              <p>{item.text}</p>
            </TimelineItem>
          ))}
        </Timeline>
      </motion.div>
    </Container>
  );
}
