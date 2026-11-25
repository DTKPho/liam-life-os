"use strict";
/* =========================================================
   Mon Lifestyle — Vacances
   Un voyage = trajets (véhicules de la collection ou transports),
   hébergements, carnet jour par jour, album photo et budget.
   ========================================================= */

const MODES = {
  vehicle: { label: "Un de mes véhicules", icon: "car" },
  flight:  { label: "Avion de ligne", icon: "plane", ph: "ex. Air France AF 1234" },
  train:   { label: "Train", icon: "train", ph: "ex. TGV Inoui 6201" },
  rental:  { label: "Voiture de location", icon: "car", ph: "ex. Sixt · Range Rover" },
  boat:    { label: "Bateau / ferry", icon: "boat", ph: "ex. Corsica Ferries" },
  bus:     { label: "Car / navette", icon: "bus", ph: "ex. Navette hôtel" },
  other:   { label: "Autre", icon: "route", ph: "ex. Hélicoptère" },
};
const STAY_KINDS = {
  hotel:   { label: "Hôtel", icon: "bed" },
  rental:  { label: "Location", icon: "key" },
  mine:    { label: "Une de mes propriétés", icon: "home" },
  family:  { label: "Maison de famille", icon: "users" },
  friends: { label: "Chez des amis", icon: "heart" },
  other:   { label: "Autre (bateau, camp…)", icon: "sun" },
};
const EXP_CATS = {
  food:     { label: "Restaurants", icon: "utensils" },
  activity: { label: "Activités", icon: "ticket" },
  shopping: { label: "Shopping", icon: "bag" },
  local:    { label: "Transport sur place", icon: "route" },
  other:    { label: "Autre", icon: "more" },
};

