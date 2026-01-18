import { useEffect, useState } from "react";
import styled from "styled-components";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuthStore } from "../../store/useAuthStore.jsx";
import { supabase } from "../../supabase/supabase.config.jsx";
import { useNavigate } from "react-router-dom";

// ============================
//   ESTILOS
// ============================

const Wrapper = styled.div`
  padding: 2rem;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 1rem;
  font-weight: 700;
`;

// === MODAL COMPLEJO ===
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  width: 95%;
  max-width: 500px;
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.5rem 1.8rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.accent};
`;

const CloseBtn = styled.button`
  border: none;
  background: ${({ theme }) => theme.accent};
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  cursor: pointer;
`;

const btnStyle = {
  padding: "0.6rem 0.8rem",
  background: "#00bcd4",
  color: "white",
  borderRadius: "6px",
  textAlign: "center",
  fontSize: "0.9rem",
  textDecoration: "none",
  cursor: "pointer",
};

// ============================
//   COMPONENTE PRINCIPAL
// ============================

export default function CalendarioVendedor() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // -----------------------------
  //   CARGAR EVENTOS
  // -----------------------------

  useEffect(() => {
    if (user?.email) fetchEventos();
  }, [user]);

  async function fetchEventos() {
    const vendedorEmail = user.email;

    const { data, error } = await supabase
      .from("solicitudes")
      .select(`
        id,
        cliente,
        telefono,
        chat_link,
        fecha_agendada,
        hora_agendada,
        tipo_tarea,
        estado_solicitud,
        servicio:servicio_id ( nombre )
      `)
      .ilike("vendedor_asignado", `%${vendedorEmail}%`);

    if (error) {
      console.error("Error cargando eventos:", error);
      return;
    }

    const mappedEvents = data
      .filter((t) => t.fecha_agendada && t.hora_agendada)
      .map((t) => ({
        id: t.id,
        title: t.cliente,
        start: `${t.fecha_agendada}T${t.hora_agendada}`,
        allDay: false,
        extendedProps: {
          cliente: t.cliente,
          telefono: t.telefono,
          chat_link: t.chat_link,
          tipo_tarea: t.tipo_tarea,
          estado: t.estado_solicitud,
          servicio: t.servicio?.nombre || "-",
          fecha: t.fecha_agendada,
          hora: t.hora_agendada,
        },
      }));

    setEvents(mappedEvents);
  }

  // -----------------------------
  //   MANEJO DEL CLICK EN EVENTO
  // -----------------------------

  function handleEventClick(info) {
    setSelectedEvent({
      id: info.event.id,
      ...info.event.extendedProps,
    });
  }

  // -----------------------------
  //   HTML DEL COMPONENTE
  // -----------------------------

  return (
    <Wrapper>
      <Container>
        <Title>Calendario de visitas</Title>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="es"
          height="auto"
          selectable={false}
          events={events}
          eventClick={handleEventClick}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          nowIndicator={true}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
        />

        {/* ==========================
              MODAL DETALLES
        ========================== */}
        {selectedEvent && (
          <ModalOverlay onClick={() => setSelectedEvent(null)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Detalles del ticket</ModalTitle>

              <p>
                <strong>Cliente:</strong> {selectedEvent.cliente}
              </p>

              <p>
                <strong>Servicio:</strong> {selectedEvent.servicio}
              </p>

              <p>
                <strong>Tarea:</strong> {selectedEvent.tipo_tarea || "-"}
              </p>

              <p>
                <strong>Fecha:</strong> {selectedEvent.fecha}
              </p>

              <p>
                <strong>Hora:</strong> {selectedEvent.hora}
              </p>

              <p>
                <strong>Estado:</strong> {selectedEvent.estado}
              </p>

              <div
                style={{
                  marginTop: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {/* Llamar */}
                {selectedEvent.telefono && (
                  <a href={`tel:${selectedEvent.telefono}`} style={btnStyle}>
                    📞 Llamar cliente
                  </a>
                )}

                {/* WhatsApp */}
                {selectedEvent.telefono && (
                  <a
                    href={`https://wa.me/1${selectedEvent.telefono}`}
                    target="_blank"
                    rel="noreferrer"
                    style={btnStyle}
                  >
                    💬 WhatsApp
                  </a>
                )}

                {/* Chat */}
                {selectedEvent.chat_link && (
                  <a
                    href={selectedEvent.chat_link}
                    target="_blank"
                    rel="noreferrer"
                    style={btnStyle}
                  >
                    💭 Ir al chat del ticket
                  </a>
                )}

                {/* Ver ticket */}
                <button
                  style={btnStyle}
                  onClick={() => navigate(`/vendedor/tickets/${selectedEvent.id}`)}
                >
                  🔧 Ver ticket completo
                </button>
              </div>

              <CloseBtn onClick={() => setSelectedEvent(null)}>
                Cerrar
              </CloseBtn>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </Wrapper>
  );
}
