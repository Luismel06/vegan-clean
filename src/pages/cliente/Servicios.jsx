// src/pages/cliente/Servicios.jsx
import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import emailjs from "emailjs-com";
import { supabase } from "../../supabase/supabase.config";

// ===================== ESTILOS =====================
const Container = styled.section`
  background: ${({ theme }) => theme.background};
  width: 100%;
  min-height: 100vh;
  color: ${({ theme }) => theme.text};
  padding: 6rem 1rem 5.5rem; /* espacio sticky bar */
  text-align: center;
`;

const Title = styled.h2`
  margin: 0 0 1rem;
  color: ${({ theme }) => theme.accent};
`;

const CardShell = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

/* ---- Consulta de caso ---- */
const CaseCard = styled.div`
  max-width: 1000px;
  margin: 0 auto 2rem;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  padding: 1.3rem 1.5rem;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  text-align: left;
`;

const CaseTitle = styled.h3`
  margin: 0 0 0.4rem;
  color: ${({ theme }) => theme.accent};
  font-size: 1rem;
`;

const CaseForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.4rem;
`;

const CaseInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.7rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const CaseButton = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #000000;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  &:hover {
    opacity: 0.9;
  }
`;

const CaseResultBox = styled.div`
  margin-top: 0.9rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.inputBackground || "rgba(0,0,0,0.06)"};
  font-size: 0.9rem;
`;

const CaseRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin: 0.2rem 0;
  span:first-child {
    font-weight: 600;
  }
`;

const CaseStatusTag = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ $estado }) =>
    $estado === "Completado" || $estado === "Finalizado"
      ? "rgba(46, 204, 113, 0.18)"
      : $estado === "En progreso" || $estado === "En proceso"
      ? "rgba(26, 188, 156, 0.18)"
      : $estado === "Requiere reprogramación"
      ? "rgba(243, 156, 18, 0.18)"
      : $estado === "Cliente no se encontraba" || $estado === "Cancelado"
      ? "rgba(231, 76, 60, 0.18)"
      : "rgba(241, 196, 15, 0.18)"};
  color: ${({ $estado }) =>
    $estado === "Completado" || $estado === "Finalizado"
      ? "#27ae60"
      : $estado === "En progreso" || $estado === "En proceso"
      ? "#16a085"
      : $estado === "Requiere reprogramación"
      ? "#e67e22"
      : $estado === "Cliente no se encontraba" || $estado === "Cancelado"
      ? "#c0392b"
      : "#b7950b"};
`;

/* ---- Tabs ---- */
const Tabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
`;

const TabButton = styled.button`
  background-color: ${({ $active, theme }) =>
    $active ? theme.accent : theme.cardBackground};
  color: ${({ $active, theme }) => ($active ? "#ffffff" : "#9fca95")};
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.92;
  }
`;

/* ---- Contenido ---- */
const Content = styled(motion.div)`
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 16px;
  padding: 1.4rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: left;
`;

const SectionHead = styled.div`
  margin-bottom: 0.9rem;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.accent};
  }

  p {
    margin: 0.35rem 0 0;
    font-size: 0.85rem;
    opacity: 0.85;
  }
`;

/* ---- Catálogo ---- */
const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin: 0.8rem 0 1rem;
`;

const SelectFilter = styled.select`
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: #129508;
  font-size: 0.9rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
`;

/* === IMAGEN CON EFECTO "ZOOM OUT / FULL VIEW" === */
const ImgWrap = styled.div`
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.08);
`;

/* Capa A: cover (default) */
const ImgCover = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1);
  opacity: 1;
  transition: transform 320ms ease, opacity 220ms ease, filter 320ms ease;
`;

/* Capa B: contain (muestra completa) */
const ImgContain = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transform: scale(0.98);
  opacity: 0;
  transition: transform 320ms ease, opacity 220ms ease;
`;

/* ---- Tarjeta ---- */
const ProductCard = styled.div`
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.background};
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border 0.15s ease;

  ${({ $selected, theme }) =>
    $selected
      ? `
    border: 2px solid ${theme.accent};
    box-shadow: 0 0 0 3px rgba(0, 160, 255, 0.18);
  `
      : ""}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }

  /* hover: cambia a "ver completa" */
  &:hover ${ImgCover} {
    opacity: 0;
    transform: scale(1.08);
    filter: saturate(1.05) contrast(1.05);
  }

  &:hover ${ImgContain} {
    opacity: 1;
    transform: scale(1);
  }
`;

