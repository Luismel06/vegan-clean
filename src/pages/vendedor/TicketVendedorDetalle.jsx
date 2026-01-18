import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import { useAuthStore } from "../../store/useAuthStore.jsx";
import Swal from "sweetalert2";
import {
  Phone,
  MessageCircle,
  Send,
  Image as ImageIcon,
} from "lucide-react";

/* === ESTILOS === */

const Wrapper = styled.div`
  padding: 2rem;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1000px;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background: ${({ theme }) => theme.inputBackground};
`;

const HeaderLeft = styled.div``;

const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.accent};
`;

const SubTitle = styled.p`
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  opacity: 0.85;
`;

const HeaderRight = styled.div`
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
      : $estado === "En progreso"
      ? "rgba(26, 188, 156, 0.18)"
      : $estado === "Requiere reprogramación"
      ? "rgba(243, 156, 18, 0.18)"
      : $estado === "Cliente no se encontraba"
      ? "rgba(231, 76, 60, 0.18)"
      : "rgba(241, 196, 15, 0.18)"};

  color: ${({ $estado }) =>
    $estado === "Completado"
      ? "#27ae60"
      : $estado === "En progreso"
      ? "#2980b9"
      : $estado === "Requiere reprogramación"
      ? "#f1c40f"
      : "#7f8c8d"};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

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

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
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

const ChatPanel = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => (theme.mode === "dark" ? "#0b141a" : "#f5f7fb")};
`;

/* === CHAT SCROLL + AUTO SCROLL === */
const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem 1.3rem;
  overflow-y: auto;
  max-height: 65vh;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.accent};
    border-radius: 10px;
  }
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
  color: ${({ $isMine }) => ($isMine ? "#fff" : "inherit")};

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

const ChatInputBar = styled.div`
  padding: 0.7rem 0.9rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  resize: none;
  min-height: 60px;
  max-height: 90px;
  padding: 0.6rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
`;

const Select = styled.select`
  width: 100%;
  min-width: 160px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  padding: 0.4rem 0.5rem;
  font-size: 0.85rem;
`;

const FileLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  border: 1px dashed ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.accent};
  font-size: 0.8rem;
  cursor: pointer;
  gap: 0.3rem;
  background: rgba(0, 188, 212, 0.05);
  white-space: nowrap;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const SendButton = styled.button`
  border: none;
  background: ${({ theme }) => theme.accent};
  color: white;
  border-radius: 999px;
  padding: 0.7rem 1.4rem;
  min-width: 110px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.15s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

/* Tabla para equipos/materiales cotizados (sin precios) */
const EquiposTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.4rem;
  font-size: 0.85rem;

  th,
  td {
    border-bottom: 1px solid ${({ theme }) => theme.border};
    padding: 0.3rem 0.4rem;
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.inputBackground};
    font-weight: 600;
  }
