// src/pages/admin/Productos.jsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
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
  background-color: #a3f3be;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: 0.25s;
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
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
  background: ${({ theme }) => theme.accent}22;
  border-radius: 10px;
  padding: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.accent};
`;

const MetricInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetricValue = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
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
  min-width: 900px;

  th,
  td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.background};
    font-weight: 700;
  }

  tbody tr:hover {
    background: ${({ theme }) => theme.background};
  }
`;

const RowActions = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const IconAction = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: 0.2s;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
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

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.8;
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 0.4rem;
`;

/* ==================== COMPONENTE ==================== */
export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");

  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    proveedor: "",
    cantidad: "",
    precio: "",
  });

  const filtered = useMemo(() => {
    if (!query.trim()) return productos;
    const q = query.toLowerCase();

    return productos.filter((p) => {
      const nombre = p.nombre?.toLowerCase() || "";
      const proveedor = p.proveedor?.toLowerCase() || "";
      const categoriaP = p.categoria?.toLowerCase() || "";
      const marcaP = p.marca?.toLowerCase() || "";
      const modeloP = p.modelo?.toLowerCase() || "";

      return (
        nombre.includes(q) ||
        proveedor.includes(q) ||
        categoriaP.includes(q) ||
        marcaP.includes(q) ||
        modeloP.includes(q)
      );
    });
  }, [query, productos]);

  /* === MÉTRICAS === */
  const totalProductos = productos.length;
  const valorInventario = productos.reduce(
    (acc, p) => acc + (p.cantidad || 0) * (p.precio || 0),
    0
  );
  const productoMasCaro = productos.reduce(
    (max, p) => (p.precio > (max?.precio || 0) ? p : max),
    null
  );
  const productoMenorStock = productos.reduce(
    (min, p) => (p.cantidad < (min?.cantidad || Infinity) ? p : min),
    null
  );

  /* === CARGAR DATOS === */
  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id", { ascending: false });
      if (error) throw error;
      setProductos(data ?? []);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al cargar productos",
        confirmButtonColor: "#00bcd4",
      });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ nombre: "", proveedor: "", cantidad: "", precio: "" });
    setCategoria("");
    setMarca("");
    setModelo("");
    setAdding(false);
    setEditingId(null);
  }

  function validate(f) {
    if (!f.nombre.trim()) return "El nombre es obligatorio.";
    if (!f.proveedor.trim()) return "El proveedor es obligatorio.";
    if (!f.cantidad || isNaN(f.cantidad))
      return "La cantidad debe ser numérica.";
    if (!f.precio || isNaN(f.precio)) return "El precio debe ser numérico.";
    return null;
  }

  async function onCreate(e) {
    e.preventDefault();
    const err = validate(form);
    if (err)
      return Swal.fire({
        icon: "warning",
        title: "Validación",
        text: err,
        confirmButtonColor: "#00bcd4",
      });

    try {
      const { data, error } = await supabase
        .from("productos")
        .insert([
          {
            nombre: form.nombre,
            proveedor: form.proveedor,
            cantidad: parseInt(form.cantidad),
            precio: parseFloat(form.precio),
            categoria: categoria || null,
            marca: marca || null,
            modelo: modelo || null,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setProductos((prev) => [data, ...prev]);
      resetForm();
      Swal.fire({
        icon: "success",
        title: "Producto agregado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el producto.",
        confirmButtonColor: "#00bcd4",
      });
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    const err = validate(form);
    if (err)
      return Swal.fire({
        icon: "warning",
        title: "Validación",
        text: err,
        confirmButtonColor: "#00bcd4",
      });

    try {
      const { data, error } = await supabase
        .from("productos")
        .update({
          nombre: form.nombre,
          proveedor: form.proveedor,
          cantidad: parseInt(form.cantidad),
          precio: parseFloat(form.precio),
          categoria: categoria || null,
          marca: marca || null,
          modelo: modelo || null,
        })
        .eq("id", editingId)
        .select()
        .single();
      if (error) throw error;
      setProductos((prev) =>
        prev.map((p) => (p.id === editingId ? data : p))
      );
      resetForm();
      Swal.fire({
        icon: "success",
        title: "Producto actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el producto.",
        confirmButtonColor: "#00bcd4",
      });
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
      Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el producto.",
        confirmButtonColor: "#00bcd4",
      });
    }
  }

  /* ==================== RENDER ==================== */
  return (
    <Wrapper>
      <Header>
        <Title>Productos</Title>
        <Actions>
          <SecondaryButton onClick={fetchProductos}>
            <RefreshCw size={18} /> Recargar
          </SecondaryButton>
          {!adding && editingId === null && (
            <Button onClick={() => setAdding(true)}>
              <Plus size={18} /> Nuevo producto
            </Button>
          )}
        </Actions>
      </Header>

      {/* === MÉTRICAS === */}
      <MetricsGrid>
        <MetricCard>
          <IconWrap>
            <Package size={22} />
          </IconWrap>
          <MetricInfo>
            <MetricValue>{totalProductos}</MetricValue>
            <MetricLabel>Total de productos</MetricLabel>
          </MetricInfo>
        </MetricCard>
        <MetricCard>
          <IconWrap>
            <DollarSign size={22} />
          </IconWrap>
          <MetricInfo>
            <MetricValue>
              RD$
              {valorInventario.toLocaleString("es-DO", {
                minimumFractionDigits: 2,
              })}
            </MetricValue>
            <MetricLabel>Valor total inventario</MetricLabel>
          </MetricInfo>
        </MetricCard>
        {productoMenorStock && (
          <MetricCard>
            <IconWrap>
              <AlertTriangle size={22} />
            </IconWrap>
            <MetricInfo>
              <MetricValue>{productoMenorStock.nombre}</MetricValue>
              <MetricLabel>
                Menor stock ({productoMenorStock.cantidad})
              </MetricLabel>
            </MetricInfo>
          </MetricCard>
        )}
        {productoMasCaro && (
          <MetricCard>
            <IconWrap>
              <TrendingUp size={22} />
            </IconWrap>
            <MetricInfo>
              <MetricValue>
                RD$
                {productoMasCaro.precio.toLocaleString("es-DO", {
                  minimumFractionDigits: 2,
                })}
              </MetricValue>
              <MetricLabel>Más caro ({productoMasCaro.nombre})</MetricLabel>
            </MetricInfo>
          </MetricCard>
        )}
      </MetricsGrid>

      {/* === BUSCADOR === */}
      <SearchBox>
        <Search size={18} />
        <input
          placeholder="Buscar producto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SearchBox>

      {/* === FORMULARIO === */}
      {(adding || editingId !== null) && (
        <Form onSubmit={editingId ? onUpdate : onCreate}>
          <Input
            placeholder="Nombre del producto"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <Input
            placeholder="Proveedor"
            value={form.proveedor}
            onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
          />
          <Input
            placeholder="Cantidad"
            type="number"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
          />
          <Input
            placeholder="Precio (RD$)"
            type="number"
            step="0.01"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />

          <Field>
            <Label>Categoría</Label>
            <Input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej: Cámaras, NVR, Cableado, Tubos…"
            />
          </Field>

          <Field>
            <Label>Marca</Label>
            <Input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ej: Hikvision, Dahua, Ubiquiti…"
            />
          </Field>

          <Field>
            <Label>Modelo (opcional)</Label>
            <Input
              type="text"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Ej: DS-2CD1043G0-I"
            />
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

      {/* === TABLA === */}
      <TableWrapper>
        {loading ? (
          <Empty>Cargando productos...</Empty>
        ) : filtered.length === 0 ? (
          <Empty>No hay productos registrados.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
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
                  <td>{p.nombre}</td>
                  <td>{p.proveedor}</td>
                  <td>{p.categoria || "-"}</td>
                  <td>{p.marca || "-"}</td>
                  <td>{p.modelo || "-"}</td>
                  <td>{p.cantidad}</td>
                  <td>
                    RD$
                    {p.precio.toLocaleString("es-DO", {
                      minimumFractionDigits: 2,
                    })}
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
                          });
                          setCategoria(p.categoria || "");
                          setMarca(p.marca || "");
                          setModelo(p.modelo || "");
                          setAdding(false);
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
    </Wrapper>
  );
}
