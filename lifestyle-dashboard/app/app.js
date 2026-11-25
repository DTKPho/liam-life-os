"use strict";
/* =========================================================
   Mon Lifestyle — cœur de l'application
   (le module Vacances est dans trips.js)
   ========================================================= */
const KEY = "lifestyle-dashboard-v1";
const bridge = window.lifestyle || null; // fourni par l'appli desktop (fichiers sur disque)

// ---------- Icônes ----------
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  car: '<path d="M3 13l2-5.2A2 2 0 0 1 6.9 6.5h10.2a2 2 0 0 1 1.9 1.3L21 13v4a1 1 0 0 1-1 1h-1M3 13v4a1 1 0 0 0 1 1h1M3 13h18M9.5 18h5"/><circle cx="7.2" cy="18" r="1.8"/><circle cx="16.8" cy="18" r="1.8"/>',
  moto: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 10h5l4.5 6.5M14 10l-2-4H9.5M12 16.5h-1L9 10"/>',
  boat: '<path d="M3 18c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0M5 15l-1.5-4h17L18 15M12 11V3l5 4.5h-5"/>',
  plane: '<path d="M2 16l8.5-3V5.5a1.5 1.5 0 0 1 3 0V13l8.5 3v2l-8.5-2v3.5L16 21v1.5L12 21.3 8 22.5V21l2.5-1.5V16L2 18z"/>',
  watch: '<circle cx="12" cy="12" r="6"/><path d="M9 6.5 9.6 2h4.8l.6 4.5M9 17.5l.6 4.5h4.8l.6-4.5M12 9.5V12l1.6 1.6"/>',
  jewel: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M10 3 8 9l4 12 4-12-2-6"/>',
  bag: '<path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9zM9 8V6.5a3 3 0 0 1 6 0V8"/>',
  fashion: '<path d="M8.5 3 4 5 2 10l3 1.2V21h14v-9.8l3-1.2-2-5-4.5-2a3.5 3.5 0 0 1-7 0z"/>',
  art: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  wine: '<path d="M8 2h8l-.4 6.2a3.6 3.6 0 0 1-7.2 0zM12 12v9M8.5 21h7"/>',
  tech: '<rect x="2" y="4.5" width="20" height="13" rx="1.5"/><path d="M8 21h8M12 17.5V21"/>',
  sneakers: '<path d="M3 17V9l4 1.5 2.5-3 3 4 8 2.6a1.5 1.5 0 0 1 1 1.4V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 15h19"/>',
  travel: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M8 7v13M16 7v13"/>',
  invest: '<path d="M3 20h18M5 16l4.5-5 3.5 3 6-7M15 7h4v4"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  collect: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M10 17h4v4h-4z"/>',
  sport: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8"/>',
  other: '<path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  left: '<path d="m15 6-6 6 6 6"/>', right: '<path d="m9 6 6 6-6 6"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
  train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l-2-4M15 21l2-4M9 14h.01M15 14h.01"/>',
  bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3M8 15h.01M16 15h.01"/>',
  bed: '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11.5" r="1.5"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 13.5h.01"/>',
  book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v16H5.5A1.5 1.5 0 0 0 4 20.5zM4 20.5A1.5 1.5 0 0 0 5.5 22H20"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
  utensils: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M5 3v8a2 2 0 0 0 2 2M17 21V3c-2 1-3 3.5-3 7s1 4 3 4"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
};
const icon = (k, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24">${ICONS[k] || ICONS.other}</svg>`;

// ---------- Types de collection (champs proposés) ----------
const TYPES = {
  home:     { label: "Immobilier",   fields: [["address","Adresse",1],["kind","Type de bien"],["surface","Surface (m²)"],["rooms","Pièces"],["land","Terrain (m²)"]] },
  car:      { label: "Automobile",   fields: [["mileage","Kilométrage"],["plate","Immatriculation"],["power","Puissance (ch)"],["color","Couleur"],["vin","N° de châssis (VIN)",1]] },
  moto:     { label: "Moto",         fields: [["mileage","Kilométrage"],["plate","Immatriculation"],["engine","Cylindrée"],["color","Couleur"]] },
  boat:     { label: "Nautisme",     fields: [["length","Longueur (m)"],["port","Port d'attache"],["engine","Motorisation"],["flag","Pavillon"]] },
  plane:    { label: "Aviation",     fields: [["reg","Immatriculation"],["hours","Heures de vol"],["base","Base"],["seats","Places"]] },
  watch:    { label: "Horlogerie",   fields: [["ref","Référence"],["serial","N° de série"],["size","Diamètre (mm)"],["papers","Boîte & papiers"],["service","Dernière révision"]] },
  jewel:    { label: "Joaillerie",   fields: [["material","Matière"],["carats","Carats"],["cert","Certificat",1]] },
  bag:      { label: "Maroquinerie", fields: [["ref","Référence"],["material","Matière"],["color","Couleur"],["size","Taille"]] },
  fashion:  { label: "Mode",         fields: [["size","Taille"],["color","Couleur"],["material","Matière"]] },
  art:      { label: "Art",          fields: [["artist","Artiste"],["technique","Technique"],["dims","Dimensions"],["cert","Certificat / provenance",1]] },
  wine:     { label: "Cave",         fields: [["domain","Domaine"],["vintage","Millésime"],["qty","Quantité"],["format","Format"]] },
  tech:     { label: "Tech",         fields: [["serial","N° de série"],["warranty","Garantie jusqu'au"]] },
  sneakers: { label: "Sneakers",     fields: [["size","Pointure"],["colorway","Coloris"],["sku","Référence (SKU)"],["condition","État"]] },
  sport:    { label: "Sport",        fields: [["size","Taille"],["condition","État"],["serial","N° de série"]] },
  music:    { label: "Musique",      fields: [["serial","N° de série"],["condition","État"],["madeYear","Année de fabrication"]] },
  collect:  { label: "Collection",   fields: [["edition","Édition"],["number","Numéro"],["cert","Certificat / authenticité",1]] },
  invest:   { label: "Investissements", fields: [["platform","Plateforme / banque"],["ticker","Ticker / ISIN"],["qty","Quantité"]] },
  other:    { label: "Autre",        fields: [] },
};
const VEHICLE_TYPES = ["car", "moto", "boat", "plane"];
const DEFAULT_CATS = [
  { id: "maison",  name: "Immobilier", type: "home" },
  { id: "voiture", name: "Garage",     type: "car" },
  { id: "montre",  name: "Horlogerie", type: "watch" },
];
const DEFAULT_SETTINGS = { theme: "day", bg: null, bgVeil: 55, bgBlur: 0, name: "" };

// Ambiance de chaque type de collection
const THEMES = {
  home:     { layout: "estate",   kicker: "Portfolio immobilier", one: "propriété", many: "propriétés", add: "Ajouter une propriété", glow: "176,128,62" },
  car:      { layout: "showroom", kicker: "Showroom privé", one: "véhicule", many: "véhicules", add: "Ajouter un véhicule", glow: "96,124,170" },
  moto:     { layout: "showroom", kicker: "Garage moto", one: "moto", many: "motos", add: "Ajouter une moto", glow: "190,104,72" },
  boat:     { layout: "showroom", kicker: "Flotte privée", one: "bateau", many: "bateaux", add: "Ajouter un bateau", glow: "60,130,180" },
  plane:    { layout: "showroom", kicker: "Hangar privé", one: "appareil", many: "appareils", add: "Ajouter un appareil", glow: "120,135,165" },
  sneakers: { layout: "showroom", kicker: "Vitrine", one: "paire", many: "paires", add: "Ajouter une paire", glow: "200,110,70" },
  watch:    { layout: "vault",    kicker: "Coffre horloger", one: "garde-temps", many: "garde-temps", add: "Ajouter une montre", glow: "176,128,62" },
  jewel:    { layout: "vault",    kicker: "Écrin", one: "pièce", many: "pièces", add: "Ajouter un bijou", glow: "160,110,180" },
  bag:      { layout: "vault",    kicker: "Maroquinerie", one: "pièce", many: "pièces", add: "Ajouter une pièce", glow: "180,120,80" },
  fashion:  { layout: "vault",    kicker: "Dressing", one: "pièce", many: "pièces", add: "Ajouter une pièce", glow: "150,135,120" },
  art:      { layout: "gallery",  kicker: "Galerie privée", one: "œuvre", many: "œuvres", add: "Ajouter une œuvre", glow: "190,160,120" },
  wine:     { layout: "cellar",   kicker: "La cave", one: "référence", many: "références", add: "Ajouter une bouteille", glow: "150,50,60" },
};
const themeOf = (c) => ({ layout: "grid", one: "bien", many: "biens", add: "Ajouter un bien", glow: "165,118,47", ...(THEMES[c?.type] || {}), kicker: THEMES[c?.type]?.kicker || TYPES[c?.type]?.label || "Collection" });

// ---------- Utilitaires ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v) => { const n = parseFloat(String(v ?? "").replace(/[\s €]/g, "").replace(",", ".")); return isFinite(n) ? n : 0; };
const eur = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const short = (n) => {
  const a = Math.abs(n);
  if (a >= 1e6) return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n / 1e6) + " M€";
  if (a >= 1e4) return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n / 1e3) + " k€";
  return eur(n);
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clone = (o) => JSON.parse(JSON.stringify(o));
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
const valueOf = (it) => num(it.value) || num(it.buyPrice);
const toDate = (d) => new Date(d + "T00:00:00");
const fmtDate = (d, o = { day: "numeric", month: "long", year: "numeric" }) => d ? toDate(d).toLocaleDateString("fr-FR", o) : "";
const photoSrc = (ref) => /^(data:|https?:|file:|blob:)/.test(ref) ? ref : "lsphoto://img/" + encodeURIComponent(ref);
const plural = (n, th) => `${n} ${n > 1 ? th.many : th.one}`;
const deltaPill = (buy, val) => {
  if (!buy || !val) return "";
  const d = (val - buy) / buy * 100;
  const cls = Math.abs(d) < 0.05 ? "flat" : d > 0 ? "up" : "down";
  return `<span class="pill ${cls}">${d > 0 ? "+" : ""}${d.toFixed(1).replace(".", ",")} %</span>`;
};
const starsRo = (n) => n ? `<span class="stars-ro">${"★".repeat(n)}<span class="off">${"★".repeat(5 - n)}</span></span>` : "";
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

