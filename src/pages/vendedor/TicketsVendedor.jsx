import { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import { useAuthStore } from "../../store/useAuthStore.jsx";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Clock, MapPin } from "lucide-react";

const Wrapper = styled.div`
  padding: 2rem;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 900px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  margin-bottom: 1.5rem;
  opacity: 0.8;
`;

const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TicketBubble = styled.div`
  border-radius: 14px;
  padding: 1rem 1.2rem;
  background: ${({ theme }) => theme.cardBackground};
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  border-left: 4px solid
    ${({ estado }) =>
      estado === "Completado"
        ? "#27ae60"
        : estado === "En progreso"
        ? "#00bcd4"
        : estado === "Requiere reprogramación"
        ? "#e67e22"
        : estado === "Cliente no se encontraba"
        ? "#c0392b"
        : "#b7950b"};
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
`;

const Cliente = styled.span`
  font-weight: 600;
`;

const EstadoBadge = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${({ estado }) =>
    estado === "Completado"
      ? "rgba(46, 204, 113, 0.18)"
      : estado === "En progreso"
      ? "rgba(26, 188, 156, 0.18)"
      : estado === "Requiere reprogramación"
      ? "rgba(243, 156, 18, 0.18)"
      : estado === "Cliente no se encontraba"
      ? "rgba(231, 76, 60, 0.18)"
      : "rgba(241, 196, 15, 0.18)"};
  color: ${({ estado }) =>
    estado === "Completado"
      ? "#27ae60"
      : estado === "En progreso"
      ? "#16a085"
      : estado === "Requiere reprogramación"
      ? "#e67e22"
      : estado === "Cliente no se encontraba"
      ? "#c0392b"
      : "#b7950b"};
`;

const TicketBody = styled.div`
  font-size: 0.95rem;
  opacity: 0.9;
`;

const TicketFooter = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  opacity: 0.8;
`;

export default function TicketsVendedor() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      fetchTickets();
    }
  }, [user]);

  async function fetchTickets() {
    const vendedorEmail = user.email;

    const { data, error } = await supabase
      .from("solicitudes")
      .select("*")
      .ilike("vendedor_asignado", `%${vendedorEmail}%`)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error cargando tickets técnico:", error);
      return;
    }

    setTickets(data || []);
  }

  function formatearEstadoTicket(ticket) {
    return ticket.estado_solicitud || ticket.estado || "Agendado";
  }

  return (
    <Wrapper>
      <Container>
        <Title>Mis tickets asignados</Title>
        <Subtitle>
          Aquí verás solo los tickets que el administrador te ha asignado.
        </Subtitle>

        {tickets.length === 0 ? (
          <p style={{ opacity: 0.7 }}>
            No tienes tickets asignados por el momento.
          </p>
        ) : (
          <TicketList>
            {tickets.map((t) => (
              <TicketBubble
                key={t.id}
                estado={formatearEstadoTicket(t)}
                onClick={() => navigate(`/vendedor/tickets/${t.id}`)}
              >
                <TicketHeader>
                  <Cliente>{t.cliente}</Cliente>
                  <EstadoBadge estado={formatearEstadoTicket(t)}>
                    ● {formatearEstadoTicket(t)}
                  </EstadoBadge>
                </TicketHeader>

                <TicketBody>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MessageCircle size={14} />
                    <span>
                      {t.motivo ||
                        t.descripcion ||
                        "Ticket asignado. Haz clic para ver detalles."}
                    </span>
                  </div>
                </TicketBody>

                <TicketFooter>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Clock size={14} />
                    {new Date(t.fecha).toLocaleString()}
                  </span>

                  {t.direccion && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <MapPin size={14} />
                      {t.direccion}
                    </span>
                  )}
                </TicketFooter>
              </TicketBubble>
            ))}
          </TicketList>
        )}
      </Container>
    </Wrapper>
  );
}