// ---------- Données ----------
function normalizeTrip(t) {
  return {
    id: t.id || uid(), createdAt: t.createdAt || Date.now(),
    title: t.title || "Voyage", destination: t.destination || "", country: t.country || "",
    start: t.start || "", end: t.end || "", travelers: t.travelers || "", rating: +t.rating || 0, summary: t.summary || "",
    photos: Array.isArray(t.photos) ? t.photos : [],
    legs: (t.legs || []).map(l => ({ id: l.id || uid(), mode: l.mode || "other", ...l })),
    stays: (t.stays || []).map(s => ({ id: s.id || uid(), kind: s.kind || "hotel", photos: [], ...s })),
    days: (t.days || []).map(d => ({ id: d.id || uid(), photos: [], ...d })),
    expenses: (t.expenses || []).map(x => ({ id: x.id || uid(), cat: x.cat || "other", ...x })),
  };
}
const tripById = (id) => state.trips.find(t => t.id === id);
async function mapTripPhotos(t, fn) {
  t.photos = (await Promise.all(t.photos.map(fn))).filter(Boolean);
  for (const s of t.stays) s.photos = (await Promise.all((s.photos || []).map(fn))).filter(Boolean);
  for (const d of t.days) d.photos = (await Promise.all((d.photos || []).map(fn))).filter(Boolean);
}
const tripsUsingItem = (itemId) => state.trips.filter(t => t.legs.some(l => l.itemId === itemId) || t.stays.some(s => s.itemId === itemId));
const nightsBetween = (a, b) => a && b ? Math.max(0, Math.round((toDate(b) - toDate(a)) / 864e5)) : 0;
const tripNights = (t) => nightsBetween(t.start, t.end) || t.stays.reduce((s, x) => s + nightsBetween(x.checkIn, x.checkOut), 0);
const travelersOf = (t) => String(t.travelers || "").split(/[,;]| et /).map(s => s.trim()).filter(Boolean);
const initials = (n) => n.split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
const sortedTrips = () => state.trips.slice().sort((a, b) => (b.start || "").localeCompare(a.start || "") || b.createdAt - a.createdAt);
function fmtRange(a, b) {
  if (!a) return "";
  const A = toDate(a), B = b ? toDate(b) : null;
  if (!B) return fmtDate(a);
  const sameY = A.getFullYear() === B.getFullYear(), sameM = sameY && A.getMonth() === B.getMonth();
  if (sameM) return `${A.getDate()} – ${B.getDate()} ${B.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
  if (sameY) return `${A.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${B.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
  return `${fmtDate(a, { day: "numeric", month: "short", year: "numeric" })} – ${fmtDate(b, { day: "numeric", month: "short", year: "numeric" })}`;
}
const shortDate = (d) => d ? toDate(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "";
const legVehicle = (l) => l.mode === "vehicle" && l.itemId ? itemById(l.itemId) : null;
const stayProperty = (s) => (s.kind === "mine" || s.kind === "family") && s.itemId ? itemById(s.itemId) : null;
const stayPhotos = (s) => [...(s.photos || []), ...(stayProperty(s)?.photos || [])];
const stayName = (s) => s.name || stayProperty(s)?.name || STAY_KINDS[s.kind]?.label || "Hébergement";
const legTitle = (l) => legVehicle(l)?.name || l.label || MODES[l.mode]?.label || "Trajet";
const allTripPhotos = (t) => [...t.photos, ...t.days.flatMap(d => d.photos || []), ...t.stays.flatMap(s => s.photos || [])];
const tripCover = (t) => t.photos[0] || t.stays.map(s => stayPhotos(s)[0]).find(Boolean) || t.days.map(d => d.photos?.[0]).find(Boolean) || null;
function tripBudget(t) {
  const rows = [
    { k: "transport", label: "Transport", icon: "plane", v: t.legs.reduce((s, l) => s + num(l.price), 0) },
    { k: "stay", label: "Hébergement", icon: "bed", v: t.stays.reduce((s, x) => s + num(x.price), 0) },
    ...Object.entries(EXP_CATS).map(([k, c]) => ({ k, label: c.label, icon: c.icon, v: t.expenses.filter(x => x.cat === k).reduce((s, x) => s + num(x.amount), 0) })),
  ];
  return { rows: rows.filter(r => r.v > 0), total: rows.reduce((s, r) => s + r.v, 0) };
}
function save_render() { save(); render(); }

// ---------- Vues ----------
function postcardHtml(t) {
  const cover = tripCover(t); const n = tripNights(t);
  const d = t.start ? toDate(t.start) : null;
  const modes = [...new Set(t.legs.map(l => l.mode))];
  const vehicles = t.legs.map(legVehicle).filter(v => v?.photos[0]);
  return `<article class="postcard" data-view="trip:${esc(t.id)}" data-drop="trip:${esc(t.id)}">
    <div class="pc-media">${cover ? `<img src="${esc(photoSrc(cover))}" alt="" loading="lazy">` : `<div class="pc-empty">${icon("sun")}</div>`}
      ${d ? `<div class="stamp"><b>${esc(d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""))}</b><span>${d.getFullYear()}</span></div>` : ""}</div>
    <div class="pc-body">
      <div class="kicker">${esc([t.destination, t.country].filter(Boolean).join(" · ") || "Destination")}</div>
      <h3>${esc(t.title)}</h3>
      <div class="pc-meta">${esc(fmtRange(t.start, t.end))}${n ? ` · ${n} nuit${n > 1 ? "s" : ""}` : ""}</div>
      <div class="pc-foot">
        <div class="pc-modes">${vehicles.slice(0, 2).map(v => `<img src="${esc(photoSrc(v.photos[0]))}" alt="" title="${esc(v.name)}">`).join("")}${modes.filter(m => m !== "vehicle").map(m => `<span title="${esc(MODES[m]?.label)}">${icon(MODES[m]?.icon)}</span>`).join("")}</div>
        <div class="avatars">${travelersOf(t).slice(0, 4).map(p => `<span title="${esc(p)}">${esc(initials(p))}</span>`).join("")}</div>
      </div>
    </div></article>`;
}

VIEWS.trips = () => {
  const list = sortedTrips().filter(t => !ui.q || [t.title, t.destination, t.country, t.summary, t.travelers].some(v => String(v || "").toLowerCase().includes(ui.q.toLowerCase())));
  const nights = state.trips.reduce((s, t) => s + tripNights(t), 0);
  const countries = new Set(state.trips.map(t => t.country.trim().toLowerCase()).filter(Boolean));
  const budget = state.trips.reduce((s, t) => s + tripBudget(t).total, 0);
  const last = sortedTrips()[0];
  const byYear = {};
  list.forEach(t => { const y = t.start ? t.start.slice(0, 4) : "Sans date"; (byYear[y] = byYear[y] || []).push(t); });
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));
  return `<div class="theme" style="--glow:200,140,80">
    ${heroHtml({ kicker: "Carnet de voyages", title: "Vacances", img: last ? tripCover(last) : null, iconKey: "sun",
      sub: last ? `Dernière évasion : <b>${esc(last.title)}</b>${last.destination ? " · " + esc(last.destination) : ""}` : "Tes voyages, comment tu y es allé, où tu as dormi, et tous les souvenirs.",
      stats: [["Voyages", String(state.trips.length)], ["Nuits", String(nights)], ["Pays", String(countries.size)], ["Budget cumulé", budget ? eur(budget) : "—"]],
      actions: `<button class="btn primary" data-action="trip-new">${icon("plus")}Nouveau voyage</button>` })}
    ${years.map(y => `<section class="sec"><div class="sec-head"><h2>${esc(y)}</h2><span class="meta">${byYear[y].length} voyage${byYear[y].length > 1 ? "s" : ""}</span></div>
      <div class="postcards">${byYear[y].map(postcardHtml).join("")}</div></section>`).join("")}
    ${!ui.q ? `<div class="postcards"><button class="postcard pc-new" data-action="trip-new"><span class="c">${icon("plus")}</span><b>Nouveau voyage</b><span>Destination, trajets, hôtels, photos…</span></button></div>` : ""}
  </div>`;
};

