// src/pages/admin/Tickets.jsx
import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Eye,
  FilePlus2,
  RefreshCw,
  Search,
  Boxes,
  Ticket,
  Filter,
  CalendarDays,
  X,
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
  max-width: 1240px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

/* =========================
   Header
========================= */
const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const HeaderLeft = styled.div`
  min-width: 280px;

  h2 {
    margin: 0;
    font-weight: 950;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.heading};
    font-size: 1.35rem;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
  }

  p {
    margin: 0.35rem 0 0;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.88)};
    font-size: 0.92rem;
    line-height: 1.45;
    max-width: 80ch;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
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
`;

/* =========================
   Filters
========================= */
const FiltersCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 0.95rem;
  box-shadow: 0 16px 40px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.08)});
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.7fr);
  gap: 0.75rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SearchBox = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 999px;
  padding: 0.72rem 0.9rem;

  svg {
    opacity: 0.75;
  }

  input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;

    &::placeholder {
      opacity: 0.6;
    }
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.78rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 999px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-weight: 850;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

const ActiveFilters = styled.div`
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  font-weight: 900;
  font-size: 0.86rem;
  opacity: 0.95;
`;

const ClearBtn = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  opacity: 0.75;
  cursor: pointer;
  display: inline-flex;
  align-items: center;

  &:hover {
    opacity: 1;
  }
`;

/* =========================
   Tabs
========================= */
const TabsWrap = styled.div`
  margin-top: 0.9rem;
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ $active, theme }) => ($active ? theme.accentSoft : theme.cardBackground)};
  color: ${({ theme }) => theme.text};
  border-radius: 999px;
  padding: 0.62rem 0.85rem;
  cursor: pointer;
  font-weight: 950;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  transition: transform 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.accent};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accentSoft};
    outline-offset: 3px;
  }
`;

const Count = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 22px;
  padding: 0 0.45rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 950;
  color: ${({ theme }) => theme.heading};
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
`;

/* =========================
   Table Card
========================= */
const TableCard = styled(motion.div)`
  margin-top: 1rem;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.08)});
`;

/* Responsive table: scroll on small screens */
const TableScroll = styled.div`
  width: 100%;
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 920px; /* ensures columns keep readable, scroll on small screens */

  th,
  td {
    padding: 0.95rem 1rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.border};
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
    transition: 0.12s;
  }
`;

const CellTitle = styled.div`
  font-weight: 950;
  color: ${({ theme }) => theme.heading};
`;

const CellMeta = styled.div`
  margin-top: 0.25rem;
  font-size: 0.82rem;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.78 : 0.82)};
  line-height: 1.35;
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

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  background: ${({ theme }) => theme.accent};
  border: 1px solid transparent;
  color: #fff;
  border-radius: 999px;
  padding: 0.55rem 0.8rem;
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    opacity: 0.98;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accentSoft};
    outline-offset: 3px;
  }
`;

const SecondaryBtn = styled(Btn)`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: none;

  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

const Empty = styled.div`
  padding: 1.6rem 1rem;
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
function safeText(v) {
  return String(v ?? "").trim();
}

function labelClienteFromJoin(row) {
  const c = row?.cliente_ref;
  if (!c) return row?.cliente || "-";

  if (c.tipo_cliente === "empresa") {
    const rnc = c.empresa_rnc || "-";
    return `${c.nombre} (RNC: ${rnc})`;
  }
  const ced = c.cedula || "-";
  return `${c.nombre} (Cédula: ${ced})`;
}

function matchesQueryPreventa(preventa, q) {
  if (!q) return true;
  const p = preventa || {};
  const c = p.cliente_ref || {};

  const haystack = [
    p.id,
    p.numero_caso,
    p.cliente,
    p.tipo_cliente,
    p.email,
    p.telefono,
    p.cedula,
    p.empresa_rnc,
    c.id,
    c.nombre,
    c.cedula,
    c.empresa_rnc,
    c.email,
    c.telefono,
  ]
    .map((x) => safeText(x).toLowerCase())
    .join(" | ");

  return haystack.includes(q);
}

function matchesQueryCotizacion(cot, q) {
  if (!q) return true;
  const c = cot || {};
  const cli = c.cliente_ref || {};
  const prev = c.preventa_ref || {};

  const haystack = [
    c.id,
    c.estado,
    c.numero_caso,
    c.preventa_id,
    c.solicitud_id,
    c.cliente,
    cli.id,
    cli.nombre,
    cli.cedula,
    cli.empresa_rnc,
    cli.email,
    cli.telefono,
    prev.id,
    prev.numero_caso,
  ]
    .map((x) => safeText(x).toLowerCase())
    .join(" | ");

  return haystack.includes(q);
}

