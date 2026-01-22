// src/pages/admin/VistaCotizacion.jsx
import { useEffect, useMemo, useState } from "react";
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

  @media (max-width: 520px) {
    padding: 1rem;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 750px;
  background: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);

  @media (max-width: 520px) {
    padding: 1rem;
    border-radius: 10px;
  }
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
  gap: 14px;
  font-size: 1rem;
  > * {
    min-width: 0;
  }

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    font-size: 0.95rem;
  }
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 10px;

  scrollbar-width: thin;
`;



const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;


  min-width: 560px;

  th,
  td {
    padding: 0.8rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: top;

    word-break: break-word;
    overflow-wrap: anywhere;
  }

  th {
    background: ${({ theme }) => theme.inputBackground};
    white-space: nowrap;
  }

  @media (max-width: 520px) {
    th,
    td {
      padding: 0.65rem;
      font-size: 0.9rem;
    }
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
  margin-top: 1rem;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionsBar = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;

  /* Los botones se distribuyen mejor sin cambiar su estilo inline */
  button {
    flex: 1 1 160px;
  }

  @media (max-width: 520px) {
    button {
      flex: 1 1 100%;
      width: 100%;
    }
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

  background-color: ${({ $estado }) =>
    $estado === "aceptada"
      ? "rgba(46, 204, 113, 0.18)"
      : $estado === "preparacion"
      ? "rgba(52, 152, 219, 0.15)"
      : $estado === "rechazada"
      ? "rgba(231, 76, 60, 0.15)"
      : "rgba(241, 196, 15, 0.18)"};

  color: ${({ $estado }) =>
    $estado === "aceptada"
      ? "#27ae60"
      : $estado === "preparacion"
      ? "#2980b9"
      : $estado === "rechazada"
      ? "#c0392b"
      : "#b7950b"};
`;

// Empresa (cabecera fija)
const EMPRESA = {
  nombre: "Vega Clean",
  rnc: "RNC: 132-05451-2",
  direccion: "La Vega, República Dominicana",
  telefono: "+1 (809) 365-6666",
  email: "emailcambiarlo@gmail.com",
};

