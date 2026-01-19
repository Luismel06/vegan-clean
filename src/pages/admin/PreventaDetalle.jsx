// src/pages/admin/PreventaDetalle.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";

const Wrap = styled.div`
  padding: 1.6rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  color: ${({ theme }) => theme.text};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1.2rem 1.3rem;
  margin-bottom: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 0.8rem 1rem;
  background: ${({ theme }) => theme.background};
`;

const Label = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
`;

const Value = styled.div`
  font-weight: 800;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.8rem;
`;

const Btn = styled.button`
  border: none;
  border-radius: 10px;
  padding: 0.65rem 0.95rem;
  font-weight: 900;
  cursor: pointer;
  background: ${({ theme }) => theme.accent};
  color: #000;
`;

const SecondaryBtn = styled(Btn)`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;

  th,
  td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    vertical-align: top;
  }
  th {
    background: ${({ theme }) => theme.background};
    font-weight: 900;
  }
`;

function labelCliente(cli) {
  if (!cli) return "-";
  if (cli.tipo_cliente === "empresa") {
    return `${cli.nombre || "-"} (RNC: ${cli.empresa_rnc || "-"})`;
  }
  return `${cli.nombre || "-"} (Cédula: ${cli.cedula || "-"})`;
}

function onlyDigits(v) {
  return String(v || "").replace(/\D/g, "");
}

export default function PreventaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [preventa, setPreventa] = useState(null);
  const [clienteRef, setClienteRef] = useState(null); // clientes join / lookup
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function buscarClienteFallback(p) {
    // Si no hay cliente_id, intentamos por documento si preventa guarda cedula/empresa_rnc
    const tipo = p?.tipo_cliente;
    const cedula = onlyDigits(p?.cedula);
    const rnc = onlyDigits(p?.empresa_rnc);

    try {
      if (tipo === "persona" && cedula) {
        const { data, error } = await supabase
          .from("clientes")
          .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar")
          .eq("cedula", cedula)
          .maybeSingle();
        if (!error && data) return data;
      }

      if (tipo === "empresa" && rnc) {
        const { data, error } = await supabase
          .from("clientes")
          .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar")
          .eq("empresa_rnc", rnc)
          .maybeSingle();
        if (!error && data) return data;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  async function cargar() {
    try {
      setLoading(true);

      // 1) PREVENTA (intentando join con clientes si existe cliente_id)
      // Si tu preventas no tiene cliente_id, igual funciona: el join vendrá null.
      const { data: p, error: ep } = await supabase
        .from("preventas")
        .select(`
          *,
          cliente_ref:clientes (
            id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion, es_recurrente, puede_fiar
          )
        `)
        .eq("id", id)
        .single();

      if (ep) throw ep;

      // 2) DETALLE (join a productos/equipos)
      const { data: d, error: ed } = await supabase
        .from("detalle_preventa")
        .select(`
          id,
          cantidad,
          producto_id,
          equipo_id,
          producto:productos ( id, nombre, marca, modelo ),
          equipo:equipos ( id, nombre, marca, modelo )
        `)
        .eq("preventa_id", id)
        .order("id", { ascending: true });

      if (ed) throw ed;

      setPreventa(p);
      setDetalle(d || []);

      // 3) Cliente preferente: join; si no, fallback por documento
      if (p?.cliente_ref) {
        setClienteRef(p.cliente_ref);
      } else {
        const fb = await buscarClienteFallback(p);
        setClienteRef(fb);
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar los detalles de la preventa.", "error");
    } finally {
      setLoading(false);
    }
  }

  const items = useMemo(() => {
    return (detalle || []).map((r) => {
      const isProducto = !!r.producto_id;
      const item = isProducto ? r.producto : r.equipo;
      return {
        id: r.id,
        tipo: isProducto ? "Producto" : "Equipo",
        nombre: item?.nombre || "-",
        marca: item?.marca || "-",
        modelo: item?.modelo || "-",
        cantidad: r.cantidad,
      };
    });
  }, [detalle]);

  async function setEstado(nuevo) {
    if (!preventa) return;
    const { error } = await supabase
      .from("preventas")
      .update({ estado: nuevo })
      .eq("id", preventa.id);

    if (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cambiar el estado.", "error");
      return;
    }
    cargar();
  }

  function crearCotizacion() {
    // Pasamos preventa y cliente_id si existe (para precargar en Cotizaciones.jsx)
    const clienteId = clienteRef?.id || preventa?.cliente_id || "";
    const qs = new URLSearchParams();
    qs.set("nuevo", "1");
    qs.set("preventa", String(id));
    if (clienteId) qs.set("cliente_id", String(clienteId));

    navigate(`/admin/cotizaciones?${qs.toString()}`);
  }

  if (loading) return <Wrap>Cargando...</Wrap>;
  if (!preventa) return <Wrap>No encontrada.</Wrap>;

  const clienteTitulo = clienteRef ? labelCliente(clienteRef) : (preventa.cliente || "-");
  const tipoCliente = clienteRef?.tipo_cliente || preventa.tipo_cliente || "-";

  return (
    <Wrap>
      <Card>
        <h2 style={{ marginTop: 0 }}>
          Preventa #{preventa.id} — {clienteTitulo}
        </h2>

        {clienteRef && (
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
            Recurrente: <strong>{clienteRef.es_recurrente ? "Sí" : "No"}</strong>{" "}
            · Puede fiar: <strong>{clienteRef.puede_fiar ? "Sí" : "No"}</strong>
          </div>
        )}

        <Grid>
          <Field>
            <Label>Tipo cliente</Label>
            <Value>{tipoCliente}</Value>
          </Field>

          <Field>
            <Label>Estado</Label>
            <Value>{preventa.estado}</Value>
          </Field>

          <Field>
            <Label>Contacto</Label>
            <Value>
              <div>{preventa.email || clienteRef?.email || "-"}</div>
              <div>{preventa.telefono || clienteRef?.telefono || "-"}</div>
            </Value>
          </Field>

          <Field>
            <Label>Dirección</Label>
            <Value>{preventa.direccion || clienteRef?.direccion || "-"}</Value>
          </Field>

          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Nota del cliente</Label>
            <Value>{preventa.nota_cliente || "-"}</Value>
          </Field>
        </Grid>

        <Actions>
          <Btn onClick={crearCotizacion}>Crear cotización desde preventa</Btn>
          <SecondaryBtn onClick={() => setEstado("en_revision")}>Marcar en revisión</SecondaryBtn>
          <SecondaryBtn onClick={() => setEstado("cotizando")}>Marcar cotizando</SecondaryBtn>
          <SecondaryBtn onClick={() => setEstado("cotizada")}>Marcar cotizada</SecondaryBtn>
        </Actions>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Items solicitados</h3>

        <Table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Cantidad</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5}>Sin ítems.</td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id}>
                  <td>{it.tipo}</td>
                  <td>{it.nombre}</td>
                  <td>{it.marca}</td>
                  <td>{it.modelo}</td>
                  <td>{it.cantidad}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </Wrap>
  );
}
