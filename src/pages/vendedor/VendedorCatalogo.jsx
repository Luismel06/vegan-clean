// src/pages/vendedor/VendedorCatalogo.jsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { supabase } from "../../supabase/supabase.config.jsx";
import { loadCart, saveCart, clearCart } from "../../shared/cartStorage.js";

const Wrap = styled.section`
  padding: 1.6rem 2rem;
  color: ${({ theme }) => theme.text};
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
`;

const Sub = styled.div`
  opacity: 0.8;
  font-size: 0.9rem;
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
  padding: 0.5rem 0.9rem;
  font-weight: 900;
  cursor: pointer;
`;

const Grid = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  gap: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(220px, 1fr));
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  font-weight: 900;
  font-size: 1rem;
`;

const Meta = styled.div`
  opacity: 0.85;
  font-size: 0.9rem;
`;

const Price = styled.div`
  font-weight: 900;
  margin-top: 2px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
`;

const Qty = styled.input`
  width: 70px;
  padding: 0.45rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Btn = styled.button`
  border: none;
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  font-weight: 900;
  cursor: pointer;
  background: ${({ theme }) => theme.accent};
  color: #000;
`;

const Secondary = styled(Btn)`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const Drawer = styled.div`
  position: sticky;
  bottom: 14px;
  margin-top: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 14px;
  padding: 0.9rem 1rem;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

function formatRD(v) {
  const n = Number(v || 0);
  return `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function cleanDoc(v) {
  return String(v || "").trim();
}

function safeImg(url) {
  return url && String(url).trim() ? String(url).trim() : "/inicio.png";
}

async function getVendedorId() {
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user?.id) return data.user.id;

  const ls = localStorage.getItem("user_id");
  return ls || null;
}

export default function VendedorCatalogo() {
  const [tab, setTab] = useState("productos");
  const [loading, setLoading] = useState(true);

  const [productos, setProductos] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [cart, setCart] = useState(() => loadCart());
  const [qtyDraft, setQtyDraft] = useState({});

  useEffect(() => {
    cargar();
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

  async function enviarOrden() {
    if (!cart.length) {
      Swal.fire("Carrito vacío", "Agrega productos/equipos antes de enviar.", "warning");
      return;
    }

    const vendedorId = await getVendedorId();
    if (!vendedorId) {
      Swal.fire("Sesión", "No se detectó el vendedor (user_id). Inicia sesión nuevamente.", "warning");
      return;
    }

    const { value: doc } = await Swal.fire({
      title: "Documento del cliente",
      input: "text",
      inputLabel: "Escribe la cédula (persona) o el RNC (empresa)",
      inputPlaceholder: "Ej: 40212312312 o 1-01-12345-6",
      showCancelButton: true,
      confirmButtonText: "Buscar cliente",
      cancelButtonText: "Cancelar",
      inputValidator: (v) => (!cleanDoc(v) ? "Debes escribir la cédula o RNC." : null),
    });
    if (!doc) return;

    const documento = cleanDoc(doc);

    try {
      const { data: cliByCed } = await supabase
        .from("clientes")
        .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion")
        .eq("cedula", documento)
        .maybeSingle();

      const cliente = cliByCed
        ? cliByCed
        : (
            await supabase
              .from("clientes")
              .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion")
              .eq("empresa_rnc", documento)
              .maybeSingle()
          ).data;

      if (!cliente) {
        Swal.fire(
          "Cliente no encontrado",
          "No existe un cliente con esa cédula/RNC. Primero debe registrarse en el formulario del cliente.",
          "error"
        );
        return;
      }

      const tipoCliente = cliente.tipo_cliente || "persona";

      const payloadPreventa = {
        vendedor_id: vendedorId, // ✅ CLAVE PARA FILTRAR
        cliente_id: cliente.id,
        tipo_cliente: tipoCliente,
        cliente: cliente.nombre || "Cliente",

        cedula: tipoCliente === "persona" ? cliente.cedula : null,
        empresa_nombre: tipoCliente === "empresa" ? cliente.nombre : null,
        empresa_rnc: tipoCliente === "empresa" ? cliente.empresa_rnc : null,

        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        estado: "enviada",
      };

      const { data: prev, error: ePrev } = await supabase
        .from("preventas")
        .insert(payloadPreventa)
        .select("id")
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

      Swal.fire("Orden enviada", `Preventa creada (#${preventaId}).`, "success");
      clearCart();
      setCart([]);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo enviar la orden.", "error");
    }
  }

  return (
    <Wrap>
      <TopBar>
        <div>
          <Title>Catálogo vendedor</Title>
          <Sub>Precios fijos. Agrega ítems al carrito y envía la orden vinculada a cliente.</Sub>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Tabs>
            <Tab $active={tab === "productos"} onClick={() => setTab("productos")}>
              Productos
            </Tab>
            <Tab $active={tab === "equipos"} onClick={() => setTab("equipos")}>
              Equipos
            </Tab>
          </Tabs>
          <Secondary onClick={cargar}>Recargar</Secondary>
        </div>
      </TopBar>

      {loading ? (
        <div style={{ marginTop: 12, opacity: 0.8 }}>Cargando...</div>
      ) : (
        <Grid>
          {list.map((it) => {
            const tipo = tab === "productos" ? "producto" : "equipo";
            const k = keyOf(tipo, it.id);

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
                  </Meta>
                  <Price>{formatRD(it.precio)}</Price>

                  <Actions>
                    <Qty
                      type="number"
                      min="1"
                      value={qtyDraft[k] ?? 1}
                      onChange={(e) => setQtyDraft((p) => ({ ...p, [k]: Number(e.target.value) }))}
                    />
                    <Btn onClick={() => addToCart(tipo, it)}>Agregar</Btn>
                  </Actions>
                </Body>
              </Card>
            );
          })}
        </Grid>
      )}

      <Drawer>
        <div>
          <div style={{ fontWeight: 900 }}>Carrito: {cart.length} ítem(s)</div>
          <div style={{ opacity: 0.85 }}>
            Subtotal estimado: <strong>{formatRD(cartSubtotal)}</strong>
          </div>

          {cart.length > 0 ? (
            <div style={{ marginTop: 8, opacity: 0.85, fontSize: 13 }}>
              {cart.slice(0, 3).map((x, idx) => (
                <div key={idx}>
                  • {x.tipo} {x.nombre} × {x.cantidad}{" "}
                  <span style={{ opacity: 0.7 }}>
                    ({x.tipo === "producto" ? `P-${x.item_id}` : `E-${x.item_id}`})
                  </span>
                  <button
                    style={{ marginLeft: 8, cursor: "pointer" }}
                    onClick={() => removeFromCart(x.tipo, x.item_id)}
                  >
                    quitar
                  </button>
                </div>
              ))}
              {cart.length > 3 ? <div>… y {cart.length - 3} más</div> : null}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
        </div>
      </Drawer>
    </Wrap>
  );
}
