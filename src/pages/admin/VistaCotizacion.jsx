import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../../supabase/supabase.config.jsx";
import { Download } from "lucide-react";
import Swal from "sweetalert2";

const Wrapper = styled.div`
  padding: 2rem;
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  width: 100%;
  max-width: 750px;
  background: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.accent};
`;

const SectionTitle = styled.h3`
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 6px;
`;

const InfoRow = styled.div`
  margin: 0.4rem 0;
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th,
  td {
    padding: 0.8rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.inputBackground};
  }
`;

const TotalBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.inputBackground};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.4rem 0;
  font-size: 1.1rem;
`;

const Strong = styled.span`
  font-weight: 700;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.accent};
  color: white;
  border: none;
  padding: 0.8rem 1.3rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1.5rem;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
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

// 🔹 Datos de la empresa para el PDF
const EMPRESA = {
  nombre: "Vega Clean",
  rnc: "RNC: 1-00-00000-0", // cambia esto por tu RNC real
  direccion: "Santo Domingo, República Dominicana",
  telefono: "+1 (829) 723-6011",
  email: "oriseservice394@gmail.com",
};

function formatearEstado(estado) {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export default function VistaCotizacion() {
  const { id } = useParams();
  const [cotizacion, setCotizacion] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [solicitud, setSolicitud] = useState(null); // 🔗 ticket / solicitud

  // 🔧 Para edición
  const [editMode, setEditMode] = useState(false);
  const [productos, setProductos] = useState([]);
  const [editDetalle, setEditDetalle] = useState([]);
  const [editNombreServicio, setEditNombreServicio] = useState("");
  const [editPrecioServicio, setEditPrecioServicio] = useState(0);
  const [editDescuento, setEditDescuento] = useState(0);
  // Formato moneda RD$ con separador de miles
function formatRD(value) {
  const num = Number(value || 0);
  return `RD$ ${num.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

  useEffect(() => {
    fetchCotizacion();
  }, []);

  async function fetchCotizacion() {
    const { data: cot } = await supabase
      .from("cotizaciones")
      .select("*")
      .eq("id", id)
      .single();

    setCotizacion(cot || null);

    // Detalle de productos
    const { data: det } = await supabase
      .from("detalle_cotizacion")
      .select("*")
      .eq("cotizacion_id", id);

    const { data: productosData } = await supabase
      .from("productos")
      .select("id, nombre, precio");

    const detalleConProducto = det?.map((d) => {
      const prod = productosData?.find((p) => p.id === d.producto_id);
      return { ...d, producto: prod };
    });

    setDetalle(detalleConProducto || []);
    setProductos(productosData || []);

    // Inicializar campos de edición
    if (cot) {
      setEditNombreServicio(cot.nombre_servicio || "");
      setEditPrecioServicio(Number(cot.precio_servicio || 0));
      setEditDescuento(Number(cot.descuento || 0));
    }

    const editDet = (detalleConProducto || []).map((d) => ({
      producto_id: d.producto_id,
      cantidad: Number(d.cantidad || 0),
    }));
    setEditDetalle(editDet);

    // 🔗 Si la cotización tiene solicitud_id, cargamos la solicitud
    if (cot?.solicitud_id) {
      const { data: sol } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("id", cot.solicitud_id)
        .single();

      setSolicitud(sol || null);
    } else {
      setSolicitud(null);
    }
  }

  // -------- TOTALES (con ITBIS 18%) ----------
  const subtotalProductos = detalle.reduce(
    (acc, d) => acc + Number(d.subtotal || 0),
    0
  );
  const servicioNum = cotizacion ? Number(cotizacion.precio_servicio || 0) : 0;
  const base = subtotalProductos + servicioNum;
  const itebis = base * 0.18;
  const descuentoPct = cotizacion ? Number(cotizacion.descuento || 0) : 0;
  const descuentoMonto = (base * descuentoPct) / 100;
  const total = base + itebis - descuentoMonto;

  // Estos solo se usan en el PDF de plan 50/50
  const inicial50 = total * 0.5;
  const restante50 = total - inicial50;
  // -------------------------------------------

  // -------------- CAMBIO DE ESTADO + STOCK -----------------
  async function cambiarEstado(nuevoEstado) {
    if (!cotizacion) return;

    if (nuevoEstado === cotizacion.estado) {
      Swal.fire("Sin cambios", "La cotización ya tiene ese estado.", "info");
      return;
    }

    if (nuevoEstado === "aceptada") {
      if (cotizacion.estado === "aceptada") {
        Swal.fire(
          "Ya aceptada",
          "Esta cotización ya fue aceptada anteriormente. El inventario ya se descontó.",
          "info"
        );
        return;
      }

      const faltantes = [];

      for (const item of detalle) {
        if (!item.producto_id) continue;

        const { data: prod, error } = await supabase
          .from("productos")
          .select("id, nombre, cantidad")
          .eq("id", item.producto_id)
          .single();

        if (error) {
          console.error(error);
          Swal.fire(
            "Error",
            "No se pudo validar el inventario de los productos.",
            "error"
          );
          return;
        }

        const disponible = Number(prod?.cantidad || 0);
        const requerida = Number(item.cantidad || 0);

        if (requerida > disponible) {
          faltantes.push({
            nombre: prod.nombre,
            disponible,
            requerida,
          });
        }
      }

      if (faltantes.length > 0) {
        const msg = faltantes
          .map(
            (f) =>
              `${f.nombre}: requiere ${f.requerida} y solo hay ${f.disponible}`
          )
          .join("\n");

        Swal.fire(
          "Stock insuficiente",
          `No hay inventario suficiente para los siguientes productos:\n\n${msg}`,
          "warning"
        );
        return;
      }

      for (const item of detalle) {
        if (!item.producto_id) continue;

        const { data: prod } = await supabase
          .from("productos")
          .select("cantidad")
          .eq("id", item.producto_id)
          .single();

        const disponible = Number(prod?.cantidad || 0);
        const requerida = Number(item.cantidad || 0);
        const nuevaCantidad = disponible - requerida;

        await supabase
          .from("productos")
          .update({ cantidad: nuevaCantidad })
          .eq("id", item.producto_id);
      }
    }

    const { error } = await supabase
      .from("cotizaciones")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      console.error(error);
      return Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }

    Swal.fire("Estado actualizado", "", "success");
    fetchCotizacion();
  }
  // --------------------------------------------------

  if (!cotizacion) return <p style={{ padding: "2rem" }}>Cargando...</p>;

  async function cargarLogo() {
    try {
      const resp = await fetch("/logo-vega-clean.jpg");
      const blob = await resp.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("No se pudo cargar el logo:", err);
      return null;
    }
  }

  // =================== PDF GENERAL (COTIZ / FACTURA / PLAN 50) ===================
  function construirPDF(logoDataUrl, tipoDoc = "cotizacion") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const primary = "#0FA3B1";
  const dark = "#333333";
  const gray = "#555555";
  const lightGray = "#F5F5F5";

  const marginX = 40;
  let y = 50;

  // ---------- ENCABEZADO EMPRESA ----------
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", marginX, y, 70, 70);
  }

  const titulo =
    tipoDoc === "factura"
      ? "FACTURA"
      : tipoDoc === "orden"
      ? "ORDEN DE COMPRA"
      : tipoDoc === "plan50"
      ? "PLAN DE PAGO 50 / 50"
      : "COTIZACIÓN";

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(dark);
  doc.text(EMPRESA.nombre, marginX + 90, y + 10);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(gray);
  doc.text(EMPRESA.rnc, marginX + 90, y + 26);
  doc.text(EMPRESA.direccion, marginX + 90, y + 38);
  doc.text(`Tel: ${EMPRESA.telefono}`, marginX + 90, y + 50);
  doc.text(`Email: ${EMPRESA.email}`, marginX + 90, y + 62);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(dark);
  doc.text(titulo, 555, y + 10, { align: "right" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`No. ${cotizacion.id}`, 555, y + 24, { align: "right" });

  y += 100;

  // ---------- INFO CLIENTE ----------
  doc.setFillColor(lightGray);
  doc.roundedRect(marginX, y, 515, 110, 6, 6, "F");

  doc.setFontSize(12);
  doc.setTextColor(dark);

  let infoY = y + 20;
  doc.text(`Cliente:`, marginX + 15, infoY);
  doc.setFont("Helvetica", "normal");
  doc.text(String(cotizacion.cliente), marginX + 120, infoY);

  doc.setFont("Helvetica", "bold");
  infoY += 20;
  doc.text(`Servicio:`, marginX + 15, infoY);
  doc.setFont("Helvetica", "normal");
  doc.text(String(cotizacion.servicio || "-"), marginX + 120, infoY);

  infoY += 20;
  doc.setFont("Helvetica", "bold");
  doc.text(`Estado:`, marginX + 15, infoY);
  doc.setFont("Helvetica", "normal");
  doc.text(formatearEstado(cotizacion.estado), marginX + 120, infoY);

  infoY += 20;
  doc.setFont("Helvetica", "bold");
  doc.text(`Fecha:`, marginX + 15, infoY);
  doc.setFont("Helvetica", "normal");
  doc.text(
    new Date(cotizacion.fecha).toLocaleString(),
    marginX + 120,
    infoY
  );

  y += 130;

  // ---------- TABLA DE CONCEPTOS ----------
  const tableBody = detalle.map((d) => {
    const cantidad = Number(d.cantidad || 0);
    const subtotal = Number(d.subtotal || 0);
    const precioUnit = cantidad > 0 ? subtotal / cantidad : 0;

    return [
      d.producto?.nombre || "-",
      cantidad,
      formatRD(precioUnit),
      formatRD(subtotal),
    ];
  });

  if (servicioNum > 0) {
    tableBody.push([
      cotizacion.nombre_servicio ||
        `Servicio: ${cotizacion.servicio || "Instalación"}`,
      1,
      formatRD(servicioNum),
      formatRD(servicioNum),
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Concepto", "Cant.", "Precio", "Subtotal"]],
    body: tableBody,
    theme: "striped",
    styles: {
      fontSize: 11,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: primary,
      textColor: "#FFFFFF",
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: "#f0f8f8",
    },
  });

  const tableEnd = doc.lastAutoTable.finalY + 20;

  // ---------- RESUMEN DE TOTALES ----------
  const boxHeight = tipoDoc === "plan50" ? 170 : 130;

  doc.setFillColor("#FFFFFF");
  doc.roundedRect(marginX, tableEnd, 515, boxHeight, 6, 6, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(dark);

  let ty = tableEnd + 25;

  doc.text("Subtotal (antes de ITBIS):", marginX + 20, ty);
  doc.text(formatRD(base), marginX + 420, ty, { align: "right" });

  ty += 20;
  doc.text("ITBIS (18%):", marginX + 20, ty);
  doc.text(formatRD(itebis), marginX + 420, ty, { align: "right" });

  ty += 20;
  doc.text("Descuento:", marginX + 20, ty);
  doc.text(
    `${formatRD(descuentoMonto)} (${descuentoPct}%)`,
    marginX + 420,
    ty,
    { align: "right" }
  );

  if (tipoDoc === "plan50") {
    ty += 20;
    doc.text("Inicial (50%):", marginX + 20, ty);
    doc.text(formatRD(inicial50), marginX + 420, ty, { align: "right" });

    ty += 20;
    doc.text("Restante (50%):", marginX + 20, ty);
    doc.text(formatRD(restante50), marginX + 420, ty, { align: "right" });
  }

  ty += 30;
  doc.setFontSize(16);
  doc.setTextColor(primary);
  doc.text("TOTAL:", marginX + 20, ty);
  doc.text(formatRD(total), marginX + 420, ty, { align: "right" });

  // ---------- FIRMA ----------
  const firmaY = ty + 60;
  doc.setDrawColor("#000000");
  doc.line(marginX + 50, firmaY, marginX + 300, firmaY);
  doc.setFontSize(11);
  doc.setTextColor(gray);
  doc.text("Firma del cliente", marginX + 90, firmaY + 15);

  // ---------- PIE ----------
  doc.setFontSize(10);
  doc.setTextColor(gray);
  doc.text("Gracias por preferir Vega Clean.", marginX, 750);
  doc.text(`WhatsApp: ${EMPRESA.telefono}`, marginX, 765);
  doc.text(`Email: ${EMPRESA.email}`, marginX, 780);

  return doc;
}


  // =============== PDF ESPECIAL: ORDEN DE COMPRA ==================
  function construirOrdenCompraPDF(logoDataUrl) {
    const doc = new jsPDF("p", "pt", "a4");

    const marginX = 40;
    let y = 50;

    const formatMoney = (value) =>
      `RD$ ${Number(value || 0).toLocaleString("es-DO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const fechaStr = new Date(cotizacion.fecha).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const numeroOrden = String(cotizacion.id).padStart(5, "0");

    // TÍTULO
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Orden de Compra", marginX, y + 10);

    doc.setFontSize(11);
    doc.setFont("Helvetica", "normal");
    doc.text(`Fecha: ${fechaStr}`, 400, y);
    doc.text(`Nº de orden: ${numeroOrden}`, 400, y + 18);

    y += 50;

    // DATOS PROVEEDOR / CLIENTE
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Datos del proveedor", marginX, y);
    doc.text("Datos del cliente", 320, y);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    y += 18;

    const proveedorLines = [
      `Nombre o razón social: ${EMPRESA.nombre}`,
      `RNC: ${EMPRESA.rnc}`,
      `Dirección: ${EMPRESA.direccion}`,
      `Teléfono: ${EMPRESA.telefono}`,
      `Correo electrónico: ${EMPRESA.email}`,
    ];

    // Tomar datos desde la solicitud (ticket) cuando existan
const clienteNombre =
  (solicitud?.tipo_cliente === "empresa" &&
    solicitud?.empresa_nombre) ||
  solicitud?.cliente ||
  cotizacion.cliente ||
  "-";

const clienteRnc =
  (solicitud?.tipo_cliente === "empresa" &&
    solicitud?.empresa_rnc) || "-";

const clienteDireccion = solicitud?.direccion || "-";
const clienteTelefono = solicitud?.telefono || "-";
const clienteCorreo = solicitud?.email || "-";

const clienteLines = [
  `Nombre o razón social: ${clienteNombre}`,
  `RNC / ID: ${clienteRnc}`,
  `Dirección: ${clienteDireccion}`,
  `Teléfono: ${clienteTelefono}`,
  `Correo electrónico: ${clienteCorreo}`,
];


    const lineHeight = 14;

    proveedorLines.forEach((line, idx) => {
      doc.text(line, marginX, y + idx * lineHeight);
    });

    clienteLines.forEach((line, idx) => {
      doc.text(line, 320, y + idx * lineHeight);
    });

    const tableY = y + proveedorLines.length * lineHeight + 20;

    // TABLA DE ITEMS
    const body = detalle.map((d, index) => {
      const cantidad = Number(d.cantidad || 0);
      const subtotal = Number(d.subtotal || 0);
      const unit = cantidad > 0 ? subtotal / cantidad : 0;

      return [
        `#${d.producto_id || index + 1}`,
        d.producto?.nombre || "-",
        cantidad,
        formatMoney(unit),
        formatMoney(subtotal),
      ];
    });

    if (servicioNum > 0) {
      body.push([
        "SERV",
        cotizacion.nombre_servicio ||
          `Servicio: ${cotizacion.servicio || "Instalación"}`,
        1,
        formatMoney(servicioNum),
        formatMoney(servicioNum),
      ]);
    }

    autoTable(doc, {
      startY: tableY,
      head: [
        ["Ref.", "Descripción", "Cantidad", "Precio unitario", "Precio total"],
      ],
      body,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: 0,
        fontStyle: "bold",
      },
    });

    const endY = doc.lastAutoTable.finalY + 20;

    // TOTALES ESTILO ORDEN DE COMPRA
    const totalPedido = base; // subtotal productos + servicio
    const montoDescuento = descuentoMonto; // ya calculado sobre base
    const gastosEnvio = 0; // si luego agregas campo en BD lo pones aquí
    const totalConDescuento = totalPedido - montoDescuento + gastosEnvio;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);

    doc.text("Total pedido", 400, endY);
    doc.text(formatMoney(totalPedido), 540, endY, { align: "right" });

    let ty = endY + 16;

    if (descuentoPct > 0) {
      doc.setFont("Helvetica", "normal");
      doc.text(`Descuento (${descuentoPct}%):`, 400, ty);
      doc.text(`- ${formatMoney(montoDescuento)}`, 540, ty, {
        align: "right",
      });
      ty += 16;
    }

    if (gastosEnvio > 0) {
      doc.text("Gastos de envío:", 400, ty);
      doc.text(formatMoney(gastosEnvio), 540, ty, { align: "right" });
      ty += 16;
    }

    doc.setFont("Helvetica", "bold");
    doc.text("Total a pagar", 400, ty + 4);
    doc.text(formatMoney(totalConDescuento), 540, ty + 4, {
      align: "right",
    });

    // CAMPOS DE ENTREGA + FIRMA
    let bottomY = ty + 50;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);

    doc.text("Fecha de entrega: ______________________________", marginX, bottomY);
    bottomY += 20;
    doc.text(
      "Dirección de entrega: ___________________________",
      marginX,
      bottomY
    );
    bottomY += 20;
    doc.text("Notas: ________________________________________", marginX, bottomY);

    bottomY += 80;
    doc.line(350, bottomY, 530, bottomY);
    doc.text("Firma del receptor", 390, bottomY + 15);

    return doc;
  }

  async function handleDescargar(tipoDoc = "cotizacion") {
    const logo = await cargarLogo();

    // Para "orden" usamos el PDF especial de orden de compra
    const doc =
      tipoDoc === "orden"
        ? construirOrdenCompraPDF(logo)
        : construirPDF(logo, tipoDoc);

    const prefijo =
      tipoDoc === "factura"
        ? "factura"
        : tipoDoc === "orden"
        ? "orden_compra"
        : tipoDoc === "plan50"
        ? "plan_50_50"
        : "cotizacion";

    doc.save(`${prefijo}_${cotizacion.id}.pdf`);
  }

  // =============== LÓGICA DE EDICIÓN (igual que antes) ===============

  function agregarLineaProducto() {
    if (!productos || productos.length === 0) {
      Swal.fire(
        "Sin productos",
        "No hay productos registrados para agregar.",
        "warning"
      );
      return;
    }

    const primerProducto = productos[0];

    setEditDetalle((prev) => [
      ...prev,
      { producto_id: primerProducto.id, cantidad: 1 },
    ]);
  }

  function actualizarLinea(index, campo, valor) {
    setEditDetalle((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]:
                campo === "cantidad"
                  ? Number(valor) < 1
                    ? 1
                    : Number(valor)
                  : valor,
            }
          : item
      )
    );
  }

  function eliminarLinea(index) {
    setEditDetalle((prev) => prev.filter((_, i) => i !== index));
  }

  async function guardarEdicion() {
    if (!cotizacion) return;

    if (cotizacion.estado === "aceptada") {
      Swal.fire(
        "No editable",
        "No se puede editar una cotización que ya está aceptada, para no afectar el inventario.",
        "warning"
      );
      return;
    }

    if (
      editDetalle.length === 0 &&
      (!editPrecioServicio || Number(editPrecioServicio) <= 0)
    ) {
      Swal.fire(
        "Sin conceptos",
        "Debes tener al menos un producto o un servicio con precio.",
        "warning"
      );
      return;
    }

    for (const item of editDetalle) {
      if (!item.producto_id) {
        Swal.fire(
          "Producto inválido",
          "Hay una línea sin producto seleccionado.",
          "warning"
        );
        return;
      }
      if (!item.cantidad || Number(item.cantidad) <= 0) {
        Swal.fire(
          "Cantidad inválida",
          "Las cantidades deben ser mayores que cero.",
          "warning"
        );
        return;
      }
    }

    let subtotalProd = 0;
    const detallesAInsertar = [];

    for (const item of editDetalle) {
      const prod = productos.find((p) => p.id === item.producto_id);
      const price = prod ? Number(prod.precio) : 0;
      const cant = Number(item.cantidad || 0);
      const sub = price * cant;
      subtotalProd += sub;

      detallesAInsertar.push({
        producto_id: item.producto_id,
        cantidad: cant,
        subtotal: sub,
      });
    }

    const baseLocal = subtotalProd + Number(editPrecioServicio || 0);
    const descPct = Number(editDescuento || 0);
    const totalLocal = baseLocal - (baseLocal * descPct) / 100;

    if (totalLocal <= 0) {
      Swal.fire(
        "Total inválido",
        "El total calculado debe ser mayor que cero.",
        "error"
      );
      return;
    }

    const { error: errUpdateCot } = await supabase
      .from("cotizaciones")
      .update({
        nombre_servicio: editNombreServicio || null,
        precio_servicio: Number(editPrecioServicio) || 0,
        descuento: descPct,
        total: totalLocal,
      })
      .eq("id", id);

    if (errUpdateCot) {
      console.error(errUpdateCot);
      Swal.fire(
        "Error",
        "No se pudo actualizar la cabecera de la cotización.",
        "error"
      );
      return;
    }

    const { error: errDelete } = await supabase
      .from("detalle_cotizacion")
      .delete()
      .eq("cotizacion_id", id);

    if (errDelete) {
      console.error(errDelete);
      Swal.fire(
        "Error",
        "No se pudo limpiar el detalle anterior.",
        "error"
      );
      return;
    }

    if (detallesAInsertar.length > 0) {
      const { error: errInsert } = await supabase
        .from("detalle_cotizacion")
        .insert(
          detallesAInsertar.map((d) => ({
            cotizacion_id: Number(id),
            ...d,
          }))
        );

      if (errInsert) {
        console.error(errInsert);
        Swal.fire(
          "Error",
          "No se pudo guardar el nuevo detalle de la cotización.",
          "error"
        );
        return;
      }
    }

    Swal.fire("Cambios guardados", "La cotización fue actualizada.", "success");
    setEditMode(false);
    fetchCotizacion();
  }

  // =================================================

  return (
    <Wrapper>
      <Card>
        <Title>Vega Clean</Title>
        <p style={{ textAlign: "center", opacity: 0.8 }}>
          {formatearEstado(cotizacion.estado)} — #{cotizacion.id}
        </p>

        <SectionTitle>Información del Cliente</SectionTitle>

        <InfoRow>
          <span>
            <Strong>Cliente:</Strong>
          </span>
          <span>{cotizacion.cliente}</span>
        </InfoRow>

        <InfoRow>
          <span>
            <Strong>Servicio:</Strong>
          </span>
          <span>{cotizacion.servicio || "-"}</span>
        </InfoRow>

        {cotizacion.solicitud_id && (
          <InfoRow>
            <span>
              <Strong>Ticket vinculado:</Strong>
            </span>
            <span>#{cotizacion.solicitud_id}</span>
          </InfoRow>
        )}

        <InfoRow>
          <span>
            <Strong>Estado:</Strong>
          </span>
          <span>
            <EstadoBadge estado={cotizacion.estado || "pendiente"}>
              ● {formatearEstado(cotizacion.estado)}
            </EstadoBadge>
          </span>
        </InfoRow>

        {/* BOTONES ESTADO + EDITAR */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => cambiarEstado("aceptada")}
            style={{
              background: "rgba(46,204,113,0.2)",
              color: "#27ae60",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ✔ Aceptar
          </button>

          <button
            onClick={() => cambiarEstado("rechazada")}
            style={{
              background: "rgba(231,76,60,0.2)",
              color: "#c0392b",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ✖ Rechazar
          </button>

          <button
            onClick={() => cambiarEstado("pendiente")}
            style={{
              background: "rgba(241,196,15,0.2)",
              color: "#b7950b",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🕒 Pendiente
          </button>

          <button
            onClick={() => setEditMode((prev) => !prev)}
            style={{
              background: "#00bcd4",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ✏️ {editMode ? "Cancelar edición" : "Editar cotización"}
          </button>
        </div>

        <InfoRow>
          <span>
            <Strong>Fecha:</Strong>
          </span>
          <span>{new Date(cotizacion.fecha).toLocaleString()}</span>
        </InfoRow>

        <SectionTitle>Conceptos Cotizados</SectionTitle>

        <Table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((d, i) => {
              const cantidad = Number(d.cantidad || 0);
              const subtotal = Number(d.subtotal || 0);
              const precioUnit = cantidad > 0 ? subtotal / cantidad : 0;

              return (
                <tr key={i}>
                  <td>{d.producto?.nombre || "-"}</td>
                  <td>{cantidad}</td>
                  <td>RD${precioUnit.toFixed(2)}</td>
                  <td>RD${subtotal.toFixed(2)}</td>
                </tr>
              );
            })}
            {servicioNum > 0 && (
              <tr>
                <td>
                  {cotizacion.nombre_servicio ||
                    `Servicio: ${cotizacion.servicio || "Instalación"}`}
                </td>
                <td>1</td>
                <td>RD${servicioNum.toFixed(2)}</td>
                <td>RD${servicioNum.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* ======= BLOQUE EDICIÓN ======= */}
        {editMode && (
          <>
            <SectionTitle>Editar cotización</SectionTitle>

            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.75,
                marginBottom: "0.8rem",
              }}
            >
              Los cambios se aplican al guardar. No se permite editar cotizaciones
              aceptadas.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <strong>Productos:</strong>

              {editDetalle.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr auto",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <select
                    value={item.producto_id || ""}
                    onChange={(e) =>
                      actualizarLinea(index, "producto_id", Number(e.target.value))
                    }
                    style={{
                      padding: "0.4rem",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} - RD${p.precio}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) =>
                      actualizarLinea(index, "cantidad", e.target.value)
                    }
                    style={{
                      padding: "0.4rem",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => eliminarLinea(index)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#c0392b",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                    }}
                  >
                    🗑
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={agregarLineaProducto}
                style={{
                  marginTop: "0.7rem",
                  background: "#00bcd4",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                + Agregar producto
              </button>
            </div>

            <div style={{ display: "grid", gap: "0.6rem" }}>
              <div>
                <label style={{ fontSize: "0.9rem" }}>
                  Descripción del servicio:
                </label>
                <input
                  type="text"
                  value={editNombreServicio}
                  onChange={(e) => setEditNombreServicio(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.9rem" }}>Precio del servicio:</label>
                <input
                  type="number"
                  min="0"
                  value={editPrecioServicio}
                  onChange={(e) =>
                    setEditPrecioServicio(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.9rem" }}>Descuento (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editDescuento}
                  onChange={(e) =>
                    setEditDescuento(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            </div>

            <Button onClick={guardarEdicion}>Guardar cambios</Button>
          </>
        )}

        <SectionTitle>Totales</SectionTitle>

        <TotalBox>
          <TotalRow>
            <span>Subtotal (antes de ITBIS):</span>
            <Strong>RD${base.toFixed(2)}</Strong>
          </TotalRow>

          <TotalRow>
            <span>ITBIS (18%):</span>
            <Strong>RD${itebis.toFixed(2)}</Strong>
          </TotalRow>

          <TotalRow>
            <span>Descuento:</span>
            <Strong>
              RD${descuentoMonto.toFixed(2)} ({descuentoPct}%)
            </Strong>
          </TotalRow>

          <TotalRow>
            <span style={{ fontSize: "1.2rem" }}>TOTAL:</span>
            <Strong style={{ fontSize: "1.2rem" }}>
              RD${total.toFixed(2)}
            </Strong>
          </TotalRow>
        </TotalBox>

        <div style={{ marginTop: "2rem" }}>
          <p style={{ marginBottom: "3rem" }}>______________________________</p>
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>Firma del cliente</p>
        </div>

        {/* BOTONES PDFs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <Button onClick={() => handleDescargar("cotizacion")}>
            <Download size={18} />
            Descargar cotización (PDF)
          </Button>
          <Button onClick={() => handleDescargar("factura")}>
            <Download size={18} />
            Descargar factura (PDF)
          </Button>
          <Button onClick={() => handleDescargar("orden")}>
            <Download size={18} />
            Descargar orden de compra (PDF)
          </Button>
          <Button onClick={() => handleDescargar("plan50")}>
            <Download size={18} />
            Descargar plan 50/50 (PDF)
          </Button>
        </div>
      </Card>
    </Wrapper>
  );
}
