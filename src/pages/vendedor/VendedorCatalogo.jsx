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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

const RemoveBtn = styled.button`
  margin-left: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  padding: 0.25rem 0.55rem;
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

function formatRD(v) {
  const n = Number(v || 0);
  return `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function cleanDoc(v) {
  return String(v || "").trim();
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

function safeImg(url) {
  return url && String(url).trim() ? String(url).trim() : "/inicio.png";
}

/** ===== Generar número de caso (igual idea que Servicios) ===== */
function generarNumeroCaso() {
  const y = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const ts = Date.now().toString().slice(-6);
  return `PV-${y}-${ts}-${rand}`;
}

/** ===== Validación Cédula Dominicana ===== */
function isValidCedulaRD(input) {
  const ced = digitsOnly(input);
  if (ced.length !== 11) return false;

  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    let p = Number(ced[i]) * weights[i];
    if (p >= 10) p = Math.floor(p / 10) + (p % 10);
    sum += p;
  }

  const check = (10 - (sum % 10)) % 10;
  return check === Number(ced[10]);
}

/** ===== Validación RNC (checksum) ===== */
function isValidRNC(input) {
  const r = digitsOnly(input);
  if (r.length !== 9) return false;

  const weights = [7, 9, 8, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 8; i++) sum += Number(r[i]) * weights[i];
  const mod = sum % 11;
  const check = mod === 0 ? 2 : mod === 1 ? 1 : 11 - mod;

  return check === Number(r[8]);
}

async function getMyUid() {
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user?.id) return data.user.id;
  return localStorage.getItem("user_id") || null;
}

function guessDocType(docRaw) {
  const d = digitsOnly(docRaw);
  if (d.length === 11) return "cedula";
  if (d.length === 9) return "rnc";
  return "unknown";
}

async function buscarClientePorDocumento(documento) {
  const doc = cleanDoc(documento);
  const docDigits = digitsOnly(doc);

  const { data: cliCed } = await supabase
    .from("clientes")
    .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion")
    .or(`cedula.eq.${doc},cedula.eq.${docDigits}`)
    .maybeSingle();

  if (cliCed) return cliCed;

  const { data: cliRnc } = await supabase
    .from("clientes")
    .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion")
    .or(`empresa_rnc.eq.${doc},empresa_rnc.eq.${docDigits}`)
    .maybeSingle();

  return cliRnc || null;
}

