// src/pages/admin/Publicaciones.jsx
import { useState, useEffect } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { Image, Trash2 } from "lucide-react";

// ==== ESTILOS ====

const Container = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.text};
`;

const FormCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.8rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 1rem;
  font-size: 1.4rem;
  font-weight: 700;
`;

const Label = styled.label`
  display: block;
  margin: 10px 0 5px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  resize: none;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  padding: 0.9rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1rem;
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
`;

const ImgPreview = styled.img`
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 10px;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #e53935;
  cursor: pointer;
  margin-left: auto;
  transition: 0.3s;

  &:hover {
    transform: scale(1.2);
  }
`;

// =======================================================
// ====== COMPONENTE PRINCIPAL ===========================
// =======================================================

export default function Publicaciones() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);

  // === Cargar publicaciones ===
  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const fetchPublicaciones = async () => {
    const { data: pubs, error } = await supabase
      .from("publicaciones")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error cargando publicaciones:", error);
      return;
    }

    // --- obtener imágenes ---
    const { data: imgData } = await supabase
      .from("imagenes_publicacion")
      .select("*");

    const pubsFinal = pubs.map((p) => ({
      ...p,
      imagenes: imgData?.filter((i) => i.publicacion_id === p.id) || [],
    }));

    setPublicaciones(pubsFinal);
  };

  // === Subir varias imágenes ===
  const subirImagenes = async (files) => {
    const urls = [];

    for (const file of files) {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "");
      const fileName = `${Date.now()}-${cleanName}`;
      const filePath = `imagenes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("publicaciones")
        .upload(filePath, file);

      if (uploadError) {
        console.error("❌ Error subiendo imagen:", uploadError);
        throw uploadError;
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from("publicaciones")
        .getPublicUrl(filePath);

      urls.push(data.publicUrl);
    }

    return urls;
  };

  // === Crear publicación ===
  const crearPublicacion = async () => {
    if (!titulo.trim() || !descripcion.trim() || imagenes.length === 0) {
      Swal.fire("Campos incompletos", "Llena todos los campos y añade imágenes.", "warning");
      return;
    }

    try {
      // 1. Subir imágenes
      const imagenesUrls = await subirImagenes(imagenes);

      // 2. Crear publicación
      const { data: nuevaPub, error } = await supabase
        .from("publicaciones")
        .insert([
          {
            titulo,
            descripcion,
            imagen_url: imagenesUrls[0], // portada
            categoria,
            creado_por: "Admin",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 3. Insertar múltiples imágenes
      const imagenesInsert = imagenesUrls.map((url) => ({
        publicacion_id: nuevaPub.id,
        url,
      }));

      await supabase.from("imagenes_publicacion").insert(imagenesInsert);

      Swal.fire("¡Publicación creada!", "Las imágenes fueron subidas correctamente.", "success");

      setTitulo("");
      setDescripcion("");
      setCategoria("");
      setImagenes([]);

      fetchPublicaciones();

    } catch (error) {
      Swal.fire("Error", "No se pudo crear la publicación.", "error");
      console.error(error);
    }
  };

  // === Eliminar publicación ===
  const eliminarPublicacion = async (id, titulo) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar publicación?",
      text: `¿Deseas eliminar "${titulo}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    await supabase.from("imagenes_publicacion").delete().eq("publicacion_id", id);
    await supabase.from("publicaciones").delete().eq("id", id);

    Swal.fire("Eliminada", "La publicación fue eliminada.", "success");
    fetchPublicaciones();
  };

  return (
    <Container>
      <FormCard>
        <Title>Crear Publicación</Title>

        <Label>Título</Label>
        <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />

        <Label>Descripción</Label>
        <TextArea
          rows="4"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <Label>Categoría</Label>
        <Input
          placeholder="Ej: Instalación, Networking..."
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />

        <Label>Imágenes (múltiples)</Label>
        <Input
          type="file"
          multiple
          onChange={(e) => setImagenes([...e.target.files])}
        />

        <Button onClick={crearPublicacion}>
          <Image size={18} /> Subir Publicación
        </Button>
      </FormCard>

      <Grid>
        {publicaciones.map((p) => (
          <Card key={p.id}>
            {p.imagenes[0] && <ImgPreview src={p.imagenes[0].url} />}

            <h3 style={{ color: "#00bcd4" }}>{p.titulo}</h3>
            <p>{p.descripcion}</p>

            <strong style={{ opacity: 0.7 }}>Categoría: {p.categoria}</strong>

            <div style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {p.imagenes.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  style={{ width: 70, height: 70, borderRadius: 8, objectFit: "cover" }}
                />
              ))}
            </div>

            <DeleteButton onClick={() => eliminarPublicacion(p.id, p.titulo)}>
              <Trash2 size={18} />
            </DeleteButton>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}
