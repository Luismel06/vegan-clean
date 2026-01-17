import { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import emailjs from "emailjs-com";
import { supabase } from "../../supabase/supabase.config";
import { insertarSolicitud } from "../../supabase/crudSolicitudes";

//  === ESTILOS ===
const Container = styled.section`
  background: linear-gradient(180deg, #3a712dad, rgb(51 53 51 / 65%), #0136abb5);
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 6rem 1rem 4rem;
  text-align: center;
`;

/* ---- Consulta de caso ---- */
const CaseCard = styled.div`
  max-width: 900px;
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
  background: ${({ theme }) => theme.inputBackground};
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
      : $estado === "Cliente no se encontraba" ||
        $estado === "Cancelado"
      ? "rgba(231, 76, 60, 0.18)"
      : "rgba(241, 196, 15, 0.18)"};
  color: ${({ $estado }) =>
    $estado === "Completado" || $estado === "Finalizado"
      ? "#27ae60"
      : $estado === "En progreso" || $estado === "En proceso"
      ? "#16a085"
      : $estado === "Requiere reprogramación"
      ? "#e67e22"
      : $estado === "Cliente no se encontraba" ||
        $estado === "Cancelado"
      ? "#c0392b"
      : "#b7950b"};
`;

/* ---- Tabs y layout principal ---- */
const Tabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  background-color: ${({ $active, theme }) =>
    $active ? theme.accent : theme.cardBackground};
  color: ${({ $active, theme }) => ($active ? "#000000" : theme.text)};
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    opacity: 0.9;
  }
`;

const Content = styled(motion.div)`
  max-width: 900px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

/* ---- Tarjetas de servicios ---- */
const ServicioCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.background};
  transition: 0.3s;
  text-align: left;

  &:hover {
    background-color: ${({ theme }) => theme.cardBackground};
  }

  h3 {
    color: ${({ theme }) => theme.accent};
    margin-bottom: 0.4rem;
  }

  p {
    font-size: 0.95rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const SolicitarBtn = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #000000;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 0.8rem;
  }
`;

const Formulario = styled(motion.form)`
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  resize: none;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #000000;
  border: none;
  padding: 0.9rem 1.6rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
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

/* ---- Catálogo de productos ---- */
const ProductsWrapper = styled.div`
  text-align: left;
`;

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1rem;
`;

const SelectFilter = styled.select`
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
`;

const ProductCard = styled.div`
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 1rem;
  background-color: ${({ theme }) => theme.background};
  text-align: left;
  font-size: 0.9rem;
`;

const ProductTitle = styled.h4`
  margin: 0 0 0.2rem;
  color: #03b503;
`;

const ProductTag = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.inputBackground};
  margin-right: 0.3rem;
  margin-bottom: 0.2rem;
`;

const PriceText = styled.div`
  margin-top: 0.4rem;
  font-weight: 700;
`;

