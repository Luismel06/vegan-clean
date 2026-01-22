// src/pages/vendedor/VendedorCatalogo.jsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { loadCart, saveCart, clearCart } from "../../shared/cartStorage.js";
import { Search, SlidersHorizontal, X, ShoppingCart } from "lucide-react";

const Wrap = styled.section`
  padding: 1.6rem 2rem;
  color: ${({ theme }) => theme.text};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 900px) {
    padding: 1rem;
  }

  /* Para que el sticky del carrito funcione bien dentro del layout */
  min-height: calc(100vh - 90px);
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const Title = styled.h2`
  margin: 0;
  font-weight: 1000;
  color: ${({ theme }) => theme.accent};
`;

const Sub = styled.div`
  opacity: 0.82;
  font-size: 0.92rem;
  line-height: 1.35;
  margin-top: 6px;
`;

const RightControls = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ $active, theme }) => ($active ? theme.accent : theme.cardBackground)};
  color: ${({ $active, theme }) => ($active ? "#000" : theme.text)};
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  font-weight: 1000;
  cursor: pointer;
  transition: transform 0.12s ease, opacity 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }
`;

const Btn = styled.button`
  border: none;
  border-radius: 12px;
  padding: 0.65rem 0.95rem;
  font-weight: 1000;
  cursor: pointer;
  background: ${({ theme }) => theme.accent};
  color: #000;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: transform 0.12s ease, opacity 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Secondary = styled(Btn)`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const ControlsBar = styled.div`
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 260px;
  display: flex;
  gap: 8px;
  align-items: center;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 0.65rem 0.85rem;

  svg {
    opacity: 0.85;
  }

  input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border-radius: 14px;
  padding: 0.65rem 0.8rem;
  outline: none;
  min-width: 160px;
`;

const FilterPills = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

const Pill = styled.span`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 999px;
  padding: 0.3rem 0.55rem;
  font-size: 12px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  opacity: 0.95;
`;

const PillBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0;
  color: ${({ theme }) => theme.text};

  &:hover {
    opacity: 0.9;
  }
`;

/* ====== Two-column desktop layout (catalog + sticky cart) ====== */
const MainGrid = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 14px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 320px;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* ====== Catalog grid ====== */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  gap: 12px;

  @media (max-width: 1300px) {
    grid-template-columns: repeat(3, minmax(220px, 1fr));
  }
  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.06);
`;

const Img = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: #111;
`;

const Body = styled.div`
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const Name = styled.div`
  font-weight: 1000;
  font-size: 1rem;
`;

const Meta = styled.div`
  opacity: 0.88;
  font-size: 0.9rem;
  line-height: 1.35;
`;

const Price = styled.div`
  font-weight: 1000;
  margin-top: 2px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
`;

const Qty = styled.input`
  width: 74px;
  padding: 0.5rem 0.6rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  outline: none;
`;

/* ====== Cart (sticky) ====== */
const CartPanel = styled.aside`
  position: sticky;
  top: 88px; /* debajo del TopBar sticky del layout */
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 16px;
  padding: 0.95rem 1rem;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.10);

  @media (max-width: 900px) {
    display: none; /* en mobile usamos bottom cart */
  }
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

const CartTitle = styled.div`
  font-weight: 1000;
`;

const CartSub = styled.div`
  margin-top: 4px;
  opacity: 0.86;
  font-size: 0.9rem;
`;

const CartList = styled.div`
  margin-top: 10px;
  display: grid;
  gap: 8px;
  max-height: calc(100vh - 88px - 220px);
  overflow: auto;
  padding-right: 4px;
`;

const CartItem = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 14px;
  padding: 0.7rem 0.8rem;
`;

const CartItemTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
`;

const CartItemName = styled.div`
  font-weight: 1000;
  font-size: 0.92rem;
  line-height: 1.25;
`;

const CartItemMeta = styled.div`
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.8;
`;

const CartItemRight = styled.div`
  text-align: right;
  font-weight: 1000;
  white-space: nowrap;
`;

const RemoveBtn = styled.button`
  margin-top: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  font-weight: 900;
  font-size: 12px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const CartFooter = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

const CartTotal = styled.div`
  font-weight: 1000;
  line-height: 1.2;
  div:nth-child(2) {
    opacity: 0.86;
    font-weight: 900;
    font-size: 0.92rem;
    margin-top: 4px;
  }
`;

