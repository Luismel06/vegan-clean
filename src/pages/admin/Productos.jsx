// src/pages/admin/Productos.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import StockScannerModal from "../../components/admin/StockScannerModal.jsx";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Save,
  X as XIcon,
  Search,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Image as ImageIcon,
  ScanLine,
  Bell,
} from "lucide-react";

/* ==================== ESTILOS ==================== */
const Wrapper = styled.div`
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-weight: 700;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.accent2 || theme.accent};
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: 0.25s;
  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  font-weight: 600;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const MetricCard = styled.div`
  background-color: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const IconWrap = styled.div`
  background: ${({ theme }) => (theme.accent2 || theme.accent) + "22"};
  border-radius: 10px;
  padding: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.accent2 || theme.accent};
`;

const MetricInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetricValue = styled.span`
  font-size: 1.2rem;
  font-weight: 800;
`;

const MetricLabel = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 10px;
  padding: 0.45rem 0.7rem;
  min-width: 260px;
  margin-bottom: 1rem;

  input {
    border: none;
    outline: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    width: 100%;
  }

  svg {
    color: ${({ theme }) => theme.text};
    opacity: 0.8;
  }
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: 1.4fr repeat(4, minmax(160px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Select = styled.select`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.accent};
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  outline: none;

  option {
    background: ${({ theme }) => theme.cardBackground};
    color: ${({ theme }) => theme.accent};
  }
`;

const ClearFiltersBtn = styled(SecondaryButton)`
  justify-content: center;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.cardBackground};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;

  th,
  td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: top;
  }

  th {
    background: ${({ theme }) => theme.background};
    font-weight: 800;
  }

  tbody tr:hover {
    background: ${({ theme }) => theme.background};
  }
`;

const RowActions = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const IconAction = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.accent2 || theme.accent + "11"};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: 0.2s;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.accent2 || theme.accent};
    color: ${({ theme }) => theme.accent2 || theme.accent};
  }
`;

const Empty = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.text};
  opacity: 0.8;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  min-height: 90px;
  resize: vertical;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.85;
  font-weight: 600;
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  grid-column: 1 / -1;
`;

const ImgRow = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

const ImgPreview = styled.img`
  width: 90px;
  height: 68px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  object-fit: cover;
  background: ${({ theme }) => theme.background};
`;

const StockNotice = styled.div`
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-left: 4px solid #f59e0b;
  border-radius: 12px;
  background: ${({ theme }) => theme.cardBackground};
`;

const StockNoticeTitle = styled.div`
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

const StockNoticeList = styled.div`
  margin-top: 0.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
`;

const StockChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  font-size: 0.82rem;
  font-weight: 700;
`;

/* ==================== HELPERS ==================== */
function getPublicImageUrl(bucket, path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || "";
}

