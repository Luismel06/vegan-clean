// src/pages/admin/PreventaDetalle.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  FilePlus2,
  RefreshCw,
  BadgeCheck,
  Clock3,
  ClipboardList,
  MapPin,
  Mail,
  Phone,
  User,
  Building2,
  ShieldCheck,
} from "lucide-react";

/* =========================
   Animations
========================= */
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
   Shell
========================= */
const Wrapper = styled.section`
  width: 100%;
  color: ${({ theme }) => theme.text};
`;

const Container = styled.div`
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

/* =========================
   Header
========================= */
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const TitleBlock = styled.div`
  min-width: 280px;

  h1 {
    margin: 0;
    font-weight: 950;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: ${({ theme }) => theme.heading};
    font-size: clamp(1.2rem, 1.2vw + 1rem, 1.6rem);
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  p {
    margin: 0.4rem 0 0;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.88)};
    font-size: 0.92rem;
    line-height: 1.45;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
`;

const BtnBase = styled.button`
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.68rem 0.9rem;
  cursor: pointer;
  font-weight: 950;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.18s ease, border-color 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(1px);
  }
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accentSoft};
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PrimaryBtn = styled(BtnBase)`
  background: ${({ theme }) => theme.accent};
  color: #fff;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
`;

const GhostBtn = styled(BtnBase)`
  background: ${({ theme }) => theme.cardBackground};
  border-color: ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};

  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

/* =========================
   Cards
========================= */
const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 22px;
  padding: 1.05rem;
  box-shadow: 0 18px 45px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.08)});
`;

const CardTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.65rem;

  h2,
  h3 {
    margin: 0;
    font-weight: 950;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.heading};
  }

  h2 {
    font-size: 1.1rem;
  }

  h3 {
    font-size: 1.05rem;
  }
`;

const CardSubtitle = styled.div`
  font-size: 0.86rem;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.88)};
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
`;

/* =========================
   Pills / Badges
========================= */
const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0 0.25rem;
`;
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  font-weight: 950;
  font-size: 0.82rem;
  width: fit-content;
`;


const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.72rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  font-weight: 950;
  font-size: 0.85rem;

  svg {
    opacity: 0.9;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.accentSoft};
  color: ${({ theme }) => theme.heading};
  font-weight: 950;
  font-size: 0.85rem;
`;

