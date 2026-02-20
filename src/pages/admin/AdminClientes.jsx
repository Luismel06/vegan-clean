// src/pages/admin/Clientes.jsx
import { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase/supabase.config.jsx";
import {
  Search,
  RefreshCw,
  Users as UsersIcon,
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  Repeat2,
  CreditCard,
  History,
  Settings2,
} from "lucide-react"; /* el cambio VA*/

/* =========================
   HELPERS
========================= */
function safeText(v) {
  return String(v ?? "").toLowerCase().trim();
}
function fmtMoneyRD(n) {
  const x = Number(n || 0);
  return `RD$ ${x.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function toNum(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

/* =========================
   STYLES
========================= */
const Page = styled.section`
  padding: 1.5rem 1.6rem;
  color: ${({ theme }) => theme.text};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 1rem;
`;

const TitleBox = styled.div``;

const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.accent};
  font-weight: 900;
  letter-spacing: 0.2px;
`;

const Subtitle = styled.div`
  margin-top: 6px;
  opacity: 0.85;
  font-size: 0.92rem;
  line-height: 1.3;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchBox = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 0.65rem 0.8rem;
  min-width: 320px;

  input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
  }

  @media (max-width: 520px) {
    min-width: 100%;
  }
`;

const Button = styled.button`
  border: none;
  cursor: pointer;
  border-radius: 14px;
  padding: 0.7rem 0.9rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: transform 0.12s ease, opacity 0.12s ease;
  user-select: none;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.96;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

const GhostBtn = styled(Button)`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.accent};
  border: 1px solid ${({ theme }) => theme.border};
`;

const PrimaryBtn = styled(Button)`
  background: ${({ theme }) => theme.accent};
  color: #000;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1.6fr;
  gap: 14px;
  margin-bottom: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 18px;
  padding: 1rem 1.1rem;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.06);
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 16px;
  padding: 0.85rem 0.9rem;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const StatTitle = styled.div`
  font-weight: 900;
  font-size: 0.85rem;
  opacity: 0.85;
`;

const StatValue = styled.div`
  font-weight: 1000;
  font-size: 1.25rem;
`;

const StatIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.accent + "22"};
  color: ${({ theme }) => theme.accent};
`;

const Hint = styled.div`
  margin-top: 10px;
  font-size: 0.85rem;
  opacity: 0.85;
  line-height: 1.35;
`;

const RowMeta = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  font-weight: 1000;
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

const BadgeSoft = styled(Badge)`
  background: ${({ theme }) => theme.accent + "12"};
  border-color: ${({ theme }) => theme.accent + "33"};
`;

const TableWrap = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.95rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: middle;
  }

  th {
    background: ${({ theme }) => theme.background};
    font-size: 0.78rem;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    font-weight: 1000;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  @media (max-width: 980px) {
    display: none;
  }
`;

const MobileList = styled.div`
  display: none;
  padding: 0.75rem;

  @media (max-width: 980px) {
    display: grid;
    gap: 10px;
  }
`;

const MobileItem = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 16px;
  padding: 0.9rem;
`;

const RowTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
`;

const RowName = styled.div`
  font-weight: 1000;
  word-break: break-word;
`;

const ClientLink = styled(Link)`
  color: ${({ theme }) => theme.accent};
  text-decoration: none;
  font-weight: 1000;

  &:hover {
    text-decoration: underline;
  }
`;

const RowSub = styled.div`
  margin-top: 6px;
  opacity: 0.9;
  font-size: 0.9rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 980px) {
    justify-content: flex-start;
  }
`;

const TinyBtn = styled.button`
  border: none;
  cursor: pointer;
  border-radius: 12px;
  padding: 0.55rem 0.7rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.accent};
  border: 1px solid ${({ theme }) => theme.border};

  &:hover {
    opacity: 0.95;
  }

  ${({ variant }) =>
    variant === "primary" &&
    css`
      background: ${({ theme }) => theme.accent};
      color: #000;
      border: none;
    `}

  ${({ variant }) =>
    variant === "danger" &&
    css`
      background: #ef4444;
      color: #fff;
      border: none;
    `}
`;

const Filters = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  padding: 0.65rem 0.8rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.accent};
  outline: none;
  font-weight: 900;
