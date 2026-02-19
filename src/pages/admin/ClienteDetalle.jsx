import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  BadgeInfo,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { supabase } from "../../supabase/supabase.config.jsx";

function toNum(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function fmtMoneyRD(n) {
  const x = Number(n || 0);
  return `RD$ ${x.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-DO");
}

function normalizeEstado(v) {
  return String(v || "pendiente").trim().toLowerCase();
}

function estadoLabel(v) {
  const e = normalizeEstado(v);
  if (e === "preparacion") return "Preparacion";
  if (e === "despachado") return "Despachada";
  if (e === "aceptada") return "Aceptada";
  if (e === "rechazada") return "Rechazada";
  if (e === "cancelada") return "Cancelada";
  return "Pendiente";
}

function estadoTone(v) {
  const e = normalizeEstado(v);
  if (e === "despachado") return { line: "#10b981", soft: "rgba(16, 185, 129, 0.10)" };
  if (e === "rechazada" || e === "cancelada") return { line: "#ef4444", soft: "rgba(239, 68, 68, 0.10)" };
  if (e === "aceptada" || e === "preparacion") return { line: "#f59e0b", soft: "rgba(245, 158, 11, 0.10)" };
  return { line: "#9ca3af", soft: "rgba(156, 163, 175, 0.10)" };
}

function getNumeroCaso(c) {
  return c?.numero_caso || c?.preventa_ref?.numero_caso || "-";
}

function docLabel(r) {
  if (!r) return "-";
  return r.tipo_cliente === "empresa" ? r.empresa_rnc || "-" : r.cedula || "-";
}

function areaLabel(r) {
  if (!r) return "-";
  return r.area || r.direccion || "-";
}

const Page = styled.section`
  padding: 1.5rem 1.6rem;
  color: ${({ theme }) => theme.text};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
`;

const Btn = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.accent};
  border-radius: 12px;
  padding: 0.62rem 0.84rem;
  cursor: pointer;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;

  &:hover {
    opacity: 0.95;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 18px;
  padding: 1rem 1.1rem;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.06);
`;

const HeroCard = styled(Card)`
  padding: 1.15rem 1.2rem;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    inset: 0 auto auto 0;
    width: 240px;
    height: 240px;
    background: ${({ theme }) => theme.accent + "10"};
    border-radius: 999px;
    transform: translate(-40%, -55%);
    pointer-events: none;
  }
`;

const HeroTop = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const Avatar = styled.div`
  width: 62px;
  height: 62px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.accent + "22"};
  color: ${({ theme }) => theme.accent};
  border: 1px solid ${({ theme }) => theme.accent + "44"};
`;

const HeroTitle = styled.div`
  min-width: 240px;

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.accent};
    font-weight: 1000;
    letter-spacing: 0.2px;
  }

  p {
    margin: 0.3rem 0 0;
    opacity: 0.86;
    font-size: 0.92rem;
  }
`;

const RowMeta = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  font-weight: 900;
  font-size: 12px;
`;

const BadgeOk = styled(Badge)`
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.35);
`;

const BadgeWarn = styled(Badge)`
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.35);
`;

const BadgeDanger = styled(Badge)`
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.35);
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const CardTitle = styled.div`
  font-weight: 1000;
  margin-bottom: 0.8rem;
`;

const InfoRows = styled.div`
  display: grid;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 10px;
  font-size: 0.92rem;

  b {
    opacity: 0.86;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryStat = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 14px;
  padding: 0.75rem 0.8rem;
`;

const SummaryLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.82;
  font-weight: 900;
`;

const SummaryValue = styled.div`
  margin-top: 4px;
  font-size: 1.05rem;
  font-weight: 1000;
`;

const TableWrap = styled.div`
  overflow: auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.85rem 0.9rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: middle;
    font-size: 0.9rem;
  }

  th {
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    background: ${({ theme }) => theme.background};
  }

  @media (max-width: 980px) {
    display: none;
  }
`;

const MobileList = styled.div`
  display: none;
  margin-top: 10px;

  @media (max-width: 980px) {
    display: grid;
    gap: 10px;
  }
`;

const MobileItem = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-left: 4px solid ${({ $tone, theme }) => $tone || theme.border};
  background: ${({ $soft, theme }) => $soft || theme.background};
  border-radius: 14px;
  padding: 0.85rem;
`;

const MobileTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