function legHtml(t, l, i) {
  const v = legVehicle(l); const m = MODES[l.mode] || MODES.other;
  const img = v?.photos[0] || l.photo;
  const cat = v ? catById(v.cat) : null;
  return `<article class="leg" data-action="leg-edit" data-trip="${esc(t.id)}" data-id="${esc(l.id)}">
    <div class="leg-step">${i + 1}</div>
    <div class="leg-media">${img ? `<img src="${esc(photoSrc(img))}" alt="">` : `<div class="leg-ico">${icon(m.icon)}</div>`}${v && isFam(v) ? `<span class="tag fam">Famille</span>` : ""}</div>
    <div class="leg-body">
      <div class="leg-kind">${icon(v ? cat?.type : m.icon)}${esc(v ? [v.brand, cat?.name].filter(Boolean).join(" · ") : m.label)}</div>
      <h4>${esc(legTitle(l))}</h4>
      ${l.from || l.to ? `<div class="leg-route"><span>${esc(l.from || "…")}</span><i></i>${icon(m.icon)}<i></i><span>${esc(l.to || "…")}</span></div>` : ""}
      <div class="leg-meta">${[l.date && fmtDate(l.date, { weekday: "short", day: "numeric", month: "long" }), l.notes].filter(Boolean).map(esc).join(" · ")}</div>
    </div>
    ${num(l.price) ? `<div class="leg-price">${eur(num(l.price))}</div>` : ""}
  </article>`;
}
function stayHtml(t, s) {
  const k = STAY_KINDS[s.kind] || STAY_KINDS.other;
  const photos = stayPhotos(s); const n = nightsBetween(s.checkIn, s.checkOut);
  const lb = lbReg(photos, photos.map(() => stayName(s)));
  const prop = stayProperty(s);
  return `<article class="stay" data-action="stay-edit" data-trip="${esc(t.id)}" data-id="${esc(s.id)}" data-drop="stay:${esc(t.id)}:${esc(s.id)}">
    <div class="stay-media">${photos[0] ? `<img src="${esc(photoSrc(photos[0]))}" alt="" data-lb="${lb}" data-i="0">` : `<button class="placeholder" data-add-photo="stay:${esc(t.id)}:${esc(s.id)}">${icon(k.icon, "i big")}<span class="add">${icon("camera")}Ajouter des photos</span></button>`}
      <span class="tag ${s.kind === "family" ? "fam" : ""}">${esc(k.label)}</span>
      ${photos.length > 1 ? `<span class="count">${icon("camera")}${photos.length}</span>` : ""}
      ${photos.length > 1 ? `<div class="stay-strip">${photos.slice(1, 4).map((p, i) => `<img src="${esc(photoSrc(p))}" alt="" data-lb="${lb}" data-i="${i + 1}">`).join("")}</div>` : ""}</div>
    <div class="stay-body">
      <h4>${esc(stayName(s))}</h4>
      ${s.address || prop?.specs?.address || prop?.location ? `<div class="l-loc">${icon("pin")}<span>${esc(s.address || prop?.specs?.address || prop?.location)}</span></div>` : ""}
      ${s.room ? `<div class="stay-room">${esc(s.room)}</div>` : ""}
      <div class="stay-dates">${icon("calendar")}${s.checkIn ? `${esc(shortDate(s.checkIn))} → ${esc(shortDate(s.checkOut) || "…")}` : "Dates à préciser"}${n ? ` · <b>${n} nuit${n > 1 ? "s" : ""}</b>` : ""}</div>
      ${s.notes ? `<p class="stay-notes">${esc(s.notes)}</p>` : ""}
      <div class="stay-foot">${starsRo(s.rating) || "<span></span>"}<span class="stay-price">${num(s.price) ? `${eur(num(s.price))}${n ? `<small> · ${eur(num(s.price) / n)}/nuit</small>` : ""}` : s.kind === "mine" || s.kind === "family" ? "<small>Offert par la maison</small>" : ""}</span></div>
    </div>
  </article>`;
}
function dayHtml(t, d) {
  const dt = d.date ? toDate(d.date) : null;
  const lb = lbReg(d.photos || [], (d.photos || []).map(() => d.title || ""));
  return `<article class="day" data-drop="day:${esc(t.id)}:${esc(d.id)}">
    <div class="day-date">${dt ? `<b>${dt.getDate()}</b><span>${esc(dt.toLocaleDateString("fr-FR", { month: "short" }))}</span><small>${esc(dt.toLocaleDateString("fr-FR", { weekday: "short" }))}</small>` : `<b>·</b>`}</div>
    <div class="day-body">
      <div class="day-head"><h4>${esc(d.title || "Journée")}</h4><button class="btn ghost sm" data-action="day-edit" data-trip="${esc(t.id)}" data-id="${esc(d.id)}">${icon("edit")}Modifier</button></div>
      ${d.place ? `<div class="l-loc">${icon("pin")}<span>${esc(d.place)}</span></div>` : ""}
      ${d.text ? `<p>${esc(d.text)}</p>` : ""}
      <div class="day-photos">${(d.photos || []).map((p, i) => `<img src="${esc(photoSrc(p))}" alt="" data-lb="${lb}" data-i="${i}" loading="lazy">`).join("")}
        <button class="day-add" data-add-photo="day:${esc(t.id)}:${esc(d.id)}" title="Ajouter des photos">${icon("camera")}</button></div>
    </div>
  </article>`;
}