/* ====== Mobile bottom cart (always visible) ====== */
const MobileCartBar = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    position: fixed;
    left: 12px;
    right: 12px;

    /* ✅ SUBIDO para NO tapar el BottomNav del layout */
    bottom: calc(12px + 64px + 10px);

    /* ✅ menor que el BottomNav del layout */
    z-index: 1900;

    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 18px;
    padding: 10px 10px;
    gap: 10px;
    align-items: center;
    justify-content: space-between;

    backdrop-filter: blur(18px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    background: ${({ theme }) =>
      theme.name === "dark"
        ? "rgba(18, 18, 18, 0.70)"
        : "rgba(255, 255, 255, 0.70)"};

    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.20);
  }
`;

const MobileCartLeft = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
`;

const MobileCartInfo = styled.div`
  min-width: 0;

  div:first-child {
    font-weight: 1000;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  div:last-child {
    opacity: 0.9;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const MobileCartIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.accent + "14"};
  color: ${({ theme }) => theme.accent};
`;

const MobileActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const MobileSafeSpace = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: block;
    /* ✅ espacio para Carrito + gap + BottomNav + gap */
    height: 170px;
  }
`;

/* ===== helpers ===== */
function formatRD(v) {
  const n = Number(v || 0);
  return `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function cleanDoc(v) {
  return String(v || "").trim();
}
function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}
function safeImg(url) {
  return url && String(url).trim() ? String(url).trim() : "/inicio.png";
}

/** ===== Generar número de caso ===== */
function generarNumeroCaso() {
  const y = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const ts = Date.now().toString().slice(-6);
  return `PV-${y}-${ts}-${rand}`;
}

/** ===== Validación Cédula Dominicana ===== */
function isValidCedulaRD(input) {
  const ced = digitsOnly(input);
  if (ced.length !== 11) return false;

  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    let p = Number(ced[i]) * weights[i];
    if (p >= 10) p = Math.floor(p / 10) + (p % 10);
    sum += p;
  }

  const check = (10 - (sum % 10)) % 10;
  return check === Number(ced[10]);
}

/** ===== Validación RNC (checksum) ===== */
function isValidRNC(input) {
  const r = digitsOnly(input);
  if (r.length !== 9) return false;

  const weights = [7, 9, 8, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 8; i++) sum += Number(r[i]) * weights[i];
  const mod = sum % 11;
  const check = mod === 0 ? 2 : mod === 1 ? 1 : 11 - mod;

  return check === Number(r[8]);
}

async function getMyUid() {
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user?.id) return data.user.id;
  return localStorage.getItem("user_id") || null;
}

function guessDocType(docRaw) {
  const d = digitsOnly(docRaw);
  if (d.length === 11) return "cedula";
  if (d.length === 9) return "rnc";
  return "unknown";
}

async function buscarClientePorDocumento(documento) {
  const doc = cleanDoc(documento);
  const docDigits = digitsOnly(doc);

  const { data: cliCed } = await supabase
    .from("clientes")
    .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion")
    .or(`cedula.eq.${doc},cedula.eq.${docDigits}`)
    .maybeSingle();

  if (cliCed) return cliCed;

  const { data: cliRnc } = await supabase
    .from("clientes")
    .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion")
    .or(`empresa_rnc.eq.${doc},empresa_rnc.eq.${docDigits}`)
    .maybeSingle();

  return cliRnc || null;
}

