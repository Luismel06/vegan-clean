// src/pages/admin/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Award,
  PackageCheck,
  ClipboardList,
  RefreshCw,
  LogOut,
  Activity,
  BadgeDollarSign,
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* =========================
   Helpers
========================= */
function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function monthKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

function fmtMoney(n) {
  const v = safeNumber(n, 0);
  return `RD$ ${v.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* =========================
   Chart Colors (All graphs)
   - explicit colors so everything is consistent
========================= */

// Accent palette (kept consistent across charts)
const CHART = {
  lineVentas12m: "#16a34a", // green
  barEstados: "#2563eb", // blue
  barEstadosGrid: "rgba(37, 99, 235, 0.18)",
  barEstadosText: "#0f172a",
  barTopMonto: "#f59e0b", // amber
  barTopQty: "#06b6d4", // cyan
};

// Pie palette (Top 5 vendidos)
const PIE_COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#14b8a6"];

// Optional: consistent color by name (if you want stable colors even when order changes)
// If not found, falls back to PIE_COLORS by index.
const PIE_COLOR_BY_NAME = {
  // "Ambientador Spray": "#2563eb",
  // "Antitabaco": "#ef4444",
  // "Carrito de Servicios": "#22c55e",
};

/* =========================
   Styles (same visual language)
========================= */
const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const Wrapper = styled.section`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 1.5rem 1rem 4rem;
  transition: background-color 0.25s ease, color 0.25s ease;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin: 0.75rem 0 1.1rem;
`;

const HeaderLeft = styled.div`
  min-width: 280px;

  h1 {
    margin: 0;
    font-weight: 1000;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.heading || theme.text};
    font-size: 1.5rem;
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
  margin-top: 0.85rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(6, 1fr);
  }
  @media (max-width: 680px) {
    grid-template-columns: repeat(2, 1fr);
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
`;

const Muted = styled.div`
  font-size: 0.88rem;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.78 : 0.84)};
  line-height: 1.4;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 0.85rem;
  margin-top: 0.85rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled(Card)`
  padding: 1rem;
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

const List = styled.div`
  display: grid;
  gap: 0.7rem;
  margin-top: 0.35rem;
`;

const LogItem = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 16px;
  padding: 0.8rem 0.9rem;
  display: grid;
  gap: 0.25rem;

  strong {
    font-weight: 1000;
  }
  small {
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.75 : 0.82)};
  }
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 950;
  font-size: 0.82rem;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
`;

/* =========================
   Custom Tooltip (consistent look)
========================= */
function ChartTooltip({ active, payload, label, formatterPrefix = "" }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
        maxWidth: 260,
      }}
    >
      <div style={{ fontWeight: 950, marginBottom: 6 }}>{label}</div>
      {payload.map((p, idx) => (
        <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <span style={{ opacity: 0.9 }}>{p.name}</span>
          <strong>
            {formatterPrefix}
            {typeof p.value === "number" ? p.value.toLocaleString("es-DO") : String(p.value)}
          </strong>
        </div>
      ))}
    </div>
  );
}

