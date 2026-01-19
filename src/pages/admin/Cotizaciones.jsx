// src/pages/admin/Cotizaciones.jsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Wrapper = styled.div`
  padding: 2rem;
`;

const Form = styled.form`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  margin: 0.5rem 0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.accent2};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.7rem;
  margin: 0.5rem 0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.accent2};
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 1rem;

  &:hover {
    opacity: 0.9;
    transform: scale(1.03);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin: 1.5rem 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.8rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }

  th {
    background: ${({ theme }) => theme.cardBackground};
  }

  tr:hover {
    background: ${({ theme }) => theme.hover};
  }

  .delete-btn {
    cursor: pointer;
    color: #d9534f;
    transition: 0.2s;
  }

  .delete-btn:hover {
    color: #ff0000;
  }
`;

const EstadoBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;

  background-color: ${({ estado }) =>
    estado === "aceptada"
      ? "rgba(46, 204, 113, 0.18)"
      : estado === "rechazada"
      ? "rgba(231, 76, 60, 0.15)"
      : "rgba(241, 196, 15, 0.18)"};

  color: ${({ estado }) =>
    estado === "aceptada"
      ? "#27ae60"
      : estado === "rechazada"
      ? "#c0392b"
      : "#b7950b"};
`;

// ===================== HELPERS =====================
function formatearEstado(estado) {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function onlyDigits(v) {
  return String(v || "").replace(/\D/g, "");
}

function labelCliente(cli) {
  if (!cli) return "-";
  if (cli.tipo_cliente === "empresa") {
    return `${cli.nombre || "-"} (RNC: ${cli.empresa_rnc || "-"})`;
  }
  return `${cli.nombre || "-"} (Cédula: ${cli.cedula || "-"})`;
}

async function buscarClientePorDocumento({ tipo, documento }) {
  const doc = onlyDigits(documento);

  if (!doc) return null;

  if (tipo === "persona") {
    const { data, error } = await supabase
      .from("clientes")
      .select(
        "id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar"
      )
      .eq("cedula", doc)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  const { data, error } = await supabase
    .from("clientes")
    .select(
      "id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar"
    )
    .eq("empresa_rnc", doc)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export default function Cotizaciones() {
  const [searchParams] = useSearchParams();

  // URL: /admin/cotizaciones?preventa=1
  const preventaIdFromUrl = searchParams.get("preventa");

  // snapshot (opcional)
  const [cliente, setCliente] = useState("");
  const [descuento, setDescuento] = useState(0);

  // Catálogos
  const [productos, setProductos] = useState([]);
  const [equipos, setEquipos] = useState([]);

  // Buscar cliente por documento
  const [tipoCliente, setTipoCliente] = useState("persona"); // persona | empresa
  const [doc, setDoc] = useState(""); // cedula o rnc
  const [clienteSel, setClienteSel] = useState(null);
  const [clienteLoading, setClienteLoading] = useState(false);

  // Selector tipo + item
  const [tipoItem, setTipoItem] = useState("producto"); // "producto" | "equipo"
  const [itemSeleccionado, setItemSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);

  // Extra solo admin
  const [extraUnitario, setExtraUnitario] = useState(0);

  // Detalle
  const [detalle, setDetalle] = useState([]);

  // Historial
  const [cotizaciones, setCotizaciones] = useState([]);

  // Plan 50/50
  const [usaAnticipo, setUsaAnticipo] = useState(false);

  // Preventas
  const [preventas, setPreventas] = useState([]);
  const [preventaSeleccionada, setPreventaSeleccionada] = useState("");

  // Preventa cargada (para preload)
  const [preventaCargada, setPreventaCargada] = useState(null);
  const [loadingPreventa, setLoadingPreventa] = useState(false);

  // Filtros
  const [categoriaProducto, setCategoriaProducto] = useState("");
  const [marcaProducto, setMarcaProducto] = useState("");
  const [categoriaEquipo, setCategoriaEquipo] = useState("");
  const [marcaEquipo, setMarcaEquipo] = useState("");

  const navigate = useNavigate();

  // ========= Bloqueo precios en vendedor =========
  const role = localStorage.getItem("rol") || ""; // "admin" | "vendedor"
  const isVendedor = role === "vendedor";
  const allowPriceEdit = !isVendedor;

  useEffect(() => {
    fetchCatalogos();
    fetchCotizaciones();
    fetchPreventas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preload si viene por URL
  useEffect(() => {
    if (!preventaIdFromUrl) return;
    setPreventaSeleccionada(String(preventaIdFromUrl));
    preloadDesdePreventa(Number(preventaIdFromUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preventaIdFromUrl]);

  async function fetchCatalogos() {
    const [{ data: prods, error: errP }, { data: eqs, error: errE }] = await Promise.all([
      supabase.from("productos").select("*").order("id", { ascending: false }),
      supabase.from("equipos").select("*").order("id", { ascending: false }),
    ]);

    if (errP) console.error(errP);
    if (errE) console.error(errE);

    setProductos(prods || []);
    setEquipos(eqs || []);
  }

  async function fetchCotizaciones() {
    // Traer join con clientes para mostrar en historial
    const { data, error } = await supabase
      .from("cotizaciones")
      .select(
        `
        *,
        cliente_ref:clientes (
          id, tipo_cliente, nombre, cedula, empresa_rnc
        )
      `
      )
      .order("id", { ascending: false });

    if (error) console.error(error);
    setCotizaciones(data || []);
  }

  async function fetchPreventas() {
    // Traer cliente_id para poder auto-vincular
    const { data, error } = await supabase
      .from("preventas")
      .select("id, numero_caso, cliente, estado, creado_en, tipo_cliente, email, telefono, cedula, empresa_rnc, cliente_id")
      .order("id", { ascending: false });

    if (error) console.error(error);
    setPreventas(data || []);
  }

  async function handleBuscarCliente() {
    try {
      setClienteLoading(true);
      const cli = await buscarClientePorDocumento({ tipo: tipoCliente, documento: doc });
      if (!cli) {
        setClienteSel(null);
        Swal.fire(
          "No encontrado",
          "No existe un cliente con ese documento. Debe registrarse primero desde /cliente/servicio.",
          "info"
        );
        return;
      }
      setClienteSel(cli);
      setCliente(cli.nombre || "");
      // si el cliente encontrado es empresa/persona, sincroniza el tipo
      setTipoCliente(cli.tipo_cliente || tipoCliente);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo buscar el cliente.", "error");
    } finally {
      setClienteLoading(false);
    }
  }

  // ===================== PRELOAD DESDE PREVENTA =====================
  async function preloadDesdePreventa(preventaId) {
    if (!preventaId || Number.isNaN(preventaId)) return;

    setLoadingPreventa(true);

    try {
      // 1) Cabecera preventa (incluye cliente_id)
      const { data: p, error: errPrev } = await supabase
        .from("preventas")
        .select("*")
        .eq("id", preventaId)
        .single();

      if (errPrev) throw errPrev;
      if (!p) throw new Error("Preventa no encontrada");

      setPreventaCargada(p);

      // snapshot texto (fallback)
      if (!cliente) setCliente(p.cliente || "");

      // 1.1) Intentar cargar clienteSel desde cliente_id o documento
      try {
        // a) por cliente_id
        if (p.cliente_id) {
          const { data: cli, error: errCli } = await supabase
            .from("clientes")
            .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar")
            .eq("id", p.cliente_id)
            .maybeSingle();

          if (errCli) throw errCli;
          if (cli) {
            setClienteSel(cli);
            setTipoCliente(cli.tipo_cliente || p.tipo_cliente || "persona");
            setDoc(cli.tipo_cliente === "empresa" ? (cli.empresa_rnc || "") : (cli.cedula || ""));
            setCliente(cli.nombre || p.cliente || "");
          }
        } else {
          // b) por documento en preventa (si no hay cliente_id)
          if (p.tipo_cliente === "empresa" && p.empresa_rnc) {
            setTipoCliente("empresa");
            setDoc(p.empresa_rnc);
            const cli = await buscarClientePorDocumento({ tipo: "empresa", documento: p.empresa_rnc });
            if (cli) {
              setClienteSel(cli);
              setCliente(cli.nombre || p.cliente || "");
            }
          } else if (p.tipo_cliente === "persona" && p.cedula) {
            setTipoCliente("persona");
            setDoc(p.cedula);
            const cli = await buscarClientePorDocumento({ tipo: "persona", documento: p.cedula });
            if (cli) {
              setClienteSel(cli);
              setCliente(cli.nombre || p.cliente || "");
            }
          }
        }
      } catch (e) {
        console.warn("⚠️ No se pudo auto-vincular cliente desde preventa:", e);
      }

      // 2) Detalle preventa
      const { data: detPrev, error: errDet } = await supabase
        .from("detalle_preventa")
        .select("id, preventa_id, producto_id, equipo_id, cantidad")
        .eq("preventa_id", preventaId);

      if (errDet) throw errDet;

      const rows = detPrev || [];

      if (!rows.length) {
        setDetalle([]);
        if (p.estado === "enviada") {
          await supabase.from("preventas").update({ estado: "en_revision" }).eq("id", preventaId);
          fetchPreventas();
        }
        return;
      }

      // 3) Cargar datos de productos/equipos usados
      const productoIds = Array.from(new Set(rows.filter((r) => r.producto_id != null).map((r) => r.producto_id)));
      const equipoIds = Array.from(new Set(rows.filter((r) => r.equipo_id != null).map((r) => r.equipo_id)));

      const [{ data: prodsData, error: errProds }, { data: eqsData, error: errEqs }] = await Promise.all([
        productoIds.length
          ? supabase.from("productos").select("id, nombre, precio, modelo, marca, categoria, cantidad").in("id", productoIds)
          : Promise.resolve({ data: [], error: null }),
        equipoIds.length
          ? supabase.from("equipos").select("id, nombre, precio, modelo, marca, categoria, cantidad").in("id", equipoIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (errProds) throw errProds;
      if (errEqs) throw errEqs;

      const prodMap = new Map((prodsData || []).map((x) => [x.id, x]));
      const eqMap = new Map((eqsData || []).map((x) => [x.id, x]));

      // 4) Mapear a pre-cotización
      const precargado = rows.map((r) => {
        const isProd = r.producto_id != null;
        const item = isProd ? prodMap.get(r.producto_id) : eqMap.get(r.equipo_id);

        const cant = safeNumber(r.cantidad, 1);
        const precioBase = safeNumber(item?.precio, 0);
        const extra = allowPriceEdit ? 0 : 0;
        const precioUnitario = precioBase + extra;

        return {
          tipo: isProd ? "producto" : "equipo",
          item_id: isProd ? Number(r.producto_id) : Number(r.equipo_id),
          nombre: item?.nombre || "(Sin nombre)",
          modelo: item?.modelo || "",
          cantidad: cant,
          precioBase,
          extra,
          precioUnitario,
          _preventa_detalle_id: r.id,
        };
      });

      setDetalle(precargado);

      if (p.estado === "enviada") {
        await supabase.from("preventas").update({ estado: "en_revision" }).eq("id", preventaId);
        fetchPreventas();
      }
    } catch (e) {
      console.error("❌ preloadDesdePreventa:", e);
      Swal.fire("Error", "No se pudo precargar la preventa en la cotización.", "error");
    } finally {
      setLoadingPreventa(false);
    }
  }

  // ===================== filtros catálogo =====================
  const categoriasProductos = useMemo(
    () => Array.from(new Set((productos || []).map((p) => p.categoria || "Otros"))),
    [productos]
  );

  const marcasProductosFiltradas = useMemo(() => {
    return Array.from(
      new Set(
        (productos || [])
          .filter((p) => (categoriaProducto ? (p.categoria || "Otros") === categoriaProducto : true))
          .map((p) => p.marca || p.proveedor || "Sin marca")
      )
    );
  }, [productos, categoriaProducto]);

  const productosFiltrados = useMemo(() => {
    return (productos || []).filter((p) => {
      const cat = p.categoria || "Otros";
      const marca = p.marca || p.proveedor || "Sin marca";
      if (categoriaProducto && cat !== categoriaProducto) return false;
      if (marcaProducto && marca !== marcaProducto) return false;
      return true;
    });
  }, [productos, categoriaProducto, marcaProducto]);

  const categoriasEquipos = useMemo(
    () => Array.from(new Set((equipos || []).map((e) => e.categoria || "Otros"))),
    [equipos]
  );

  const marcasEquiposFiltradas = useMemo(() => {
    return Array.from(
      new Set(
        (equipos || [])
          .filter((e) => (categoriaEquipo ? (e.categoria || "Otros") === categoriaEquipo : true))
          .map((e) => e.marca || e.proveedor || "Sin marca")
      )
    );
  }, [equipos, categoriaEquipo]);

  const equiposFiltrados = useMemo(() => {
    return (equipos || []).filter((e) => {
      const cat = e.categoria || "Otros";
      const marca = e.marca || e.proveedor || "Sin marca";
      if (categoriaEquipo && cat !== categoriaEquipo) return false;
      if (marcaEquipo && marca !== marcaEquipo) return false;
      return true;
    });
  }, [equipos, categoriaEquipo, marcaEquipo]);

  function getItemByTipoYId(tipo, id) {
    if (tipo === "producto") return productos.find((p) => p.id === Number(id)) || null;
    return equipos.find((e) => e.id === Number(id)) || null;
  }

  // ===================== detalle =====================
  function agregarItem() {
    if (!itemSeleccionado) return;

    const item = getItemByTipoYId(tipoItem, itemSeleccionado);
    if (!item) return;

    const cant = safeNumber(cantidad, 1);
    if (!cant || cant <= 0) {
      Swal.fire("Cantidad inválida", "Debe ser mayor que cero.", "warning");
      return;
    }

    const stock = item.cantidad == null ? null : safeNumber(item.cantidad, 0);
    if (stock != null && cant > stock) {
      Swal.fire("Stock insuficiente", `Solo tienes ${stock} unidades disponibles de "${item.nombre}".`, "warning");
      return;
    }

    const precioBase = safeNumber(item.precio, 0);
    const extra = allowPriceEdit ? safeNumber(extraUnitario, 0) : 0;
    const precioUnitario = precioBase + extra;

    if (precioUnitario <= 0) {
      Swal.fire("Precio inválido", "El precio unitario debe ser mayor que cero.", "warning");
      return;
    }

    setDetalle((prev) => [
      ...prev,
      {
        tipo: tipoItem,
        item_id: Number(item.id),
        nombre: item.nombre,
        modelo: item.modelo || "",
        cantidad: cant,
        precioBase,
        extra,
        precioUnitario,
      },
    ]);

    setExtraUnitario(0);
    setItemSeleccionado("");
    setCantidad(1);
  }

  function eliminarItem(index) {
    setDetalle((prev) => prev.filter((_, i) => i !== index));
  }

  function calcularSubtotalDetalle() {
    return detalle.reduce((acc, it) => {
      const cant = safeNumber(it.cantidad, 0);
      const unit = safeNumber(it.precioUnitario, 0);
      return acc + unit * cant;
    }, 0);
  }

  function calcularTotalConDescuento() {
    const base = calcularSubtotalDetalle();
    const desc = safeNumber(descuento, 0);
    const total = base - (base * desc) / 100;
    return Number.isFinite(total) ? total : 0;
  }

  // ===================== GUARDAR =====================
  async function guardarCotizacion(e) {
    e.preventDefault();

    // Ahora lo obligatorio es clienteSel.id
    if (!clienteSel?.id) {
      Swal.fire("Falta cliente", "Busca y selecciona un cliente por Cédula/RNC antes de guardar.", "warning");
      return;
    }

    if (detalle.length === 0) {
      Swal.fire("Sin productos/equipos", "Agrega al menos 1 item.", "warning");
      return;
    }

    // vendedor: fuerza extra=0
    const detalleSeguro = detalle.map((it) => {
      const precioBase = safeNumber(it.precioBase, 0);
      const cant = safeNumber(it.cantidad, 1);
      const extra = allowPriceEdit ? safeNumber(it.extra, 0) : 0;
      const unit = precioBase + extra;
      return { ...it, extra, precioUnitario: unit, cantidad: cant };
    });

    const total = (() => {
      const base = detalleSeguro.reduce(
        (acc, it) => acc + safeNumber(it.precioUnitario, 0) * safeNumber(it.cantidad, 0),
        0
      );
      const desc = safeNumber(descuento, 0);
      const t = base - (base * desc) / 100;
      return Number.isFinite(t) ? t : 0;
    })();

    if (total <= 0) {
      Swal.fire("Total inválido", "El total debe ser mayor que cero.", "error");
      return;
    }

    let montoAnticipo = 0;
    let montoPendiente = 0;

    if (usaAnticipo) {
      montoAnticipo = Number((total * 0.5).toFixed(2));
      montoPendiente = Number((total - montoAnticipo).toFixed(2));
    }

    // Insert cotización (YA con cliente_id)
    const payloadCot = {
      cliente_id: clienteSel.id,
      cliente: clienteSel.nombre || cliente || null, // snapshot opcional
      total,
      descuento: safeNumber(descuento, 0),
      fecha: new Date().toISOString(),
      estado: "pendiente",
      usa_anticipo: usaAnticipo,
      monto_anticipo: montoAnticipo,
      monto_pendiente: montoPendiente,
      preventa_id: preventaSeleccionada ? Number(preventaSeleccionada) : null,
      inventario_descontado: false,
    };

    const { data: cot, error } = await supabase.from("cotizaciones").insert([payloadCot]).select().single();

    if (error || !cot) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar la cotización", "error");
      return;
    }

    // Insert detalle (productos + equipos)
    for (const it of detalleSeguro) {
      const cant = safeNumber(it.cantidad, 0);
      const unit = safeNumber(it.precioUnitario, 0);
      const baseSnap = safeNumber(it.precioBase, 0);
      const extraSnap = safeNumber(it.extra, 0);
      const subtotal = unit * cant;

      const payload = {
        cotizacion_id: cot.id,
        cantidad: cant,
        subtotal,
        precio_base_snapshot: baseSnap,
        extra_unitario: extraSnap,
        precio_unitario: unit,
        producto_id: it.tipo === "producto" ? it.item_id : null,
        equipo_id: it.tipo === "equipo" ? it.item_id : null,
      };

      const { error: errDet } = await supabase.from("detalle_cotizacion").insert([payload]);
      if (errDet) {
        console.error(errDet);
        Swal.fire("Error", "No se pudo guardar el detalle de la cotización.", "error");
        return;
      }
    }

    // Si está ligada a preventa, marcarla cotizada y guardar cliente_id ahí también (por si estaba null)
    if (preventaSeleccionada) {
      await supabase
        .from("preventas")
        .update({ estado: "cotizada", cliente_id: clienteSel.id })
        .eq("id", Number(preventaSeleccionada));
    }

    Swal.fire("Éxito", "Cotización guardada correctamente", "success");

    // Reset
    setCliente("");
    setDoc("");
    setClienteSel(null);
    setDescuento(0);
    setDetalle([]);
    setTipoItem("producto");
    setItemSeleccionado("");
    setCantidad(1);
    setExtraUnitario(0);
    setUsaAnticipo(false);
    setCategoriaProducto("");
    setMarcaProducto("");
    setCategoriaEquipo("");
    setMarcaEquipo("");
    setPreventaSeleccionada("");
    setPreventaCargada(null);

    fetchCotizaciones();
    fetchPreventas();
  }

  async function eliminarCotizacion(id) {
    const result = await Swal.fire({
      title: "¿Eliminar cotización?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    await supabase.from("detalle_cotizacion").delete().eq("cotizacion_id", id);
    await supabase.from("cotizaciones").delete().eq("id", id);

    setCotizaciones((prev) => prev.filter((c) => c.id !== id));
    Swal.fire("Eliminada", "La cotización ha sido eliminada.", "success");
  }

  const totalActual = calcularTotalConDescuento();
  const anticipoActual = usaAnticipo ? Number((totalActual * 0.5).toFixed(2)) : 0;
  const pendienteActual = usaAnticipo ? Number((totalActual - anticipoActual).toFixed(2)) : 0;

  return (
    <Wrapper>
      <Form onSubmit={guardarCotizacion}>
        <h2 style={{ color: "#00bcd4" }}>Nueva Cotización</h2>

        {preventaIdFromUrl && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.8rem 1rem",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(0,188,212,0.04)",
              fontSize: "0.92rem",
            }}
          >
            <strong>Preload activo</strong>: esta cotización se está precargando desde la preventa{" "}
            <strong>#{preventaIdFromUrl}</strong>.{" "}
            {loadingPreventa ? <span>Cargando items...</span> : <span>Items precargados.</span>}
          </div>
        )}

        <label>Cliente (buscar por documento)</label>

        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Select
              value={tipoCliente}
              onChange={(e) => {
                setTipoCliente(e.target.value);
                setClienteSel(null);
                setDoc("");
              }}
              style={{ maxWidth: 260 }}
            >
              <option value="persona">Persona (Cédula)</option>
              <option value="empresa">Empresa (RNC)</option>
            </Select>

            <Input
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              placeholder={tipoCliente === "persona" ? "Cédula" : "RNC"}
              style={{ minWidth: 220, flex: 1 }}
            />

            <Button type="button" onClick={handleBuscarCliente} disabled={clienteLoading || !doc.trim()}>
              {clienteLoading ? "Buscando..." : "Buscar cliente"}
            </Button>
          </div>

          <div>
            <strong>Seleccionado:</strong> {clienteSel ? labelCliente(clienteSel) : "—"}
            {clienteSel && (
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                Recurrente: <strong>{clienteSel.es_recurrente ? "Sí" : "No"}</strong> · Puede fiar:{" "}
                <strong>{clienteSel.puede_fiar ? "Sí" : "No"}</strong>
              </div>
            )}
          </div>
        </div>

        <label>Vincular preventa</label>
        <Select
          value={preventaSeleccionada}
          onChange={(e) => {
            const value = e.target.value;
            setPreventaSeleccionada(value);

            if (value) preloadDesdePreventa(Number(value));
            else setPreventaCargada(null);
          }}
        >
          <option value="">Sin preventa</option>
          {preventas.map((p) => (
            <option key={p.id} value={p.id}>
              {`#${p.id} — ${p.numero_caso || "SIN CASO"} — ${p.cliente || "-"} — ${p.estado || "-"}`}
            </option>
          ))}
        </Select>

        <Divider />

        <label>Tipo</label>
        <Select
          value={tipoItem}
          onChange={(e) => {
            setTipoItem(e.target.value);
            setItemSeleccionado("");
            setCantidad(1);
            setExtraUnitario(0);
          }}
        >
          <option value="producto">Producto</option>
          <option value="equipo">Equipo</option>
        </Select>

        {tipoItem === "producto" ? (
          <>
            <label>Categoría (productos)</label>
            <Select
              value={categoriaProducto}
              onChange={(e) => {
                setCategoriaProducto(e.target.value);
                setMarcaProducto("");
                setItemSeleccionado("");
              }}
            >
              <option value="">Todas</option>
              {categoriasProductos.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <label>Marca / Proveedor (productos)</label>
            <Select
              value={marcaProducto}
              onChange={(e) => {
                setMarcaProducto(e.target.value);
                setItemSeleccionado("");
              }}
            >
              <option value="">Todas</option>
              {marcasProductosFiltradas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>

            <label>Producto</label>
            <Select value={itemSeleccionado} onChange={(e) => setItemSeleccionado(e.target.value)}>
              <option value="">Seleccione un producto</option>
              {productosFiltrados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                  {p.modelo ? ` - ${p.modelo}` : ""} — RD${safeNumber(p.precio, 0)}
                </option>
              ))}
            </Select>
          </>
        ) : (
          <>
            <label>Categoría (equipos)</label>
            <Select
              value={categoriaEquipo}
              onChange={(e) => {
                setCategoriaEquipo(e.target.value);
                setMarcaEquipo("");
                setItemSeleccionado("");
              }}
            >
              <option value="">Todas</option>
              {categoriasEquipos.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <label>Marca / Proveedor (equipos)</label>
            <Select
              value={marcaEquipo}
              onChange={(e) => {
                setMarcaEquipo(e.target.value);
                setItemSeleccionado("");
              }}
            >
              <option value="">Todas</option>
              {marcasEquiposFiltradas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>

            <label>Equipo</label>
            <Select value={itemSeleccionado} onChange={(e) => setItemSeleccionado(e.target.value)}>
              <option value="">Seleccione un equipo</option>
              {equiposFiltrados.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nombre}
                  {eq.modelo ? ` - ${eq.modelo}` : ""} — RD${safeNumber(eq.precio, 0)}
                </option>
              ))}
            </Select>
          </>
        )}

        <label>Cantidad</label>
        <Input
          type="number"
          value={cantidad}
          min="1"
          onChange={(e) => setCantidad(e.target.value === "" ? 1 : Number(e.target.value))}
        />

        <label>Monto extra por unidad</label>
        <Input
          type="number"
          value={extraUnitario === 0 ? "" : extraUnitario}
          onChange={(e) => setExtraUnitario(e.target.value === "" ? 0 : Number(e.target.value))}
          placeholder={allowPriceEdit ? "Ej: 1000" : "Bloqueado para vendedor (precios fijos)"}
          disabled={!allowPriceEdit}
        />

        <Button type="button" onClick={agregarItem} disabled={loadingPreventa}>
          Agregar item
        </Button>

        {detalle.length > 0 && (
          <>
            <Divider />
            <Table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Item</th>
                  <th>Cant.</th>
                  <th>Precio base</th>
                  <th>Extra / unidad</th>
                  <th>Precio unitario</th>
                  <th>Subtotal</th>
                  <th>Quitar</th>
                </tr>
              </thead>
              <tbody>
                {detalle.map((d, i) => {
                  const subtotal = safeNumber(d.precioUnitario, 0) * safeNumber(d.cantidad, 0);
                  return (
                    <tr key={i}>
                      <td>{d.tipo}</td>
                      <td>
                        {d.nombre}
                        {d.modelo ? ` - ${d.modelo}` : ""}
                      </td>
                      <td>{safeNumber(d.cantidad, 0)}</td>
                      <td>RD${safeNumber(d.precioBase, 0).toFixed(2)}</td>
                      <td>RD${safeNumber(d.extra, 0).toFixed(2)}</td>
                      <td>RD${safeNumber(d.precioUnitario, 0).toFixed(2)}</td>
                      <td>RD${subtotal.toFixed(2)}</td>
                      <td>
                        <Trash2 size={20} className="delete-btn" onClick={() => eliminarItem(i)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </>
        )}

        <Divider />

        <label>Descuento (%)</label>
        <Input
          type="number"
          value={descuento}
          onChange={(e) => setDescuento(e.target.value === "" ? 0 : Number(e.target.value))}
        />

        <div
          style={{
            marginTop: "1rem",
            padding: "0.8rem 1rem",
            borderRadius: "8px",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(0,188,212,0.03)",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={usaAnticipo} onChange={(e) => setUsaAnticipo(e.target.checked)} />
            <span>Permitir pago 50% inicial / 50% restante</span>
          </label>

          {usaAnticipo && (
            <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
              <div>
                Total estimado: <strong>RD${totalActual.toFixed(2)}</strong>
              </div>
              <div>
                Anticipo (50%): <strong>RD${anticipoActual.toFixed(2)}</strong>
              </div>
              <div>
                Pendiente (50%): <strong>RD${pendienteActual.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        <Button type="submit" disabled={loadingPreventa}>
          Guardar cotización
        </Button>
      </Form>

      <h3>Historial de cotizaciones</h3>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Preventa</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Anticipo</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map((c) => {
            const cli = c.cliente_ref || null;
            const clienteLabel = cli ? labelCliente(cli) : (c.cliente || "-");

            return (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{clienteLabel}</td>
                <td>{c.preventa_id ? `#${c.preventa_id}` : "-"}</td>
                <td>
                  RD$
                  {safeNumber(c.total, 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <EstadoBadge estado={c.estado || "pendiente"}>● {formatearEstado(c.estado)}</EstadoBadge>
                </td>
                <td>
                  {c.usa_anticipo
                    ? `Inicial: RD$${safeNumber(c.monto_anticipo, 0)} / Restante: RD$${safeNumber(c.monto_pendiente, 0)}`
                    : "No"}
                </td>
                <td>{c.fecha ? new Date(c.fecha).toLocaleDateString() : "-"}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <Eye
                    size={18}
                    style={{ cursor: "pointer", color: "#00bcd4" }}
                    onClick={() => navigate(`/admin/cotizaciones/${c.id}`)}
                  />
                  <Trash2 size={18} className="delete-btn" onClick={() => eliminarCotizacion(c.id)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Wrapper>
  );
}
