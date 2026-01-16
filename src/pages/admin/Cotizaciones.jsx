import { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.7rem;
  margin: 0.5rem 0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
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

function formatearEstado(estado) {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export default function Cotizaciones() {
  const [cliente, setCliente] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [servicio, setServicio] = useState("");
  const [servicios, setServicios] = useState([]);

  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [detalle, setDetalle] = useState([]);

  const [cotizaciones, setCotizaciones] = useState([]);
  const [nombreServicio, setNombreServicio] = useState("");
  const [precioServicio, setPrecioServicio] = useState(0);
  const [usaAnticipo, setUsaAnticipo] = useState(false);
  const [ajustePrecio, setAjustePrecio] = useState(0);

  // 🔹 Solicitudes (tickets)
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState("");

  // Para filtros de productos (categoría / marca)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchServicios();
    fetchProductos();
    fetchCotizaciones();
    fetchSolicitudes();
  }, []);

  async function fetchServicios() {
    const { data, error } = await supabase.from("servicios").select("*");
    if (!error) setServicios(data || []);
  }

  async function fetchProductos() {
    const { data, error } = await supabase.from("productos").select("*");
    if (!error) setProductos(data || []);
  }

  async function fetchCotizaciones() {
    const { data, error } = await supabase
      .from("cotizaciones")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setCotizaciones(data || []);
  }

  async function fetchSolicitudes() {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("id, cliente, servicio_id, estado, fecha, numero_caso");
    if (!error) setSolicitudes(data || []);
  }

  // ========= CATEGORÍAS / MARCAS PARA PRODUCTOS =========
  const categorias = Array.from(
    new Set((productos || []).map((p) => p.categoria || "Otros"))
  );

  const marcasFiltradas = Array.from(
    new Set(
      (productos || [])
        .filter((p) =>
          categoriaSeleccionada
            ? (p.categoria || "Otros") === categoriaSeleccionada
            : true
        )
        .map((p) => p.marca || p.proveedor || "Sin marca")
    )
  );

  const productosFiltrados = (productos || []).filter((p) => {
    const cat = p.categoria || "Otros";
    const marca = p.marca || p.proveedor || "Sin marca";

    if (categoriaSeleccionada && cat !== categoriaSeleccionada) return false;
    if (marcaSeleccionada && marca !== marcaSeleccionada) return false;
    return true;
  });

  // ========= AGREGAR PRODUCTO A DETALLE =========
  function agregarProducto() {
    if (!productoSeleccionado) return;

    const prod = productos.find(
      (p) => p.id === parseInt(productoSeleccionado)
    );
    if (!prod) return;

    const cant = Number(cantidad);

    if (!cant || cant <= 0) {
      Swal.fire(
        "Cantidad inválida",
        "La cantidad debe ser mayor que cero.",
        "warning"
      );
      return;
    }

    if (prod.cantidad != null && cant > Number(prod.cantidad)) {
      Swal.fire(
        "Stock insuficiente",
        `Solo tienes ${prod.cantidad} unidades disponibles de "${prod.nombre}".`,
        "warning"
      );
      return;
    }

    const precioBase = Number(prod.precio) || 0;
    const extra = Number(ajustePrecio) || 0;
    const precioFinalUnitario = precioBase + extra;

    if (precioFinalUnitario <= 0) {
      Swal.fire(
        "Precio inválido",
        "El precio final por unidad debe ser mayor que cero.",
        "warning"
      );
      return;
    }

    setDetalle([
      ...detalle,
      {
        id: prod.id,
        nombre: prod.nombre,
        cantidad: cant,
        precioBase,
        extra, // monto extra por unidad
      },
    ]);

    setAjustePrecio(0);
  }

  function eliminarProducto(index) {
    const nuevo = [...detalle];
    nuevo.splice(index, 1);
    setDetalle(nuevo);
  }

  function calcularTotal() {
    const subtotalProductos = detalle.reduce((acc, item) => {
      const base = Number(item.precioBase) || 0;
      const extra = Number(item.extra) || 0;
      const cant = Number(item.cantidad) || 0;
      const unit = base + extra;
      if (unit <= 0 || cant <= 0) return acc;
      return acc + unit * cant;
    }, 0);

    const servicioNum = Number(precioServicio) || 0;
    const baseTotal = subtotalProductos + servicioNum;

    const desc = Number(descuento) || 0;
    const total = baseTotal - (baseTotal * desc) / 100;

    return isNaN(total) ? 0 : total;
  }

  async function guardarCotizacion(e) {
    e.preventDefault();

    if (!cliente || !servicio) {
      Swal.fire("Faltan datos", "Debes llenar cliente y servicio", "warning");
      return;
    }

    if (detalle.length === 0 && !precioServicio) {
      Swal.fire(
        "Sin datos",
        "Debes agregar al menos un producto o un precio de servicio",
        "warning"
      );
      return;
    }

    const total = calcularTotal();

    if (total <= 0) {
      Swal.fire(
        "Total inválido",
        "El total calculado debe ser mayor que cero",
        "error"
      );
      return;
    }

    let montoAnticipo = 0;
    let montoPendiente = 0;

    if (usaAnticipo) {
      montoAnticipo = Number((total * 0.5).toFixed(2));
      montoPendiente = Number((total - montoAnticipo).toFixed(2));
    }

    const { data: cot, error } = await supabase
      .from("cotizaciones")
      .insert([
        {
          cliente,
          total,
          descuento: Number(descuento) || 0,
          servicio,
          nombre_servicio: nombreServicio || null,
          precio_servicio: Number(precioServicio) || 0,
          fecha: new Date().toISOString(),
          estado: "pendiente",
          usa_anticipo: usaAnticipo,
          monto_anticipo: montoAnticipo,
          monto_pendiente: montoPendiente,
          solicitud_id: solicitudSeleccionada
            ? Number(solicitudSeleccionada)
            : null, // 🔗 vínculo con la solicitud/ticket
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar la cotización", "error");
      return;
    }

    // Guardar detalle de productos
    for (const d of detalle) {
      const base = Number(d.precioBase) || 0;
      const extra = Number(d.extra) || 0;
      const cant = Number(d.cantidad) || 0;
      const unit = base + extra;

      await supabase.from("detalle_cotizacion").insert([
        {
          cotizacion_id: cot.id,
          producto_id: d.id,
          cantidad: cant,
          subtotal: unit * cant,
        },
      ]);
    }

    Swal.fire("Éxito", "Cotización guardada correctamente", "success");

    setCliente("");
    setServicio("");
    setDetalle([]);
    setProductoSeleccionado("");
    setCantidad(1);
    setDescuento(0);
    setNombreServicio("");
    setPrecioServicio(0);
    setUsaAnticipo(false);
    setAjustePrecio(0);
    setCategoriaSeleccionada("");
    setMarcaSeleccionada("");
    setSolicitudSeleccionada("");
    fetchCotizaciones();
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

  const totalActual = calcularTotal();
  const anticipoActual = usaAnticipo
    ? Number((totalActual * 0.5).toFixed(2))
    : 0;
  const pendienteActual = usaAnticipo
    ? Number((totalActual - anticipoActual).toFixed(2))
    : 0;

  // Helper para mostrar nombre de servicio desde servicio_id de la solicitud
  function getNombreServicioDesdeSolicitud(solicitud) {
    if (!solicitud?.servicio_id) return "";
    const s = servicios.find((svc) => svc.id === solicitud.servicio_id);
    return s?.nombre || "";
  }

  return (
    <Wrapper>
      <Form onSubmit={guardarCotizacion}>
        <h2 style={{ color: "#00bcd4" }}>Nueva Cotización</h2>

        <label>Cliente</label>
        <Input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nombre del cliente"
        />

        <label>Servicio</label>
        <Select
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
        >
          <option value="">Seleccione un servicio</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.nombre}>
              {s.nombre}
            </option>
          ))}
        </Select>

        {/* 🔗 VINCULAR SOLICITUD / TICKET */}
        <label>Vincular solicitud / ticket</label>
        <Select
          value={solicitudSeleccionada}
          onChange={(e) => {
            const value = e.target.value;
            setSolicitudSeleccionada(value);

            if (!value) return;

            const solicitud = solicitudes.find(
              (sol) => sol.id === Number(value)
            );
            if (!solicitud) return;

            // Autorelleno de cliente
            if (solicitud.cliente && !cliente) {
              setCliente(solicitud.cliente);
            }

            // Autorelleno de servicio desde servicio_id
            const nombreServ = getNombreServicioDesdeSolicitud(solicitud);
            if (nombreServ && !servicio) {
              setServicio(nombreServ);
            }
          }}
        >
          <option value="">Sin solicitud ligada</option>
          {solicitudes.map((sol) => (
            <option key={sol.id} value={sol.id}>
              {`#${sol.id} - ${
                sol.numero_caso || "SIN CASO"
              } - ${sol.cliente || "Sin nombre"} - ${
                getNombreServicioDesdeSolicitud(sol) || "Servicio"
              } - ${sol.estado || "Agendado"}`}
            </option>
          ))}
        </Select>

        {/* FILTROS Y PRODUCTO */}
        <label>Categoría</label>
        <Select
          value={categoriaSeleccionada}
          onChange={(e) => {
            setCategoriaSeleccionada(e.target.value);
            setMarcaSeleccionada("");
            setProductoSeleccionado("");
          }}
        >
          <option value="">Todas</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <label>Marca</label>
        <Select
          value={marcaSeleccionada}
          onChange={(e) => {
            setMarcaSeleccionada(e.target.value);
            setProductoSeleccionado("");
          }}
          disabled={!categoriaSeleccionada && categorias.length > 0}
        >
          <option value="">Todas</option>
          {marcasFiltradas.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>

        <label>Producto</label>
        <Select
          value={productoSeleccionado}
          onChange={(e) => setProductoSeleccionado(e.target.value)}
        >
          <option value="">Seleccione un producto</option>
          {productosFiltrados.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
              {p.modelo ? ` - ${p.modelo}` : ""} — RD${p.precio}
            </option>
          ))}
        </Select>

        <label>Cantidad</label>
        <Input
          type="number"
          value={isNaN(cantidad) ? "" : cantidad}
          min="1"
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") {
              setCantidad("");
            } else {
              const num = parseInt(v);
              if (num < 0) {
                setCantidad(1);
              } else {
                setCantidad(isNaN(num) ? 1 : num);
              }
            }
          }}
        />

        <label>Monto extra por unidad (opcional)</label>
        <Input
          type="number"
          value={ajustePrecio === 0 ? "" : ajustePrecio}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") {
              setAjustePrecio(0);
            } else {
              const num = parseFloat(v);
              setAjustePrecio(isNaN(num) ? 0 : num);
            }
          }}
          placeholder="Ej: 1000 para subir el precio por unidad"
        />

        <Button type="button" onClick={agregarProducto}>
          Agregar producto
        </Button>

        {detalle.length > 0 && (
          <Table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio base</th>
                <th>Extra / unidad</th>
                <th>Subtotal</th>
                <th>Quitar</th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, i) => {
                const base = Number(d.precioBase) || 0;
                const extra = Number(d.extra) || 0;
                const cant = Number(d.cantidad) || 0;
                const subtotal = (base + extra) * cant;

                return (
                  <tr key={i}>
                    <td>{d.nombre}</td>
                    <td>{cant}</td>
                    <td>RD${base.toFixed(2)}</td>
                    <td>RD${extra.toFixed(2)}</td>
                    <td>RD${subtotal.toFixed(2)}</td>
                    <td>
                      <Trash2
                        size={20}
                        className="delete-btn"
                        onClick={() => eliminarProducto(i)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}

        <Divider />

        <label>Descripción del servicio (instalación)</label>
        <Input
          placeholder="Ej: Instalación completa de cámaras"
          value={nombreServicio}
          onChange={(e) => setNombreServicio(e.target.value)}
        />

        <label>Precio del servicio</label>
        <Input
          type="number"
          value={precioServicio === 0 ? "" : precioServicio}
          onChange={(e) =>
            setPrecioServicio(
              e.target.value === "" ? 0 : Number(e.target.value)
            )
          }
        />

        <Divider />

        <label>Descuento (%)</label>
        <Input
          type="number"
          value={isNaN(descuento) ? "" : descuento}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") {
              setDescuento(0);
            } else {
              const num = parseFloat(v);
              setDescuento(isNaN(num) ? 0 : num);
            }
          }}
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
            <input
              type="checkbox"
              checked={usaAnticipo}
              onChange={(e) => setUsaAnticipo(e.target.checked)}
            />
            <span>Permitir pago 50% inicial / 50% restante</span>
          </label>

          {usaAnticipo && (
            <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
              <div>
                Total estimado:{" "}
                <strong>RD${totalActual.toFixed(2)}</strong>
              </div>
              <div>
                Anticipo (50%):{" "}
                <strong>RD${anticipoActual.toFixed(2)}</strong>
              </div>
              <div>
                Pendiente (50%):{" "}
                <strong>RD${pendienteActual.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        <Button type="submit">Guardar cotización</Button>
      </Form>

      <h3>Historial de cotizaciones</h3>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Ticket / Solicitud</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Anticipo</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.cliente}</td>
              <td>{c.servicio}</td>
              <td>{c.solicitud_id ? `#${c.solicitud_id}` : "-"}</td>
              <td>
                RD$
                {Number(c.total || 0).toLocaleString("es-DO", {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td>
                <EstadoBadge estado={c.estado || "pendiente"}>
                  ● {formatearEstado(c.estado)}
                </EstadoBadge>
              </td>
              <td>
                {c.usa_anticipo
                  ? `Inicial: RD$${c.monto_anticipo} / Restante: RD$${c.monto_pendiente}`
                  : "No"}
              </td>
              <td>{new Date(c.fecha).toLocaleDateString()}</td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <Eye
                  size={18}
                  style={{ cursor: "pointer", color: "#00bcd4" }}
                  onClick={() => navigate(`/admin/cotizaciones/${c.id}`)}
                />
                <Trash2
                  size={18}
                  className="delete-btn"
                  onClick={() => eliminarCotizacion(c.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Wrapper>
  );
}