// ---------- État ----------
let state = null;
const ui = { view: "overview", tab: "owned", q: "", detailId: null, detailIdx: 0, lastView: null, lb: [] };
const ACTIONS = {};   // actions de clic (data-action), étendues par trips.js
const VIEWS = {};     // vues additionnelles (trips.js)
const DROPS = {};     // cibles d'ajout de photos : "type:argument"

function normalize(s) {
  if (!s || !Array.isArray(s.categories) || !Array.isArray(s.items)) return null;
  const legacy = { maison: "home", voiture: "car", montre: "watch" };
  s.categories.forEach(c => { if (!c.type) c.type = legacy[c.id] || "other"; delete c.emoji; delete c.color; });
  s.items.forEach(it => {
    if (!Array.isArray(it.photos)) it.photos = it.photo ? [it.photo] : [];
    delete it.photo;
    if (!it.specs) it.specs = {};
    if (!it.owner) it.owner = "me";
  });
  s.settings = { ...DEFAULT_SETTINGS, ...(s.settings || {}) };
  s.trips = Array.isArray(s.trips) ? s.trips.map(t => typeof normalizeTrip === "function" ? normalizeTrip(t) : t) : [];
  return s;
}
async function loadState() {
  if (bridge) {
    try { const raw = await bridge.load(); if (raw) { const s = normalize(JSON.parse(raw)); if (s) return s; } } catch (e) { console.error(e); }
  }
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = normalize(JSON.parse(raw)); if (s) return s; } } catch (e) {}
  return normalize({ categories: DEFAULT_CATS.map(c => ({ ...c })), items: [] });
}
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const json = JSON.stringify(state);
    if (bridge) { try { await bridge.save(json); return; } catch (e) { toast("Erreur d'enregistrement"); console.error(e); } }
    try { localStorage.setItem(KEY, json); }
    catch (e) { toast("Stockage du navigateur plein : utilise l'appli desktop pour plus de photos"); }
  }, 150);
}

// ---------- Photos ----------
async function storePhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const max = bridge ? 2400 : 1200;
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const cv = document.createElement("canvas");
    cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
    cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
    if (bridge) {
      const blob = await new Promise(r => cv.toBlob(r, "image/jpeg", 0.9));
      return await bridge.savePhoto(new Uint8Array(await blob.arrayBuffer()));
    }
    return cv.toDataURL("image/jpeg", 0.82);
  } finally { URL.revokeObjectURL(url); }
}
function dropPhotoFile(ref) { if (bridge && ref && !/^(data:|https?:)/.test(ref)) bridge.deletePhoto(ref).catch(() => {}); }
async function storeFiles(files) {
  const imgs = [...files].filter(f => f.type.startsWith("image/"));
  if (!imgs.length) return [];
  toast(imgs.length > 1 ? `Import de ${imgs.length} photos…` : "Import de la photo…");
  const refs = [];
  for (const f of imgs) { try { refs.push(await storePhoto(f)); } catch (e) { console.error(e); toast("Une image n'a pas pu être lue"); } }
  return refs;
}
let photoCb = null;
function pickPhotos(cb, multiple = true) { photoCb = cb; const inp = $("#photoInput"); inp.multiple = multiple; inp.click(); }
// Toutes les photos d'un état (pour sauvegarde / import)
async function mapAllPhotos(s, fn) {
  for (const it of s.items) it.photos = (await Promise.all(it.photos.map(fn))).filter(Boolean);
  if (s.settings?.bg) s.settings.bg = await fn(s.settings.bg);
  if (typeof mapTripPhotos === "function") for (const t of s.trips || []) await mapTripPhotos(t, fn);
}

// ---------- Sélecteurs ----------
const catById = (id) => state.categories.find(c => c.id === id);
const itemById = (id) => state.items.find(i => i.id === id);
const isFam = (it) => it.owner === "family";
const mine = (it) => !isFam(it);
const owned = () => state.items.filter(i => i.status === "owned" && mine(i));
const matchQ = (it) => {
  if (!ui.q) return true;
  const q = ui.q.toLowerCase(); const c = catById(it.cat);
  return [it.name, it.brand, it.model, it.year, it.location, it.notes, it.familyOwner, c?.name, ...Object.values(it.specs || {})].some(v => String(v || "").toLowerCase().includes(q));
};
// Le patrimoine ne compte que ce qui est à moi (pas la famille)
function totals(items) {
  const o = items.filter(i => i.status === "owned" && mine(i));
  const value = o.reduce((s, i) => s + valueOf(i), 0);
  const invested = o.reduce((s, i) => s + num(i.buyPrice), 0);
  const comparable = o.filter(i => num(i.buyPrice) && num(i.value));
  const gain = comparable.reduce((s, i) => s + num(i.value) - num(i.buyPrice), 0);
  const base = comparable.reduce((s, i) => s + num(i.buyPrice), 0);
  return { value, invested, gain, gainPct: base ? gain / base * 100 : null, count: o.length };
}
const coverOf = (items) => items.filter(i => i.photos.length).sort((a, b) => valueOf(b) - valueOf(a))[0];
const famMembers = (items) => [...new Set(items.flatMap(i => String(i.familyOwner || "").split(/[,;&]| et /).map(s => s.trim()).filter(Boolean)))];
function lbReg(list, caps) { ui.lb.push({ list, caps: caps || [] }); return ui.lb.length - 1; }

// ---------- Apparence ----------
function applyAppearance(s) {
  const root = document.documentElement;
  root.dataset.theme = s.theme === "night" ? "night" : "day";
  root.style.setProperty("--veil", String((s.bgVeil ?? 55) / 100));
  root.style.setProperty("--bg-blur", (s.bgBlur || 0) + "px");
  const bg = $("#bg");
  if (s.bg) {
    const src = photoSrc(s.bg);
    if (bg.dataset.src !== src) { bg.innerHTML = `<img src="${esc(src)}" alt="">`; bg.dataset.src = src; }
    bg.classList.add("has-photo");
  } else { bg.innerHTML = ""; bg.dataset.src = ""; bg.classList.remove("has-photo"); }
}

// ---------- Rendu ----------
function render() { renderNav(); renderTopbar(); renderContent(); }

function navBtn(view, ic, label, n, extra = "") {
  return `<button class="nav-item ${extra} ${ui.view === view || (view === "trips" && ui.view.startsWith("trip:")) ? "active" : ""}" data-view="${esc(view)}">${icon(ic)}<span class="name">${esc(label)}</span><span class="n">${n || ""}</span></button>`;
}
function renderNav() {
  const wishN = state.items.filter(i => i.status === "wish").length;
  const famN = state.items.filter(i => isFam(i) && i.status !== "wish").length;
  $("#navMain").innerHTML = navBtn("overview", "grid", "Vue d'ensemble") + navBtn("wish", "star", "Wishlist", wishN) + navBtn("family", "users", "Famille", famN);
  $("#navTrips").innerHTML = navBtn("trips", "travel", "Vacances", state.trips.length, "special");
  $("#navCats").innerHTML = state.categories.map(c => {
    const n = state.items.filter(i => i.cat === c.id && i.status === "owned" && mine(i)).length;
    return navBtn("cat:" + c.id, c.type, c.name, n);
  }).join("");
}
function renderTopbar() {
  const crumbs = [`<button data-view="overview">Lifestyle</button>`];
  let add = { action: "add-item", label: "Ajouter un bien" };
  if (ui.view === "overview") crumbs.push("<b>Vue d'ensemble</b>");
  else if (ui.view === "wish") crumbs.push("<b>Wishlist</b>");
  else if (ui.view === "family") crumbs.push("<b>Famille</b>");
  else if (ui.view.startsWith("cat:")) crumbs.push(`<b>${esc(catById(ui.view.slice(4))?.name || "")}</b>`);
  else if (ui.view === "trips" || ui.view.startsWith("trip:")) {
    add = { action: "trip-new", label: "Nouveau voyage" };
    if (ui.view === "trips") crumbs.push("<b>Vacances</b>");
    else { crumbs.push(`<button data-view="trips">Vacances</button>`); crumbs.push(`<b>${esc(tripById?.(ui.view.slice(5))?.title || "")}</b>`); }
  }
  $("#crumbs").innerHTML = crumbs.join("<span>/</span>");
  const b = $("#topAdd"); b.dataset.action = add.action; $("span", b).textContent = add.label;
}
function renderContent() {
  const el = $("#content");
  ui.lb = [];
  if (ui.view.startsWith("cat:") && !catById(ui.view.slice(4))) ui.view = "overview";
  let html;
  if (ui.view === "overview") html = overviewHtml();
  else if (ui.view === "wish") html = wishHtml();
  else if (ui.view === "family") html = familyHtml();
  else if (ui.view.startsWith("cat:")) html = catHtml(catById(ui.view.slice(4)));
  else {
    const [k, arg] = ui.view.split(":");
    html = VIEWS[k] ? VIEWS[k](arg) : overviewHtml();
  }
  el.innerHTML = html;
  if (ui.view === "overview") drawChart();
  const c = ui.view.startsWith("cat:") ? catById(ui.view.slice(4)) : null;
  document.documentElement.style.setProperty("--glow", c ? themeOf(c).glow : "165,118,47");
  if (ui.lastView !== ui.view) { el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); ui.lastView = ui.view; }
}
function go(view) { ui.view = view; ui.tab = "owned"; render(); $("main").scrollTop = 0; window.scrollTo(0, 0); }