const ProductBody = styled.div`
  padding: 0.9rem 0.95rem 1rem;
`;

const ProductTitle = styled.h4`
  margin: 0 0 0.25rem;
  color: ${({ theme }) => theme.accent};
  font-weight: 900;
`;

const ProductDesc = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.86rem;
  opacity: 0.9;
  line-height: 1.35;
`;

const ProductTag = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.inputBackground || "rgba(0,0,0,0.06)"};
  margin-right: 0.35rem;
  margin-bottom: 0.25rem;
`;

/* ---- Cantidades ---- */
const QtyRow = styled.div`
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
`;

const QtyControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

const QtyBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: #16a34a;
  cursor: pointer;
  font-weight: 900;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.92;
  }
`;

const QtyInput = styled.input`
  width: 64px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: #16a34a;
  text-align: center;
  font-weight: 900;
  outline: none;
`;

const AddBtn = styled.button`
  border: none;
  border-radius: 10px;
  padding: 0.65rem 0.95rem;
  font-weight: 900;
  cursor: pointer;
  background: ${({ theme }) => theme.accent};
  color: #000;

  &:hover {
    opacity: 0.92;
  }
`;

/* ---- Form cotización ---- */
const FormPanel = styled(motion.form)`
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.85rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  resize: none;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #000000;
  border: none;
  padding: 0.95rem 1.6rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 900;
  transition: 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

const TipoClienteRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  align-items: center;

  label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
  }
`;

/* ---- Sticky bar ---- */
const StickyBar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.9rem 1rem;
  background: rgba(10, 14, 18, 0.75);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  z-index: 999;
`;

const StickyInner = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 0.8rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const SelectedCount = styled.div`
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;

  span {
    color: ${({ theme }) => theme.accent};
  }
`;

const StickyActions = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const ClearBtn = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: transparent;
  color: #fff;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.92;
  }
`;

const QuoteBtn = styled.button`
  border: none;
  background: ${({ theme }) => theme.accent};
  color: #000;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.92;
  }
