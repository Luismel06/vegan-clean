// src/pages/almacen/AlmacenDespacho.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { CheckCircle2, ArrowLeft, ScanLine, RefreshCw, Lock } from "lucide-react";

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

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const Pill = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  opacity: 0.9;
`;

function safeNum(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

// barcode esperado: 2 letras + 2 números (AA12)
function normalizeBarcode(code) {
  return String(code || "").trim().toUpperCase();
}

function isBarcode4(code) {
  return /^[A-Z]{2}\d{2}$/.test(code);
}

export default function AlmacenDespacho() {
  const { id } = useParams(); // /almacen/cotizacion/:id
  const navigate = useNavigate();
  const scanRef = useRef(null);

  const [cot, setCot] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [scan, setScan] = useState("");
  const [saving, setSaving] = useState(false);

  const RPC_CONFIRM = "confirmar_despacho_y_descontar";

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // enfocar input solo si NO está bloqueado
    if (cot?.id && cot?.estado !== "despachada") {
      setTimeout(() => scanRef.current?.focus(), 200);
    }
  }, [cot?.id, cot?.estado]);

  async function load() {
    try {
      const cotId = Number(id);
      if (!Number.isFinite(cotId)) {
        Swal.fire("Error", "ID de cotización inválido.", "error");
        navigate("/almacen/cotizaciones", { replace: true });
        return;
      }

      const { data: c, error: ec } = await supabase
        .from("cotizaciones")
        .select("id, estado, inventario_descontado, cliente, cliente_id, preventa_id, fecha")
        .eq("id", cotId)
        .single();

      if (ec) throw ec;
      setCot(c);

      const { data: d, error: ed } = await supabase
        .from("detalle_cotizacion")
        .select(`
          id, cotizacion_id, producto_id, equipo_id, cantidad, cantidad_despachada,
          productos:producto_id ( id, nombre, marca, modelo, codigo_barra ),
          equipos:equipo_id ( id, nombre, marca, modelo, codigo_barra )
        `)
        .eq("cotizacion_id", cotId)
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
        codigo_barra: normalizeBarcode(item?.codigo_barra || ""),
        cantidad: safeNum(r.cantidad, 0),
        despachada: safeNum(r.cantidad_despachada, 0),
      };
    });
  }, [detalle]);

  const completo = useMemo(() => {
    return items.length > 0 && items.every((it) => it.despachada >= it.cantidad);
  }, [items]);

  const readOnly = cot?.estado === "despachada";
  const canEdit = !readOnly && cot?.estado === "preparacion";

  async function updateDespachada(rowId, newVal) {
    if (!canEdit) return; // seguridad extra

    const v = Math.max(0, safeNum(newVal, 0));

    setDetalle((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, cantidad_despachada: v } : r))
    );

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
    if (!canEdit) return;

    const code = normalizeBarcode(scan);
    if (!code) return;

    if (!isBarcode4(code)) {
      Swal.fire("Código inválido", "El código debe ser 2 letras y 2 números. Ej: AA12", "warning");
      setScan("");
      scanRef.current?.focus();
      return;
    }

    const row = items.find((it) => it.codigo_barra === code);

    if (!row) {
      Swal.fire("No coincide", "Ese código no pertenece a esta cotización.", "info");
      setScan("");
      scanRef.current?.focus();
      return;
    }

    if (row.despachada >= row.cantidad) {
      Swal.fire("Completo", `Ya despachaste el máximo de "${row.nombre}".`, "info");
      setScan("");
      scanRef.current?.focus();
      return;
    }

    await updateDespachada(row.row_id, row.despachada + 1);
    setScan("");
    scanRef.current?.focus();
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
        <SecondaryBtn onClick={() => navigate("/almacen/cotizaciones")}>
          <ArrowLeft size={16} /> Volver
        </SecondaryBtn>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <SecondaryBtn onClick={load}>
            <RefreshCw size={16} /> Recargar
          </SecondaryBtn>

          <Btn
            onClick={confirmarDespacho}
            disabled={saving || !completo || cot.estado !== "preparacion"}
            title={readOnly ? "Despachada: no se puede modificar" : ""}
          >
            <CheckCircle2 size={16} /> Confirmar despacho
          </Btn>
        </div>
      </TopRow>

      <Card>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Despacho — Cotización #{cot.id}</h2>
            <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
              Estado: <strong>{cot.estado}</strong> · Inventario descontado:{" "}
              <strong>{cot.inventario_descontado ? "Sí" : "No"}</strong>
            </div>
          </div>

          {readOnly ? (
            <Pill>
              <Lock size={14} /> Modo solo lectura
            </Pill>
          ) : null}
        </div>

        <ScanBox>
          <input
            ref={scanRef}
            value={scan}
            onChange={(e) => setScan(e.target.value)}
            placeholder='Escanear código de barra (Ej: AA12)'
            disabled={!canEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sumarScan();
              }
            }}
          />
          <Btn type="button" onClick={sumarScan} disabled={!canEdit}>
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
              <th>Código</th>
              <th>Solicitado</th>
              <th>Despachado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6}>Sin ítems.</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it.row_id}>
                  <td>{it.tipo}</td>
                  <td>
                    <div style={{ fontWeight: 900 }}>{it.nombre}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {it.marca} · {it.modelo}
                    </div>
                  </td>
                  <td style={{ fontWeight: 900 }}>{it.codigo_barra || "-"}</td>
                  <td>{it.cantidad}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={it.despachada}
                      disabled={!canEdit}
                      onChange={(e) => updateDespachada(it.row_id, Number(e.target.value))}
                      style={{
                        width: 110,
                        padding: "0.45rem",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        opacity: !canEdit ? 0.7 : 1,
                        cursor: !canEdit ? "not-allowed" : "text",
                        color: "#038a0ccc",
                      }}
                    />
                  </td>
                  <td>
                    <SecondaryBtn
                      disabled={!canEdit}
                      onClick={() => updateDespachada(it.row_id, Math.max(0, it.despachada - 1))}
                    >
                      -1
                    </SecondaryBtn>
                    <SecondaryBtn
                      disabled={!canEdit}
                      onClick={() => updateDespachada(it.row_id, it.despachada + 1)}
                    >
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
