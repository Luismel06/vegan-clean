import { useEffect, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { Trash2, UserPlus } from "lucide-react";
import {
  insertarUsuario,
  mostrarUsuarios,
  eliminarUsuario,
} from "../../supabase/crudUsuarios";

// === Estilos (idénticos a tu versión) ===
const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: 900px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const FormSection = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.8rem;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  font-weight: 700;
  font-size: 1.4rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.accent};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  font-size: 0.9rem;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => (theme.name === "light" ? "#000000" : "#ffffff")};
  border: none;
  border-radius: 10px;
  padding: 0.9rem 1.2rem;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: 0.3s;

  &:hover {
    background: #18a202;
    transform: scale(1.03);
  }
`;

const TableSection = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
  padding: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Th = styled.th`
  background: ${({ theme }) => theme.accent};
  color: white;
  padding: 0.9rem;
  text-align: left;
  border-bottom: 3px solid ${({ theme }) => theme.background};
`;

const Td = styled.td`
  padding: 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Row = styled.tr`
  transition: background 0.2s ease;
  &:hover {
    background: rgba(0, 188, 212, 0.05);
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #e53935;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    transform: scale(1.2);
  }
`;

// === Componente principal ===
export default function Usuarios() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("tecnico");
  const [usuarios, setUsuarios] = useState([]);

  // === Leer usuarios ===
  const fetchUsuarios = async () => {
    const data = await mostrarUsuarios();
    setUsuarios(data || []);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // === Crear usuario ===
  const handleCrearEmpleado = async () => {
    if (!nombre.trim() || !email.trim()) {
      Swal.fire("Campos incompletos", "Rellena todos los campos.", "warning");
      return;
    }

    try {
      await insertarUsuario({
        nombre,
        email,
        rol,
        creado_en: new Date().toISOString(),
      });

      Swal.fire("Usuario creado", "El nuevo usuario fue agregado.", "success");
      setNombre("");
      setEmail("");
      setRol("tecnico");
      fetchUsuarios();
    } catch (error) {
      Swal.fire("Error", "No se pudo crear el usuario.", "error");
      console.error(error);
    }
  };

  // === Eliminar usuario ===
  const handleEliminar = async (id, nombre) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: `¿Seguro que quieres eliminar a "${nombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53935",
      cancelButtonColor: "#9e9e9e",
    });

    if (confirm.isConfirmed) {
      try {
        await eliminarUsuario(id);
        Swal.fire("Eliminado", "Usuario eliminado correctamente.", "success");
        fetchUsuarios();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  return (
    <Container>
      {/* ==== Formulario ==== */}
      <FormSection>
        <Title>Agregar Usuario</Title>
        <Label>Nombre completo</Label>
        <Input
          placeholder="Ej: Juan Pérez"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <Label>Correo electrónico</Label>
        <Input
          type="email"
          placeholder="Ej: juanperez@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Label>Rol</Label>
        <Select value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="tecnico">Técnico</option>
          <option value="administrador">Administrador</option>
        </Select>

        <Button onClick={handleCrearEmpleado}>
          <UserPlus size={18} />
          Crear usuario
        </Button>
      </FormSection>

      {/* ==== Tabla ==== */}
      <TableSection>
        <Title>Usuarios Registrados</Title>
        <Table>
          <thead>
            <tr>
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
              <Th>Fecha</Th>
              <Th>Acción</Th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((u) => (
                <Row key={u.id}>
                  <Td>{u.nombre}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.rol}</Td>
                  <Td>
                    {new Date(u.creado_en).toLocaleDateString("es-DO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Td>
                  <Td>
                    <DeleteButton
                      onClick={() => handleEliminar(u.id, u.nombre)}
                      title="Eliminar usuario"
                    >
                      <Trash2 size={18} />
                    </DeleteButton>
                  </Td>
                </Row>
              ))
            ) : (
              <tr>
                <Td colSpan="5" style={{ textAlign: "center", color: "#888" }}>
                  No hay usuarios registrados
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableSection>
    </Container>
  );
}
