export const AREAS_CLIENTE = ["LA VEGA", "SANTIAGO", "PUERTO PLATA", "MOCA"];

export function normalizeAreaCliente(value) {
  return String(value || "").trim().toUpperCase();
}

export function isAreaClienteValida(value) {
  return AREAS_CLIENTE.includes(normalizeAreaCliente(value));
}

