import styled from "styled-components";
import { motion } from "framer-motion";

const Container = styled.section`
  background: linear-gradient(180deg, #3a712dad, rgb(51 53 51 / 65%), #0136abb5);
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: calc(72px + 2rem) 2rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
`;


const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  max-width: 1100px;
  width: 100%;
`;

const Card = styled(motion.div)`
  flex: 1 1 300px;
 background: ${({ theme }) =>
    theme.name === "light"
      ? "rgba(22, 154, 10, 0.6)"
      : "rgba(37, 169, 4, 0.5)"};
  backdrop-filter: blur(14px);
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  border: 1px solid ${({ theme }) => theme.border};

  h3 {
    color: #73a6f3;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    color: white;
  }

  a {
    color: white;
    text-decoration: none;
  }
`;

const Form = styled(motion.form)`
  width: 100%;
  max-width: 600px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  resize: none;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #fff;
  border: none;
  padding: 0.9rem 1.6rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
  &:hover {
    opacity: 0.9;
  }
`;

const MapContainer = styled.div`
  width: 100%;
  max-width: 900px;
  height: 350px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

export default function Contacto() {
  return (
    <Container>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <Title>Contáctanos</Title>
        <p>Estamos aquí para ayudarte. ¡Ponte en contacto con nosotros!</p>
      </motion.div>

      <InfoContainer>
        <Card whileHover={{ scale: 1.03 }}>
          <h3>Teléfono</h3>
          <p>
            <a href="tel:+18495776011">+1 (809) 365-6666</a>
          </p>
        </Card>

        <Card whileHover={{ scale: 1.03 }}>
          <h3>Correo electrónico</h3>
          <p>
            <a href="mailto:Oriseservice394@gmail.com">
              modificarcorreo@gmail.com
            </a>
          </p>
        </Card>

        <Card whileHover={{ scale: 1.03 }}>
          <h3>Dirección</h3>
          <p>Calle garcia godoy, La Vega 41000</p>
        </Card>
      </InfoContainer>
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
    </Container>
  );
}