// ---------- Cartes & ambiances ----------
const statusTag = (it) => it.status === "wish" ? `<span class="tag wish">Wishlist</span>`
  : it.status === "sold" ? `<span class="tag sold">Vendu</span>`
  : isFam(it) ? `<span class="tag fam">Famille${it.familyOwner ? " · " + esc(it.familyOwner) : ""}</span>` : "";
const ownedDelta = (it) => it.status === "owned" ? deltaPill(num(it.buyPrice), num(it.value)) : "";
const dataAttrs = (it) => `data-open="${esc(it.id)}" data-drop="item:${esc(it.id)}"`;
const imgOrPh = (it, c) => it.photos[0]
  ? `<img src="${esc(photoSrc(it.photos[0]))}" alt="" loading="lazy" draggable="false">`
  : `<button class="placeholder" data-add-photo="item:${esc(it.id)}">${icon(c?.type, "i big")}<span class="add">${icon("camera")}Ajouter une photo</span></button>`;

function cardHtml(it, opts = {}) {
  const c = catById(it.cat);
  const tag = statusTag(it) || (opts.showCat && c ? `<span class="tag">${esc(c.name)}</span>` : "");
  const sub = [it.brand, it.model, it.year].filter(Boolean).join(" · ") || it.location || c?.name || "";
  const v = valueOf(it);
  return `<div class="card" ${dataAttrs(it)}>
    <div class="media">${imgOrPh(it, c)}${tag}${it.photos.length > 1 ? `<span class="count">${icon("camera")}${it.photos.length}</span>` : ""}</div>
    <div class="body">
      <div class="ttl">${esc(it.name)}</div>
      <div class="sub">${esc(sub)}</div>
      <div class="foot"><span class="price ${v ? "" : "none"}">${v ? eur(v) : "Valeur non renseignée"}</span>${ownedDelta(it)}</div>
    </div></div>`;
}
const slotHtml = (catId, label = "Ajouter un bien", layout = "") =>
  `<button class="slot ${layout ? "slot-" + layout : ""}" data-action="add-item" data-cat="${esc(catId || "")}"><span class="c">${icon("plus")}</span>${esc(label)}</button>`;

function heroHtml({ kicker, title, sub, img, iconKey, stats, actions, feature }) {
  return `<header class="hero-x">
    ${img ? `<img class="hero-img" src="${esc(photoSrc(img))}" alt="">` : `<div class="hero-empty">${icon(iconKey)}</div>`}
    <div class="hero-shade"></div>
    ${actions ? `<div class="hero-top">${actions}</div>` : ""}
    <div class="hero-in">
      <div class="kicker">${esc(kicker)}</div>
      <h1 class="hero-title">${esc(title)}</h1>
      ${sub ? `<div class="hero-sub">${sub}</div>` : ""}
      <div class="hero-stats">${stats.map(([l, v]) => `<div><span>${esc(l)}</span><b>${v}</b></div>`).join("")}</div>
    </div>
    ${feature ? `<button class="hero-feature" data-open="${esc(feature.id)}"><span>En vedette</span>${esc(feature.name)}${icon("right")}</button>` : ""}
  </header>`;
}

function estateCard(it, c) {
  const s = it.specs || {}; const v = valueOf(it);
  const chips = [s.kind, s.surface && `${s.surface} m²`, s.rooms && `${s.rooms} pièces`, s.land && `Terrain ${s.land} m²`].filter(Boolean);
  const since = isFam(it) ? `Propriété familiale${it.familyOwner ? " · " + it.familyOwner : ""}` : it.buyDate ? `Acquise en ${it.buyDate.slice(0, 4)}` : it.year ? `Construite en ${it.year}` : "";
  return `<article class="listing" ${dataAttrs(it)}>
    <div class="l-media">${imgOrPh(it, c)}${statusTag(it)}${v ? `<span class="l-price">${eur(v)}</span>` : ""}</div>
    <div class="l-body">
      <div class="l-loc">${icon("pin")}<span>${esc(s.address || it.location || "Adresse à renseigner")}</span></div>
      <h3 class="serif">${esc(it.name)}</h3>
      ${chips.length ? `<div class="chips">${chips.map(x => `<span>${esc(x)}</span>`).join("")}</div>` : ""}
      <div class="l-foot"><span>${esc(since)}</span>${ownedDelta(it)}</div>
    </div></article>`;
}
function showroomCard(it, c) {
  const s = it.specs || {}; const v = valueOf(it);
  const specs = [it.model, it.year, s.mileage, s.power && `${s.power} ch`, s.engine, s.length && `${s.length} m`, s.hours && `${s.hours} h de vol`, s.size && `Pointure ${s.size}`, s.colorway || s.color].filter(Boolean);
  const plate = s.plate || s.reg;
  return `<article class="car" ${dataAttrs(it)}>
    <div class="car-media">${imgOrPh(it, c)}${statusTag(it)}</div>
    <div class="car-body">
      <div class="car-brand">${esc(it.brand || TYPES[c?.type]?.label || "")}</div>
      <h3 class="serif">${esc(it.name)}</h3>
      <div class="car-specs">${specs.map(x => `<span>${esc(x)}</span>`).join("")}</div>
      <div class="car-foot">${plate ? `<span class="plate"><i>F</i><b>${esc(plate)}</b></span>` : "<span></span>"}<span class="car-price">${v ? eur(v) : ""} ${ownedDelta(it)}</span></div>
    </div></article>`;
}
function vaultCell(it, c) {
  const s = it.specs || {}; const v = valueOf(it);
  return `<article class="cell" ${dataAttrs(it)}>
    <div class="cushion">${imgOrPh(it, c)}</div>${statusTag(it)}
    <div class="engr">${esc(it.brand || "")}</div>
    <h3 class="serif">${esc(it.name)}</h3>
    <div class="ref">${esc(s.ref || it.model || s.material || "")}</div>
    <div class="cell-val">${v ? eur(v) : ""} ${ownedDelta(it)}</div>
  </article>`;
}
function bottleCard(it, c) {
  const s = it.specs || {}; const v = valueOf(it);
  return `<article class="bottle" ${dataAttrs(it)}>
    <div class="b-media">${imgOrPh(it, c)}${statusTag(it)}</div>
    <div class="b-cap"><b>${esc(s.vintage || it.year || "")}</b><span>${esc(it.name)}</span><small>${esc(s.domain || it.brand || "")}</small>
    <em>${esc([s.qty && `${s.qty} bt`, s.format].filter(Boolean).join(" · "))}${v ? ` · ${eur(v)}` : ""}</em></div>
  </article>`;
}
function artCard(it, c) {
  const s = it.specs || {}; const v = valueOf(it);
  return `<article class="artwork" ${dataAttrs(it)}>
    <div class="frame"><div class="mat"><div class="m">${imgOrPh(it, c)}${statusTag(it)}</div></div></div>
    <div class="label"><b>${esc(s.artist || it.brand || "Artiste")}</b><i>${esc(it.name)}</i>
      <span>${esc([it.year, s.technique, s.dims].filter(Boolean).join(", "))}</span>${v ? `<span class="lv">${eur(v)}</span>` : ""}</div>
  </article>`;
}
function layoutHtml(layout, items, c, addLabel) {
  const add = addLabel ? slotHtml(c.id, addLabel, layout) : "";
  if (!items.length && !add) return `<div class="empty"><p>Rien ici pour l'instant.</p></div>`;
  switch (layout) {
    case "estate":   return `<div class="estate">${items.map(i => estateCard(i, c)).join("")}${add}</div>`;
    case "showroom": return `<div class="showroom"><div class="floor-grid">${items.map(i => showroomCard(i, c)).join("")}${add}</div></div>`;
    case "vault":    return `<div class="vault"><div class="vault-grid">${items.map(i => vaultCell(i, c)).join("")}${add}</div></div>`;
    case "cellar":   return `<div class="cellar"><div class="rack">${items.map(i => bottleCard(i, c)).join("")}${add}</div></div>`;
    case "gallery":  return `<div class="wall"><div class="wall-grid">${items.map(i => artCard(i, c)).join("")}${add}</div></div>`;
    default:         return `<div class="grid">${items.map(i => cardHtml(i)).join("")}${add}</div>`;
  }
}