`;

/* =========================
   PAGE
========================= */
export default function Clientes() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  // filtros
  const [fSus, setFSus] = useState("all"); // all | yes | no
  const [fRec, setFRec] = useState("all"); // all | yes | no
  const [fFiar, setFFiar] = useState("all"); // all | yes | no
  const [fDeuda, setFDeuda] = useState("all"); // all | yes (saldo>0) | no (saldo<=0)

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);

      // Vista recomendada: public.clientes_admin_panel
      const { data, error } = await supabase
        .from("clientes_admin_panel")
        .select("*")
        .order("creado_en", { ascending: false });

      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar los clientes (verifica vistas).", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const total = rows.length;
    const suscritos = rows.filter((r) => !!r.suscrito).length;
    const recurrentes = rows.filter((r) => !!r.es_recurrente_calc).length;
    const puedeFiar = rows.filter((r) => !!r.puede_fiar).length;
    const conFiados = rows.filter((r) => toNum(r.fiados_activos) > 0).length;
    const conDeuda = rows.filter((r) => toNum(r.saldo_total) > 0).length;
    return { total, suscritos, recurrentes, puedeFiar, conFiados, conDeuda };
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = safeText(q);

    return (rows || [])
      .filter((r) => {
        if (!qq) return true;

        const doc = r.tipo_cliente === "empresa" ? r.empresa_rnc : r.cedula;
        const hay = [
          r.nombre,
          r.tipo_cliente,
          doc,
          r.telefono,
          r.email,
          r.direccion,
        ]
          .map(safeText)
          .join(" | ");

        return hay.includes(qq);
      })
      .filter((r) => {
        if (fSus === "yes" && !r.suscrito) return false;
        if (fSus === "no" && r.suscrito) return false;

        if (fRec === "yes" && !r.es_recurrente_calc) return false;
        if (fRec === "no" && r.es_recurrente_calc) return false;

        if (fFiar === "yes" && !r.puede_fiar) return false;
        if (fFiar === "no" && r.puede_fiar) return false;

        const saldo = toNum(r.saldo_total);
        if (fDeuda === "yes" && !(saldo > 0)) return false;
        if (fDeuda === "no" && !(saldo <= 0)) return false;

        return true;
      });
  }, [rows, q, fSus, fRec, fFiar, fDeuda]);

  function docLabel(r) {
    if (r.tipo_cliente === "empresa") return r.empresa_rnc || "-";
    return r.cedula || "-";
  }

  async function subscribeCliente(cliente) {
    try {
      // Inserta activa (índice evita doble activa)
      const { data: auth } = await supabase.auth.getUser();
      const creado_por = auth?.user?.id || null;

      const { error } = await supabase.from("clientes_suscripciones").insert({
        cliente_id: cliente.id,
        estado: "activa",
        plan: "standard",
        nota: "Suscripción activada desde Admin",
        creado_por,
      });

      if (error) throw error;

      Swal.fire("Listo", "Cliente suscrito.", "success");
      await loadAll();
    } catch (e) {
      console.error(e);
      const msg = String(e?.message || "").toLowerCase();
      if (msg.includes("suscripcion_una_activa_por_cliente")) {
        Swal.fire("Aviso", "Ese cliente ya tiene una suscripción activa.", "info");
        return;
      }
      Swal.fire("Error", e.message || "No se pudo suscribir.", "error");
    }
  }

  async function cancelSuscripcion(cliente) {
    try {
      const ok = await Swal.fire({
        icon: "warning",
        title: "Cancelar suscripción",
        text: `¿Cancelar la suscripción activa de ${cliente.nombre}?`,
        showCancelButton: true,
        confirmButtonText: "Cancelar",
        cancelButtonText: "No",
        confirmButtonColor: "#ef4444",
      });
      if (!ok.isConfirmed) return;

      // Cierra la activa
      const { error } = await supabase
        .from("clientes_suscripciones")
        .update({ estado: "cancelada", fin: new Date().toISOString() })
        .eq("cliente_id", cliente.id)
        .eq("estado", "activa")
        .is("fin", null);

      if (error) throw error;

      Swal.fire("Listo", "Suscripción cancelada.", "success");
      await loadAll();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudo cancelar.", "error");
    }
  }

  async function verMovimientos(cliente) {
    try {
      const { data, error } = await supabase
        .from("fiados_movimientos")
        .select("id, tipo, monto, fecha, ref_tipo, ref_id, nota")
        .eq("cliente_id", cliente.id)
        .order("fecha", { ascending: false })
        .limit(25);

      if (error) throw error;

      const rowsHtml =
        (data || [])
          .map((m) => {
            const sign = m.tipo === "fiado" ? "+" : "-";
            const ref = m.ref_id ? `${m.ref_tipo} #${m.ref_id}` : m.ref_tipo;
            return `
              <tr>
                <td style="padding:8px 10px; border-bottom:1px solid #eee;">${new Date(m.fecha).toLocaleString()}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #eee; font-weight:800;">${m.tipo}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #eee;">${ref}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:right; font-weight:900;">
                  ${sign} ${fmtMoneyRD(m.monto)}
                </td>
              </tr>`;
          })
          .join("") || "";

      await Swal.fire({
        title: `Movimientos - ${cliente.nombre}`,
        width: 920,
        confirmButtonText: "Cerrar",
        html: `
          <div style="text-align:left; opacity:.85; font-size:13px; margin-bottom:10px;">
            Últimos 25 movimientos (ledger auditable).
          </div>
          <div style="overflow:auto; max-height: 420px; border:1px solid #eee; border-radius:10px;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <thead>
                <tr style="background:#f7f7f7;">
                  <th style="padding:8px 10px; text-align:left;">Fecha</th>
                  <th style="padding:8px 10px; text-align:left;">Tipo</th>
                  <th style="padding:8px 10px; text-align:left;">Ref</th>
                  <th style="padding:8px 10px; text-align:right;">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || `<tr><td colspan="4" style="padding:12px; opacity:.75;">Sin movimientos.</td></tr>`}
              </tbody>
            </table>
          </div>
        `,
      });
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudieron cargar movimientos.", "error");
    }
  }

  async function registrarPago(cliente) {
    try {
      const { value, isConfirmed } = await Swal.fire({
        title: "Registrar pago",
        text: `Cliente: ${cliente.nombre}`,
        input: "number",
        inputLabel: "Monto pagado (RD$)",
        inputAttributes: { min: 1, step: "0.01" },
        showCancelButton: true,
        confirmButtonText: "Registrar",
        cancelButtonText: "Cancelar",
        preConfirm: (v) => {
          const n = Number(v);
          if (!Number.isFinite(n) || n <= 0) {
            Swal.showValidationMessage("Debes colocar un monto válido.");
            return null;
          }
          return n;
        },
      });
      if (!isConfirmed) return;

      const { data: auth } = await supabase.auth.getUser();
      const creado_por = auth?.user?.id || null;

      const { error } = await supabase.from("fiados_movimientos").insert({
        cliente_id: cliente.id,
        monto: value,
        tipo: "pago",
        ref_tipo: "manual",
        ref_id: null,
        nota: "Pago registrado desde Admin",
        creado_por,
      });

      if (error) throw error;

      Swal.fire("Listo", "Pago registrado.", "success");
      await loadAll();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudo registrar el pago.", "error");
    }
  }

  async function editarCredito(cliente) {
    try {
      const { isConfirmed, value } = await Swal.fire({
        title: "Editar crédito",
        width: 720,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        html: `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; text-align:left;">
            <div style="grid-column:1/-1; opacity:.85; font-size:13px;">
              Cliente: <b>${cliente.nombre}</b>
            </div>

            <div style="grid-column:1/-1;">
              <label style="font-weight:800; display:block; margin-bottom:6px;">¿Puede fiar?</label>
              <select id="puede_fiar" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;">
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label style="font-weight:800; display:block; margin-bottom:6px;">Máx. fios</label>
              <input id="max_fios" type="number" min="0" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;"
                value="${Number(cliente.max_fios ?? 3)}" />
            </div>

            <div>
              <label style="font-weight:800; display:block; margin-bottom:6px;">Límite crédito (RD$)</label>
              <input id="limite_credito" type="number" min="0" step="0.01" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;"
                value="${Number(cliente.limite_credito ?? 0)}" />
              <div style="margin-top:6px; font-size:12px; opacity:.75;">
                0 = sin límite (si luego decides manejarlo así).
              </div>
            </div>
          </div>
        `,
        didOpen: () => {
          document.getElementById("puede_fiar").value = String(!!cliente.puede_fiar);
        },
        preConfirm: () => {
          const puede_fiar = document.getElementById("puede_fiar").value === "true";
          const max_fios = Number(document.getElementById("max_fios").value);
          const limite_credito = Number(document.getElementById("limite_credito").value);

          if (!Number.isFinite(max_fios) || max_fios < 0) {
            Swal.showValidationMessage("max_fios inválido.");
            return null;
          }
          if (!Number.isFinite(limite_credito) || limite_credito < 0) {
            Swal.showValidationMessage("limite_credito inválido.");
            return null;
          }

          return { puede_fiar, max_fios, limite_credito };
        },
      });

      if (!isConfirmed || !value) return;

      const { error } = await supabase
        .from("clientes")
        .update({
          puede_fiar: value.puede_fiar,
          max_fios: value.max_fios,
          limite_credito: value.limite_credito,
        })
        .eq("id", cliente.id);

      if (error) throw error;

      Swal.fire("Listo", "Crédito actualizado.", "success");
      await loadAll();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudo actualizar.", "error");
    }
  }

  function SusBadge({ suscrito }) {
    if (suscrito) return <BadgeOk><CheckCircle2 size={14} /> Suscrito</BadgeOk>;
    return <BadgeWarn><XCircle size={14} /> No suscrito</BadgeWarn>;
  }

  function RecBadge({ rec }) {
    if (rec) return <BadgeSoft><Repeat2 size={14} /> Recurrente</BadgeSoft>;
    return <Badge>Normal</Badge>;
  }

  function FiarBadge({ fiados_activos, max_fios }) {
    const a = toNum(fiados_activos);
    const m = toNum(max_fios || 0);
    const text = `Fiado: ${a}/${m}`;
    if (a > 0) return <BadgeWarn><CreditCard size={14} /> {text}</BadgeWarn>;
    return <BadgeOk><CreditCard size={14} /> {text}</BadgeOk>;
  }

  return (
    <Page>
      <Header>
        <TitleBox>
          <Title>Clientes</Title>
          <Subtitle>
            Panel de clientes con suscripción, recurrencia y crédito (fiados). Todo lo de “fiado” se calcula desde el ledger auditable.
          </Subtitle>
        </TitleBox>

        <Controls>
          <SearchBox>
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, cédula/RNC, teléfono, email..."
            />
          </SearchBox>

          <GhostBtn onClick={loadAll}>
            <RefreshCw size={16} /> Recargar
          </GhostBtn>
        </Controls>
      </Header>

      <SectionGrid>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 1000, fontSize: "1rem" }}>Resumen</div>
            <Badge>
              <UsersIcon size={14} /> Total: {summary.total}
            </Badge>
          </div>

          <div style={{ height: 10 }} />

          <StatGrid>
            <Stat>
              <StatIcon><CheckCircle2 size={18} /></StatIcon>
              <div>
                <StatTitle>Suscritos</StatTitle>
                <StatValue>{summary.suscritos}</StatValue>
              </div>
            </Stat>

            <Stat>
              <StatIcon><Repeat2 size={18} /></StatIcon>
              <div>
                <StatTitle>Recurrentes</StatTitle>
                <StatValue>{summary.recurrentes}</StatValue>
              </div>
            </Stat>

            <Stat>
              <StatIcon><CreditCard size={18} /></StatIcon>
              <div>
                <StatTitle>Puede fiar</StatTitle>
                <StatValue>{summary.puedeFiar}</StatValue>
              </div>
            </Stat>

            <Stat>
              <StatIcon><BadgeDollarSign size={18} /></StatIcon>
              <div>
                <StatTitle>Con deuda</StatTitle>
                <StatValue>{summary.conDeuda}</StatValue>
              </div>
            </Stat>
          </StatGrid>

          <Hint>
            <b>Con fiados activos:</b> {summary.conFiados} · <b>Con saldo pendiente:</b> {summary.conDeuda}
          </Hint>
        </Card>

        <Card>
          <div style={{ fontWeight: 1000, fontSize: "1rem" }}>Filtros</div>
          <div style={{ height: 10 }} />
          <Filters>
            <Select value={fSus} onChange={(e) => setFSus(e.target.value)}>
              <option value="all">Suscripción: todos</option>
              <option value="yes">Suscripción: sí</option>
              <option value="no">Suscripción: no</option>
            </Select>

            <Select value={fRec} onChange={(e) => setFRec(e.target.value)}>
              <option value="all">Recurrente: todos</option>
              <option value="yes">Recurrente: sí</option>
              <option value="no">Recurrente: no</option>
            </Select>

            <Select value={fFiar} onChange={(e) => setFFiar(e.target.value)}>
              <option value="all">Puede fiar: todos</option>
              <option value="yes">Puede fiar: sí</option>
              <option value="no">Puede fiar: no</option>
            </Select>

            <Select value={fDeuda} onChange={(e) => setFDeuda(e.target.value)}>
              <option value="all">Saldo: todos</option>
              <option value="yes">Saldo: con deuda</option>
              <option value="no">Saldo: sin deuda</option>
            </Select>
          </Filters>
        </Card>
      </SectionGrid>

      {loading ? (
        <Card>Cargando clientes…</Card>
      ) : filtered.length === 0 ? (
        <Card>No hay clientes con esos criterios.</Card>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Doc</th>
                <th>Contacto</th>
                <th>Suscripción</th>
                <th>Recurrencia</th>
                <th>Fiado</th>
                <th>Restantes</th>
                <th>Saldo</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 1000 }}>
                    <ClientLink to={`/admin/clientes/${r.id}`}>{r.nombre}</ClientLink>
                  </td>
                  <td>{r.tipo_cliente}</td>
                  <td>{docLabel(r)}</td>
                  <td style={{ fontSize: 13, opacity: 0.95 }}>
                    <div>{r.telefono || "-"}</div>
                    <div style={{ opacity: 0.8 }}>{r.email || "-"}</div>
                  </td>

                  <td><SusBadge suscrito={r.suscrito} /></td>
                  <td><RecBadge rec={r.es_recurrente_calc} /></td>

                  <td><FiarBadge fiados_activos={r.fiados_activos} max_fios={r.max_fios} /></td>

                  <td>
                    {toNum(r.fios_restantes) === 0 ? (
                      <BadgeDanger>{r.fios_restantes}</BadgeDanger>
                    ) : (
                      <BadgeOk>{r.fios_restantes}</BadgeOk>
                    )}
                  </td>

                  <td>
                    {toNum(r.saldo_total) > 0 ? (
                      <BadgeWarn>{fmtMoneyRD(r.saldo_total)}</BadgeWarn>
                    ) : (
                      <BadgeOk>{fmtMoneyRD(r.saldo_total)}</BadgeOk>
                    )}
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <Actions>
                      {!r.suscrito ? (
                        <TinyBtn variant="primary" onClick={() => subscribeCliente(r)}>
                          <CheckCircle2 size={16} /> Suscribir
                        </TinyBtn>
                      ) : (
                        <TinyBtn variant="danger" onClick={() => cancelSuscripcion(r)}>
                          <XCircle size={16} /> Cancelar
                        </TinyBtn>
                      )}

                      <TinyBtn onClick={() => registrarPago(r)}>
                        <BadgeDollarSign size={16} /> Pago
                      </TinyBtn>

                      <TinyBtn onClick={() => verMovimientos(r)}>
                        <History size={16} /> Movs
                      </TinyBtn>

                      <TinyBtn onClick={() => editarCredito(r)}>
                        <Settings2 size={16} /> Crédito
                      </TinyBtn>
                    </Actions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <MobileList>
            {filtered.map((r) => (
              <MobileItem key={r.id}>
                <RowTop>
                  <div>
                    <RowName>
                      <ClientLink to={`/admin/clientes/${r.id}`}>{r.nombre}</ClientLink>
                    </RowName>
                    <RowSub style={{ opacity: 0.85 }}>
                      {r.tipo_cliente} · {docLabel(r)}
                    </RowSub>
                    <RowSub>{r.telefono || "-"} · {r.email || "-"}</RowSub>
                  </div>
                  <SusBadge suscrito={r.suscrito} />
                </RowTop>

                <RowMeta>
                  <RecBadge rec={r.es_recurrente_calc} />
                  <FiarBadge fiados_activos={r.fiados_activos} max_fios={r.max_fios} />
                  <Badge>Restantes: <b>{r.fios_restantes}</b></Badge>
                  {toNum(r.saldo_total) > 0 ? (
                    <BadgeWarn>Saldo: <b>{fmtMoneyRD(r.saldo_total)}</b></BadgeWarn>
                  ) : (
                    <BadgeOk>Saldo: <b>{fmtMoneyRD(r.saldo_total)}</b></BadgeOk>
                  )}
                </RowMeta>

                <div style={{ height: 10 }} />

                <Actions>
                  {!r.suscrito ? (
                    <TinyBtn variant="primary" onClick={() => subscribeCliente(r)}>
                      <CheckCircle2 size={16} /> Suscribir
                    </TinyBtn>
                  ) : (
                    <TinyBtn variant="danger" onClick={() => cancelSuscripcion(r)}>
                      <XCircle size={16} /> Cancelar
                    </TinyBtn>
                  )}

                  <TinyBtn onClick={() => registrarPago(r)}>
                    <BadgeDollarSign size={16} /> Pago
                  </TinyBtn>

                  <TinyBtn onClick={() => verMovimientos(r)}>
                    <History size={16} /> Movs
                  </TinyBtn>

                  <TinyBtn onClick={() => editarCredito(r)}>
                    <Settings2 size={16} /> Crédito
                  </TinyBtn>
                </Actions>
              </MobileItem>
            ))}
          </MobileList>
        </TableWrap>
      )}
    </Page>
  );
}
