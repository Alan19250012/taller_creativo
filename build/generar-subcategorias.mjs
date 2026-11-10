/* Genera assets/ek-subcategorias.js
   Uso:  node build/generar-subcategorias.mjs

   Cada SUBCATEGORÍA puede pertenecer a VARIAS categorías principales
   (por ejemplo "Letreros" vive en Navidad, Graduación, Decoración y MDF).
   Los artículos se asignan solos por reglas sobre su nombre y características,
   así que si agregas artículos nuevos solo vuelves a correr este comando.   */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const raiz = path.resolve(import.meta.dirname, "..");
const leer = (p) => fs.readFileSync(path.join(raiz, p), "utf8");
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(leer("assets/ek-config.js"), ctx);
vm.runInContext(leer("assets/ek-data.js"), ctx);
const DAT = ctx.window.EK_DATA, P = DAT.productos;

/* Normaliza para comparar sin acentos ni mayúsculas */
const norm = (t) => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* ------------------------- SUBCATEGORÍAS -------------------------
   cats = categorías principales a las que pertenece (¡puede ser más de una!)
   re   = cómo se detectan sus artículos                                */
const SUB = [
  /* --- Navidad --- */
  { s: "nacimientos", n: "Nacimientos", i: "bi-house-heart", cats: ["navidad", "decoracion"], re: /nacimiento/ },
  { s: "esferas", n: "Esferas", i: "bi-circle", cats: ["navidad", "decoracion"], re: /esfera/ },
  { s: "coronas-rampas", n: "Coronas y rampas", i: "bi-flower1", cats: ["navidad", "decoracion"], re: /corona navide|rampa/ },
  { s: "letreros", n: "Letreros", i: "bi-card-heading", cats: ["navidad", "graduacion", "decoracion", "mdf"], re: /letrero|feliz navidad|adorno feliz|bienvenida con santa|mr & mrs|felicidades graduado/ },
  { s: "gnomos", n: "Gnomos", i: "bi-person-arms-up", cats: ["navidad", "amor-amistad", "decoracion"], re: /gnomo/ },
  { s: "santa-venados", n: "Santa, venados y trineo", i: "bi-snow2", cats: ["navidad", "decoracion"], re: /santa|venado|trineo/ },
  { s: "botas-dulceros", n: "Botas y dulceros", i: "bi-gift", cats: ["navidad", "regalos"], re: /bota|dulces/ },
  { s: "arboles-figuras", n: "Árboles y figuras", i: "bi-tree", cats: ["navidad", "mdf"], re: /arbolito|guirnalda|vela led/ },
  { s: "cuadros-navidenos", n: "Cuadros navideños", i: "bi-image", cats: ["navidad", "decoracion"], re: /cuadros navide/ },
  { s: "camino-mesa", n: "Mantelería", i: "bi-border-width", cats: ["navidad", "hogar-cocina"], re: /camino de mesa/ },

  /* --- Textil --- */
  { s: "playeras-navidenas", n: "Playeras navideñas", i: "bi-bag-heart", cats: ["playeras", "navidad"], re: /playera|sudadera|body bebe/ },
  { s: "packs-familia", n: "Packs familiares", i: "bi-people", cats: ["playeras", "regalos"], re: /pack 4|familia/ },

  /* --- Año Nuevo --- */
  { s: "porta-uvas", n: "Porta uvas", i: "bi-circle-square", cats: ["ano-nuevo", "mdf", "regalos"], re: /porta uvas/ },
  { s: "copas-brindis", n: "Copas y brindis", i: "bi-cup-straw", cats: ["ano-nuevo", "personalizados"], re: /copa|brindis/ },
  { s: "letreros-ano-nuevo", n: "Letreros de Año Nuevo", i: "bi-stars", cats: ["ano-nuevo", "decoracion"], re: /ano nuevo|banderin|deseos|centro de mesa ano/ },

  /* --- Amor y Amistad --- */
  { s: "paquetes-regalo", n: "Paquetes de regalo", i: "bi-box-seam", cats: ["amor-amistad", "regalos"], re: /paquete/ },
  { s: "cajas-corazon", n: "Cajas y corazones", i: "bi-heart", cats: ["amor-amistad", "regalos", "mdf"], re: /corazon/ },
  { s: "globos", n: "Globos y sorpresas", i: "bi-balloon", cats: ["amor-amistad", "regalos"], re: /globo/ },
  { s: "para-pareja", n: "Para pareja", i: "bi-people-fill", cats: ["amor-amistad", "regalos"], re: /pareja/ },

  /* --- Graduación --- */
  { s: "osos-firmar", n: "Osos para firmar", i: "bi-emoji-smile", cats: ["graduacion", "regalos"], re: /oso/ },
  { s: "pines", n: "Pines", i: "bi-pin-angle", cats: ["graduacion", "llaveros-pines", "bodas-eventos", "regalos"], re: /pin/ },
  { s: "birretes-coronas", n: "Birretes y coronas", i: "bi-mortarboard", cats: ["graduacion", "decoracion"], re: /birrete|corona xv/ },
  { s: "marcos", n: "Marcos de foto", i: "bi-card-image", cats: ["graduacion", "mdf", "regalos"], re: /marco/ },

  /* --- DTF UV --- */
  { s: "maquila", n: "Maquila y transfer", i: "bi-printer", cats: ["dtf-uv", "personalizados"], re: /maquila|transfer/ },
  { s: "etiquetas", n: "Etiquetas", i: "bi-tags", cats: ["dtf-uv", "personalizados"], re: /etiqueta/ },
  { s: "invitaciones", n: "Invitaciones", i: "bi-envelope-heart", cats: ["dtf-uv", "bodas-eventos"], re: /invitacion/ },
  { s: "fundas", n: "Fundas de celular", i: "bi-phone", cats: ["personalizados", "dtf-uv"], re: /funda/ },
  { s: "placas", n: "Placas y reconocimientos", i: "bi-award", cats: ["personalizados", "dtf-uv", "regalos"], re: /placa/ },

  /* --- Tazas y termos --- */
  { s: "tazas", n: "Tazas personalizadas", i: "bi-cup-hot", cats: ["tazas-termos", "personalizados", "regalos", "dia-madres", "dia-padres"], re: /taza/ },
  { s: "termos", n: "Termos", i: "bi-cup", cats: ["tazas-termos", "personalizados"], re: /termo/ },
  { s: "vasos", n: "Vasos y cerveceros", i: "bi-cup-straw", cats: ["tazas-termos", "hogar-cocina"], re: /vaso/ },

  /* --- Llaveros --- */
  { s: "llaveros", n: "Llaveros", i: "bi-key", cats: ["llaveros-pines", "personalizados", "regalos"], re: /llavero/ },

  /* --- Botellas y cilindros --- */
  { s: "botellas-cilindros", n: "Botellas y cilindros", i: "bi-bottle", cats: ["bodas-eventos", "personalizados", "regalos"], re: /botella|cilindro/ },

  /* --- Lámparas --- */
  { s: "lamparas", n: "Lámparas LED", i: "bi-lightbulb", cats: ["lamparas", "decoracion", "regalos"], re: /lampara/ },
  { s: "cuadros-luz", n: "Cuadros de luz", i: "bi-brightness-high", cats: ["lamparas", "decoracion"], re: /cuadro de luz/ },

  /* --- MDF y hogar --- */
  { s: "charolas", n: "Charolas", i: "bi-basket", cats: ["mdf", "hogar-cocina"], re: /charola/ },
  { s: "relojes", n: "Relojes", i: "bi-clock", cats: ["mdf", "hogar-cocina"], re: /reloj/ },
  { s: "portarretratos", n: "Portarretratos", i: "bi-image-alt", cats: ["mdf", "hogar-cocina", "regalos"], re: /portarretrato/ },
  { s: "organizadores", n: "Organizadores", i: "bi-grid-3x3-gap", cats: ["mdf", "hogar-cocina"], re: /organizador|portallaves/ },
  { s: "portavasos", n: "Portavasos", i: "bi-circle-half", cats: ["mdf", "hogar-cocina"], re: /portavasos/ },
  { s: "separadores", n: "Separadores de libros", i: "bi-bookmark", cats: ["mdf", "regalos"], re: /separador/ },
  { s: "imanes", n: "Imanes", i: "bi-magnet", cats: ["personalizados", "regalos"], re: /iman/ },
  { s: "cajas-regalo", n: "Cajas de regalo", i: "bi-box2-heart", cats: ["mdf", "regalos"], re: /caja de regalo/ },

  /* --- Bodas y eventos --- */
  { s: "recuerdos-boda", n: "Recuerdos de boda", i: "bi-gem", cats: ["bodas-eventos", "regalos"], re: /recuerdo de boda/ },
  { s: "numeros-mesa", n: "Números de mesa", i: "bi-123", cats: ["bodas-eventos", "decoracion"], re: /numeros de mesa/ },
  { s: "libro-firmas", n: "Libro de firmas", i: "bi-journal-bookmark", cats: ["bodas-eventos", "regalos"], re: /libro de firmas/ },
  { s: "toppers", n: "Toppers de pastel", i: "bi-cake2", cats: ["bodas-eventos", "navidad", "decoracion"], re: /topper/ },

  /* --- Flores --- */
  { s: "arreglos-florales", n: "Arreglos florales", i: "bi-flower2", cats: ["flores", "amor-amistad", "navidad", "dia-muertos", "primavera", "decoracion"], re: /arreglo floral/ },

  /* --- Día de Muertos --- */
  { s: "calaveritas", n: "Calaveritas", i: "bi-emoji-dizzy", cats: ["dia-muertos", "decoracion"], re: /calaverita/ },
  { s: "catrinas", n: "Catrinas", i: "bi-person-standing-dress", cats: ["dia-muertos", "decoracion"], re: /catrina/ },
  { s: "ofrendas", n: "Ofrendas", i: "bi-fire", cats: ["dia-muertos", "decoracion"], re: /ofrenda|papel picado/ },

  /* --- Otras temporadas --- */
  { s: "mama", n: "Para mamá", i: "bi-suit-heart", cats: ["dia-madres", "regalos"], re: /mama|madres/ },
  { s: "papa", n: "Para papá", i: "bi-person-badge", cats: ["dia-padres", "regalos"], re: /papa|padres/ },
  { s: "ninos", n: "Para niños", i: "bi-balloon-heart", cats: ["dia-nino", "regalos"], re: /alcancia|bloques|bebe/ },
  { s: "halloween", n: "Halloween", i: "bi-moon-stars", cats: ["halloween", "decoracion"], re: /calabaza|halloween/ },
  { s: "grupos", n: "Grupos y escuelas", i: "bi-people-fill", cats: ["graduacion", "regalos"], re: /20 osos|set 20|grupo/ }
];

