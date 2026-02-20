// src/pages/admin/Cotizaciones.jsx
import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import emailjs from "emailjs-com";
import {
  Eye,
  Trash2,
  Search,
  RefreshCw,
  Plus,
  FileText,
  Tag,
  Boxes,
  Package,
  ShieldCheck,
  Clock3,
  Ban,
  CheckCircle2,
  XCircle,
  Hourglass,
  CreditCard,
  BadgeDollarSign,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

/* =========================
   Animations
========================= */
const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

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
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const HeaderLeft = styled.div`
  min-width: 260px;

  h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 950;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.heading};
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
  }

  p {
    margin: 0.35rem 0 0;
    font-size: 0.92rem;
    line-height: 1.45;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.88)};
    max-width: 90ch;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
`;

/* =========================
   Buttons
========================= */

const BtnBase = styled.button`
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.68rem 0.95rem;
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
  color: ${({ theme }) => theme.accent};

  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

/* =========================
   Cards / sections
========================= */
const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 22px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.08)});
`;

const FormCard = styled(Card)`
  padding: 1.05rem;
`;

const Row = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const Split = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 18px;
  padding: 0.85rem 0.95rem;
  min-width: 0;
`;

const Full = styled(Field)`
  grid-column: 1 / -1;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.86)};
`;

const Input = styled.input`
  width: 100%;
  margin-top: 0.45rem;
  padding: 0.78rem 0.9rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.accent};
  font-weight: 800;

  &::placeholder {
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

const Select = styled.select`
  width: 100%;
  margin-top: 0.45rem;
  padding: 0.78rem 0.9rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.accent};
  font-weight: 800;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin: 0.95rem 0;
`;

const Muted = styled.div`
  font-size: 0.92rem;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.88)};
  line-height: 1.45;
`;

const InfoBanner = styled.div`
  margin-top: 0.65rem;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

const MiniStack = styled.div`
  display: grid;
  gap: 0.15rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.38rem 0.65rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  font-weight: 950;
  font-size: 0.84rem;
  opacity: 0.95;
`;

const Pill = styled.span`
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

const DangerBtn = styled(BtnBase)`
  padding: 0.55rem 0.75rem;
  background: transparent;
  border-color: ${({ theme }) => theme.border};
  color: #e53935;

  &:hover {
    border-color: #e53935;
  }
`;

const TinyActionBtn = styled(BtnBase)`
  padding: 0.45rem 0.65rem;
  border-radius: 12px;
  font-size: 0.82rem;
  background: ${({ theme }) => theme.cardBackground};
  border-color: ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.accent};

  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

const IconBtn = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.accent};
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.accent};
  }
  &:active {
    transform: translateY(1px);
  }
`;

/* =========================
   Tables (desktop) + cards (mobile)
========================= */
const TableWrap = styled.div`
  width: 100%;
  overflow: auto;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1040px;

  th,
  td {
    padding: 0.85rem 0.95rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    vertical-align: top;
    text-align: left;
    font-size: 0.94rem;
  }

  th {
    font-weight: 950;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.78rem;
    background: ${({ theme }) => theme.background};
  }

  tr:hover td {
    background: ${({ theme }) => theme.background};
  }
`;

const RowActions = styled.div`
  display: flex;
  gap: 0.45rem;
  align-items: center;
  flex-wrap: wrap;
`;

const MobileList = styled.div`
  display: none;
  margin-top: 0.8rem;
  gap: 0.8rem;

  @media (max-width: 820px) {
    display: grid;
  }
`;

const MobileCard = styled(Card)`
  padding: 0.95rem 1rem;
  display: grid;
  gap: 0.6rem;
`;

const MobileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
`;

const MobileTitle = styled.div`
  display: grid;
  gap: 0.15rem;

  strong {
    font-weight: 950;
    color: ${({ theme }) => theme.heading};
  }

  span {
    font-size: 0.9rem;
    opacity: 0.86;
  }
`;

const MobileMeta = styled.div`
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  align-items: center;
`;

const DesktopOnly = styled.div`
  @media (max-width: 820px) {
    display: none;
  }
`;

const Skeleton = styled.div`
  height: 74px;
  border-radius: 18px;
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

const EstadoBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ estado }) =>
    estado === "aceptada"
      ? "rgba(46, 204, 113, 0.16)"
      : estado === "rechazada" || estado === "cancelada"
      ? "rgba(231, 76, 60, 0.14)"
      : estado === "preparacion"
      ? "rgba(52, 152, 219, 0.14)"
      : estado === "pendiente"
      ?"rgba(241, 196, 15, 0.18)"
      : "rgba(46, 204, 113, 0.16)"};
  color: ${({ estado }) =>
    estado === "aceptada"
      ? "#27ae60"
      : estado === "rechazada" || estado === "cancelada"
      ? "#c0392b"
      : estado === "preparacion"
      ? "#2980b9"
      : estado === "pendiente"
      ? "#b7950b"
      : "#27ae60"};