VIEWS.trip = (id) => {
  const t = tripById(id);
  if (!t) { ui.view = "trips"; return VIEWS.trips(); }
  const n = tripNights(t); const people = travelersOf(t); const b = tripBudget(t);
  const all = allTripPhotos(t);
  const lbAll = lbReg(all, all.map(() => t.title));
  const days = t.days.slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const stays = t.stays.slice().sort((a, b) => (a.checkIn || "").localeCompare(b.checkIn || ""));
  const legs = t.legs.slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const sec = (id, title, sub, btn, body) => `<section class="tsec" id="${id}"><div class="sec-head"><h2>${title}</h2><span class="meta">${sub}</span><span class="spacer"></span>${btn}</div>${body}</section>`;
  const expRows = t.expenses.slice().sort((a, b) => num(b.amount) - num(a.amount));
  return `<div class="theme trip" style="--glow:200,140,80">
    ${heroHtml({ kicker: fmtRange(t.start, t.end) || "Dates à préciser", title: t.title, img: tripCover(t), iconKey: "sun",
      sub: esc([t.destination, t.country].filter(Boolean).join(" · ")),
      stats: [["Durée", n ? `${n} nuit${n > 1 ? "s" : ""}` : "—"], ["Voyageurs", people.length ? String(people.length) : "—"], ["Budget", b.total ? eur(b.total) : "—"], ...(t.rating ? [["Note", "★".repeat(t.rating)]] : [])],
      actions: `<button class="btn glass" data-add-photo="trip:${esc(t.id)}">${icon("camera")}Photos</button><button class="btn glass" data-action="trip-edit" data-id="${esc(t.id)}">${icon("edit")}Modifier</button>` })}
    <nav class="trip-nav">
      ${[["t-legs", "route", "Le trajet", t.legs.length], ["t-stays", "bed", "Où on a dormi", t.stays.length], ["t-days", "book", "Carnet", t.days.length], ["t-album", "image", "Album", all.length], ["t-budget", "wallet", "Budget", b.total ? short(b.total) : ""]]
        .map(([a, ic, l, c]) => `<button data-action="trip-scroll" data-target="${a}">${icon(ic)}${l}${c ? `<span>${c}</span>` : ""}</button>`).join("")}
    </nav>
    <div class="trip-layout">
      <div class="trip-main">
        ${sec("t-legs", "Le trajet", legs.length ? `${legs.length} étape${legs.length > 1 ? "s" : ""}` : "", `<button class="btn sm" data-action="leg-add" data-trip="${esc(t.id)}">${icon("plus")}Ajouter un trajet</button>`,
          legs.length ? `<div class="legs">${legs.map((l, i) => legHtml(t, l, i)).join("")}</div>` : `<button class="tempty" data-action="leg-add" data-trip="${esc(t.id)}">${icon("route", "i big")}<b>Comment y êtes-vous allés ?</b><span>Choisis un véhicule de ton garage, ton jet, ou un vol, un train…</span></button>`)}
        ${sec("t-stays", "Où on a dormi", stays.length ? `${stays.length} adresse${stays.length > 1 ? "s" : ""}` : "", `<button class="btn sm" data-action="stay-add" data-trip="${esc(t.id)}">${icon("plus")}Ajouter un hébergement</button>`,
          stays.length ? `<div class="stays">${stays.map(s => stayHtml(t, s)).join("")}</div>` : `<button class="tempty" data-action="stay-add" data-trip="${esc(t.id)}">${icon("bed", "i big")}<b>Hôtels, locations, maison de famille…</b><span>Avec les dates, le prix, ta note et les photos.</span></button>`)}
        ${sec("t-days", "Carnet de voyage", days.length ? `${days.length} jour${days.length > 1 ? "s" : ""}` : "", `<button class="btn sm" data-action="day-add" data-trip="${esc(t.id)}">${icon("plus")}Ajouter une journée</button>`,
          days.length ? `<div class="days">${days.map(d => dayHtml(t, d)).join("")}</div>` : `<button class="tempty" data-action="day-add" data-trip="${esc(t.id)}">${icon("book", "i big")}<b>Raconte chaque journée</b><span>Ce que vous avez fait, les bonnes adresses, avec les photos du jour.</span></button>`)}
        ${sec("t-album", "Album", all.length ? `${all.length} photo${all.length > 1 ? "s" : ""}` : "", `<button class="btn sm" data-add-photo="trip:${esc(t.id)}">${icon("camera")}Ajouter des photos</button>`,
          `<div class="album" data-drop="trip:${esc(t.id)}">${all.length ? all.map((p, i) => `<img src="${esc(photoSrc(p))}" alt="" data-lb="${lbAll}" data-i="${i}" loading="lazy">`).join("") : `<button class="tempty" data-add-photo="trip:${esc(t.id)}">${icon("image", "i big")}<b>Glisse ici toutes tes photos de vacances</b><span>Elles s'ajoutent à l'album, avec celles des hôtels et du carnet.</span></button>`}</div>`)}
        ${sec("t-budget", "Budget", b.total ? eur(b.total) : "", `<button class="btn sm" data-action="exp-add" data-trip="${esc(t.id)}">${icon("plus")}Ajouter une dépense</button>`,
          `<div class="budget panel">${b.rows.length ? `<div class="alloc">${b.rows.map(r => `<div class="alloc-row"><span class="nm">${icon(r.icon)}<span>${esc(r.label)}</span></span><span class="val">${eur(r.v)}<small>${Math.round(r.v / b.total * 100)} %</small></span><span class="track"><div style="width:${Math.max(2, r.v / Math.max(...b.rows.map(x => x.v)) * 100)}%"></div></span></div>`).join("")}</div>` : `<p class="muted">Les prix des trajets et hébergements s'ajoutent ici automatiquement. Ajoute aussi restaurants, activités, shopping…</p>`}
            ${expRows.length ? `<ul class="exp-list">${expRows.map(x => `<li>${icon(EXP_CATS[x.cat]?.icon)}<span>${esc(x.label || EXP_CATS[x.cat]?.label)}</span><small>${esc(EXP_CATS[x.cat]?.label || "")}${x.date ? " · " + esc(shortDate(x.date)) : ""}</small><b>${eur(num(x.amount))}</b><button class="x" data-action="exp-edit" data-trip="${esc(t.id)}" data-id="${esc(x.id)}" title="Modifier">${icon("edit")}</button></li>`).join("")}</ul>` : ""}
            ${b.total && (n || people.length) ? `<div class="budget-foot">${n ? `<span>${eur(b.total / n)} <small>par nuit</small></span>` : ""}${people.length ? `<span>${eur(b.total / people.length)} <small>par personne</small></span>` : ""}</div>` : ""}
          </div>`)}
      </div>
      <div class="trip-side">
        <div class="panel">
          <div class="kicker">En bref</div>
          <dl class="specs">
            <dt>Dates</dt><dd>${esc(fmtRange(t.start, t.end) || "—")}</dd>
            <dt>Destination</dt><dd>${esc([t.destination, t.country].filter(Boolean).join(", ") || "—")}</dd>
            <dt>Durée</dt><dd>${n ? `${n} nuit${n > 1 ? "s" : ""}` : "—"}</dd>
            <dt>Budget</dt><dd>${b.total ? eur(b.total) : "—"}</dd>
          </dl>
          ${people.length ? `<div class="people">${people.map(p => `<span><i>${esc(initials(p))}</i>${esc(p)}</span>`).join("")}</div>` : ""}
          ${t.rating ? `<div class="side-rating">${starsRo(t.rating)}</div>` : ""}
          ${t.summary ? `<blockquote>${esc(t.summary)}</blockquote>` : `<button class="btn ghost sm" data-action="trip-edit" data-id="${esc(t.id)}">${icon("edit")}Écrire le souvenir du voyage</button>`}
        </div>
      </div>
    </div>
  </div>`;
};

