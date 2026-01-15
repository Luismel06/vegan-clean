import styled from "styled-components";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

const FooterWrapper = styled.footer`
  background: ${({ theme }) => theme.navBackground};
  color: ${({ theme }) => theme.text};
  width: 100%;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  border-top: 2px solid ${({ theme }) => theme.accent};
  transition: background 0.3s ease, color 0.3s ease;
`;

const FooterTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3rem;
  text-align: center;
`;

const InfoBlock = styled.div`
  max-width: 300px;

  h3 {
    color: ${({ theme }) => theme.accent};
    margin-bottom: 0.8rem;
  }

  p, a {
    color: ${({ theme }) => theme.text};
    text-decoration: none;
    font-size: 0.95rem;
    line-height: 1.4;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 1rem;

  a {
    color: ${({ theme }) => theme.accent};
    transition: color 0.3s;
    &:hover {
      color: ${({ theme }) => theme.text};
    }
  }
`;

const Copy = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
  text-align: center;
  margin-top: 2rem;
`;

export default function FooterTemplate() {
  return (
    <FooterWrapper>
      <FooterTop>
        <InfoBlock>
          <h3>Contacto</h3>
          <p><Phone size={14} /> 849-577-6011</p>
          <p><Mail size={14} /> Oriseservice394@gmail.com</p>
        </InfoBlock>

        <InfoBlock>
          <h3>Dirección</h3>
          <p><MapPin size={14} /> Calle Marginado Las Américas</p>
        </InfoBlock>

        <InfoBlock>
          <h3>Síguenos</h3>
          <SocialIcons>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={20} /></a>
          </SocialIcons>
        </InfoBlock>
      </FooterTop>

      <Copy>
        © {new Date().getFullYear()} Easy Support S.R.L. — Todos los derechos reservados.
      </Copy>
    </FooterWrapper>
  );
}
