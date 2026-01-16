// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import {
  Users,
  ClipboardList,
  ShoppingBag,
  Wrench,
  DollarSign,
  TrendingUp,
  Award,
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
} from "recharts";

// === Estilos ===
const Container = styled.section`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem 4rem;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Header = styled.div`
  text-align: left;
  width: 100%;
  max-width: 1100px;
  margin-bottom: 2.5rem;
  margin-top: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary || "#888"};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1100px;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1.8rem 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.accent};
  width: 55px;
  height: 55px;
  border-radius: 50%;
  margin: 0 auto 1rem auto;
`;

const CardTitle = styled.h3`
  margin-bottom: 0.3rem;
  font-size: 1rem;
`;

const CardValue = styled.p`
  font-size: 1.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const ChartContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 16px;
  padding: 2rem;
  margin-top: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h2`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 1.5rem;
`;

const ActivitySection = styled.div`
  width: 100%;
  max-width: 1100px;
  margin-top: 3rem;
  background-color: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: left;
`;

const ActivityTitle = styled.h3`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 1.5rem;
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding: 0.8rem 0;
  font-size: 0.95rem;

  span {
    color: ${({ theme }) => theme.accent};
    font-weight: 600;
  }
`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // === Stats de ventas ===
  const [stats, setStats] = useState({
    usuarios: 0,
    servicios: 0,
    productos: 0,
    solicitudes: 0,
    totalVendido: 0,
    ventasMes: 0,
    productoTop: "-",
  });

  // === Stats de cotizaciones ===
  const [statsCot, setStatsCot] = useState({
    totalCotizado: 0,
    cotizacionesMes: 0,
    pendientes: 0,
    aceptadas: 0,
    rechazadas: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [actividades, setActividades] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        navigate("/admin/login", { replace: true });
      } else {
        setUser(data.user);
        cargarDatos();
      }
    };
    checkSession();
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      const [
        { count: usuarios },
        { count: servicios },
        { count: productos },
        solicitudesData,
        cotData,
        detalleVentasData,
      ] = await Promise.all([
        supabase.from("usuarios").select("*", { count: "exact", head: true }),
        supabase.from("servicios").select("*", { count: "exact", head: true }),
        supabase.from("productos").select("*", { count: "exact", head: true }),
        supabase.from("solicitudes").select("cliente, estado, fecha"),
        supabase.from("cotizaciones").select("total, estado, fecha"),
        supabase.from("productos").select("nombre, cantidad, precio"),
      ]);

      // === TOTAL VENDIDO (no incluye cotizaciones) ===
      // === TOTAL VENDIDO (solo cotizaciones aceptadas) ===
      const totalVendido =
        cotData.data
        ?.filter((c) => c.estado === "aceptada")
        .reduce((acc, c) => acc + Number(c.total || 0), 0) || 0;


      const mesActual = new Date().getMonth();

      // === VENTAS DEL MES (solo aceptadas) ===
      const ventasAceptadasMes =
        cotData.data?.filter(
    (c) =>
      c.estado === "aceptada" &&
      new Date(c.fecha).getMonth() === mesActual
          ) || [];

      const totalMes = ventasAceptadasMes.reduce(
  (acc, c) => acc + Number(c.total || 0),
  0
);

      const productoTop =
        detalleVentasData.data?.reduce(
          (max, p) => (p.cantidad > (max?.cantidad || 0) ? p : max),
          {}
        )?.nombre || "Sin datos";

      const estadoCounts = solicitudesData.data?.reduce((acc, s) => {
        acc[s.estado] = (acc[s.estado] || 0) + 1;
        return acc;
      }, {});

      const formattedData = Object.entries(estadoCounts || {}).map(
        ([estado, cantidad]) => ({ estado, cantidad })
      );

      // === Cotizaciones ===
      const totalCotizado =
        cotData.data?.reduce((acc, c) => acc + Number(c.total || 0), 0) || 0;

      const cotizacionesMes =
        cotData.data?.filter(
          (c) => new Date(c.fecha).getMonth() === mesActual
        ).length || 0;

      const pendientes =
        cotData.data?.filter((c) => c.estado === "pendiente").length || 0;

      const aceptadas =
        cotData.data?.filter((c) => c.estado === "aceptada").length || 0;

      const rechazadas =
        cotData.data?.filter((c) => c.estado === "rechazada").length || 0;

      setStatsCot({
        totalCotizado,
        cotizacionesMes,
        pendientes,
        aceptadas,
        rechazadas,
      });

      // === Ventas mensuales (para la gráfica) ===
      const ventasPorMes = Array(12).fill(0);
      cotData.data?.forEach((v) => {
        const mes = new Date(v.fecha).getMonth();
        ventasPorMes[mes] += v.total;
      });

      const ventasMensualesData = [
        "Ene", "Feb", "Mar", "Abr",
        "May", "Jun", "Jul", "Ago",
        "Sep", "Oct", "Nov", "Dic",
      ].map((m, i) => ({
        mes: m,
        total: ventasPorMes[i],
      }));

      const actividadesRecientes = solicitudesData.data
        ?.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5)
        .map((s) => ({
          cliente: s.cliente,
          estado: s.estado,
          fecha: new Date(s.fecha).toLocaleString(),
        }));

      setStats({
        usuarios,
        servicios,
        productos,
        solicitudes: solicitudesData.data?.length || 0,
        totalVendido,
        ventasMes: totalMes,
        productoTop,
      });

      setChartData(formattedData);
      setVentasMensuales(ventasMensualesData);
      setActividades(actividadesRecientes);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Resumen Financiero</Title>
        <Subtitle>
           Hola {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email},
          analiza tus ventas, cotizaciones y solicitudes.
        </Subtitle>
      </Header>

      {/* === Tarjetas existentes === */}
      <Grid>
        <Card>
          <IconWrapper><DollarSign size={26} /></IconWrapper>
          <CardTitle>Total Vendido</CardTitle>
          <CardValue>RD$ {stats.totalVendido.toLocaleString()}</CardValue>
        </Card>

        <Card>
          <IconWrapper><TrendingUp size={26} /></IconWrapper>
          <CardTitle>Ventas del Mes</CardTitle>
          <CardValue>RD$ {stats.ventasMes.toLocaleString()}</CardValue>
        </Card>

        <Card>
          <IconWrapper><Award size={26} /></IconWrapper>
          <CardTitle>Más Vendido</CardTitle>
          <CardValue>{stats.productoTop}</CardValue>
        </Card>

        <Card>
          <IconWrapper><ClipboardList size={26} /></IconWrapper>
          <CardTitle>Solicitudes</CardTitle>
          <CardValue>{stats.solicitudes}</CardValue>
        </Card>
      </Grid>

      {/* === NUEVAS TARJETAS DE COTIZACIONES === */}
      <Grid style={{ marginTop: "2rem" }}>
        <Card>
          <IconWrapper><DollarSign size={26} /></IconWrapper>
          <CardTitle>Total Cotizado</CardTitle>
          <CardValue>RD$ {statsCot.totalCotizado.toLocaleString()}</CardValue>
        </Card>

        <Card>
          <IconWrapper><TrendingUp size={26} /></IconWrapper>
          <CardTitle>Cotizaciones del Mes</CardTitle>
          <CardValue>{statsCot.cotizacionesMes}</CardValue>
        </Card>

        <Card>
          <IconWrapper><ClipboardList size={26} /></IconWrapper>
          <CardTitle>Pendientes</CardTitle>
          <CardValue>{statsCot.pendientes}</CardValue>
        </Card>

        <Card>
          <IconWrapper><Award size={26} /></IconWrapper>
          <CardTitle>Aceptadas</CardTitle>
          <CardValue>{statsCot.aceptadas}</CardValue>
        </Card>

        <Card>
          <IconWrapper><Wrench size={26} /></IconWrapper>
          <CardTitle>Rechazadas</CardTitle>
          <CardValue>{statsCot.rechazadas}</CardValue>
        </Card>
      </Grid>

      {/* === Ventas Mensuales === */}
      <ChartContainer>
        <ChartTitle>Ventas Mensuales</ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ventasMensuales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="mes" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#00bcd4"
              strokeWidth={3}
              dot={{ r: 5, fill: "#00bcd4" }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* === Estado de Solicitudes === */}
      <ChartContainer>
        <ChartTitle>Estado de las Solicitudes</ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="estado" stroke="#999" />
            <YAxis allowDecimals={false} stroke="#999" />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#00bcd4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* === Actividad Reciente === */}
      <ActivitySection>
        <ActivityTitle>Actividad Reciente</ActivityTitle>
        <ActivityList>
          {actividades?.length > 0 ? (
            actividades.map((a, i) => (
              <ActivityItem key={i}>
                <span>{a.cliente}</span> — {a.estado}
                <br />
                <small>{a.fecha}</small>
              </ActivityItem>
            ))
          ) : (
            <p>No hay registros recientes.</p>
          )}
        </ActivityList>
      </ActivitySection>
    </Container>
  );
}