// ---------- Vues ----------
function overviewHtml() {
  const t = totals(state.items);
  const wish = state.items.filter(i => i.status === "wish");
  const fam = state.items.filter(i => isFam(i) && i.status === "owned");
  const famValue = fam.reduce((s, i) => s + valueOf(i), 0);
  const h = new Date().getHours();
  const hello = (h < 5 ? "Bonne nuit" : h < 18 ? "Bonjour" : "Bonsoir") + (state.settings.name ? ", " + state.settings.name : "");
  const today = cap(new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  const intro = `<div class="greet"><div><div class="kicker">${esc(today)}</div><h1>${esc(hello)}</h1></div></div>`;

  if (ui.q) {
    const res = state.items.filter(matchQ).sort((a, b) => valueOf(b) - valueOf(a));
    const trips = typeof searchTrips === "function" ? searchTrips(ui.q) : "";
    return intro + `<div class="sec-head"><h2>${res.length} bien${res.length > 1 ? "s" : ""} pour « ${esc(ui.q)} »</h2></div>
      ${res.length ? `<div class="grid">${res.map(i => cardHtml(i, { showCat: true })).join("")}</div>` : `<div class="empty"><p>Aucun bien ne correspond.</p></div>`}${trips}`;
  }
  if (!state.categories.length) {
    return intro + `<div class="empty"><h3>Commence ton inventaire</h3><p>Crée ta première collection : immobilier, garage, horlogerie…</p><button class="btn primary" data-action="new-cat">${icon("plus")}Nouvelle collection</button></div>`;
  }

  const alloc = state.categories.map(c => ({ c, v: totals(state.items.filter(i => i.cat === c.id)).value })).filter(r => r.v > 0).sort((a, b) => b.v - a.v);
  const allocHtml = alloc.length
    ? `<div class="alloc">${alloc.map(r => `<button class="alloc-row" data-view="cat:${esc(r.c.id)}">
          <span class="nm">${icon(r.c.type)}<span>${esc(r.c.name)}</span></span>
          <span class="val">${short(r.v)}<small>${Math.round(r.v / t.value * 100)} %</small></span>
          <span class="track"><div style="width:${Math.max(2, r.v / alloc[0].v * 100)}%"></div></span></button>`).join("")}</div>`
    : `<div class="chart-empty">Ajoute des valeurs à tes biens pour voir la répartition.</div>`;

  const rooms = state.categories.map(c => {
    const th = themeOf(c);
    const all = state.items.filter(i => i.cat === c.id);
    const ct = totals(all);
    const fn = all.filter(i => isFam(i) && i.status !== "wish").length;
    const feat = coverOf(all.filter(i => i.status === "owned")) || coverOf(all);
    return `<button class="room" data-view="cat:${esc(c.id)}" style="--glow:${th.glow}">
      ${feat ? `<img src="${esc(photoSrc(feat.photos[0]))}" alt="" loading="lazy">` : `<div class="room-empty">${icon(c.type)}</div>`}
      <div class="room-shade"></div>
      <div class="room-in"><span class="kicker">${esc(th.kicker)}</span><h3>${esc(c.name)}</h3>
        <span class="room-meta">${plural(ct.count, th)}${ct.value ? ` · ${short(ct.value)}` : ""}${fn ? ` · ${fn} de famille` : ""}</span></div>
      <span class="room-go">${icon("right")}</span>
    </button>`;
  }).join("") + `<button class="room room-new" data-action="new-cat"><span class="c">${icon("plus")}</span><b>Nouvelle collection</b><span>Sneakers, art, cave, bateau…</span></button>`;

  const recent = state.items.filter(i => i.status === "owned").sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 4);
  return `${intro}
    <div class="kpis">
      <div class="kpi main"><div class="l">Patrimoine net estimé</div><div class="v">${eur(t.value)}</div>
        <div class="s">${t.gainPct !== null ? `<span class="pill ${t.gain >= 0 ? "up" : "down"}">${t.gain >= 0 ? "+" : ""}${eur(t.gain)} · ${t.gainPct >= 0 ? "+" : ""}${t.gainPct.toFixed(1).replace(".", ",")} %</span> depuis l'achat` : "Renseigne prix d'achat et valeur actuelle pour suivre la plus-value"}</div></div>
      <div class="kpi"><div class="l">Capital investi</div><div class="v">${short(t.invested)}</div><div class="s">${t.count} bien${t.count > 1 ? "s" : ""} à moi</div></div>
      <button class="kpi link fam" data-view="family"><div class="l">Accès famille</div><div class="v">${fam.length ? short(famValue) : "—"}</div><div class="s">${fam.length} bien${fam.length > 1 ? "s" : ""} · hors patrimoine</div></button>
      <button class="kpi link" data-view="wish"><div class="l">Wishlist</div><div class="v">${short(wish.reduce((s, i) => s + valueOf(i), 0))}</div><div class="s">${wish.length} objectif${wish.length > 1 ? "s" : ""}</div></button>
    </div>
    <div class="sec-head"><h2>Mes univers</h2></div>
    <div class="rooms">${rooms}</div>
    ${typeof escapeBandHtml === "function" ? escapeBandHtml() : ""}
    <div class="row2">
      <div class="panel"><div class="ph"><h3>Évolution du patrimoine</h3><small>Capital acquis par date d'achat, valeur estimée aujourd'hui</small></div><div class="chart" id="chart"></div></div>
      <div class="panel"><div class="ph"><h3>Répartition</h3><small>par collection</small></div>${allocHtml}</div>
    </div>
    ${recent.length ? `<div class="sec-head"><h2>Derniers ajouts</h2></div><div class="grid">${recent.map(i => cardHtml(i, { showCat: true })).join("")}</div>` : ""}`;
}

function catHtml(c) {
  const th = themeOf(c);
  const all = state.items.filter(i => i.cat === c.id);
  const t = totals(all);
  const tabsDef = {
    owned:  (i) => i.status === "owned" && mine(i),
    family: (i) => isFam(i) && i.status !== "wish",
    wish:   (i) => i.status === "wish",
    sold:   (i) => i.status === "sold" && mine(i),
  };
  if (!tabsDef[ui.tab]) ui.tab = "owned";
  const counts = Object.fromEntries(Object.entries(tabsDef).map(([k, f]) => [k, all.filter(f).length]));
  const items = all.filter(i => tabsDef[ui.tab](i) && matchQ(i)).sort((a, b) => valueOf(b) - valueOf(a));
  const feat = coverOf(all.filter(i => i.status === "owned")) || coverOf(all);
  const stats = [["Valeur estimée", eur(t.value)], [cap(th.many), String(t.count)]];
  stats.push(t.gainPct !== null ? ["Plus-value", `${t.gain >= 0 ? "+" : ""}${eur(t.gain)} ${deltaPill(1, 1 + t.gainPct / 100)}`] : ["Capital investi", t.invested ? eur(t.invested) : "—"]);
  if (counts.family) stats.push(["Famille", `${counts.family}`]);
  const addLabel = ui.tab === "wish" ? "Ajouter un objectif" : ui.tab === "family" ? "Ajouter un bien de famille" : th.add;
  const actions = `<button class="btn glass" data-action="edit-cat" data-cat="${esc(c.id)}">${icon("edit")}Modifier</button>
    <button class="btn primary" data-action="add-item" data-cat="${esc(c.id)}">${icon("plus")}${esc(addLabel)}</button>`;
  return `<div class="theme theme-${th.layout}">
    ${heroHtml({ kicker: th.kicker, title: c.name, img: feat?.photos[0], iconKey: c.type, stats, actions, feature: feat })}
    <div class="tabs">
      <button data-tab="owned" class="${ui.tab === "owned" ? "active" : ""}">À moi ${counts.owned}</button>
      <button data-tab="family" class="fam ${ui.tab === "family" ? "active" : ""}">Famille ${counts.family}</button>
      <button data-tab="wish" class="${ui.tab === "wish" ? "active" : ""}">Wishlist ${counts.wish}</button>
      <button data-tab="sold" class="${ui.tab === "sold" ? "active" : ""}">Vendus ${counts.sold}</button>
    </div>
    ${layoutHtml(th.layout, items, c, ui.tab === "sold" ? null : addLabel)}
  </div>`;
}

function wishHtml() {
  const items = state.items.filter(i => i.status === "wish" && matchQ(i)).sort((a, b) => valueOf(b) - valueOf(a));
  const total = items.reduce((s, i) => s + valueOf(i), 0);
  const feat = coverOf(items);
  return `<div class="theme">
    ${heroHtml({ kicker: "Prochains objectifs", title: "Wishlist", img: feat?.photos[0], iconKey: "star", stats: [["Budget total", eur(total)], ["Objectifs", String(items.length)]], feature: feat,
      actions: `<button class="btn primary" data-action="add-item">${icon("plus")}Ajouter un objectif</button>` })}
    <div class="grid">${items.map(i => cardHtml(i, { showCat: true })).join("")}${slotHtml("", "Ajouter un objectif")}</div>
  </div>`;
}

function familyHtml() {
  const all = state.items.filter(i => isFam(i) && i.status !== "wish");
  const items = all.filter(matchQ);
  const value = all.filter(i => i.status === "owned").reduce((s, i) => s + valueOf(i), 0);
  const members = famMembers(all);
  const feat = coverOf(all);
  const groups = state.categories.map(c => {
    const list = items.filter(i => i.cat === c.id).sort((a, b) => valueOf(b) - valueOf(a));
    if (!list.length) return "";
    const th = themeOf(c);
    return `<section class="sec" style="--glow:${th.glow}"><div class="sec-head"><h2>${esc(c.name)}</h2><span class="meta">${plural(list.length, th)}</span></div>${layoutHtml(th.layout, list, c, null)}</section>`;
  }).join("");
  return `<div class="theme">
    ${heroHtml({ kicker: "Biens de famille · hors patrimoine", title: "Famille", img: feat?.photos[0], iconKey: "users",
      sub: "Ce qui appartient à la famille et auquel tu as accès. Rien ici n'est compté dans ton patrimoine.",
      stats: [["Valeur indicative", value ? eur(value) : "—"], ["Biens", String(all.length)], ["Membres", members.length ? esc(members.join(", ")) : "—"]], feature: feat,
      actions: `<button class="btn primary" data-action="add-item">${icon("plus")}Ajouter un bien de famille</button>` })}
    ${groups || `<div class="empty"><h3>Aucun bien de famille pour l'instant</h3><p>La maison de vacances des parents, la voiture de ton père, la montre de ton grand-père…<br>Ajoute-les ici : tu y as accès, mais elles ne gonflent pas ton patrimoine.</p><button class="btn primary" data-action="add-item">${icon("plus")}Ajouter un bien de famille</button></div>`}
  </div>`;
}

// ---------- Graphique d'évolution ----------
function chartSeries() {
  const dated = owned().filter(i => i.buyDate && num(i.buyPrice)).sort((a, b) => a.buyDate.localeCompare(b.buyDate));
  if (!dated.length) return null;
  const pts = []; let cum = 0;
  dated.forEach(i => {
    cum += num(i.buyPrice);
    const d = toDate(i.buyDate).getTime();
    const last = pts[pts.length - 1];
    if (last && last.t === d) { last.v = cum; last.label += ", " + i.name; }
    else pts.push({ t: d, v: cum, label: i.name, kind: "buy" });
  });
  const current = dated.reduce((s, i) => s + valueOf(i), 0);
  if (Date.now() > pts[pts.length - 1].t) pts.push({ t: Date.now(), v: current, label: "", kind: "now" });
  else pts[pts.length - 1].v = current;
  if (pts.length === 1) pts.unshift({ t: pts[0].t - 864e5 * 30, v: 0, label: "", kind: "start" });
  return pts;
}
function niceStep(raw) {
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1))); const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
function drawChart() {
  const host = $("#chart"); if (!host) return;
  const pts = chartSeries();
  if (!pts) { host.innerHTML = `<div class="chart-empty">Renseigne la date et le prix d'achat de tes biens<br>pour voir l'évolution de ton patrimoine.</div>`; return; }
  const W = host.clientWidth || 600, H = host.clientHeight || 220;
  const m = { l: 58, r: 12, t: 12, b: 26 };
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const step = niceStep(Math.max(...pts.map(p => p.v)) * 1.1 / 4 || 1);
  const top = Math.ceil(Math.max(...pts.map(p => p.v)) * 1.1 / step) * step || 1;
  const x = (t) => m.l + (t1 === t0 ? 0.5 : (t - t0) / (t1 - t0)) * (W - m.l - m.r);
  const y = (v) => m.t + (1 - v / top) * (H - m.t - m.b);
  let d = `M${x(pts[0].t)},${y(pts[0].v)}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    d += p.kind === "now" ? ` L${x(p.t)},${y(p.v)}` : ` L${x(p.t)},${y(pts[i - 1].v)} L${x(p.t)},${y(p.v)}`;
  }
  const area = d + ` L${x(t1)},${y(0)} L${x(t0)},${y(0)} Z`;
  let grid = "";
  for (let v = 0; v <= top + 1e-6; v += step) grid += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--chart-grid)"/><text x="${m.l - 10}" y="${y(v) + 4}" text-anchor="end" fill="var(--muted)" font-size="11">${short(v)}</text>`;
  const y0 = new Date(t0).getFullYear(), y1 = new Date(t1).getFullYear();
  const ticks = []; const yStep = y1 - y0 > 12 ? 5 : y1 - y0 > 6 ? 2 : 1;
  for (let yr = y0 + 1; yr <= y1; yr += yStep) ticks.push(new Date(yr, 0, 1).getTime());
  const xt = (ticks.length ? ticks : [t0, t1]).map(t => `<text x="${x(t)}" y="${H - 6}" text-anchor="middle" fill="var(--muted)" font-size="11">${ticks.length ? new Date(t).getFullYear() : new Date(t).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}</text>`).join("");
  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution du patrimoine">
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(165,118,47)" stop-opacity=".3"/><stop offset="1" stop-color="rgb(165,118,47)" stop-opacity="0"/></linearGradient></defs>
    ${grid}${xt}<path d="${area}" fill="url(#ga)"/><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>
    <line id="cx" y1="${m.t}" y2="${H - m.b}" stroke="var(--border-strong)" visibility="hidden"/>
    <circle id="cdot" r="5" fill="var(--accent)" stroke="var(--surface-solid)" stroke-width="2" visibility="hidden"/>
    <rect x="${m.l}" y="0" width="${W - m.l - m.r}" height="${H}" fill="transparent" id="chit"/>
  </svg><div class="tip" id="ctip"></div>`;
  const hit = $("#chit", host), tip = $("#ctip", host), cx = $("#cx", host), dot = $("#cdot", host);
  const hide = () => { tip.style.display = "none"; cx.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden"); };
  hit.addEventListener("mousemove", (e) => {
    const r = host.getBoundingClientRect(); const mx = (e.clientX - r.left) * (W / r.width);
    let best = pts[0]; pts.forEach(p => { if (Math.abs(x(p.t) - mx) < Math.abs(x(best.t) - mx)) best = p; });
    if (best.kind === "start") return hide();
    const px = x(best.t), py = y(best.v);
    cx.setAttribute("x1", px); cx.setAttribute("x2", px); cx.setAttribute("visibility", "visible");
    dot.setAttribute("cx", px); dot.setAttribute("cy", py); dot.setAttribute("visibility", "visible");
    tip.innerHTML = `<b>${eur(best.v)}</b><span>${best.kind === "now" ? "Aujourd'hui · valeur estimée" : new Date(best.t).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) + " · " + esc(best.label)}</span>`;
    tip.style.display = "block"; tip.style.left = (px / W * r.width) + "px"; tip.style.top = (py / H * r.height) + "px";
  });
  hit.addEventListener("mouseleave", hide);
}
let rT; window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { if (ui.view === "overview") drawChart(); }, 120); });

// ---------- Formulaire générique ----------
let FORM = null;
const getP = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
function setP(o, p, v) { const ks = p.split("."); let a = o; ks.slice(0, -1).forEach(k => { if (!a[k] || typeof a[k] !== "object") a[k] = {}; a = a[k]; }); a[ks[ks.length - 1]] = v; }
const openOverlay = (id) => { $(id).classList.add("open"); document.body.style.overflow = "hidden"; };

function openForm(cfg) {
  closeAll();
  FORM = { ...cfg, draft: clone(cfg.values || {}), newPhotos: [], removed: [], defs: {} };
  $("#formTitle").textContent = cfg.title;
  $("#formDelete").style.visibility = cfg.onDelete ? "visible" : "hidden";
  $("#formSave").textContent = cfg.saveLabel || "Enregistrer";
  $("#formModal").classList.toggle("wide", !!cfg.wide);
  renderForm();
  openOverlay("#formOverlay");
  const first = $("#form input[data-f]:not([type=range]), #form textarea[data-f]"); if (first && !cfg.noFocus) first.focus();
}
function renderForm() {
  const fields = (typeof FORM.fields === "function" ? FORM.fields(FORM.draft) : FORM.fields).filter(Boolean);
  FORM.defs = {}; fields.forEach(f => { if (f.key) FORM.defs[f.key] = f; });
  const scroll = $("#formOverlay").scrollTop;
  $("#form").innerHTML = fields.map(fieldHtml).join("");
  $("#formOverlay").scrollTop = scroll;
}
function fieldHtml(f) {
  const v = f.key ? getP(FORM.draft, f.key) : undefined;
  const full = f.full || ["textarea", "photos", "tiles", "picks", "stars"].includes(f.type);
  const cls = `field ${full ? "full" : ""}`;
  const lab = f.label ? `<label>${esc(f.label)}</label>` : "";
  switch (f.type) {
    case "section": return `<h4>${esc(f.label)}</h4>`;
    case "hint": return `<p class="hint">${f.html || esc(f.label)}</p>`;
    case "textarea": return `<div class="${cls}">${lab}<textarea data-f="${f.key}" rows="${f.rows || 4}" placeholder="${esc(f.placeholder || "")}">${esc(v ?? "")}</textarea></div>`;
    case "select": return `<div class="${cls}">${lab}<select data-f="${f.key}" ${f.rerender ? "data-rerender" : ""}>${f.options.map(o => `<option value="${esc(o.v)}" ${String(o.v) === String(v ?? "") ? "selected" : ""}>${esc(o.label)}</option>`).join("")}</select></div>`;
    case "money": return `<div class="${cls}">${lab}<div class="money"><input data-f="${f.key}" inputmode="decimal" placeholder="0" value="${esc(v ?? "")}"></div></div>`;
    case "range": return `<div class="${cls}">${lab}<input type="range" data-f="${f.key}" min="${f.min}" max="${f.max}" step="${f.step || 1}" value="${esc(v ?? f.min)}"></div>`;
    case "tiles": return `<div class="${cls}">${lab}<div class="tiles ${f.row ? "row" : ""}">${f.options.map(o => `<button type="button" class="tile ${o.cls || ""} ${String(o.v) === String(v) ? "active" : ""}" data-ftile="${f.key}" data-v="${esc(o.v)}">${o.html || icon(o.icon) + esc(o.label)}</button>`).join("")}</div></div>`;
    case "picks": return `<div class="${cls}">${lab}${f.options.length ? `<div class="picks">${f.options.map(o => `<button type="button" class="pick ${String(o.v) === String(v) ? "active" : ""}" data-fpick="${f.key}" data-v="${esc(o.v)}"><div class="pm">${o.img ? `<img src="${esc(photoSrc(o.img))}" alt="">` : icon(o.icon || "other")}</div><div class="pb"><b>${esc(o.label)}</b><small>${esc(o.sub || "")}</small></div></button>`).join("")}</div>` : `<div class="pick-empty">${f.empty || "Rien à choisir pour l'instant."}</div>`}</div>`;
    case "stars": return `<div class="${cls}">${lab}<div class="stars">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="${n <= (v || 0) ? "on" : ""}" data-fstar="${f.key}" data-v="${n}">★</button>`).join("")}</div></div>`;
    case "photos": {
      const arr = Array.isArray(v) ? v : [];
      return `<div class="${cls}">${lab}<div class="dropzone" data-drop="form:${f.key}"><div class="thumbs">${arr.map((p, i) => `<div class="thumb"><img src="${esc(photoSrc(p))}" alt="">${i === 0 && !f.single ? `<span class="cover">Couverture</span>` : ""}<button type="button" class="rm" data-frm="${f.key}" data-i="${i}" title="Retirer">${icon("x")}</button></div>`).join("")}${f.single && arr.length ? "" : `<button type="button" class="thumb add" data-add-photo="form:${f.key}" title="Ajouter">${icon("plus")}</button>`}</div><div class="dz-hint">${esc(f.hint || (f.single ? "Glisse une photo ici ou clique sur +." : "Glisse tes photos ici ou clique sur +. La première sert de couverture."))}</div></div></div>`;
    }
    default: return `<div class="${cls}">${lab}<input data-f="${f.key}" type="${f.type === "date" ? "date" : "text"}" ${f.type === "number" ? 'inputmode="decimal"' : ""} placeholder="${esc(f.placeholder || "")}" value="${esc(v ?? "")}"></div>`;
  }
}
function formChanged(rerender) { if (rerender) renderForm(); FORM.onLive?.(FORM.draft); }
DROPS.form = (key, refs) => {
  if (!FORM) { refs.forEach(dropPhotoFile); return; }
  const def = FORM.defs[key] || {};
  let arr = getP(FORM.draft, key); if (!Array.isArray(arr)) arr = [];
  if (def.single) { arr.forEach(r => FORM.newPhotos.includes(r) ? dropPhotoFile(r) : FORM.removed.push(r)); arr = refs.slice(0, 1); refs.slice(1).forEach(dropPhotoFile); }
  else arr = arr.concat(refs);
  setP(FORM.draft, key, arr); FORM.newPhotos.push(...refs); formChanged(true);
};
function formSave() {
  if (!FORM) return;
  const ok = FORM.onSave(FORM.draft);
  if (ok === false) return;
  FORM.removed.forEach(dropPhotoFile);
  FORM.newPhotos = []; FORM = null;
  closeAll();
}
function formDelete() {
  if (!FORM?.onDelete) return;
  const done = FORM.onDelete();
  if (!done) return;
  FORM.newPhotos.forEach(dropPhotoFile); FORM.newPhotos = []; FORM = null;
  closeAll();
}
function closeAll() {
  if (FORM) { FORM.newPhotos.forEach(dropPhotoFile); FORM.onCancel?.(); FORM = null; }
  $$(".overlay").forEach(o => o.classList.remove("open"));
  document.body.style.overflow = "";
  ui.detailId = null;
}
function required(d, key, label) {
  if (String(getP(d, key) || "").trim()) return true;
  toast(`Indique ${label}`);
  const el = $(`#form [data-f="${key}"]`); el?.focus();
  return false;
}
function trimAll(o) { for (const k in o) { if (typeof o[k] === "string") o[k] = o[k].trim(); else if (o[k] && typeof o[k] === "object" && !Array.isArray(o[k])) trimAll(o[k]); } return o; }

