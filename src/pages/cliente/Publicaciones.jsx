import { useEffect, useState } from "react";
import styled from "styled-components";
import { mostrarPublicaciones } from "../../supabase/crudPublicaciones";
import PublicacionCard from "../../components/templates/PublicacionCard";
import { Loader2 } from "lucide-react";

const Container = styled.div`
background: linear-gradient(180deg, #3a712dad, rgb(51 53 51 / 65%), #0136abb5);
  padding: calc(72px + 2rem) 2rem 3rem;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  transition: all 0.3s ease;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.accent};
  text-align: center;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5rem;
  color: ${({ theme }) => theme.accent};
`;

export default function Publicaciones() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      const data = await mostrarPublicaciones();
      setPublicaciones(data || []);
      setLoading(false);
    };
    cargarDatos();
  }, []);

  return (
    <Container>
      <Title>Servicios Recientes</Title>
      {loading ? (
        <Loader>
          <Loader2 className="spin" size={32} />
        </Loader>
      ) : publicaciones.length === 0 ? (
        <p style={{ textAlign: "center" }}>No hay publicaciones disponibles aún.</p>
      ) : (
        <Grid>
          {publicaciones.map((p) => (
  <PublicacionCard
    key={p.id}
    titulo={p.titulo}
    descripcion={p.descripcion}
    fecha={p.fecha}
    imagenes_publicacion={p.imagenes_publicacion} // 🔹 ¡AQUÍ ESTÁ LA CLAVE!
  />
))}

        </Grid>
      )}
    </Container>
  );
}