function EstadoBadge({ estado }) {
  const e = normalizeEstado(estado);
  if (e === "despachado") return <BadgeOk>{estadoLabel(e)}</BadgeOk>;
  if (e === "rechazada" || e === "cancelada") return <BadgeDanger>{estadoLabel(e)}</BadgeDanger>;
  if (e === "aceptada" || e === "preparacion") return <BadgeWarn>{estadoLabel(e)}</BadgeWarn>;
  return <Badge>{estadoLabel(e)}</Badge>;
}

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cliente, setCliente] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadData() {
    const clienteId = Number(id);
    if (!Number.isFinite(clienteId) || clienteId <= 0) {
      setErrorMsg("ID de cliente invalido.");
      setCliente(null);
      setCotizaciones([]);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      let cli = null;

      const { data: cliView, error: eView } = await supabase
        .from("clientes_admin_panel")
        .select("*")
        .eq("id", clienteId)
        .maybeSingle();

      if (!eView && cliView) cli = cliView;

      if (!cli) {
        const { data: cliBase, error: eBase } = await supabase
          .from("clientes")
          .select(
            "id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, area, creado_en, es_recurrente, puede_fiar, max_fios, limite_credito"
          )
          .eq("id", clienteId)
          .maybeSingle();

        if (eBase) throw eBase;
        if (!cliBase) {
          setCliente(null);
          setCotizaciones([]);
          setErrorMsg("No se encontro el cliente.");
          return;
        }

        const { data: susActiva, error: eSus } = await supabase
          .from("clientes_suscripciones")
          .select("id")
          .eq("cliente_id", clienteId)
          .eq("estado", "activa")
          .is("fin", null)
          .limit(1);

        if (eSus) throw eSus;

        cli = {
          ...cliBase,
          suscrito: (susActiva || []).length > 0,
          es_recurrente_calc: !!cliBase.es_recurrente,
          fiados_activos: 0,
          fios_restantes: toNum(cliBase.max_fios),
          saldo_total: 0,
        };
      }

      const { data: cots, error: eCots } = await supabase
        .from("cotizaciones")
        .select(
          "id, numero_caso, fecha, estado, total, descuento, usa_anticipo, monto_anticipo, monto_pendiente, preventa_id, pdf_url, aceptada_en, preparacion_en, rechazada_en, despachado_en, preventa_ref:preventa_id(numero_caso)"
        )
        .eq("cliente_id", clienteId)
        .order("fecha", { ascending: false });

      if (eCots) throw eCots;

      setCliente(cli);
      setCotizaciones(cots || []);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "No se pudo cargar el detalle del cliente.");
      setCliente(null);
      setCotizaciones([]);
      Swal.fire("Error", e.message || "No se pudo cargar el detalle del cliente.", "error");
    } finally {
      setLoading(false);
    }
  }

  const resumenCot = useMemo(() => {
    const r = {
      total: cotizaciones.length,
      montoTotal: 0,
      montoPendiente: 0,
      byEstado: {
        pendiente: 0,
        aceptada: 0,
        preparacion: 0,
        despachado: 0,
        rechazada: 0,
        cancelada: 0,
        otro: 0,
      },
    };

    for (const c of cotizaciones) {
      const e = normalizeEstado(c.estado);
      if (r.byEstado[e] != null) r.byEstado[e] += 1;
      else r.byEstado.otro += 1;
      r.montoTotal += toNum(c.total);
      r.montoPendiente += toNum(c.monto_pendiente);
    }

    return r;
  }, [cotizaciones]);

  return (
    <Page>
      <TopRow>
        <Btn onClick={() => navigate("/admin/clientes")}>
          <ArrowLeft size={16} /> Volver a clientes
        </Btn>
      </TopRow>

      {loading ? (
        <Card>Cargando detalle del cliente...</Card>
      ) : errorMsg ? (
        <Card>{errorMsg}</Card>
      ) : !cliente ? (
        <Card>No se encontro el cliente.</Card>
      ) : (
        <>
          <HeroCard>
            <HeroTop>
              <Avatar>
                <User size={28} />
              </Avatar>

              <HeroTitle>
                <h2>{cliente.nombre || "Cliente"}</h2>
                <p>
                  Perfil del cliente {cliente.tipo_cliente ? `· ${cliente.tipo_cliente}` : ""}
                </p>
              </HeroTitle>
            </HeroTop>

            <RowMeta>
              <Badge><BadgeInfo size={14} /> ID #{cliente.id}</Badge>
              <Badge><Users size={14} /> Doc: {docLabel(cliente)}</Badge>
              <Badge><MapPin size={14} /> Zona: {areaLabel(cliente)}</Badge>
              {cliente.suscrito ? (
                <BadgeOk><CheckCircle2 size={14} /> Suscrito</BadgeOk>
              ) : (
                <BadgeDanger><XCircle size={14} /> No suscrito</BadgeDanger>
              )}
            </RowMeta>
          </HeroCard>

          <Grid2>
            <Card>
              <CardTitle>Datos principales</CardTitle>
              <InfoRows>
                <InfoRow><b>Nombre</b><span>{cliente.nombre || "-"}</span></InfoRow>
                <InfoRow><b>Tipo</b><span>{cliente.tipo_cliente || "-"}</span></InfoRow>
                <InfoRow><b>Documento</b><span>{docLabel(cliente)}</span></InfoRow>
                <InfoRow><b><Phone size={14} style={{ verticalAlign: "middle" }} /> Telefono</b><span>{cliente.telefono || "-"}</span></InfoRow>
                <InfoRow><b><Mail size={14} style={{ verticalAlign: "middle" }} /> Email</b><span>{cliente.email || "-"}</span></InfoRow>
                <InfoRow><b><MapPin size={14} style={{ verticalAlign: "middle" }} /> Direccion/Area</b><span>{areaLabel(cliente)}</span></InfoRow>
                <InfoRow><b><CalendarDays size={14} style={{ verticalAlign: "middle" }} /> Creado en</b><span>{fmtDate(cliente.creado_en)}</span></InfoRow>
              </InfoRows>
            </Card>

            <Card>
              <CardTitle>Credito y fiado</CardTitle>
              <RowMeta style={{ marginBottom: 10 }}>
                {cliente.es_recurrente_calc ? <Badge>Recurrente</Badge> : <Badge>Normal</Badge>}
                {cliente.puede_fiar ? (
                  <BadgeWarn><CreditCard size={14} /> Puede fiar</BadgeWarn>
                ) : (
                  <Badge>No puede fiar</Badge>
                )}
              </RowMeta>

              <InfoRows>
                <InfoRow><b>Fiados activos</b><span>{toNum(cliente.fiados_activos)}</span></InfoRow>
                <InfoRow><b>Fios restantes</b><span>{toNum(cliente.fios_restantes)}</span></InfoRow>
                <InfoRow><b>Limite credito</b><span>{fmtMoneyRD(cliente.limite_credito)}</span></InfoRow>
                <InfoRow><b>Saldo pendiente</b><span>{fmtMoneyRD(cliente.saldo_total)}</span></InfoRow>
              </InfoRows>
            </Card>
          </Grid2>

          <Card>
            <CardTitle>Historial de cotizaciones</CardTitle>

            <RowMeta>
              <Badge><FileText size={14} /> Total: {resumenCot.total}</Badge>
              <BadgeWarn>Monto cotizado: {fmtMoneyRD(resumenCot.montoTotal)}</BadgeWarn>
              <BadgeDanger>Pendiente: {fmtMoneyRD(resumenCot.montoPendiente)}</BadgeDanger>
            </RowMeta>

            <SummaryGrid>
              <SummaryStat>
                <SummaryLabel>Pendientes</SummaryLabel>
                <SummaryValue>{resumenCot.byEstado.pendiente}</SummaryValue>
              </SummaryStat>
              <SummaryStat>
                <SummaryLabel>Aceptadas</SummaryLabel>
                <SummaryValue>{resumenCot.byEstado.aceptada}</SummaryValue>
              </SummaryStat>
              <SummaryStat>
                <SummaryLabel>Preparacion</SummaryLabel>
                <SummaryValue>{resumenCot.byEstado.preparacion}</SummaryValue>
              </SummaryStat>
              <SummaryStat>
                <SummaryLabel>Despachadas</SummaryLabel>
                <SummaryValue>{resumenCot.byEstado.despachado}</SummaryValue>
              </SummaryStat>
            </SummaryGrid>

            {cotizaciones.length === 0 ? (
              <div style={{ opacity: 0.82 }}>No hay cotizaciones registradas para este cliente.</div>
            ) : (
              <>
                <TableWrap>
                  <Table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Caso</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Pendiente</th>
                        <th style={{ textAlign: "right" }}>Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotizaciones.map((c) => {
                        const tone = estadoTone(c.estado);
                        return (
                        <tr key={c.id}>
                          <td style={{ borderLeft: `4px solid ${tone.line}`, background: tone.soft }}>#{c.id}</td>
                          <td>{getNumeroCaso(c)}</td>
                          <td>{fmtDate(c.fecha)}</td>
                          <td><EstadoBadge estado={c.estado} /></td>
                          <td>{fmtMoneyRD(c.total)}</td>
                          <td>{fmtMoneyRD(c.monto_pendiente)}</td>
                          <td style={{ textAlign: "right" }}>
                            <Btn onClick={() => navigate(`/admin/cotizaciones/${c.id}`)}>Ver cotizacion</Btn>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </Table>
                </TableWrap>

                <MobileList>
                  {cotizaciones.map((c) => {
                    const tone = estadoTone(c.estado);
                    return (
                    <MobileItem key={`m-${c.id}`} $tone={tone.line} $soft={tone.soft}>
                      <MobileTop>
                        <div>
                          <div style={{ fontWeight: 1000 }}>#{c.id} · {getNumeroCaso(c)}</div>
                          <div style={{ opacity: 0.85, fontSize: 13 }}>{fmtDate(c.fecha)}</div>
                        </div>
                        <EstadoBadge estado={c.estado} />
                      </MobileTop>

                      <RowMeta style={{ marginTop: 8 }}>
                        <Badge>Total: {fmtMoneyRD(c.total)}</Badge>
                        <BadgeWarn>Pendiente: {fmtMoneyRD(c.monto_pendiente)}</BadgeWarn>
                      </RowMeta>

                      <div style={{ marginTop: 10 }}>
                        <Btn onClick={() => navigate(`/admin/cotizaciones/${c.id}`)}>Ver cotizacion</Btn>
                      </div>
                    </MobileItem>
                  )})}
                </MobileList>
              </>
            )}
          </Card>
        </>
      )}
    </Page>
  );
}