function escapeBandHtml() {
  const t = sortedTrips()[0];
  if (!t) return `<section class="escape">
    <div class="escape-media"><div class="pc-empty">${icon("sun")}</div></div>
    <div class="escape-body"><div class="kicker">Vacances</div><h3>Raconte tes évasions</h3>
      <p>Comment vous êtes partis (avec ta voiture, ton bateau ou en avion), où vous avez dormi, chaque journée et toutes les photos.</p>
      <div class="acts"><button class="btn primary" data-action="trip-new">${icon("plus")}Créer mon premier voyage</button></div></div>
  </section>`;
  const cover = tripCover(t); const n = tripNights(t); const d = t.start ? toDate(t.start) : null;
  return `<section class="escape">
    <div class="escape-media" data-view="trip:${esc(t.id)}" style="cursor:pointer">${cover ? `<img src="${esc(photoSrc(cover))}" alt="">` : `<div class="pc-empty">${icon("sun")}</div>`}
      ${d ? `<div class="stamp"><b>${esc(d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""))}</b><span>${d.getFullYear()}</span></div>` : ""}</div>
    <div class="escape-body">
      <div class="kicker">Dernière évasion</div>
      <h3>${esc(t.title)}</h3>
      <p>${esc([fmtRange(t.start, t.end), [t.destination, t.country].filter(Boolean).join(", ")].filter(Boolean).join(" · "))}</p>
      <div class="chips">${[n && `${n} nuit${n > 1 ? "s" : ""}`, t.stays.length && `${t.stays.length} hébergement${t.stays.length > 1 ? "s" : ""}`, travelersOf(t).length && `${travelersOf(t).length} voyageur${travelersOf(t).length > 1 ? "s" : ""}`, allTripPhotos(t).length && `${allTripPhotos(t).length} photos`].filter(Boolean).map(x => `<span>${esc(x)}</span>`).join("")}</div>
      ${t.summary ? `<p class="escape-quote">« ${esc(t.summary.length > 160 ? t.summary.slice(0, 160) + "…" : t.summary)} »</p>` : ""}
      <div class="acts"><button class="btn primary" data-view="trip:${esc(t.id)}">Ouvrir le carnet ${icon("right")}</button><button class="btn" data-view="trips">Tous les voyages (${state.trips.length})</button></div>
    </div>
  </section>`;
}
function searchTrips(q) {
  const res = state.trips.filter(t => [t.title, t.destination, t.country, t.summary].some(v => String(v || "").toLowerCase().includes(q.toLowerCase())));
  return res.length ? `<div class="sec-head" style="margin-top:30px"><h2>${res.length} voyage${res.length > 1 ? "s" : ""}</h2></div><div class="postcards">${res.map(postcardHtml).join("")}</div>` : "";
}

