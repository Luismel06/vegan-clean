// src/pages/admin/Tickets.jsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, FilePlus2, RefreshCw, Search } from "lucide-react";

/* ==================== ESTILOS ==================== */
const Container = styled.section`
  width: 100%;
  padding: 2rem;
  color: ${({ theme }) => theme.text};
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 1rem;
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 0.8fr;
  gap: 12px;
  width: 100%;
  max-width: 720px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
`;

const SearchBox = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 0.6rem 0.8rem;

  svg {
    opacity: 0.8;
  }

  input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const Tabs = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.border};
  margin-bottom: 1.3rem;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.8rem 1.1rem;
  color: ${({ $active, theme }) => ($active ? theme.accent : theme.text)};
  border-bottom: 3px solid ${({ $active, theme }) => ($active ? theme.accent : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;
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
    padding: 0.95rem 1rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    vertical-align: top;
  }

  th {
    background-color: ${({ theme }) => theme.accent};
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.82rem;
  }

  tr:hover {
    background-color: ${({ theme }) => theme.background};
    transition: 0.2s;
  }
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  background-color: ${({ theme }) => theme.accent};
  border: none;
  color: #fff;
  border-radius: 8px;
  padding: 0.55rem 0.8rem;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: 0.2s;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;

const SecondaryBtn = styled(Btn)`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const Empty = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  opacity: 0.8;
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

/* ==================== COMPONENTE ==================== */
export default function Tickets() {
  const navigate = useNavigate();

  // preventas tabs + tab almacen
  const [tab, setTab] = useState("enviada"); // enviada/en_revision/cotizando/cotizada/cerrada/cancelada/almacen
  const [loading, setLoading] = useState(true);

  const [preventas, setPreventas] = useState([]);
  const [almacenCotizaciones, setAlmacenCotizaciones] = useState([]); // cotizaciones en preparación/almacén

  // búsqueda y filtro
  const [query, setQuery] = useState("");
  const [dateWindow, setDateWindow] = useState("7"); // today | 7 | 30 | 90 | all

  useEffect(() => {
    cargarTodo();
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

      // 2) COTIZACIONES EN ALMACÉN (estado = "preparacion" por ahora)
      //    Nota: aquí también traemos preventa para mostrar #Caso
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

    // TAB ALMACÉN
    if (tab === "almacen") {
      return (almacenCotizaciones || [])
        .filter((c) => withinDateWindow(c, dateWindow, "fecha"))
        .filter((c) => matchesQueryCotizacion(c, q));
    }

    // TABS PREVENTAS
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

  function verCotizacion(cotizacionId) {
    // Ajusta la ruta si en tu router es distinta
    navigate(`/admin/cotizacion/${cotizacionId}`);
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

    const { error } = await supabase.from("preventas").update({ estado: nuevo }).eq("id", preventa.id);

    if (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar el estado.", "error");
      return;
    }
    cargarTodo();
  }

  return (
    <Container>
      <TopBar>
        <div style={{ minWidth: 260 }}>
          <h2 style={{ color: "#00bcd4", marginBottom: "0.2rem" }}>Tickets / Preventas</h2>
          <div style={{ opacity: 0.8, fontSize: 13 }}>
            Búsqueda por #Caso, cliente, cédula, RNC, email o teléfono. Incluye “Almacén”.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <SecondaryBtn onClick={cargarTodo}>
            <RefreshCw size={16} /> Recargar
          </SecondaryBtn>
        </div>

        <FiltersRow>
          <SearchBox>
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar tickets..." />
          </SearchBox>

          <Select value={dateWindow} onChange={(e) => setDateWindow(e.target.value)}>
            <option value="today">Hoy</option>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="all">Todos</option>
          </Select>
        </FiltersRow>
      </TopBar>

      <Tabs>
        <TabButton $active={tab === "enviada"} onClick={() => setTab("enviada")}>
          Llegaron ahora ({counts.enviada})
        </TabButton>
        <TabButton $active={tab === "en_revision"} onClick={() => setTab("en_revision")}>
          Activas ({counts.en_revision})
        </TabButton>
        <TabButton $active={tab === "cotizando"} onClick={() => setTab("cotizando")}>
          Cotizando ({counts.cotizando})
        </TabButton>
        <TabButton $active={tab === "cotizada"} onClick={() => setTab("cotizada")}>
          Cotizadas ({counts.cotizada})
        </TabButton>
        <TabButton $active={tab === "cerrada"} onClick={() => setTab("cerrada")}>
          Ventas (Aceptadas) ({counts.cerrada})
        </TabButton>
        <TabButton $active={tab === "cancelada"} onClick={() => setTab("cancelada")}>
          Canceladas ({counts.cancelada})
        </TabButton>

        {/* ✅ NUEVO TAB: ALMACÉN (cotizaciones en preparación) */}
        <TabButton $active={tab === "almacen"} onClick={() => setTab("almacen")}>
          En almacén / Preparación ({counts.almacen})
        </TabButton>
      </Tabs>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {loading ? (
          <Empty>Cargando...</Empty>
        ) : listFiltered.length === 0 ? (
          <Empty>No hay resultados con esos filtros.</Empty>
        ) : tab === "almacen" ? (
          /* ==================== TAB ALMACÉN (COTIZACIONES) ==================== */
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
                const caso = c?.preventa_ref?.numero_caso || c?.numero_caso || (c?.preventa_id ? `#${c.preventa_id}` : "-");

                return (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td>{caso || "-"}</td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{clienteLabel}</div>
                      {c?.cliente_ref && (
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                          Tipo: <strong>{tipo}</strong> · Recurrente:{" "}
                          <strong>{c.cliente_ref.es_recurrente ? "Sí" : "No"}</strong> · Puede fiar:{" "}
                          <strong>{c.cliente_ref.puede_fiar ? "Sí" : "No"}</strong>
                        </div>
                      )}
                    </td>
                    <td>{c.estado || "-"}</td>
                    <td>
                      <div>{c?.cliente_ref?.email || "-"}</div>
                      <div>{c?.cliente_ref?.telefono || "-"}</div>
                    </td>
                    <td>{c.fecha ? new Date(c.fecha).toLocaleString() : "-"}</td>
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
        ) : (
          /* ==================== TABS PREVENTAS ==================== */
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
                    <td>{p.id}</td>
                    <td>{p.numero_caso || "-"}</td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{clienteLabel}</div>
                      {p?.cliente_ref && (
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                          Recurrente: <strong>{p.cliente_ref.es_recurrente ? "Sí" : "No"}</strong> · Puede fiar:{" "}
                          <strong>{p.cliente_ref.puede_fiar ? "Sí" : "No"}</strong>
                        </div>
                      )}
                    </td>
                    <td>{tipo}</td>
                    <td>
                      <div>{p.email || p?.cliente_ref?.email || "-"}</div>
                      <div>{p.telefono || p?.cliente_ref?.telefono || "-"}</div>
                    </td>
                    <td>{p.creado_en ? new Date(p.creado_en).toLocaleString() : "-"}</td>
                    <td>
                      <ActionsCell>
                        <Btn onClick={() => verDetallesPreventa(p.id)}>
                          <Eye size={16} /> Ver
                        </Btn>

                        {tab !== "cotizando" && (
                          <SecondaryBtn onClick={() => cambiarEstadoPreventa(p, "cotizando")}>
                            Marcar cotizando
                          </SecondaryBtn>
                        )}

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
        )}
      </motion.div>
    </Container>
  );
}
