import { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import { useAuthStore } from "../../store/useAuthStore.jsx";

import {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// === ESTILOS ===
const Container = styled.section`
  width: 100%;
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  width: 100%;
  max-width: 1100px;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const Subtitle = styled.p`
  opacity: 0.7;
  margin-top: 0.2rem;
`;

const Grid = styled.div`
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.8rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  transition: 0.2s;
  &:hover {
    transform: translateY(-4px);
  }
`;

const IconWrapper = styled.div`
  margin: 0 auto 1rem;
  background: ${({ theme }) => theme.accent};
  color: white;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.3rem;
`;

const CardValue = styled.p`
  font-size: 1.6rem;
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
`;

const ChartContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  background: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 16px;
  margin-top: 2.5rem;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
`;

const ChartTitle = styled.h2`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 1.5rem;
`;

const ActivityList = styled.div`
  margin-top: 2rem;
  width: 100%;
  max-width: 1100px;
  padding: 1.5rem;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
`;

const ActivityItem = styled.div`
  padding: 0.8rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  p {
    margin: 0.1rem 0;
  }

  span {
    color: ${({ theme }) => theme.accent};
    font-weight: 600;
  }
`;

// === COMPONENTE PRINCIPAL ===
export default function DashboardVendedor() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    asignados: 0,
    pendientes: 0,
    completados: 0,
    reprogramados: 0,
    proximaVisita: null,
  });

  const [actividad, setActividad] = useState([]);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (user?.email) cargarDatos();
  }, [user]);

  async function cargarDatos() {
    const email = user.email;

    // =============================
    // 1. TICKETS ASIGNADOS AL vendedor
    // =============================
    const { data: tickets } = await supabase
      .from("solicitudes")
      .select("*")
      .ilike("vendedor_asignado", `%${email}%`);

    const asignados = tickets.length;
    const pendientes = tickets.filter(
      (t) =>
        t.estado_solicitud === "pendiente" ||
        t.estado_solicitud === "Agendado"
    ).length;

    const completados = tickets.filter(
      (t) =>
        t.estado_solicitud === "Completado" ||
        t.estado_solicitud === "Finalizado"
    ).length;

    const reprogramados = tickets.filter(
      (t) => t.estado_solicitud === "Requiere reprogramación"
    ).length;

    const visitas = tickets.filter((t) => t.fecha_agendada);
    const proximaVisita =
      visitas.sort(
        (a, b) => new Date(a.fecha_agendada) - new Date(b.fecha_agendada)
      )[0] || null;

    // =============================
    // 2. HISTORIAL DEL vendedor (5 más recientes)
    // =============================
    const { data: hist } = await supabase
      .from("historial_tickets")
      .select("*")
      .eq("usuario", email)
      .order("fecha", { ascending: false })
      .limit(5);

    setHistorial(hist || []);

    // =============================
    // 3. ACTIVIDAD SEMANAL REAL
    // =============================
    const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];

    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());

    const finSemana = new Date();
    finSemana.setDate(inicioSemana.getDate() + 6);

    const { data: actividadHistorial } = await supabase
      .from("historial_tickets")
      .select("fecha")
      .eq("usuario", email)
      .gte("fecha", inicioSemana.toISOString())
      .lte("fecha", finSemana.toISOString());

    const { data: actividadRequests } = await supabase
      .from("vendedor_requests")
      .select("fecha_solicitud")
      .eq("vendedor_email", email)
      .gte("fecha_solicitud", inicioSemana.toISOString())
      .lte("fecha_solicitud", finSemana.toISOString());

    const contador = Array(7).fill(0);

    actividadHistorial?.forEach((h) => {
      const dia = new Date(h.fecha).getDay();
      contador[dia]++;
    });

    actividadRequests?.forEach((r) => {
      const dia = new Date(r.fecha_solicitud).getDay();
      contador[dia]++;
    });

    const actividadReal = diasSemana.map((d, i) => ({
      dia: d,
      tickets: contador[i],
    }));

    setActividad(actividadReal);

    setStats({
      asignados,
      pendientes,
      completados,
      reprogramados,
      proximaVisita,
    });
  }

  return (
    <Container>
      <Header>
        <Title>Dashboard Técnico</Title>
        <Subtitle>
          Hola {user?.email}, aquí tienes tu actividad real y visitas programadas.
        </Subtitle>
      </Header>

      {/* TARJETAS */}
      <Grid>
        <Card>
          <IconWrapper><ClipboardList size={26} /></IconWrapper>
          <CardTitle>Tickets Asignados</CardTitle>
          <CardValue>{stats.asignados}</CardValue>
        </Card>

        <Card>
          <IconWrapper><Clock size={26} /></IconWrapper>
          <CardTitle>Pendientes</CardTitle>
          <CardValue>{stats.pendientes}</CardValue>
        </Card>

        <Card>
          <IconWrapper><CheckCircle size={26} /></IconWrapper>
          <CardTitle>Completados</CardTitle>
          <CardValue>{stats.completados}</CardValue>
        </Card>

        <Card>
          <IconWrapper><AlertTriangle size={26} /></IconWrapper>
          <CardTitle>Reprogramados</CardTitle>
          <CardValue>{stats.reprogramados}</CardValue>
        </Card>
      </Grid>

      {/* PROXIMA VISITA */}
      {stats.proximaVisita && (
        <Card style={{ marginTop: "1.5rem", maxWidth: "1100px" }}>
          <IconWrapper><Calendar size={26} /></IconWrapper>
          <CardTitle>Próxima Visita</CardTitle>
          <p style={{ fontSize: "1rem", opacity: 0.8 }}>
            {stats.proximaVisita.cliente} —{" "}
            <strong>
              {new Date(stats.proximaVisita.fecha_agendada).toLocaleDateString()}
            </strong>
          </p>
        </Card>
      )}

      {/* GRAFICO REAL */}
      <ChartContainer>
        <ChartTitle>Actividad semanal real</ChartTitle>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={actividad}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="dia" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="tickets" fill="#00bcd4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* ACTIVIDAD RECIENTE */}
      <ActivityList>
        <h3 style={{ color: "#00bcd4" }}>Actividad reciente</h3>

        {historial.length === 0 ? (
          <p>No hay actividad reciente.</p>
        ) : (
          historial.map((h) => (
            <ActivityItem key={h.id}>
              <p>
                <span>{h.accion}</span> — {h.descripcion}
              </p>
              <small>{new Date(h.fecha).toLocaleString()}</small>
            </ActivityItem>
          ))
        )}
      </ActivityList>
    </Container>
  );
}