async function modalCrearCliente({ documento }) {
  const docDigits = digitsOnly(documento);
  const docType = guessDocType(documento);
  const defaultTipo = docType === "rnc" ? "empresa" : "persona";

  const { isConfirmed, value } = await Swal.fire({
    title: "Crear cliente",
    width: 820,
    showCancelButton: true,
    confirmButtonText: "Crear cliente",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    html: `
      <div style="text-align:left; font-size: 13px; opacity:.85; margin-bottom:10px;">
        No existe un cliente con ese documento. Créalo para poder enviar la orden.
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="font-weight:800; display:block; margin-bottom:6px;">Tipo</label>
          <select id="tipo_cliente" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;">
            <option value="persona">persona</option>
            <option value="empresa">empresa</option>
          </select>
        </div>

        <div>
          <label style="font-weight:800; display:block; margin-bottom:6px;">Documento</label>
          <input id="doc" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;"
            value="${docDigits}" />
          <div style="margin-top:6px; font-size:12px; opacity:.75;">
            Persona: cédula (11 dígitos). Empresa: RNC (9 dígitos).
          </div>
        </div>

        <div style="grid-column: 1 / -1;">
          <label style="font-weight:800; display:block; margin-bottom:6px;">Nombre / Razón social</label>
          <input id="nombre" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;" placeholder="Ej: Juan Pérez / Empresa SRL" />
        </div>

        <div>
          <label style="font-weight:800; display:block; margin-bottom:6px;">Teléfono</label>
          <input id="telefono" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;" placeholder="809..." />
        </div>

        <div>
          <label style="font-weight:800; display:block; margin-bottom:6px;">Email</label>
          <input id="email" type="email" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;" placeholder="correo@dominio.com" />
        </div>

        <div style="grid-column: 1 / -1;">
          <label style="font-weight:800; display:block; margin-bottom:6px;">Dirección</label>
          <input id="direccion" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;" placeholder="Dirección del cliente" />
        </div>
      </div>
    `,
    didOpen: () => {
      const tipoEl = document.getElementById("tipo_cliente");
      tipoEl.value = defaultTipo;
    },
    preConfirm: () => {
      const tipo_cliente = document.getElementById("tipo_cliente").value;
      const doc = digitsOnly(document.getElementById("doc").value);
      const nombre = cleanDoc(document.getElementById("nombre").value);
      const telefono = cleanDoc(document.getElementById("telefono").value);
      const email = cleanDoc(document.getElementById("email").value);
      const direccion = cleanDoc(document.getElementById("direccion").value);

      if (!nombre) {
        Swal.showValidationMessage("Debes escribir el nombre / razón social.");
        return null;
      }

      if (tipo_cliente === "persona") {
        if (!isValidCedulaRD(doc)) {
          Swal.showValidationMessage("Cédula inválida. Debe ser de 11 dígitos y válida.");
          return null;
        }
      } else {
        if (!isValidRNC(doc)) {
          Swal.showValidationMessage("RNC inválido. Debe ser de 9 dígitos y válido.");
          return null;
        }
      }

      return { tipo_cliente, doc, nombre, telefono, email, direccion };
    },
  });

  if (!isConfirmed || !value) return null;

  const payload = {
    tipo_cliente: value.tipo_cliente,
    nombre: value.nombre,
    cedula: value.tipo_cliente === "persona" ? value.doc : null,
    empresa_rnc: value.tipo_cliente === "empresa" ? value.doc : null,
    telefono: value.telefono || null,
    email: value.email || null,
    direccion: value.direccion || null,
  };

  const onConflict = value.tipo_cliente === "persona" ? "cedula" : "empresa_rnc";

  const { data, error } = await supabase
    .from("clientes")
    .upsert(payload, { onConflict })
    .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion")
    .single();

  if (error) throw error;
  return data;
}