/* --------------------- Asignar artículos a subcategorías --------------------- */
const mapa = {};      // slug del artículo -> [subcategorías]
const conteo = {};    // subcategoría -> nº de artículos
SUB.forEach((sb) => { conteo[sb.s] = 0; });

P.forEach((p) => {
  const texto = norm(p.n + " " + p.d + " " + p.f.join(" ") + " " + p.c.join(" "));
  const mias = [];
  SUB.forEach((sb) => {
    if (!sb.re.test(texto)) return;
    // La subcategoría solo aplica si el artículo comparte alguna categoría padre
    if (!sb.cats.some((c) => p.c.indexOf(c) > -1)) return;
    mias.push(sb.s);
    conteo[sb.s]++;
  });
  mapa[p.s] = mias;
});

/* Subcategorías listas para el menú, agrupadas por categoría principal */
const porCat = {};
DAT.categorias.forEach((c) => {
  porCat[c.s] = SUB.filter((sb) => sb.cats.indexOf(c.s) > -1 && conteo[sb.s] > 0)
    .sort((a, b) => conteo[b.s] - conteo[a.s]).map((sb) => sb.s);
});

const lista = SUB.map((sb) => ({ s: sb.s, n: sb.n, i: sb.i, cats: sb.cats, c: conteo[sb.s] }));