`;

/* === COMPONENTE PRINCIPAL === */

export default function TicketVendedorDetalle() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [ticket, setTicket] = useState(null);
  const [servicioNombre, setServicioNombre] = useState("-");
  const [historial, setHistorial] = useState([]);
  const [requests, setRequests] = useState([]);
  const [nota, setNota] = useState("");
  const [estadoSolicitado, setEstadoSolicitado] = useState("");
  const [files, setFiles] = useState([]);

  // 🔹 Detalles avanzados / cotización ligada
  const [showAvanzado, setShowAvanzado] = useState(false);
  const [cotizacion, setCotizacion] = useState(null);
  const [detalleInstalacion, setDetalleInstalacion] = useState([]);

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [historial, requests]);

  useEffect(() => {
    if (user?.email) {
      fetchTicket();
      fetchHistorial();
      fetchRequests();
    }
  }, [user, id]);

  async function fetchTicket() {
    const { data } = await supabase
      .from("solicitudes")
      .select("*")
      .eq("id", id)
      .single();

    setTicket(data);

    if (data?.servicio_id) {
      const { data: serv } = await supabase
        .from("servicios")
        .select("nombre")
        .eq("id", data.servicio_id)
        .single();
      setServicioNombre(serv?.nombre || "-");
    }

    // 🔗 Resumen de instalación desde la cotización ligada a esta solicitud
    if (data?.id) {
      fetchResumenInstalacion(data.id);
    }
  }

  async function fetchResumenInstalacion(solicitudId) {
    // Buscar la última cotización asociada a esta solicitud/ticket
    const { data: cotList, error: cotError } = await supabase
      .from("cotizaciones")
      .select(
        "id, total, estado, nombre_servicio, servicio, precio_servicio, descuento"
      )
      .eq("solicitud_id", solicitudId)
      .order("id", { ascending: false })
      .limit(1);

    if (cotError) {
      console.error("Error cargando cotización ligada al ticket:", cotError);
      return;
    }

    const cot = cotList?.[0] || null;
    setCotizacion(cot);

    if (!cot) {
      setDetalleInstalacion([]);
      return;
    }

    const { data: det, error: detError } = await supabase
      .from("detalle_cotizacion")
      .select("id, producto_id, cantidad, subtotal")
      .eq("cotizacion_id", cot.id);

    if (detError) {
      console.error("Error cargando detalle de cotización:", detError);
      setDetalleInstalacion([]);
      return;
    }

    if (!det || det.length === 0) {
      setDetalleInstalacion([]);
      return;
    }

    const idsProductos = det
      .map((d) => d.producto_id)
      .filter((v) => v !== null && v !== undefined);

    let productosMap = {};
    if (idsProductos.length > 0) {
      const { data: prods, error: prodError } = await supabase
        .from("productos")
        .select("id, nombre, categoria, marca, modelo")
        .in("id", idsProductos);

      if (prodError) {
        console.error("Error cargando productos para detalle:", prodError);
      } else {
        productosMap = (prods || []).reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }
    }

    const detalleConProd = (det || []).map((d) => ({
      ...d,
      producto: productosMap[d.producto_id] || null,
    }));

    setDetalleInstalacion(detalleConProd);
  }

  async function fetchHistorial() {
    const { data } = await supabase
      .from("historial_tickets")
      .select("*")
      .eq("ticket_id", id)
      .order("fecha", { ascending: true });
    setHistorial(data || []);
  }

  async function fetchRequests() {
    const { data } = await supabase
      .from("vendedor_requests")
      .select("*")
      .eq("ticket_id", id)
      .order("fecha_solicitud", { ascending: true });
    setRequests(data || []);
  }

  async function subirArchivos() {
    if (!files.length) return [];

    const bucket = "evidencias";
    const urls = [];

    for (const file of files) {
      const filePath = `ticket-${id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (!error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        urls.push(publicUrl);

        await supabase.from("tickets_evidencias").insert([
          {
            ticket_id: Number(id),
            url: publicUrl,
            subido_por: user.email,
          },
        ]);
      }
    }

    return urls;
  }

  async function handleEnviarRequest() {
    if (!estadoSolicitado) {
      return Swal.fire("Estado requerido", "Selecciona un estado.", "warning");
    }

    if (!nota.trim()) {
      return Swal.fire("Nota requerida", "Debes escribir una nota.", "warning");
    }

    const evidenciasUrls = await subirArchivos();

    await supabase.from("vendedor_requests").insert([
      {
        ticket_id: Number(id),
        vendedor_email: user.email,
        estado_solicitado: estadoSolicitado,
        nota_vendedor: nota,
        evidencias: evidenciasUrls,
      },
    ]);

    await supabase.from("historial_tickets").insert([
      {
        ticket_id: Number(id),
        usuario: user.email,
        rol: "vendedor",
        accion: "estado_solicitado",
        descripcion: `Estado solicitado: "${estadoSolicitado}". Detalle: ${nota}`,
      },
    ]);

    Swal.fire("Solicitud enviada", "", "success");

    setNota("");
    setEstadoSolicitado("");
    setFiles([]);

    fetchHistorial();
    fetchRequests();
  }

  const mensajes = useMemo(() => {
    const hist = historial?.map((h) => ({
      id: `h-${h.id}`,
      fecha: h.fecha,
      autor: h.rol || "sistema",
      esvendedor: h.rol === "vendedor",
      texto: h.descripcion,
      tipo: "historial",
    }));

    const reqs = requests?.map((r) => ({
      id: `r-${r.id}`,
      fecha: r.fecha_solicitud,
      autor: "vendedor",
      esvendedor: true,
      texto: r.nota_vendedor,
      tipo: "request",
      estadoSolicitado: r.estado_solicitado,
      estadoRequest: r.estado_request || "pendiente",
      evidencias: r.evidencias || [],
    }));

    return [...(hist || []), ...(reqs || [])].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
  }, [historial, requests]);

  // 🔢 Total de cámaras a instalar (según categoría/nombre del producto)
  const totalCamaras = useMemo(() => {
    if (!detalleInstalacion || detalleInstalacion.length === 0) return 0;

    return detalleInstalacion.reduce((acc, d) => {
      const cat = (d.producto?.categoria || "").toLowerCase();
      const nombre = (d.producto?.nombre || "").toLowerCase();
      const esCamara =
        cat.includes("cámara") ||
        cat.includes("camara") ||
        nombre.includes("cámara") ||
        nombre.includes("camara");

      const cant = Number(d.cantidad || 0);
      return esCamara ? acc + cant : acc;
    }, 0);
  }, [detalleInstalacion]);

  if (!ticket) {
    return (
      <Wrapper>
        <p>Cargando ticket...</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>CASE-{ticket.numero_caso || ticket.id}</Title>
            <SubTitle>
              Cliente: <strong>{ticket.cliente}</strong>
            </SubTitle>
            <SubTitle>
              Servicio: <strong>{servicioNombre}</strong>
            </SubTitle>
          </HeaderLeft>

          <HeaderRight>
            <EstadoBadge $estado={ticket.estado_solicitud || ticket.estado}>
              ● {ticket.estado_solicitud || ticket.estado || "Agendado"}
            </EstadoBadge>

            <HeaderActions>
              {ticket.telefono && (
                <a href={`tel:${ticket.telefono}`}>
                  <Phone size={14} />
                  Llamar
                </a>
              )}

              {ticket.chat_link && (
                <a href={ticket.chat_link} target="_blank" rel="noreferrer">
                  <MessageCircle size={14} />
                  Chat
                </a>
              )}

              <button type="button" onClick={() => setShowAvanzado((p) => !p)}>
                Más detalles
              </button>
            </HeaderActions>
          </HeaderRight>
        </Header>

        <Content>
          {/* INFORMACIÓN DEL TICKET */}
          <InfoPanel>
            <SectionTitle>Detalles de la visita</SectionTitle>

            <InfoRow>
              <span>Tipo de tarea:</span>
              <span>{ticket.tipo_tarea || "-"}</span>
            </InfoRow>

            <InfoRow>
              <span>Fecha agendada:</span>
              <span>
                {ticket.fecha_agendada
                  ? new Date(ticket.fecha_agendada).toLocaleDateString()
                  : "-"}
              </span>
            </InfoRow>

            <InfoRow>
              <span>Hora agendada:</span>
              <span>{ticket.hora_agendada || "-"}</span>
            </InfoRow>

            <InfoRow>
              <span>Teléfono:</span>
              <span>{ticket.telefono || "-"}</span>
            </InfoRow>

            <InfoRow>
              <span>Correo cliente:</span>
              <span>{ticket.email || "-"}</span>
            </InfoRow>

            <SectionTitle style={{ marginTop: "1.2rem" }}>
              Descripción del problema
            </SectionTitle>
            <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
              {ticket.descripcion || "Sin descripción registrada."}
            </p>

            {/* 🔍 DETALLES AVANZADOS DEL TICKET */}
            {showAvanzado && (
              <>
                <SectionTitle style={{ marginTop: "1.2rem" }}>
                  Detalles avanzados del ticket
                </SectionTitle>

                <InfoRow>
                  <span>Dirección:</span>
                  <span>{ticket.direccion || "-"}</span>
                </InfoRow>

                <InfoRow>
                  <span>Tipo de cliente:</span>
                  <span>{ticket.tipo_cliente || "Particular"}</span>
                </InfoRow>

                <InfoRow>
                  <span>Empresa / Razón social:</span>
                  <span>{ticket.empresa_nombre || "-"}</span>
                </InfoRow>

                <InfoRow>
                  <span>RNC:</span>
                  <span>{ticket.rnc || "-"}</span>
                </InfoRow>

                {cotizacion && (
                  <>
                    <SectionTitle style={{ marginTop: "1.2rem" }}>
                      Equipos / materiales cotizados
                    </SectionTitle>

                    {totalCamaras > 0 && (
                      <p
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          marginBottom: "0.4rem",
                        }}
                      >
                        Cámaras a instalar:{" "}
                        <span style={{ color: "#00bcd4" }}>
                          {totalCamaras} unidad(es)
                        </span>
                      </p>
                    )}

                    {detalleInstalacion.length === 0 ? (
                      <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        No hay detalle de productos registrado en la
                        cotización.
                      </p>
                    ) : (
                      <EquiposTable>
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cant.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalleInstalacion.map((d) => (
                            <tr key={d.id}>
                              <td>
                                {d.producto?.nombre || "Producto"}
                                {d.producto?.modelo
                                  ? ` (${d.producto.modelo})`
                                  : ""}
                              </td>
                              <td>{d.cantidad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </EquiposTable>
                    )}
                  </>
                )}
              </>
            )}
          </InfoPanel>

          {/* CHAT */}
          <ChatPanel>
            <ChatMessages ref={chatRef}>
              {mensajes.length === 0 ? (
                <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                  Aún no hay actividad registrada. Escribe tu primera nota.
                </p>
              ) : (
                mensajes.map((m) => (
                  <ChatBubble key={m.id} $isMine={m.esvendedor}>
                    <div>{m.texto}</div>

                    {m.tipo === "request" && (
                      <>
                        <ChatEstado>
                          Estado solicitado:{" "}
                          <strong>{m.estadoSolicitado}</strong>{" "}
                          ({m.estadoRequest})
                        </ChatEstado>
                        {m?.evidencias?.map((url, idx) => (
                          <EvidenciaImg key={idx} src={url} alt="evidencia" />
                        ))}
                      </>
                    )}

                    <ChatMeta>
                      {new Date(m.fecha).toLocaleString()} —{" "}
                      {m.esvendedor ? "Tú" : m.autor}
                    </ChatMeta>
                  </ChatBubble>
                ))
              )}
            </ChatMessages>

            {/* INPUT */}
            <ChatInputBar>
              <TextArea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Escribe aquí lo que hiciste, hallazgos..."
              />

              <div>
                <Select
                  value={estadoSolicitado}
                  onChange={(e) => setEstadoSolicitado(e.target.value)}
                >
                  <option value="">Estado a solicitar…</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Completado">Completado</option>
                  <option value="Requiere reprogramación">
                    Requiere reprogramación
                  </option>
                  <option value="Cliente no se encontraba">
                    Cliente no se encontraba
                  </option>
                  <option value="Pendiente de materiales">
                    Pendiente de materiales
                  </option>
                </Select>

                <div style={{ marginTop: "0.4rem" }}>
                  <FileLabel>
                    <ImageIcon size={14} />
                    {files.length
                      ? `${files.length} archivo(s)`
                      : "Adjuntar fotos"}
                    <HiddenFileInput
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setFiles(Array.from(e.target.files || []))
                      }
                    />
                  </FileLabel>
                </div>
              </div>

              <SendButton onClick={handleEnviarRequest}>
                <Send size={16} /> Enviar
              </SendButton>
            </ChatInputBar>
          </ChatPanel>
        </Content>
      </Container>
    </Wrapper>
  );
}
