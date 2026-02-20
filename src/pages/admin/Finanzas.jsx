// src/pages/admin/Finanzas.jsx
import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../../supabase/supabase.config.jsx";
import {
  DollarSign,
  TrendingUp,
  Package,
  ClipboardList,
  CalendarDays,
  Download,
  RefreshCw,
  Filter,
  ShieldCheck,
  User,
  Clock,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Boxes,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";

/* =========================
   Animations
========================= */
const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

/* =========================
   CHART COLORS (ALL GRAPHS)
========================= */
const CHART = {
  // grid + axis baseline
  grid: "rgba(37, 99, 235, 0.16)",
  axis: "rgba(15, 23, 42, 0.55)",

  // line
  lineVentasDiarias: "#16a34a", // green

  // bar top10
  barTopMonto: "#f59e0b", // amber
  barTopQty: "#06b6d4", // cyan

  // optional: tick text (if you want)
  tick: "rgba(15, 23, 42, 0.70)",
};

// Pie palette (estado distribution)
const PIE_COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#14b8a6"];

// Stable colors by state (optional but recommended). If not found -> PIE_COLORS by index.
const PIE_COLOR_BY_STATE = {
  despachado: "#16a34a",
  aceptada: "#2563eb",
  preparacion: "#f59e0b",
  pendiente: "#64748b",
  rechazada: "#ef4444",
  sin_estado: "#a855f7",
};

/* =========================
   Layout
========================= */
const Wrapper = styled.section`
  width: 100%;
  color: ${({ theme }) => theme.text};
`;

const Container = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2.2rem;

  @media (max-width: 768px) {
    padding: 1rem 0.9rem 1.75rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  @media (max-width: 680px) {
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  min-width: 280px;
  flex: 1;

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
    max-width: 90ch;
  }

  @media (max-width: 680px) {
    h2 {
      font-size: 1.2rem;
    }
    p {
      font-size: 0.9rem;
    }
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 680px) {
    width: 100%;
    gap: 0.5rem;
  }
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
  justify-content: center;
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

  @media (max-width: 680px) {
    flex: 1;
    min-width: 150px;
    padding: 0.65rem 0.8rem;
    font-size: 0.9rem;
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
  color: ${({ theme }) => theme.accent};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 22px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.08)});
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.85rem;
  margin-top: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(6, 1fr);
  }

  @media (max-width: 680px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.7rem;
  }
`;

const StatCard = styled(Card)`
  grid-column: span 3;
  padding: 0.95rem 1rem;
  display: grid;
  gap: 0.45rem;

  @media (max-width: 980px) {
    grid-column: span 3;
  }
  @media (max-width: 680px) {
    grid-column: span 2;
    padding: 0.9rem 0.9rem;
  }
`;

const StatTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.65rem;
  align-items: center;
`;

const StatTitle = styled.div`
  font-weight: 950;
  opacity: 0.9;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
`;

const StatValue = styled.div`
  font-weight: 1000;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.heading};

  @media (max-width: 680px) {
    font-size: 1.15rem;
  }
`;

const Muted = styled.div`
  font-size: 0.88rem;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.78 : 0.84)};
  line-height: 1.4;
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Pill = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ $active, theme }) => ($active ? theme.accentSoft : theme.cardBackground)};
  color: ${({ theme }) => theme.accent};
  border-radius: 999px;
  padding: 0.55rem 0.78rem;
  cursor: pointer;
  font-weight: 950;
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 0.85rem;
  margin-top: 0.85rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled(Card)`
  padding: 1rem;

  @media (max-width: 680px) {
    padding: 0.9rem;
  }
`;

const PanelTitle = styled.div`
  font-weight: 1000;
  color: ${({ theme }) => theme.heading};
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.65rem;
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

const Banner = styled(Card)`
  padding: 0.95rem 1rem;
  margin-top: 0.85rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const BannerLeft = styled.div`
  display: grid;
  gap: 0.15rem;
`;

const BannerTitle = styled.div`
  font-weight: 1000;
  color: ${({ theme }) => theme.heading};
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
`;

const BannerActions = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;

  @media (max-width: 680px) {
    width: 100%;
    & > button {
      flex: 1;
      min-width: 160px;
    }
  }
`;

/* =========================
   Responsive Table (mobile cards)
========================= */
const TableWrap = styled.div`
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: ${({ $minWidth }) => ($minWidth ? `${$minWidth}px` : "980px")};

  th,
  td {
    padding: 0.85rem 0.95rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: top;
    font-size: 0.92rem;
    white-space: normal;
    word-break: break-word;
  }

  th {
    font-weight: 950;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.78rem;
    background: ${({ theme }) => theme.background};
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:hover td {
    background: ${({ theme }) => theme.background};
  }

  @media (max-width: 720px) {
    min-width: 0;

    thead {
      display: none;
    }

    tbody {
      display: grid;
      gap: 0.65rem;
      padding: 0.65rem;
    }

    tr {
      display: block;
      border: 1px solid ${({ theme }) => theme.border};
      border-radius: 14px;
      overflow: hidden;
      background: ${({ theme }) => theme.cardBackground};
    }

    td {
      display: flex;
      justify-content: space-between;
      gap: 0.9rem;
      padding: 0.7rem 0.8rem;
      border-bottom: 1px solid ${({ theme }) => theme.border};
      font-size: 0.92rem;
    }

    td::before {
      content: attr(data-label);
      flex: 0 0 auto;
      font-weight: 950;
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      opacity: ${({ theme }) => (theme.mode === "dark" ? 0.7 : 0.75)};
      padding-right: 0.6rem;
    }

    tr:hover td {
      background: transparent;
    }

    td:last-child {
      border-bottom: none;
    }
  }
`;

/* =========================
   Calendar
========================= */
const CalendarShell = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const CalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const CalTitle = styled.div`
  font-weight: 1000;
  color: ${({ theme }) => theme.heading};
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
`;

const CalGridWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.35rem;

  @media (max-width: 520px) {
    border-radius: 14px;
  }
`;

const CalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.55rem;
  min-width: 720px;

  @media (max-width: 980px) {
    min-width: 680px;
  }
  @media (max-width: 520px) {
    min-width: 640px;
    gap: 0.45rem;
  }
`;

const CalDayName = styled.div`
  font-size: 0.78rem;
  font-weight: 950;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 0.2rem;
`;

const CalCell = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme, $selected }) => ($selected ? theme.accentSoft : theme.background)};
  border-radius: 16px;
  padding: 0.55rem 0.6rem;
  min-height: 84px;
  display: grid;
  gap: 0.25rem;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.accent};
  }

  @media (max-width: 520px) {
    min-height: 78px;
    padding: 0.5rem 0.55rem;
  }
`;

const CalDayNum = styled.div`
  font-weight: 1000;
  color: ${({ theme, $muted }) =>
    $muted
      ? theme.mode === "dark"
        ? "rgba(255,255,255,0.35)"
        : "rgba(0,0,0,0.35)"
      : theme.heading};
  font-size: 0.9rem;
`;

const CalMini = styled.div`
  font-size: 0.82rem;
  opacity: 0.88;
  display: grid;
  gap: 0.12rem;

  span strong {
    font-weight: 1000;
  }

  @media (max-width: 520px) {
    font-size: 0.8rem;
  }
`;

const CodeBlock = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  opacity: 0.9;
`;

const MetaDetails = styled.details`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 0.6rem 0.7rem;

  summary {
    cursor: pointer;
    font-weight: 950;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.heading};
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::after {
    content: " ▾";
    opacity: 0.75;
  }

  &[open] summary::after {
    content: " ▴";
  }

  @media (min-width: 721px) {
    border: none;
    background: transparent;
    padding: 0;

    summary {
      display: none;
    }
  }
`;