function formatearEstado(estado) {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

function formatRD(value) {
  const num = Number(value || 0);
  return `RD$ ${num.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function textoSeguro(v) {
  return String(v ?? "-");
}

function labelCliente(cli) {
  if (!cli) return "-";
  const tipo = cli.tipo_cliente || "";
  if (tipo === "empresa") {
    return `${cli.nombre || "-"} (RNC: ${cli.empresa_rnc || "-"})`;
  }
  return `${cli.nombre || "-"} (Cédula: ${cli.cedula || "-"})`;
}

// ========= LOGO robusto (convierte a PNG con canvas para evitar "wrong PNG signature") =========
function blobToPngDataUrl(blob) {
  return new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    } catch (e) {
      reject(e);
    }
  });
}

async function cargarLogoRobustoPng() {
  const candidates = [
    "/logo_veganclean.png",
    "/logo-veganclean.png",
    "/logo-vega-clean.png",
    "/logo-vega-clean.jpg",
    "/logo-vega-clean.jpeg",
    "/logo.webp",
    "/logo.png",
    "/logo.jpg",
    "/logo.jpeg",
  ];

  for (const path of candidates) {
    try {
      const resp = await fetch(path, { cache: "no-store" });
      if (!resp.ok) continue;

      const ct = (resp.headers.get("content-type") || "").toLowerCase();
      if (ct.includes("text/html")) continue;

      const blob = await resp.blob();
      if (!blob || blob.size < 50) continue;

      const dataUrl = await blobToPngDataUrl(blob);
      return { dataUrl, fmt: "PNG" };
    } catch {
      continue;
    }
  }
  return null;
}

export default function VistaCotizacion() {
  const { id } = useParams();

  const [cotizacion, setCotizacion] = useState(null);
  const [clienteRef, setClienteRef] = useState(null); // clientes join
  const [detalle, setDetalle] = useState([]); // con nombre resuelto vía join
  const [preventa, setPreventa] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editDetalle, setEditDetalle] = useState([]);
  const [editDescuento, setEditDescuento] = useState(0);

  // permiso edición por rol (si te interesa bloquear en vendedor)
  const role = localStorage.getItem("rol") || ""; // "admin" | "vendedor"
  const isVendedor = role === "vendedor";
  const allowEdit = !isVendedor;

  useEffect(() => {
    fetchTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTodo() {
    await fetchCotizacionYDetalle();
  }

  async function fetchCotizacionYDetalle() {
    // 1) cotización con join a clientes
    const { data: cot, error: errCot } = await supabase
      .from("cotizaciones")
      .select(
        `
        *,
        cliente_ref:clientes (
          id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar
        )
      `
      )
      .eq("id", Number(id))
      .single();

    if (errCot) {
      console.error(errCot);
      Swal.fire("Error", "No se pudo cargar la cotización.", "error");
      return;
    }

    setCotizacion(cot || null);
    setClienteRef(cot?.cliente_ref || null);

    // 2) preventa (si existe)
    if (cot?.preventa_id) {
      const { data: p, error: errPrev } = await supabase
        .from("preventas")
        .select("*")
        .eq("id", Number(cot.preventa_id))
        .maybeSingle();
      if (errPrev) console.error(errPrev);
      setPreventa(p || null);
    } else {
      setPreventa(null);
    }

    // 3) detalle con join a productos/equipos (para nombre)
    const { data: det, error: errDet } = await supabase
      .from("detalle_cotizacion")
      .select(
        `
        id, cotizacion_id, producto_id, equipo_id, cantidad, subtotal, precio_base_snapshot, extra_unitario, precio_unitario, cantidad_despachada,
        producto:productos ( id, nombre, precio, modelo, marca, categoria ),
        equipo:equipos ( id, nombre, precio, modelo, marca, categoria )
      `
      )
      .eq("cotizacion_id", Number(id))
      .order("id", { ascending: true });

    if (errDet) {
      console.error(errDet);
      setDetalle([]);
      return;
    }

    const detalleConNombre = (det || []).map((d) => {
      if (d.producto_id != null) {
        return {
          ...d,
          tipo: "producto",
          nombre: d.producto?.nombre || `Producto #${d.producto_id}`,
          modelo: d.producto?.modelo || "",
          item: d.producto || null,
        };
      }
      if (d.equipo_id != null) {
        return {
          ...d,
          tipo: "equipo",
          nombre: d.equipo?.nombre || `Equipo #${d.equipo_id}`,
          modelo: d.equipo?.modelo || "",
          item: d.equipo || null,
        };
      }
      return { ...d, tipo: "desconocido", nombre: "Item", item: null };
    });

    setDetalle(detalleConNombre);

    // Edit init
    setEditDescuento(Number(cot?.descuento || 0));
    setEditDetalle(
      detalleConNombre.map((d) => ({
        tipo: d.producto_id != null ? "producto" : "equipo",
        item_id: d.producto_id != null ? d.producto_id : d.equipo_id,
        cantidad: Number(d.cantidad || 1),
        extra_unitario: Number(d.extra_unitario || 0),
      }))
    );
  }

  // -------- TOTALES ----------
  const subtotal = useMemo(
    () => detalle.reduce((acc, d) => acc + Number(d.subtotal || 0), 0),
    [detalle]
  );
  const descuentoPct = Number(cotizacion?.descuento || 0);
  const descuentoMonto = (subtotal * descuentoPct) / 100;
  const itbis = (subtotal - descuentoMonto) * 0.18;
  const total = subtotal - descuentoMonto + itbis;

  // ------------- ESTADO -------------
  async function cambiarEstado(nuevoEstado) {
    if (!cotizacion) return;

    try {
      // ✅ Enviar a almacén: NO descuenta inventario, solo pasa a "preparacion"
      if (nuevoEstado === "aceptada") {
        const { error } = await supabase
          .from("cotizaciones")
          .update({ estado: "preparacion", inventario_descontado: false })
          .eq("id", Number(id));

        if (error) {
          console.error(error);
          Swal.fire("Error", error.message || "No se pudo pasar a preparación de almacén.", "error");
          return;
        }

        Swal.fire("Preparación", "Enviada a almacén para despacho.", "success");
        await fetchCotizacionYDetalle(); // ✅ aquí estaba tu bug (llamabas fetchCotizacion)
        return;
      }

      const { error } = await supabase
        .from("cotizaciones")
        .update({ estado: nuevoEstado })
        .eq("id", Number(id));

      if (error) {
        console.error(error);
        Swal.fire("Error", error.message || "No se pudo cambiar el estado", "error");
        return;
      }

      Swal.fire("Estado actualizado", "", "success");
      await fetchCotizacionYDetalle();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Ocurrió un error inesperado cambiando el estado.", "error");
    }
  }

  // -------- PDF ----------
  function padOrder(n, size = 5) {
    const s = String(n ?? "");
    return s.padStart(size, "0");
  }

  function getClienteNombreYDoc() {
    // prioridad: cliente_ref
    const cli = clienteRef;
    if (cli) {
      const tipo = cli.tipo_cliente;
      const doc = tipo === "empresa" ? cli.empresa_rnc : cli.cedula;
      return { nombre: cli.nombre, doc: doc, tipo: tipo };
    }

    // fallback por preventa
    if (preventa) {
      const tipo = preventa.tipo_cliente;
      const doc = tipo === "empresa" ? preventa.empresa_rnc : preventa.cedula;
      return { nombre: preventa.cliente || cotizacion?.cliente, doc, tipo };
    }

    // último fallback
    return { nombre: cotizacion?.cliente || "-", doc: "-", tipo: "" };
  }

  function construirPDF(logoObj, tipoDoc = "cotizacion") {
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    const dark = "#111111";
    const gray = "#444444";
    const lineGray = "#BDBDBD";
    const headerFill = "#F3F3F3";

    const marginX = 48;
    const pageW = doc.internal.pageSize.getWidth();
    const usableW = pageW - marginX * 2;

    let y = 48;

    const { nombre: cliNombre, doc: cliDoc } = getClienteNombreYDoc();

    // ======= ORDEN DE COMPRA (FORMATO EMPRESA) =======
    if (tipoDoc === "orden") {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(dark);
      doc.text("Orden de Compra", marginX, y + 12);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(gray);

      const fechaTxt = `Fecha: ${new Date().toLocaleDateString("es-DO")}`;
      const ordenTxt = `N° de orden: ${padOrder(cotizacion?.id, 5)}`;

      doc.text(fechaTxt, marginX + usableW, y + 4, { align: "right" });
      doc.text(ordenTxt, marginX + usableW, y + 18, { align: "right" });

      y += 44;

      if (logoObj?.dataUrl && logoObj?.fmt) {
        try {
          doc.addImage(logoObj.dataUrl, logoObj.fmt, marginX, y, 44, 44);
        } catch {}
      }

      const boxTop = y + 6;
      const boxH = 92;
      const gap = 28;
      const colW = (usableW - gap) / 2;

      const leftX = marginX;
      const rightX = marginX + colW + gap;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(dark);
      doc.text("Datos del proveedor", leftX, boxTop + 10);
      doc.text("Datos del cliente", rightX, boxTop + 10);

      const provLines = [
        `Nombre o razón social: ${textoSeguro(EMPRESA.nombre)}`,
        `${textoSeguro(EMPRESA.rnc)}`,
        `Dirección: ${textoSeguro(EMPRESA.direccion)}`,
        `Teléfono: ${textoSeguro(EMPRESA.telefono)}`,
        `Correo electrónico: ${textoSeguro(EMPRESA.email)}`,
      ];

      const cliTelefono = preventa?.telefono || clienteRef?.telefono || "-";
      const cliEmail = preventa?.email || clienteRef?.email || "-";
      const cliDireccion = preventa?.direccion || clienteRef?.direccion || "-";

      const cliLines = [
        `Nombre o razón social: ${textoSeguro(cliNombre)}`,
        `RNC / ID -: ${textoSeguro(cliDoc)}`,
        `Dirección: ${textoSeguro(cliDireccion)}`,
        `Teléfono: ${textoSeguro(cliTelefono)}`,
        `Correo electrónico: ${textoSeguro(cliEmail)}`,
      ];

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(gray);

      let ly = boxTop + 26;
      for (const l of provLines) {
        doc.text(l, leftX, ly);
        ly += 14;
      }

      let ry = boxTop + 26;
      for (const l of cliLines) {
        doc.text(l, rightX, ry);
        ry += 14;
      }

      y = boxTop + boxH + 18;

      const body = detalle.map((d) => {
        const cant = Number(d.cantidad || 0);
        const sub = Number(d.subtotal || 0);
        const unit = cant > 0 ? sub / cant : 0;
        const ref =
          d.producto_id != null
            ? `P-${d.producto_id}`
            : d.equipo_id != null
            ? `E-${d.equipo_id}`
            : "-";

        return [ref, textoSeguro(d.nombre), String(cant), formatRD(unit), formatRD(sub)];
      });

      autoTable(doc, {
        startY: y,
        head: [["Ref.", "Descripción", "Cantidad", "Precio unitario", "Precio total"]],
        body,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 8, textColor: 20 },
        headStyles: { fillColor: headerFill, textColor: 20, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 230 },
          2: { cellWidth: 70, halign: "center" },
          3: { cellWidth: 90, halign: "right" },
          4: { cellWidth: 90, halign: "right" },
        },
      });

      const tableEndY = doc.lastAutoTable.finalY;

      let totalsY = tableEndY + 22;
      const rightEdge = marginX + usableW;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(dark);

      doc.text("Total pedido", rightEdge - 160, totalsY);
      doc.text(formatRD(subtotal - descuentoMonto + itbis), rightEdge, totalsY, { align: "right" });

      totalsY += 18;
      doc.text("Total a pagar", rightEdge - 160, totalsY);
      doc.text(formatRD(total), rightEdge, totalsY, { align: "right" });

      let linesY = totalsY + 48;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(dark);

      doc.text("Fecha de entrega:", marginX, linesY);
      doc.setDrawColor(lineGray);
      doc.line(marginX + 95, linesY + 2, marginX + 280, linesY + 2);

      linesY += 18;
      doc.text("Dirección de entrega:", marginX, linesY);
      doc.line(marginX + 115, linesY + 2, marginX + 320, linesY + 2);

      linesY += 18;
      doc.text("Notas:", marginX, linesY);
      doc.line(marginX + 40, linesY + 2, marginX + 320, linesY + 2);

      const sigY = 720;
      doc.line(rightEdge - 220, sigY, rightEdge, sigY);
      doc.setFontSize(10);
      doc.setTextColor(gray);
      doc.text("Firma del receptor", rightEdge - 110, sigY + 14, { align: "center" });

      return doc;
    }

    // ======= COTIZACIÓN / FACTURA (layout) =======
    const primary = "#16a34a";
    const lightGray = "#F5F5F5";
    const marginY = 50;

    y = marginY;

    if (logoObj?.dataUrl) {
      try {
        doc.addImage(logoObj.dataUrl, "PNG", marginX, y, 70, 70);
      } catch {}
    }

    const titulo = tipoDoc === "factura" ? "FACTURA" : "COTIZACIÓN";

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(dark);
    doc.text(EMPRESA.nombre, marginX + 90, y + 10);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#444");
    doc.text(EMPRESA.rnc, marginX + 90, y + 26);
    doc.text(EMPRESA.direccion, marginX + 90, y + 38);
    doc.text(`Tel: ${EMPRESA.telefono}`, marginX + 90, y + 50);
    doc.text(`Email: ${EMPRESA.email}`, marginX + 90, y + 62);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(dark);
    doc.text(titulo, marginX + usableW, y + 10, { align: "right" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`No. ${cotizacion?.id}`, marginX + usableW, y + 24, { align: "right" });

    y += 100;

    doc.setFillColor(lightGray);
    doc.roundedRect(marginX, y, usableW, 95, 6, 6, "F");

    doc.setFontSize(12);
    doc.setTextColor(dark);

    let infoY = y + 22;

    doc.setFont("Helvetica", "bold");
    doc.text("Cliente:", marginX + 15, infoY);
    doc.setFont("Helvetica", "normal");
    doc.text(textoSeguro(cliNombre), marginX + 120, infoY);

    infoY += 18;
    doc.setFont("Helvetica", "bold");
    doc.text("Documento:", marginX + 15, infoY);
    doc.setFont("Helvetica", "normal");
    doc.text(textoSeguro(cliDoc), marginX + 120, infoY);

    infoY += 18;
    doc.setFont("Helvetica", "bold");
    doc.text("Estado:", marginX + 15, infoY);
    doc.setFont("Helvetica", "normal");
    doc.text(formatearEstado(cotizacion?.estado), marginX + 120, infoY);

    infoY += 18;
    doc.setFont("Helvetica", "bold");
    doc.text("Fecha:", marginX + 15, infoY);
    doc.setFont("Helvetica", "normal");
    doc.text(new Date(cotizacion?.fecha).toLocaleString(), marginX + 120, infoY);

    y += 115;

    const body = detalle.map((d) => {
      const cantidad = Number(d.cantidad || 0);
      const subtotalLocal = Number(d.subtotal || 0);
      const unit = cantidad > 0 ? subtotalLocal / cantidad : 0;

      return [
        `${d.tipo === "equipo" ? "Equipo" : "Producto"} - ${d.nombre || "-"}`,
        cantidad,
        formatRD(unit),
        formatRD(subtotalLocal),
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [["Concepto", "Cant.", "Precio", "Subtotal"]],
      body,
      theme: "striped",
      styles: { fontSize: 11, cellPadding: 6 },
      headStyles: { fillColor: primary, textColor: "#FFFFFF", fontStyle: "bold" },
      alternateRowStyles: { fillColor: "#f0f8f8" },
    });

    const endY = doc.lastAutoTable.finalY + 20;

    doc.setFillColor("#FFFFFF");
    doc.roundedRect(marginX, endY, usableW, 130, 6, 6, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(dark);

    let ty = endY + 25;

    doc.text("Subtotal:", marginX + 20, ty);
    doc.text(formatRD(subtotal), marginX + usableW - 20, ty, { align: "right" });

    ty += 20;
    doc.text("Descuento:", marginX + 20, ty);
    doc.text(`${formatRD(descuentoMonto)} (${descuentoPct}%)`, marginX + usableW - 20, ty, {
      align: "right",
    });

    ty += 20;
    doc.text("ITBIS (18%):", marginX + 20, ty);
    doc.text(formatRD(itbis), marginX + usableW - 20, ty, { align: "right" });

    ty += 30;
    doc.setFontSize(16);
    doc.setTextColor(primary);
    doc.text("TOTAL:", marginX + 20, ty);
    doc.text(formatRD(total), marginX + usableW - 20, ty, { align: "right" });

    return doc;
  }

  async function handleDescargar(tipoDoc = "cotizacion") {
    try {
      const logo = await cargarLogoRobustoPng();
      const pdf = construirPDF(logo, tipoDoc);
      pdf.save(`${tipoDoc}_${cotizacion?.id}.pdf`);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo generar el PDF. Verifica el logo en /public o el contenido.", "error");
    }
  }

  // ------------- EDICIÓN (solo admin) -------------
  function actualizarLinea(index, campo, valor) {
    setEditDetalle((prev) => prev.map((it, i) => (i === index ? { ...it, [campo]: valor } : it)));
  }

  async function guardarEdicion() {
    if (!cotizacion) return;

    if (!allowEdit) {
      Swal.fire("Bloqueado", "El rol vendedor no puede editar cotizaciones.", "warning");
      return;
    }

    // ✅ Si ya está en preparación/aceptada, bloquea edición
    if (cotizacion.estado === "aceptada" || cotizacion.estado === "preparacion") {
      Swal.fire("No editable", "No se puede editar una cotización enviada a almacén.", "warning");
      return;
    }

    let newSubtotal = 0;

    for (const it of editDetalle) {
      const row = detalle.find((d) =>
        it.tipo === "producto" ? d.producto_id === it.item_id : d.equipo_id === it.item_id
      );
      const precioBase = Number(row?.precio_base_snapshot || row?.item?.precio || 0);
      const extra = Number(it.extra_unitario || 0);
      const unit = precioBase + extra;
      const cant = Number(it.cantidad || 1);
      newSubtotal += unit * cant;
    }

    const descPct = Number(editDescuento || 0);
    const descuentoM = (newSubtotal * descPct) / 100;
    const totalLocal = newSubtotal - descuentoM + (newSubtotal - descuentoM) * 0.18;

    const { error: errUpdate } = await supabase
      .from("cotizaciones")
      .update({ descuento: descPct, total: totalLocal })
      .eq("id", Number(id));

    if (errUpdate) {
      console.error(errUpdate);
      Swal.fire("Error", "No se pudo actualizar la cotización.", "error");
      return;
    }

    await supabase.from("detalle_cotizacion").delete().eq("cotizacion_id", Number(id));

    const inserts = editDetalle.map((it) => {
      const row = detalle.find((d) =>
        it.tipo === "producto" ? d.producto_id === it.item_id : d.equipo_id === it.item_id
      );
      const precioBase = Number(row?.precio_base_snapshot || row?.item?.precio || 0);
      const extra = Number(it.extra_unitario || 0);
      const unit = precioBase + extra;
      const cant = Number(it.cantidad || 1);

      return {
        cotizacion_id: Number(id),
        cantidad: cant,
        precio_base_snapshot: precioBase,
        extra_unitario: extra,
        precio_unitario: unit,
        subtotal: unit * cant,
        producto_id: it.tipo === "producto" ? it.item_id : null,
        equipo_id: it.tipo === "equipo" ? it.item_id : null,
      };
    });

    const { error: errIns } = await supabase.from("detalle_cotizacion").insert(inserts);
    if (errIns) {
      console.error(errIns);
      Swal.fire("Error", "No se pudo guardar el detalle editado.", "error");
      return;
    }

    Swal.fire("Cambios guardados", "La cotización fue actualizada.", "success");
    setEditMode(false);
    await fetchCotizacionYDetalle();
  }

  if (!cotizacion) return <p style={{ padding: "2rem" }}>Cargando...</p>;

  const clienteUI = clienteRef ? labelCliente(clienteRef) : cotizacion.cliente || "-";
  const docUI = clienteRef
    ? clienteRef.tipo_cliente === "empresa"
      ? clienteRef.empresa_rnc
      : clienteRef.cedula
    : preventa?.tipo_cliente === "empresa"
    ? preventa?.empresa_rnc
    : preventa?.cedula;

  return (
    <Wrapper>
      <Card>
        <Title>{EMPRESA.nombre}</Title>
        <p style={{ textAlign: "center", opacity: 0.8 }}>
          {formatearEstado(cotizacion.estado)} — #{cotizacion.id}
        </p>

        <SectionTitle>Información</SectionTitle>

        <InfoRow>
          <span>
            <Strong>Cliente:</Strong>
          </span>
          <span style={{ textAlign: "right" }}>{clienteUI}</span>
        </InfoRow>

        <InfoRow>
          <span>
            <Strong>Documento:</Strong>
          </span>
          <span style={{ textAlign: "right" }}>{textoSeguro(docUI) || "-"}</span>
        </InfoRow>

        {cotizacion.preventa_id && (
          <InfoRow>
            <span>
              <Strong>Preventa vinculada:</Strong>
            </span>
            <span>#{cotizacion.preventa_id}</span>
          </InfoRow>
        )}

        <InfoRow>
          <span>
            <Strong>Estado:</Strong>
          </span>
          <span>
            <EstadoBadge $estado={cotizacion.estado || "pendiente"}>
              ● {formatearEstado(cotizacion.estado)}
            </EstadoBadge>
          </span>
        </InfoRow>

<ActionsBar>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
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
            Enviar al Almacen
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
            Rechazar
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
            Pendiente
          </button>

          <button
            onClick={() => setEditMode((p) => !p)}
            style={{
              background: allowEdit ? "#00bcd4" : "#999",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: allowEdit ? "pointer" : "not-allowed",
              fontWeight: 600,
            }}
            disabled={!allowEdit}
            title={!allowEdit ? "Vendedor no puede editar" : ""}
          >
            {editMode ? "Cancelar edición" : "Editar"}
          </button>
        </div>

        <InfoRow>
          <span>
            <Strong>Fecha:</Strong>
          </span>
          <span>{cotizacion.fecha ? new Date(cotizacion.fecha).toLocaleString() : "-"}</span>
        </InfoRow>
        </ActionsBar>

        <SectionTitle>Items Cotizados</SectionTitle>
<TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Concepto</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((d, i) => {
              const cant = Number(d.cantidad || 0);
              const sub = Number(d.subtotal || 0);
              const unit = cant > 0 ? sub / cant : 0;

              return (
                <tr key={i}>
                  <td>{d.tipo}</td>
                  <td>
                    {d.nombre || "-"}
                    {d.modelo ? <div style={{ fontSize: 12, opacity: 0.8 }}>Modelo: {d.modelo}</div> : null}
                    {d.producto_id != null || d.equipo_id != null ? (
                      <div style={{ fontSize: 12, opacity: 0.75 }}>
                        Ref: {d.producto_id != null ? `P-${d.producto_id}` : `E-${d.equipo_id}`}
                      </div>
                    ) : null}
                  </td>
                  <td>{cant}</td>
                  <td>{formatRD(unit)}</td>
                  <td>{formatRD(sub)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
</TableWrap>
        {editMode && (
          <>
            <SectionTitle>Editar (cantidades / extra / descuento)</SectionTitle>

            <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>
              No se permite editar cotizaciones aceptadas o enviadas a almacén. El rol vendedor no puede editar.
            </p>

            {editDetalle.map((it, idx) => {
              const row = detalle.find((d) =>
                it.tipo === "producto" ? d.producto_id === it.item_id : d.equipo_id === it.item_id
              );

              const nombre =
                row?.nombre || (it.tipo === "producto" ? `Producto #${it.item_id}` : `Equipo #${it.item_id}`);

              return (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr 1fr 1fr",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <div>{it.tipo}</div>
                  <div>{nombre}</div>

                  <input
                    type="number"
                    min="1"
                    value={it.cantidad}
                    onChange={(e) => actualizarLinea(idx, "cantidad", Number(e.target.value))}
                    style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #ccc" }}
                  />

                  <input
                    type="number"
                    value={it.extra_unitario}
                    onChange={(e) => actualizarLinea(idx, "extra_unitario", Number(e.target.value))}
                    style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    placeholder="extra"
                  />
                </div>
              );
            })}

            <div style={{ marginTop: "1rem" }}>
              <label>Descuento (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editDescuento}
                onChange={(e) => setEditDescuento(e.target.value === "" ? 0 : Number(e.target.value))}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
              />
            </div>

            <Button onClick={guardarEdicion}>Guardar cambios</Button>
          </>
        )}

        <SectionTitle>Totales</SectionTitle>

        <TotalBox>
          <TotalRow>
            <span>Subtotal:</span>
            <Strong>{formatRD(subtotal)}</Strong>
          </TotalRow>
          <TotalRow>
            <span>Descuento:</span>
            <Strong>
              {formatRD(descuentoMonto)} ({descuentoPct}%)
            </Strong>
          </TotalRow>
          <TotalRow>
            <span>ITBIS (18%):</span>
            <Strong>{formatRD(itbis)}</Strong>
          </TotalRow>
          <TotalRow>
            <span style={{ fontSize: "1.2rem" }}>TOTAL:</span>
            <Strong style={{ fontSize: "1.2rem" }}>{formatRD(total)}</Strong>
          </TotalRow>
        </TotalBox>

        <div style={{ marginTop: "0.5rem" }}>
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
        </div>
      </Card>
    </Wrapper>
  );
}