function withinDateWindow(record, windowKey, dateField) {
  if (!windowKey || windowKey === "all") return true;
  const raw = record?.[dateField];
  if (!raw) return true;

  const created = new Date(raw).getTime();
  if (!Number.isFinite(created)) return true;

  const now = Date.now();

  if (windowKey === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return created >= d.getTime();
  }

  const days = Number(windowKey);
  if (!Number.isFinite(days) || days <= 0) return true;

  const ms = days * 24 * 60 * 60 * 1000;
  return created >= now - ms;
}

function formatDateTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) return "-";
  return d.toLocaleString();
}

function dateWindowLabel(key) {
  if (key === "today") return "Hoy";
  if (key === "7") return "Últimos 7 días";
  if (key === "30") return "Últimos 30 días";
  if (key === "90") return "Últimos 90 días";
  return "Todos";
}

function tabLabel(key) {
  switch (key) {
    case "enviada":
      return "Llegaron ahora";
    case "en_revision":
      return "Activas";
    case "cotizando":
      return "Cotizando";
    case "cotizada":
      return "Cotizadas";
    case "cerrada":
      return "Ventas (Aceptadas)";
    case "cancelada":
      return "Canceladas";
    case "almacen":
      return "En almacén / Preparación";
    default:
      return key;
  }
}