`;

/* ===================== HELPERS ===================== */
function formatearEstado(estado) {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}
function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
const ITBIS_RATE = 0.18;

function calcularTotalesCotizacion(items = [], descuentoPct = 0) {
  const subtotalRaw = (items || []).reduce((acc, it) => {
    const cant = safeNumber(it?.cantidad, 0);
    const unit = safeNumber(it?.precioUnitario, 0);
    return acc + unit * cant;
  }, 0);
  const descuento = safeNumber(descuentoPct, 0);
  const descuentoMontoRaw = (subtotalRaw * descuento) / 100;
  const netoRaw = subtotalRaw - descuentoMontoRaw;
  const itbisRaw = netoRaw * ITBIS_RATE;
  const totalRaw = netoRaw + itbisRaw;
  const round2 = (n) => Number(safeNumber(n, 0).toFixed(2));

  return {
    subtotal: round2(subtotalRaw),
    descuentoPct: round2(descuento),
    descuentoMonto: round2(descuentoMontoRaw),
    neto: round2(netoRaw),
    itbis: round2(itbisRaw),
    total: round2(totalRaw),
  };
}

function fmtMoney(v) {
  return `RD$${safeNumber(v, 0).toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
function buildItemsTexto(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items
    .map((it) => {
      const tipoLabel = it?.tipo === "equipo" ? "Equipo" : "Producto";
      const nombre = String(it?.nombre || "-");
      const modelo = String(it?.modelo || "").trim();
      const cant = safeNumber(it?.cantidad, 0);
      return `â€¢ (${tipoLabel}) ${nombre} x${cant}${modelo ? ` - ${modelo}` : ""}`;
    })
    .join("\n");
}
function onlyDigits(v) {
  return String(v || "").replace(/\D/g, "");
}
function labelCliente(cli) {
  if (!cli) return "-";
  if (cli.tipo_cliente === "empresa") {
    return `${cli.nombre || "-"} (RNC: ${cli.empresa_rnc || "-"})`;
  }
  return `${cli.nombre || "-"} (Cedula: ${cli.cedula || "-"})`;
}
async function buscarClientePorDocumento({ tipo, documento }) {
  const doc = onlyDigits(documento);
  if (!doc) return null;

  if (tipo === "persona") {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar")
      .eq("cedula", doc)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar")
    .eq("empresa_rnc", doc)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

function estadoIcon(estado) {
  const e = String(estado || "").toLowerCase();
  if (e === "aceptada") return <CheckCircle2 size={14} />;
  if (e === "rechazada" || e === "cancelada") return <XCircle size={14} />;
  if (e === "preparacion") return <Hourglass size={14} />;
  return <Clock3 size={14} />;
}

function estadosCotizacionOpciones() {
  return [
    { value: "pendiente", label: "Pendiente" },
    { value: "preparacion", label: "Preparacion" },
    { value: "aceptada", label: "Aceptada" },
    { value: "rechazada", label: "Rechazada" },
    { value: "cancelada", label: "Cancelada" },
  ];
}

async function enviarCorreoCotizacionProcesadaEmailJS({
  toEmail,
  clienteNombre,
  cotizacionId,
  numeroCaso,
  total,
  estado,
  itemsText,
  usaAnticipo,
  montoAnticipo,
  montoPendiente,
  esFiado,
}) {
  const to = String(toEmail || "").trim();
  if (!to) return;

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_lwogm5i";
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_COTIZACION_ID || "template_sfqnx7u";
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "yoOeYAk8XPOIvEhbf";
  const appBaseUrl = String(import.meta.env.VITE_APP_WEB_URL || "https://vega-clean.vercel.app")
    .trim()
    .replace(/\/+$/g, "");
  const cotizacionUrl = `${appBaseUrl}/admin/cotizaciones`;

  const templateParams = {
    cliente: String(clienteNombre || "Cliente"),
    email: to,
    cotizacion_id: String(cotizacionId || ""),
    numero_caso: String(numeroCaso || ""),
    estado: String(estado || "pendiente"),
    total: fmtMoney(total),
    items: itemsText || "",
    usa_anticipo: usaAnticipo ? "Si" : "No",
    monto_anticipo: fmtMoney(montoAnticipo),
    monto_pendiente: fmtMoney(montoPendiente),
    es_fiado: esFiado ? "Si" : "No",
    fecha: new Date().toLocaleString("es-DO"),
    cotizacion_url: cotizacionUrl,
  };

  await emailjs.send(serviceId, templateId, templateParams, publicKey);
}

/* =========================
   Component
========================= */
export default function Cotizaciones() {
  const [searchParams] = useSearchParams();
  const preventaIdFromUrl = searchParams.get("preventa");

  // snapshot (opcional)
  const [cliente, setCliente] = useState("");
  const [descuento, setDescuento] = useState(0);

  // Catalogos
  const [productos, setProductos] = useState([]);
  const [equipos, setEquipos] = useState([]);

  // Buscar cliente por documento
  const [tipoCliente, setTipoCliente] = useState("persona");
  const [doc, setDoc] = useState("");
  const [clienteSel, setClienteSel] = useState(null);
  const [clienteLoading, setClienteLoading] = useState(false);
  const [creditoCliente, setCreditoCliente] = useState(null);
  const [creditoLoading, setCreditoLoading] = useState(false);
  const [usarFiado, setUsarFiado] = useState(false);

  // Selector tipo + item
  const [tipoItem, setTipoItem] = useState("producto");
  const [itemSeleccionado, setItemSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);

  // Extra solo admin
  const [extraUnitario, setExtraUnitario] = useState(0);

  // Detalle
  const [detalle, setDetalle] = useState([]);

  // Historial
  const [cotizaciones, setCotizaciones] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [filtroFiado, setFiltroFiado] = useState("all"); // all | fiadas | pendientes

  // Plan 50/50
  const [usaAnticipo, setUsaAnticipo] = useState(false);

  // Preventas
  const [preventas, setPreventas] = useState([]);
  const [preventaSeleccionada, setPreventaSeleccionada] = useState("");

  // Preventa cargada (para preload)
  const [preventaCargada, setPreventaCargada] = useState(null);
  const [loadingPreventa, setLoadingPreventa] = useState(false);

  // Filtros
  const [categoriaProducto, setCategoriaProducto] = useState("");
  const [marcaProducto, setMarcaProducto] = useState("");
  const [categoriaEquipo, setCategoriaEquipo] = useState("");
  const [marcaEquipo, setMarcaEquipo] = useState("");

  const navigate = useNavigate();

  // ========= Bloqueo precios en vendedor =========
  const role = localStorage.getItem("rol") || "";
  const isVendedor = role === "vendedor";
  const allowPriceEdit = !isVendedor;

  useEffect(() => {
    fetchCatalogos();
    fetchCotizaciones();
    fetchPreventas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!preventaIdFromUrl) return;
    setPreventaSeleccionada(String(preventaIdFromUrl));
    preloadDesdePreventa(Number(preventaIdFromUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preventaIdFromUrl]);

  useEffect(() => {
    if (!clienteSel?.id) {
      setCreditoCliente(null);
      setUsarFiado(false);
      return;
    }
    cargarEstadoCreditoCliente(clienteSel.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteSel?.id]);

  useEffect(() => {
    if (!usarFiado) return;
    if (usaAnticipo) setUsaAnticipo(false);
  }, [usarFiado, usaAnticipo]);

  useEffect(() => {
    const syncOnFocus = () => {
      fetchCotizaciones();
      if (clienteSel?.id) cargarEstadoCreditoCliente(clienteSel.id);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") syncOnFocus();
    };

    window.addEventListener("focus", syncOnFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", syncOnFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteSel?.id]);

  function emptyFiadoMeta() {
    return {
      es_fiada: false,
      total_fiado: 0,
      total_pagado: 0,
      saldo_pendiente: 0,
      pagado_directo: 0,
      pagado_manual_asignado: 0,
    };
  }

  function mapCotizacionFiadoMeta(movs = []) {
    const map = new Map();

    for (const m of movs) {
      const refId = Number(m?.ref_id);
      if (!Number.isFinite(refId) || refId <= 0) continue;

      if (!map.has(refId)) map.set(refId, emptyFiadoMeta());
      const meta = map.get(refId);
      const monto = safeNumber(m?.monto, 0);

      if (m?.tipo === "fiado") {
        meta.es_fiada = true;
        meta.total_fiado += monto;
      } else if (m?.tipo === "pago") {
        meta.total_pagado += monto;
      }
    }

    for (const meta of map.values()) {
      meta.total_fiado = Number(meta.total_fiado.toFixed(2));
      meta.total_pagado = Number(meta.total_pagado.toFixed(2));
      meta.saldo_pendiente = Number(Math.max(meta.total_fiado - meta.total_pagado, 0).toFixed(2));
      meta.pagado_directo = Number(meta.total_pagado.toFixed(2));
    }

    return map;
  }

  function evaluarElegibilidadFiado(credito, montoFiado) {
    const reasons = [];
    const data = credito || {};
    const monto = safeNumber(montoFiado, 0);

    if (!data.suscrito) reasons.push("El cliente no tiene una suscripcion activa.");
    if (!data.puede_fiar) reasons.push('El cliente tiene "puede fiar" en No.');

    const maxFios = safeNumber(data.max_fios, 0);
    const fiadosActivos = safeNumber(data.fiados_activos, 0);
    const fiosRestantes = safeNumber(data.fios_restantes, Math.max(maxFios - fiadosActivos, 0));
    if (maxFios > 0 && fiosRestantes <= 0) reasons.push("No tiene cupos de fiado disponibles.");

    const saldo = safeNumber(data.saldo_total, 0);
    const limite = safeNumber(data.limite_credito, 0);
    const saldoProyectado = Number((saldo + monto).toFixed(2));
    if (limite > 0 && saldoProyectado > limite) {
      reasons.push(`Excede el limite de credito (${fmtMoney(limite)}).`);
    }

    return {
      ok: reasons.length === 0,
      reasons,
      saldo,
      limite,
      fiadosActivos,
      fiosRestantes,
      saldoProyectado,
    };
  }

  async function obtenerEstadoCreditoCliente(clienteId) {
    if (!clienteId) return null;

    const empty = {
      suscrito: false,
      puede_fiar: false,
      max_fios: 0,
      limite_credito: 0,
      fiados_activos: 0,
      fios_restantes: 0,
      saldo_total: 0,
    };

    const { data: panel, error: errPanel } = await supabase
      .from("clientes_admin_panel")
      .select("id, suscrito, puede_fiar, max_fios, limite_credito, fiados_activos, fios_restantes, saldo_total")
      .eq("id", Number(clienteId))
      .maybeSingle();

    if (!errPanel && panel) {
      return {
        ...empty,
        suscrito: !!panel.suscrito,
        puede_fiar: !!panel.puede_fiar,
        max_fios: safeNumber(panel.max_fios, 0),
        limite_credito: safeNumber(panel.limite_credito, 0),
        fiados_activos: safeNumber(panel.fiados_activos, 0),
        fios_restantes: safeNumber(panel.fios_restantes, 0),
        saldo_total: safeNumber(panel.saldo_total, 0),
      };
    }

    const [{ data: cli, error: errCli }, { data: sub, error: errSub }, { data: movs, error: errMov }] =
      await Promise.all([
        supabase.from("clientes").select("id, puede_fiar, max_fios, limite_credito").eq("id", Number(clienteId)).maybeSingle(),
        supabase
          .from("clientes_suscripciones")
          .select("id")
          .eq("cliente_id", Number(clienteId))
          .eq("estado", "activa")
          .is("fin", null),
        supabase.from("fiados_movimientos").select("tipo, monto, ref_tipo, ref_id").eq("cliente_id", Number(clienteId)),
      ]);

    if (errCli) throw errCli;
    if (!cli) return empty;
    if (errSub) console.warn("No se pudo consultar suscripcion activa:", errSub);
    if (errMov) console.warn("No se pudieron consultar movimientos de fiado:", errMov);

    let saldoTotal = 0;
    const byRef = new Map();

    for (const m of movs || []) {
      const monto = safeNumber(m?.monto, 0);
      if (m?.tipo === "fiado") saldoTotal += monto;
      else if (m?.tipo === "pago") saldoTotal -= monto;

      if (m?.ref_id == null) continue;
      const key = `${m?.ref_tipo || "na"}:${m.ref_id}`;
      if (!byRef.has(key)) byRef.set(key, { fiado: 0, pago: 0 });
      const current = byRef.get(key);
      if (m?.tipo === "fiado") current.fiado += monto;
      else if (m?.tipo === "pago") current.pago += monto;
    }

    const fiadosActivos = Array.from(byRef.values()).filter((x) => x.fiado - x.pago > 0).length;
    const maxFios = safeNumber(cli.max_fios, 0);
    const fiosRestantes = Math.max(maxFios - fiadosActivos, 0);

    return {
      suscrito: Array.isArray(sub) ? sub.length > 0 : false,
      puede_fiar: !!cli.puede_fiar,
      max_fios: maxFios,
      limite_credito: safeNumber(cli.limite_credito, 0),
      fiados_activos: fiadosActivos,
      fios_restantes: fiosRestantes,
      saldo_total: Number(Math.max(saldoTotal, 0).toFixed(2)),
    };
  }

  async function cargarEstadoCreditoCliente(clienteId) {
    setCreditoLoading(true);
    try {
      const data = await obtenerEstadoCreditoCliente(clienteId);
      setCreditoCliente(data);
      return data;
    } catch (e) {
      console.error("No se pudo cargar estado de credito:", e);
      setCreditoCliente(null);
      return null;
    } finally {
      setCreditoLoading(false);
    }
  }

  async function fetchCatalogos() {
    const [{ data: prods, error: errP }, { data: eqs, error: errE }] = await Promise.all([
      supabase.from("productos").select("*").order("id", { ascending: false }),
      supabase.from("equipos").select("*").order("id", { ascending: false }),
    ]);

    if (errP) console.error(errP);
    if (errE) console.error(errE);

    setProductos(prods || []);
    setEquipos(eqs || []);
  }

  async function fetchCotizaciones() {
    const { data, error } = await supabase
      .from("cotizaciones")
      .select(
        `
        *,
        cliente_ref:clientes (
          id, tipo_cliente, nombre, cedula, empresa_rnc
        ),
        preventa_ref:preventas!cotizaciones_preventa_id_fkey (
          id, numero_caso, estado
        )
      `
      )
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setCotizaciones([]);
      return;
    }

    const base = data || [];
    const ids = base.map((r) => Number(r.id)).filter((x) => Number.isFinite(x) && x > 0);
    const clienteIds = Array.from(
      new Set(base.map((r) => Number(r.cliente_id)).filter((x) => Number.isFinite(x) && x > 0))
    );

    if (!ids.length || !clienteIds.length) {
      setCotizaciones(base.map((r) => ({ ...r, fiado_meta: emptyFiadoMeta() })));
      return;
    }

    const { data: movs, error: movErr } = await supabase
      .from("fiados_movimientos")
      .select("id, cliente_id, tipo, monto, ref_tipo, ref_id, fecha")
      .in("cliente_id", clienteIds)
      .order("fecha", { ascending: true })
      .order("id", { ascending: true });

    if (movErr) {
      console.error("No se pudo consultar fiados por cotizacion:", movErr);
      setCotizaciones(base.map((r) => ({ ...r, fiado_meta: emptyFiadoMeta() })));
      return;
    }

    const movsCot = (movs || []).filter((m) => m?.ref_tipo === "cotizacion" && ids.includes(Number(m?.ref_id)));
    const fiadoMap = mapCotizacionFiadoMeta(movsCot);

    const pagosManualPorCliente = new Map();
    for (const m of movs || []) {
      const cid = Number(m?.cliente_id);
      if (!Number.isFinite(cid) || cid <= 0) continue;
      if (m?.tipo !== "pago" || m?.ref_tipo !== "manual") continue;
      pagosManualPorCliente.set(cid, safeNumber(pagosManualPorCliente.get(cid), 0) + safeNumber(m?.monto, 0));
    }

    const asignadoManualPorCot = new Map();
    const rowsPorCliente = new Map();
    for (const r of base) {
      const cid = Number(r?.cliente_id);
      if (!Number.isFinite(cid) || cid <= 0) continue;
      if (!rowsPorCliente.has(cid)) rowsPorCliente.set(cid, []);
      rowsPorCliente.get(cid).push(r);
    }

    // FIFO de pagos manuales para reflejar abonos desde AdminClientes.
    for (const [cid, rows] of rowsPorCliente.entries()) {
      let disponible = safeNumber(pagosManualPorCliente.get(cid), 0);
      if (disponible <= 0) continue;

      const ordenadas = [...rows].sort((a, b) => {
        const fa = a?.fecha ? new Date(a.fecha).getTime() : 0;
        const fb = b?.fecha ? new Date(b.fecha).getTime() : 0;
        if (fa !== fb) return fa - fb;
        return safeNumber(a?.id, 0) - safeNumber(b?.id, 0);
      });

      for (const cot of ordenadas) {
        if (disponible <= 0) break;
        const cotId = Number(cot?.id);
        if (!Number.isFinite(cotId) || cotId <= 0) continue;

        const meta = fiadoMap.get(cotId);
        if (!meta?.es_fiada) continue;

        const saldoDirecto = Math.max(safeNumber(meta.total_fiado, 0) - safeNumber(meta.total_pagado, 0), 0);
        if (saldoDirecto <= 0) continue;

        const aplicado = Math.min(saldoDirecto, disponible);
        if (aplicado > 0) {
          asignadoManualPorCot.set(cotId, safeNumber(asignadoManualPorCot.get(cotId), 0) + aplicado);
          disponible -= aplicado;
        }
      }
    }

    const enriched = base.map((r) => {
      const cotId = Number(r?.id);
      const meta = fiadoMap.get(cotId) || emptyFiadoMeta();
      const pagadoManual = safeNumber(asignadoManualPorCot.get(cotId), 0);
      const totalFiado = safeNumber(meta.total_fiado, 0);
      const pagadoDirecto = safeNumber(meta.total_pagado, 0);
      const pagadoTotal = Number((pagadoDirecto + pagadoManual).toFixed(2));
      const pendiente = Number(Math.max(totalFiado - pagadoTotal, 0).toFixed(2));

      return {
        ...r,
        fiado_meta: {
          es_fiada: totalFiado > 0,
          total_fiado: Number(totalFiado.toFixed(2)),
          total_pagado: pagadoTotal,
          saldo_pendiente: pendiente,
          pagado_directo: Number(pagadoDirecto.toFixed(2)),
          pagado_manual_asignado: Number(pagadoManual.toFixed(2)),
        },
      };
    });

    setCotizaciones(enriched);
  }

  async function fetchPreventas() {
    const { data, error } = await supabase
      .from("preventas")
      .select("id, numero_caso, cliente, estado, creado_en, tipo_cliente, email, telefono, cedula, empresa_nombre, empresa_rnc, cliente_id")
      .order("id", { ascending: false });

    if (error) console.error(error);
    setPreventas(data || []);
  }

  async function handleBuscarCliente() {
    try {
      setClienteLoading(true);
      const cli = await buscarClientePorDocumento({ tipo: tipoCliente, documento: doc });
      if (!cli) {
        setClienteSel(null);
        Swal.fire(
          "No encontrado",
          "No existe un cliente con ese documento. Debe registrarse primero desde /cliente/servicio.",
          "info"
        );
        return;
      }
      setClienteSel(cli);
      setCliente(cli.nombre || "");
      setTipoCliente(cli.tipo_cliente || tipoCliente);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo buscar el cliente.", "error");
    } finally {
      setClienteLoading(false);
    }
  }

  /* ===================== PRELOAD DESDE PREVENTA ===================== */
  async function preloadDesdePreventa(preventaId) {
    if (!preventaId || Number.isNaN(preventaId)) return;

    setLoadingPreventa(true);

    try {
      const { data: p, error: errPrev } = await supabase.from("preventas").select("*").eq("id", preventaId).single();
      if (errPrev) throw errPrev;
      if (!p) throw new Error("Preventa no encontrada");

      setPreventaCargada(p);

      if (!cliente) setCliente(p.cliente || "");

      try {
        if (p.cliente_id) {
          const { data: cli, error: errCli } = await supabase
            .from("clientes")
            .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar")
            .eq("id", p.cliente_id)
            .maybeSingle();

          if (errCli) throw errCli;
          if (cli) {
            setClienteSel(cli);
            setTipoCliente(cli.tipo_cliente || p.tipo_cliente || "persona");
            setDoc(cli.tipo_cliente === "empresa" ? cli.empresa_rnc || "" : cli.cedula || "");
            setCliente(cli.nombre || p.cliente || "");
          }
        } else {
          if (p.tipo_cliente === "empresa" && p.empresa_rnc) {
            setTipoCliente("empresa");
            setDoc(p.empresa_rnc);
            const cli = await buscarClientePorDocumento({ tipo: "empresa", documento: p.empresa_rnc });
            if (cli) {
              setClienteSel(cli);
              setCliente(cli.nombre || p.cliente || "");
            }
          } else if (p.tipo_cliente === "persona" && p.cedula) {
            setTipoCliente("persona");
            setDoc(p.cedula);
            const cli = await buscarClientePorDocumento({ tipo: "persona", documento: p.cedula });
            if (cli) {
              setClienteSel(cli);
              setCliente(cli.nombre || p.cliente || "");
            }
          }
        }
      } catch (e) {
        console.warn("No se pudo auto-vincular cliente desde preventa:", e);
      }

      const { data: detPrev, error: errDet } = await supabase
        .from("detalle_preventa")
        .select("id, preventa_id, producto_id, equipo_id, cantidad")
        .eq("preventa_id", preventaId);

      if (errDet) throw errDet;

      const rows = detPrev || [];

      if (!rows.length) {
        setDetalle([]);
        if (p.estado === "enviada") {
          await supabase.from("preventas").update({ estado: "en_revision" }).eq("id", preventaId);
          fetchPreventas();
        }
        return;
      }

      const productoIds = Array.from(new Set(rows.filter((r) => r.producto_id != null).map((r) => r.producto_id)));
      const equipoIds = Array.from(new Set(rows.filter((r) => r.equipo_id != null).map((r) => r.equipo_id)));

      const [{ data: prodsData, error: errProds }, { data: eqsData, error: errEqs }] = await Promise.all([
        productoIds.length
          ? supabase.from("productos").select("id, nombre, precio, modelo, marca, categoria, cantidad").in("id", productoIds)
          : Promise.resolve({ data: [], error: null }),
        equipoIds.length
          ? supabase.from("equipos").select("id, nombre, precio, modelo, marca, categoria, cantidad").in("id", equipoIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (errProds) throw errProds;
      if (errEqs) throw errEqs;

      const prodMap = new Map((prodsData || []).map((x) => [x.id, x]));
      const eqMap = new Map((eqsData || []).map((x) => [x.id, x]));

      const precargado = rows.map((r) => {
        const isProd = r.producto_id != null;
        const item = isProd ? prodMap.get(r.producto_id) : eqMap.get(r.equipo_id);

        const cant = safeNumber(r.cantidad, 1);
        const precioBase = safeNumber(item?.precio, 0);
        const extra = allowPriceEdit ? 0 : 0;
        const precioUnitario = precioBase + extra;

        return {
          tipo: isProd ? "producto" : "equipo",
          item_id: isProd ? Number(r.producto_id) : Number(r.equipo_id),
          nombre: item?.nombre || "(Sin nombre)",
          modelo: item?.modelo || "",
          cantidad: cant,
          precioBase,
          extra,
          precioUnitario,
          _preventa_detalle_id: r.id,
        };
      });

      setDetalle(precargado);

      if (p.estado === "enviada") {
        await supabase.from("preventas").update({ estado: "en_revision" }).eq("id", preventaId);
        fetchPreventas();
      }
    } catch (e) {
      console.error("preloadDesdePreventa:", e);
      Swal.fire("Error", "No se pudo precargar la preventa en la cotizacion.", "error");
    } finally {
      setLoadingPreventa(false);
    }
  }

  /* ===================== filtros catalogo ===================== */
  const categoriasProductos = useMemo(
    () => Array.from(new Set((productos || []).map((p) => p.categoria || "Otros"))),
    [productos]
  );

  const marcasProductosFiltradas = useMemo(() => {
    return Array.from(
      new Set(
        (productos || [])
          .filter((p) => (categoriaProducto ? (p.categoria || "Otros") === categoriaProducto : true))
          .map((p) => p.marca || p.proveedor || "Sin marca")
      )
    );
  }, [productos, categoriaProducto]);

  const productosFiltrados = useMemo(() => {
    return (productos || []).filter((p) => {
      const cat = p.categoria || "Otros";
      const marca = p.marca || p.proveedor || "Sin marca";
      if (categoriaProducto && cat !== categoriaProducto) return false;
      if (marcaProducto && marca !== marcaProducto) return false;
      return true;
    });
  }, [productos, categoriaProducto, marcaProducto]);

  const categoriasEquipos = useMemo(
    () => Array.from(new Set((equipos || []).map((e) => e.categoria || "Otros"))),
    [equipos]
  );

  const marcasEquiposFiltradas = useMemo(() => {
    return Array.from(
      new Set(
        (equipos || [])
          .filter((e) => (categoriaEquipo ? (e.categoria || "Otros") === categoriaEquipo : true))
          .map((e) => e.marca || e.proveedor || "Sin marca")
      )
    );
  }, [equipos, categoriaEquipo]);

  const equiposFiltrados = useMemo(() => {
    return (equipos || []).filter((e) => {
      const cat = e.categoria || "Otros";
      const marca = e.marca || e.proveedor || "Sin marca";
      if (categoriaEquipo && cat !== categoriaEquipo) return false;
      if (marcaEquipo && marca !== marcaEquipo) return false;
      return true;
    });
  }, [equipos, categoriaEquipo, marcaEquipo]);

  function getItemByTipoYId(tipo, id) {
    if (tipo === "producto") return productos.find((p) => p.id === Number(id)) || null;
    return equipos.find((e) => e.id === Number(id)) || null;
  }

  /* ===================== detalle ===================== */
  function agregarItem() {
    if (!itemSeleccionado) return;

    const item = getItemByTipoYId(tipoItem, itemSeleccionado);
    if (!item) return;

    const cant = safeNumber(cantidad, 1);
    if (!cant || cant <= 0) {
      Swal.fire("Cantidad invalida", "Debe ser mayor que cero.", "warning");
      return;
    }

    const stock = item.cantidad == null ? null : safeNumber(item.cantidad, 0);
    if (stock != null && cant > stock) {
      Swal.fire("Stock insuficiente", `Solo tienes ${stock} unidades disponibles de "${item.nombre}".`, "warning");
      return;
    }

    const precioBase = safeNumber(item.precio, 0);
    const extra = allowPriceEdit ? safeNumber(extraUnitario, 0) : 0;
    const precioUnitario = precioBase + extra;

    if (precioUnitario <= 0) {
      Swal.fire("Precio invalido", "El precio unitario debe ser mayor que cero.", "warning");
      return;
    }

    setDetalle((prev) => [
      ...prev,
      {
        tipo: tipoItem,
        item_id: Number(item.id),
        nombre: item.nombre,
        modelo: item.modelo || "",
        cantidad: cant,
        precioBase,
        extra,
        precioUnitario,
      },
    ]);

    setExtraUnitario(0);
    setItemSeleccionado("");
    setCantidad(1);
  }

  function eliminarItem(index) {
    setDetalle((prev) => prev.filter((_, i) => i !== index));
  }

  /* ===================== GUARDAR ===================== */
  async function guardarCotizacion(e) {
    e.preventDefault();

    if (!clienteSel?.id) {
      Swal.fire("Falta cliente", "Busca y selecciona un cliente por Cedula/RNC antes de guardar.", "warning");
      return;
    }

    if (detalle.length === 0) {
      Swal.fire("Sin productos/equipos", "Agrega al menos 1 item.", "warning");
      return;
    }

    const detalleSeguro = detalle.map((it) => {
      const precioBase = safeNumber(it.precioBase, 0);
      const cant = safeNumber(it.cantidad, 1);
      const extra = allowPriceEdit ? safeNumber(it.extra, 0) : 0;
      const unit = precioBase + extra;
      return { ...it, extra, precioUnitario: unit, cantidad: cant };
    });

    const resumenGuardar = calcularTotalesCotizacion(detalleSeguro, descuento);
    const total = safeNumber(resumenGuardar.total, 0);

    if (total <= 0) {
      Swal.fire("Total invalido", "El total debe ser mayor que cero.", "error");
      return;
    }

    let montoAnticipo = 0;
    let montoPendiente = 0;
    const fiadoSolicitado = !!usarFiado;
    const anticipoSolicitado = !!usaAnticipo && !fiadoSolicitado;

    if (anticipoSolicitado) {
      montoAnticipo = Number((total * 0.5).toFixed(2));
      montoPendiente = Number((total - montoAnticipo).toFixed(2));
    }

    const montoFiado = fiadoSolicitado ? Number(total.toFixed(2)) : anticipoSolicitado ? montoPendiente : 0;
    const requiereCredito = montoFiado > 0;

    if (requiereCredito) {
      let creditoActual = null;
      try {
        creditoActual = await obtenerEstadoCreditoCliente(clienteSel.id);
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "No se pudo validar el estado de credito del cliente.", "error");
        return;
      }

      const checkFiado = evaluarElegibilidadFiado(creditoActual, montoFiado);
      setCreditoCliente(creditoActual);

      if (!checkFiado.ok) {
        Swal.fire("Fiado no permitido", checkFiado.reasons.join("<br/>"), "warning");
        setUsarFiado(false);
        return;
      }
    }

    const payloadCot = {
      cliente_id: clienteSel.id,
      cliente: clienteSel.nombre || cliente || null,
      total,
      descuento: safeNumber(descuento, 0),
      fecha: new Date().toISOString(),
      estado: "pendiente",
      usa_anticipo: anticipoSolicitado,
      monto_anticipo: montoAnticipo,
      monto_pendiente: montoFiado,
      preventa_id: preventaSeleccionada ? Number(preventaSeleccionada) : null,
      inventario_descontado: false,
    };

    const { data: cot, error } = await supabase.from("cotizaciones").insert([payloadCot]).select().single();

    if (error || !cot) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar la cotizacion", "error");
      return;
    }

    for (const it of detalleSeguro) {
      const cant = safeNumber(it.cantidad, 0);
      const unit = safeNumber(it.precioUnitario, 0);
      const baseSnap = safeNumber(it.precioBase, 0);
      const extraSnap = safeNumber(it.extra, 0);
      const subtotal = unit * cant;

      const payload = {
        cotizacion_id: cot.id,
        cantidad: cant,
        subtotal,
        precio_base_snapshot: baseSnap,
        extra_unitario: extraSnap,
        precio_unitario: unit,
        producto_id: it.tipo === "producto" ? it.item_id : null,
        equipo_id: it.tipo === "equipo" ? it.item_id : null,
      };

      const { error: errDet } = await supabase.from("detalle_cotizacion").insert([payload]);
      if (errDet) {
        console.error(errDet);
        Swal.fire("Error", "No se pudo guardar el detalle de la cotizacion.", "error");
        return;
      }
    }

    if (requiereCredito) {
      const { data: auth } = await supabase.auth.getUser();
      const creado_por = auth?.user?.id || null;

      const { error: errFiado } = await supabase.from("fiados_movimientos").insert({
        cliente_id: clienteSel.id,
        monto: montoFiado,
        tipo: "fiado",
        ref_tipo: "cotizacion",
        ref_id: cot.id,
        nota: fiadoSolicitado
          ? "Fiado total creado desde cotizaciones"
          : "Fiado pendiente del plan 50/50 creado desde cotizaciones",
        creado_por,
      });

      if (errFiado) {
        console.error(errFiado);

        await supabase.from("detalle_cotizacion").delete().eq("cotizacion_id", cot.id);
        await supabase.from("cotizaciones").delete().eq("id", cot.id);

        const msg = String(errFiado?.message || "").toLowerCase();
        if (msg.includes("fiados_unico_fiado_por_ref")) {
          Swal.fire("Error", "Ya existe un fiado para esta cotizacion.", "error");
        } else {
          Swal.fire("Error", "No se pudo registrar el fiado de la cotizacion.", "error");
        }
        return;
      }
    }

    if (preventaSeleccionada) {
      await supabase
        .from("preventas")
        .update({ estado: "cotizada", cliente_id: clienteSel.id })
        .eq("id", Number(preventaSeleccionada));
    }

    try {
      await enviarCorreoCotizacionProcesadaEmailJS({
        toEmail: clienteSel?.email || "",
        clienteNombre: clienteSel?.nombre || clienteSel?.email || "Cliente",
        cotizacionId: cot.id,
        numeroCaso: preventaCargada?.numero_caso || cot?.numero_caso || "",
        total,
        estado: "pendiente",
        itemsText: buildItemsTexto(detalleSeguro),
        usaAnticipo: anticipoSolicitado,
        montoAnticipo,
        montoPendiente: montoFiado,
        esFiado: fiadoSolicitado || montoFiado > 0,
      });
    } catch (mailErr) {
      console.warn("Cotizacion guardada, pero correo EmailJS fallo:", mailErr);
    }

    Swal.fire(
      "Exito",
      fiadoSolicitado
        ? "Cotizacion guardada y marcada como fiada."
        : anticipoSolicitado
        ? "Cotizacion guardada con plan 50/50 y pendiente registrado como fiado."
        : "Cotizacion guardada correctamente",
      "success"
    );

    setCliente("");
    setDoc("");
    setClienteSel(null);
    setDescuento(0);
    setDetalle([]);
    setTipoItem("producto");
    setItemSeleccionado("");
    setCantidad(1);
    setExtraUnitario(0);
    setCreditoCliente(null);
    setUsarFiado(false);
    setUsaAnticipo(false);
    setCategoriaProducto("");
    setMarcaProducto("");
    setCategoriaEquipo("");
    setMarcaEquipo("");
    setPreventaSeleccionada("");
    setPreventaCargada(null);

    fetchCotizaciones();
    fetchPreventas();
  }

  async function eliminarCotizacion(id) {
    const result = await Swal.fire({
      title: "Eliminar cotizacion?",
      text: "Esta accion no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53935",
    });
    if (!result.isConfirmed) return;

    await supabase.from("fiados_movimientos").delete().eq("ref_tipo", "cotizacion").eq("ref_id", id);
    await supabase.from("detalle_cotizacion").delete().eq("cotizacion_id", id);
    await supabase.from("cotizaciones").delete().eq("id", id);

    setCotizaciones((prev) => prev.filter((c) => c.id !== id));
    Swal.fire("Eliminada", "La cotizacion ha sido eliminada.", "success");
  }

  async function registrarAbonoFiado(cot) {
    const cotId = Number(cot?.id);
    const clienteId = Number(cot?.cliente_id);
    const meta = cot?.fiado_meta || emptyFiadoMeta();
    const saldoPendiente = safeNumber(meta?.saldo_pendiente, 0);

    if (!Number.isFinite(cotId) || cotId <= 0 || !Number.isFinite(clienteId) || clienteId <= 0) {
      Swal.fire("Error", "No se pudo identificar la cotizacion o el cliente.", "error");
      return;
    }

    if (saldoPendiente <= 0) {
      Swal.fire("Sin saldo", "Esta cotizacion no tiene saldo fiado pendiente.", "info");
      return;
    }

    const { value, isConfirmed } = await Swal.fire({
      title: `Abonar fiado de cotizacion #${cotId}`,
      text: `Saldo pendiente: ${fmtMoney(saldoPendiente)}`,
      input: "number",
      inputLabel: "Monto a abonar (RD$)",
      inputAttributes: { min: 0.01, step: "0.01", max: saldoPendiente },
      showCancelButton: true,
      confirmButtonText: "Registrar abono",
      cancelButtonText: "Cancelar",
      preConfirm: (raw) => {
        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) {
          Swal.showValidationMessage("Debes indicar un monto valido.");
          return null;
        }
        if (n > saldoPendiente) {
          Swal.showValidationMessage(`El abono no puede superar ${fmtMoney(saldoPendiente)}.`);
          return null;
        }
        return Number(n.toFixed(2));
      },
    });

    if (!isConfirmed || !value) return;

    try {
      const { data: auth } = await supabase.auth.getUser();
      const creado_por = auth?.user?.id || null;

      const { error: errPago } = await supabase.from("fiados_movimientos").insert({
        cliente_id: clienteId,
        monto: Number(value),
        tipo: "pago",
        ref_tipo: "cotizacion",
        ref_id: cotId,
        nota: "Abono registrado desde cotizaciones",
        creado_por,
      });

      if (errPago) throw errPago;

      const nuevoPendiente = Number(Math.max(safeNumber(cot?.monto_pendiente, 0) - Number(value), 0).toFixed(2));
      await supabase.from("cotizaciones").update({ monto_pendiente: nuevoPendiente }).eq("id", cotId);

      Swal.fire("Listo", "Abono registrado correctamente.", "success");
      await fetchCotizaciones();
      if (clienteSel?.id === clienteId) await cargarEstadoCreditoCliente(clienteId);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e?.message || "No se pudo registrar el abono.", "error");
    }
  }

  // ======== CAMBIO DE ESTADO COTIZACION + SINCRONIZACION PREVENTA ========
  async function cambiarEstadoCotizacion(cot, nuevoEstado) {
    const actual = String(cot?.estado || "pendiente");
    if (nuevoEstado === actual) return;

    const res = await Swal.fire({
      icon: "question",
      title: "Cambiar estado de cotizacion",
      html: `Cotizacion <strong>#${cot.id}</strong><br/>De <strong>${formatearEstado(actual)}</strong> a <strong>${formatearEstado(
        nuevoEstado
      )}</strong>`,
      showCancelButton: true,
      confirmButtonText: "Si, cambiar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
    });
    if (!res.isConfirmed) return;

    const { error: errUpdate } = await supabase.from("cotizaciones").update({ estado: nuevoEstado }).eq("id", cot.id);
    if (errUpdate) {
      console.error(errUpdate);
      Swal.fire("Error", "No se pudo actualizar el estado de la cotizacion.", "error");
      return;
    }

    // Si esta vinculada a una preventa, sincronizamos el estado del ticket:
    const pid = cot.preventa_id || cot?.preventa_ref?.id || null;
    if (pid) {
      // Reglas:
      // aceptada => preventa cerrada
      // rechazada/cancelada => preventa cancelada
      // pendiente/preparacion => preventa cotizada (si no esta cerrada/cancelada)
      let nuevoEstadoPreventa = null;

      if (nuevoEstado === "aceptada") nuevoEstadoPreventa = "cerrada";
      else if (nuevoEstado === "rechazada" || nuevoEstado === "cancelada") nuevoEstadoPreventa = "cancelada";
      else if (nuevoEstado === "pendiente" || nuevoEstado === "preparacion") nuevoEstadoPreventa = "cotizada";

      if (nuevoEstadoPreventa) {
        // Actualizamos preventa solo si existe
        const { data: prev, error: prevErr } = await supabase.from("preventas").select("id, estado").eq("id", pid).maybeSingle();
        if (!prevErr && prev?.id) {
          // Si ya esta cerrada/cancelada y el nuevo estado sugerido es "cotizada", no la bajamos.
          if (
            (prev.estado === "cerrada" || prev.estado === "cancelada") &&
            nuevoEstadoPreventa === "cotizada"
          ) {
            // no hacemos downgrade
          } else {
            const { error: updPrevErr } = await supabase.from("preventas").update({ estado: nuevoEstadoPreventa }).eq("id", pid);
            if (updPrevErr) console.warn("No se pudo sincronizar preventa:", updPrevErr);
          }
        }
      }
    }

    Swal.fire("Listo", "Estado actualizado.", "success");
    fetchCotizaciones();
    fetchPreventas();
  }

  const resumenActual = useMemo(() => calcularTotalesCotizacion(detalle, descuento), [detalle, descuento]);
  const subtotalActual = resumenActual.subtotal;
  const descuentoMontoActual = resumenActual.descuentoMonto;
  const itbisActual = resumenActual.itbis;
  const totalActual = resumenActual.total;
  const anticipoActual = usaAnticipo ? Number((totalActual * 0.5).toFixed(2)) : 0;
  const pendienteActual = usaAnticipo ? Number((totalActual - anticipoActual).toFixed(2)) : 0;
  const mitadActual = Number((totalActual * 0.5).toFixed(2));

  const checkFiadoTotal = useMemo(() => {
    if (!clienteSel?.id) return { ok: false, reasons: ["Selecciona un cliente."] };
    if (totalActual <= 0) return { ok: false, reasons: ["Agrega items para calcular el total."] };
    return evaluarElegibilidadFiado(creditoCliente, totalActual);
  }, [clienteSel?.id, creditoCliente, totalActual]);

  const checkFiadoMitad = useMemo(() => {
    if (!clienteSel?.id) return { ok: false, reasons: ["Selecciona un cliente."] };
    if (mitadActual <= 0) return { ok: false, reasons: ["Agrega items para calcular el total."] };
    return evaluarElegibilidadFiado(creditoCliente, mitadActual);
  }, [clienteSel?.id, creditoCliente, mitadActual]);

  const resumenFiados = useMemo(() => {
    const rows = cotizaciones || [];
    let totalFiado = 0;
    let totalPendiente = 0;
    let totalPagado = 0;
    let fiadas = 0;
    let pendientes = 0;

    for (const c of rows) {
      const meta = c?.fiado_meta || emptyFiadoMeta();
      const fiado = safeNumber(meta.total_fiado, 0);
      const pagado = safeNumber(meta.total_pagado, 0);
      const pendiente = safeNumber(meta.saldo_pendiente, 0);
      if (fiado > 0) fiadas += 1;
      if (pendiente > 0) pendientes += 1;
      totalFiado += fiado;
      totalPagado += pagado;
      totalPendiente += pendiente;
    }

    return {
      fiadas,
      pendientes,
      totalFiado: Number(totalFiado.toFixed(2)),
      totalPagado: Number(totalPagado.toFixed(2)),
      totalPendiente: Number(totalPendiente.toFixed(2)),
    };
  }, [cotizaciones]);

  const fiadosPendientes = useMemo(() => {
    return (cotizaciones || [])
      .filter((c) => safeNumber(c?.fiado_meta?.saldo_pendiente, 0) > 0)
      .sort((a, b) => safeNumber(b?.fiado_meta?.saldo_pendiente, 0) - safeNumber(a?.fiado_meta?.saldo_pendiente, 0));
  }, [cotizaciones]);

  const historyFiltered = useMemo(() => {
    const q = String(historySearch || "").trim().toLowerCase();
    const rows = (cotizaciones || []).filter((c) => {
      if (filtroFiado === "fiadas" && !safeNumber(c?.fiado_meta?.total_fiado, 0)) return false;
      if (filtroFiado === "pendientes" && !(safeNumber(c?.fiado_meta?.saldo_pendiente, 0) > 0)) return false;
      return true;
    });

    if (!q) return rows;
    return rows.filter((c) => {
      const cli = c.cliente_ref || null;
      const clienteLabel = cli ? labelCliente(cli) : c.cliente || "-";
      const caso = c?.preventa_ref?.numero_caso || c?.numero_caso || "";
      const meta = c?.fiado_meta || emptyFiadoMeta();
      const hay = [
        c.id,
        c.preventa_id,
        caso,
        c.total,
        c.estado,
        c.fecha,
        clienteLabel,
        meta.total_fiado,
        meta.total_pagado,
        meta.saldo_pendiente,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" | ");
      return hay.includes(q);
    });
  }, [cotizaciones, historySearch, filtroFiado]);

  return (
    <Wrapper>
      <Container>
        <Header>
          <HeaderLeft>
            <h2>
              <FileText size={18} />
              Cotizaciones
            </h2>
            <p>
              Estados de cotizacion: <strong>pendiente</strong>, <strong>preparacion</strong>, <strong>aceptada</strong>,{" "}
              <strong>rechazada</strong>, <strong>cancelada</strong>. Si una cotizacion vinculada se marca como{" "}
              <strong>rechazada</strong>, el ticket (preventa) se sincroniza a <strong>cancelada</strong>.
            </p>
          </HeaderLeft>

          <HeaderRight>
            <GhostBtn type="button" onClick={() => { fetchCotizaciones(); fetchPreventas(); }} disabled={loadingPreventa}>
              <RefreshCw size={16} /> Recargar
            </GhostBtn>
            <Badge>
              <ShieldCheck size={14} />
              Rol: <strong>{isVendedor ? "Vendedor" : "Admin"}</strong>
            </Badge>
          </HeaderRight>
        </Header>

        <FormCard>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 950, color: "inherit" }}>Nueva cotizacion</div>
              <Muted>Primero selecciona cliente; luego agrega items (productos/equipos).</Muted>
            </div>

            {preventaIdFromUrl ? (
              <Pill>
                <Clock3 size={14} />
                Preload: <strong>#{preventaIdFromUrl}</strong> {loadingPreventa ? "- cargando..." : "- listo"}
              </Pill>
            ) : null}
          </div>

          <Divider />

          {/* ==================== Cliente ==================== */}
          <Split>
            <Field>
              <Label>
                <Tag size={14} />
                Tipo de cliente
              </Label>
              <Select
                value={tipoCliente}
                onChange={(e) => {
                  setTipoCliente(e.target.value);
                  setClienteSel(null);
                  setDoc("");
                }}
              >
                <option value="persona">Persona (Cedula)</option>
                <option value="empresa">Empresa (RNC)</option>
              </Select>
            </Field>

            <Field>
              <Label>
                <Search size={14} />
                Documento
              </Label>
              <Input
                value={doc}
                onChange={(e) => setDoc(e.target.value)}
                placeholder={tipoCliente === "persona" ? "Cedula" : "RNC"}
              />
            </Field>

            <Full>
              <Row>
                <PrimaryBtn type="button" onClick={handleBuscarCliente} disabled={clienteLoading || !doc.trim()}>
                  <Search size={16} /> {clienteLoading ? "Buscando..." : "Buscar cliente"}
                </PrimaryBtn>

                <Muted>
                  <strong>Seleccionado:</strong> {clienteSel ? labelCliente(clienteSel) : "-"}
                </Muted>
              </Row>

              {clienteSel ? (
                <InfoBanner>
                  <MiniStack>
                    <div style={{ fontWeight: 950 }}>
                      <Boxes size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                      Perfil cliente
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                      Recurrente: <strong>{clienteSel.es_recurrente ? "Si" : "No"}</strong> - Puede fiar:{" "}
                      <strong>{clienteSel.puede_fiar ? "Si" : "No"}</strong> - Suscrito:{" "}
                      <strong>{creditoCliente?.suscrito ? "Si" : "No"}</strong>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                      {creditoLoading ? (
                        "Cargando estado de credito..."
                      ) : (
                        <>
                          Fios activos: <strong>{safeNumber(creditoCliente?.fiados_activos, 0)}</strong> - Restantes:{" "}
                          <strong>{safeNumber(creditoCliente?.fios_restantes, 0)}</strong> - Saldo:{" "}
                          <strong>{fmtMoney(creditoCliente?.saldo_total)}</strong>
                        </>
                      )}
                    </div>
                  </MiniStack>

                  <Badge>
                    <Package size={14} />
                    Listo para cotizar
                  </Badge>
                </InfoBanner>
              ) : null}
            </Full>
          </Split>

          <Divider />

          {/* ==================== Preventa ==================== */}
          <Split>
            <Field>
              <Label>
                <FileText size={14} />
                Vincular preventa
              </Label>
              <Select
                value={preventaSeleccionada}
                onChange={(e) => {
                  const value = e.target.value;
                  setPreventaSeleccionada(value);

                  if (value) preloadDesdePreventa(Number(value));
                  else setPreventaCargada(null);
                }}
              >
                <option value="">Sin preventa</option>
                {preventas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {`#${p.id} - ${p.numero_caso || "SIN CASO"} - ${p.cliente || "-"} - ${p.estado || "-"}`}
                  </option>
                ))}
              </Select>
            </Field>

            <Field>
              <Label>
                <ShieldCheck size={14} />
                Estado ticket (preventa)
              </Label>
              <Input value={preventaCargada ? (preventaCargada.estado || "-") : "-"} readOnly placeholder="-" />
            </Field>
          </Split>

          <Divider />

          {/* ==================== Items ==================== */}
          <Split>
            <Field>
              <Label>
                <Tag size={14} />
                Tipo de item
              </Label>
              <Select
                value={tipoItem}
                onChange={(e) => {
                  setTipoItem(e.target.value);
                  setItemSeleccionado("");
                  setCantidad(1);
                  setExtraUnitario(0);
                }}
              >
                <option value="producto">Producto</option>
                <option value="equipo">Equipo</option>
              </Select>
            </Field>

            <Field>
              <Label>
                <Plus size={14} />
                Cantidad
              </Label>
              <Input
                type="number"
                value={cantidad}
                min="1"
                onChange={(e) => setCantidad(e.target.value === "" ? 1 : Number(e.target.value))}
              />
            </Field>

            {/* filtros + selector */}
            {tipoItem === "producto" ? (
              <>
                <Field>
                  <Label>Categoria (productos)</Label>
                  <Select
                    value={categoriaProducto}
                    onChange={(e) => {
                      setCategoriaProducto(e.target.value);
                      setMarcaProducto("");
                      setItemSeleccionado("");
                    }}
                  >
                    <option value="">Todas</option>
                    {categoriasProductos.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field>
                  <Label>Marca / Proveedor (productos)</Label>
                  <Select
                    value={marcaProducto}
                    onChange={(e) => {
                      setMarcaProducto(e.target.value);
                      setItemSeleccionado("");
                    }}
                  >
                    <option value="">Todas</option>
                    {marcasProductosFiltradas.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Full>
                  <Label>Producto</Label>
                  <Select value={itemSeleccionado} onChange={(e) => setItemSeleccionado(e.target.value)}>
                    <option value="">Seleccione un producto</option>
                    {productosFiltrados.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                        {p.modelo ? ` - ${p.modelo}` : ""} - RD${safeNumber(p.precio, 0)}
                      </option>
                    ))}
                  </Select>
                </Full>
              </>
            ) : (
              <>
                <Field>
                  <Label>Categoria (equipos)</Label>
                  <Select
                    value={categoriaEquipo}
                    onChange={(e) => {
                      setCategoriaEquipo(e.target.value);
                      setMarcaEquipo("");
                      setItemSeleccionado("");
                    }}
                  >
                    <option value="">Todas</option>
                    {categoriasEquipos.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field>
                  <Label>Marca / Proveedor (equipos)</Label>
                  <Select
                    value={marcaEquipo}
                    onChange={(e) => {
                      setMarcaEquipo(e.target.value);
                      setItemSeleccionado("");
                    }}
                  >
                    <option value="">Todas</option>
                    {marcasEquiposFiltradas.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Full>
                  <Label>Equipo</Label>
                  <Select value={itemSeleccionado} onChange={(e) => setItemSeleccionado(e.target.value)}>
                    <option value="">Seleccione un equipo</option>
                    {equiposFiltrados.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.nombre}
                        {eq.modelo ? ` - ${eq.modelo}` : ""} - RD${safeNumber(eq.precio, 0)}
                      </option>
                    ))}
                  </Select>
                </Full>
              </>
            )}

            <Field>
              <Label>Extra por unidad</Label>
              <Input
                type="number"
                value={extraUnitario === 0 ? "" : extraUnitario}
                onChange={(e) => setExtraUnitario(e.target.value === "" ? 0 : Number(e.target.value))}
                placeholder={allowPriceEdit ? "Ej: 1000" : "Bloqueado para vendedor"}
                disabled={!allowPriceEdit}
              />
            </Field>

            <Field>
              <Label>Acciones</Label>
              <PrimaryBtn type="button" onClick={agregarItem} disabled={loadingPreventa}>
                <Plus size={16} /> Agregar item
              </PrimaryBtn>
            </Field>
          </Split>

          {detalle.length > 0 ? (
            <>
              <Divider />

              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950 }}>Detalle</div>
                <Badge>
                  <Package size={14} />
                  Items: <strong>{detalle.length}</strong>
                </Badge>
              </div>

              <DesktopOnly>
                <TableWrap style={{ marginTop: 10 }}>
                  <Table>
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Item</th>
                        <th>Cant.</th>
                        <th>Precio base</th>
                        <th>Extra / unidad</th>
                        <th>Precio unitario</th>
                        <th>Subtotal</th>
                        <th>Quitar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.map((d, i) => {
                        const subtotal = safeNumber(d.precioUnitario, 0) * safeNumber(d.cantidad, 0);
                        return (
                          <tr key={i}>
                            <td>{d.tipo}</td>
                            <td>
                              <strong>{d.nombre}</strong>
                              {d.modelo ? <div style={{ fontSize: 13, opacity: 0.8 }}>{d.modelo}</div> : null}
                            </td>
                            <td>{safeNumber(d.cantidad, 0)}</td>
                            <td>RD${safeNumber(d.precioBase, 0).toFixed(2)}</td>
                            <td>RD${safeNumber(d.extra, 0).toFixed(2)}</td>
                            <td>RD${safeNumber(d.precioUnitario, 0).toFixed(2)}</td>
                            <td>
                              <strong>RD${subtotal.toFixed(2)}</strong>
                            </td>
                            <td>
                              <IconBtn type="button" onClick={() => eliminarItem(i)} title="Quitar">
                                <Trash2 size={16} />
                              </IconBtn>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableWrap>
              </DesktopOnly>

              <MobileList>
                {detalle.map((d, i) => {
                  const subtotal = safeNumber(d.precioUnitario, 0) * safeNumber(d.cantidad, 0);
                  return (
                    <MobileCard key={i}>
                      <MobileHeader>
                        <MobileTitle>
                          <strong>{d.nombre}</strong>
                          <span>
                            {d.tipo} {d.modelo ? ` - ${d.modelo}` : ""}
                          </span>
                        </MobileTitle>

                        <IconBtn type="button" onClick={() => eliminarItem(i)} title="Quitar">
                          <Trash2 size={16} />
                        </IconBtn>
                      </MobileHeader>

                      <MobileMeta>
                        <Pill>Cant: {safeNumber(d.cantidad, 0)}</Pill>
                        <Pill>Unit: RD${safeNumber(d.precioUnitario, 0).toFixed(2)}</Pill>
                        <Pill>
                          <strong>Sub: RD${subtotal.toFixed(2)}</strong>
                        </Pill>
                      </MobileMeta>
                    </MobileCard>
                  );
                })}
              </MobileList>
            </>
          ) : null}

          <Divider />

          {/* ==================== Totales ==================== */}
          <Split>
            <Field>
              <Label>Descuento (%)</Label>
              <Input
                type="number"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </Field>

            <Field>
              <Label>Total estimado (incluye ITBIS 18%)</Label>
              <Input value={`RD$ ${totalActual.toFixed(2)}`} readOnly />
            </Field>

            <Full>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Badge>Subtotal: <strong>{fmtMoney(subtotalActual)}</strong></Badge>
                <Badge>Descuento: <strong>-{fmtMoney(descuentoMontoActual)}</strong></Badge>
                <Badge>ITBIS (18%): <strong>{fmtMoney(itbisActual)}</strong></Badge>
              </div>
            </Full>

            <Full>
              <InfoBanner>
                <MiniStack>
                  <div style={{ fontWeight: 950 }}>Modalidad de cobro</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>
                    Fiado solo para clientes suscritos y habilitados. El 50/50 registra el restante como fiado.
                  </div>
                </MiniStack>

                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={usarFiado}
                      disabled={totalActual <= 0 || !clienteSel?.id}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        if (!checked) {
                          setUsarFiado(false);
                          return;
                        }
                        if (!clienteSel?.id) {
                          Swal.fire("Falta cliente", "Selecciona un cliente antes de usar fiado.", "warning");
                          return;
                        }
                        let creditoActual = creditoCliente;
                        if (!creditoActual) {
                          try {
                            creditoActual = await obtenerEstadoCreditoCliente(clienteSel.id);
                            setCreditoCliente(creditoActual);
                          } catch (err) {
                            console.error(err);
                            Swal.fire("Error", "No se pudo validar el estado de credito.", "error");
                            return;
                          }
                        }
                        const check = evaluarElegibilidadFiado(creditoActual, totalActual);
                        if (!check.ok) {
                          Swal.fire("Fiado no permitido", check.reasons.join("<br/>"), "warning");
                          return;
                        }
                        setUsarFiado(true);
                        setUsaAnticipo(false);
                      }}
                    />
                    <span style={{ fontWeight: 850 }}>Fiado total</span>
                  </label>

                  <label style={{ display: "inline-flex", gap: 8, alignItems: "center", cursor: usarFiado ? "not-allowed" : "pointer", opacity: usarFiado ? 0.6 : 1 }}>
                    <input
                      type="checkbox"
                      checked={usaAnticipo}
                      disabled={usarFiado || totalActual <= 0 || !clienteSel?.id}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        if (!checked) {
                          setUsaAnticipo(false);
                          return;
                        }
                        if (!clienteSel?.id) {
                          Swal.fire("Falta cliente", "Selecciona un cliente antes de activar el 50/50.", "warning");
                          return;
                        }
                        let creditoActual = creditoCliente;
                        if (!creditoActual) {
                          try {
                            creditoActual = await obtenerEstadoCreditoCliente(clienteSel.id);
                            setCreditoCliente(creditoActual);
                          } catch (err) {
                            console.error(err);
                            Swal.fire("Error", "No se pudo validar el estado de credito.", "error");
                            return;
                          }
                        }
                        const check = evaluarElegibilidadFiado(creditoActual, mitadActual);
                        if (!check.ok) {
                          Swal.fire(
                            "50/50 no permitido",
                            `El 50% pendiente se registra como fiado (${fmtMoney(mitadActual)}).<br/><br/>${check.reasons.join("<br/>")}`,
                            "warning"
                          );
                          return;
                        }
                        setUsaAnticipo(true);
                        setUsarFiado(false);
                      }}
                    />
                    <span style={{ fontWeight: 850 }}>Plan 50/50</span>
                  </label>
                </div>
              </InfoBanner>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {usarFiado ? (
                  <>
                    <Badge>
                      <CreditCard size={14} /> Fiado: <strong>{fmtMoney(totalActual)}</strong>
                    </Badge>
                    <Badge>
                      <BadgeDollarSign size={14} /> Pago inicial: <strong>{fmtMoney(0)}</strong>
                    </Badge>
                  </>
                ) : usaAnticipo ? (
                  <>
                    <Badge>Anticipo: <strong>{fmtMoney(anticipoActual)}</strong></Badge>
                    <Badge>Pendiente (fiado): <strong>{fmtMoney(pendienteActual)}</strong></Badge>
                  </>
                ) : (
                  <Badge>Pago completo al momento: <strong>{fmtMoney(totalActual)}</strong></Badge>
                )}
              </div>

              {!usarFiado && clienteSel?.id && totalActual > 0 && !checkFiadoTotal.ok ? (
                <Muted style={{ marginTop: 8 }}>
                  Fiado total no disponible: {checkFiadoTotal.reasons.join(" ")}
                </Muted>
              ) : null}
              {!usarFiado && !usaAnticipo && clienteSel?.id && totalActual > 0 && !checkFiadoMitad.ok ? (
                <Muted style={{ marginTop: 8 }}>
                  50/50 no disponible: {checkFiadoMitad.reasons.join(" ")}
                </Muted>
              ) : null}
            </Full>

            <Full>
              <PrimaryBtn type="button" onClick={guardarCotizacion} disabled={loadingPreventa}>
                <FileText size={16} /> Guardar cotizacion
              </PrimaryBtn>
            </Full>
          </Split>
        </FormCard>

        {/* ==================== Historial ==================== */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 950 }}>Historial</div>
            <Muted>Busca por cliente, ID, estado, #caso, #preventa o montos de fiado.</Muted>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              <Badge>
                Fiadas: <strong>{resumenFiados.fiadas}</strong>
              </Badge>
              <Badge>
                Pendientes: <strong>{resumenFiados.pendientes}</strong>
              </Badge>
              <Badge>
                Total fiado: <strong>{fmtMoney(resumenFiados.totalFiado)}</strong>
              </Badge>
              <Badge>
                Total pendiente: <strong>{fmtMoney(resumenFiados.totalPendiente)}</strong>
              </Badge>
            </div>
          </div>

          <div style={{ minWidth: 280, flex: 1, maxWidth: 760, display: "grid", gap: 8 }}>
            <Field style={{ padding: "0.7rem 0.85rem", borderRadius: 999 }}>
              <Label style={{ marginBottom: 6 }}>
                <Search size={14} />
                Buscar en historial
              </Label>
              <Input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Ej: #12, pendiente, rechazado, caso..."
              />
            </Field>
            <Field style={{ padding: "0.55rem 0.75rem", borderRadius: 999 }}>
              <Label style={{ marginBottom: 4 }}>Filtro de fiado</Label>
              <Select value={filtroFiado} onChange={(e) => setFiltroFiado(e.target.value)} style={{ marginTop: 0 }}>
                <option value="all">Todas las cotizaciones</option>
                <option value="fiadas">Solo cotizaciones fiadas</option>
                <option value="pendientes">Solo fiadas pendientes</option>
              </Select>
            </Field>
          </div>
        </div>

        {fiadosPendientes.length ? (
          <Card style={{ marginTop: 12, padding: "0.9rem 1rem" }}>
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Cotizaciones fiadas pendientes</div>
            <div style={{ display: "grid", gap: 8 }}>
              {fiadosPendientes.slice(0, 6).map((c) => {
                const cli = c.cliente_ref || null;
                const clienteLabel = cli ? labelCliente(cli) : c.cliente || "-";
                const saldo = safeNumber(c?.fiado_meta?.saldo_pendiente, 0);
                return (
                  <div
                    key={`fiado-pend-${c.id}`}
                    style={{
                      border: "1px solid rgba(148, 163, 184, 0.4)",
                      borderRadius: 14,
                      padding: "0.65rem 0.75rem",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "grid", gap: 2 }}>
                      <div style={{ fontWeight: 900 }}>#{c.id} - {clienteLabel}</div>
                      <div style={{ fontSize: 13, opacity: 0.8 }}>
                        Pendiente: <strong>{fmtMoney(saldo)}</strong>
                      </div>
                    </div>
                    <TinyActionBtn type="button" onClick={() => registrarAbonoFiado(c)}>
                      <BadgeDollarSign size={14} /> Abonar
                    </TinyActionBtn>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : null}

        {/* Desktop table */}
        <DesktopOnly>
          <TableWrap style={{ marginTop: 12 }}>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>#Caso</th>
                  <th>Cliente</th>
                  <th>Preventa</th>
                  <th>Total</th>
                  <th>Estado</th>

                  <th>Anticipo</th>
                  <th>Fiado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historyFiltered.map((c) => {
                  const cli = c.cliente_ref || null;
                  const clienteLabel = cli ? labelCliente(cli) : c.cliente || "-";
                  const caso = c?.preventa_ref?.numero_caso || c?.numero_caso || "-";
                  const fiadoMeta = c?.fiado_meta || emptyFiadoMeta();
                  const fiadoTotal = safeNumber(fiadoMeta.total_fiado, 0);
                  const fiadoPagado = safeNumber(fiadoMeta.total_pagado, 0);
                  const fiadoPendiente = safeNumber(fiadoMeta.saldo_pendiente, 0);

                  return (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>{caso}</td>
                      <td>{clienteLabel}</td>
                      <td>{c.preventa_id ? `#${c.preventa_id}` : "-"}</td>
                      <td>
                        <strong>
                          RD$
                          {safeNumber(c.total, 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </strong>
                      </td>
                      <td>
                        <EstadoBadge estado={c.estado || "pendiente"}>
                          {estadoIcon(c.estado)} {formatearEstado(c.estado || "pendiente")}
                        </EstadoBadge>
                      </td>
                      <td>
                        {c.usa_anticipo ? (
                          <div style={{ display: "grid", gap: 2 }}>
                            <span>
                              Inicial: <strong>{fmtMoney(c.monto_anticipo)}</strong>
                            </span>
                            <span>
                              Restante: <strong>{fmtMoney(fiadoTotal > 0 ? fiadoPendiente : c.monto_pendiente)}</strong>
                            </span>
                          </div>
                        ) : (
                          "No"
                        )}
                      </td>
                      <td>
                        {fiadoTotal > 0 ? (
                          <div style={{ display: "grid", gap: 2 }}>
                            <span>
                              Fiado: <strong>{fmtMoney(fiadoTotal)}</strong>
                            </span>
                            <span>
                              Pagado: <strong>{fmtMoney(fiadoPagado)}</strong>
                            </span>
                            <span>
                              Pendiente: <strong>{fmtMoney(fiadoPendiente)}</strong>
                            </span>
                          </div>
                        ) : (
                          "No"
                        )}
                      </td>
                      <td>{c.fecha ? new Date(c.fecha).toLocaleDateString() : "-"}</td>
                      <td>
                        <RowActions>
                          <IconBtn type="button" onClick={() => navigate(`/admin/cotizaciones/${c.id}`)} title="Ver">
                            <Eye size={16} />
                          </IconBtn>
                          {fiadoPendiente > 0 ? (
                            <TinyActionBtn type="button" onClick={() => registrarAbonoFiado(c)} title="Registrar abono">
                              <BadgeDollarSign size={14} /> Abonar
                            </TinyActionBtn>
                          ) : null}
                          <DangerBtn type="button" onClick={() => eliminarCotizacion(c.id)} title="Eliminar">
                            <Trash2 size={16} /> Eliminar
                          </DangerBtn>
                        </RowActions>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrap>
        </DesktopOnly>

        {/* Mobile cards */}
        <MobileList>
          {historyFiltered.map((c) => {
            const cli = c.cliente_ref || null;
            const clienteLabel = cli ? labelCliente(cli) : c.cliente || "-";
            const caso = c?.preventa_ref?.numero_caso || c?.numero_caso || "-";
            const fiadoMeta = c?.fiado_meta || emptyFiadoMeta();
            const fiadoTotal = safeNumber(fiadoMeta.total_fiado, 0);
            const fiadoPagado = safeNumber(fiadoMeta.total_pagado, 0);
            const fiadoPendiente = safeNumber(fiadoMeta.saldo_pendiente, 0);

            return (
              <MobileCard key={c.id}>
                <MobileHeader>
                  <MobileTitle>
                    <strong>#{c.id}</strong>
                    <span>
                      {clienteLabel} - Caso: {caso}
                    </span>
                  </MobileTitle>

                  <RowActions>
                    <IconBtn type="button" onClick={() => navigate(`/admin/cotizaciones/${c.id}`)} title="Ver">
                      <Eye size={16} />
                    </IconBtn>
                    <IconBtn type="button" onClick={() => eliminarCotizacion(c.id)} title="Eliminar">
                      <Trash2 size={16} />
                    </IconBtn>
                  </RowActions>
                </MobileHeader>

                <MobileMeta>
                  <Pill>
                    Total: <strong>RD${safeNumber(c.total, 0).toFixed(2)}</strong>
                  </Pill>
                  <EstadoBadge estado={c.estado || "pendiente"}>
                    {estadoIcon(c.estado)} {formatearEstado(c.estado || "pendiente")}
                  </EstadoBadge>
                  {c.preventa_id ? (
                    <Pill>
                      Preventa: <strong>#{c.preventa_id}</strong>
                    </Pill>
                  ) : null}
                  {fiadoTotal > 0 ? (
                    <>
                      <Pill>Fiado: <strong>{fmtMoney(fiadoTotal)}</strong></Pill>
                      <Pill>Pagado: <strong>{fmtMoney(fiadoPagado)}</strong></Pill>
                      <Pill>Pendiente: <strong>{fmtMoney(fiadoPendiente)}</strong></Pill>
                    </>
                  ) : null}
                </MobileMeta>

                <div>
                  <Label style={{ marginBottom: 6 }}>
                    <Ban size={14} />
                    Cambiar estado
                  </Label>
                  <Select value={c.estado || "pendiente"} onChange={(e) => cambiarEstadoCotizacion(c, e.target.value)} style={{ marginTop: 0 }}>
                    {estadosCotizacionOpciones().map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {c.usa_anticipo ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Badge>
                      Inicial: <strong>{fmtMoney(c.monto_anticipo)}</strong>
                    </Badge>
                    <Badge>
                      Restante: <strong>{fmtMoney(fiadoTotal > 0 ? fiadoPendiente : c.monto_pendiente)}</strong>
                    </Badge>
                  </div>
                ) : (
                  <Muted>Anticipo: No</Muted>
                )}

                {fiadoPendiente > 0 ? (
                  <div>
                    <TinyActionBtn type="button" onClick={() => registrarAbonoFiado(c)}>
                      <BadgeDollarSign size={14} /> Abonar fiado
                    </TinyActionBtn>
                  </div>
                ) : null}
              </MobileCard>
            );
          })}
        </MobileList>

        {/* Empty state */}
        {!historyFiltered.length ? (
          <div style={{ marginTop: 12 }}>
            <Card style={{ padding: "1rem" }}>
              <Muted>No hay cotizaciones para mostrar con ese filtro.</Muted>
            </Card>
          </div>
        ) : null}
      </Container>
    </Wrapper>
  );
}

