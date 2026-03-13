// src/pages/admin/Publicaciones.jsx
import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import {
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  UploadCloud,
  Tag,
  FileText,
  Type,
  X,
  Images,
  CalendarDays,
  Search,
} from "lucide-react";

/* =========================
   Animations
========================= */
const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

/* =========================
   Layout
========================= */
const Wrapper = styled.section`
  width: 100%;
  color: ${({ theme }) => theme.text};
`;

const Container = styled.div`
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const HeaderLeft = styled.div`
  min-width: 260px;

  h2 {
    margin: 0;
    font-weight: 950;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.heading};
    font-size: 1.35rem;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
  }

  p {
    margin: 0.35rem 0 0;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.88)};
    font-size: 0.92rem;
    line-height: 1.45;
    max-width: 75ch;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
`;

/* =========================
   Buttons
========================= */
const BtnBase = styled.button`
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.68rem 0.95rem;
  cursor: pointer;
  font-weight: 950;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.18s ease, border-color 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(1px);
  }
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.accentSoft};
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PrimaryBtn = styled(BtnBase)`
  background: ${({ theme }) => theme.accent};
  color: #fff;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
`;

const GhostBtn = styled(BtnBase)`
  background: ${({ theme }) => theme.cardBackground};
  border-color: ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};

  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

/* =========================
   Cards
========================= */
const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 22px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.18 : 0.08)});
`;

const FormCard = styled(Card)`
  padding: 1.05rem;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.8rem;

  h3 {
    margin: 0;
    font-weight: 950;
    color: ${({ theme }) => theme.heading};
    letter-spacing: -0.01em;
    font-size: 1.05rem;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
  }

  p {
    margin: 0.25rem 0 0;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.88)};
    font-size: 0.9rem;
    line-height: 1.45;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  border-radius: 18px;
  padding: 0.85rem 0.95rem;
  min-width: 0;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.82 : 0.86)};
`;

const Input = styled.input`
  width: 100%;
  margin-top: 0.45rem;
  padding: 0.78rem 0.9rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  font-weight: 800;

  &::placeholder {
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  margin-top: 0.45rem;
  padding: 0.78rem 0.9rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  resize: vertical;
  min-height: 110px;
  font-weight: 750;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

const Full = styled(Field)`
  grid-column: 1 / -1;
`;

/* =========================
   File input + previews
========================= */
const FileRow = styled.div`
  margin-top: 0.55rem;
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const FileHint = styled.div`
  font-size: 0.9rem;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.8 : 0.85)};
`;

const FileInput = styled.input`
  width: 100%;
  margin-top: 0.45rem;
  padding: 0.7rem 0.85rem;
  border-radius: 14px;
  border: 1px dashed ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

const PreviewStrip = styled.div`
  margin-top: 0.75rem;
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
`;

const Thumb = styled.div`
  position: relative;
  width: 84px;
  height: 84px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ThumbRemove = styled.button`
  position: absolute;
  right: 6px;
  top: 6px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.92;
  transition: transform 0.18s ease, opacity 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: scale(1.03);
    border-color: ${({ theme }) => theme.accent};
    opacity: 1;
  }
`;

/* =========================
   List + cards
========================= */
const ListHeader = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 240px;
  display: flex;
  gap: 0.6rem;
  align-items: center;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 999px;
  padding: 0.7rem 0.9rem;

  input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.accentSoft};
  }
`;

const Grid = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
`;

const PubCard = styled(Card)`
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Cover = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.background};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const CoverImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CoverFallback = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  opacity: 0.75;
`;

const CardBody = styled.div`
  padding: 0.95rem 1rem 0.9rem;
  display: grid;
  gap: 0.55rem;
`;

const CardTitle = styled.div`
  font-weight: 950;
  color: ${({ theme }) => theme.heading};
  letter-spacing: -0.01em;
  font-size: 1.02rem;
  line-height: 1.25;
`;

const CardDesc = styled.div`
  font-size: 0.93rem;
  line-height: 1.45;
  opacity: ${({ theme }) => (theme.mode === "dark" ? 0.86 : 0.9)};
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.2rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.38rem 0.65rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  font-weight: 950;
  font-size: 0.84rem;
  opacity: 0.95;
`;

const Gallery = styled.div`
  margin-top: 0.4rem;
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
`;

const Mini = styled.img`
  width: 62px;
  height: 62px;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
`;

const CardFooter = styled.div`
  padding: 0.8rem 1rem 1rem;
  display: flex;
  gap: 0.55rem;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const DangerBtn = styled(BtnBase)`
  padding: 0.6rem 0.8rem;
  border-radius: 999px;
  background: transparent;
  border-color: ${({ theme }) => theme.border};
  color: #e53935;

  &:hover {
    border-color: #e53935;
  }