// ---------- Biens ----------
function openItemForm(item, catId) {
  if (!state.categories.length) return openCatForm(null);
  const inCat = ui.view.startsWith("cat:");
  const defCat = catId || (inCat ? ui.view.slice(4) : state.categories[0].id);
  const defStatus = ui.view === "wish" || (inCat && ui.tab === "wish") ? "wish" : "owned";
  const defOwner = ui.view === "family" || (inCat && ui.tab === "family") ? "family" : "me";
  const values = item ? clone(item) : { cat: defCat, status: defStatus, owner: defOwner, photos: [], specs: {} };
  openForm({
    title: item ? "Modifier le bien" : defOwner === "family" ? "Ajouter un bien de famille" : "Ajouter un bien",
    values,
    fields: (d) => {
      const c = catById(d.cat); const specs = TYPES[c?.type]?.fields || [];
      const fam = d.owner === "family" && d.status !== "wish";
      return [
        { type: "photos", key: "photos", label: "Photos" },
        { key: "name", label: "Nom", full: true, placeholder: "ex. Porsche 911 GT3 Touring" },
        { type: "select", key: "cat", label: "Collection", rerender: true, options: state.categories.map(c => ({ v: c.id, label: c.name })) },
        { type: "select", key: "status", label: "Statut", rerender: true, options: [{ v: "owned", label: "Possédé" }, { v: "wish", label: "Wishlist" }, { v: "sold", label: "Vendu" }] },
        d.status === "wish" ? null : { type: "tiles", row: true, key: "owner", label: "À qui appartient ce bien ?", options: [{ v: "me", label: "À moi", icon: "user" }, { v: "family", label: "À la famille", icon: "users" }] },
        fam ? { key: "familyOwner", label: "Membre(s) de la famille", full: true, placeholder: "ex. Papa, Maman, Grand-père" } : null,
        fam ? { type: "hint", html: "Tu y as accès, mais ce bien <b>n'est pas compté dans ton patrimoine</b>." } : null,
        { key: "brand", label: "Marque" }, { key: "model", label: "Modèle" },
        { key: "year", label: "Année", type: "number" }, { key: "location", label: "Emplacement", placeholder: "ex. Paris, garage, coffre" },
        { type: "section", label: "Valeur" },
        { type: "money", key: "buyPrice", label: fam ? "Prix d'achat (indicatif)" : "Prix d'achat" },
        { type: "money", key: "value", label: d.status === "wish" ? "Prix cible" : "Valeur actuelle estimée" },
        { type: "date", key: "buyDate", label: "Date d'achat" },
        specs.length ? { type: "section", label: "Caractéristiques" } : null,
        ...specs.map(([k, l, f]) => ({ key: "specs." + k, label: l, full: !!f })),
        { type: "textarea", key: "notes", label: "Notes", placeholder: "Entretien, assurance, historique…" },
      ];
    },
    onSave: (d) => {
      if (!required(d, "name", "un nom")) return false;
      trimAll(d);
      if (d.status === "wish") d.owner = "me";
      if (d.owner !== "family") delete d.familyOwner;
      let it;
      if (item) { it = itemById(item.id); Object.assign(it, d, { updatedAt: Date.now() }); }
      else { it = { id: uid(), createdAt: Date.now(), ...d }; state.items.push(it); }
      save(); render();
      toast(item ? "Modifications enregistrées" : "Bien ajouté");
      if (item) setTimeout(() => openDetail(it.id), 0);
    },
    onDelete: item ? () => deleteItem(item.id) : null,
  });
}
function deleteItem(id) {
  const it = itemById(id); if (!it) return false;
  if (!confirm(`Supprimer « ${it.name} » ? Ses photos seront aussi supprimées.`)) return false;
  it.photos.forEach(dropPhotoFile);
  state.items = state.items.filter(i => i.id !== id);
  save(); render(); toast("Bien supprimé");
  return true;
}
DROPS.item = (id, refs) => {
  const it = itemById(id); if (!it) { refs.forEach(dropPhotoFile); return; }
  const was = it.photos.length;
  it.photos.push(...refs); save(); render();
  toast(refs.length > 1 ? `${refs.length} photos ajoutées` : "Photo ajoutée");
  if (ui.detailId === id || $("#detailOverlay").classList.contains("open")) openDetail(id, was ? was : 0);
};