const salida = `/* ============================================================================
   TALLER CREATIVO EK · SUBCATEGORÍAS  (assets/ek-subcategorias.js)
   ----------------------------------------------------------------------------
   GENERADO AUTOMÁTICAMENTE por:  node build/generar-subcategorias.mjs
   NO LO EDITES A MANO: edita las reglas en build/generar-subcategorias.mjs.
   Una subcategoría puede pertenecer a VARIAS categorías principales.
   Generado el ${new Date().toLocaleString("es-MX")} · ${lista.length} subcategorías
   ========================================================================== */
window.EK_SUBCATS = {
  lista: ${JSON.stringify(lista)},
  // slug del artículo -> subcategorías a las que pertenece
  mapa: ${JSON.stringify(mapa)},
  // categoría principal -> subcategorías que le corresponden
  porCat: ${JSON.stringify(porCat)}
};
`;
fs.writeFileSync(path.join(raiz, "assets", "ek-subcategorias.js"), salida, "utf8");

/* ------------------------------- Informe ------------------------------- */
console.log(`=== ${lista.length} SUBCATEGORÍAS · ${(Buffer.byteLength(salida) / 1024).toFixed(1)} KB ===\n`);
console.log("Que pertenecen a MÁS DE UNA categoría principal:");
lista.filter((s) => s.cats.length > 1).sort((a, b) => b.cats.length - a.cats.length)
  .forEach((s) => console.log(`  ${String(s.c).padStart(3)} art.  ${s.n.padEnd(26)} → ${s.cats.join(", ")}`));

const vacias = lista.filter((s) => s.c === 0);
console.log(`\nSubcategorías SIN artículos (${vacias.length}): ${vacias.map((s) => s.s).join(", ") || "ninguna"}`);

const huerfanos = P.filter((p) => !mapa[p.s].length);
console.log(`Artículos sin subcategoría (${huerfanos.length}): ${huerfanos.map((p) => p.s).join(", ") || "ninguno"}`);

console.log("\nSubcategorías por categoría principal:");
DAT.categorias.forEach((c) => {
  const l = porCat[c.s];
  if (l.length) console.log(`  ${c.e} ${c.n.padEnd(22)} ${l.length}  → ${l.join(", ")}`);
});
