// src/pages/vendedor/VendedorDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { useNavigate } from "react-router-dom";

const Wrap = styled.section`
  padding: 1.6rem 2rem;
  color: ${({ theme }) => theme.text};
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  margin: 0;
`;

const Cards = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1rem;
`;

const Big = styled.div`
  font-size: 1.6rem;
  font-weight: 900;
  margin-top: 6px;
`;

const Sub = styled.div`
  opacity: 0.8;
  font-size: 0.9rem;
`;

const TableWrap = styled.div`
  margin-top: 1rem;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  overflow: hidden;
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

const Btn = styled.button`
  border: none;
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  font-weight: 900;
  cursor: pointer;
  background: ${({ theme }) => theme.accent};
  color: #000;
`;

async function getVendedorId() {
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user?.id) return data.user.id;

  const ls = localStorage.getItem("user_id");
  return ls || null;
}

async function getVendedorMatchIds() {
  const ids = new Set();
  const authId = await getVendedorId();
  if (authId) ids.add(String(authId));

  try {
    const { data: auth } = await supabase.auth.getUser();
    const email = auth?.user?.email || null;
    if (email) {
      const { data: perfil, error } = await supabase
        .from("usuarios")
        .select("auth_uid")
        .eq("email", email)
        .maybeSingle();

      if (!error && perfil?.auth_uid) {
        ids.add(String(perfil.auth_uid));
      }
    }
  } catch {
    // no-op
  }

  return Array.from(ids);
}

function byVendedorIds(query, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return query;
  if (ids.length === 1) return query.eq("vendedor_id", ids[0]);
  return query.in("vendedor_id", ids);
}

export default function VendedorDashboard() {
  const nav = useNavigate();
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

      const matchIds = await getVendedorMatchIds();
      const vid = matchIds[0] || null;
      setVendedorId(vid);

      if (!matchIds.length) {
        setPreventas([]);
        setCotizaciones([]);
        Swal.fire("Sesión", "No se detectó el vendedor (user_id). Inicia sesión nuevamente.", "warning");
        return;
      }

      // Preventas SOLO del vendedor
      const prevQuery = byVendedorIds(
        supabase
          .from("preventas")
          .select("id, numero_caso, estado, creado_en, cliente_id, cliente, tipo_cliente, cedula, empresa_rnc, vendedor_id")
          .order("creado_en", { ascending: false })
          .limit(10),
        matchIds
      );
      const { data: prev, error: e1 } = await prevQuery;

      if (e1) throw e1;

      // Cotizaciones SOLO del vendedor (elige método)
      const hasCotVendedorId = true; // <<< pon false si NO tienes cotizaciones.vendedor_id

      let cot = [];

      if (hasCotVendedorId) {
        const cotQuery = byVendedorIds(
          supabase
            .from("cotizaciones")
            .select("id, estado, fecha, total, preventa_id, cliente_id, numero_caso, vendedor_id")
            .order("fecha", { ascending: false })
            .limit(10),
          matchIds
        );
        const { data: cotData, error: e2 } = await cotQuery;

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
            .limit(10);

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
      Swal.fire("Error", "No se pudo cargar el dashboard del vendedor.", "error");
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);

    const prevHoy = (preventas || []).filter((p) => p.creado_en && new Date(p.creado_en) >= today0).length;
    const cotHoy = (cotizaciones || []).filter((c) => c.fecha && new Date(c.fecha) >= today0).length;

    const cotPend = (cotizaciones || []).filter((c) => (c.estado || "") === "pendiente").length;
    const cotPrep = (cotizaciones || []).filter((c) => (c.estado || "") === "preparacion").length;

    const totalUltimas = (cotizaciones || []).reduce((acc, c) => acc + Number(c.total || 0), 0);

    return { prevHoy, cotHoy, cotPend, cotPrep, totalUltimas };
  }, [preventas, cotizaciones]);

  return (
    <Wrap>
      <Top>
        <div>
          <Title>Dashboard vendedor</Title>
          <Sub>
            Resumen rápido (solo tus registros).
            {vendedorId ? (
              <span style={{ marginLeft: 8, opacity: 0.8 }}>
                vendedor_id: <strong>{String(vendedorId).slice(0, 8)}…</strong>
              </span>
            ) : null}
          </Sub>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn onClick={() => nav("/vendedor/catalogo")}>Ir al catálogo</Btn>
          <Btn onClick={cargar}>Recargar</Btn>
        </div>
      </Top>

      <Cards>
        <Card>
          <Sub>Preventas de hoy</Sub>
          <Big>{loading ? "..." : metrics.prevHoy}</Big>
        </Card>
      </Cards>

      <TableWrap>
        <div style={{ padding: "0.9rem 1rem", fontWeight: 900 }}>Últimas preventas</div>
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
            {!loading && (preventas || []).length === 0 && <tr><td colSpan={4}>Sin datos.</td></tr>}
          </tbody>
        </Table>
      </TableWrap>
    </Wrap>
  );
}