function openDetail(id, idx = 0) {
  const it = itemById(id); if (!it) return;
  if (!$("#detailOverlay").classList.contains("open")) closeAll();
  ui.detailId = id; ui.detailIdx = Math.min(idx, Math.max(0, it.photos.length - 1));
  const c = catById(it.cat);
  const bp = num(it.buyPrice), v = num(it.value);
  const rows = [
    ["Statut", { owned: "Possédé", wish: "Wishlist", sold: "Vendu" }[it.status]],
    ["Appartient à", isFam(it) ? `Famille${it.familyOwner ? " · " + it.familyOwner : ""}` : it.status === "wish" ? "" : "Moi"],
    ["Marque", it.brand], ["Modèle", it.model], ["Année", it.year],
    ...(TYPES[c?.type]?.fields || []).map(([k, l]) => [l, it.specs?.[k]]),
    ["Prix d'achat", bp ? eur(bp) : ""],
    ["Plus-value", bp && v && it.status === "owned" ? `${v - bp >= 0 ? "+" : ""}${eur(v - bp)}` : ""],
    ["Date d'achat", fmtDate(it.buyDate)], ["Emplacement", it.location],
  ].filter(r => r[1]);
  const p = it.photos; const cur = p[ui.detailIdx];
  const lb = lbReg(p, p.map(() => it.name));
  const trips = typeof tripsUsingItem === "function" ? tripsUsingItem(it.id) : [];
  $("#detailBody").innerHTML = `
    <div class="modal-head"><h2>${esc(c?.name || "")}</h2><button class="x" data-action="close">${icon("x")}</button></div>
    <div class="detail">
      <div class="gallery">
        <div class="stage" data-drop="item:${esc(it.id)}">
          ${cur ? `<img src="${esc(photoSrc(cur))}" alt="" data-lb="${lb}" data-i="${ui.detailIdx}">` : `<button class="placeholder" data-add-photo="item:${esc(it.id)}">${icon(c?.type, "i big")}<span class="add">${icon("camera")}Ajouter des photos</span><span>ou glisse-les ici</span></button>`}
          ${p.length > 1 ? `<button class="nav-arrow prev" data-action="detail-step" data-step="-1">${icon("left")}</button><button class="nav-arrow next" data-action="detail-step" data-step="1">${icon("right")}</button>` : ""}
          ${cur ? `<div class="tools">${ui.detailIdx > 0 ? `<button data-action="set-cover">${icon("star")}Couverture</button>` : ""}<button data-action="del-photo">${icon("trash")}Supprimer</button></div>` : ""}
        </div>
        <div class="thumbs">${p.map((ph, i) => `<div class="thumb ${i === ui.detailIdx ? "sel" : ""}" data-action="detail-idx" data-i="${i}"><img src="${esc(photoSrc(ph))}" alt="" loading="lazy"></div>`).join("")}
          <button class="thumb add" data-add-photo="item:${esc(it.id)}" title="Ajouter des photos">${icon("plus")}</button></div>
      </div>
      <div class="info">
        <div class="cat">${icon(c?.type)}${esc(c?.name || "")}</div>
        <h1>${esc(it.name)}</h1>
        <div class="bm">${esc([it.brand, it.model].filter(Boolean).join(" "))}</div>
        <div class="valbox"><div class="l">${it.status === "wish" ? "Prix cible" : "Valeur estimée"}</div>
          <div class="v">${valueOf(it) ? eur(valueOf(it)) : "—"} ${it.status === "owned" ? deltaPill(bp, v) : ""}</div></div>
        ${isFam(it) ? `<div class="famnote">${icon("users")}Bien de famille : accessible, hors de ton patrimoine</div>` : ""}
        ${rows.length ? `<dl class="specs">${rows.map(([k, val]) => `<dt>${esc(k)}</dt><dd>${esc(val)}</dd>`).join("")}</dl>` : ""}
        ${trips.length ? `<div class="notes"><b>Voyages :</b> ${trips.map(t => `<a href="#" data-view="trip:${esc(t.id)}" data-action="close-go">${esc(t.title)}</a>`).join(", ")}</div>` : ""}
        ${it.notes ? `<div class="notes">${esc(it.notes)}</div>` : ""}
        <div class="acts">
          <button class="btn primary" data-action="edit-item" data-id="${esc(it.id)}">${icon("edit")}Modifier</button>
          <button class="btn danger" data-action="delete-item" data-id="${esc(it.id)}">${icon("trash")}Supprimer</button>
        </div>
      </div>
    </div>`;
  $("#detailOverlay").style.setProperty("--bgimg", cur ? `url("${photoSrc(cur).replace(/["\\\n]/g, "")}")` : "none");
  if (!$("#detailOverlay").classList.contains("open")) openOverlay("#detailOverlay");
}