export default function VendedorCatalogo() {
  const [tab, setTab] = useState("productos");
  const [loading, setLoading] = useState(true);

  const [productos, setProductos] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [cart, setCart] = useState(() => loadCart());
  const [qtyDraft, setQtyDraft] = useState({});

  // search + filters
  const [q, setQ] = useState("");
  const [fCategoria, setFCategoria] = useState("");
  const [fMarca, setFMarca] = useState("");
  const [fOrden, setFOrden] = useState("recientes"); // recientes | precio_asc | precio_desc | nombre_asc

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  async function cargar() {
    try {
      setLoading(true);

      const { data: prods, error: e1 } = await supabase
        .from("productos")
        .select("id, nombre, marca, modelo, categoria, precio, imagen_url")
        .order("id", { ascending: false });
      if (e1) throw e1;

      const { data: eqs, error: e2 } = await supabase
        .from("equipos")
        .select("id, nombre, marca, modelo, categoria, precio, imagen_url")
        .order("id", { ascending: false });
      if (e2) throw e2;

      setProductos(prods || []);
      setEquipos(eqs || []);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo cargar el catálogo.", "error");
    } finally {
      setLoading(false);
    }
  }

  const list = useMemo(() => (tab === "productos" ? productos : equipos), [tab, productos, equipos]);

  const categorias = useMemo(() => {
    const set = new Set();
    for (const it of list) if (it?.categoria) set.add(String(it.categoria).trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [list]);

  const marcas = useMemo(() => {
    const set = new Set();
    for (const it of list) if (it?.marca) set.add(String(it.marca).trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [list]);

  const filtered = useMemo(() => {
    const qq = String(q || "").toLowerCase().trim();

    let arr = (list || []).filter((it) => {
      const hay = [it.nombre, it.marca, it.modelo, it.categoria, `id:${it.id}`]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" | ");

      if (qq && !hay.includes(qq)) return false;
      if (fCategoria && String(it.categoria || "") !== fCategoria) return false;
      if (fMarca && String(it.marca || "") !== fMarca) return false;
      return true;
    });

    if (fOrden === "precio_asc") {
      arr = arr.slice().sort((a, b) => Number(a?.precio || 0) - Number(b?.precio || 0));
    } else if (fOrden === "precio_desc") {
      arr = arr.slice().sort((a, b) => Number(b?.precio || 0) - Number(a?.precio || 0));
    } else if (fOrden === "nombre_asc") {
      arr = arr.slice().sort((a, b) =>
        String(a?.nombre || "").localeCompare(String(b?.nombre || ""), "es")
      );
    }
    return arr;
  }, [list, q, fCategoria, fMarca, fOrden]);

  useEffect(() => {
    setFCategoria("");
    setFMarca("");
    setFOrden("recientes");
    setQ("");
  }, [tab]);

  function keyOf(tipo, id) {
    return `${tipo}-${id}`;
  }

  function addToCart(tipo, item) {
    const k = keyOf(tipo, item.id);
    const qty = Math.max(1, Number(qtyDraft[k] || 1));

    setCart((prev) => {
      const idx = prev.findIndex((x) => x.tipo === tipo && x.item_id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], cantidad: copy[idx].cantidad + qty };
        return copy;
      }
      return [
        ...prev,
        {
          tipo,
          item_id: item.id,
          nombre: item.nombre,
          marca: item.marca,
          modelo: item.modelo,
          categoria: item.categoria,
          precio: Number(item.precio || 0),
          imagen_url: item.imagen_url,
          cantidad: qty,
        },
      ];
    });

    setQtyDraft((p) => ({ ...p, [k]: 1 }));
    Swal.fire("Agregado", "Se agregó al carrito.", "success");
  }

  function removeFromCart(tipo, item_id) {
    setCart((prev) => prev.filter((x) => !(x.tipo === tipo && x.item_id === item_id)));
  }

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, it) => acc + Number(it.precio || 0) * Number(it.cantidad || 0), 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, it) => acc + Number(it.cantidad || 0), 0),
    [cart]
  );

  async function pedirDocumentoConValidacion() {
    const { isConfirmed, value } = await Swal.fire({
      title: "Documento del cliente",
      input: "text",
      inputLabel: "Escribe la cédula (11 dígitos) o el RNC (9 dígitos)",
      inputPlaceholder: "Ej: 40212312312 o 101123456",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      preConfirm: (v) => {
        const raw = cleanDoc(v);
        const d = digitsOnly(raw);
        const t = guessDocType(raw);

        if (!d) {
          Swal.showValidationMessage("Debes escribir la cédula o RNC.");
          return null;
        }
        if (t === "cedula" && !isValidCedulaRD(d)) {
          Swal.showValidationMessage("Cédula inválida. Verifica los 11 dígitos.");
          return null;
        }
        if (t === "rnc" && !isValidRNC(d)) {
          Swal.showValidationMessage("RNC inválido. Verifica los 9 dígitos.");
          return null;
        }
        if (t === "unknown") {
          Swal.showValidationMessage("Documento inválido. Cédula=11 dígitos, RNC=9 dígitos.");
          return null;
        }
        return d;
      },
    });

    if (!isConfirmed) return null;
    return value || null;
  }

  async function enviarOrden() {
    if (!cart.length) {
      Swal.fire("Carrito vacío", "Agrega productos/equipos antes de enviar.", "warning");
      return;
    }

    const documento = await pedirDocumentoConValidacion();
    if (!documento) return;

    try {
      let cliente = await buscarClientePorDocumento(documento);

      if (!cliente) {
        cliente = await modalCrearCliente({ documento });
        if (!cliente) return;
      }

      const myUid = await getMyUid();
      if (!myUid) {
        Swal.fire("Sesión", "No se detectó usuario autenticado. Inicia sesión.", "warning");
        return;
      }

      const tipoCliente = cliente.tipo_cliente || "persona";
      const numero_caso = generarNumeroCaso();

      const payloadPreventa = {
        numero_caso,
        vendedor_id: myUid,
        cliente_id: cliente.id,
        tipo_cliente: tipoCliente,
        cliente: cliente.nombre || "Cliente",
        cedula: tipoCliente === "persona" ? (cliente.cedula || documento) : null,
        empresa_nombre: tipoCliente === "empresa" ? cliente.nombre : null,
        empresa_rnc: tipoCliente === "empresa" ? (cliente.empresa_rnc || documento) : null,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        estado: "enviada",
      };

      const { data: prev, error: ePrev } = await supabase
        .from("preventas")
        .insert(payloadPreventa)
        .select("id, numero_caso")
        .single();

      if (ePrev) throw ePrev;

      const preventaId = prev.id;

      const detalles = cart.map((it) => ({
        preventa_id: preventaId,
        cantidad: Number(it.cantidad || 1),
        producto_id: it.tipo === "producto" ? it.item_id : null,
        equipo_id: it.tipo === "equipo" ? it.item_id : null,
      }));

      const { error: eDet } = await supabase.from("detalle_preventa").insert(detalles);
      if (eDet) throw eDet;

      Swal.fire(
        "Orden enviada",
        `Preventa creada.\n#Caso: ${prev.numero_caso || numero_caso}\nID: #${preventaId}`,
        "success"
      );

      clearCart();
      setCart([]);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo enviar la orden.", "error");
    }
  }

  const tipoActual = tab === "productos" ? "producto" : "equipo";

  const activePills = useMemo(() => {
    const pills = [];
    if (q) pills.push({ k: "q", label: `Buscar: "${q}"` });
    if (fMarca) pills.push({ k: "marca", label: `Marca: ${fMarca}` });
    if (fCategoria) pills.push({ k: "categoria", label: `Categoría: ${fCategoria}` });
    if (fOrden && fOrden !== "recientes") pills.push({ k: "orden", label: `Orden: ${fOrden}` });
    return pills;
  }, [q, fMarca, fCategoria, fOrden]);

  function clearOne(k) {
    if (k === "q") setQ("");
    if (k === "marca") setFMarca("");
    if (k === "categoria") setFCategoria("");
    if (k === "orden") setFOrden("recientes");
  }

  function clearAllFilters() {
    setQ("");
    setFMarca("");
    setFCategoria("");
    setFOrden("recientes");
  }

  return (
    <Wrap>
      <TopBar>
        <div>
          <Title>Catálogo vendedor</Title>
          <Sub>Busca, filtra y agrega ítems al carrito. El carrito permanece visible en laptop y en mobile.</Sub>
        </div>

        <RightControls>
          <Tabs>
            <Tab $active={tab === "productos"} onClick={() => setTab("productos")}>
              Productos
            </Tab>
            <Tab $active={tab === "equipos"} onClick={() => setTab("equipos")}>
              Equipos
            </Tab>
          </Tabs>
          <Secondary onClick={cargar}>Recargar</Secondary>
        </RightControls>
      </TopBar>

      <ControlsBar>
        <SearchBox>
          <Search size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, marca, modelo, categoría o ID…"
          />
        </SearchBox>

        <FilterRow>
          <Select value={fMarca} onChange={(e) => setFMarca(e.target.value)}>
            <option value="">Marca (todas)</option>
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>

          <Select value={fCategoria} onChange={(e) => setFCategoria(e.target.value)}>
            <option value="">Categoría (todas)</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select value={fOrden} onChange={(e) => setFOrden(e.target.value)}>
            <option value="recientes">Orden: recientes</option>
            <option value="precio_asc">Precio: menor → mayor</option>
            <option value="precio_desc">Precio: mayor → menor</option>
            <option value="nombre_asc">Nombre: A → Z</option>
          </Select>

          <Secondary onClick={clearAllFilters} disabled={!activePills.length}>
            <SlidersHorizontal size={18} /> Limpiar
          </Secondary>
        </FilterRow>
      </ControlsBar>

      {activePills.length ? (
        <FilterPills style={{ marginTop: 10 }}>
          {activePills.map((p) => (
            <Pill key={p.k}>
              {p.label}
              <PillBtn onClick={() => clearOne(p.k)} title="Quitar">
                <X size={14} />
              </PillBtn>
            </Pill>
          ))}
        </FilterPills>
      ) : null}

      <MainGrid>
        <div>
          {loading ? (
            <div style={{ marginTop: 12, opacity: 0.8 }}>Cargando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ marginTop: 12, opacity: 0.8 }}>No hay resultados con los filtros actuales.</div>
          ) : (
            <Grid>
              {filtered.map((it) => {
                const k = keyOf(tipoActual, it.id);

                return (
                  <Card key={it.id}>
                    <Img
                      src={safeImg(it.imagen_url)}
                      alt={it.nombre}
                      onError={(e) => (e.currentTarget.src = "/inicio.png")}
                    />
                    <Body>
                      <Name>{it.nombre}</Name>

                      <Meta>
                        {it.marca ? (
                          <div>
                            <strong>Marca:</strong> {it.marca}
                          </div>
                        ) : null}
                        {it.modelo ? (
                          <div>
                            <strong>Modelo:</strong> {it.modelo}
                          </div>
                        ) : null}
                        {it.categoria ? (
                          <div>
                            <strong>Categoría:</strong> {it.categoria}
                          </div>
                        ) : null}
                        <div style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>
                          {tab === "productos" ? `P-${it.id}` : `E-${it.id}`}
                        </div>
                      </Meta>

                      <Price>{formatRD(it.precio)}</Price>

                      <Actions>
                        <Qty
                          type="number"
                          min="1"
                          value={qtyDraft[k] ?? 1}
                          onChange={(e) => setQtyDraft((p) => ({ ...p, [k]: Number(e.target.value) }))}
                        />
                        <Btn onClick={() => addToCart(tipoActual, it)}>Agregar</Btn>
                      </Actions>
                    </Body>
                  </Card>
                );
              })}
            </Grid>
          )}

          <MobileSafeSpace />
        </div>

        <CartPanel>
          <CartHeader>
            <div>
              <CartTitle>Carrito</CartTitle>
              <CartSub>
                Ítems: <strong>{cartCount}</strong> · Subtotal: <strong>{formatRD(cartSubtotal)}</strong>
              </CartSub>
            </div>
            <div style={{ opacity: 0.85, fontWeight: 1000 }}>
              <ShoppingCart size={18} />
            </div>
          </CartHeader>

          <CartList>
            {cart.length === 0 ? (
              <div style={{ opacity: 0.85, padding: "6px 2px" }}>Aún no has agregado ítems.</div>
            ) : (
              cart.map((x, idx) => (
                <CartItem key={`${x.tipo}-${x.item_id}-${idx}`}>
                  <CartItemTop>
                    <div style={{ minWidth: 0 }}>
                      <CartItemName title={`${x.nombre}`}>
                        {x.nombre} × {x.cantidad}
                      </CartItemName>
                      <CartItemMeta>
                        {x.tipo} ·{" "}
                        <span style={{ opacity: 0.75 }}>
                          {x.tipo === "producto" ? `P-${x.item_id}` : `E-${x.item_id}`}
                        </span>
                      </CartItemMeta>
                    </div>

                    <CartItemRight>
                      {formatRD(Number(x.precio || 0) * Number(x.cantidad || 0))}
                    </CartItemRight>
                  </CartItemTop>

                  <RemoveBtn onClick={() => removeFromCart(x.tipo, x.item_id)}>Quitar</RemoveBtn>
                </CartItem>
              ))
            )}
          </CartList>

          <CartFooter>
            <Secondary
              onClick={() => {
                clearCart();
                setCart([]);
              }}
              disabled={!cart.length}
            >
              Vaciar
            </Secondary>

            <Btn onClick={enviarOrden} disabled={!cart.length}>
              Enviar orden
            </Btn>
          </CartFooter>
        </CartPanel>
      </MainGrid>

      <MobileCartBar>
        <MobileCartLeft>
          <MobileCartIcon>
            <ShoppingCart size={18} />
          </MobileCartIcon>

          <MobileCartInfo>
            <div>
              Carrito: {cartCount} ítem{cartCount === 1 ? "" : "s"}
            </div>
            <div>Subtotal: {formatRD(cartSubtotal)}</div>
          </MobileCartInfo>
        </MobileCartLeft>

        <MobileActions>
          <Secondary
            onClick={() => {
              clearCart();
              setCart([]);
            }}
            disabled={!cart.length}
          >
            Vaciar
          </Secondary>

          <Btn onClick={enviarOrden} disabled={!cart.length}>
            Enviar
          </Btn>
        </MobileActions>
      </MobileCartBar>
    </Wrap>
  );
}
