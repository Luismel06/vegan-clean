// src/pages/almacen/AlmacenDespacho.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { CheckCircle2, ArrowLeft, ScanLine, RefreshCw } from "lucide-react";

const Wrap = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.text};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1.2rem 1.3rem;
  margin-bottom: 1rem;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const Btn = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  color: #fff;
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  cursor: pointer;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const SecondaryBtn = styled(Btn)`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;

  th, td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: middle;
  }
  th {
    background: ${({ theme }) => theme.background};
    font-weight: 900;
  }
`;

const ScanBox = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 10px;

  input {
    padding: 0.7rem 0.8rem;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    min-width: 280px;
    outline: none;
  }
`;

function safeNum(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function parseScan(code) {
  const raw = String(code || "").trim().toUpperCase();
  if (!raw) return null;

  // Acepta: P-12, E-5, P12, E5, 12 (si solo número asumimos producto? no, devolvemos null)
  const m1 = raw.match(/^([PE])[- ]?(\d+)$/);
  if (m1) {
    return { tipo: m1[1] === "P" ? "producto" : "equipo", item_id: Number(m1[2]) };
  }

  return null;
}

export default function AlmacenDespacho() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cot, setCot] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [scan, setScan] = useState("");
  const [saving, setSaving] = useState(false);
  const RPC_CONFIRM = "confirmar_despacho_y_descontar";

  useEffect(() => { load(); }, [id]);

  async function load() {
    try {
      const { data: c, error: ec } = await supabase
        .from("cotizaciones")
        .select("id, estado, inventario_descontado, cliente, cliente_id, preventa_id, fecha")
        .eq("id", Number(id))
        .single();

      if (ec) throw ec;
      setCot(c);

      const { data: d, error: ed } = await supabase
        .from("detalle_cotizacion")
        .select(`
          id, cotizacion_id, producto_id, equipo_id, cantidad, cantidad_despachada,
          productos:producto_id ( id, nombre, marca, modelo ),
          equipos:equipo_id ( id, nombre, marca, modelo )
        `)
        .eq("cotizacion_id", Number(id))
        .order("id", { ascending: true });

      if (ed) throw ed;
      setDetalle(d || []);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo cargar la cotización para despacho.", "error");
    }
  }

  const items = useMemo(() => {
    return (detalle || []).map((r) => {
      const isProd = r.producto_id != null;
      const item = isProd ? r.productos : r.equipos;
      return {
        row_id: r.id,
        tipo: isProd ? "producto" : "equipo",
        item_id: isProd ? r.producto_id : r.equipo_id,
        nombre: item?.nombre || (isProd ? `Producto #${r.producto_id}` : `Equipo #${r.equipo_id}`),
        marca: item?.marca || "-",
        modelo: item?.modelo || "-",
        cantidad: safeNum(r.cantidad, 0),
        despachada: safeNum(r.cantidad_despachada, 0),
      };
    });
  }, [detalle]);

  const completo = useMemo(() => {
    return items.length > 0 && items.every((it) => it.despachada >= it.cantidad);
  }, [items]);

  async function updateDespachada(rowId, newVal) {
    const v = Math.max(0, safeNum(newVal, 0));
    setDetalle((prev) => prev.map((r) => (r.id === rowId ? { ...r, cantidad_despachada: v } : r)));

    const { error } = await supabase
      .from("detalle_cotizacion")
      .update({ cantidad_despachada: v })
      .eq("id", rowId);

    if (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar cantidad despachada.", "error");
      load();
    }
  }

  async function sumarScan() {
    const parsed = parseScan(scan);
    if (!parsed) {
      Swal.fire("Código inválido", 'Usa formato "P-12" o "E-5".', "warning");
      return;
    }

    // Encuentra línea
    const row = items.find((it) => it.tipo === parsed.tipo && it.item_id === parsed.item_id);
    if (!row) {
      Swal.fire("No coincide", "Ese código no está en esta cotización.", "info");
      return;
    }

    const next = row.despachada + 1;
    await updateDespachada(row.row_id, next);
    setScan("");
  }

  async function confirmarDespacho() {
    if (!cot) return;

    if (cot.estado !== "preparacion") {
      Swal.fire("No permitido", 'La cotización debe estar en "preparacion".', "warning");
      return;
    }

    if (!completo) {
      Swal.fire("Incompleto", "Aún faltan ítems por despachar.", "warning");
      return;
    }

    const ok = await Swal.fire({
      icon: "question",
      title: "Confirmar despacho",
      text: "Esto descontará el inventario y marcará la cotización como despachada.",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!ok.isConfirmed) return;

    try {
      setSaving(true);

      const { error } = await supabase.rpc(RPC_CONFIRM, { p_cotizacion_id: Number(id) });
      if (error) {
        console.error(error);
        Swal.fire("Error", error.message || "No se pudo confirmar el despacho.", "error");
        return;
      }

      Swal.fire("Listo", "Inventario descontado. Cotización despachada.", "success");
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (!cot) return <Wrap>Cargando...</Wrap>;

  return (
    <Wrap>
      <TopRow>
        <SecondaryBtn onClick={() => navigate("/admin/almacen")}>
          <ArrowLeft size={16} /> Volver
        </SecondaryBtn>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <SecondaryBtn onClick={load}>
            <RefreshCw size={16} /> Recargar
          </SecondaryBtn>

          <Btn onClick={confirmarDespacho} disabled={saving || !completo || cot.estado !== "preparacion"}>
            <CheckCircle2 size={16} /> Confirmar despacho
          </Btn>
        </div>
      </TopRow>

      <Card>
        <h2 style={{ margin: 0 }}>Despacho — Cotización #{cot.id}</h2>
        <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
          Estado: <strong>{cot.estado}</strong> · Inventario descontado:{" "}
          <strong>{cot.inventario_descontado ? "Sí" : "No"}</strong>
        </div>

        <ScanBox>
          <input
            value={scan}
            onChange={(e) => setScan(e.target.value)}
            placeholder='Escanear: "P-12" o "E-5"'
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sumarScan();
              }
            }}
          />
          <Btn type="button" onClick={sumarScan}>
            <ScanLine size={16} /> Agregar 1
          </Btn>

          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Completo: <strong>{completo ? "Sí" : "No"}</strong>
          </div>
        </ScanBox>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Ítems</h3>

        <Table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Item</th>
              <th>Solicitado</th>
              <th>Despachado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5}>Sin ítems.</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it.row_id}>
                  <td>{it.tipo}</td>
                  <td>
                    <div style={{ fontWeight: 900 }}>{it.nombre}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {it.marca} · {it.modelo} · {it.tipo === "producto" ? `P-${it.item_id}` : `E-${it.item_id}`}
                    </div>
                  </td>
                  <td>{it.cantidad}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={it.despachada}
                      onChange={(e) => updateDespachada(it.row_id, Number(e.target.value))}
                      style={{ width: 110, padding: "0.45rem", borderRadius: 8, border: "1px solid #ccc" }}
                    />
                  </td>
                  <td>
                    <SecondaryBtn
                      onClick={() => updateDespachada(it.row_id, Math.max(0, it.despachada - 1))}
                    >
                      -1
                    </SecondaryBtn>
                    <SecondaryBtn onClick={() => updateDespachada(it.row_id, it.despachada + 1)}>
                      +1
                    </SecondaryBtn>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </Wrap>
  );
}