// ---------- Collections ----------
function openCatForm(cat) {
  openForm({
    title: cat ? "Modifier la collection" : "Nouvelle collection",
    values: { name: cat?.name || "", type: cat?.type || "home" },
    fields: (d) => [
      { key: "name", label: "Nom de la collection", full: true, placeholder: TYPES[d.type]?.label || "ex. Résidences, Garage, Sneakers…" },
      { type: "tiles", key: "type", label: "Type (définit l'ambiance, l'icône et les caractéristiques proposées)", options: Object.entries(TYPES).map(([k, t]) => ({ v: k, label: t.label, icon: k })) },
    ],
    onSave: (d) => {
      const name = d.name.trim() || TYPES[d.type].label;
      if (cat) Object.assign(catById(cat.id), { name, type: d.type });
      else { const id = uid(); state.categories.push({ id, name, type: d.type }); ui.view = "cat:" + id; ui.tab = "owned"; }
      save(); render();
    },
    onDelete: cat ? () => {
      const items = state.items.filter(i => i.cat === cat.id);
      if (!confirm(`Supprimer la collection « ${cat.name} »${items.length ? ` et ses ${items.length} bien(s)` : ""} ?`)) return false;
      items.forEach(i => i.photos.forEach(dropPhotoFile));
      state.categories = state.categories.filter(x => x.id !== cat.id);
      state.items = state.items.filter(i => i.cat !== cat.id);
      ui.view = "overview"; save(); render(); return true;
    } : null,
  });
}

// ---------- Apparence (réglages) ----------
function openSettings() {
  const s = state.settings;
  const sw = (cols) => `<div class="sw">${cols.map(c => `<i style="background:${c}"></i>`).join("")}</div>`;
  const fromDraft = (d) => ({ theme: d.theme, name: (d.name || "").trim(), bg: (d.bgList || [])[0] || null, bgVeil: Number(d.bgVeil), bgBlur: Number(d.bgBlur) });
  openForm({
    title: "Apparence", saveLabel: "Appliquer", noFocus: true,
    values: { ...s, bgList: s.bg ? [s.bg] : [] },
    fields: (d) => [
      { key: "name", label: "Ton prénom (pour l'accueil)", full: true, placeholder: "ex. Alex" },
      { type: "tiles", key: "theme", label: "Ambiance", options: [
        { v: "day", cls: "theme-tile", html: sw(["#f6dcc0", "#f3ece0", "#a5762f", "#d9e3cf"]) + "<span>Jour · lumineux et chaleureux</span>" },
        { v: "night", cls: "theme-tile", html: sw(["#0c0c0e", "#1d1d22", "#cfa968", "#3a4654"]) + "<span>Nuit · sombre et feutré</span>" },
      ] },
      { type: "photos", key: "bgList", label: "Photo de fond", single: true, hint: "Ta maison, un paysage, ta voiture préférée… Glisse une photo ici ou clique sur +." },
      d.bgList?.length ? { type: "range", key: "bgVeil", label: "Voile sur la photo (lisibilité)", min: 0, max: 90 } : null,
      d.bgList?.length ? { type: "range", key: "bgBlur", label: "Flou de la photo", min: 0, max: 30 } : null,
    ],
    onLive: (d) => applyAppearance(fromDraft(d)),
    onCancel: () => applyAppearance(state.settings),
    onSave: (d) => { state.settings = { ...state.settings, ...fromDraft(d) }; applyAppearance(state.settings); save(); render(); toast("Apparence mise à jour"); },
  });
}

// ---------- Visionneuse ----------
const LB = { list: [], caps: [], i: 0 };
function openLightbox(list, i = 0, caps = []) { if (!list.length) return; LB.list = list; LB.caps = caps; LB.i = i; showLb(); $("#lightbox").classList.add("open"); }
function showLb() {
  $("#lbImg").src = photoSrc(LB.list[LB.i]);
  const n = LB.list.length;
  $("#lbCap").textContent = [LB.caps[LB.i], n > 1 ? `${LB.i + 1} / ${n}` : ""].filter(Boolean).join("  ·  ");
  $$(".lb-btn").forEach(b => b.style.display = n > 1 ? "" : "none");
}
const lbOpen = () => $("#lightbox").classList.contains("open");