`;

// ===================== HELPERS =====================
const makeKey = (tipo, id) => `${tipo}:${id}`;
const isUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);

const getImageUrl = (bucket, imagen_url) => {
  if (!imagen_url) return "";
  if (isUrl(imagen_url)) return imagen_url;
  const { data } = supabase.storage.from(bucket).getPublicUrl(imagen_url);
  return data?.publicUrl || "";
};

// ===================== COMPONENTE =====================
export default function Servicios() {
  const [tab, setTab] = useState("productos"); // productos | equipos

  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [categoriaFiltroProd, setCategoriaFiltroProd] = useState("");
  const [marcaFiltroProd, setMarcaFiltroProd] = useState("");

  const [equipos, setEquipos] = useState([]);
  const [loadingEquipos, setLoadingEquipos] = useState(false);
  const [categoriaFiltroEq, setCategoriaFiltroEq] = useState("");
  const [marcaFiltroEq, setMarcaFiltroEq] = useState("");

  const [carrito, setCarrito] = useState({});

  const [mostrarFormularioCot, setMostrarFormularioCot] = useState(false);
  const [tipoCliente, setTipoCliente] = useState("persona"); // persona | empresa

  const [caseNumero, setCaseNumero] = useState("");
  const [caseResult, setCaseResult] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);

  // ========= CARGAR PRODUCTOS =========
  useEffect(() => {
    const fetchProductos = async () => {
      setLoadingProductos(true);

      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, descripcion, categoria, marca, modelo, proveedor, precio, imagen_url")
        .order("id", { ascending: true });

      if (error) {
        console.error("❌ Error al cargar productos:", error);
        setProductos([]);
      } else {
        const mapped = (data || []).map((p) => ({
          ...p,
          _img: getImageUrl("productos", p.imagen_url),
          _brand: p.marca || p.proveedor || "Sin marca",
          _cat: p.categoria || "Otros",
        }));
        setProductos(mapped);
      }

      setLoadingProductos(false);
    };

    fetchProductos();
  }, []);

  // ========= CARGAR EQUIPOS =========
  useEffect(() => {
    const fetchEquipos = async () => {
      setLoadingEquipos(true);

      const { data, error } = await supabase
        .from("equipos")
        .select("id, nombre, descripcion, categoria, marca, modelo, proveedor, precio, imagen_url")
        .order("id", { ascending: true });

      if (error) {
        console.error("❌ Error al cargar equipos:", error);
        setEquipos([]);
      } else {
        const mapped = (data || []).map((e) => ({
          ...e,
          _img: getImageUrl("equipos", e.imagen_url),
          _brand: e.marca || e.proveedor || "Sin marca",
          _cat: e.categoria || "Otros",
        }));
        setEquipos(mapped);
      }

      setLoadingEquipos(false);
    };

    fetchEquipos();
  }, []);

  // No borres carrito al cambiar tab
  useEffect(() => {
    setMostrarFormularioCot(false);
  }, [tab]);

  // ========= CARRITO OPS =========
  const addOne = (tipo, item) => {
    const key = makeKey(tipo, item.id);
    setCarrito((prev) => {
      const current = prev[key];
      const qty = (current?.qty || 0) + 1;
      return { ...prev, [key]: { tipo, ...item, qty } };
    });
  };

  const removeOne = (tipo, id) => {
    const key = makeKey(tipo, id);
    setCarrito((prev) => {
      const current = prev[key];
      if (!current) return prev;
      const nextQty = (current.qty || 0) - 1;
      if (nextQty <= 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { ...current, qty: nextQty } };
    });
  };

  const setQty = (tipo, item, qtyValue) => {
    const qty = Math.max(0, Number(qtyValue || 0));
    const key = makeKey(tipo, item.id);
    setCarrito((prev) => {
      if (qty === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { tipo, ...item, qty } };
    });
  };

  const clearCarrito = () => {
    setCarrito({});
    setMostrarFormularioCot(false);
  };

  const carritoItems = useMemo(() => Object.values(carrito), [carrito]);
  const selectedDistinct = carritoItems.length;
  const selectedCount = carritoItems.reduce((acc, it) => acc + (it.qty || 0), 0);

  // ========= FILTROS (por tab) =========
  const currentData = tab === "productos" ? productos : equipos;
  const loadingCurrent = tab === "productos" ? loadingProductos : loadingEquipos;

  const categoriaFiltro = tab === "productos" ? categoriaFiltroProd : categoriaFiltroEq;
  const marcaFiltro = tab === "productos" ? marcaFiltroProd : marcaFiltroEq;

  const setCategoriaFiltro = (v) => {
    if (tab === "productos") {
      setCategoriaFiltroProd(v);
      setMarcaFiltroProd("");
    } else {
      setCategoriaFiltroEq(v);
      setMarcaFiltroEq("");
    }
  };

  const setMarcaFiltro = (v) => {
    if (tab === "productos") setMarcaFiltroProd(v);
    else setMarcaFiltroEq(v);
  };

  const categorias = useMemo(() => {
    return Array.from(new Set((currentData || []).map((p) => p._cat || "Otros")));
  }, [currentData]);

  const marcas = useMemo(() => {
    return Array.from(
      new Set(
        (currentData || [])
          .filter((p) => (categoriaFiltro ? (p._cat || "Otros") === categoriaFiltro : true))
          .map((p) => p._brand || "Sin marca")
      )
    );
  }, [currentData, categoriaFiltro]);

  const filtrados = useMemo(() => {
    return (currentData || []).filter((p) => {
      const cat = p._cat || "Otros";
      const brand = p._brand || "Sin marca";
      if (categoriaFiltro && cat !== categoriaFiltro) return false;
      if (marcaFiltro && brand !== marcaFiltro) return false;
      return true;
    });
  }, [currentData, categoriaFiltro, marcaFiltro]);

  // ========= CONSULTA DE CASO =========
  const handleBuscarCaso = async (e) => {
    e.preventDefault();
    const valor = caseNumero.trim();
    if (!valor) {
      Swal.fire({
        icon: "info",
        title: "Ingresa tu número de caso",
        text: "Ejemplo: CASE-123456",
        confirmButtonColor: "#0591e9",
      });
      return;
    }

    setCaseLoading(true);
    setCaseResult(null);

    try {
      let { data, error } = await supabase
        .from("solicitudes")
        .select("*, servicios(nombre)")
        .eq("numero_caso", valor)
        .maybeSingle();

      if ((!data || error) && /^[0-9]+$/.test(valor)) {
        const idNum = Number(valor);
        const resp = await supabase
          .from("solicitudes")
          .select("*, servicios(nombre)")
          .eq("id", idNum)
          .maybeSingle();
        data = resp.data;
      }

      if (!data) {
        setCaseResult({ notFound: true });
      } else {
        const estadoFinal = data.estado_solicitud || data.estado || "Agendado";
        setCaseResult({
          numero_caso: data.numero_caso || `CASE-${data.id}`,
          cliente: data.cliente,
          servicio_nombre: data.servicios?.nombre || "No especificado",
          estado: estadoFinal,
          fecha_creacion: data.fecha ? new Date(data.fecha).toLocaleString() : "-",
          fecha_agendada: data.fecha_agendada ? new Date(data.fecha_agendada).toLocaleDateString() : "-",
          hora_agendada: data.hora_agendada || "-",
          vendedor: data.vendedor_asignado || "Pendiente de asignar",
          direccion: data.direccion || "-",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al consultar el caso",
        text: "Intenta nuevamente en unos minutos.",
        confirmButtonColor: "#0591e9",
      });
    } finally {
      setCaseLoading(false);
    }
  };

  // ========= COTIZACIÓN =========
  const itemsTexto = useMemo(() => {
    if (!carritoItems.length) return "";
    return carritoItems
      .map((x) => {
        const tipoLabel = x.tipo === "producto" ? "Producto" : "Equipo";
        return `• (${tipoLabel}) ${x.nombre} x${x.qty}${x.modelo ? ` - ${x.modelo}` : ""}`;
      })
      .join("\n");
  }, [carritoItems]);

  const handleSubmitCotizacion = async (e) => {
    e.preventDefault();

    if (carritoItems.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Selecciona al menos un item",
        text: "Agrega productos/equipos antes de solicitar cotización.",
        confirmButtonColor: "#0591e9",
      });
      return;
    }

    const cliente = e.target.cliente.value.trim();
    const email = e.target.email.value.trim();
    const telefono = e.target.telefono.value.trim();
    const direccion = e.target.direccion.value.trim();
    const nota = e.target.nota.value.trim();

    const cedula = tipoCliente === "persona" ? (e.target.cedula?.value || "").trim() : null;
    const empresa_nombre = tipoCliente === "empresa" ? (e.target.empresa_nombre?.value || "").trim() : null;
    const empresa_rnc = tipoCliente === "empresa" ? (e.target.empresa_rnc?.value || "").trim() : null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Correo electrónico no válido",
        text: "Por favor, introduce un correo electrónico válido (ejemplo@dominio.com).",
        confirmButtonColor: "#0591e9",
      });
      return;
    }

    if (!direccion) {
      Swal.fire({
        icon: "warning",
        title: "Dirección requerida",
        text: "Por favor, indica tu dirección para fines de entrega/instalación.",
        confirmButtonColor: "#0591e9",
      });
      return;
    }

    try {
      await emailjs.send(
        "service_kfvhwxq",
        "template_iy48pw3",
        {
          tipo_cliente: tipoCliente,
          cliente,
          email,
          telefono,
          direccion,
          cedula: cedula || "",
          empresa_nombre: empresa_nombre || "",
          empresa_rnc: empresa_rnc || "",
          items: itemsTexto,
          nota: nota || "",
        },
        "yoOeYAk8XPOIvEhbf"
      );

      Swal.fire({
        icon: "success",
        title: "Solicitud de cotización enviada",
        html: `
          <p>Recibimos tu solicitud.</p>
          <p style="margin-top:8px;"><strong>Items:</strong></p>
          <pre style="text-align:left; white-space:pre-wrap; margin:0; padding:10px; background:#f3f6ff; border-radius:10px;">${itemsTexto}</pre>
        `,
        confirmButtonColor: "#0591e9",
      });

      e.target.reset();
      setMostrarFormularioCot(false);
      setTipoCliente("persona");
    } catch (error) {
      console.error("❌ Error enviando cotización:", error);
      Swal.fire({
        icon: "error",
        title: "Error al enviar",
        text: "Intenta nuevamente más tarde.",
        confirmButtonColor: "#0591e9",
      });
    }
  };

  const tipoActual = tab === "productos" ? "producto" : "equipo";

  return (
    <Container>
      {/* Consulta de caso */}
      <CaseCard>
        <CaseTitle>Consulta el estado de tu caso</CaseTitle>
        <p style={{ fontSize: "0.85rem", opacity: 0.8, margin: 0 }}>
          Ingresa el número de caso que recibiste por correo (ej:{" "}
          <strong>CASE-123456</strong>) para ver su estado actual.
        </p>

        <CaseForm onSubmit={handleBuscarCaso}>
          <CaseInput
            placeholder="Ej: CASE-123456"
            value={caseNumero}
            onChange={(e) => setCaseNumero(e.target.value)}
          />
          <CaseButton type="submit">
            {caseLoading ? "Buscando..." : "Ver estado"}
          </CaseButton>
        </CaseForm>

        {caseResult && (
          <CaseResultBox>
            {caseResult.notFound ? (
              <div style={{ fontSize: "0.9rem" }}>
                No encontramos un caso con ese número. Verifica que lo hayas escrito correctamente.
              </div>
            ) : (
              <>
                <CaseRow>
                  <span>Número de caso:</span>
                  <span>{caseResult.numero_caso}</span>
                </CaseRow>
                <CaseRow>
                  <span>Cliente:</span>
                  <span>{caseResult.cliente}</span>
                </CaseRow>
                <CaseRow>
                  <span>Servicio:</span>
                  <span>{caseResult.servicio_nombre}</span>
                </CaseRow>
                <CaseRow>
                  <span>Estado:</span>
                  <span>
                    <CaseStatusTag $estado={caseResult.estado}>● {caseResult.estado}</CaseStatusTag>
                  </span>
                </CaseRow>
                <CaseRow>
                  <span>Creado:</span>
                  <span>{caseResult.fecha_creacion}</span>
                </CaseRow>
                <CaseRow>
                  <span>Fecha agendada:</span>
                  <span>{caseResult.fecha_agendada}</span>
                </CaseRow>
                <CaseRow>
                  <span>Hora agendada:</span>
                  <span>{caseResult.hora_agendada}</span>
                </CaseRow>
                <CaseRow>
                  <span>Técnico asignado:</span>
                  <span>{caseResult.vendedor}</span>
                </CaseRow>
                <CaseRow>
                  <span>Dirección:</span>
                  <span>{caseResult.direccion}</span>
                </CaseRow>
              </>
            )}
          </CaseResultBox>
        )}
      </CaseCard>

      <CardShell>
        {/* Tabs */}
        <Tabs>
          <TabButton $active={tab === "productos"} onClick={() => setTab("productos")}>
            Productos
          </TabButton>
          <TabButton $active={tab === "equipos"} onClick={() => setTab("equipos")}>
            Equipos
          </TabButton>
        </Tabs>

        <Content initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SectionHead>
            <h3>{tab === "productos" ? "Productos" : "Equipos"}</h3>
            <p>
              Selecciona cantidades y luego pulsa <strong>Solicitar cotización</strong>.
            </p>
          </SectionHead>

          {/* Filtros */}
          <FiltersRow>
            <SelectFilter value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectFilter>

            <SelectFilter value={marcaFiltro} onChange={(e) => setMarcaFiltro(e.target.value)}>
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </SelectFilter>
          </FiltersRow>

          {/* Grid */}
          {loadingCurrent ? (
            <p>Cargando {tab}...</p>
          ) : filtrados.length === 0 ? (
            <p>No hay {tab} publicados por el momento.</p>
          ) : (
            <ProductGrid>
              {filtrados.map((p) => {
                const key = makeKey(tipoActual, p.id);
                const qty = carrito[key]?.qty || 0;

                const imgSrc = p._img || "/placeholder-product.png";

                return (
                  <ProductCard key={p.id} $selected={qty > 0}>
                    <ImgWrap>
                      <ImgCover
                        src={imgSrc}
                        alt={p.nombre}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.png";
                        }}
                      />
                      <ImgContain
                        src={imgSrc}
                        alt={p.nombre}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.png";
                        }}
                      />
                    </ImgWrap>

                    <ProductBody>
                      <ProductTitle>{p.nombre}</ProductTitle>

                      <div style={{ marginBottom: "0.35rem" }}>
                        {p._cat && <ProductTag>{p._cat}</ProductTag>}
                        {p._brand && <ProductTag>{p._brand}</ProductTag>}
                      </div>

                      {p.descripcion && <ProductDesc>{p.descripcion}</ProductDesc>}

                      {p.modelo && (
                        <div style={{ fontSize: "0.82rem", opacity: 0.85, marginTop: "0.35rem" }}>
                          Modelo: {p.modelo}
                        </div>
                      )}

                      <QtyRow>
                        <QtyControls>
                          <QtyBtn
                            type="button"
                            onClick={() => removeOne(tipoActual, p.id)}
                            disabled={qty === 0}
                            title="Quitar"
                          >
                            −
                          </QtyBtn>

                          <QtyInput
                            type="number"
                            min="0"
                            value={qty}
                            onChange={(e) => setQty(tipoActual, p, e.target.value)}
                          />

                          <QtyBtn type="button" onClick={() => addOne(tipoActual, p)} title="Agregar">
                            +
                          </QtyBtn>
                        </QtyControls>

                        <AddBtn type="button" onClick={() => addOne(tipoActual, p)}>
                          Agregar
                        </AddBtn>
                      </QtyRow>
                    </ProductBody>
                  </ProductCard>
                );
              })}
            </ProductGrid>
          )}

          {/* Form cotización */}
          <AnimatePresence>
            {mostrarFormularioCot && (
              <FormPanel
                onSubmit={handleSubmitCotizacion}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>
                  Estás solicitando cotización para:{" "}
                  <span style={{ color: "#0591e9" }}>
                    {carritoItems.map((x) => `${x.nombre} x${x.qty}`).join(", ")}
                  </span>
                </div>

                <TipoClienteRow>
                  <span style={{ fontWeight: 700 }}>¿Quién solicita la cotización?</span>

                  <label>
                    <input
                      type="radio"
                      name="tipo_cliente"
                      value="persona"
                      checked={tipoCliente === "persona"}
                      onChange={() => setTipoCliente("persona")}
                    />
                    Persona
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="tipo_cliente"
                      value="empresa"
                      checked={tipoCliente === "empresa"}
                      onChange={() => setTipoCliente("empresa")}
                    />
                    Empresa
                  </label>
                </TipoClienteRow>

                {tipoCliente === "persona" && (
                  <Input name="cedula" placeholder="Cédula (ej: 001-1234567-8)" required />
                )}

                {tipoCliente === "empresa" && (
                  <>
                    <Input name="empresa_nombre" placeholder="Nombre o razón social de la empresa" required />
                    <Input name="empresa_rnc" placeholder="RNC / Identificación fiscal" required />
                  </>
                )}

                <Input name="cliente" placeholder="Tu nombre completo" required />
                <Input name="email" type="email" placeholder="Tu correo electrónico" required />
                <Input name="telefono" placeholder="Tu número de teléfono" required />
                <Input name="direccion" placeholder="Dirección" required />

                <TextArea name="nota" rows="3" placeholder="Notas (opcional): entrega, detalles, etc." />

                <Button type="submit">Enviar solicitud de cotización</Button>
              </FormPanel>
            )}
          </AnimatePresence>
        </Content>
      </CardShell>

      {/* Sticky bar */}
      <StickyBar>
        <StickyInner>
          <SelectedCount>
            Items: <span>{selectedDistinct}</span> · Unidades: <span>{selectedCount}</span>
          </SelectedCount>

          <StickyActions>
            <ClearBtn type="button" onClick={clearCarrito} disabled={selectedDistinct === 0}>
              Limpiar
            </ClearBtn>

            <QuoteBtn
              type="button"
              disabled={selectedDistinct === 0}
              onClick={() => setMostrarFormularioCot((v) => !v)}
            >
              {mostrarFormularioCot ? "Cerrar" : "Solicitar cotización"}
            </QuoteBtn>
          </StickyActions>
        </StickyInner>
      </StickyBar>
    </Container>
  );
}
