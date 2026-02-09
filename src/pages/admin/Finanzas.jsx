// src/pages/admin/Finanzas.jsx
import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import Swal from "sweetalert2";
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
  return d.toLocaleString();
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

  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const [topMode, setTopMode] = useState("vendidos"); // vendidos | cotizados
  const [topItems, setTopItems] = useState([]);

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

    const montoAdeudado = cotizaciones
      .filter((c) => {
        const st = (c.estado || "").toLowerCase();
        const mp = safeNumber(c.monto_pendiente, 0);
        return mp > 0 && c.usa_anticipo && ["aceptada", "preparacion", "despachado"].includes(st);
      })
      .reduce((acc, c) => acc + safeNumber(c.monto_pendiente, 0), 0);

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
      ticketProm,
      totCotizado,
      ventasCount,
      aceptadasCount,
      conversion,
    };
  }, [cotizaciones]);

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

  async function cargarTodo() {
    try {
      setLoading(true);
      setDiaSeleccionado(null);

      const start = startOfMonth(mesCursor);
      const end = endOfMonth(mesCursor);

      const { data: cot, error: cotErr } = await supabase
        .from("cotizaciones")
        .select(
          "id, cliente, cliente_id, vendedor_id, preventa_id, total, descuento, fecha, estado, usa_anticipo, monto_anticipo, monto_pendiente, aceptada_en, preparacion_en, rechazada_en, despachado_en"
        )
        .gte("fecha", start.toISOString())
        .lte("fecha", end.toISOString())
        .order("id", { ascending: false });

      if (cotErr) throw cotErr;
      const cotRows = (cot || []).map((c) => ({ ...c, estado: (c.estado || "pendiente").toLowerCase() }));
      setCotizaciones(cotRows);

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

  async function exportarCsvMesPasado() {
    try {
      const now = new Date();
      const prevMonth = startOfMonth(addMonths(now, -1));
      const start = startOfMonth(prevMonth);
      const end = endOfMonth(prevMonth);

      const { data: cot, error } = await supabase
        .from("cotizaciones")
        .select(
          "id, cliente, cliente_id, vendedor_id, preventa_id, total, descuento, fecha, estado, usa_anticipo, monto_anticipo, monto_pendiente, aceptada_en, preparacion_en, rechazada_en, despachado_en"
        )
        .gte("fecha", start.toISOString())
        .lte("fecha", end.toISOString())
        .order("id", { ascending: false });

      if (error) throw error;

      const rows = (cot || []).map((c) => ({
        id: c.id,
        cliente: c.cliente || "",
        cliente_id: c.cliente_id || "",
        vendedor_id: c.vendedor_id || "",
        preventa_id: c.preventa_id || "",
        total: safeNumber(c.total, 0),
        descuento: safeNumber(c.descuento, 0),
        estado: (c.estado || "").toLowerCase(),
        fecha: c.fecha || "",
        aceptada_en: c.aceptada_en || "",
        preparacion_en: c.preparacion_en || "",
        despachado_en: c.despachado_en || "",
        usa_anticipo: c.usa_anticipo ? "true" : "false",
        monto_anticipo: safeNumber(c.monto_anticipo, 0),
        monto_pendiente: safeNumber(c.monto_pendiente, 0),
      }));

      const headers = Object.keys(rows[0] || { id: "" });
      const csv = buildCsv(rows, headers);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `finanzas_cotizaciones_${start.getFullYear()}_${pad2(start.getMonth() + 1)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      Swal.fire("Listo", "CSV del mes pasado exportado.", "success");
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo exportar CSV del mes pasado.", "error");
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
            <GhostBtn onClick={() => setMesCursor(startOfMonth(addMonths(mesCursor, 1)))} disabled={loading}>
              <CalendarDays size={16} /> Mes siguiente
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
            <Muted>Sumatoria de monto_pendiente (plan 50/50) en aceptadas/preparación/despachadas.</Muted>
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <GhostBtn onClick={() => setMesCursor(startOfMonth(addMonths(mesCursor, -1)))} disabled={loading}>
                      Mes -1
                    </GhostBtn>
                    <GhostBtn onClick={() => setMesCursor(startOfMonth(addMonths(mesCursor, 1)))} disabled={loading}>
                      Mes +1
                    </GhostBtn>
                  </div>
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
            <GhostBtn onClick={limpiarCacheFinanzas}>
              <Filter size={16} /> Limpiar cache finanzas
            </GhostBtn>
          </div>
        </Panel>
      </Container>
    </Wrapper>
  );
}