// ---------- Sauvegarde / import ----------
async function exportData() {
  toast("Préparation de la sauvegarde…");
  const copy = clone(state);
  if (bridge) await mapAllPhotos(copy, p => /^(data:|https?:)/.test(p) ? p : bridge.readPhoto(p).catch(() => null));
  const json = JSON.stringify({ app: "lifestyle", version: 3, exportedAt: new Date().toISOString(), ...copy });
  const name = `lifestyle-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
  if (bridge?.exportFile) { if (await bridge.exportFile(name, json)) toast("Sauvegarde enregistrée"); return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([json], { type: "application/json" })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function importData(file) {
  try {
    const s = normalize(JSON.parse(await file.text()));
    if (!s) throw new Error("format");
    if (!confirm("Remplacer toutes les données actuelles par cette sauvegarde ?")) return;
    if (bridge) {
      toast("Import des photos…");
      await mapAllPhotos(s, async p => p.startsWith("data:") ? bridge.savePhoto(new Uint8Array(await (await fetch(p)).arrayBuffer())) : p);
    }
    state = { categories: s.categories, items: s.items, trips: s.trips, settings: s.settings };
    applyAppearance(state.settings);
    ui.view = "overview"; save(); render(); toast("Sauvegarde restaurée");
  } catch (e) { console.error(e); toast("Fichier de sauvegarde invalide"); }
}

// ---------- Actions ----------
Object.assign(ACTIONS, {
  "close": () => closeAll(),
  "close-go": (el, e) => { e.preventDefault(); closeAll(); go(el.dataset.view); },
  "add-item": (el) => openItemForm(null, el.dataset.cat || null),
  "edit-item": (el) => openItemForm(itemById(el.dataset.id)),
  "delete-item": (el) => { if (deleteItem(el.dataset.id)) closeAll(); },
  "new-cat": () => openCatForm(null),
  "edit-cat": (el) => openCatForm(catById(el.dataset.cat)),
  "form-save": () => formSave(),
  "form-delete": () => formDelete(),
  "settings": () => openSettings(),
  "export": () => exportData(),
  "import": () => $("#importInput").click(),
  "open-data": () => bridge?.openDataFolder(),
  "detail-step": (el) => { const n = itemById(ui.detailId).photos.length; openDetail(ui.detailId, (ui.detailIdx + +el.dataset.step + n) % n); },
  "detail-idx": (el) => openDetail(ui.detailId, +el.dataset.i),
  "set-cover": () => { const it = itemById(ui.detailId); const [ph] = it.photos.splice(ui.detailIdx, 1); it.photos.unshift(ph); save(); render(); openDetail(it.id, 0); toast("Photo de couverture mise à jour"); },
  "del-photo": () => { const it = itemById(ui.detailId); if (!confirm("Supprimer cette photo ?")) return; const [ph] = it.photos.splice(ui.detailIdx, 1); dropPhotoFile(ph); save(); render(); openDetail(it.id, Math.max(0, ui.detailIdx - 1)); },
  "lb-step": (el) => { LB.i = (LB.i + +el.dataset.step + LB.list.length) % LB.list.length; showLb(); },
  "lb-close": () => $("#lightbox").classList.remove("open"),
});

// ---------- Événements ----------
document.addEventListener("click", (e) => {
  const t = e.target;
  // Formulaire générique
  const ftile = t.closest("[data-ftile]");
  if (ftile && FORM) { setP(FORM.draft, ftile.dataset.ftile, ftile.dataset.v); return formChanged(true); }
  const fpick = t.closest("[data-fpick]");
  if (fpick && FORM) { const k = fpick.dataset.fpick; setP(FORM.draft, k, String(getP(FORM.draft, k)) === fpick.dataset.v ? "" : fpick.dataset.v); return formChanged(true); }
  const fstar = t.closest("[data-fstar]");
  if (fstar && FORM) { const k = fstar.dataset.fstar; const n = +fstar.dataset.v; setP(FORM.draft, k, getP(FORM.draft, k) === n ? 0 : n); return formChanged(true); }
  const frm = t.closest("[data-frm]");
  if (frm && FORM) {
    const k = frm.dataset.frm; const arr = (getP(FORM.draft, k) || []).slice(); const [ref] = arr.splice(+frm.dataset.i, 1);
    if (FORM.newPhotos.includes(ref)) { dropPhotoFile(ref); FORM.newPhotos = FORM.newPhotos.filter(r => r !== ref); } else FORM.removed.push(ref);
    setP(FORM.draft, k, arr); return formChanged(true);
  }
  // Ajout de photos (cartes, fiches, formulaires, voyages)
  const addPhoto = t.closest("[data-add-photo]");
  if (addPhoto) {
    e.stopPropagation(); e.preventDefault();
    const [kind, ...rest] = addPhoto.dataset.addPhoto.split(":"); const arg = rest.join(":");
    const single = kind === "form" && FORM?.defs[arg]?.single;
    return pickPhotos(refs => DROPS[kind]?.(arg, refs), !single);
  }
  // Visionneuse
  if (t.hasAttribute?.("data-lb")) { const g = ui.lb[+t.dataset.lb]; if (g) { e.stopPropagation(); return openLightbox(g.list, +t.dataset.i || 0, g.caps); } }
  // Actions
  const act = t.closest("[data-action]");
  if (act && ACTIONS[act.dataset.action]) return ACTIONS[act.dataset.action](act, e);
  const view = t.closest("[data-view]");
  if (view) { e.preventDefault(); if ($("#detailOverlay").classList.contains("open")) closeAll(); return go(view.dataset.view); }
  const tab = t.closest("[data-tab]");
  if (tab) { ui.tab = tab.dataset.tab; return renderContent(); }
  const card = t.closest("[data-open]");
  if (card) return openDetail(card.dataset.open);
  if (t.classList.contains("overlay")) closeAll();
  if (t.id === "lightbox") $("#lightbox").classList.remove("open");
});
document.addEventListener("input", (e) => {
  const f = e.target.closest("#form [data-f]");
  if (f && FORM) { setP(FORM.draft, f.dataset.f, f.value); if (f.type === "range") formChanged(false); }
});
document.addEventListener("change", (e) => {
  const f = e.target.closest("#form [data-f]");
  if (f && FORM) { setP(FORM.draft, f.dataset.f, f.value); if (f.hasAttribute("data-rerender")) formChanged(true); }
});
$("#photoInput").addEventListener("change", async (e) => {
  const files = [...e.target.files]; e.target.value = "";
  const cb = photoCb; photoCb = null;
  const refs = await storeFiles(files);
  if (refs.length) cb ? cb(refs) : refs.forEach(dropPhotoFile);
});
$("#importInput").addEventListener("change", (e) => { const f = e.target.files[0]; e.target.value = ""; if (f) importData(f); });
$("#search").addEventListener("input", (e) => { ui.q = e.target.value.trim(); renderContent(); });
$("main").addEventListener("scroll", (e) => e.currentTarget.classList.toggle("scrolled", e.currentTarget.scrollTop > 8), { passive: true });
document.addEventListener("keydown", (e) => {
  if (lbOpen()) {
    if (e.key === "Escape") $("#lightbox").classList.remove("open");
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { LB.i = (LB.i + (e.key === "ArrowRight" ? 1 : -1) + LB.list.length) % LB.list.length; showLb(); }
    return;
  }
  if (e.key === "Escape") closeAll();
  if (ui.detailId && !FORM && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
    const n = itemById(ui.detailId)?.photos.length || 0; if (n > 1) openDetail(ui.detailId, (ui.detailIdx + (e.key === "ArrowRight" ? 1 : -1) + n) % n);
  }
  if (e.key === "Enter" && FORM && e.target.matches("#form input[data-f]")) { e.preventDefault(); formSave(); }
});

// Glisser-déposer de photos sur toute cible [data-drop="type:argument"]
let lastOver = null;
const clearOver = () => { lastOver?.classList.remove("drop"); lastOver = null; };
document.addEventListener("dragover", (e) => {
  if (!e.dataTransfer?.types?.includes("Files")) return;
  e.preventDefault();
  const z = e.target.closest?.("[data-drop]");
  if (z !== lastOver) { clearOver(); if (z) { z.classList.add("drop"); lastOver = z; } }
  e.dataTransfer.dropEffect = z ? "copy" : "none";
});
document.addEventListener("dragleave", (e) => { if (!e.relatedTarget) clearOver(); });
document.addEventListener("drop", async (e) => {
  e.preventDefault(); const z = e.target.closest?.("[data-drop]"); clearOver();
  if (!z || !e.dataTransfer.files.length) return;
  const [kind, ...rest] = z.dataset.drop.split(":");
  const refs = await storeFiles(e.dataTransfer.files);
  if (refs.length) DROPS[kind] ? DROPS[kind](rest.join(":"), refs) : refs.forEach(dropPhotoFile);
});

// ---------- Démarrage ----------
document.addEventListener("DOMContentLoaded", async () => {
  state = await loadState();
  applyAppearance(state.settings);
  if (bridge) { $("#btnOpenData").hidden = false; save(); }
  render();
});
