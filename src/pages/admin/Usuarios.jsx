// src/pages/admin/Usuarios.jsx
import { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Users as UsersIcon,
  Shield,
  Warehouse,
  BadgeDollarSign,
  UserCheck,
  X,
  Check,
  Link as LinkIcon,
  Unlink as UnlinkIcon,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";

/* =========================
   CONFIG
========================= */
const ROLES = ["admin", "vendedor", "finanza", "almacenista"];
const AREAS_SUGERIDAS = [
  "LA VEGA",
  "SANTO DOMINGO",
  "SANTIAGO",
  "LA ROMANA",
  "SAN CRISTOBAL",
  "OTRA",
];

function safeText(v) {
  return String(v ?? "").toLowerCase().trim();
}
function normalizeRole(v) {
  return String(v || "").trim().toLowerCase();
}
function fmt(n) {
  const x = Number(n || 0);
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

const PrimaryBtn = styled(Button)`
  background: ${({ theme }) => theme.accent};
  color: #000;
`;

const GhostBtn = styled(Button)`
  background: ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 2fr;
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

  @media (max-width: 860px) {
    display: none;
  }
`;

const MobileList = styled.div`
  display: none;
  padding: 0.75rem;

  @media (max-width: 860px) {
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

const RowEmail = styled.div`
  font-weight: 1000;
  word-break: break-word;
`;

const RowName = styled.div`
  margin-top: 6px;
  opacity: 0.9;
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

const BadgeSoft = styled(Badge)`
  background: ${({ theme }) => theme.accent + "12"};
  border-color: ${({ theme }) => theme.accent + "33"};
  color: ${({ theme }) => theme.text};
`;

const BadgeWarn = styled(Badge)`
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.35);
`;

const BadgeOk = styled(Badge)`
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.35);
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
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
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.surface};
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

/* ============= Modal ============= */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  background-color: ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(15, 15, 15, 0.65)"
      : "rgba(255, 255, 255, 0.6)"};
  z-index: 5000;
  display: grid;
  place-items: center;
  padding: 14px;
`;

const Modal = styled.div`
  width: min(720px, 100%);
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 18px;
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const ModalHead = styled.div`
  padding: 1rem 1.1rem;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
`;

const ModalTitle = styled.div`
  font-weight: 1000;
  font-size: 1.05rem;
`;

const CloseBtn = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.surface};
  border-radius: 12px;
  padding: 0.5rem 0.6rem;
  cursor: pointer;
  display: grid;
  place-items: center;

  &:hover {
    opacity: 0.9;
  }
`;

const ModalBody = styled.div`
  padding: 1rem 1.1rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.85rem;
    font-weight: 1000;
    opacity: 0.9;
  }

  input,
  select {
    padding: 0.8rem 0.85rem;
    border-radius: 14px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    outline: none;
  }

  small {
    font-size: 0.78rem;
    opacity: 0.8;
    line-height: 1.35;
  }
`;

const ModalFoot = styled.div`
  padding: 0.95rem 1.1rem;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

function RoleBadge({ rol }) {
  const r = normalizeRole(rol);
  if (r === "admin") return <BadgeSoft><Shield size={14} /> admin</BadgeSoft>;
  if (r === "vendedor") return <BadgeSoft><UserCheck size={14} /> vendedor</BadgeSoft>;
  if (r === "almacenista") return <BadgeSoft><Warehouse size={14} /> almacenista</BadgeSoft>;
  if (r === "finanza") return <BadgeSoft><BadgeDollarSign size={14} /> finanza</BadgeSoft>;
  return <Badge>{r || "-"}</Badge>;
}

function VinculoBadge({ linked }) {
  if (linked) return <BadgeOk><LinkIcon size={14} /> Vinculado</BadgeOk>;
  return <BadgeWarn><UnlinkIcon size={14} /> No vinculado</BadgeWarn>;
}

/* =========================
   PAGE
========================= */
export default function Usuarios() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  // stats: { [vendedor_auth_uid]: { ordenes, ventas } }
  const [stats, setStats] = useState({});
  const [q, setQ] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(null);

  // form
  const [form, setForm] = useState({
    email: "",
    nombre: "",
    rol: "vendedor",
    telefono: "",
    area: "",
  });

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    await Promise.all([loadUsuarios(), loadStats()]);
  }

  async function loadUsuarios() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, email, nombre, rol, telefono, area, creado_en, auth_uid")
        .order("creado_en", { ascending: false });

      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Órdenes:
   *  - Cuenta todas las preventas por vendedor.
   *
   * Ventas:
   *  - Cuenta SOLO las cotizaciones que llegaron a estado "despachada"
   *    (es decir, pasaron por almacén y fueron despachadas).
   *
   * Requisitos de datos (esperado):
   *  - preventas.vendedor_id guarda el identificador del vendedor (mismo que usuarios.auth_uid)
   *  - cotizaciones.preventa_id referencia a preventas.id
   */
  async function loadStats() {
    try {
      // 1) Órdenes por vendedor (preventas)
      const { data: prevs, error: ep } = await supabase
        .from("preventas")
        .select("id, vendedor_id");

      if (ep) throw ep;

      const acc = {};

      for (const p of prevs || []) {
        const vid = p.vendedor_id;
        if (!vid) continue;
        if (!acc[vid]) acc[vid] = { ordenes: 0, ventas: 0 };
        acc[vid].ordenes += 1;
      }

      // 2) Ventas por vendedor (cotizaciones despachadas)
      // Intentamos join vía FK: cotizaciones.preventa_id -> preventas.id
      const { data: cots, error: ec } = await supabase
        .from("cotizaciones")
        .select("id, estado, preventa_id, preventas:preventa_id ( vendedor_id )")
        .eq("estado", "despachada");

      if (ec) throw ec;

      for (const c of cots || []) {
        const vid = c?.preventas?.vendedor_id;
        if (!vid) continue;
        if (!acc[vid]) acc[vid] = { ordenes: 0, ventas: 0 };
        acc[vid].ventas += 1;
      }

      setStats(acc);
    } catch (e) {
      console.error(e);
      setStats({});
    }
  }

  const filtered = useMemo(() => {
    const qq = safeText(q);
    if (!qq) return rows;
    return (rows || []).filter((u) => {
      const hay = [u.email, u.nombre, u.rol, u.telefono, u.area].map(safeText).join(" | ");
      return hay.includes(qq);
    });
  }, [rows, q]);

  const summary = useMemo(() => {
    const total = rows.length;
    const byRole = { admin: 0, vendedor: 0, almacenista: 0, finanza: 0, other: 0 };

    for (const u of rows) {
      const r = normalizeRole(u.rol);
      if (byRole[r] != null) byRole[r] += 1;
      else byRole.other += 1;
    }

    const vinculados = rows.filter((u) => !!u.auth_uid).length;
    const vendedoresNoVinculados = rows.filter(
      (u) => normalizeRole(u.rol) === "vendedor" && !u.auth_uid
    ).length;

    return { total, byRole, vinculados, vendedoresNoVinculados };
  }, [rows]);

  function openCreate() {
    setMode("create");
    setCurrent(null);
    setForm({ email: "", nombre: "", rol: "vendedor", telefono: "", area: "LA VEGA" });
    setModalOpen(true);
  }

  function openEdit(u) {
    setMode("edit");
    setCurrent(u);
    setForm({
      email: u.email || "",
      nombre: u.nombre || "",
      rol: normalizeRole(u.rol) || "vendedor",
      telefono: u.telefono || "",
      area: u.area || "",
    });
    setModalOpen(true);
  }

  async function saveUser() {
    try {
      const email = String(form.email || "").trim();
      const rol = normalizeRole(form.rol);
      const nombre = String(form.nombre || "").trim();
      const telefono = String(form.telefono || "").trim();
      const area = String(form.area || "").trim();

      if (!email) return Swal.fire("Falta email", "Debes colocar el email.", "warning");
      if (!ROLES.includes(rol)) return Swal.fire("Rol inválido", "Selecciona un rol válido.", "warning");

      setSaving(true);

      if (mode === "create") {
        const { error } = await supabase.from("usuarios").insert({
          email,
          rol,
          nombre: nombre || null,
          telefono: telefono || null,
          area: area || null,
        });
        if (error) throw error;

        Swal.fire("Listo", "Usuario creado.", "success");
      } else {
        const { error } = await supabase
          .from("usuarios")
          .update({
            rol,
            nombre: nombre || null,
            telefono: telefono || null,
            area: area || null,
          })
          .eq("id", current.id);

        if (error) throw error;
        Swal.fire("Listo", "Usuario actualizado.", "success");
      }

      setModalOpen(false);
      await loadAll();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudo guardar el usuario.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(u) {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Eliminar usuario",
      text: `¿Eliminar ${u.email}? Esto borra el registro en la tabla usuarios.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });
    if (!ok.isConfirmed) return;

    try {
      const { error } = await supabase.from("usuarios").delete().eq("id", u.id);
      if (error) throw error;

      Swal.fire("Listo", "Usuario eliminado.", "success");
      await loadAll();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudo eliminar.", "error");
    }
  }

  function vendorMetrics(u) {
    const isVend = normalizeRole(u.rol) === "vendedor";
    if (!isVend) {
      return { linked: !!u.auth_uid, ordenes: "-", ventas: "-" };
    }

    const linked = !!u.auth_uid;
    if (!linked) {
      // Sin vínculo: mostramos 0 (no “sin link”)
      return { linked: false, ordenes: 0, ventas: 0 };
    }

    const s = stats[u.auth_uid] || { ordenes: 0, ventas: 0 };
    return { linked: true, ordenes: fmt(s.ordenes), ventas: fmt(s.ventas) };
  }

  return (
    <Page>
      <Header>
        <TitleBox>
          <Title>Usuarios</Title>
          <Subtitle>
            Gestión de cuentas internas (roles, área y datos de contacto). Las métricas de vendedores se basan en órdenes registradas y cotizaciones despachadas.
          </Subtitle>
        </TitleBox>

        <Controls>
          <SearchBox>
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por email, nombre, rol, área..."
            />
          </SearchBox>

          <GhostBtn onClick={loadAll}>
            <RefreshCw size={16} /> Recargar
          </GhostBtn>

          <PrimaryBtn onClick={openCreate}>
            <Plus size={16} /> Nuevo
          </PrimaryBtn>
        </Controls>
      </Header>

      <SectionGrid>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontWeight: 1000, fontSize: "1rem" }}>Resumen</div>
            <Badge>
              <UsersIcon size={14} /> Total: {summary.total}
            </Badge>
          </div>

          <div style={{ height: 10 }} />

          <StatGrid>
            <Stat>
              <StatIcon>
                <Shield size={18} />
              </StatIcon>
              <div>
                <StatTitle>Admins</StatTitle>
                <StatValue>{summary.byRole.admin}</StatValue>
              </div>
            </Stat>

            <Stat>
              <StatIcon>
                <UserCheck size={18} />
              </StatIcon>
              <div>
                <StatTitle>Vendedores</StatTitle>
                <StatValue>{summary.byRole.vendedor}</StatValue>
              </div>
            </Stat>

            <Stat>
              <StatIcon>
                <Warehouse size={18} />
              </StatIcon>
              <div>
                <StatTitle>Almacén</StatTitle>
                <StatValue>{summary.byRole.almacenista}</StatValue>
              </div>
            </Stat>

            <Stat>
              <StatIcon>
                <BadgeDollarSign size={18} />
              </StatIcon>
              <div>
                <StatTitle>Finanzas</StatTitle>
                <StatValue>{summary.byRole.finanza}</StatValue>
              </div>
            </Stat>
          </StatGrid>

          <Hint>
            <b>Cuentas vinculadas:</b> {summary.vinculados} ·{" "}
            <b>Vendedores no vinculados:</b> {summary.vendedoresNoVinculados}
          </Hint>
        </Card>

        <Card>
          <div style={{ fontWeight: 1000, fontSize: "1rem" }}>Criterio de métricas</div>
          <div style={{ height: 10 }} />
          <RowMeta>
            <Badge>
              <ClipboardList size={14} /> Órdenes = preventas registradas
            </Badge>
            <Badge>
              <ShoppingBag size={14} /> Ventas = cotizaciones <b>despachadas</b>
            </Badge>
          </RowMeta>
          <Hint style={{ marginTop: 12 }}>
            Si un vendedor aparece como <b>No vinculado</b>, sus métricas se mostrarán en 0.
          </Hint>
        </Card>
      </SectionGrid>

      {loading ? (
        <Card> Cargando usuarios… </Card>
      ) : filtered.length === 0 ? (
        <Card> No hay usuarios. </Card>
      ) : (
        <TableWrap>
          {/* Desktop table */}
          <Table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Área</th>
                <th>Vinculación</th>
                <th>Órdenes</th>
                <th>Ventas</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const m = vendorMetrics(u);
                const isVend = normalizeRole(u.rol) === "vendedor";

                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 1000 }}>{u.email}</td>
                    <td>{u.nombre || "-"}</td>
                    <td>
                      <RoleBadge rol={u.rol} />
                    </td>
                    <td>{u.area || "-"}</td>

                    <td>
                      {/* Indicador (ya no es botón) */}
                      <VinculoBadge linked={m.linked} />
                    </td>

                    <td>
                      {isVend ? (
                        m.linked ? <BadgeOk>{m.ordenes}</BadgeOk> : <BadgeWarn>{m.ordenes}</BadgeWarn>
                      ) : (
                        <Badge>{m.ordenes}</Badge>
                      )}
                    </td>

                    <td>
                      {isVend ? (
                        m.linked ? <BadgeOk>{m.ventas}</BadgeOk> : <BadgeWarn>{m.ventas}</BadgeWarn>
                      ) : (
                        <Badge>{m.ventas}</Badge>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <Actions>
                        <TinyBtn onClick={() => openEdit(u)}>
                          <Pencil size={16} /> Editar
                        </TinyBtn>

                        <TinyBtn variant="danger" onClick={() => deleteUser(u)}>
                          <Trash2 size={16} /> Eliminar
                        </TinyBtn>
                      </Actions>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {/* Mobile list */}
          <MobileList>
            {filtered.map((u) => {
              const m = vendorMetrics(u);
              const isVend = normalizeRole(u.rol) === "vendedor";

              return (
                <MobileItem key={u.id}>
                  <RowTop>
                    <div>
                      <RowEmail>{u.email}</RowEmail>
                      <RowName>{u.nombre || "-"}</RowName>
                    </div>
                    <RoleBadge rol={u.rol} />
                  </RowTop>

                  <RowMeta>
                    <Badge>Área: {u.area || "-"}</Badge>
                    <VinculoBadge linked={m.linked} />

                    {isVend && (
                      <>
                        {m.linked ? (
                          <>
                            <BadgeOk>Órdenes: {m.ordenes}</BadgeOk>
                            <BadgeOk>Ventas: {m.ventas}</BadgeOk>
                          </>
                        ) : (
                          <>
                            <BadgeWarn>Órdenes: {m.ordenes}</BadgeWarn>
                            <BadgeWarn>Ventas: {m.ventas}</BadgeWarn>
                          </>
                        )}
                      </>
                    )}
                  </RowMeta>

                  <div style={{ height: 10 }} />

                  <Actions style={{ justifyContent: "flex-start" }}>
                    <TinyBtn onClick={() => openEdit(u)}>
                      <Pencil size={16} /> Editar
                    </TinyBtn>
                    <TinyBtn variant="danger" onClick={() => deleteUser(u)}>
                      <Trash2 size={16} /> Eliminar
                    </TinyBtn>
                  </Actions>
                </MobileItem>
              );
            })}
          </MobileList>
        </TableWrap>
      )}

      {/* Modal Create/Edit */}
      {modalOpen && (
        <Overlay onClick={() => setModalOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHead>
              <div>
                <ModalTitle>{mode === "create" ? "Nuevo usuario" : "Editar usuario"}</ModalTitle>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                  {mode === "create"
                    ? "Crea un usuario interno."
                    : "Actualiza rol, nombre, teléfono y área."}
                </div>
              </div>
              <CloseBtn onClick={() => setModalOpen(false)}>
                <X size={18} />
              </CloseBtn>
            </ModalHead>

            <ModalBody>
              <FormGrid>
                <Field style={{ gridColumn: "1 / -1" }}>
                  <label>Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="correo@dominio.com"
                    disabled={mode === "edit"}
                  />
                  <small>
                    {mode === "edit"
                      ? "El email es único y no se edita aquí."
                      : "Debe coincidir con el correo con el que el usuario iniciará sesión."}
                  </small>
                </Field>

                <Field>
                  <label>Rol</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm((p) => ({ ...p, rol: e.target.value }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <label>Teléfono</label>
                  <input
                    value={form.telefono}
                    onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                    placeholder="809..."
                  />
                </Field>

                <Field style={{ gridColumn: "1 / -1" }}>
                  <label>Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej: Fabio Arvelo"
                  />
                </Field>

                <Field style={{ gridColumn: "1 / -1" }}>
                  <label>Área</label>
                  <select
                    value={AREAS_SUGERIDAS.includes(form.area) ? form.area : ""}
                    onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                  >
                    <option value="">(Sin área)</option>
                    {AREAS_SUGERIDAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>

                  <input
                    value={form.area}
                    onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                    placeholder="Área personalizada (opcional)"
                    style={{ marginTop: 8 }}
                  />

                  <small>Se guarda en la columna <b>area</b>.</small>
                </Field>
              </FormGrid>
            </ModalBody>

            <ModalFoot>
              <GhostBtn onClick={() => setModalOpen(false)}>
                <X size={16} /> Cancelar
              </GhostBtn>
              <PrimaryBtn onClick={saveUser} disabled={saving}>
                <Check size={16} /> {saving ? "Guardando..." : "Guardar"}
              </PrimaryBtn>
            </ModalFoot>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
}
