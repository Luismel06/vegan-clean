// src/pages/vendedor/VendedorHistorial.jsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";

const Wrap = styled.section`
  padding: 1.6rem 2rem;
  color: ${({ theme }) => theme.text};
`;

const Title = styled.h2`
  margin: 0;
`;

const Card = styled.div`
  margin-top: 1rem;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  overflow: hidden;
`;

const Head = styled.div`
  padding: 0.9rem 1rem;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  font-weight: 900;
`;

const Btn = styled.button`
  border: none;
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  font-weight: 900;
  cursor: pointer;
  background: ${({ theme }) => theme.accent};
  color: #000;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: top;
  }
  th {
    background: ${({ theme }) => theme.background};
    font-weight: 900;
  }
`;

function formatRD(v) {
  const n = Number(v || 0);
  return `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function safeText(v) {
  return String(v ?? "").trim();
}

async function getVendedorId() {
  // Preferido: Supabase Auth
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user?.id) return data.user.id;

  // Fallback si guardas algo en localStorage
  const ls = localStorage.getItem("user_id");
  return ls || null;
}

export default function VendedorHistorial() {
  const [loading, setLoading] = useState(true);
  const [preventas, setPreventas] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);

  const [vendedorId, setVendedorId] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      setLoading(true);

      const vid = await getVendedorId();
      setVendedorId(vid);

      if (!vid) {
        setPreventas([]);
        setCotizaciones([]);
        Swal.fire("Sesión", "No se detectó el vendedor (user_id). Inicia sesión nuevamente.", "warning");
        return;
      }

      // 1) Preventas SOLO del vendedor
      const { data: prev, error: e1 } = await supabase
        .from("preventas")
        .select("id, numero_caso, estado, creado_en, cliente, cliente_id, vendedor_id")
        .eq("vendedor_id", vid)
        .order("creado_en", { ascending: false })
        .limit(30);

      if (e1) throw e1;

      // 2) Cotizaciones SOLO del vendedor:
      const hasCotVendedorId = true;

      let cot = [];

      if (hasCotVendedorId) {
        const { data: cotData, error: e2 } = await supabase
          .from("cotizaciones")
          .select("id, estado, fecha, total, preventa_id, cliente_id, numero_caso, vendedor_id")
          .eq("vendedor_id", vid)
          .order("fecha", { ascending: false })
          .limit(30);

        if (e2) throw e2;
        cot = cotData || [];
      } else {
        const ids = (prev || []).map((x) => x.id);
        if (ids.length > 0) {
          const { data: cotData, error: e2 } = await supabase
            .from("cotizaciones")
            .select("id, estado, fecha, total, preventa_id, cliente_id, numero_caso")
            .in("preventa_id", ids)
            .order("fecha", { ascending: false })
            .limit(30);

          if (e2) throw e2;
          cot = cotData || [];
        } else {
          cot = [];
        }
      }

      setPreventas(prev || []);
      setCotizaciones(cot || []);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo cargar el historial.", "error");
    } finally {
      setLoading(false);
    }
  }

  const resumen = useMemo(() => {
    const p = preventas || [];
    const c = cotizaciones || [];
    const total30 = c.reduce((acc, x) => acc + Number(x.total || 0), 0);
    return {
      prevCount: p.length,
      cotCount: c.length,
      total30,
    };
  }, [preventas, cotizaciones]);

  return (
    <Wrap>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Title>Historial vendedor</Title>
          <div style={{ opacity: 0.8, fontSize: 13 }}>
            Solo tus preventas y cotizaciones recientes.
            {vendedorId ? (
              <span style={{ marginLeft: 8, opacity: 0.8 }}>
                (vendedor_id: <strong>{safeText(vendedorId).slice(0, 8)}…</strong>)
              </span>
            ) : null}
          </div>

          {!loading ? (
            <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
              Preventas: <strong>{resumen.prevCount}</strong>
            </div>
          ) : null}
        </div>

        <Btn onClick={cargar}>Recargar</Btn>
      </div>

      <Card>
        <Head>Preventas recientes</Head>
        <Table>
          <thead>
            <tr>
              <th>#Caso</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {(preventas || []).map((p) => (
              <tr key={p.id}>
                <td>{p.numero_caso || "-"}</td>
                <td>{p.estado || "-"}</td>
                <td>{p.creado_en ? new Date(p.creado_en).toLocaleString() : "-"}</td>
                <td>{p.id}</td>
              </tr>
            ))}
            {!loading && (preventas || []).length === 0 && (
              <tr>
                <td colSpan={4}>Sin datos.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Wrap>
  );
}
