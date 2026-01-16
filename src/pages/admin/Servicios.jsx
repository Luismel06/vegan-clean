// src/pages/admin/Servicios.jsx
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
  min-width: 680px;

  th,
  td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: top;
  }

  th {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-weight: 700;
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
  background: ${({ theme }) => theme.cardBackground};
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
  grid-template-columns: 1fr 2fr auto;
  gap: 0.7rem;
  align-items: start;
  margin-bottom: 1.2rem;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
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
  resize: vertical;
  min-height: 70px;
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;

  @media (max-width: 820px) {
    justify-content: stretch;
    button {
      width: 100%;
    }
  }
`;

/* ==================== COMPONENTE ==================== */
export default function ServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
  });

  const filtered = useMemo(() => {
    if (!query.trim()) return servicios;
    const q = query.toLowerCase();
    return servicios.filter(
      (s) =>
        s.nombre?.toLowerCase().includes(q) ||
        s.descripcion?.toLowerCase().includes(q)
    );
  }, [query, servicios]);

  /* === Cargar servicios === */
  useEffect(() => {
    fetchServicios();
  }, []);

  async function fetchServicios() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("servicios")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setServicios(data ?? []);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al cargar",
        text: "No se pudieron cargar los servicios.",
        confirmButtonColor: "#00bcd4",
      });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ nombre: "", descripcion: "" });
    setAdding(false);
    setEditingId(null);
  }

  function validate(formData) {
    if (!formData.nombre?.trim()) return "El nombre es obligatorio.";
    if (!formData.descripcion?.trim()) return "La descripción es obligatoria.";
    return null;
  }

  async function onCreate(e) {
    e.preventDefault();
    const errMsg = validate(form);
    if (errMsg)
      return Swal.fire({
        icon: "warning",
        title: "Validación",
        text: errMsg,
        confirmButtonColor: "#00bcd4",
      });

    try {
      const { data, error } = await supabase
        .from("servicios")
        .insert([{ ...form }])
        .select()
        .single();
      if (error) throw error;

      setServicios((prev) => [data, ...prev]);
      resetForm();

      Swal.fire({
        icon: "success",
        title: "Servicio agregado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el servicio.",
        confirmButtonColor: "#00bcd4",
      });
    }
  }

  function startEdit(s) {
    setEditingId(s.id);
    setForm({
      nombre: s.nombre ?? "",
      descripcion: s.descripcion ?? "",
    });
  }

  async function onUpdate(e) {
    e.preventDefault();
    const errMsg = validate(form);
    if (errMsg)
      return Swal.fire({
        icon: "warning",
        title: "Validación",
        text: errMsg,
        confirmButtonColor: "#00bcd4",
      });

    try {
      const { data, error } = await supabase
        .from("servicios")
        .update(form)
        .eq("id", editingId)
        .select()
        .single();
      if (error) throw error;

      setServicios((prev) => prev.map((s) => (s.id === editingId ? data : s)));
      resetForm();

      Swal.fire({
        icon: "success",
        title: "Servicio actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el servicio.",
        confirmButtonColor: "#00bcd4",
      });
    }
  }

  async function onDelete(id) {
    const res = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar servicio?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53935",
      cancelButtonColor: "#9e9e9e",
    });
    if (!res.isConfirmed) return;

    try {
      const { error } = await supabase.from("servicios").delete().eq("id", id);
      if (error) throw error;

      setServicios((prev) => prev.filter((s) => s.id !== id));

      Swal.fire({
        icon: "success",
        title: "Servicio eliminado",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el servicio.",
        confirmButtonColor: "#00bcd4",
      });
    }
  }

  /* ==================== RENDER ==================== */
  return (
    <Wrapper>
      <Header>
        <Title>Servicios</Title>
        <Actions>
          <SecondaryButton onClick={fetchServicios}>
            <RefreshCw size={18} /> Recargar
          </SecondaryButton>
          {!adding && editingId === null && (
            <Button onClick={() => setAdding(true)}>
              <Plus size={18} /> Nuevo servicio
            </Button>
          )}
        </Actions>
      </Header>

      <SearchBox>
        <Search size={18} />
        <input
          placeholder="Buscar servicio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SearchBox>

      {(adding || editingId !== null) && (
        <Form onSubmit={editingId ? onUpdate : onCreate}>
          <Input
            placeholder="Nombre del servicio"
            value={form.nombre}
            onChange={(e) =>
              setForm((f) => ({ ...f, nombre: e.target.value }))
            }
          />
          <TextArea
            placeholder="Descripción detallada"
            value={form.descripcion}
            onChange={(e) =>
              setForm((f) => ({ ...f, descripcion: e.target.value }))
            }
          />
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
          <Empty>Cargando servicios...</Empty>
        ) : filtered.length === 0 ? (
          <Empty>No hay servicios registrados.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Nombre</th>
                <th>Descripción</th>
                <th style={{ width: "20%" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.nombre}</strong></td>
                  <td style={{ whiteSpace: "pre-wrap" }}>{s.descripcion}</td>
                  <td>
                    <RowActions>
                      <IconAction onClick={() => startEdit(s)}>
                        <Pencil size={16} /> Editar
                      </IconAction>
                      <IconAction onClick={() => onDelete(s.id)}>
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