// ---------- Formulaires ----------
function openTripForm(t) {
  openForm({
    title: t ? "Modifier le voyage" : "Nouveau voyage",
    values: t ? clone(t) : { photos: [], rating: 0 },
    fields: [
      { type: "photos", key: "photos", label: "Photos du voyage", hint: "Glisse tes plus belles photos. La première devient la couverture du voyage." },
      { key: "title", label: "Nom du voyage", full: true, placeholder: "ex. Été à Saint-Tropez, Ski à Courchevel…" },
      { key: "destination", label: "Destination", placeholder: "ex. Mykonos" }, { key: "country", label: "Pays", placeholder: "ex. Grèce" },
      { type: "date", key: "start", label: "Départ" }, { type: "date", key: "end", label: "Retour" },
      { key: "travelers", label: "Avec qui ?", full: true, placeholder: "ex. Sarah, Papa, Maman (séparés par des virgules)" },
      { type: "stars", key: "rating", label: "Ta note" },
      { type: "textarea", key: "summary", label: "Le souvenir en quelques mots", placeholder: "Ce qu'on retiendra de ce voyage…" },
    ],
    onSave: (d) => {
      if (!required(d, "title", "un nom de voyage")) return false;
      trimAll(d);
      if (d.start && d.end && d.end < d.start) { toast("La date de retour est avant le départ"); return false; }
      if (t) Object.assign(tripById(t.id), d);
      else { const n = normalizeTrip({ ...d, id: uid() }); state.trips.push(n); ui.view = "trip:" + n.id; }
      save_render(); toast(t ? "Voyage mis à jour" : "Voyage créé");
    },
    onDelete: t ? () => {
      if (!confirm(`Supprimer le voyage « ${t.title} » et toutes ses photos ?`)) return false;
      const tr = tripById(t.id); allTripPhotos(tr).forEach(dropPhotoFile);
      state.trips = state.trips.filter(x => x.id !== t.id); ui.view = "trips"; save_render(); return true;
    } : null,
  });
}

function vehicleOptions() {
  return state.items.filter(i => i.status === "owned" && VEHICLE_TYPES.includes(catById(i.cat)?.type))
    .map(i => ({ v: i.id, label: i.name, img: i.photos[0], icon: catById(i.cat)?.type, sub: [i.brand, isFam(i) ? `Famille${i.familyOwner ? " · " + i.familyOwner : ""}` : catById(i.cat)?.name].filter(Boolean).join(" · ") }));
}
function propertyOptions(owner) {
  return state.items.filter(i => i.status === "owned" && catById(i.cat)?.type === "home" && (owner === "family" ? isFam(i) : mine(i)))
    .map(i => ({ v: i.id, label: i.name, img: i.photos[0], icon: "home", sub: i.specs?.address || i.location || "" }));
}