/* =========================
   Component
========================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    usuarios: 0,
    productos: 0,
    totalVendido: 0, // aceptada/preparacion/despachado
    ventasMes: 0,
    despachadasMes: 0,
    topItemVendido: "-",
    cotizacionesMes: 0,
  });

  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [estadoCotizaciones, setEstadoCotizaciones] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setUser(data.user);
      await cargarDatos();
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function logout() {
    try {
      await supabase.auth.signOut();
      navigate("/admin/login", { replace: true });
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo cerrar sesión.", "error");
    }
  }

  async function cargarDatos() {
    try {
      setLoading(true);

      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const [usuariosRes, productosRes, cotRes, topVendidosRes, movRes] = await Promise.all([
        supabase.from("usuarios").select("*", { count: "exact", head: true }),
        supabase.from("productos").select("*", { count: "exact", head: true }),
        supabase.from("cotizaciones").select("id, total, estado, fecha").order("id", { ascending: false }),
        supabase
          .from("v_top_items_vendidos")
          .select("tipo, item_id, nombre, unidades, subtotal")
          .order("subtotal", { ascending: false })
          .limit(10),
        supabase
          .from("movimientos")
          .select("id, created_at, actor_id, accion, cotizacion_id, monto, estado_nuevo")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (cotRes.error) throw cotRes.error;
      if (topVendidosRes.error) throw topVendidosRes.error;
      if (movRes.error) throw movRes.error;

      const cotizaciones = cotRes.data || [];

      const isVenta = (e) => ["aceptada", "preparacion", "despachado"].includes(String(e || "").trim().toLowerCase());
      const isDesp = (e) => String(e || "").trim().toLowerCase() === "despachado";

      const totalVendido = cotizaciones.filter((c) => isVenta(c.estado)).reduce((acc, c) => acc + safeNumber(c.total, 0), 0);

      const ventasMes = cotizaciones
        .filter((c) => isVenta(c.estado) && new Date(c.fecha) >= startMonth && new Date(c.fecha) < endMonth)
        .reduce((acc, c) => acc + safeNumber(c.total, 0), 0);

      const despachadasMes = cotizaciones
        .filter((c) => isDesp(c.estado) && new Date(c.fecha) >= startMonth && new Date(c.fecha) < endMonth)
        .reduce((acc, c) => acc + safeNumber(c.total, 0), 0);

      const cotizacionesMes = cotizaciones.filter((c) => new Date(c.fecha) >= startMonth && new Date(c.fecha) < endMonth).length;

      // Estado cotizaciones (bar)
      const counts = cotizaciones.reduce((acc, c) => {
        const k = String(c.estado || "sin_estado").trim().toLowerCase();
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {});
      const estadoData = Object.entries(counts).map(([estado, cantidad]) => ({ estado, cantidad }));

      // Ventas mensuales (12m)
      const ventasPorMes = {};
      for (const c of cotizaciones) {
        if (!isVenta(c.estado)) continue;
        const k = monthKey(c.fecha);
        ventasPorMes[k] = (ventasPorMes[k] || 0) + safeNumber(c.total, 0);
      }

      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const k = monthKey(d);
        months.push({
          mes: d.toLocaleString("es-DO", { month: "short" }),
          key: k,
          total: safeNumber(ventasPorMes[k], 0),
        });
      }

      const topItemsData = topVendidosRes.data || [];
      const topItemVendido = topItemsData[0]?.nombre || "Sin datos";

      setStats({
        usuarios: usuariosRes.count || 0,
        productos: productosRes.count || 0,
        totalVendido,
        ventasMes,
        despachadasMes,
        topItemVendido,
        cotizacionesMes,
      });

      setVentasMensuales(months);
      setEstadoCotizaciones(estadoData);
      setTopItems(topItemsData);
      setMovimientos(movRes.data || []);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar los datos del dashboard.", "error");
    } finally {
      setLoading(false);
    }
  }

  const pieData = useMemo(() => {
    // Top 5 para pastel
    const list = (topItems || []).slice(0, 5);
    const total = list.reduce((acc, x) => acc + safeNumber(x.subtotal, 0), 0) || 1;
    return list.map((x) => ({
      name: x.nombre,
      value: safeNumber(x.subtotal, 0),
      pct: (safeNumber(x.subtotal, 0) / total) * 100,
    }));
  }, [topItems]);

  const topBarData = useMemo(() => {
    // Top 10 para barras (monto + unidades)
    return (topItems || []).slice(0, 10).map((x) => ({
      name: x.nombre,
      monto: safeNumber(x.subtotal, 0),
      unidades: safeNumber(x.unidades, 0),
    }));
  }, [topItems]);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Usuario";

  return (
    <Wrapper>
      <Container>
        <Header>
          <HeaderLeft>
            <h1>
              <BadgeDollarSign size={18} />
              Dashboard de Ventas
            </h1>
            <p>
              Hola <strong>{displayName}</strong>. Resumen basado en <strong>cotizaciones</strong> y <strong>logs</strong>. Venta:
              <strong> aceptada + preparación + despachado</strong>.
            </p>
          </HeaderLeft>

          <HeaderRight>
            <GhostBtn onClick={cargarDatos} disabled={loading}>
              <RefreshCw size={16} /> {loading ? "Cargando..." : "Recargar"}
            </GhostBtn>
            <GhostBtn onClick={logout}>
              <LogOut size={16} /> Salir
            </GhostBtn>
          </HeaderRight>
        </Header>

        {/* =========================
            Stat cards
        ========================= */}
        <Grid>
          <StatCard>
            <StatTop>
              <StatTitle>
                <DollarSign size={16} /> Total vendido
              </StatTitle>
              <DollarSign size={16} />
            </StatTop>
            <StatValue>{loading ? "—" : fmtMoney(stats.totalVendido)}</StatValue>
            <Muted>Aceptada + preparación + despachado.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <TrendingUp size={16} /> Ventas del mes
              </StatTitle>
              <TrendingUp size={16} />
            </StatTop>
            <StatValue>{loading ? "—" : fmtMoney(stats.ventasMes)}</StatValue>
            <Muted>Basado en la fecha de creación.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <PackageCheck size={16} /> Despachado (mes)
              </StatTitle>
              <PackageCheck size={16} />
            </StatTop>
            <StatValue>{loading ? "—" : fmtMoney(stats.despachadasMes)}</StatValue>
            <Muted>Venta real confirmada por despacho.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <Award size={16} /> Top vendido
              </StatTitle>
              <Award size={16} />
            </StatTop>
            <StatValue style={{ fontSize: "1.05rem" }}>{loading ? "—" : stats.topItemVendido}</StatValue>
            <Muted>Según v_top_items_vendidos.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <ShoppingBag size={16} /> Productos
              </StatTitle>
              <ShoppingBag size={16} />
            </StatTop>
            <StatValue>{loading ? "—" : stats.productos}</StatValue>
            <Muted>Conteo de productos activos.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <Users size={16} /> Usuarios
              </StatTitle>
              <Users size={16} />
            </StatTop>
            <StatValue>{loading ? "—" : stats.usuarios}</StatValue>
            <Muted>Usuarios registrados en el sistema.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <ClipboardList size={16} /> Cotizaciones (mes)
              </StatTitle>
              <ClipboardList size={16} />
            </StatTop>
            <StatValue>{loading ? "—" : stats.cotizacionesMes}</StatValue>
            <Muted>Cantidad creada en el mes actual.</Muted>
          </StatCard>

          <StatCard>
            <StatTop>
              <StatTitle>
                <Activity size={16} /> Logs recientes
              </StatTitle>
              <Activity size={16} />
            </StatTop>
            <StatValue>{loading ? "—" : movimientos.length}</StatValue>
            <Muted>Últimos cambios registrados.</Muted>
          </StatCard>
        </Grid>

        {/* =========================
            Charts
        ========================= */}
        <TwoCol>
          {/* 12m Line */}
          <Panel>
            <PanelTitle>
              <LineIcon size={18} /> Ventas (últimos 12 meses)
            </PanelTitle>
            <Muted>Serie mensual (cotizaciones en estados de venta).</Muted>

            <div style={{ width: "100%", height: 300, marginTop: 10 }}>
              {loading ? (
                <SkeletonRow />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ventasMensuales}>
                    <CartesianGrid stroke={CHART.barEstadosGrid} strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip content={<ChartTooltip formatterPrefix="RD$ " />} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke={CHART.lineVentas12m}
                      strokeWidth={3}
                      dot={{ r: 3, fill: CHART.lineVentas12m }}
                      activeDot={{ r: 6, fill: CHART.lineVentas12m }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>

          {/* Estado Bar */}
          <Panel>
            <PanelTitle>
              <BarChart3 size={18} /> Estado de cotizaciones (conteo)
            </PanelTitle>
            <Muted>Distribución por estado (mes actual según fecha).</Muted>

            <div style={{ width: "100%", height: 300, marginTop: 10 }}>
              {loading ? (
                <SkeletonRow />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={estadoCotizaciones}>
                    <CartesianGrid stroke={CHART.barEstadosGrid} strokeDasharray="3 3" />
                    <XAxis dataKey="estado" />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="cantidad" name="Cantidad" fill={CHART.barEstados} radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>
        </TwoCol>

        {/* Top bars + Pie */}
        <TwoCol>
          {/* Top 10 bar */}
          <Panel>
            <PanelTitle>
              <BarChart3 size={18} /> Top 10 vendidos (monto / unidades)
            </PanelTitle>
            <Muted>Comparación por monto y unidades (según v_top_items_vendidos).</Muted>

            <div style={{ width: "100%", height: 330, marginTop: 10 }}>
              {loading ? (
                <SkeletonRow />
              ) : topBarData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBarData}>
                    <CartesianGrid stroke={CHART.barEstadosGrid} strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const name = payload?.[0]?.payload?.name || label;
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
                                <strong>{p.dataKey === "monto" ? fmtMoney(p.value) : p.value}</strong>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar dataKey="monto" name="Monto (RD$)" fill={CHART.barTopMonto} radius={[10, 10, 0, 0]} />
                    <Bar dataKey="unidades" name="Unidades" fill={CHART.barTopQty} radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Muted style={{ marginTop: 8 }}>No hay datos para top.</Muted>
              )}
            </div>
          </Panel>

          {/* Pie Top 5 */}
          <Panel>
            <PanelTitle>
              <PieIcon size={18} /> Top 5 vendidos (subtotal)
            </PanelTitle>
            <Muted>Basado en v_top_items_vendidos. Muestra participación aproximada.</Muted>

            <div style={{ width: "100%", height: 330, marginTop: 10 }}>
              {loading ? (
                <SkeletonRow />
              ) : pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(v) => fmtMoney(v)}
                      labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={105}
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, idx) => {
                        const byName = PIE_COLOR_BY_NAME[entry.name];
                        const fallback = PIE_COLORS[idx % PIE_COLORS.length];
                        return <Cell key={`cell-${idx}`} fill={byName || fallback} />;
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Muted style={{ marginTop: 8 }}>No hay datos para el top 5.</Muted>
              )}
            </div>
          </Panel>
        </TwoCol>

        {/* =========================
            Logs
        ========================= */}
        <Panel style={{ marginTop: "0.85rem" }}>
          <PanelTitle>
            <Activity size={18} /> Actividad (Logs)
          </PanelTitle>
          <Muted>Últimos movimientos registrados.</Muted>

          <div style={{ marginTop: 12 }}>
            {loading ? (
              <SkeletonRow />
            ) : movimientos?.length ? (
              <List>
                {movimientos.map((m) => (
                  <LogItem key={m.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <strong>{m.accion}</strong>{" "}
                        <Pill>{(m.estado_nuevo || "-").toLowerCase()}</Pill>
                      </div>
                      <div style={{ fontWeight: 950 }}>{fmtMoney(m.monto)}</div>
                    </div>

                    <div style={{ opacity: 0.88 }}>
                      Cotización: <strong>#{m.cotizacion_id ?? "-"}</strong>
                    </div>

                    <small>{new Date(m.created_at).toLocaleString("es-DO")}</small>
                  </LogItem>
                ))}
              </List>
            ) : (
              <Muted style={{ marginTop: 6 }}>No hay registros recientes.</Muted>
            )}
          </div>
        </Panel>
      </Container>
    </Wrapper>
  );
}
