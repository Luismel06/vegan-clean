import { supabase } from "./supabase.config";

// Crear cotización + items
export async function crearCotizacion({ cliente, numero_caso, descuento, total, items }) {

  // Insertar cotización principal
  const { data: cotizacion, error: errorCot } = await supabase
    .from("cotizaciones")
    .insert([
      {
        cliente,
        numero_caso,
        total,
        descuento,
        fecha: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (errorCot) {
    console.error(errorCot);
    throw new Error("Error al crear cotización.");
  }

  // Insertar items asociados
  const itemsPreparados = items.map((item) => ({
    cotizacion_id: cotizacion.id,
    producto_id: item.id,
    nombre_producto: item.nombre,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
    subtotal: item.cantidad * item.precio,
  }));

  const { error: errorItems } = await supabase
    .from("cotizacion_items")
    .insert(itemsPreparados);

  if (errorItems) {
    console.error(errorItems);
    throw new Error("Error al guardar los productos de la cotización.");
  }

  return cotizacion;
}

// Obtener cotizaciones
export async function obtenerCotizaciones() {
  const { data, error } = await supabase.from("cotizaciones").select("*");
  return data || [];
}

// Obtener items de cotización
export async function obtenerItemsCotizacion(cotizacion_id) {
  const { data, error } = await supabase
    .from("cotizacion_items")
    .select("*")
    .eq("cotizacion_id", cotizacion_id);

  return data || [];
}