function openLegForm(t, leg) {
  openForm({
    title: leg ? "Modifier le trajet" : "Ajouter un trajet", wide: true,
    values: leg ? { ...clone(leg), photoList: leg.photo ? [leg.photo] : [] } : { mode: vehicleOptions().length ? "vehicle" : "flight", date: t.start || "", photoList: [] },
    fields: (d) => {
      const m = MODES[d.mode] || MODES.other;
      return [
        { type: "tiles", key: "mode", label: "Comment avez-vous voyagé ?", options: Object.entries(MODES).map(([k, x]) => ({ v: k, label: x.label, icon: x.icon })) },
        d.mode === "vehicle" ? { type: "picks", key: "itemId", label: "Choisis le véhicule", options: vehicleOptions(),
          empty: "Aucun véhicule pour l'instant. Ajoute d'abord ta voiture, ta moto, ton bateau ou ton avion dans une collection de type Automobile, Moto, Nautisme ou Aviation (les véhicules de famille apparaissent aussi)." } : null,
        d.mode !== "vehicle" ? { key: "label", label: "Compagnie / détails", full: true, placeholder: m.ph } : null,
        { key: "from", label: "Départ de", placeholder: "ex. Paris" }, { key: "to", label: "Arrivée à", placeholder: "ex. Saint-Tropez" },
        { type: "date", key: "date", label: "Date" }, { type: "money", key: "price", label: "Coût (carburant, billets…)" },
        { key: "notes", label: "Détails", full: true, placeholder: d.mode === "flight" ? "ex. Classe affaires, siège 2A" : "ex. Escale à Lyon, 7 h de route" },
        d.mode !== "vehicle" ? { type: "photos", key: "photoList", label: "Photo (optionnel)", single: true } : null,
      ];
    },
    onSave: (d) => {
      if (d.mode === "vehicle" && !d.itemId) { toast("Choisis un véhicule"); return false; }
      trimAll(d);
      if (d.mode === "vehicle") { delete d.label; (d.photoList || []).forEach(dropPhotoFile); d.photoList = []; } else delete d.itemId;
      d.photo = (d.photoList || [])[0] || null; delete d.photoList;
      const tr = tripById(t.id);
      if (leg) Object.assign(tr.legs.find(x => x.id === leg.id), d); else tr.legs.push({ id: uid(), ...d });
      save_render();
    },
    onDelete: leg ? () => { if (!confirm("Supprimer ce trajet ?")) return false; const tr = tripById(t.id); const l = tr.legs.find(x => x.id === leg.id); if (l?.photo) dropPhotoFile(l.photo); tr.legs = tr.legs.filter(x => x.id !== leg.id); save_render(); return true; } : null,
  });
}

function openStayForm(t, stay) {
  openForm({
    title: stay ? "Modifier l'hébergement" : "Ajouter un hébergement", wide: true,
    values: stay ? clone(stay) : { kind: "hotel", photos: [], checkIn: t.start || "", checkOut: t.end || "", rating: 0 },
    fields: (d) => {
      const prop = d.kind === "mine" || d.kind === "family";
      return [
        { type: "tiles", key: "kind", label: "Où avez-vous dormi ?", options: Object.entries(STAY_KINDS).map(([k, x]) => ({ v: k, label: x.label, icon: x.icon })) },
        prop ? { type: "picks", key: "itemId", label: d.kind === "family" ? "Quelle maison de famille ?" : "Laquelle de tes propriétés ?", options: propertyOptions(d.kind === "family" ? "family" : "me"),
          empty: d.kind === "family" ? "Aucune propriété de famille. Ajoute-la dans ta collection Immobilier en choisissant « À la famille »." : "Aucune propriété dans ta collection Immobilier pour l'instant." } : null,
        { key: "name", label: prop ? "Nom (optionnel)" : "Nom", full: true, placeholder: d.kind === "hotel" ? "ex. Cheval Blanc St-Tropez" : d.kind === "rental" ? "ex. Villa Mariposa (Airbnb)" : "" },
        prop ? null : { key: "address", label: "Adresse / ville", full: true, placeholder: "ex. Plage de la Bouillabaisse, Saint-Tropez" },
        d.kind === "hotel" ? { key: "room", label: "Chambre / suite", full: true, placeholder: "ex. Suite vue mer" } : null,
        { type: "date", key: "checkIn", label: "Arrivée" }, { type: "date", key: "checkOut", label: "Départ" },
        prop ? null : { type: "money", key: "price", label: "Prix total du séjour" },
        { type: "stars", key: "rating", label: "Ta note" },
        { type: "photos", key: "photos", label: "Photos", hint: prop ? "Les photos de la propriété s'affichent déjà. Ajoute celles du séjour." : "La chambre, la vue, la piscine… La première sert de couverture." },
        { type: "textarea", key: "notes", label: "Notes", rows: 3, placeholder: "Le petit-déjeuner, le service, à refaire ou pas…" },
      ];
    },
    onSave: (d) => {
      const prop = d.kind === "mine" || d.kind === "family";
      if (prop && !d.itemId) { toast("Choisis la propriété"); return false; }
      if (!prop && !required(d, "name", "le nom de l'hébergement")) return false;
      trimAll(d); if (!prop) delete d.itemId; else delete d.price;
      const tr = tripById(t.id);
      if (stay) Object.assign(tr.stays.find(x => x.id === stay.id), d); else tr.stays.push({ id: uid(), ...d });
      save_render();
    },
    onDelete: stay ? () => { if (!confirm("Supprimer cet hébergement et ses photos ?")) return false; const tr = tripById(t.id); (tr.stays.find(x => x.id === stay.id)?.photos || []).forEach(dropPhotoFile); tr.stays = tr.stays.filter(x => x.id !== stay.id); save_render(); return true; } : null,
  });
}