/* ==================== COMPONENTE ==================== */
export default function Tickets() {
  const navigate = useNavigate();

  // preventas tabs + tab almacen
  const [tab, setTab] = useState("enviada"); // enviada/en_revision/cotizando/cotizada/cerrada/cancelada/almacen
  const [loading, setLoading] = useState(true);

  const [preventas, setPreventas] = useState([]);
  const [almacenCotizaciones, setAlmacenCotizaciones] = useState([]);

  const [query, setQuery] = useState("");
  const [dateWindow, setDateWindow] = useState("7"); // today | 7 | 30 | 90 | all

  const prefersReducedMotion = useReducedMotion();
  const motionProps = useMemo(() => {
    if (prefersReducedMotion) return { initial: false, animate: false };
    return { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.15 } };
  }, [prefersReducedMotion]);

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarTodo() {
    try {
      setLoading(true);

      // 1) PREVENTAS (con join a clientes)
      const { data: prevData, error: prevErr } = await supabase
        .from("preventas")
        .select(`
          *,
          cliente_ref:clientes!preventas_cliente_id_fkey (
            id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, es_recurrente, puede_fiar
          )
        `)
        .order("creado_en", { ascending: false });

      if (prevErr) throw prevErr;
      setPreventas(prevData || []);

      // 2) COTIZACIONES EN ALMACÉN (estado = "preparacion")
      const { data: cotData, error: cotErr } = await supabase
        .from("cotizaciones")
        .select(`
          id, estado, fecha, total, descuento, numero_caso, preventa_id, solicitud_id, cliente,
          cliente_ref:clientes!cotizaciones_cliente_id_fkey (
            id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, es_recurrente, puede_fiar
          ),
          preventa_ref:preventas!cotizaciones_preventa_id_fkey (
            id, numero_caso
          )
        `)
        .eq("estado", "preparacion")
        .order("fecha", { ascending: false });

      if (cotErr) throw cotErr;
      setAlmacenCotizaciones(cotData || []);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar los tickets.", "error");
    } finally {
      setLoading(false);
    }
  }

  const counts = useMemo(() => {
    const c = {
      enviada: 0,
      en_revision: 0,
      cotizando: 0,
      cotizada: 0,
      cerrada: 0,
      cancelada: 0,
      almacen: 0,
    };
    for (const p of preventas) {
      if (c[p.estado] !== undefined) c[p.estado]++;
    }
    c.almacen = (almacenCotizaciones || []).length;
    return c;
  }, [preventas, almacenCotizaciones]);

  const listFiltered = useMemo(() => {
    const q = safeText(query).toLowerCase();

    if (tab === "almacen") {
      return (almacenCotizaciones || [])
        .filter((c) => withinDateWindow(c, dateWindow, "fecha"))
        .filter((c) => matchesQueryCotizacion(c, q));
    }

    const base = (preventas || []).filter((p) => p.estado === tab);
    return base
      .filter((p) => withinDateWindow(p, dateWindow, "creado_en"))
      .filter((p) => matchesQueryPreventa(p, q));
  }, [tab, preventas, almacenCotizaciones, query, dateWindow]);

  function verDetallesPreventa(preventaId) {
    navigate(`/admin/preventa/${preventaId}`);
  }

  function crearCotizacionDesdePreventa(preventaId) {
    navigate(`/admin/cotizaciones?nuevo=1&preventa=${preventaId}`);
  }

  async function cambiarEstadoPreventa(preventa, nuevo) {
    const res = await Swal.fire({
      icon: "question",
      title: "Cambiar estado",
      text: `¿Marcar preventa ${preventa.numero_caso || "#" + preventa.id} como "${nuevo}"?`,
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
    });
    if (!res.isConfirmed) return;

    const { error } = await supabase
      .from("preventas")
      .update({ estado: nuevo })
      .eq("id", preventa.id);

    if (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar el estado.", "error");
      return;
    }
    cargarTodo();
  }

  const activeFilterPills = useMemo(() => {
    const pills = [];
    if (query.trim()) pills.push({ key: "q", label: `Búsqueda: "${query.trim()}"` });
    if (dateWindow !== "all") pills.push({ key: "d", label: `Fecha: ${dateWindowLabel(dateWindow)}` });
    pills.push({ key: "t", label: `Vista: ${tabLabel(tab)}` });
    return pills;
  }, [query, dateWindow, tab]);

  function clearSearch() {
    setQuery("");
  }
  function resetFilters() {
    setQuery("");
    setDateWindow("7");
  }

  return (
    <Wrapper>
      <Container>
        <Header>
          <HeaderLeft>
            <h2>
              <Ticket size={18} />
              Tickets / Preventas
            </h2>
            <p>
              Búsqueda por #Caso, cliente, cédula, RNC, email o teléfono. Incluye la vista de “Almacén / Preparación”.
            </p>
          </HeaderLeft>

          <HeaderRight>
            <GhostBtn onClick={resetFilters} type="button" disabled={loading}>
              <Filter size={16} /> Reset filtros
            </GhostBtn>
            <PrimaryBtn onClick={cargarTodo} type="button" disabled={loading}>
              <RefreshCw size={16} /> {loading ? "Cargando..." : "Recargar"}
            </PrimaryBtn>
          </HeaderRight>
        </Header>

        <FiltersCard as={motion.div} {...motionProps} variants={floatIn} custom={0}>
          <FiltersRow>
            <SearchBox>
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar tickets..."
                aria-label="Buscar tickets"
              />
              {query.trim() ? (
                <ClearBtn onClick={clearSearch} type="button" aria-label="Limpiar búsqueda" title="Limpiar">
                  <X size={16} />
                </ClearBtn>
              ) : null}
            </SearchBox>

            <div style={{ display: "grid", gap: "0.4rem" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", opacity: 0.85, fontWeight: 900 }}>
                <CalendarDays size={16} />
                Rango
              </div>
              <Select value={dateWindow} onChange={(e) => setDateWindow(e.target.value)} aria-label="Filtrar por fecha">
                <option value="today">Hoy</option>
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="all">Todos</option>
              </Select>
            </div>
          </FiltersRow>

          <ActiveFilters>
            {activeFilterPills.map((p) => (
              <Pill key={p.key}>
                {p.key === "t" ? <Ticket size={14} /> : p.key === "d" ? <CalendarDays size={14} /> : <Search size={14} />}
                {p.label}
              </Pill>
            ))}
          </ActiveFilters>

          <TabsWrap>
            <TabButton $active={tab === "enviada"} onClick={() => setTab("enviada")}>
              Llegaron ahora <Count>{counts.enviada}</Count>
            </TabButton>
            <TabButton $active={tab === "en_revision"} onClick={() => setTab("en_revision")}>
              Activas <Count>{counts.en_revision}</Count>
            </TabButton>
            <TabButton $active={tab === "cotizando"} onClick={() => setTab("cotizando")}>
              Cotizando <Count>{counts.cotizando}</Count>
            </TabButton>
            <TabButton $active={tab === "cotizada"} onClick={() => setTab("cotizada")}>
              Cotizadas <Count>{counts.cotizada}</Count>
            </TabButton>
            <TabButton $active={tab === "cerrada"} onClick={() => setTab("cerrada")}>
              Ventas (Aceptadas) <Count>{counts.cerrada}</Count>
            </TabButton>
            <TabButton $active={tab === "cancelada"} onClick={() => setTab("cancelada")}>
              Canceladas <Count>{counts.cancelada}</Count>
            </TabButton>
            <TabButton $active={tab === "almacen"} onClick={() => setTab("almacen")}>
              <Boxes size={16} />
              Almacén / Preparación <Count>{counts.almacen}</Count>
            </TabButton>
          </TabsWrap>
        </FiltersCard>

        <TableCard as={motion.div} {...motionProps} variants={floatIn} custom={1}>
          {loading ? (
            <LoadingGrid>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} aria-hidden="true" />
              ))}
            </LoadingGrid>
          ) : listFiltered.length === 0 ? (
            <Empty>No hay resultados con esos filtros.</Empty>
          ) : tab === "almacen" ? (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>Cotización</th>
                    <th>#Caso</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Contacto</th>
                    <th>Fecha envío</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {listFiltered.map((c) => {
                    const clienteLabel = labelClienteFromJoin(c);
                    const tipo = c?.cliente_ref?.tipo_cliente || "-";
                    const caso =
                      c?.preventa_ref?.numero_caso ||
                      c?.numero_caso ||
                      (c?.preventa_id ? `#${c.preventa_id}` : "-");

                    return (
                      <tr key={c.id}>
                        <td>
                          <CellTitle>#{c.id}</CellTitle>
                          <CellMeta>
                            {c?.solicitud_id ? <>Solicitud: <strong>#{c.solicitud_id}</strong></> : "—"}
                          </CellMeta>
                        </td>

                        <td>
                          <Badge>{caso || "-"}</Badge>
                        </td>

                        <td>
                          <CellTitle>{clienteLabel}</CellTitle>
                          {c?.cliente_ref ? (
                            <CellMeta>
                              Tipo: <strong>{tipo}</strong> · Recurrente:{" "}
                              <strong>{c.cliente_ref.es_recurrente ? "Sí" : "No"}</strong> · Puede fiar:{" "}
                              <strong>{c.cliente_ref.puede_fiar ? "Sí" : "No"}</strong>
                            </CellMeta>
                          ) : null}
                        </td>

                        <td>
                          <Badge>{c.estado || "-"}</Badge>
                        </td>

                        <td>
                          <div>{c?.cliente_ref?.email || "-"}</div>
                          <div>{c?.cliente_ref?.telefono || "-"}</div>
                        </td>

                        <td>{formatDateTime(c.fecha)}</td>

                        <td>
                          <ActionsCell>
                            <Btn onClick={() => navigate(`/admin/cotizaciones/${c.id}`)}>
                              <Eye size={16} /> Ver cotización
                            </Btn>

                            {c.preventa_id ? (
                              <SecondaryBtn onClick={() => verDetallesPreventa(c.preventa_id)}>
                                <Eye size={16} /> Ver ticket
                              </SecondaryBtn>
                            ) : null}
                          </ActionsCell>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableScroll>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>#Caso</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Contacto</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {listFiltered.map((p) => {
                    const clienteLabel = labelClienteFromJoin(p);
                    const tipo = p?.cliente_ref?.tipo_cliente || p.tipo_cliente || "-";

                    return (
                      <tr key={p.id}>
                        <td>
                          <CellTitle>#{p.id}</CellTitle>
                          <CellMeta>
                            Estado: <strong>{p.estado}</strong>
                          </CellMeta>
                        </td>

                        <td>
                          <Badge>{p.numero_caso || "-"}</Badge>
                        </td>

                        <td>
                          <CellTitle>{clienteLabel}</CellTitle>
                          {p?.cliente_ref ? (
                            <CellMeta>
                              Recurrente: <strong>{p.cliente_ref.es_recurrente ? "Sí" : "No"}</strong> · Puede fiar:{" "}
                              <strong>{p.cliente_ref.puede_fiar ? "Sí" : "No"}</strong>
                            </CellMeta>
                          ) : null}
                        </td>

                        <td>
                          <Badge>{tipo}</Badge>
                        </td>

                        <td>
                          <div>{p.email || p?.cliente_ref?.email || "-"}</div>
                          <div>{p.telefono || p?.cliente_ref?.telefono || "-"}</div>
                        </td>

                        <td>{formatDateTime(p.creado_en)}</td>

                        <td>
                          <ActionsCell>
                            <Btn onClick={() => verDetallesPreventa(p.id)}>
                              <Eye size={16} /> Ver
                            </Btn>

                            {tab !== "cotizando" ? (
                              <SecondaryBtn onClick={() => cambiarEstadoPreventa(p, "cotizando")}>
                                Marcar cotizando
                              </SecondaryBtn>
                            ) : null}

                            <SecondaryBtn onClick={() => crearCotizacionDesdePreventa(p.id)}>
                              <FilePlus2 size={16} /> Crear cotización
                            </SecondaryBtn>
                          </ActionsCell>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </TableCard>
      </Container>
    </Wrapper>
  );
}