async function modalCrearCliente({ documento }) {
  const docDigits = digitsOnly(documento);
  const docType = guessDocType(documento);
  const defaultTipo = docType === "rnc" ? "empresa" : "persona";

  const { isConfirmed, value } = await Swal.fire({
    title: "Crear cliente",
    width: 820,
    showCancelButton: true,
    confirmButtonText: "Crear cliente",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    html: `
      <div style="text-align:left; font-size: 13px; opacity:.85; margin-bottom:10px;">
        No existe un cliente con ese documento. Créalo para poder enviar la orden.
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="font-weight:800; display:block; margin-bottom:6px;">Tipo</label>
          <select id="tipo_cliente" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;">
            <option value="persona">persona</option>
            <option value="empresa">empresa</option>
          </select>
        </div>

        <div>
          <label style="font-weight:800; display:block; margin-bottom:6px;">Documento</label>
          <input id="doc" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;"
            value="${docDigits}" />
          <div style="margin-top:6px; font-size:12px; opacity:.75;">
            Persona: cédula (11 dígitos). Empresa: RNC (9 dígitos).
          </div>
        </div>

        <div style="grid-column: 1 / -1;">
          <label style="font-weight:800; display:block; margin-bottom:6px;">Nombre / Razón social</label>
          <input id="nombre" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;" placeholder="Ej: Juan Pérez / Empresa SRL" />
        </div>

        <div>
          <label style="font-weight:800; display:block; margin-bottom:6px;">Teléfono</label>
          <input id="telefono" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;" placeholder="809..." />
        </div>

        <div>
          <label style="font-weight:800; display:block; margin-bottom:6px;">Email</label>
          <input id="email" type="email" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;" placeholder="correo@dominio.com" />
        </div>

        <div style="grid-column: 1 / -1;">
          <label style="font-weight:800; display:block; margin-bottom:6px;">Dirección</label>
          <input id="direccion" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;" placeholder="Dirección del cliente" />
        </div>
      </div>
    `,
    didOpen: () => {
      const tipoEl = document.getElementById("tipo_cliente");
      tipoEl.value = defaultTipo;
    },
    preConfirm: () => {
      const tipo_cliente = document.getElementById("tipo_cliente").value;
      const doc = digitsOnly(document.getElementById("doc").value);
      const nombre = cleanDoc(document.getElementById("nombre").value);
      const telefono = cleanDoc(document.getElementById("telefono").value);
      const email = cleanDoc(document.getElementById("email").value);
      const direccion = cleanDoc(document.getElementById("direccion").value);

      if (!nombre) {
        Swal.showValidationMessage("Debes escribir el nombre / razón social.");
        return null;
      }

      if (tipo_cliente === "persona") {
        if (!isValidCedulaRD(doc)) {
          Swal.showValidationMessage("Cédula inválida. Debe ser de 11 dígitos y válida.");
          return null;
        }
      } else {
        if (!isValidRNC(doc)) {
          Swal.showValidationMessage("RNC inválido. Debe ser de 9 dígitos y válido.");
          return null;
        }
      }

      return { tipo_cliente, doc, nombre, telefono, email, direccion };
    },
  });

  if (!isConfirmed || !value) return null;

  const payload = {
    tipo_cliente: value.tipo_cliente,
    nombre: value.nombre,
    cedula: value.tipo_cliente === "persona" ? value.doc : null,
    empresa_rnc: value.tipo_cliente === "empresa" ? value.doc : null,
    telefono: value.telefono || null,
    email: value.email || null,
    direccion: value.direccion || null,
  };

  const onConflict = value.tipo_cliente === "persona" ? "cedula" : "empresa_rnc";

  const { data, error } = await supabase
    .from("clientes")
    .upsert(payload, { onConflict })
    .select("id, tipo_cliente, nombre, cedula, empresa_rnc, telefono, email, direccion")
    .single();

  if (error) throw error;
  return data;
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

  async function pedirDocumentoConValidacion() {
    const { isConfirmed, value } = await Swal.fire({
      title: "Documento del cliente",
      input: "text",
      inputLabel: "Escribe la cédula (11 dígitos) o el RNC (9 dígitos)",
      inputPlaceholder: "Ej: 40212312312 o 101123456",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      preConfirm: (v) => {
        const raw = cleanDoc(v);
        const d = digitsOnly(raw);
        const t = guessDocType(raw);

        if (!d) {
          Swal.showValidationMessage("Debes escribir la cédula o RNC.");
          return null;
        }
        if (t === "cedula" && !isValidCedulaRD(d)) {
          Swal.showValidationMessage("Cédula inválida. Verifica los 11 dígitos.");
          return null;
        }
        if (t === "rnc" && !isValidRNC(d)) {
          Swal.showValidationMessage("RNC inválido. Verifica los 9 dígitos.");
          return null;
        }
        if (t === "unknown") {
          Swal.showValidationMessage("Documento inválido. Cédula=11 dígitos, RNC=9 dígitos.");
          return null;
        }

        return d; // solo dígitos
      },
    });

    if (!isConfirmed) return null;
    return value || null;
  }

  async function enviarOrden() {
    if (!cart.length) {
      Swal.fire("Carrito vacío", "Agrega productos/equipos antes de enviar.", "warning");
      return;
    }

    const documento = await pedirDocumentoConValidacion();
    if (!documento) return;

    try {
      // 1) Buscar cliente
      let cliente = await buscarClientePorDocumento(documento);

      // 2) Si no existe, crear cliente
      if (!cliente) {
        cliente = await modalCrearCliente({ documento });
        if (!cliente) return;
      }

      // 3) Crear preventa vinculada + vendedor_id + numero_caso
      const myUid = await getMyUid();
      if (!myUid) {
        Swal.fire("Sesión", "No se detectó usuario autenticado. Inicia sesión.", "warning");
        return;
      }

      const tipoCliente = cliente.tipo_cliente || "persona";
      const numero_caso = generarNumeroCaso();

      const payloadPreventa = {
        numero_caso,              // ✅ NUEVO
        vendedor_id: myUid,       // ✅ CAMBIO: vendedor_id (no vendedor_uid)
        cliente_id: cliente.id,
        tipo_cliente: tipoCliente,
        cliente: cliente.nombre || "Cliente",
        cedula: tipoCliente === "persona" ? (cliente.cedula || documento) : null,
        empresa_nombre: tipoCliente === "empresa" ? cliente.nombre : null,
        empresa_rnc: tipoCliente === "empresa" ? (cliente.empresa_rnc || documento) : null,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        estado: "enviada",
      };

      const { data: prev, error: ePrev } = await supabase
        .from("preventas")
        .insert(payloadPreventa)
        .select("id, numero_caso")
        .single();

      if (ePrev) throw ePrev;

      const preventaId = prev.id;

      // 4) Insertar detalle_preventa
      const detalles = cart.map((it) => ({
        preventa_id: preventaId,
        cantidad: Number(it.cantidad || 1),
        producto_id: it.tipo === "producto" ? it.item_id : null,
        equipo_id: it.tipo === "equipo" ? it.item_id : null,
      }));

      const { error: eDet } = await supabase.from("detalle_preventa").insert(detalles);
      if (eDet) throw eDet;

      Swal.fire(
        "Orden enviada",
        `Preventa creada.\n#Caso: ${prev.numero_caso || numero_caso}\nID: #${preventaId}`,
        "success"
      );

      clearCart();
      setCart([]);
    } catch (e) {
      console.error(e);

      // Si choca con el unique de numero_caso (muy raro), reintenta 1 vez
      const msg = String(e?.message || "");
      if (msg.toLowerCase().includes("preventas_numero_caso_uq")) {
        try {
          const documento2 = documento;
          let cliente2 = await buscarClientePorDocumento(documento2);
          if (!cliente2) cliente2 = await modalCrearCliente({ documento: documento2 });
          if (!cliente2) return;

          const myUid2 = await getMyUid();
          const numero_caso2 = generarNumeroCaso();

          const payload2 = {
            numero_caso: numero_caso2,
            vendedor_id: myUid2,
            cliente_id: cliente2.id,
            tipo_cliente: cliente2.tipo_cliente || "persona",
            cliente: cliente2.nombre || "Cliente",
            cedula: (cliente2.tipo_cliente || "persona") === "persona" ? (cliente2.cedula || documento2) : null,
            empresa_nombre: (cliente2.tipo_cliente || "persona") === "empresa" ? cliente2.nombre : null,
            empresa_rnc: (cliente2.tipo_cliente || "persona") === "empresa" ? (cliente2.empresa_rnc || documento2) : null,
            telefono: cliente2.telefono,
            email: cliente2.email,
            direccion: cliente2.direccion,
            estado: "enviada",
          };

          const { data: prev2, error: ePrev2 } = await supabase
            .from("preventas")
            .insert(payload2)
            .select("id, numero_caso")
            .single();
          if (ePrev2) throw ePrev2;

          const preventaId2 = prev2.id;

          const detalles2 = cart.map((it) => ({
            preventa_id: preventaId2,
            cantidad: Number(it.cantidad || 1),
            producto_id: it.tipo === "producto" ? it.item_id : null,
            equipo_id: it.tipo === "equipo" ? it.item_id : null,
          }));

          const { error: eDet2 } = await supabase.from("detalle_preventa").insert(detalles2);
          if (eDet2) throw eDet2;

          Swal.fire(
            "Orden enviada",
            `Preventa creada.\n#Caso: ${prev2.numero_caso}\nID: #${preventaId2}`,
            "success"
          );
          clearCart();
          setCart([]);
          return;
        } catch (e2) {
          console.error(e2);
        }
      }

      Swal.fire("Error", "No se pudo enviar la orden.", "error");
    }
  }

  return (
    <Wrap>
      <TopBar>
        <div>
          <Title>Catálogo vendedor</Title>
          <Sub>Precios fijos. Agrega ítems al carrito y envía la orden vinculada a cliente (cédula/RNC).</Sub>
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
              {cart.slice(0, 4).map((x, idx) => (
                <div key={idx} style={{ marginTop: 6 }}>
                  • {x.tipo} {x.nombre} × {x.cantidad}{" "}
                  <span style={{ opacity: 0.7 }}>
                    ({x.tipo === "producto" ? `P-${x.item_id}` : `E-${x.item_id}`})
                  </span>
                  <RemoveBtn onClick={() => removeFromCart(x.tipo, x.item_id)}>Quitar</RemoveBtn>
                </div>
              ))}
              {cart.length > 4 ? <div>… y {cart.length - 4} más</div> : null}
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