function openDayForm(t, day) {
  const next = () => { const ds = t.days.map(d => d.date).filter(Boolean).sort(); if (!ds.length) return t.start || ""; const d = toDate(ds[ds.length - 1]); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
  openForm({
    title: day ? "Modifier la journée" : "Nouvelle journée",
    values: day ? clone(day) : { date: next(), photos: [] },
    fields: [
      { type: "date", key: "date", label: "Date" }, { key: "place", label: "Lieu", placeholder: "ex. Plage de Pampelonne" },
      { key: "title", label: "Titre de la journée", full: true, placeholder: "ex. Déjeuner au Club 55 et coucher de soleil en bateau" },
      { type: "textarea", key: "text", label: "Récit", rows: 6, placeholder: "Ce que vous avez fait, les rencontres, les bonnes adresses…" },
      { type: "photos", key: "photos", label: "Photos du jour" },
    ],
    onSave: (d) => {
      trimAll(d);
      const tr = tripById(t.id);
      if (day) Object.assign(tr.days.find(x => x.id === day.id), d); else tr.days.push({ id: uid(), ...d });
      save_render();
    },
    onDelete: day ? () => { if (!confirm("Supprimer cette journée et ses photos ?")) return false; const tr = tripById(t.id); (tr.days.find(x => x.id === day.id)?.photos || []).forEach(dropPhotoFile); tr.days = tr.days.filter(x => x.id !== day.id); save_render(); return true; } : null,
  });
}

function openExpenseForm(t, exp) {
  openForm({
    title: exp ? "Modifier la dépense" : "Ajouter une dépense",
    values: exp ? clone(exp) : { cat: "food" },
    fields: [
      { type: "tiles", key: "cat", label: "Catégorie", options: Object.entries(EXP_CATS).map(([k, c]) => ({ v: k, label: c.label, icon: c.icon })) },
      { key: "label", label: "Libellé", placeholder: "ex. Dîner chez Loulou" }, { type: "money", key: "amount", label: "Montant" },
      { type: "date", key: "date", label: "Date" },
    ],
    onSave: (d) => {
      if (!num(d.amount)) { toast("Indique un montant"); return false; }
      trimAll(d);
      const tr = tripById(t.id);
      if (exp) Object.assign(tr.expenses.find(x => x.id === exp.id), d); else tr.expenses.push({ id: uid(), ...d });
      save_render();
    },
    onDelete: exp ? () => { const tr = tripById(t.id); tr.expenses = tr.expenses.filter(x => x.id !== exp.id); save_render(); return true; } : null,
  });
}

// ---------- Actions & photos ----------
const tripOf = (el) => tripById(el.dataset.trip);
Object.assign(ACTIONS, {
  "trip-new": () => openTripForm(null),
  "trip-edit": (el) => openTripForm(tripById(el.dataset.id)),
  "trip-scroll": (el) => document.getElementById(el.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" }),
  "leg-add": (el) => openLegForm(tripOf(el), null),
  "leg-edit": (el) => { const t = tripOf(el); openLegForm(t, t.legs.find(x => x.id === el.dataset.id)); },
  "stay-add": (el) => openStayForm(tripOf(el), null),
  "stay-edit": (el) => { const t = tripOf(el); openStayForm(t, t.stays.find(x => x.id === el.dataset.id)); },
  "day-add": (el) => openDayForm(tripOf(el), null),
  "day-edit": (el) => { const t = tripOf(el); openDayForm(t, t.days.find(x => x.id === el.dataset.id)); },
  "exp-add": (el) => openExpenseForm(tripOf(el), null),
  "exp-edit": (el) => { const t = tripOf(el); openExpenseForm(t, t.expenses.find(x => x.id === el.dataset.id)); },
});
DROPS.trip = (id, refs) => { const t = tripById(id); if (!t) return refs.forEach(dropPhotoFile); t.photos.push(...refs); save_render(); toast(refs.length > 1 ? `${refs.length} photos ajoutées à l'album` : "Photo ajoutée à l'album"); };
DROPS.stay = (arg, refs) => { const [tid, sid] = arg.split(":"); const s = tripById(tid)?.stays.find(x => x.id === sid); if (!s) return refs.forEach(dropPhotoFile); (s.photos = s.photos || []).push(...refs); save_render(); toast("Photos ajoutées"); };
DROPS.day = (arg, refs) => { const [tid, did] = arg.split(":"); const d = tripById(tid)?.days.find(x => x.id === did); if (!d) return refs.forEach(dropPhotoFile); (d.photos = d.photos || []).push(...refs); save_render(); toast("Photos ajoutées"); };