async function uploadImageToBucket(bucket, file) {
  if (!file) return null;

  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const safeName =
    (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
      .toString()
      .replaceAll(".", "");
  const filePath = `${safeName}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    upsert: true,
    contentType: file.type || "image/*",
  });

  if (error) throw error;
  return filePath;
}

const LOW_STOCK_LIMIT = 5;

/* ==================== COMPONENTE ==================== */
export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [fProveedor, setFProveedor] = useState("all");
  const [fCategoria, setFCategoria] = useState("all");
  const [fMarca, setFMarca] = useState("all");
  const [fModelo, setFModelo] = useState("all");

  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    proveedor: "",
    cantidad: "",
    precio: "",
    descripcion: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const lowStockAlertShown = useRef(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (productos || []).filter((p) => {
      const nombre = (p.nombre || "").toLowerCase();
      const proveedor = (p.proveedor || "").toLowerCase();
      const categoriaP = (p.categoria || "").toLowerCase();
      const marcaP = (p.marca || "").toLowerCase();
      const modeloP = (p.modelo || "").toLowerCase();

      const matchText =
        !q ||
        nombre.includes(q) ||
        proveedor.includes(q) ||
        categoriaP.includes(q) ||
        marcaP.includes(q) ||
        modeloP.includes(q);

      if (!matchText) return false;

      const matchProveedor = fProveedor === "all" || (p.proveedor || "").trim() === fProveedor;
      const matchCategoria = fCategoria === "all" || (p.categoria || "").trim() === fCategoria;
      const matchMarca = fMarca === "all" || (p.marca || "").trim() === fMarca;
      const matchModelo = fModelo === "all" || (p.modelo || "").trim() === fModelo;

      return matchProveedor && matchCategoria && matchMarca && matchModelo;
    });
  }, [query, productos, fProveedor, fCategoria, fMarca, fModelo]);

  const proveedores = useMemo(() => {
    const set = new Set((productos || []).map((p) => (p.proveedor || "").trim()).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [productos]);

  const categorias = useMemo(() => {
    const set = new Set((productos || []).map((p) => (p.categoria || "").trim()).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [productos]);

  const marcas = useMemo(() => {
    const set = new Set((productos || []).map((p) => (p.marca || "").trim()).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [productos]);

  const modelos = useMemo(() => {
    const set = new Set((productos || []).map((p) => (p.modelo || "").trim()).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [productos]);

  const totalProductos = productos.length;
  const valorInventario = productos.reduce((acc, p) => acc + (p.cantidad || 0) * (p.precio || 0), 0);
  const productoMasCaro = productos.reduce((max, p) => (p.precio > (max?.precio || 0) ? p : max), null);
  const productoMenorStock = productos.reduce((min, p) => (p.cantidad < (min?.cantidad || Infinity) ? p : min), null);
  const productosBajoStock = useMemo(() => {
    return (productos || [])
      .filter((p) => Number(p?.cantidad || 0) <= LOW_STOCK_LIMIT)
      .sort((a, b) => Number(a?.cantidad || 0) - Number(b?.cantidad || 0));
  }, [productos]);

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (lowStockAlertShown.current) return;
    if (!productosBajoStock.length) return;

    lowStockAlertShown.current = true;
    Swal.fire({
      icon: "warning",
      title: "Alerta de inventario",
      text: `Hay ${productosBajoStock.length} ${productosBajoStock.length === 1 ? "producto" : "productos"} con menos de ${LOW_STOCK_LIMIT} unidades en stock.`,
      confirmButtonColor: "#00c27a",
    });
  }, [loading, productosBajoStock]);

  async function fetchProductos() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("productos").select("*").order("id", { ascending: false });
      if (error) throw error;
      setProductos(data ?? []);
    } catch (err) {
      console.error("fetchProductos error:", err);
      Swal.fire({
        icon: "error",
        title: "No se pudieron cargar los productos",
        text: err?.message || "Verifica RLS/policies o que tu app apunte al mismo proyecto de Supabase.",
        confirmButtonColor: "#00c27a",
      });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ nombre: "", proveedor: "", cantidad: "", precio: "", descripcion: "" });
    setCategoria("");
    setMarca("");
    setModelo("");
    setAdding(false);
    setEditingId(null);
    setImageFile(null);
    setImagePath("");
    setImagePreview("");
  }

  function validate(f) {
    if (!f.nombre.trim()) return "El nombre es obligatorio.";
    if (!f.proveedor.trim()) return "El proveedor es obligatorio.";
    if (f.cantidad === "" || isNaN(f.cantidad)) return "La cantidad debe ser numérica.";
    if (f.precio === "" || isNaN(f.precio)) return "El precio debe ser numérico.";
    return null;
  }

  function onPickImage(file) {
    setImageFile(file || null);
    if (!file) {
      setImagePreview(imagePath ? getPublicImageUrl("productos", imagePath) : "");
      return;
    }
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  async function onCreate(e) {
    e.preventDefault();
    const err = validate(form);
    if (err) {
      return Swal.fire({ icon: "warning", title: "Validación", text: err, confirmButtonColor: "#00c27a" });
    }

    try {
      let uploadedPath = null;
      if (imageFile) uploadedPath = await uploadImageToBucket("productos", imageFile);

      const payload = {
        nombre: form.nombre,
        proveedor: form.proveedor,
        cantidad: parseInt(form.cantidad),
        precio: parseFloat(form.precio),
        categoria: categoria || null,
        marca: marca || null,
        modelo: modelo || null,
        descripcion: form.descripcion || null,
        imagen_url: uploadedPath || null,
        // ✅ NO mandamos codigo_barra, lo genera el trigger
      };

      const { data, error } = await supabase.from("productos").insert([payload]).select().single();
      if (error) throw error;

      setProductos((prev) => [data, ...prev]);
      resetForm();

      Swal.fire({ icon: "success", title: "Producto agregado", timer: 1300, showConfirmButton: false });
    } catch (err2) {
      console.error("onCreate error:", err2);
      Swal.fire({ icon: "error", title: "Error", text: err2?.message || "No se pudo crear el producto.", confirmButtonColor: "#00c27a" });
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    const err = validate(form);
    if (err) {
      return Swal.fire({ icon: "warning", title: "Validación", text: err, confirmButtonColor: "#00c27a" });
    }

    try {
      let uploadedPath = imagePath || null;
      if (imageFile) uploadedPath = await uploadImageToBucket("productos", imageFile);

      const payload = {
        nombre: form.nombre,
        proveedor: form.proveedor,
        cantidad: parseInt(form.cantidad),
        precio: parseFloat(form.precio),
        categoria: categoria || null,
        marca: marca || null,
        modelo: modelo || null,
        descripcion: form.descripcion || null,
        imagen_url: uploadedPath || null,
        // ✅ no tocamos codigo_barra en update
      };

      const { data, error } = await supabase.from("productos").update(payload).eq("id", editingId).select().single();
      if (error) throw error;

      setProductos((prev) => prev.map((p) => (p.id === editingId ? data : p)));
      resetForm();

      Swal.fire({ icon: "success", title: "Producto actualizado", timer: 1300, showConfirmButton: false });
    } catch (err2) {
      console.error("onUpdate error:", err2);
      Swal.fire({ icon: "error", title: "Error", text: err2?.message || "No se pudo actualizar el producto.", confirmButtonColor: "#00c27a" });
    }
  }

  async function onDelete(id) {
    const res = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53935",
      cancelButtonColor: "#9e9e9e",
    });
    if (!res.isConfirmed) return;

    try {
      const { error } = await supabase.from("productos").delete().eq("id", id);
      if (error) throw error;

      setProductos((prev) => prev.filter((p) => p.id !== id));
      Swal.fire({ icon: "success", title: "Producto eliminado", timer: 1100, showConfirmButton: false });
    } catch (err2) {
      console.error("onDelete error:", err2);
      Swal.fire({ icon: "error", title: "Error", text: err2?.message || "No se pudo eliminar el producto.", confirmButtonColor: "#00c27a" });
    }
  }

  async function aplicarScannerReposicion(rows = []) {
    if (!rows.length) return;

    const ids = rows.map((r) => Number(r.id)).filter((id) => Number.isFinite(id) && id > 0);
    if (!ids.length) return;

    try {
      const { data: freshRows, error: errFresh } = await supabase
        .from("productos")
        .select("id, cantidad")
        .in("id", ids);

      if (errFresh) throw errFresh;

      const qtyById = new Map(
        (freshRows || []).map((row) => [Number(row.id), Number(row.cantidad || 0)])
      );

      for (const row of rows) {
        const id = Number(row.id);
        const addQty = Number(row.addQty || 0);
        if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(addQty) || addQty <= 0) continue;

        const baseQty = qtyById.get(id);
        if (!Number.isFinite(baseQty)) {
          throw new Error(`No se encontro el producto #${id} para actualizar inventario.`);
        }

        const nextQty = baseQty + addQty;
        const { error: errUpdate } = await supabase
          .from("productos")
          .update({ cantidad: nextQty })
          .eq("id", id);

        if (errUpdate) throw errUpdate;
        qtyById.set(id, nextQty);
      }

      await fetchProductos();

      const totalUnits = rows.reduce((acc, row) => acc + Number(row.addQty || 0), 0);
      Swal.fire(
        "Inventario actualizado",
        `Se agregaron ${totalUnits} ${totalUnits === 1 ? "unidad" : "unidades"} en ${rows.length} ${rows.length === 1 ? "producto" : "productos"}.`,
        "success"
      );
    } catch (e) {
      console.error("aplicarScannerReposicion error:", e);
      throw new Error(e?.message || "No se pudo aplicar el lote de escaneo.");
    }
  }

  return (
    <Wrapper>
      <Header>
        <Title>Productos</Title>
        <Actions>
          <SecondaryButton type="button" onClick={fetchProductos}>
            <RefreshCw size={18} /> Recargar
          </SecondaryButton>

          <SecondaryButton type="button" onClick={() => setScannerOpen(true)}>
            <ScanLine size={18} /> Escaner +stock
          </SecondaryButton>

          {!adding && editingId === null && (
            <Button type="button" onClick={() => setAdding(true)}>
              <Plus size={18} /> Nuevo producto
            </Button>
          )}
        </Actions>
      </Header>

      <MetricsGrid>
        <MetricCard>
          <IconWrap><Package size={22} /></IconWrap>
          <MetricInfo>
            <MetricValue>{totalProductos}</MetricValue>
            <MetricLabel>Total de productos</MetricLabel>
          </MetricInfo>
        </MetricCard>

        <MetricCard>
          <IconWrap><Bell size={22} /></IconWrap>
          <MetricInfo>
            <MetricValue>{productosBajoStock.length}</MetricValue>
            <MetricLabel>{`Stock bajo (<= ${LOW_STOCK_LIMIT})`}</MetricLabel>
          </MetricInfo>
        </MetricCard>

        <MetricCard>
          <IconWrap><DollarSign size={22} /></IconWrap>
          <MetricInfo>
            <MetricValue>
              RD${valorInventario.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
            </MetricValue>
            <MetricLabel>Valor total inventario</MetricLabel>
          </MetricInfo>
        </MetricCard>

        {productoMenorStock && (
          <MetricCard>
            <IconWrap><AlertTriangle size={22} /></IconWrap>
            <MetricInfo>
              <MetricValue>{productoMenorStock.nombre}</MetricValue>
              <MetricLabel>Menor stock ({productoMenorStock.cantidad})</MetricLabel>
            </MetricInfo>
          </MetricCard>
        )}

        {productoMasCaro && (
          <MetricCard>
            <IconWrap><TrendingUp size={22} /></IconWrap>
            <MetricInfo>
              <MetricValue>
                RD${Number(productoMasCaro.precio || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
              </MetricValue>
              <MetricLabel>Más caro ({productoMasCaro.nombre})</MetricLabel>
            </MetricInfo>
          </MetricCard>
        )}
      </MetricsGrid>

      {productosBajoStock.length > 0 && (
        <StockNotice>
          <StockNoticeTitle>
            <AlertTriangle size={16} />
            Notificaciones de inventario: hay {productosBajoStock.length} productos en nivel bajo.
          </StockNoticeTitle>
          <StockNoticeList>
            {productosBajoStock.slice(0, 12).map((p) => (
              <StockChip key={`stock-bajo-prod-${p.id}`}>
                {p.nombre || "Producto"}: {Number(p.cantidad || 0)}
              </StockChip>
            ))}
          </StockNoticeList>
        </StockNotice>
      )}

      <FiltersRow>
        <SearchBox style={{ marginBottom: 0, minWidth: "unset" }}>
          <Search size={18} />
          <input placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </SearchBox>

        <Select value={fProveedor} onChange={(e) => setFProveedor(e.target.value)}>
          {proveedores.map((v) => (
            <option key={v} value={v}>{v === "all" ? "Todos los proveedores" : v}</option>
          ))}
        </Select>

        <Select value={fCategoria} onChange={(e) => setFCategoria(e.target.value)}>
          {categorias.map((v) => (
            <option key={v} value={v}>{v === "all" ? "Todas las categorías" : v}</option>
          ))}
        </Select>

        <Select value={fMarca} onChange={(e) => setFMarca(e.target.value)}>
          {marcas.map((v) => (
            <option key={v} value={v}>{v === "all" ? "Todas las marcas" : v}</option>
          ))}
        </Select>

        <Select value={fModelo} onChange={(e) => setFModelo(e.target.value)}>
          {modelos.map((v) => (
            <option key={v} value={v}>{v === "all" ? "Todos los modelos" : v}</option>
          ))}
        </Select>

        <ClearFiltersBtn
          type="button"
          onClick={() => {
            setQuery("");
            setFProveedor("all");
            setFCategoria("all");
            setFMarca("all");
            setFModelo("all");
          }}
        >
          Limpiar
        </ClearFiltersBtn>
      </FiltersRow>

      {(adding || editingId !== null) && (
        <Form onSubmit={editingId ? onUpdate : onCreate}>
          <Field>
            <Label>Nombre</Label>
            <Input placeholder="Nombre del producto" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </Field>

          <Field>
            <Label>Proveedor</Label>
            <Input placeholder="Proveedor" value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} />
          </Field>

          <Field>
            <Label>Cantidad</Label>
            <Input placeholder="Cantidad" type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
          </Field>

          <Field>
            <Label>Precio (RD$)</Label>
            <Input placeholder="Precio (RD$)" type="number" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
          </Field>

          <Field>
            <Label>Categoría</Label>
            <Input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej: Zafacones, Detergentes..." />
          </Field>

          <Field>
            <Label>Marca</Label>
            <Input type="text" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ej: Vega Clean..." />
          </Field>

          <Field>
            <Label>Modelo</Label>
            <Input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ej: Mediano..." />
          </Field>

          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Descripción</Label>
            <TextArea placeholder="Descripción del producto..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </Field>

          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Imagen</Label>
            <ImgRow>
              <SecondaryButton type="button" onClick={() => document.getElementById("producto_img_input")?.click()}>
                <ImageIcon size={18} /> Seleccionar imagen
              </SecondaryButton>

              <input
                id="producto_img_input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => onPickImage(e.target.files?.[0] || null)}
              />

              {(imagePreview || imagePath) && (
                <ImgPreview src={imagePreview || getPublicImageUrl("productos", imagePath)} alt="preview" />
              )}
            </ImgRow>
          </Field>

          <FormActions>
            <Button type="submit">
              <Save size={18} /> {editingId ? "Guardar cambios" : "Agregar"}
            </Button>
            <SecondaryButton type="button" onClick={resetForm}>
              <XIcon size={18} /> Cancelar
            </SecondaryButton>
          </FormActions>
        </Form>
      )}

      <TableWrapper>
        {loading ? (
          <Empty>Cargando productos...</Empty>
        ) : filtered.length === 0 ? (
          <Empty>No hay productos registrados.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Proveedor</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <ImgPreview
                      src={getPublicImageUrl("productos", p.imagen_url) || "/placeholder-producto.png"}
                      alt={p.nombre || "producto"}
                    />
                  </td>

                  <td style={{ fontWeight: 900 }}>
                    {p.codigo_barra || "-"}
                  </td>

                  <td>
                    <div style={{ fontWeight: 800 }}>{p.nombre}</div>
                    {p.descripcion && (
                      <div style={{ opacity: 0.85, fontSize: "0.9rem", marginTop: "0.25rem" }}>
                        {p.descripcion}
                      </div>
                    )}
                  </td>

                  <td>{p.proveedor}</td>
                  <td>{p.categoria || "-"}</td>
                  <td>{p.marca || "-"}</td>
                  <td>{p.modelo || "-"}</td>
                  <td>{p.cantidad}</td>
                  <td>
                    RD${Number(p.precio || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </td>

                  <td>
                    <RowActions>
                      <IconAction
                        onClick={() => {
                          setEditingId(p.id);
                          setForm({
                            nombre: p.nombre || "",
                            proveedor: p.proveedor || "",
                            cantidad: p.cantidad ?? "",
                            precio: p.precio ?? "",
                            descripcion: p.descripcion || "",
                          });
                          setCategoria(p.categoria || "");
                          setMarca(p.marca || "");
                          setModelo(p.modelo || "");
                          setAdding(false);

                          setImageFile(null);
                          setImagePath(p.imagen_url || "");
                          setImagePreview(p.imagen_url ? getPublicImageUrl("productos", p.imagen_url) : "");
                        }}
                      >
                        <Pencil size={16} /> Editar
                      </IconAction>

                      <IconAction onClick={() => onDelete(p.id)}>
                        <Trash2 size={16} /> Eliminar
                      </IconAction>
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrapper>

      <StockScannerModal
        open={scannerOpen}
        title="Escaner + stock (Productos)"
        entityLabel="producto"
        items={(productos || []).map((p) => ({
          id: p.id,
          nombre: p.nombre,
          codigo_barra: p.codigo_barra,
          cantidad: p.cantidad,
        }))}
        onClose={() => setScannerOpen(false)}
        onApply={aplicarScannerReposicion}
      />
    </Wrapper>
  );
}
