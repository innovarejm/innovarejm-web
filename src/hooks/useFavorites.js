import { useSyncExternalStore } from 'react';

// Favoritos guardados en este navegador (no se comparten entre dispositivos).
const KEY = "innovare:favoritos";
const listeners = new Set();

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

let favs = read();

function write(next) {
  favs = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* modo privado: solo en memoria */ }
  listeners.forEach(l => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useFavorites() {
  const list = useSyncExternalStore(subscribe, () => favs, () => favs);
  return {
    favorites: list,
    isFav: (id) => list.includes(id),
    toggle: (id) => write(list.includes(id) ? list.filter(x => x !== id) : [...list, id]),
  };
}