`;

const Empty = styled.div`
  margin-top: 1rem;
  padding: 1.25rem 1rem;
  text-align: center;
  opacity: 0.85;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 18px;
  background: ${({ theme }) => theme.cardBackground};
`;

const LoadingGrid = styled.div`
  margin-top: 1rem;
  display: grid;
  gap: 0.6rem;
`;

const Skeleton = styled.div`
  height: 86px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  background-image: linear-gradient(
    90deg,
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")} 0%,
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)")} 50%,
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.35s ease infinite;
`;

/* =========================
   Helpers (no changes to logic)
========================= */
function safeText(v) {
  return String(v ?? "").trim();
}

function formatDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) return "-";
  return d.toLocaleDateString();
}

/* =======================================================
   COMPONENTE PRINCIPAL
======================================================= */
export default function Publicaciones() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPublicaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPublicaciones = async () => {
    try {
      setLoading(true);

      const { data: pubs, error } = await supabase.from("publicaciones").select("*").order("fecha", { ascending: false });

      if (error) throw error;

      const { data: imgData, error: imgErr } = await supabase.from("imagenes_publicacion").select("*");
      if (imgErr) throw imgErr;

      const pubsFinal = (pubs || []).map((p) => ({
        ...p,
        imagenes: (imgData || []).filter((i) => i.publicacion_id === p.id) || [],
      }));

      setPublicaciones(pubsFinal);
    } catch (e) {
      console.error("Error cargando publicaciones:", e);
      Swal.fire("Error", "No se pudieron cargar las publicaciones.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = safeText(search).toLowerCase();
    if (!q) return publicaciones || [];
    return (publicaciones || []).filter((p) => {
      const hay = [p.id, p.titulo, p.descripcion, p.categoria, p.creado_por, p.fecha]
        .map((x) => safeText(x).toLowerCase())
        .join(" | ");
      return hay.includes(q);
    });
  }, [publicaciones, search]);

  // === Subir varias imágenes ===
  const subirImagenes = async (files) => {
    const urls = [];

    for (const file of files) {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "");
      const fileName = `${Date.now()}-${cleanName}`;
      const filePath = `imagenes/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("publicaciones").upload(filePath, file);

      if (uploadError) {
        console.error("Error subiendo imagen:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from("publicaciones").getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }

    return urls;
  };

  // === Crear publicación ===
  const crearPublicacion = async () => {
    if (busy) return;

    if (!titulo.trim() || !descripcion.trim() || imagenes.length === 0) {
      Swal.fire("Campos incompletos", "Llena todos los campos y añade imágenes.", "warning");
      return;
    }

    try {
      setBusy(true);

      const imagenesUrls = await subirImagenes(imagenes);

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

      const imagenesInsert = imagenesUrls.map((url) => ({
        publicacion_id: nuevaPub.id,
        url,
      }));

      const { error: insErr } = await supabase.from("imagenes_publicacion").insert(imagenesInsert);
      if (insErr) throw insErr;

      Swal.fire("¡Publicación creada!", "Las imágenes fueron subidas correctamente.", "success");

      setTitulo("");
      setDescripcion("");
      setCategoria("");
      setImagenes([]);

      fetchPublicaciones();
    } catch (error) {
      Swal.fire("Error", "No se pudo crear la publicación.", "error");
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  // === Eliminar publicación ===
  const eliminarPublicacion = async (id, tituloPub) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar publicación?",
      text: `¿Deseas eliminar "${tituloPub}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53935",
    });

    if (!confirmar.isConfirmed) return;

    try {
      setBusy(true);

      await supabase.from("imagenes_publicacion").delete().eq("publicacion_id", id);
      await supabase.from("publicaciones").delete().eq("id", id);

      Swal.fire("Eliminada", "La publicación fue eliminada.", "success");
      fetchPublicaciones();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo eliminar la publicación.", "error");
    } finally {
      setBusy(false);
    }
  };

  // === Local previews (optional UX) ===
  const previews = useMemo(() => {
    const arr = Array.from(imagenes || []);
    return arr.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
  }, [imagenes]);

  useEffect(() => {
    return () => {
      // cleanup previews
      try {
        previews.forEach((p) => URL.revokeObjectURL(p.url));
      } catch {
        // ignore
      }
    };
  }, [previews]);

  function removeSelectedImage(index) {
    const next = Array.from(imagenes || []);
    next.splice(index, 1);
    setImagenes(next);
  }

  return (
    <Wrapper>
      <Container>
        <PageHeader>
          <HeaderLeft>
            <h2>
              <Images size={18} />
              Publicaciones
            </h2>
            <p>Crea publicaciones con múltiples imágenes (portada + galería) y administra el historial.</p>
          </HeaderLeft>

          <HeaderRight>
            <GhostBtn type="button" onClick={fetchPublicaciones} disabled={busy}>
              <RefreshCw size={16} /> Recargar
            </GhostBtn>
          </HeaderRight>
        </PageHeader>

        <FormCard>
          <FormHeader>
            <div>
              <h3>
                <UploadCloud size={18} />
                Crear publicación
              </h3>
              <p>La primera imagen será usada como portada.</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <GhostBtn
                type="button"
                onClick={() => {
                  setTitulo("");
                  setDescripcion("");
                  setCategoria("");
                  setImagenes([]);
                }}
                disabled={busy}
              >
                <X size={16} /> Limpiar
              </GhostBtn>
              <PrimaryBtn type="button" onClick={crearPublicacion} disabled={busy}>
                <ImageIcon size={18} /> {busy ? "Procesando..." : "Subir publicación"}
              </PrimaryBtn>
            </div>
          </FormHeader>

          <FormGrid>
            <Field>
              <Label>
                <Type size={14} />
                Título
              </Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Servicio de lavado profundo" />
            </Field>

            <Field>
              <Label>
                <Tag size={14} />
                Categoría
              </Label>
              <Input
                placeholder="Ej: Instalación, Networking..."
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </Field>

            <Full>
              <Label>
                <FileText size={14} />
                Descripción
              </Label>
              <TextArea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el servicio, alcance, condiciones, etc."
              />
            </Full>

            <Full>
              <Label>
                <Images size={14} />
                Imágenes (múltiples)
              </Label>

              <FileInput
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImagenes(Array.from(e.target.files || []))}
              />

              <FileRow>
                <FileHint>
                  Seleccionadas: <strong>{(imagenes || []).length}</strong> (la primera será portada)
                </FileHint>
                <FileHint style={{ opacity: 0.75 }}>Tip: usa imágenes horizontales para mejor portada.</FileHint>
              </FileRow>

              {previews.length > 0 ? (
                <PreviewStrip>
                  {previews.map((p, idx) => (
                    <Thumb key={`${p.file.name}-${idx}`}>
                      <ThumbImg src={p.url} alt={`preview-${idx}`} />
                      <ThumbRemove type="button" onClick={() => removeSelectedImage(idx)} title="Quitar">
                        <X size={14} />
                      </ThumbRemove>
                    </Thumb>
                  ))}
                </PreviewStrip>
              ) : null}
            </Full>
          </FormGrid>
        </FormCard>

        <ListHeader>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 950, color: "inherit" }}>
              Historial <span style={{ opacity: 0.7 }}>({filtered.length})</span>
            </div>
            <div style={{ opacity: 0.82, fontSize: 13 }}>Puedes buscar por título, categoría o texto.</div>
          </div>

          <SearchBox>
            <Search size={16} style={{ opacity: 0.8 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar publicaciones..." />
            {search.trim() ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  opacity: 0.75,
                  color: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                }}
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            ) : null}
          </SearchBox>
        </ListHeader>

        {loading ? (
          <LoadingGrid>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} />
            ))}
          </LoadingGrid>
        ) : filtered.length === 0 ? (
          <Empty>No hay publicaciones para mostrar.</Empty>
        ) : (
          <Grid>
            {filtered.map((p) => (
              <PubCard key={p.id}>
                <Cover>
                  {p.imagenes?.[0]?.url ? (
                    <CoverImg src={p.imagenes[0].url} alt={p.titulo || "publicación"} loading="lazy" />
                  ) : p.imagen_url ? (
                    <CoverImg src={p.imagen_url} alt={p.titulo || "publicación"} loading="lazy" />
                  ) : (
                    <CoverFallback>
                      <ImageIcon size={26} />
                    </CoverFallback>
                  )}
                </Cover>

                <CardBody>
                  <CardTitle>{p.titulo}</CardTitle>
                  <CardDesc>{p.descripcion}</CardDesc>

                  <MetaRow>
                    <Badge>
                      <Tag size={14} />
                      {p.categoria || "Sin categoría"}
                    </Badge>
                    <Badge>
                      <CalendarDays size={14} />
                      {formatDate(p.fecha)}
                    </Badge>
                  </MetaRow>

                  {p.imagenes?.length > 0 ? (
                    <Gallery>
                      {p.imagenes.slice(0, 6).map((img) => (
                        <Mini key={img.id} src={img.url} alt="img" loading="lazy" />
                      ))}
                      {p.imagenes.length > 6 ? (
                        <Badge style={{ padding: "0.38rem 0.55rem" }}>+{p.imagenes.length - 6}</Badge>
                      ) : null}
                    </Gallery>
                  ) : null}
                </CardBody>

                <CardFooter>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    ID: <strong>#{p.id}</strong>
                  </div>

                  <DangerBtn type="button" onClick={() => eliminarPublicacion(p.id, p.titulo)} disabled={busy}>
                    <Trash2 size={16} /> Eliminar
                  </DangerBtn>
                </CardFooter>
              </PubCard>
            ))}
          </Grid>
        )}
      </Container>
    </Wrapper>
  );
}