/* =========================
   Fields Grid
========================= */
const Grid = styled.div`
  margin-top: 0.85rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 18px;
  padding: 0.85rem 0.95rem;
  background: ${({ theme }) => theme.background};
  min-width: 0;
`;

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.86)};
`;

const Value = styled.div`
  margin-top: 0.35rem;
  font-weight: 950;
  color: ${({ theme }) => theme.heading};
  line-height: 1.35;
  word-break: break-word;

  .muted {
    font-weight: 850;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.88)};
    color: ${({ theme }) => theme.text};
  }

  a {
    color: ${({ theme }) => theme.accent};
    text-decoration: none;
    font-weight: 950;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const Full = styled(Field)`
  grid-column: 1 / -1;
`;

/* =========================
   Actions
========================= */
const Actions = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
`;

const SmallBtn = styled(BtnBase)`
  padding: 0.6rem 0.8rem;
  font-size: 0.9rem;
`;

const SecondaryBtn = styled(SmallBtn)`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border-color: ${({ theme }) => theme.border};

  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

const AccentBtn = styled(SmallBtn)`
  background: ${({ theme }) => theme.accent};
  color: #fff;
`;

/* =========================
   Table
========================= */
const TableCard = styled(motion.div)`
  margin-top: 1rem;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.08)});
`;

const TableScroll = styled.div`
  width: 100%;
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;

  th,
  td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: top;
    font-size: 0.92rem;
  }

  th {
    background: ${({ theme }) =>
      theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
    color: ${({ theme }) => theme.heading};
    font-weight: 950;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 0.78rem;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:hover td {
    background: ${({ theme }) =>
      theme.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"};
  }
`;

const Qty = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 26px;
  padding: 0 0.55rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  font-weight: 950;
`;

const Empty = styled.div`
  padding: 1.35rem 1rem;
  text-align: center;
  opacity: 0.85;
`;

const LoadingGrid = styled.div`
  display: grid;
  gap: 0.6rem;
  padding: 1rem;
`;

const SkeletonRow = styled.div`
  height: 54px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  background-image: linear-gradient(
    90deg,
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")} 0%,
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)")} 50%,
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.35s ease infinite;
`;

/* ==================== HELPERS ==================== */
function labelCliente(cli) {
  if (!cli) return "-";
  if (cli.tipo_cliente === "empresa") {
    return `${cli.nombre || "-"} (RNC: ${cli.empresa_rnc || "-"})`;
  }
  return `${cli.nombre || "-"} (Cédula: ${cli.cedula || "-"})`;
}

function onlyDigits(v) {
  return String(v || "").replace(/\D/g, "");
}

function formatDateTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) return "-";
  return d.toLocaleString();
}

function statusIcon(estado) {
  const e = String(estado || "").toLowerCase();
  if (e.includes("en_revision")) return <ShieldCheck size={14} />;
  if (e.includes("cotiz")) return <BadgeCheck size={14} />;
  return <Clock3 size={14} />;
}

/* ==================== COMPONENTE ==================== */
export default function PreventaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [preventa, setPreventa] = useState(null);
  const [clienteRef, setClienteRef] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);

  const prefersReducedMotion = useReducedMotion();
  const motionProps = useMemo(() => {
    if (prefersReducedMotion) return { initial: false, animate: false };
    return { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.15 } };
  }, [prefersReducedMotion]);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function buscarClienteFallback(p) {
    const tipo = p?.tipo_cliente;
    const cedula = onlyDigits(p?.cedula);
    const rnc = onlyDigits(p?.empresa_rnc);

    try {
      if (tipo === "persona" && cedula) {
        const { data, error } = await supabase
          .from("clientes")
          .select(
            "id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar"
          )
          .eq("cedula", cedula)
          .maybeSingle();
        if (!error && data) return data;
      }

      if (tipo === "empresa" && rnc) {
        const { data, error } = await supabase
          .from("clientes")
          .select(
            "id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar"
          )
          .eq("empresa_rnc", rnc)
          .maybeSingle();
        if (!error && data) return data;
      }
    } catch {
      // ignore
    }
    return null;
  }

  async function cargar() {
    try {
      setLoading(true);

      const { data: p, error: ep } = await supabase
        .from("preventas")
        .select(`
          *,
          cliente_ref:clientes (
            id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar
          )
        `)
        .eq("id", id)
        .single();

      if (ep) throw ep;

      const { data: d, error: ed } = await supabase
        .from("detalle_preventa")
        .select(`
          id,
          cantidad,
          producto_id,
          equipo_id,
          producto:productos ( id, nombre, marca, modelo ),
          equipo:equipos ( id, nombre, marca, modelo )
        `)
        .eq("preventa_id", id)
        .order("id", { ascending: true });

      if (ed) throw ed;

      setPreventa(p);
      setDetalle(d || []);

      if (p?.cliente_ref) {
        setClienteRef(p.cliente_ref);
      } else {
        const fb = await buscarClienteFallback(p);
        setClienteRef(fb);
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar los detalles de la preventa.", "error");
    } finally {
      setLoading(false);
    }
  }

  const items = useMemo(() => {
    return (detalle || []).map((r) => {
      const isProducto = !!r.producto_id;
      const item = isProducto ? r.producto : r.equipo;
      return {
        id: r.id,
        tipo: isProducto ? "Producto" : "Equipo",
        nombre: item?.nombre || "-",
        marca: item?.marca || "-",
        modelo: item?.modelo || "-",
        cantidad: r.cantidad,
      };
    });
  }, [detalle]);

  async function setEstado(nuevo) {
    if (!preventa) return;

    const { error } = await supabase.from("preventas").update({ estado: nuevo }).eq("id", preventa.id);

    if (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cambiar el estado.", "error");
      return;
    }
    cargar();
  }

  function crearCotizacion() {
    const clienteId = clienteRef?.id || preventa?.cliente_id || "";
    const qs = new URLSearchParams();
    qs.set("nuevo", "1");
    qs.set("preventa", String(id));
    if (clienteId) qs.set("cliente_id", String(clienteId));

    navigate(`/admin/cotizaciones?${qs.toString()}`);
  }

  if (loading) {
    return (
      <Wrapper>
        <Container>
          <Header>
            <TitleBlock>
              <h1>Preventa #{id}</h1>
              <p>Cargando detalles...</p>
            </TitleBlock>
            <HeaderActions>
              <GhostBtn type="button" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Volver
              </GhostBtn>
            </HeaderActions>
          </Header>

          <Card>
            <LoadingGrid>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </LoadingGrid>
          </Card>
        </Container>
      </Wrapper>
    );
  }

  if (!preventa) {
    return (
      <Wrapper>
        <Container>
          <Header>
            <TitleBlock>
              <h1>Preventa no encontrada</h1>
              <p>No se pudo cargar el registro solicitado.</p>
            </TitleBlock>
            <HeaderActions>
              <GhostBtn type="button" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Volver
              </GhostBtn>
              <PrimaryBtn type="button" onClick={cargar}>
                <RefreshCw size={16} /> Reintentar
              </PrimaryBtn>
            </HeaderActions>
          </Header>

          <Card>
            <Empty>La preventa no existe o no tienes acceso.</Empty>
          </Card>
        </Container>
      </Wrapper>
    );
  }

  const clienteTitulo = clienteRef ? labelCliente(clienteRef) : preventa.cliente || "-";
  const tipoCliente = clienteRef?.tipo_cliente || preventa.tipo_cliente || "-";
  const estado = preventa.estado || "-";

  return (
    <Wrapper>
      <Container>
        <Header>
          <TitleBlock>
            <h1>
              <ClipboardList size={18} />
              Preventa <span style={{ opacity: 0.75 }}>#{preventa.id}</span> —{" "}
              <span style={{ color: "inherit" }}>{clienteTitulo}</span>
            </h1>
            <p>
              Creada: <strong>{formatDateTime(preventa.creado_en)}</strong>{" "}
              {preventa?.numero_caso ? (
                <>
                  · Caso: <strong>{preventa.numero_caso}</strong>
                </>
              ) : null}
            </p>
          </TitleBlock>

          <HeaderActions>
            <GhostBtn type="button" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Volver
            </GhostBtn>
            <GhostBtn type="button" onClick={cargar}>
              <RefreshCw size={16} /> Recargar
            </GhostBtn>
            <PrimaryBtn type="button" onClick={crearCotizacion}>
              <FilePlus2 size={16} /> Crear cotización
            </PrimaryBtn>
          </HeaderActions>
        </Header>

        {/* Summary */}
        <Card as={motion.div} {...motionProps} variants={floatIn} custom={0}>
          <CardTitleRow>
            <h2>Resumen</h2>
            <StatusBadge>
              {statusIcon(estado)}
              {String(estado).replaceAll("_", " ")}
            </StatusBadge>
          </CardTitleRow>

          <CardSubtitle>
            {clienteRef ? (
              <>
                <BadgeCheck size={16} />
                Recurrente: <strong>{clienteRef.es_recurrente ? "Sí" : "No"}</strong> · Puede fiar:{" "}
                <strong>{clienteRef.puede_fiar ? "Sí" : "No"}</strong>
              </>
            ) : (
              <>
                <Clock3 size={16} />
                Cliente sin referencia vinculada (usando datos de la preventa).
              </>
            )}
          </CardSubtitle>

          <PillRow>
            <Pill>
              {tipoCliente === "empresa" ? <Building2 size={14} /> : <User size={14} />}
              Tipo: {tipoCliente}
            </Pill>
            <Pill>
              <ShieldCheck size={14} />
              Estado: {String(estado).replaceAll("_", " ")}
            </Pill>
          </PillRow>

          <Grid>
            <Field>
              <Label>
                <Mail size={14} />
                Email
              </Label>
              <Value>
                {preventa.email || clienteRef?.email ? (
                  <a href={`mailto:${preventa.email || clienteRef?.email}`}>{preventa.email || clienteRef?.email}</a>
                ) : (
                  <span className="muted">-</span>
                )}
              </Value>
            </Field>

            <Field>
              <Label>
                <Phone size={14} />
                Teléfono
              </Label>
              <Value>
                {preventa.telefono || clienteRef?.telefono ? (
                  <a href={`tel:${preventa.telefono || clienteRef?.telefono}`}>{preventa.telefono || clienteRef?.telefono}</a>
                ) : (
                  <span className="muted">-</span>
                )}
              </Value>
            </Field>

            <Full>
              <Label>
                <MapPin size={14} />
                Dirección
              </Label>
              <Value>{preventa.direccion || clienteRef?.direccion || "-"}</Value>
            </Full>

            <Full>
              <Label>
                <ClipboardList size={14} />
                Nota del cliente
              </Label>
              <Value>{preventa.nota_cliente || "-"}</Value>
            </Full>
          </Grid>

          <Actions>
            <AccentBtn type="button" onClick={crearCotizacion}>
              <FilePlus2 size={16} /> Crear cotización desde preventa
            </AccentBtn>
            <SecondaryBtn type="button" onClick={() => setEstado("en_revision")}>
              <ShieldCheck size={16} /> Marcar en revisión
            </SecondaryBtn>
            <SecondaryBtn type="button" onClick={() => setEstado("cotizando")}>
              <Clock3 size={16} /> Marcar cotizando
            </SecondaryBtn>
            <SecondaryBtn type="button" onClick={() => setEstado("cotizada")}>
              <BadgeCheck size={16} /> Marcar cotizada
            </SecondaryBtn>
          </Actions>
        </Card>

        {/* Items */}
        <TableCard as={motion.div} {...motionProps} variants={floatIn} custom={1}>
          <div style={{ padding: "1rem 1.05rem 0.4rem" }}>
            <CardTitleRow style={{ marginBottom: 0 }}>
              <h3>Items solicitados</h3>
              <CardSubtitle style={{ marginTop: 2 }}>
                Total ítems: <strong>{items.length}</strong>
              </CardSubtitle>
            </CardTitleRow>
          </div>

          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Cantidad</th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <Empty>Sin ítems.</Empty>
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <Badge>{it.tipo}</Badge>
                      </td>
                      <td style={{ fontWeight: 950, color: "inherit" }}>{it.nombre}</td>
                      <td>{it.marca}</td>
                      <td>{it.modelo}</td>
                      <td>
                        <Qty>{it.cantidad}</Qty>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableScroll>
        </TableCard>
      </Container>
    </Wrapper>
  );
}