//  === COMPONENTE PRINCIPAL ===
export default function Servicios() {
  const [tab, setTab] = useState("disponibles");
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [tipoCliente, setTipoCliente] = useState("persona"); // "persona" | "empresa"

  // productos
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("");

  // consulta de caso
  const [caseNumero, setCaseNumero] = useState("");
  const [caseResult, setCaseResult] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);

  // 🔹 Cargar servicios desde Supabase
  useEffect(() => {
    const fetchServicios = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("servicios").select("*");
      if (error) {
        console.error("❌ Error al cargar servicios:", error);
      } else {
        setServicios(data || []);
      }
      setLoading(false);
    };
    fetchServicios();
  }, []);

  // Cargar productos catálogo
  useEffect(() => {
    const fetchProductos = async () => {
      setLoadingProductos(true);
      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, categoria, marca, modelo, proveedor, precio");
      if (error) {
        console.error("❌ Error al cargar productos:", error);
      } else {
        setProductos(data || []);
      }
      setLoadingProductos(false);
    };
    fetchProductos();
  }, []);

  // Alternar formulario
  const toggleFormulario = (id) => {
    setServicioSeleccionado(servicioSeleccionado === id ? null : id);
    setTipoCliente("persona"); // reset al abrir/cerrar
  };

  //  Generar número de caso único
  const generarNumeroCaso = () =>
    "CASE-" + Math.floor(100000 + Math.random() * 900000);

  //  Enviar correo de confirmación
  const enviarCorreoConfirmacion = async (
    nombre,
    email,
    numero_caso,
    servicio
  ) => {
    try {
      await emailjs.send(
        "service_kfvhwxq",
        "template_iy48pw3",
        {
          nombre,
          email,
          numero_caso,
          servicio,
        },
        "yoOeYAk8XPOIvEhbf"
      );
      console.log("  Correo enviado correctamente");
    } catch (error) {
      console.error("❌ Error al enviar correo:", error);
    }
  };

  // Enviar solicitud a Supabase
  const handleSubmit = async (e, s) => {
    e.preventDefault();
    const numero_caso = generarNumeroCaso();

    const cliente = e.target.cliente.value.trim();
    const email = e.target.email.value.trim();
    const telefono = e.target.telefono.value.trim();
    const descripcion = e.target.descripcion.value.trim();
    const direccion = e.target.direccion.value.trim();
    const tipo_cliente = e.target.tipo_cliente.value; // persona | empresa

    const empresa_nombre =
      tipo_cliente === "empresa"
        ? e.target.empresa_nombre.value.trim()
        : null;
    const empresa_rnc =
      tipo_cliente === "empresa" ? e.target.empresa_rnc.value.trim() : null;

    //   Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Correo electrónico no válido",
        text: "Por favor, introduce un correo electrónico válido (ejemplo@dominio.com).",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    if (!direccion) {
      Swal.fire({
        icon: "warning",
        title: "Dirección requerida",
        text: "Por favor, indica la dirección donde se realizará el servicio.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    const nuevaSolicitud = {
      cliente,
      email,
      telefono,
      descripcion,
      direccion,
      servicio_id: s.id,
      estado: "Solicitud enviada",
      tecnico_asignado: "",
      chat_link: "",
      numero_caso,
      tipo_cliente,
      empresa_nombre: tipo_cliente === "empresa" ? empresa_nombre : null,
      empresa_rnc: tipo_cliente === "empresa" ? empresa_rnc : null,
    };

    try {
      await insertarSolicitud(nuevaSolicitud);

      await enviarCorreoConfirmacion(cliente, email, numero_caso, s.nombre);

      Swal.fire({
        icon: "success",
        title: "Solicitud enviada correctamente",
        html: `
        <p>Tu número de caso es:</p>
        <h3 style="color:#00bcd4; font-weight:700;">${numero_caso}</h3>
        <p>También te enviamos un correo de confirmación con los detalles.</p>
      `,
        confirmButtonColor: "#00bcd4",
      });

      e.target.reset();
      setServicioSeleccionado(null);
    } catch (error) {
      console.error("❌ Error al registrar solicitud:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error al enviar la solicitud",
        text: "Por favor, intenta nuevamente más tarde.",
        confirmButtonColor: "#00bcd4",
      });
    }
  };

  // 🔍 Consulta de caso por número
  const handleBuscarCaso = async (e) => {
    e.preventDefault();
    const valor = caseNumero.trim();
    if (!valor) {
      Swal.fire({
        icon: "info",
        title: "Ingresa tu número de caso",
        text: "Ejemplo: CASE-123456",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    setCaseLoading(true);
    setCaseResult(null);

    try {
      // Primero buscamos por numero_caso
      let { data, error } = await supabase
        .from("solicitudes")
        .select("*, servicios(nombre)")
        .eq("numero_caso", valor)
        .maybeSingle();

      // Si no encuentra y el usuario puso solo un número, probamos por id
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
        const estadoFinal =
          data.estado_solicitud || data.estado || "Agendado";
        setCaseResult({
          numero_caso: data.numero_caso || `CASE-${data.id}`,
          cliente: data.cliente,
          servicio_nombre: data.servicios?.nombre || "No especificado",
          estado: estadoFinal,
          fecha_creacion: data.fecha
            ? new Date(data.fecha).toLocaleString()
            : "-",
          fecha_agendada: data.fecha_agendada
            ? new Date(data.fecha_agendada).toLocaleDateString()
            : "-",
          hora_agendada: data.hora_agendada || "-",
          tecnico: data.tecnico_asignado || "Pendiente de asignar",
          direccion: data.direccion || "-",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al consultar el caso",
        text: "Intenta nuevamente en unos minutos.",
        confirmButtonColor: "#00bcd4",
      });
    } finally {
      setCaseLoading(false);
    }
  };

  // filtros productos
  const categorias = Array.from(
    new Set((productos || []).map((p) => p.categoria || "Otros"))
  );

  const marcas = Array.from(
    new Set(
      (productos || [])
        .filter((p) =>
          categoriaFiltro ? (p.categoria || "Otros") === categoriaFiltro : true
        )
        .map((p) => p.marca || p.proveedor || "Sin marca")
    )
  );

  const productosFiltrados = (productos || []).filter((p) => {
    const cat = p.categoria || "Otros";
    const marca = p.marca || p.proveedor || "Sin marca";
    if (categoriaFiltro && cat !== categoriaFiltro) return false;
    if (marcaFiltro && marca !== marcaFiltro) return false;
    return true;
  });

  return (
    <Container>
      <h2 style={{ color: "#0591e9;", marginBottom: "1rem" }}>
        Nuestros Servicios
      </h2>

      {/* 🔍 CONSULTA DE CASO */}
      <CaseCard>
        <CaseTitle>Consulta el estado de tu caso</CaseTitle>
        <p style={{ fontSize: "0.85rem", opacity: 0.8, margin: 0 }}>
          Ingresa el número de caso que recibiste por correo
          (ej: <strong>CASE-123456</strong>) para ver su estado actual.
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
                No encontramos un caso con ese número. Verifica que lo hayas
                escrito correctamente.
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
                    <CaseStatusTag $estado={caseResult.estado}>
                      ● {caseResult.estado}
                    </CaseStatusTag>
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
                  <span>{caseResult.tecnico}</span>
                </CaseRow>
                <CaseRow>
                  <span>Dirección de trabajo:</span>
                  <span>{caseResult.direccion}</span>
                </CaseRow>
              </>
            )}
          </CaseResultBox>
        )}
      </CaseCard>

      {/* TABS */}
      <Tabs>
         <TabButton
          $active={tab === "disponibles"}
          onClick={() => setTab("disponibles")}
        >
          Servicios disponibles
        </TabButton>
        <TabButton
          $active={tab === "productos"}
          onClick={() => setTab("productos")}
        >
          Productos y equipos
        </TabButton>
      </Tabs>

      {/* TAB SERVICIOS */}
      {tab === "disponibles" ? (
        loading ? (
          <p>Cargando servicios...</p>
        ) : servicios.length === 0 ? (
          <p>No hay servicios disponibles por el momento.</p>
        ) : (
          <Content initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {servicios.map((s) => (
              <ServicioCard key={s.id}>
                <CardHeader>
                  <div>
                    <h3>{s.nombre}</h3>
                    <p>{s.descripcion}</p>
                  </div>
                  <SolicitarBtn onClick={() => toggleFormulario(s.id)}>
                    {servicioSeleccionado === s.id
                      ? "Cerrar formulario"
                      : "Solicitar servicio"}
                  </SolicitarBtn>
                </CardHeader>

                <AnimatePresence>
                  {servicioSeleccionado === s.id && (
                    <Formulario
                      onSubmit={(e) => handleSubmit(e, s)}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Tipo de cliente */}
                      <TipoClienteRow>
                        <span>¿Quién solicita el servicio?</span>
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

                      {tipoCliente === "empresa" && (
                        <>
                          <Input
                            name="empresa_nombre"
                            placeholder="Nombre o razón social de la empresa"
                            required={tipoCliente === "empresa"}
                          />
                          <Input
                            name="empresa_rnc"
                            placeholder="RNC o identificación fiscal"
                            required={tipoCliente === "empresa"}
                          />
                        </>
                      )}

                      <Input
                        name="cliente"
                        placeholder="Tu nombre completo"
                        required
                      />
                      <Input
                        name="email"
                        type="email"
                        placeholder="Tu correo electrónico"
                        required
                      />
                      <Input
                        name="telefono"
                        placeholder="Tu número de teléfono"
                        required
                      />
                      <Input
                        name="direccion"
                        placeholder="Dirección donde se realizará el servicio"
                        required
                      />
                      <TextArea
                        name="descripcion"
                        rows="3"
                        placeholder={`Describe brevemente el servicio de "${s.nombre}" que necesitas...`}
                        required
                      />
                      <Button type="submit">Enviar solicitud</Button>
                    </Formulario>
                  )}
                </AnimatePresence>
              </ServicioCard>
            ))}
          </Content>
        )
      ) : (
        /* TAB PRODUCTOS */
        <Content initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ProductsWrapper>
            <h3
              style={{
                textAlign: "left",
                marginTop: 0,
                marginBottom: "0.8rem",
                color: "#00bcd4",
              }}
            >
              Catálogo de cámaras y otros equipos
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                opacity: 0.8,
                textAlign: "left",
                marginBottom: "1rem",
              }}
            >
              Aquí puedes ver algunos de los modelos que utilizamos para las
              instalaciones: tipos de cámara, marcas y equipos relacionados.
            </p>

            {loadingProductos ? (
              <p>Cargando productos...</p>
            ) : productos.length === 0 ? (
              <p>
                Todavía no hemos publicado productos en el catálogo público.
              </p>
            ) : (
              <>
                <FiltersRow>
                  <SelectFilter
                    value={categoriaFiltro}
                    onChange={(e) => {
                      setCategoriaFiltro(e.target.value);
                      setMarcaFiltro("");
                    }}
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </SelectFilter>

                  <SelectFilter
                    value={marcaFiltro}
                    onChange={(e) => setMarcaFiltro(e.target.value)}
                  >
                    <option value="">Todas las marcas</option>
                    {marcas.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </SelectFilter>
                </FiltersRow>

                <ProductGrid>
                  {productosFiltrados.map((p) => (
                    <ProductCard key={p.id}>
                      <ProductTitle>{p.nombre}</ProductTitle>
                      <div style={{ marginBottom: "0.2rem" }}>
                        {p.categoria && (
                          <ProductTag>{p.categoria}</ProductTag>
                        )}
                        {(p.marca || p.proveedor) && (
                          <ProductTag>
                            {p.marca || p.proveedor}
                          </ProductTag>
                        )}
                      </div>
                      {p.modelo && (
                        <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                          Modelo: {p.modelo}
                        </div>
                      )}

                    </ProductCard>
                  ))}
                </ProductGrid>
              </>
            )}
          </ProductsWrapper>
        </Content>
      )}
    </Container>
  );
}
