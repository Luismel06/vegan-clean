// src/pages/admin/Tickets.jsx
import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import {
  ClipboardList,
  UserCog,
  CheckCircle,
  Phone,
  FileText,
  MessageSquare,
} from "lucide-react";

// === EMAILJS CONFIG ===
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ASIGNACION_ID =
  import.meta.env.VITE_EMAILJS_TEMPLATE_ASIGNACION_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// === ESTILOS GENERALES ===
const Container = styled.section`
  width: 100%;
  padding: 2rem;
  color: ${({ theme }) => theme.text};
`;

const Tabs = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.border};
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.8rem 1.5rem;
  color: ${({ $active, theme }) => ($active ? theme.accent : theme.text)};
  border-bottom: 3px solid
    ${({ $active, theme }) => ($active ? theme.accent : "transparent")};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

  th,
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    vertical-align: top;
  }

  th {
    background-color: ${({ theme }) => theme.accent};
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
  }

  tr:hover {
    background-color: ${({ theme }) => theme.background};
    transition: 0.2s;
  }
`;

const ActionButton = styled.button`
  background-color: ${({ theme }) => theme.accent};
  border: none;
  color: white;
  border-radius: 6px;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: 0.3s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.03);
  }
`;

// === ESTILOS DETALLE TIPO WHATSAPP ===
const DetailWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const TicketBox = styled.div`
  width: 100%;
  max-width: 1000px;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TicketHeader = styled.div`
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background: ${({ theme }) => theme.inputBackground};
`;

const TicketHeaderLeft = styled.div``;

const TicketTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.accent};
`;

const TicketSubTitle = styled.p`
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  opacity: 0.85;
`;

const TicketHeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0.4rem;
`;

const EstadoBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: bold;

  background: ${({ $estado }) =>
    $estado === "Completado"
      ? "rgba(46, 204, 113, 0.18)"
      : $estado === "En progreso" || $estado === "En proceso"
      ? "rgba(26, 188, 156, 0.18)"
      : $estado === "Requiere reprogramación"
      ? "rgba(243, 156, 18, 0.18)"
      : $estado === "Cliente no se encontraba"
      ? "rgba(231, 76, 60, 0.18)"
      : "rgba(241, 196, 15, 0.18)"};

  color: ${({ $estado }) =>
    $estado === "Completado"
      ? "#27ae60"
      : $estado === "En progreso" || $estado === "En proceso"
      ? "#16a085"
      : $estado === "Requiere reprogramación"
      ? "#e67e22"
      : $estado === "Cliente no se encontraba"
      ? "#c0392b"
      : "#b7950b"};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;

  a,
  button {
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.border};
    padding: 0.3rem 0.7rem;
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: ${({ theme }) => theme.cardBackground};
    cursor: pointer;
    text-decoration: none;
    color: ${({ theme }) => theme.text};

    &:hover {
      background: ${({ theme }) => theme.hover};
    }
  }
`;

const DetailContent = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(260px, 1.2fr);
  min-height: 450px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoPanel = styled.div`
  padding: 1rem 1.5rem;
  border-right: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 900px) {
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 0.3rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin: 0.3rem 0;

  span:first-child {
    font-weight: 600;
  }
`;

// Tabla compacta para equipos/materiales (sin precios)
const EquiposTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.4rem;
  font-size: 0.85rem;

  th,
  td {
    padding: 0.4rem 0.3rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }

  th {
    background: ${({ theme }) => theme.inputBackground};
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
  }
`;

const ChatPanel = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) =>
    theme.mode === "dark" ? "#0b141a" : "#f5f7fb"};
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem 1.3rem;
  overflow-y: auto;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const ChatBubble = styled.div`
  max-width: 80%;
  margin: 0.4rem 0;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  word-wrap: break-word;

  background: ${({ $isMine, theme }) =>
    $isMine ? theme.accent : theme.cardBackground};
  color: ${({ $isMine, theme }) => ($isMine ? "#fff" : theme.text)};

  align-self: ${({ $isMine }) => ($isMine ? "flex-end" : "flex-start")};
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
`;

