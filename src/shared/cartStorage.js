// src/shared/cartStorage.js
const KEY = "vendedor_cart_v1";

export function loadCart() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart || []));
}

export function clearCart() {
  localStorage.removeItem(KEY);
}