/* =========================
   Helpers
========================= */
function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function ymd(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}
function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfMonth(d) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1, 1);
  x.setHours(0, 0, 0, 0);
  return new Date(x.getTime() - 1);
}
function addMonths(d, delta) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return x;
}
function fmtMoney(n) {
  return `RD$ ${safeNumber(n, 0).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDateTime(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString("es-DO").replace(/[\u00A0\u202F]/g, " ");
}
function monthLabel(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("es-DO", { month: "long", year: "numeric" });
}
function isBetweenDays1to5() {
  const day = new Date().getDate();
  return day >= 1 && day <= 5;
}

/* =========================
   Custom Tooltip (consistent)
========================= */
function CleanTooltip({ active, payload, label, money = false }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
        maxWidth: 280,
      }}
    >
      <div style={{ fontWeight: 950, marginBottom: 6 }}>{label}</div>
      {payload.map((p, idx) => (
        <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <span style={{ opacity: 0.9 }}>{p.name}</span>
          <strong>{money ? fmtMoney(p.value) : Number(p.value).toLocaleString("es-DO")}</strong>
        </div>
      ))}
    </div>
  );
}

// Ventana por estados (B)
const ESTADOS = {
  vendido: ["despachado"],
  comprometido: ["aceptada", "preparacion", "despachado"],
  pipeline: ["pendiente", "aceptada", "preparacion", "despachado"],
};

/* =========================
   Component
========================= */
export default function Finanzas() {
  const [loading, setLoading] = useState(true);

  const [mesCursor, setMesCursor] = useState(startOfMonth(new Date()));
  const [vista, setVista] = useState("vendido"); // vendido | comprometido | pipeline

  const [cotizaciones, setCotizaciones] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [usuariosMap, setUsuariosMap] = useState(new Map());
  const [montoAdeudadoLedger, setMontoAdeudadoLedger] = useState(0);
  const [resumenFiadoMes, setResumenFiadoMes] = useState({
    fiado: 0,
    pagado: 0,
    pendiente: 0,
  });
  const [resumenFlujoMes, setResumenFlujoMes] = useState({
    fiado_periodo: 0,
    pagado_periodo: 0,
  });
  const [carteraRows, setCarteraRows] = useState([]);

  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const [topMode, setTopMode] = useState("vendidos"); // vendidos | cotizados
  const [topItems, setTopItems] = useState([]);

  const carteraResumen = useMemo(() => {
    const out = {
      total: 0,
      clientes: 0,
      b0_30: 0,
      b31_60: 0,
      b61: 0,
      bsf: 0,
    };
    const uniqClientes = new Set();

    for (const r of carteraRows) {
      const pend = safeNumber(r.pendiente, 0);
      out.total += pend;
      if (r.cliente) uniqClientes.add(String(r.cliente));

      if (r.bucket === "0-30") out.b0_30 += pend;
      else if (r.bucket === "31-60") out.b31_60 += pend;
      else if (r.bucket === "61+") out.b61 += pend;
      else out.bsf += pend;
    }

    out.total = Number(out.total.toFixed(2));
    out.b0_30 = Number(out.b0_30.toFixed(2));
    out.b31_60 = Number(out.b31_60.toFixed(2));
    out.b61 = Number(out.b61.toFixed(2));
    out.bsf = Number(out.bsf.toFixed(2));
    out.clientes = uniqClientes.size;
    return out;
  }, [carteraRows]);

  const stats = useMemo(() => {
    const estadosVentaReal = ESTADOS.vendido;
    const estadosComp = ESTADOS.comprometido;

    const totalVendido = cotizaciones
      .filter((c) => estadosVentaReal.includes((c.estado || "").toLowerCase()))
      .reduce((acc, c) => acc + safeNumber(c.total, 0), 0);

    const totalComprometido = cotizaciones
      .filter((c) => estadosComp.includes((c.estado || "").toLowerCase()))
      .reduce((acc, c) => acc + safeNumber(c.total, 0), 0);

    const porDespachar = cotizaciones
      .filter((c) => ["aceptada", "preparacion"].includes((c.estado || "").toLowerCase()))
      .reduce((acc, c) => acc + safeNumber(c.total, 0), 0);

    const enPreparacion = cotizaciones
      .filter((c) => (c.estado || "").toLowerCase() === "preparacion")
      .reduce((acc, c) => acc + safeNumber(c.total, 0), 0);

    const montoAdeudado = Math.max(safeNumber(montoAdeudadoLedger, 0), 0);
    const cobrosFiadoMes = Math.max(safeNumber(resumenFlujoMes.pagado_periodo, 0), 0);
    const fiadoEmitidoMes = Math.max(safeNumber(resumenFlujoMes.fiado_periodo, 0), 0);
    const coberturaCobranza = fiadoEmitidoMes > 0 ? (cobrosFiadoMes / fiadoEmitidoMes) * 100 : 0;

    const ventasCount = cotizaciones.filter((c) => estadosVentaReal.includes((c.estado || "").toLowerCase())).length;
    const ticketProm = ventasCount ? totalVendido / ventasCount : 0;

    const totCotizado = cotizaciones.reduce((acc, c) => acc + safeNumber(c.total, 0), 0);

    const totalNoRech = cotizaciones.filter((c) => (c.estado || "").toLowerCase() !== "rechazada").length;
    const aceptadasCount = cotizaciones.filter((c) =>
      ["aceptada", "preparacion", "despachado"].includes((c.estado || "").toLowerCase())
    ).length;
    const conversion = totalNoRech ? (aceptadasCount / totalNoRech) * 100 : 0;

    return {
      totalVendido,
      totalComprometido,
      porDespachar,
      enPreparacion,
      montoAdeudado,
      cobrosFiadoMes,
      fiadoEmitidoMes,
      coberturaCobranza,
      ticketProm,
      totCotizado,
      ventasCount,
      aceptadasCount,
      conversion,
      carteraPendiente: carteraResumen.total,
      carteraClientes: carteraResumen.clientes,
    };
  }, [cotizaciones, montoAdeudadoLedger, resumenFlujoMes, carteraResumen]);

  const pieEstados = useMemo(() => {
    const map = new Map();
    for (const c of cotizaciones) {
      const st = (c.estado || "pendiente").toLowerCase();
      map.set(st, (map.get(st) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [cotizaciones]);

  const ventasDiarias = useMemo(() => {
    const map = new Map(); // ymd -> total
    for (const c of cotizaciones) {
      const st = (c.estado || "").toLowerCase();
      if (st !== "despachado") continue;

      const baseDate = c.despachado_en || c.fecha;
      if (!baseDate) continue;

      const k = ymd(baseDate);
      map.set(k, (map.get(k) || 0) + safeNumber(c.total, 0));
    }

    const start = startOfMonth(mesCursor);
    const end = endOfMonth(mesCursor);
    const out = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = ymd(d);
      out.push({ dia: k.slice(8, 10), fecha: k, total: safeNumber(map.get(k), 0) });
    }
    return out;
  }, [cotizaciones, mesCursor]);

  const calendarAgg = useMemo(() => {
    const map = new Map();
    const ensure = (k) => {
      if (!map.has(k)) map.set(k, { vendido: 0, comprometido: 0, countV: 0, countC: 0 });
      return map.get(k);
    };

    for (const c of cotizaciones) {
      const st = (c.estado || "").toLowerCase();

      if (st === "despachado") {
        const base = c.despachado_en || c.fecha;
        if (base) {
          const k = ymd(base);
          const r = ensure(k);
          r.vendido += safeNumber(c.total, 0);
          r.countV += 1;
        }
      }

      if (["aceptada", "preparacion", "despachado"].includes(st)) {
        const base =
          (st === "aceptada" ? c.aceptada_en : st === "preparacion" ? c.preparacion_en : c.despachado_en) || c.fecha;

        if (base) {
          const k = ymd(base);
          const r = ensure(k);
          r.comprometido += safeNumber(c.total, 0);
          r.countC += 1;
        }
      }
    }

    return map;
  }, [cotizaciones]);

  const calendarCells = useMemo(() => {
    const start = startOfMonth(mesCursor);
    const end = endOfMonth(mesCursor);

    const firstDayWeek = (start.getDay() + 6) % 7; // lunes=0
    const daysInMonth = end.getDate();

    const cells = [];

    for (let i = 0; i < firstDayWeek; i++) {
      cells.push({ type: "blank", key: `b-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(start);
      d.setDate(day);
      const k = ymd(d);
      const agg = calendarAgg.get(k) || { vendido: 0, comprometido: 0, countV: 0, countC: 0 };
      cells.push({
        type: "day",
        key: k,
        date: new Date(d),
        ymd: k,
        ...agg,
      });
    }

    return cells;
  }, [mesCursor, calendarAgg]);

  const cotizacionesDelDia = useMemo(() => {
    if (!diaSeleccionado) return [];
    const k = diaSeleccionado;
    const out = [];

    for (const c of cotizaciones) {
      const st = (c.estado || "").toLowerCase();

      const dVenta = st === "despachado" ? ymd(c.despachado_en || c.fecha || "") : null;

      const dComp =
        ["aceptada", "preparacion", "despachado"].includes(st)
          ? ymd((st === "aceptada" ? c.aceptada_en : st === "preparacion" ? c.preparacion_en : c.despachado_en) || c.fecha || "")
          : null;

      if (dVenta === k || dComp === k) out.push(c);
    }

    out.sort((a, b) => safeNumber(b.total, 0) - safeNumber(a.total, 0));
    return out;
  }, [cotizaciones, diaSeleccionado]);

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesCursor]);

  async function calcularFiadoPorCotizaciones(cotizacionesRows, options = {}) {
    const startTs = options?.start ? new Date(options.start).getTime() : null;
    const endTs = options?.end ? new Date(options.end).getTime() : null;
    const cotIds = Array.from(
      new Set(
        (cotizacionesRows || [])
          .map((c) => Number(c?.id))
          .filter((id) => Number.isFinite(id) && id > 0)
      )
    );

    if (!cotIds.length) {
      return {
        cotIds,
        byCot: new Map(),
        totals: { fiado: 0, pagado: 0, pendiente: 0, fiado_periodo: 0, pagado_periodo: 0 },
        error: null,
      };
    }

    const chunks = [];
    for (let i = 0; i < cotIds.length; i += 200) chunks.push(cotIds.slice(i, i + 200));

    const movimientos = [];

    for (const chunkIds of chunks) {
      const { data: movFiado, error: movFiadoErr } = await supabase
        .from("fiados_movimientos")
        .select("ref_id, tipo, monto, fecha")
        .eq("ref_tipo", "cotizacion")
        .in("ref_id", chunkIds);

      if (movFiadoErr) {
        return {
          cotIds,
          byCot: new Map(),
          totals: { fiado: 0, pagado: 0, pendiente: 0, fiado_periodo: 0, pagado_periodo: 0 },
          error: movFiadoErr,
        };
      }

      if (movFiado?.length) movimientos.push(...movFiado);
    }

    const byCot = new Map();
    let totalFiadoMes = 0;
    let totalPagadoMes = 0;
    let totalFiadoPeriodo = 0;
    let totalPagadoPeriodo = 0;

    for (const m of movimientos) {
      const refId = Number(m?.ref_id);
      if (!Number.isFinite(refId) || refId <= 0) continue;

      const tipo = String(m?.tipo || "").toLowerCase();
      const monto = safeNumber(m?.monto, 0);
      const fecha = m?.fecha || null;
      const moveTs = fecha ? new Date(fecha).getTime() : null;
      const inPeriodo =
        Number.isFinite(startTs) &&
        Number.isFinite(endTs) &&
        Number.isFinite(moveTs) &&
        moveTs >= startTs &&
        moveTs <= endTs;

      const current = byCot.get(refId) || {
        fiado: 0,
        pago: 0,
        pendiente: 0,
        first_fiado: null,
        last_move: null,
        fiado_periodo: 0,
        pagado_periodo: 0,
      };
      if (tipo === "fiado") {
        current.fiado += monto;
        totalFiadoMes += monto;
        if (inPeriodo) {
          current.fiado_periodo += monto;
          totalFiadoPeriodo += monto;
        }
        if (fecha && (!current.first_fiado || new Date(fecha).getTime() < new Date(current.first_fiado).getTime())) {
          current.first_fiado = fecha;
        }
      }
      if (tipo === "pago") {
        current.pago += monto;
        totalPagadoMes += monto;
        if (inPeriodo) {
          current.pagado_periodo += monto;
          totalPagadoPeriodo += monto;
        }
      }

      if (fecha && (!current.last_move || new Date(fecha).getTime() > new Date(current.last_move).getTime())) {
        current.last_move = fecha;
      }
      byCot.set(refId, current);
    }

    const totalAdeudadoMes = cotIds.reduce((acc, cotId) => {
      const meta = byCot.get(cotId);
      if (!meta) return acc;
      const pendiente = Math.max(safeNumber(meta.fiado, 0) - safeNumber(meta.pago, 0), 0);
      meta.pendiente = Number(pendiente.toFixed(2));
      byCot.set(cotId, meta);
      return acc + pendiente;
    }, 0);

    return {
      cotIds,
      byCot,
      totals: {
        fiado: Number(totalFiadoMes.toFixed(2)),
        pagado: Number(totalPagadoMes.toFixed(2)),
        pendiente: Number(totalAdeudadoMes.toFixed(2)),
        fiado_periodo: Number(totalFiadoPeriodo.toFixed(2)),
        pagado_periodo: Number(totalPagadoPeriodo.toFixed(2)),
      },
      error: null,
    };
  }

  async function cargarTodo() {
    try {
      setLoading(true);
      setDiaSeleccionado(null);

      const start = startOfMonth(mesCursor);
      const end = endOfMonth(mesCursor);

      const { data: cot, error: cotErr } = await supabase
        .from("cotizaciones")
        .select(
          "id, numero_caso, cliente, cliente_id, vendedor_id, preventa_id, total, descuento, fecha, estado, usa_anticipo, monto_anticipo, monto_pendiente, aceptada_en, preparacion_en, rechazada_en, despachado_en"
        )
        .gte("fecha", start.toISOString())
        .lte("fecha", end.toISOString())
        .order("id", { ascending: false });

      if (cotErr) throw cotErr;
      const cotRows = (cot || []).map((c) => ({ ...c, estado: (c.estado || "pendiente").toLowerCase() }));
      setCotizaciones(cotRows);

      const fiadoMes = await calcularFiadoPorCotizaciones(cotRows, { start, end });

      if (fiadoMes.error) {
        console.warn("fiados_movimientos:", fiadoMes.error);
        const fallbackAdeudado = cotRows
          .filter((c) => {
            const st = (c.estado || "").toLowerCase();
            const mp = safeNumber(c.monto_pendiente, 0);
            return mp > 0 && ["aceptada", "preparacion", "despachado"].includes(st);
          })
          .reduce((acc, c) => acc + safeNumber(c.monto_pendiente, 0), 0);
        const pendienteFallback = Number(fallbackAdeudado.toFixed(2));
        setMontoAdeudadoLedger(pendienteFallback);
        setResumenFiadoMes({
          fiado: pendienteFallback,
          pagado: 0,
          pendiente: pendienteFallback,
        });
        setResumenFlujoMes({
          fiado_periodo: 0,
          pagado_periodo: 0,
        });

        const nowTs = Date.now();
        const carteraFallback = cotRows
          .map((c) => {
            const pendiente = Math.max(safeNumber(c.monto_pendiente, 0), 0);
            if (pendiente <= 0) return null;

            const baseFecha = c.aceptada_en || c.fecha || null;
            const baseTs = baseFecha ? new Date(baseFecha).getTime() : null;
            const dias = Number.isFinite(baseTs) ? Math.max(Math.floor((nowTs - baseTs) / 86400000), 0) : null;
            const bucket = dias == null ? "sin_fecha" : dias <= 30 ? "0-30" : dias <= 60 ? "31-60" : "61+";

            return {
              cotizacion_id: c.id,
              referencia: c.numero_caso || `COT-${c.id}`,
              cliente: c.cliente || "-",
              estado: c.estado || "pendiente",
              pendiente: Number(pendiente.toFixed(2)),
              dias,
              bucket,
              fecha_base: baseFecha,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.pendiente - a.pendiente);
        setCarteraRows(carteraFallback);
      } else {
        setMontoAdeudadoLedger(fiadoMes.totals.pendiente);
        setResumenFiadoMes(fiadoMes.totals);
        const fiadoPeriodo = safeNumber(fiadoMes.totals.fiado_periodo, 0);
        const pagadoPeriodo = safeNumber(fiadoMes.totals.pagado_periodo, 0);
        setResumenFlujoMes({
          fiado_periodo: Number(fiadoPeriodo.toFixed(2)),
          pagado_periodo: Number(pagadoPeriodo.toFixed(2)),
        });

        const nowTs = Date.now();
        const cartera = cotRows
          .map((c) => {
            const meta = fiadoMes.byCot.get(Number(c.id));
            const pendiente = Math.max(safeNumber(meta?.pendiente, 0), 0);
            if (pendiente <= 0) return null;

            const baseFecha = meta?.first_fiado || c.aceptada_en || c.fecha || null;
            const baseTs = baseFecha ? new Date(baseFecha).getTime() : null;
            const dias = Number.isFinite(baseTs) ? Math.max(Math.floor((nowTs - baseTs) / 86400000), 0) : null;
            const bucket = dias == null ? "sin_fecha" : dias <= 30 ? "0-30" : dias <= 60 ? "31-60" : "61+";

            return {
              cotizacion_id: c.id,
              referencia: c.numero_caso || `COT-${c.id}`,
              cliente: c.cliente || "-",
              estado: c.estado || "pendiente",
              pendiente: Number(pendiente.toFixed(2)),
              dias,
              bucket,
              fecha_base: baseFecha,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.pendiente - a.pendiente);
        setCarteraRows(cartera);
      }

      const { data: mov, error: movErr } = await supabase
        .from("movimientos_finanzas")
        .select("id, created_at, actor_nombre, actor_rol, accion, cotizacion_id, preventa_id, monto, estado_anterior, estado_nuevo, meta")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false })
        .limit(250);

      if (movErr) {
        console.warn("movimientos_finanzas:", movErr);
        setMovimientos([]);
      } else {
        setMovimientos(mov || []);
      }

      const vendedorIds = Array.from(new Set(cotRows.map((c) => c.vendedor_id).filter(Boolean)));
      if (vendedorIds.length) {
        const { data: us, error: usErr } = await supabase.from("usuarios").select("id, nombre, email, rol").in("id", vendedorIds);
        if (usErr) console.warn(usErr);

        const m = new Map();
        for (const u of us || []) m.set(u.id, u);
        setUsuariosMap(m);
      } else {
        setUsuariosMap(new Map());
      }

      await cargarTop10({ cotizacionesMes: cotRows, mode: topMode });
    } catch (e) {
      console.error(e);
      setMontoAdeudadoLedger(0);
      setResumenFiadoMes({ fiado: 0, pagado: 0, pendiente: 0 });
      setResumenFlujoMes({ fiado_periodo: 0, pagado_periodo: 0 });
      setCarteraRows([]);
      Swal.fire("Error", "No se pudieron cargar los datos de Finanzas.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function cargarTop10({ cotizacionesMes, mode }) {
    try {
      const ids =
        mode === "vendidos"
          ? cotizacionesMes.filter((c) => (c.estado || "").toLowerCase() === "despachado").map((c) => c.id)
          : cotizacionesMes.filter((c) => (c.estado || "").toLowerCase() !== "rechazada").map((c) => c.id);

      if (!ids.length) {
        setTopItems([]);
        return;
      }

      const { data: det, error: detErr } = await supabase
        .from("detalle_cotizacion")
        .select("cotizacion_id, producto_id, equipo_id, cantidad, subtotal")
        .in("cotizacion_id", ids);

      if (detErr) throw detErr;

      const rows = det || [];
      const prodIds = Array.from(new Set(rows.map((r) => r.producto_id).filter((x) => x != null)));
      const eqIds = Array.from(new Set(rows.map((r) => r.equipo_id).filter((x) => x != null)));

      const [prodsRes, eqsRes] = await Promise.all([
        prodIds.length ? supabase.from("productos").select("id, nombre").in("id", prodIds) : Promise.resolve({ data: [], error: null }),
        eqIds.length ? supabase.from("equipos").select("id, nombre").in("id", eqIds) : Promise.resolve({ data: [], error: null }),
      ]);

      if (prodsRes.error) console.warn(prodsRes.error);
      if (eqsRes.error) console.warn(eqsRes.error);

      const prodMap = new Map((prodsRes.data || []).map((p) => [p.id, p.nombre || `Producto #${p.id}`]));
      const eqMap = new Map((eqsRes.data || []).map((e) => [e.id, e.nombre || `Equipo #${e.id}`]));

      const agg = new Map();
      for (const r of rows) {
        const isProd = r.producto_id != null;
        const key = isProd ? `p:${r.producto_id}` : `e:${r.equipo_id}`;
        const nombre = isProd ? prodMap.get(r.producto_id) : eqMap.get(r.equipo_id);
        const prev = agg.get(key) || { nombre: nombre || "Item", qty: 0, monto: 0 };
        prev.qty += safeNumber(r.cantidad, 0);
        prev.monto += safeNumber(r.subtotal, 0);
        agg.set(key, prev);
      }

      const top = Array.from(agg.values())
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 10)
        .map((x) => ({
          name: x.nombre,
          qty: x.qty,
          monto: Number(x.monto.toFixed(2)),
        }));

      setTopItems(top);
    } catch (e) {
      console.error(e);
      setTopItems([]);
    }
  }

  useEffect(() => {
    if (!cotizaciones.length) return;
    cargarTop10({ cotizacionesMes: cotizaciones, mode: topMode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topMode]);

  function buildCsv(rows, headers) {
    const escape = (v) => {
      const s = String(v ?? "");
      if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const out = [];
    out.push(headers.map(escape).join(","));
    for (const r of rows) {
      out.push(headers.map((h) => escape(r[h])).join(","));
    }
    return out.join("\n");
  }

  async function construirEstadoCuentaMes({ start, end }) {
    const { data: cot, error } = await supabase
      .from("cotizaciones")
      .select(
        "id, numero_caso, cliente, cliente_id, vendedor_id, preventa_id, total, descuento, fecha, estado, usa_anticipo, monto_anticipo, monto_pendiente, aceptada_en, preparacion_en, rechazada_en, despachado_en"
      )
      .gte("fecha", start.toISOString())
      .lte("fecha", end.toISOString())
      .order("id", { ascending: false });

    if (error) throw error;

    const cotRows = (cot || []).map((c) => ({
      ...c,
      estado: String(c.estado || "pendiente").toLowerCase(),
    }));
    const fiadoMes = await calcularFiadoPorCotizaciones(cotRows, { start, end });
    if (fiadoMes.error) console.warn("fiados_movimientos (estado_cuenta):", fiadoMes.error);

    const estadoOrden = {
      despachado: 1,
      preparacion: 2,
      aceptada: 3,
      pendiente: 4,
      rechazada: 5,
    };
    const estadoNombre = {
      despachado: "Despachado",
      preparacion: "Preparacion",
      aceptada: "Aceptada",
      pendiente: "Pendiente",
      rechazada: "Rechazada",
    };
    const periodoLabel = `${ymd(start)} a ${ymd(end)}`;

    const totalVendido = cotRows
      .filter((c) => c.estado === "despachado")
      .reduce((acc, c) => acc + safeNumber(c.total, 0), 0);
    const totalComprometido = cotRows
      .filter((c) => ["aceptada", "preparacion", "despachado"].includes(c.estado))
      .reduce((acc, c) => acc + safeNumber(c.total, 0), 0);
    const porDespachar = cotRows
      .filter((c) => ["aceptada", "preparacion"].includes(c.estado))
      .reduce((acc, c) => acc + safeNumber(c.total, 0), 0);
    const totalCotizado = cotRows.reduce((acc, c) => acc + safeNumber(c.total, 0), 0);

    const ventasCount = cotRows.filter((c) => c.estado === "despachado").length;
    const ticketProm = ventasCount ? totalVendido / ventasCount : 0;
    const totalNoRech = cotRows.filter((c) => c.estado !== "rechazada").length;
    const aceptadasCount = cotRows.filter((c) => ["aceptada", "preparacion", "despachado"].includes(c.estado)).length;
    const conversion = totalNoRech ? (aceptadasCount / totalNoRech) * 100 : 0;

    const fiadoTotalMes = fiadoMes.error
      ? cotRows.reduce((acc, c) => acc + safeNumber(c.monto_pendiente, 0), 0)
      : safeNumber(fiadoMes.totals.fiado, 0);
    const pagadoTotalMes = fiadoMes.error ? 0 : safeNumber(fiadoMes.totals.pagado, 0);
    const fiadoPeriodoMes = fiadoMes.error ? fiadoTotalMes : safeNumber(fiadoMes.totals.fiado_periodo, 0);
    const pagadoPeriodoMes = fiadoMes.error ? 0 : safeNumber(fiadoMes.totals.pagado_periodo, 0);
    const pendienteFiadoMes = fiadoMes.error ? fiadoTotalMes : safeNumber(fiadoMes.totals.pendiente, 0);

    const resumenGeneralRows = [
      {
        seccion: "RESUMEN_GENERAL",
        orden: "001",
        periodo: periodoLabel,
        concepto: "Total cotizado",
        estado: "",
        cantidad: cotRows.length,
        monto: Number(totalCotizado.toFixed(2)),
        detalle: "Moneda RD$",
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: "",
        pagado_total: "",
        pendiente_fiado: "",
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      },
      {
        seccion: "RESUMEN_GENERAL",
        orden: "002",
        periodo: periodoLabel,
        concepto: "Ventas despachadas",
        estado: "despachado",
        cantidad: ventasCount,
        monto: Number(totalVendido.toFixed(2)),
        detalle: "",
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: "",
        pagado_total: "",
        pendiente_fiado: "",
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      },
      {
        seccion: "RESUMEN_GENERAL",
        orden: "003",
        periodo: periodoLabel,
        concepto: "Comprometido",
        estado: "aceptada/preparacion/despachado",
        cantidad: aceptadasCount,
        monto: Number(totalComprometido.toFixed(2)),
        detalle: "",
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: "",
        pagado_total: "",
        pendiente_fiado: "",
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      },
      {
        seccion: "RESUMEN_GENERAL",
        orden: "004",
        periodo: periodoLabel,
        concepto: "Por despachar",
        estado: "aceptada/preparacion",
        cantidad: cotRows.filter((c) => ["aceptada", "preparacion"].includes(c.estado)).length,
        monto: Number(porDespachar.toFixed(2)),
        detalle: "",
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: "",
        pagado_total: "",
        pendiente_fiado: "",
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      },
      {
        seccion: "RESUMEN_GENERAL",
        orden: "005",
        periodo: periodoLabel,
        concepto: "Ticket promedio",
        estado: "despachado",
        cantidad: ventasCount,
        monto: Number(ticketProm.toFixed(2)),
        detalle: "",
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: "",
        pagado_total: "",
        pendiente_fiado: "",
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      },
      {
        seccion: "RESUMEN_GENERAL",
        orden: "006",
        periodo: periodoLabel,
        concepto: "Conversion",
        estado: "",
        cantidad: `${conversion.toFixed(1)}%`,
        monto: "",
        detalle: `${aceptadasCount}/${totalNoRech}`,
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: "",
        pagado_total: "",
        pendiente_fiado: "",
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      },
      {
        seccion: "RESUMEN_GENERAL",
        orden: "007",
        periodo: periodoLabel,
        concepto: "Fiado total",
        estado: "",
        cantidad: "",
        monto: Number(fiadoTotalMes.toFixed(2)),
        detalle: "Ledger fiados_movimientos",
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: Number(fiadoTotalMes.toFixed(2)),
        pagado_total: Number(pagadoTotalMes.toFixed(2)),
        pendiente_fiado: Number(pendienteFiadoMes.toFixed(2)),
        fiado_periodo: Number(fiadoPeriodoMes.toFixed(2)),
        pagado_periodo: Number(pagadoPeriodoMes.toFixed(2)),
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      },
      {
        seccion: "RESUMEN_GENERAL",
        orden: "008",
        periodo: periodoLabel,
        concepto: "Fiado pagado",
        estado: "",
        cantidad: "",
        monto: Number(pagadoTotalMes.toFixed(2)),
        detalle: "Ledger fiados_movimientos",
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: Number(fiadoTotalMes.toFixed(2)),
        pagado_total: Number(pagadoTotalMes.toFixed(2)),
        pendiente_fiado: Number(pendienteFiadoMes.toFixed(2)),
        fiado_periodo: Number(fiadoPeriodoMes.toFixed(2)),
        pagado_periodo: Number(pagadoPeriodoMes.toFixed(2)),
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      },
      {
        seccion: "RESUMEN_GENERAL",
        orden: "009",
        periodo: periodoLabel,
        concepto: "Fiado pendiente",
        estado: "",
        cantidad: "",
        monto: Number(pendienteFiadoMes.toFixed(2)),
        detalle: "Ledger fiados_movimientos",
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: Number(fiadoTotalMes.toFixed(2)),
        pagado_total: Number(pagadoTotalMes.toFixed(2)),
        pendiente_fiado: Number(pendienteFiadoMes.toFixed(2)),
        fiado_periodo: Number(fiadoPeriodoMes.toFixed(2)),
        pagado_periodo: Number(pagadoPeriodoMes.toFixed(2)),
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      },
    ];

    const aggEstado = new Map();
    for (const c of cotRows) {
      const st = String(c.estado || "pendiente").toLowerCase();
      if (!aggEstado.has(st)) aggEstado.set(st, { cantidad: 0, monto: 0 });
      const cur = aggEstado.get(st);
      cur.cantidad += 1;
      cur.monto += safeNumber(c.total, 0);
    }

    const resumenEstadoRows = Array.from(aggEstado.entries())
      .sort((a, b) => (estadoOrden[a[0]] || 99) - (estadoOrden[b[0]] || 99))
      .map(([st, v], idx) => ({
        seccion: "RESUMEN_POR_ESTADO",
        orden: `1${String(idx + 1).padStart(2, "0")}`,
        periodo: periodoLabel,
        concepto: "Distribucion por estado",
        estado: st,
        cantidad: v.cantidad,
        monto: Number(v.monto.toFixed(2)),
        detalle: estadoNombre[st] || st,
        fecha: "",
        cotizacion_id: "",
        referencia: "",
        cliente: "",
        fiado_total: "",
        pagado_total: "",
        pendiente_fiado: "",
        vendedor_id: "",
        cliente_id: "",
        preventa_id: "",
      }));

    const detalleRows = cotRows
      .slice()
      .sort((a, b) => {
        const stCmp = (estadoOrden[a.estado] || 99) - (estadoOrden[b.estado] || 99);
        if (stCmp !== 0) return stCmp;
        const ta = new Date(a.fecha || 0).getTime();
        const tb = new Date(b.fecha || 0).getTime();
        if (ta !== tb) return tb - ta;
        return safeNumber(b.id, 0) - safeNumber(a.id, 0);
      })
      .map((c, idx) => {
        const id = Number(c.id);
        const fallbackPendiente = safeNumber(c.monto_pendiente, 0);
        const meta = fiadoMes.error
          ? null
          : fiadoMes.byCot.get(id) || { fiado: 0, pago: 0, fiado_periodo: 0, pagado_periodo: 0 };
        let fiadoTotal = 0;
        let pagadoTotal = 0;
        let pendienteFiado = 0;

        if (fiadoMes.error) {
          fiadoTotal = fallbackPendiente;
          pagadoTotal = 0;
          pendienteFiado = fallbackPendiente;
        } else {
          fiadoTotal = Number(safeNumber(meta.fiado, 0).toFixed(2));
          pagadoTotal = Number(safeNumber(meta.pago, 0).toFixed(2));
          pendienteFiado = Number(Math.max(fiadoTotal - pagadoTotal, 0).toFixed(2));
        }

        return {
          seccion: "DETALLE_COTIZACIONES",
          orden: `2${String(idx + 1).padStart(4, "0")}`,
          periodo: periodoLabel,
          concepto: "Cotizacion",
          estado: c.estado,
          cantidad: 1,
          monto: Number(safeNumber(c.total, 0).toFixed(2)),
          detalle: estadoNombre[c.estado] || c.estado,
          fecha: fmtDateTime(c.fecha),
          cotizacion_id: c.id,
          referencia: c.numero_caso || `COT-${c.id}`,
          cliente: c.cliente || "",
          fiado_total: fiadoTotal,
          pagado_total: pagadoTotal,
          pendiente_fiado: pendienteFiado,
          fiado_periodo: Number(safeNumber(meta?.fiado_periodo, 0).toFixed(2)),
          pagado_periodo: Number(safeNumber(meta?.pagado_periodo, 0).toFixed(2)),
          vendedor_id: c.vendedor_id || "",
          cliente_id: c.cliente_id || "",
          preventa_id: c.preventa_id || "",
        };
      });

    const rows = [...resumenGeneralRows, ...resumenEstadoRows, ...detalleRows];
    const headers = [
      "seccion",
      "orden",
      "periodo",
      "concepto",
      "estado",
      "cantidad",
      "monto",
      "detalle",
      "fecha",
      "cotizacion_id",
      "referencia",
      "cliente",
      "fiado_total",
      "pagado_total",
      "pendiente_fiado",
      "fiado_periodo",
      "pagado_periodo",
      "vendedor_id",
      "cliente_id",
      "preventa_id",
    ];

    return {
      rows,
      headers,
      resumenGeneralRows,
      resumenEstadoRows,
      detalleRows,
      periodoLabel,
    };
  }

  async function exportarCsvMesPasado() {
    try {
      const now = new Date();
      const prevMonth = startOfMonth(addMonths(now, -1));
      const start = startOfMonth(prevMonth);
      const end = endOfMonth(prevMonth);

      const { rows, headers } = await construirEstadoCuentaMes({ start, end });
      const csv = buildCsv(rows, headers);

      const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `finanzas_estado_cuenta_${start.getFullYear()}_${pad2(start.getMonth() + 1)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      Swal.fire("Listo", "CSV de estado de cuenta exportado.", "success");
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo exportar el CSV de estado de cuenta.", "error");
    }
  }

  async function exportarPdfMesPasado() {
    try {
      const now = new Date();
      const prevMonth = startOfMonth(addMonths(now, -1));
      const start = startOfMonth(prevMonth);
      const end = endOfMonth(prevMonth);

      const { resumenGeneralRows, resumenEstadoRows, detalleRows, periodoLabel } = await construirEstadoCuentaMes({
        start,
        end,
      });

      const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "landscape" });
      const marginX = 34;
      const pageW = doc.internal.pageSize.getWidth();
      let y = 34;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Estado de Cuenta - Finanzas", marginX, y);
      y += 18;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Periodo: ${periodoLabel}`, marginX, y);
      doc.text(`Generado: ${fmtDateTime(new Date().toISOString())}`, pageW - marginX, y, { align: "right" });
      y += 14;

      autoTable(doc, {
        startY: y,
        head: [["Concepto", "Estado", "Cantidad", "Monto", "Detalle"]],
        body: resumenGeneralRows.map((r) => [
          r.concepto,
          r.estado || "-",
          String(r.cantidad ?? ""),
          r.monto !== "" ? fmtMoney(r.monto) : "",
          r.detalle || "",
        ]),
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      });

      y = doc.lastAutoTable.finalY + 12;

      autoTable(doc, {
        startY: y,
        head: [["Estado", "Cantidad", "Monto"]],
        body: resumenEstadoRows.map((r) => [r.estado, String(r.cantidad ?? 0), fmtMoney(r.monto)]),
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      });

      y = doc.lastAutoTable.finalY + 12;

      autoTable(doc, {
        startY: y,
        head: [["Ref", "Fecha", "Cliente", "Estado", "Monto", "Fiado", "Pagado", "Pendiente"]],
        body: detalleRows.map((r) => [
          r.referencia || `#${r.cotizacion_id}`,
          r.fecha || "",
          r.cliente || "",
          r.estado || "",
          fmtMoney(r.monto),
          fmtMoney(r.fiado_total),
          fmtMoney(r.pagado_total),
          fmtMoney(r.pendiente_fiado),
        ]),
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 3.5 },
        headStyles: { fillColor: [15, 23, 42], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 95 },
          1: { cellWidth: 95 },
          2: { cellWidth: 190 },
          3: { cellWidth: 70 },
          4: { cellWidth: 70, halign: "right" },
          5: { cellWidth: 70, halign: "right" },
          6: { cellWidth: 70, halign: "right" },
          7: { cellWidth: 80, halign: "right" },
        },
      });

      doc.save(`finanzas_estado_cuenta_${start.getFullYear()}_${pad2(start.getMonth() + 1)}.pdf`);
      Swal.fire("Listo", "PDF de estado de cuenta exportado.", "success");
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo exportar el PDF de estado de cuenta.", "error");
    }
  }

  async function limpiarCacheFinanzas() {
    const r = await Swal.fire({
      icon: "warning",
      title: "Limpiar datos de finanzas (cache)",
      text: "Esto NO borra cotizaciones ni ventas. Solo elimina datos auxiliares (finanzas_cache) de meses anteriores.",
      showCancelButton: true,
      confirmButtonText: "Sí, limpiar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53935",
    });
    if (!r.isConfirmed) return;

    const { error } = await supabase.rpc("finanzas_purge_cache");
    if (error) {
      console.error(error);
      Swal.fire("Aviso", "No se pudo limpiar cache. Verifica que exista la función finanzas_purge_cache().", "info");
      return;
    }
    Swal.fire("Listo", "Cache de finanzas limpiado.", "success");
  }

  function onSelectDay(cell) {
    if (!cell?.ymd) return;
    setDiaSeleccionado(cell.ymd);
  }

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <Wrapper>
      <Container>
        <Header>
          <HeaderLeft>
            <h2>
              <DollarSign size={18} />
              Gestión Finanzas
            </h2>
            <p>
              Métricas basadas en <strong>cotizaciones</strong>. Venta real: <strong>despachado</strong>. Comprometido:{" "}
              <strong>aceptada + preparacion + despachado</strong>. Incluye auditoría (logs) por usuario.
            </p>

            <PillRow>
              <Pill $active={vista === "vendido"} onClick={() => setVista("vendido")}>
                <Boxes size={16} /> Vendido (Despachado)
              </Pill>
              <Pill $active={vista === "comprometido"} onClick={() => setVista("comprometido")}>
                <TrendingUp size={16} /> Comprometido
              </Pill>
              <Pill $active={vista === "pipeline"} onClick={() => setVista("pipeline")}>
                <ClipboardList size={16} /> Pipeline
              </Pill>
            </PillRow>
          </HeaderLeft>

          <HeaderRight>
            <GhostBtn onClick={() => setMesCursor(startOfMonth(addMonths(mesCursor, -1)))} disabled={loading}>
              <CalendarDays size={16} /> Mes anterior
            </GhostBtn>

            <GhostBtn onClick={() => setMesCursor(startOfMonth(new Date()))} disabled={loading}>
              <Filter size={16} /> Ir a mes actual
            </GhostBtn>

            <PrimaryBtn onClick={cargarTodo} disabled={loading}>
              <RefreshCw size={16} /> {loading ? "Cargando..." : "Recargar"}
            </PrimaryBtn>
          </HeaderRight>
        </Header>

        {isBetweenDays1to5() ? (
          <Banner>
            <BannerLeft>
              <BannerTitle>
                <Clock size={18} />
                Recordatorio (días 1–5)
              </BannerTitle>
              <Muted>
                Puedes exportar el CSV del mes pasado. Si usas “limpieza mensual”, lo recomendado es limpiar{" "}
                <strong>solo cache</strong>, no cotizaciones.
              </Muted>
            </BannerLeft>
            <BannerActions>
              <GhostBtn onClick={exportarCsvMesPasado}>
                <Download size={16} /> Exportar CSV mes pasado
              </GhostBtn>
              <GhostBtn onClick={exportarPdfMesPasado}>
                <Download size={16} /> Exportar PDF mes pasado
              </GhostBtn>
              <GhostBtn onClick={limpiarCacheFinanzas}>
                <Filter size={16} /> Limpiar cache finanzas
              </GhostBtn>
            </BannerActions>
          </Banner>
        ) : null}

        {/* =========================
            Cards resumen
        ========================= */}
        <Grid>
          <StatCard>
            <StatTop>
              <StatTitle>
                <DollarSign size={16} /> Ventas (Despachado)
              </StatTitle>
              <ShieldCheck size={16} />
            </StatTop>
            <StatValue>{fmtMoney(stats.totalVendido)}</StatValue>
            <Muted>Venta real confirmada por despacho.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <TrendingUp size={16} /> Comprometido
              </StatTitle>
              <TrendingUp size={16} />
            </StatTop>
            <StatValue>{fmtMoney(stats.totalComprometido)}</StatValue>
            <Muted>Aceptadas + preparación + despachadas.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <Boxes size={16} /> Por despachar
              </StatTitle>
              <Boxes size={16} />
            </StatTop>
            <StatValue>{fmtMoney(stats.porDespachar)}</StatValue>
            <Muted>Aceptadas y/o en preparación (no despachadas).</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <ClipboardList size={16} /> Total cotizado
              </StatTitle>
              <ClipboardList size={16} />
            </StatTop>
            <StatValue>{fmtMoney(stats.totCotizado)}</StatValue>
            <Muted>Sumatoria total de cotizaciones creadas en el mes.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <DollarSign size={16} /> Monto adeudado
              </StatTitle>
              <DollarSign size={16} />
            </StatTop>
            <StatValue>{fmtMoney(stats.montoAdeudado)}</StatValue>
            <Muted>Saldo pendiente del mes seleccionado (ledger de fiados: fiado - pagos).</Muted>
            <Muted>
              Fiado: <strong>{fmtMoney(resumenFiadoMes.fiado)}</strong> - Pagado: <strong>{fmtMoney(resumenFiadoMes.pagado)}</strong> -
              Pendiente: <strong>{fmtMoney(resumenFiadoMes.pendiente)}</strong>
            </Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <Package size={16} /> Ticket promedio
              </StatTitle>
              <Package size={16} />
            </StatTop>
            <StatValue>{fmtMoney(stats.ticketProm)}</StatValue>
            <Muted>Promedio de ventas reales (despachadas).</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <TrendingUp size={16} /> Conversión
              </StatTitle>
              <TrendingUp size={16} />
            </StatTop>
            <StatValue>{`${stats.conversion.toFixed(1)}%`}</StatValue>
            <Muted>Aceptadas/preparación/despachadas sobre total no rechazado.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <Boxes size={16} /> # Ventas reales
              </StatTitle>
              <Boxes size={16} />
            </StatTop>
            <StatValue>{stats.ventasCount}</StatValue>
            <Muted>Cantidad de cotizaciones despachadas (venta real).</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <DollarSign size={16} /> Fiado generado (mes)
              </StatTitle>
              <DollarSign size={16} />
            </StatTop>
            <StatValue>{fmtMoney(stats.fiadoEmitidoMes)}</StatValue>
            <Muted>Total de movimientos tipo fiado dentro del periodo.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <DollarSign size={16} /> Cobros fiado (mes)
              </StatTitle>
              <ShieldCheck size={16} />
            </StatTop>
            <StatValue>{fmtMoney(stats.cobrosFiadoMes)}</StatValue>
            <Muted>Total cobrado a fiados dentro del periodo.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <TrendingUp size={16} /> Cobertura cobros
              </StatTitle>
              <TrendingUp size={16} />
            </StatTop>
            <StatValue>{`${stats.coberturaCobranza.toFixed(1)}%`}</StatValue>
            <Muted>Cobrado del periodo dividido entre fiado del periodo.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <Clock size={16} /> Cartera CxC
              </StatTitle>
              <Clock size={16} />
            </StatTop>
            <StatValue>{fmtMoney(stats.carteraPendiente)}</StatValue>
            <Muted>Saldo pendiente activo en {stats.carteraClientes} cliente(s).</Muted>
          </StatCard>
        </Grid>

        {/* =========================
            Paneles: Calendario + Charts
        ========================= */}
        <TwoCol>
          <Panel>
            <PanelTitle>
              <CalendarDays size={18} /> Calendario · {monthLabel(mesCursor)}
            </PanelTitle>
            <Muted>
              Cada día muestra <strong>Vendido</strong> (despachado) y <strong>Comprometido</strong> (aceptada/preparación/despachado).
              Click en un día para ver detalle.
            </Muted>

            <div style={{ marginTop: 10 }}>
              <CalendarShell>
                <CalHeader>
                  <CalTitle>
                    <CalendarDays size={16} />
                    {monthLabel(mesCursor)}
                  </CalTitle>
                </CalHeader>

                <CalGridWrap>
                  <CalGrid>
                    {dayNames.map((n) => (
                      <CalDayName key={n}>{n}</CalDayName>
                    ))}

                    {loading ? (
                      Array.from({ length: 42 }).map((_, i) => <SkeletonRow key={i} aria-hidden="true" />)
                    ) : (
                      calendarCells.map((cell) => {
                        if (cell.type === "blank") return <div key={cell.key} />;

                        return (
                          <CalCell
                            key={cell.key}
                            onClick={() => onSelectDay(cell)}
                            $selected={diaSeleccionado === cell.ymd}
                            title="Click para ver detalle"
                          >
                            <CalDayNum>{cell.date.getDate()}</CalDayNum>
                            <CalMini>
                              <span>
                                Vendido: <strong>{fmtMoney(cell.vendido)}</strong>
                              </span>
                              <span>
                                Comprom.: <strong>{fmtMoney(cell.comprometido)}</strong>
                              </span>
                            </CalMini>
                          </CalCell>
                        );
                      })
                    )}
                  </CalGrid>
                </CalGridWrap>
              </CalendarShell>
            </div>

            {diaSeleccionado ? (
              <div style={{ marginTop: 12 }}>
                <PanelTitle>
                  <ClipboardList size={18} /> Detalle del día: {diaSeleccionado}
                </PanelTitle>

                <TableWrap>
                  <Table $minWidth={820}>
                    <thead>
                      <tr>
                        <th>Cotización</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                        <th>Monto</th>
                        <th>Vendedor</th>
                        <th>Fechas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotizacionesDelDia.length ? (
                        cotizacionesDelDia.map((c) => {
                          const vend = c.vendedor_id ? usuariosMap.get(c.vendedor_id) : null;
                          const vendedorLabel = vend ? vend.nombre || vend.email : c.vendedor_id ? `#${c.vendedor_id}` : "—";

                          return (
                            <tr key={c.id}>
                              <td data-label="Cotización">
                                <strong>#{c.id}</strong>
                                <div style={{ fontSize: 13, opacity: 0.8 }}>Preventa: {c.preventa_id ? `#${c.preventa_id}` : "—"}</div>
                              </td>
                              <td data-label="Cliente">{c.cliente || "—"}</td>
                              <td data-label="Estado">
                                <strong>{(c.estado || "").toLowerCase()}</strong>
                              </td>
                              <td data-label="Monto">
                                <strong>{fmtMoney(c.total)}</strong>
                              </td>
                              <td data-label="Vendedor">{vendedorLabel}</td>
                              <td data-label="Fechas" style={{ fontSize: 13, opacity: 0.9 }}>
                                <div>Creado: {fmtDateTime(c.fecha)}</div>
                                <div>Acept.: {fmtDateTime(c.aceptada_en)}</div>
                                <div>Prep.: {fmtDateTime(c.preparacion_en)}</div>
                                <div>Desp.: {fmtDateTime(c.despachado_en)}</div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} data-label="Info">
                            No hay cotizaciones asociadas a este día.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </TableWrap>
              </div>
            ) : null}
          </Panel>

          <div style={{ display: "grid", gap: "0.85rem" }}>
            {/* ===== LineChart with color ===== */}
            <Panel>
              <PanelTitle>
                <LineIcon size={18} /> Ventas diarias (Despachado)
              </PanelTitle>
              <Muted>Serie del mes actual seleccionado.</Muted>

              <div style={{ width: "100%", height: 280, marginTop: 10 }}>
                {loading ? (
                  <SkeletonRow />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ventasDiarias}>
                      <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <Tooltip content={<CleanTooltip money />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke={CHART.lineVentasDiarias}
                        strokeWidth={3}
                        dot={{ r: 2.5, fill: CHART.lineVentasDiarias }}
                        activeDot={{ r: 6, fill: CHART.lineVentasDiarias }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Panel>

            {/* ===== PieChart with colors ===== */}
            <Panel>
              <PanelTitle>
                <PieIcon size={18} /> Distribución por estado (conteo)
              </PanelTitle>
              <Muted>Conteo de cotizaciones por estado en el mes.</Muted>

              <div style={{ width: "100%", height: 280, marginTop: 10 }}>
                {loading ? (
                  <SkeletonRow />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0];
                          return (
                            <div
                              style={{
                                background: "rgba(255,255,255,0.92)",
                                border: "1px solid rgba(0,0,0,0.10)",
                                borderRadius: 12,
                                padding: "10px 12px",
                                boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
                                maxWidth: 240,
                              }}
                            >
                              <div style={{ fontWeight: 950, marginBottom: 6 }}>{p.name}</div>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <span style={{ opacity: 0.9 }}>Cantidad</span>
                                <strong>{Number(p.value).toLocaleString("es-DO")}</strong>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend />
                      <Pie data={pieEstados} dataKey="value" nameKey="name" outerRadius={90} label>
                        {pieEstados.map((entry, idx) => {
                          const st = String(entry.name || "").toLowerCase();
                          const byState = PIE_COLOR_BY_STATE[st];
                          const fallback = PIE_COLORS[idx % PIE_COLORS.length];
                          return <Cell key={`cell-${st}-${idx}`} fill={byState || fallback} />;
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Panel>
          </div>
        </TwoCol>

        {/* =========================
            Cuentas por cobrar (aging)
        ========================= */}
        <Panel style={{ marginTop: "0.85rem" }}>
          <PanelTitle>
            <Clock size={18} /> Cuentas por cobrar (antiguedad)
          </PanelTitle>
          <Muted>Antiguedad de saldo fiado pendiente para cotizaciones del periodo seleccionado.</Muted>

          <div
            style={{
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 8,
            }}
          >
            <div style={{ border: "1px solid rgba(148,163,184,.35)", borderRadius: 12, padding: "0.6rem 0.75rem" }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Total cartera</div>
              <strong>{fmtMoney(carteraResumen.total)}</strong>
            </div>
            <div style={{ border: "1px solid rgba(148,163,184,.35)", borderRadius: 12, padding: "0.6rem 0.75rem" }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>0-30 dias</div>
              <strong>{fmtMoney(carteraResumen.b0_30)}</strong>
            </div>
            <div style={{ border: "1px solid rgba(148,163,184,.35)", borderRadius: 12, padding: "0.6rem 0.75rem" }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>31-60 dias</div>
              <strong>{fmtMoney(carteraResumen.b31_60)}</strong>
            </div>
            <div style={{ border: "1px solid rgba(148,163,184,.35)", borderRadius: 12, padding: "0.6rem 0.75rem" }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>61+ dias</div>
              <strong>{fmtMoney(carteraResumen.b61)}</strong>
            </div>
            <div style={{ border: "1px solid rgba(148,163,184,.35)", borderRadius: 12, padding: "0.6rem 0.75rem" }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Sin fecha base</div>
              <strong>{fmtMoney(carteraResumen.bsf)}</strong>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <TableWrap>
              <Table $minWidth={920}>
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Antiguedad</th>
                    <th>Fecha base</th>
                    <th>Pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6}>
                        <SkeletonRow />
                      </td>
                    </tr>
                  ) : carteraRows.length ? (
                    carteraRows.slice(0, 80).map((r) => (
                      <tr key={`cartera-${r.cotizacion_id}`}>
                        <td data-label="Ref">
                          <strong>{r.referencia}</strong>
                          <div style={{ fontSize: 12, opacity: 0.8 }}>#{r.cotizacion_id}</div>
                        </td>
                        <td data-label="Cliente">{r.cliente}</td>
                        <td data-label="Estado">{r.estado}</td>
                        <td data-label="Antiguedad">
                          {r.dias == null ? "Sin fecha" : `${r.dias} d`}
                          <div style={{ fontSize: 12, opacity: 0.75 }}>{r.bucket}</div>
                        </td>
                        <td data-label="Fecha base">{fmtDateTime(r.fecha_base)}</td>
                        <td data-label="Pendiente">
                          <strong>{fmtMoney(r.pendiente)}</strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>No hay cartera pendiente para este periodo.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableWrap>
          </div>
        </Panel>

        {/* =========================
            Top 10 (BarChart with colors)
        ========================= */}
        <Panel style={{ marginTop: "0.85rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <PanelTitle>
                <BarChart3 size={18} /> Top 10 productos / equipos
              </PanelTitle>
              <Muted>“Vendidos” usa despachado. “Cotizados” usa todo excepto rechazadas.</Muted>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill $active={topMode === "vendidos"} onClick={() => setTopMode("vendidos")}>
                <Boxes size={16} /> Vendidos
              </Pill>
              <Pill $active={topMode === "cotizados"} onClick={() => setTopMode("cotizados")}>
                <ClipboardList size={16} /> Cotizados
              </Pill>
            </div>
          </div>

          <div style={{ width: "100%", height: 320, marginTop: 12 }}>
            {loading ? (
              <SkeletonRow />
            ) : topItems.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems}>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const name = payload?.[0]?.payload?.name || "Item";
                      return (
                        <div
                          style={{
                            background: "rgba(255,255,255,0.92)",
                            border: "1px solid rgba(0,0,0,0.10)",
                            borderRadius: 12,
                            padding: "10px 12px",
                            boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
                            maxWidth: 280,
                          }}
                        >
                          <div style={{ fontWeight: 950, marginBottom: 6 }}>{name}</div>
                          {payload.map((p, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                              <span style={{ opacity: 0.9 }}>{p.name}</span>
                              <strong>{p.dataKey === "monto" ? fmtMoney(p.value) : Number(p.value).toLocaleString("es-DO")}</strong>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="monto" name="Monto (RD$)" fill={CHART.barTopMonto} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="qty" name="Cantidad" fill={CHART.barTopQty} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Muted style={{ marginTop: 8 }}>No hay datos para top 10 con el filtro actual.</Muted>
            )}
          </div>
        </Panel>

        {/* =========================
            Actividad (logs)
        ========================= */}
        <Panel style={{ marginTop: "0.85rem" }}>
          <PanelTitle>
            <User size={18} /> Actividad / Logs (movimientos_finanzas)
          </PanelTitle>
          <Muted>Registra quién cambió estados y cuándo, con el monto vinculado a la cotización.</Muted>

          <div style={{ marginTop: 12 }}>
            <TableWrap>
              <Table $minWidth={980}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Actor</th>
                    <th>Acción</th>
                    <th>Cotización</th>
                    <th>Estados</th>
                    <th>Monto</th>
                    <th>Meta</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} data-label="Cargando">
                        <SkeletonRow />
                      </td>
                    </tr>
                  ) : movimientos.length ? (
                    movimientos.map((m) => (
                      <tr key={m.id}>
                        <td data-label="Fecha">{fmtDateTime(m.created_at)}</td>
                        <td data-label="Actor">
                          <strong>{m.actor_nombre || "—"}</strong>
                          <div style={{ fontSize: 13, opacity: 0.8 }}>{m.actor_rol || ""}</div>
                        </td>
                        <td data-label="Acción">
                          <strong>{m.accion}</strong>
                        </td>
                        <td data-label="Cotización">{m.cotizacion_id ? `#${m.cotizacion_id}` : "—"}</td>
                        <td data-label="Estados">
                          <div style={{ fontSize: 13, opacity: 0.9 }}>
                            {m.estado_anterior || "—"} → {m.estado_nuevo || "—"}
                          </div>
                        </td>
                        <td data-label="Monto">
                          <strong>{fmtMoney(m.monto)}</strong>
                        </td>
                        <td data-label="Meta" style={{ maxWidth: 420 }}>
                          <MetaDetails>
                            <summary>Ver meta</summary>
                            <CodeBlock>{JSON.stringify(m.meta || {}, null, 2)}</CodeBlock>
                          </MetaDetails>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} data-label="Info">
                        No hay logs en este mes (o faltan permisos/tabla).
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableWrap>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <GhostBtn onClick={exportarCsvMesPasado}>
              <Download size={16} /> Exportar CSV mes pasado
            </GhostBtn>
            <GhostBtn onClick={exportarPdfMesPasado}>
              <Download size={16} /> Exportar PDF mes pasado
            </GhostBtn>
            <GhostBtn onClick={limpiarCacheFinanzas}>
              <Filter size={16} /> Limpiar cache finanzas
            </GhostBtn>
          </div>
        </Panel>
      </Container>
    </Wrapper>
  );
}