const ChatEstado = styled.span`
  font-size: 0.75rem;
  display: inline-block;
  margin-top: 0.2rem;
  opacity: 0.9;
`;

const ChatMeta = styled.div`
  font-size: 0.7rem;
  opacity: 0.8;
  margin-top: 0.2rem;
  text-align: right;
`;

const EvidenciaImg = styled.img`
  margin-top: 0.4rem;
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  object-fit: cover;
  display: block;
`;

const CloseTicketButton = styled(ActionButton)`
  background-color: #e74c3c;
`;

// === COMPONENTE PRINCIPAL ===
export default function Tickets() {
  const [tab, setTab] = useState("solicitudes");
  const [solicitudes, setSolicitudes] = useState([]);
  const [activos, setActivos] = useState([]);
  const [finalizados, setFinalizados] = useState([]);
  const [cancelados, setCancelados] = useState([]);

  const [tecnicos, setTecnicos] = useState([]);

  // Para DETALLES TICKET
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [requests, setRequests] = useState([]);

  // 🔗 Cotización ligada a este ticket
  const [cotizacionLigada, setCotizacionLigada] = useState(null);
  const [detalleCotizacion, setDetalleCotizacion] = useState([]);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    obtenerTecnicos();
    obtenerSolicitudes();
    obtenerTicketsCategorizados();
  }

  const obtenerTecnicos = async () => {
    const { data } = await supabase
      .from("usuarios")
      .select("email, nombre")
      .eq("rol", "tecnico");
    setTecnicos(data || []);
  };

  // === 1. SOLICITUDES (estado = "Solicitud enviada")
  const obtenerSolicitudes = async () => {
    const { data } = await supabase
      .from("solicitudes")
      .select("*, servicios(nombre)")
      .eq("estado", "Solicitud enviada")
      .order("fecha", { ascending: false });

    const formatted = (data || []).map((item) => ({
      ...item,
      servicio_nombre: item.servicios?.nombre || "No especificado",
      estadoFinal: item.estado_solicitud || item.estado,
    }));

    setSolicitudes(formatted);
  };

  // === 2. TICKETS Categorizados
  const obtenerTicketsCategorizados = async () => {
    const { data } = await supabase
      .from("solicitudes")
      .select("*, servicios(nombre)")
      .neq("estado", "Solicitud enviada")
      .order("fecha", { ascending: false });

    const formatted = (data || []).map((item) => {
      const estadoFinal = item.estado_solicitud
        ? item.estado_solicitud
        : item.estado;

      return {
        ...item,
        estadoFinal,
        servicio_nombre: item.servicios?.nombre || "No especificado",
      };
    });

    setActivos(formatted.filter((t) => estadoEsActivo(t.estadoFinal)));
    setFinalizados(formatted.filter((t) => estadoEsFinal(t.estadoFinal)));
    setCancelados(formatted.filter((t) => estadoEsCancelado(t.estadoFinal)));
  };

  function estadoEsActivo(e) {
    return [
      "pendiente",
      "Agendado",
      "En proceso",
      "En progreso",
      "Requiere reprogramación",
      "Pendiente de materiales",
    ].includes(e);
  }

  function estadoEsFinal(e) {
    return ["Completado", "Finalizado"].includes(e);
  }

  function estadoEsCancelado(e) {
    return ["Cancelado", "Cliente no se encontraba"].includes(e);
  }

  function obtenerEstadoTicket(t) {
    if (!t) return "";
    return t.estadoFinal || t.estado_solicitud || t.estado || "Agendado";
  }

  // === Cargar cotización ligada + detalle de equipos ===
  async function cargarCotizacionYDetalle(ticketId) {
    setCotizacionLigada(null);
    setDetalleCotizacion([]);

    // Buscar cotización ligada por solicitud_id
    const { data: cotList, error: errCot } = await supabase
      .from("cotizaciones")
      .select("*")
      .eq("solicitud_id", ticketId)
      .order("id", { ascending: false });

    if (errCot || !cotList || cotList.length === 0) {
      setCotizacionLigada(null);
      setDetalleCotizacion([]);
      return;
    }

    const cot = cotList[0];

    const { data: det, error: errDet } = await supabase
      .from("detalle_cotizacion")
      .select("*")
      .eq("cotizacion_id", cot.id);

    if (errDet || !det) {
      setCotizacionLigada(cot);
      setDetalleCotizacion([]);
      return;
    }

    const { data: productos } = await supabase
      .from("productos")
      .select("id, nombre, modelo");

    const detalleConProducto = det.map((d) => ({
      ...d,
      producto: productos?.find((p) => p.id === d.producto_id) || null,
    }));

    setCotizacionLigada(cot);
    setDetalleCotizacion(detalleConProducto);
  }

  // === 3. Cargar DETALLES de un ticket
  async function abrirDetalles(ticket) {
    setTicketSeleccionado(ticket);

    const { data: h } = await supabase
      .from("historial_tickets")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("fecha", { ascending: true });

    setHistorial(h || []);

    const { data: r } = await supabase
      .from("tecnico_requests")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("fecha_solicitud", { ascending: true });

    setRequests(r || []);

    // 🔗 Cargar también la cotización ligada (equipos / materiales)
    await cargarCotizacionYDetalle(ticket.id);

    setTab("detalles");
  }

  // === COMBINAR HISTORIAL + REQUESTS PARA CHAT ===
  const mensajes = useMemo(() => {
    const mensajesHistorial =
      historial?.map((h) => ({
        id: `h-${h.id}`,
        fecha: h.fecha,
        autor: h.rol || "sistema",
        esTecnico: h.rol === "tecnico",
        texto: h.descripcion,
        tipo: "historial",
      })) || [];

    const mensajesRequests =
      requests?.map((r) => ({
        id: `r-${r.id}`,
        fecha: r.fecha_solicitud,
        autor: "tecnico",
        esTecnico: true,
        texto: r.nota_tecnico,
        tipo: "request",
        estadoSolicitado: r.estado_solicitado,
        estadoRequest: r.estado_request || "pendiente",
        evidencias: r.evidencias || [],
        rawRequest: r,
      })) || [];

    return [...mensajesHistorial, ...mensajesRequests].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
  }, [historial, requests]);

  // === 4. Aceptar/Denegar solicitud del técnico
  async function procesarRequest(req, aprobado) {
    const nuevoEstado = aprobado ? "Aprobado" : "Rechazado";

    await supabase
      .from("tecnico_requests")
      .update({ estado_request: nuevoEstado })
      .eq("id", req.id);

    if (aprobado) {
      await supabase
        .from("solicitudes")
        .update({ estado_solicitud: req.estado_solicitado })
        .eq("id", req.ticket_id);
    }

    await supabase.from("historial_tickets").insert([
      {
        ticket_id: req.ticket_id,
        usuario: "admin",
        rol: "admin",
        accion: aprobado ? "estado_aprobado" : "estado_rechazado",
        descripcion: `El administrador ${
          aprobado ? "aprobó" : "rechazó"
        } el estado solicitado: ${req.estado_solicitado}`,
      },
    ]);

    // refrescar detalle y tablas
    if (ticketSeleccionado) {
      await abrirDetalles(ticketSeleccionado);
    }
    cargarTodo();
  }

  // === 5. Cierre manual de ticket (opción C) ===
  async function cerrarTicketManual(ticket) {
    if (!ticket) return;

    const { value: formValues } = await Swal.fire({
      title: "Cerrar ticket manualmente",
      html: `
        <label style="font-weight:bold;">Estado final:</label>
        <select id="estado" class="swal2-input" style="width:80%;">
          <option value="Completado">Completado</option>
          <option value="Finalizado">Finalizado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Cliente no se encontraba">Cliente no se encontraba</option>
        </select>
        <label style="font-weight:bold; margin-top:8px;">Nota (opcional):</label>
        <textarea id="nota" class="swal2-textarea" style="width:80%;"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Cerrar ticket",
      confirmButtonColor: "#e74c3c",
      preConfirm: () => {
        const estado = document.getElementById("estado").value;
        const nota = document.getElementById("nota").value;
        if (!estado) {
          Swal.showValidationMessage("Debes seleccionar un estado final.");
          return null;
        }
        return { estado, nota };
      },
    });

    if (!formValues) return;

    const { estado, nota } = formValues;

    const { error } = await supabase
      .from("solicitudes")
      .update({ estado_solicitud: estado })
      .eq("id", ticket.id);

    if (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Error al cerrar el ticket",
        text: "Intenta nuevamente.",
      });
      return;
    }

    await supabase.from("historial_tickets").insert([
      {
        ticket_id: ticket.id,
        usuario: "admin",
        rol: "admin",
        accion: "cierre_manual",
        descripcion: `Ticket cerrado manualmente con estado "${estado}". Nota: ${
          nota || "Sin nota adicional."
        }`,
      },
    ]);

    await Swal.fire({
      icon: "success",
      title: "Ticket cerrado",
      text: `El ticket fue marcado como "${estado}".`,
    });

    const ticketActualizado = {
      ...ticket,
      estado_solicitud: estado,
      estadoFinal: estado,
    };
    setTicketSeleccionado(ticketActualizado);
    cargarTodo();
  }

  // === 6. Asignar técnico desde solicitudes ===
  const asignarTecnico = async (id, numero_caso, cliente, email, servicio) => {
    const tecnicosHTML = tecnicos
      .map(
        (t) => `<option value="${t.email}">${t.nombre} (${t.email})</option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "Asignar técnico y tarea",
      html: `
      <label style="font-weight:bold;">Técnico:</label><br/>
      <select id="tecnico" class="swal2-input" style="width:80%;">
        ${tecnicosHTML}
      </select><br/>

      <label style="font-weight:bold;">Fecha agendada:</label>
      <input type="date" id="fecha" class="swal2-input" style="width:80%;"/><br/>

      <label style="font-weight:bold;">Hora:</label>
      <input type="time" id="hora" class="swal2-input" style="width:80%;"/><br/>

      <label style="font-weight:bold;">Tipo de tarea:</label>
      <select id="tipo" class="swal2-input" style="width:80%;">
        <option value="Levantamiento">Levantamiento</option>
        <option value="Instalación">Instalación</option>
        <option value="Mantenimiento">Mantenimiento</option>
      </select>
    `,
      confirmButtonText: "Asignar",
      showCancelButton: true,
      preConfirm: () => {
        return {
          tecnico: document.getElementById("tecnico").value,
          fecha: document.getElementById("fecha").value,
          hora: document.getElementById("hora").value,
          tarea: document.getElementById("tipo").value,
        };
      },
    });

    if (!formValues) return;

    const { tecnico, fecha, hora, tarea } = formValues;

    // === OBJETO DEL TÉCNICO ===
    const tecnicoObj = tecnicos.find((t) => t.email === tecnico);
    const tecnicoAsignado = tecnicoObj
      ? `${tecnicoObj.nombre} (${tecnicoObj.email})`
      : tecnico;

    // === 1) ACTUALIZAR BD ===
    await supabase
      .from("solicitudes")
      .update({
        tecnico_asignado: tecnicoAsignado,
        estado: "Agendado",
        fecha_agendada: fecha,
        hora_agendada: hora,
        tipo_tarea: tarea,
      })
      .eq("id", id);

    // === 2) HISTORIAL ===
    await supabase.from("historial_tickets").insert([
      {
        ticket_id: id,
        usuario: "admin",
        rol: "admin",
        accion: "asignacion_tecnico",
        descripcion: `Se asignó el técnico ${tecnicoAsignado} para la tarea "${tarea}" el ${fecha} a las ${hora}.`,
      },
    ]);

    // === 3) ENVIAR CORREO ===
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ASIGNACION_ID,
        {
          email: email,
          cliente: cliente,
          tecnico: tecnicoObj?.nombre ?? tecnico,
          servicio: servicio,
          fecha: fecha,
          hora: hora,
          tarea: tarea,
          name: "Vega Clean",
        },
        EMAILJS_PUBLIC_KEY
      );

      console.log("Correo enviado correctamente ✔");
    } catch (err) {
      console.error("EmailJS error:", err);
    }

    Swal.fire({
      icon: "success",
      title: "Técnico asignado correctamente",
      text: "El cliente ha sido notificado.",
    });

    cargarTodo();
  };

  // =======================
  // RENDER
  // =======================
  return (
    <Container>
      <h2 style={{ color: "#00bcd4", marginBottom: "1.5rem" }}>
        <ClipboardList size={24} style={{ marginRight: "8px" }} />
        Gestión de Tickets
      </h2>

      {/* === TABS === */}
      <Tabs>
        <TabButton
          $active={tab === "solicitudes"}
          onClick={() => setTab("solicitudes")}
        >
          Solicitudes nuevas
        </TabButton>
        <TabButton
          $active={tab === "activos"}
          onClick={() => setTab("activos")}
        >
          Tickets activos
        </TabButton>
        <TabButton
          $active={tab === "finalizados"}
          onClick={() => setTab("finalizados")}
        >
          Finalizados
        </TabButton>
        <TabButton
          $active={tab === "cancelados"}
          onClick={() => setTab("cancelados")}
        >
          Cancelados
        </TabButton>
        <TabButton
          $active={tab === "detalles"}
          onClick={() => setTab("detalles")}
        >
          Detalles Ticket
        </TabButton>
      </Tabs>

      {/* SOLICITUDES NUEVAS */}
      {tab === "solicitudes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Table>
            <thead>
              <tr>
                <th>#Caso</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Servicio</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id}>
                  <td>{s.numero_caso}</td>
                  <td>{s.cliente}</td>
                  <td>
                    <a
                      href={`https://wa.me/${s.telefono}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#00bcd4",
                        textDecoration: "none",
                      }}
                    >
                      <Phone size={14} /> {s.telefono}
                    </a>
                  </td>
                  <td>{s.servicio_nombre}</td>
                  <td style={{ maxWidth: "250px" }}>
                    <FileText size={14} /> {s.descripcion || "Sin descripción"}
                  </td>
                  <td>{new Date(s.fecha).toLocaleDateString()}</td>
                  <td>
                    <ActionButton
                      onClick={() =>
                        asignarTecnico(
                          s.id,
                          s.numero_caso,
                          s.cliente,
                          s.email,
                          s.servicio_nombre
                        )
                      }
                    >
                      <UserCog size={14} /> Asignar
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </motion.div>
      )}

      {/* ACTIVOS */}
      {tab === "activos" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Table>
            <thead>
              <tr>
                <th>#Caso</th>
                <th>Cliente</th>
                <th>Técnico</th>
                <th>Servicio</th>
                <th>Tarea</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {activos.map((t) => (
                <tr key={t.id}>
                  <td>{t.numero_caso}</td>
                  <td>{t.cliente}</td>
                  <td>{t.tecnico_asignado || "Sin asignar"}</td>
                  <td>{t.servicio_nombre}</td>
                  <td>{t.tipo_tarea || "-"}</td>
                  <td>{t.fecha_agendada || "-"}</td>
                  <td>{t.hora_agendada || "-"}</td>
                  <td>{t.estadoFinal}</td>
                  <td>
                    <ActionButton onClick={() => abrirDetalles(t)}>
                      <MessageSquare size={14} /> Ver detalles
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </motion.div>
      )}

      {/* FINALIZADOS */}
      {tab === "finalizados" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Table>
            <thead>
              <tr>
                <th>#Caso</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {finalizados.map((t) => (
                <tr key={t.id}>
                  <td>{t.numero_caso}</td>
                  <td>{t.cliente}</td>
                  <td>{t.servicio_nombre}</td>
                  <td>{t.fecha_agendada || "-"}</td>
                  <td>{t.estadoFinal}</td>
                  <td>
                    <ActionButton onClick={() => abrirDetalles(t)}>
                      <MessageSquare size={14} /> Ver detalles
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </motion.div>
      )}

      {/* CANCELADOS */}
      {tab === "cancelados" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Table>
            <thead>
              <tr>
                <th>#Caso</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {cancelados.map((t) => (
                <tr key={t.id}>
                  <td>{t.numero_caso}</td>
                  <td>{t.cliente}</td>
                  <td>{t.servicio_nombre}</td>
                  <td>{t.fecha_agendada || "-"}</td>
                  <td>{t.estadoFinal}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </motion.div>
      )}

      {/* DETALLES DEL TICKET (ESTILO CHAT) */}
      {tab === "detalles" && ticketSeleccionado && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <DetailWrapper>
            <TicketBox>
              <TicketHeader>
                <TicketHeaderLeft>
                  <TicketTitle>
                    CASE-{ticketSeleccionado.numero_caso || ticketSeleccionado.id}
                  </TicketTitle>
                  <TicketSubTitle>
                    Cliente: <strong>{ticketSeleccionado.cliente}</strong>
                  </TicketSubTitle>
                  <TicketSubTitle>
                    Servicio:{" "}
                    <strong>{ticketSeleccionado.servicio_nombre}</strong>
                  </TicketSubTitle>
                </TicketHeaderLeft>

                <TicketHeaderRight>
                  <EstadoBadge
                    $estado={obtenerEstadoTicket(ticketSeleccionado)}
                  >
                    ● {obtenerEstadoTicket(ticketSeleccionado)}
                  </EstadoBadge>

                  <HeaderActions>
                    {ticketSeleccionado.telefono && (
                      <a href={`tel:${ticketSeleccionado.telefono}`}>
                        <Phone size={14} />
                        Llamar
                      </a>
                    )}

                    {ticketSeleccionado.chat_link && (
                      <a
                        href={ticketSeleccionado.chat_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageSquare size={14} />
                        Chat
                      </a>
                    )}
                  </HeaderActions>

                  <button
                    style={{
                      marginTop: "10px",
                      background: "#00bcd4",
                      color: "white",
                      border: "none",
                      padding: "7px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                    onClick={() =>
                      asignarTecnico(
                        ticketSeleccionado.id,
                        ticketSeleccionado.numero_caso,
                        ticketSeleccionado.cliente,
                        ticketSeleccionado.email,
                        ticketSeleccionado.servicio_nombre
                      )
                    }
                  >
                    🔄 Reasignar técnico
                  </button>
                </TicketHeaderRight>
              </TicketHeader>

              <DetailContent>
                {/* PANEL IZQUIERDO: INFO */}
                <InfoPanel>
                  <SectionTitle>Detalles de la visita</SectionTitle>

                  <InfoRow>
                    <span>Tipo de tarea:</span>
                    <span>{ticketSeleccionado.tipo_tarea || "-"}</span>
                  </InfoRow>

                  <InfoRow>
                    <span>Fecha agendada:</span>
                    <span>
                      {ticketSeleccionado.fecha_agendada
                        ? new Date(
                            ticketSeleccionado.fecha_agendada
                          ).toLocaleDateString()
                        : "-"}
                    </span>
                  </InfoRow>

                  <InfoRow>
                    <span>Hora agendada:</span>
                    <span>{ticketSeleccionado.hora_agendada || "-"}</span>
                  </InfoRow>

                  <InfoRow>
                    <span>Teléfono:</span>
                    <span>{ticketSeleccionado.telefono || "-"}</span>
                  </InfoRow>

                  <InfoRow>
                    <span>Correo cliente:</span>
                    <span>{ticketSeleccionado.email || "-"}</span>
                  </InfoRow>

                  <InfoRow>
                    <span>Dirección:</span>
                    <span>{ticketSeleccionado.direccion || "-"}</span>
                  </InfoRow>

                  <SectionTitle style={{ marginTop: "1.2rem" }}>
                    Descripción del problema
                  </SectionTitle>
                  <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
                    {ticketSeleccionado.descripcion ||
                      "Sin descripción registrada."}
                  </p>

                  {/* NUEVA SECCIÓN: EQUIPOS Y MATERIALES COTIZADOS */}
                  <SectionTitle style={{ marginTop: "1.2rem" }}>
                    Equipos y materiales cotizados
                  </SectionTitle>

                  {!cotizacionLigada ? (
                    <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                      No hay una cotización ligada a este ticket todavía.
                    </p>
                  ) : (
                    <>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          opacity: 0.8,
                          marginBottom: "0.3rem",
                        }}
                      >
                        Cotización #{cotizacionLigada.id} — Total{" "}
                        <strong>
                          RD$
                          {Number(cotizacionLigada.total || 0).toLocaleString(
                            "es-DO",
                            { minimumFractionDigits: 2 }
                          )}
                        </strong>
                      </p>

                      <EquiposTable>
                        <thead>
                          <tr>
                            <th>Equipo / material</th>
                            <th>Cant.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalleCotizacion.length === 0 ? (
                            <tr>
                              <td colSpan={2}>
                                Sin productos registrados en la cotización.
                              </td>
                            </tr>
                          ) : (
                            detalleCotizacion.map((d) => (
                              <tr key={d.id}>
                                <td>
                                  {d.producto?.nombre || "Producto sin nombre"}
                                </td>
                                <td>{d.cantidad}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </EquiposTable>
                    </>
                  )}

                  <div style={{ marginTop: "1.4rem" }}>
                    <CloseTicketButton
                      onClick={() => cerrarTicketManual(ticketSeleccionado)}
                    >
                      <CheckCircle size={14} />
                      Cerrar ticket manualmente
                    </CloseTicketButton>
                  </div>
                </InfoPanel>

                {/* PANEL DERECHO: CHAT */}
                <ChatPanel>
                  <ChatMessages>
                    {mensajes.length === 0 ? (
                      <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                        Aún no hay actividad registrada en este ticket.
                      </p>
                    ) : (
                      mensajes.map((m) => (
                        <ChatBubble key={m.id} $isMine={m.esTecnico}>
                          <div>{m.texto}</div>

                          {m.tipo === "request" && (
                            <>
                              <ChatEstado>
                                Estado solicitado:{" "}
                                <strong>{m.estadoSolicitado}</strong>{" "}
                                ({m.estadoRequest})
                              </ChatEstado>

                              {Array.isArray(m.evidencias) &&
                                m.evidencias.map((url, idx) => (
                                  <EvidenciaImg
                                    key={idx}
                                    src={url}
                                    alt="evidencia"
                                  />
                                ))}

                              {m.rawRequest &&
                                (!m.estadoRequest ||
                                  m.estadoRequest === "pendiente") && (
                                  <div
                                    style={{
                                      marginTop: "0.5rem",
                                      display: "flex",
                                      gap: "0.5rem",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <ActionButton
                                      onClick={() =>
                                        procesarRequest(m.rawRequest, true)
                                      }
                                    >
                                      ✔ Aprobar
                                    </ActionButton>
                                    <ActionButton
                                      onClick={() =>
                                        procesarRequest(m.rawRequest, false)
                                      }
                                    >
                                      ✖ Rechazar
                                    </ActionButton>
                                  </div>
                                )}
                            </>
                          )}

                          <ChatMeta>
                            {new Date(m.fecha).toLocaleString()} —{" "}
                            {m.esTecnico ? "Técnico" : m.autor || "Sistema"}
                          </ChatMeta>
                        </ChatBubble>
                      ))
                    )}
                  </ChatMessages>
                </ChatPanel>
              </DetailContent>
            </TicketBox>
          </DetailWrapper>
        </motion.div>
      )}
    </Container>
  );
}
