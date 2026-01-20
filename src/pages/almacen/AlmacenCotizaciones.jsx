// src/pages/almacen/AlmacenCotizaciones.jsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, RefreshCw, Search } from "lucide-react";

const Wrap = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.text};
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const SearchBox = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  min-width: 320px;

  input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    color: ${({ theme }) => theme.text};
  }
`;

const Btn = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  color: #fff;
  border-radius: 8px;
  padding: 0.55rem 0.8rem;
  cursor: pointer;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 10px;
  overflow: hidden;

  th, td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
  }
  th {
    background: ${({ theme }) => theme.accent};
    color: white;
    text-transform: uppercase;
    font-size: 0.82rem;
  }
`;

function safeText(v) {
  return String(v ?? "").toLowerCase().trim();
}

function labelCliente(cot) {
  const c = cot?.cliente_ref;
  if (!c) return cot?.cliente || "-";
  if (c.tipo_cliente === "empresa") return `${c.nombre} (RNC: ${c.empresa_rnc || "-"})`;
  return `${c.nombre} (Cédula: ${c.cedula || "-"})`;
}

export default function AlmacenCotizaciones() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cotizaciones")
        .select(`
          id, fecha, estado, total, preventa_id, cliente, cliente_id, inventario_descontado,
          cliente_ref:clientes!cotizaciones_cliente_id_fkey ( id, tipo_cliente, nombre, cedula, empresa_rnc )
        `)
        .eq("estado", "preparacion")
        .order("id", { ascending: false });

      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar cotizaciones en preparación.", "error");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const qq = safeText(q);
    if (!qq) return rows;
    return (rows || []).filter((r) => {
      const c = r.cliente_ref || {};
      const hay = [
        r.id, r.estado, r.preventa_id, r.total,
        r.cliente,
        c.nombre, c.cedula, c.empresa_rnc
      ].map(safeText).join(" | ");
      return hay.includes(qq);
    });
  }, [rows, q]);

  return (
    <Wrap>
      <Top>
        <div>
          <h2 style={{ margin: 0, color: "#00bcd4" }}>Almacén — Preparación</h2>
          <div style={{ opacity: 0.8, fontSize: 13 }}>
            Cotizaciones aceptadas comercialmente (inventario aún no descontado).
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <SearchBox>
            <Search size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." />
          </SearchBox>

          <Btn onClick={load}><RefreshCw size={16} /> Recargar</Btn>
        </div>
      </Top>

      {loading ? (
        <div style={{ padding: "1rem", opacity: 0.8 }}>Cargando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "1rem", opacity: 0.8 }}>No hay cotizaciones en preparación.</div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Preventa</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>{labelCliente(c)}</td>
                <td>{c.preventa_id ? `#${c.preventa_id}` : "-"}</td>
                <td>RD${Number(c.total || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
                <td>{c.fecha ? new Date(c.fecha).toLocaleString() : "-"}</td>
                <td>
                  <Btn onClick={() => navigate(`/almacen/cotizacion/${c.id}`)}>
                    <Eye size={16} /> Despachar
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Wrap>
  );
}
