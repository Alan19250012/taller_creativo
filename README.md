# 🎨 Taller Creativo EK · Sitio web ultraligero

Tienda en línea **100 % estática** (HTML + CSS + JavaScript puro) para Taller Creativo EK:
decoración en MDF, impresión DTF UV y regalos personalizados.

- 🎨 Colores de marca: **#DA1D2A** (rojo) · **#244093** (azul)
- 🪶 **Sin base de datos, sin PHP, sin WordPress, sin frameworks.** Nada que hackear y nada que actualizar.
- 🌐 **Hotlinking de imágenes**: mientras no subas tus fotos, el sitio trae fotos externas y **no gasta ni un MB de tu hosting**.
- ⚡ CDNs externos para fuentes, iconos, animaciones (AOS) y partículas (tsParticles).
- 🛒 **Carrito lateral deslizable** con `localStorage` y checkout por **WhatsApp Business** + pasarela de pago externa.
- 🧭 **Barra principal deslizable** con mega-menú y **56 subcategorías** (una subcategoría puede vivir en varias categorías).
- 🎯 **Tira de píldoras** de subcategorías, barra lateral en acordeón y **barra inferior fija en móvil**.
- 📱 Diseño **de 320 px a 4K**: rejillas fluidas, objetivos táctiles de 44 px y `safe-area` para iPhone.
- 🔍 100 artículos, filtros por categoría/color/precio/talla/calificación y buscador con sugerencias en vivo.

---

## 1. Peso real del sitio (por eso es "superligero")

| Archivo | Sin comprimir | Con gzip (lo que viaja) |
|---|---|---|
| `index.html` | 26.8 KB | **6.4 KB** |
| `tienda.html` / `categoria.html` | 13.5 KB | **4.0 KB** |
| `articulo.html` | 14.9 KB | **4.1 KB** |
| `carrito.html` | 17.2 KB | **4.7 KB** |
| `contacto.html` | 20.1 KB | **5.4 KB** |
| `assets/ek.css` (todo el diseño y animaciones) | 65.0 KB | **14.7 KB** |
| `assets/ek.js` (todo el motor) | 86.2 KB | **23.6 KB** |
| `assets/ek-data.js` (los 100 artículos) | 51.4 KB | **15.0 KB** |
| `assets/ek-subcategorias.js` (56 subcategorías) | 13.0 KB | **3.3 KB** |
| `assets/ek-blog.js` (8 artículos del blog) | 56.9 KB | **19.1 KB** |
| `assets/ek-config.js` (tus datos) | 4.5 KB | **2.1 KB** |
| **Todo el sitio junto** | 433.3 KB | **120.8 KB** |

**Primera visita a la portada: ~66 KB comprimidos** (y ni una sola imagen desde tu servidor).
En la segunda página que visite el cliente solo baja el HTML: el CSS, el JS y el catálogo
ya están en la caché del navegador (1 semana con revalidación, así que si cambias algo
el cambio se ve en días, no en un año).

---

## 2. Estructura de archivos

```
taller creativo esperimental/
├── index.html              ← Portada: banner (10), tendencias, temporada, ofertas, reseñas, blog, FAQ
├── tienda.html             ← Catálogo completo con filtros, orden y buscador
├── categoria.html          ← Igual que tienda.html pero para una categoría (?cat=navidad)
├── articulo.html           ← Ficha del artículo (?id=porta-uvas-mdf-personalizado)
├── carrito.html            ← Carrito + resumen + checkout por WhatsApp + datos de pago
├── contacto.html           ← Formulario que envía a WhatsApp, redes y datos del taller
├── blog.html               ← Índice del blog con buscador y chips de categorías
├── blog-articulo.html      ← Artículo del blog (?p=slug)
├── 404.html                ← Página no encontrada
├── assets/
│   ├── ek-config.js        ← ⚙️ TUS DATOS: WhatsApp, correo, logo, favicon, pagos  ← EDITA AQUÍ
│   ├── ek-data.js          ← 📦 Los 100 artículos, 22 categorías, 10 banners y reseñas
│   ├── ek-subcategorias.js ← 🧭 Las 56 subcategorías (generado, no lo edites a mano)
│   ├── ek-imagenes.js      ← 🖼️ Qué imágenes ya subiste (generado)
│   ├── ek-blog.js          ← 📝 Los artículos del blog
│   ├── ek.css              ← Todo el diseño y las animaciones
│   └── ek.js               ← Todo el motor (render, filtros, carrito, buscador)
├── img/                    ← 📸 TUS IMÁGENES (ver IMAGENES.md)
│   ├── productos/          ·  banner/  ·  categorias/  ·  blog/  ·  logo/  ·  favicon/
├── build/                  ← Herramientas (no se suben al hosting)
│   ├── detectar-imagenes.mjs    · detecta tus fotos nuevas            ⭐
│   ├── generar-subcategorias.mjs · regenera las subcategorías
│   ├── generar-favicons.mjs     · saca los favicons desde tu logo
│   ├── verificar.mjs            · revisa el catálogo (100 artículos)
│   ├── generar-seo.mjs          · IMAGENES.md + sitemap.xml
│   ├── generar-paginas.mjs      · sincroniza cabecera, menú y pie
│   ├── servidor.mjs             · vista previa local
│   └── prueba.mjs               · 98 pruebas automáticas
├── IMAGENES.md             ← 📸 LISTA EXACTA de nombres y formatos de cada imagen
├── .htaccess               ← Compresión + caché para Apache/cPanel
├── _headers                ← Lo mismo para Netlify / Cloudflare Pages
├── robots.txt · sitemap.xml · site.webmanifest
```

---

## 3. 🖼️ ¿Dónde va el LOGO y el FAVICON?

Todo está detallado en **`IMAGENES.md`**, pero aquí el resumen:

| Archivo | Carpeta | Medidas | Dónde se ve |
|---|---|---|---|
| `logo-taller-creativo-ek.png` | `img/logo/` | **1484 × 689** (2.15:1), fondo transparente | Cabecera (**58 a 84 px** según pantalla) y pie (66 a 92 px) de **todas** las páginas |
| `favicon.ico` | `img/favicon/` | 48 × 48 (multi 16/32/48) | Icono de la pestaña |
| `favicon-32x32.png` | `img/favicon/` | 32 × 32 | ✅ ya generado desde tu logo |
| `apple-touch-icon.png` | `img/favicon/` | 180 × 180 | ✅ ya generado (monograma EK) |
| `icono-512.png` | `img/favicon/` | 512 × 512 | ✅ ya generado, icono de la app |
| `og-taller-creativo-ek.jpg` | `img/banner/` | 1200 × 630 | Vista previa al compartir en WhatsApp/Facebook |

> **En la cabecera va SOLO el logo**, sin las letras "Taller Creativo EK" al lado
> (el logo ya incluye el nombre). En el pie va sobre una tarjeta blanca redondeada
> para que se lea bien sobre el fondo oscuro.
>
> Los tres PNG de `img/favicon/` se generan desde tu logo con:
> ```bash
> node build/generar-favicons.mjs
> ```
> Recorta el monograma **EK** del logo, lo centra y saca los 3 tamaños.
> Si cambias el logo, vuelve a correrlo. El nombre del archivo se configura en
> `assets/ek-config.js` → `logo`.

---

## 4. ⚙️ Configuración (5 minutos)

Abre **`assets/ek-config.js`** y revisa:

```js
whatsapp: "525562208987",       // ← lada 52 + 5562208987  (WhatsApp Business)
whatsappBonito: "+52 556 220 8987",
email: "tallercreativoek@gmail.com",
emailAlt: "ADZAJU90MX@GMAIL.COM",
facebook: "https://www.facebook.com/Reqr2",
instagram: "https://www.instagram.com/tallercreativoek",

envio: 120,               // costo de envío estándar
envioGratisDesde: 999,    // envío gratis a partir de este subtotal
porPagina: 24,            // artículos por tanda

modoImagenes: "hotlink",  // ← cambia a "local" cuando subas tus fotos
extImagenes: "webp",

pagos: {
  mercadopago: "",        // ← pega tu link de pago (link.mercadopago.com.mx/tu-negocio)
  clip: "",               // ← pega tu link de Clip
  paypal: "",
  spei: { banco:"BBVA", titular:"Taller Creativo EK", clabe:"", tarjeta:"" }
},
particulas: true,         // partículas del banner
particulasMax: 38,        // menos partículas = más ligero
aos: true,                // animaciones al hacer scroll
cache: "1.0.0"            // súbelo cuando cambies el CSS/JS para refrescar caché
```

### 🔑 Poner la pasarela de pago a trabajar
El sitio **no procesa pagos** (así no necesitas servidor ni cumplir PCI-DSS). En su lugar:
1. Crea tu **link de pago** en Mercado Pago (*Herramientas → Link de pago*) o en Clip.
2. Pégalo en `pagos.mercadopago` / `pagos.clip`.
3. Llena `pagos.spei.clabe` con tu CLABE de 18 dígitos.
4. El cliente arma su carrito en `carrito.html`, **envía el pedido por WhatsApp** y tú le compartes
   la liga de pago o los datos SPEI. Todo el flujo queda en tu WhatsApp Business.

> Si prefieres pago automático dentro del sitio haría falta un backend (Node/PHP) y una cuenta
> de pasarela con credenciales: eso ya no sería un sitio estático. **SUPOSICIÓN**: se implementó
> el flujo por WhatsApp + liga de pago porque es el más ligero y el más común en tiendas
> mexicanas de este tamaño. Si quieres automatizarlo, se puede agregar después.

---

## 5. 📦 Cómo editar el catálogo

Todo el catálogo vive en **`assets/ek-data.js`**. Cada artículo es **una línea**:

```js
{n:"Taza Mágica Cambia Color", s:"taza-magica-cambia-color", p:250, a:300,
 c:["tazas-termos","personalizados","regalos"], col:["Negro","Mágico"],
 t:["9 oz","11 oz","15 oz"], st:70, v:240, r:4.8, b:"promo",
 d:"Taza mágica que revela tu diseño con el líquido caliente.",
 f:["Efecto sorpresa","Impresión UV","Ideal para regalo"],
 kw:"magic,mug,color"},
```

| Clave | Significado |
|---|---|
| `n` | Nombre del artículo |
| `s` | **slug** → es el que forma la URL y el nombre de las 3 fotos |
| `p` / `a` | Precio actual / precio anterior tachado (`a:0` = sin oferta) |
| `c` | Categorías (puede estar en **varias**) |
| `col` | Colores disponibles |
| `t` | Tallas o tamaños (**de 3 a 5**) |
| `st` | Existencias (stock) |
| `v` | Piezas vendidas |
| `r` | Calificación de 0 a 5 |
| `b` | Distintivo: `"nuevo"` · `"promo"` · `"top"` · `""` |
| `d` | Descripción corta (la de la tarjeta) |
| `f` | Características (bullets de la ficha) |
| `kw` | Palabras clave en inglés para las fotos externas (hotlinking) |

**Después de editar**, corre:
```bash
node build/verificar.mjs      # revisa errores (slugs duplicados, tallas, campos faltantes)
node build/generar-seo.mjs    # regenera IMAGENES.md y sitemap.xml
node build/prueba.mjs         # 98 pruebas automáticas
```

### Los artículos pueden estar en varias categorías
Ejemplo: la `Playera Navideña Grinch` está en `playeras` **y** `navidad`, así que aparece en
las dos categorías y en el filtro de ambas. Igual pasa con `regalos`, `personalizados`, etc.

---

## 5.b 🧭 Categorías y subcategorías (barra principal + lateral)

El sitio tiene **22 categorías principales** y **56 subcategorías**. Lo importante:
**una subcategoría puede pertenecer a varias categorías principales**, igual que en las
tiendas grandes. Ejemplos reales de este catálogo:

| Subcategoría | Aparece en estas categorías principales |
|---|---|
| **Arreglos florales** | Flores · Amor y Amistad · Navidad · Día de Muertos · Primavera · Decoración |
| **Tazas personalizadas** | Tazas y Termos · Personalizados · Regalos · Día de las Madres · Día del Padre |
| **Letreros** | Navidad · Graduación · Decoración · MDF |
| **Pines** | Graduación · Llaveros y Pines · Bodas y Eventos · Regalos |
| **Botellas y cilindros** | Bodas y Eventos · Personalizados · Regalos |

### Cómo se navega
| Elemento | Comportamiento |
|---|---|
| **Barra principal** | Se desliza con las flechas ‹ ›, con la rueda del mouse, arrastrando o con el dedo. Las flechas solo aparecen si el contenido no cabe. Al pasar el mouse (o tocar en móvil) cada categoría abre su panel de subcategorías. |
| **Tira de píldoras** | En `tienda.html` y `categoria.html`: filtra por subcategoría al instante, sin recargar. |
| **Barra lateral** | Categorías agrupadas (temporada / tipo de producto) con acordeón de subcategorías y contadores. En móvil se convierte en un panel deslizable. |
| **Barra inferior (móvil)** | Inicio · Categorías · Buscar · WhatsApp · Carrito, siempre a la mano. |
| **Carrito lateral** | Se desliza desde la derecha al agregar algo: cantidades, subtotal, barra de envío gratis, total y botón de WhatsApp. |

### 🧯 La barra lateral: cómo se muestra y cómo forzarla

La barra lateral **no depende de una media query** (eso hacía que en ventanas
menores a 1024 px se fuera fuera de pantalla sin avisar). Ahora `ek.js` decide:

| Ancho de ventana | Qué pasa |
|---|---|
| **900 px o más** | La barra se muestra **fija como columna**, a la izquierda del contenido |
| **Menos de 900 px** | Se convierte en un **cajón** que se abre con el botón "Categorías" |

Y encima de la tira de píldoras de la portada hay un **botón "Categorías"** que
la fija o la oculta cuando tú quieras, sin importar el ancho. Tu elección se
recuerda (se guarda en el navegador), así que si algún día no la ves, **pulsa ese
botón** y aparecerá.

### Distribución del contenido en la portada
Réplica de la estructura de Personal Creations, con tus categorías y productos:

1. Barra de anuncios → cabecera → barra deslizable de categorías
2. **Barra lateral + banner lado a lado** (left-nav-with-hero)
3. Rejilla principal "Productos personalizados únicos"
4. Segunda rejilla "Ofertas de la semana"
5. Reseñas en carrusel
6. **Oferta del día** con cuenta regresiva
7. **8 secciones de ideas**, cada una con su tira de píldoras y su carrusel
8. Cierre editorial: blog + preguntas frecuentes + contacto
### Cómo se asignan los artículos a las subcategorías
Se hace **solo**, con reglas sobre el nombre y las características de cada artículo
(archivo `build/generar-subcategorias.mjs`). Si agregas artículos nuevos:

```bash
node build/generar-subcategorias.mjs   # vuelve a repartirlos
```

Si quieres meter un artículo en una subcategoría que las reglas no detectan, agrega su
palabra clave al `re:` de esa subcategoría en `build/generar-subcategorias.mjs` y vuelve
a correr el comando. El informe que imprime te dice cuántos artículos quedaron en cada
una y si alguna se quedó vacía.

---

## 6. 📸 Cómo pasar de fotos externas a tus fotos

**No hay que configurar nada: el sitio detecta solo qué archivos ya subiste.**

El comando `node build/detectar-imagenes.mjs` revisa las carpetas `img/` y escribe
`assets/ek-imagenes.js` con la lista de los archivos que existen:

| Grupo | Carpeta | Estado actual |
|---|---|---|
| `banner` | `img/banner/banner-01…10.webp` | ✅ **tus 10 banners ya están en uso en la portada** |
| `categoria` | `img/categorias/<slug>.webp` | foto externa (aún no hay archivos) |
| `producto` | `img/productos/<slug>-1…3.webp` | foto externa (aún no hay archivos) |
| `blog` | `img/blog/<slug>-1…2.webp` | foto externa (aún no hay archivos) |

**Para activar tus fotos solo tienes que:**
1. Subir los archivos con el nombre exacto que dice **`IMAGENES.md`**
   (ej. `img/productos/taza-magica-cambia-color-1.webp`).
2. Correr:
   ```bash
   node build/detectar-imagenes.mjs
   ```
3. Listo. **No hay que tocar HTML, ni el CSS, ni el catálogo.**

> Puedes subir las fotos poco a poco: las que existan se usan y las que falten
> siguen con foto externa. **Nunca se ve una imagen rota** y **nunca se hace una
> petición de más al servidor**.
>
> `modoImagenes` en `assets/ek-config.js` está en `"auto"` (lo recomendado). Si algún
> día quieres forzar todo externo o todo local, cámbialo ahí.

Cada artículo usa **3 fotos**: `-1` principal, `-2` segundo ángulo, `-3` producto en uso.
Los banners usan `banner-01.webp` … `banner-10.webp` (el orden de la lista `banners`
en `assets/ek-data.js` manda).

Tus banners son **`.webp`**. Si algún día usas otro formato, cambia `extImagenes` (ej. `"jpg"`).

---

## 7. 🖥️ Ver el sitio en tu computadora

```bash
node build/servidor.mjs          # → http://localhost:5173
```

O simplemente **haz doble clic en `index.html`**: el sitio funciona igual sin servidor
(todos los datos están en archivos `.js`, no en `.json`, justo para eso).

---

## 8. 🚀 Cómo publicarlo

**cPanel / Hostinger / Neftlify / cualquier hosting:**
1. Sube **todo** excepto la carpeta `build/`, `README.md` e `IMAGENES.md` a `public_html`.
2. Asegúrate de subir también `.htaccess` (activa compresión y caché → menos consumo de ancho de banda).
3. Entra a `https://tudominio.com`. ¡Listo!

**Netlify / Cloudflare Pages / Vercel:** arrastra la carpeta completa; el archivo `_headers`
ya trae la configuración de caché y seguridad. **GitHub Pages:** sube todo menos `.htaccess`.

> **Otros servidores (Nginx):** añade dentro de `server {}`:
> ```nginx
> gzip on;
> gzip_types text/html text/css application/javascript application/json image/svg+xml;
> location ~* \.(css|js|webp|jpg|png|svg|woff2)$ { expires 1y; add_header Cache-Control "public, immutable"; }
> ```

### Antes de publicar, revisa:
- [ ] `assets/ek-config.js` → número de WhatsApp, correos y redes correctos.
- [ ] `url` en `ek-config.js` con tu dominio real (para el sitemap y las etiquetas SEO).
- [ ] `robots.txt` y `sitemap.xml` con tu dominio real.
- [ ] Logo y favicon subidos a `img/logo/` e `img/favicon/`.
- [ ] `pagos.mercadopago` / `pagos.clip` / `pagos.spei.clabe` llenos (o vacíos si aún no los tienes).
- [ ] `node build/prueba.mjs` sin fallos.

---

## 9. 🧰 Qué técnicas se usaron para que sea ligero

| Técnica | Dónde |
|---|---|
| **Un solo CSS y un solo JS** compartidos por las 8 páginas | `assets/ek.css`, `assets/ek.js` |
| **Catálogo como base de datos en JS** (1 archivo cacheado en vez de 100 páginas HTML) | `assets/ek-data.js` |
| **Hotlinking** de fotos externas (no consume tu servidor) | `loremflickr.com` + respaldo `placehold.co` |
| **CDNs externos** para fuentes, iconos, AOS y partículas | Google Fonts · jsDelivr |
| **Carga diferida**: AOS y tsParticles se descargan solo si hacen falta | `initAnimaciones()`, `initParticulas()` |
| **`loading="lazy"` + `decoding="async"` + `width/height`** en todas las imágenes (evita saltos) | `ek.js` |
| **gzip/brotli + caché** (1 semana CSS/JS, 30 días imágenes, 1 hora HTML) | `.htaccess` / `_headers` |
| **`preconnect` / `dns-prefetch`** a los CDN | `<head>` de cada página |
| **Carrito en `localStorage`** (cero peticiones al servidor) | `ek.js` |
| **Sin backend**: pagos por liga externa y pedidos por WhatsApp | `carrito.html` |
| **Respeto a "reducir movimiento"** del sistema | `prefers-reduced-motion` en CSS y JS |
| **Menú y subcategorías generados con JS** (no se repiten 22 enlaces en 9 páginas) | `initNav()`, `acordeonCategorias()` |
| **Carrito lateral creado bajo demanda** (solo cuando se usa, no en el HTML) | `crearDrawerCarrito()` |
| **CSS en cascada por variables**: contenedor, tipografías y rejillas escalan solos de 320 px a 4K | `:root { --max }` + `clamp()` |
| **Objetivos táctiles de 44 px y `env(safe-area-inset-*)`** para iPhone | `ek-mobilebar`, `.ek-cartdrawer__ft` |

---

## 10. 🗂️ Notas y SUPOSICIONES

- **WhatsApp**: se asumió lada **+52** para `5562208987`. Si el número es de otro país,
  cámbialo en `assets/ek-config.js` → `whatsapp` (sin `+`, sin espacios).
- **Precios**: los que venían en tu información se respetaron (nacimiento $150, gnomos $45,
  arreglos $160, paquetes de Amor y Amistad $230/$270/$270). Los artículos que **no traían precio**
  se cotizaron con precios de mercado de MDF y DTF UV en México — **revísalos y ajústalos** en
  `assets/ek-data.js` antes de publicar.
- **Stock, ventas y estrellas**: son datos de ejemplo para que los filtros y las gráficas
  funcionen. Actualízalos con tus números reales.
- **Imágenes de ejemplo**: son fotos externas por palabra clave (no son tus productos).
  En cuanto subas tus fotos y corras `node build/detectar-imagenes.mjs`, se usan las tuyas
  (mira la sección 6).
- **Envío**: $120 y gratis desde $999 (ajustable en `ek-config.js`).
- **Facturación**: se muestran los dos correos que proporcionaste
  (`tallercreativoek@gmail.com` y `ADZAJU90MX@GMAIL.COM`).

---

## 11. 🧪 Comandos de mantenimiento

```bash
node build/detectar-imagenes.mjs     # ⭐ detecta tus fotos nuevas (corre esto tras subir imágenes)
node build/generar-subcategorias.mjs # 🧭 reparte los artículos en las 56 subcategorías
node build/generar-favicons.mjs      # regenera los 3 favicons desde img/logo/
node build/verificar.mjs             # valida los 100 artículos (slugs, precios, tallas, categorías)
node build/generar-seo.mjs           # regenera IMAGENES.md y sitemap.xml
node build/generar-paginas.mjs       # re-sincroniza cabecera, menú y pie en todas las páginas
node build/sellar-version.mjs        # ⚠️ sella la versión de CSS/JS para que el navegador no te muestre lo viejo
node build/prueba.mjs                # 98 pruebas automáticas de todas las páginas
node build/servidor.mjs              # vista previa en http://localhost:5173
```

> **El más importante es `detectar-imagenes.mjs`**: cada vez que subas fotos a
> `img/`, córrelo para que el sitio las use.
>
> **`generar-subcategorias.mjs`** vuelve a repartir los artículos en las subcategorías.
> Córrelo cada vez que agregues o cambies artículos en `assets/ek-data.js`.

> `generar-paginas.mjs` es útil si cambias el menú: editas `index.html` y vuelves a correrlo,
> y la cabecera, la barra lateral, el pie y los scripts se copian a `articulo.html`,
> `carrito.html`, `contacto.html` y `404.html`.

---

Hecho a mano (como todo en Taller Creativo EK) · Ciudad de México 🇲🇽
WhatsApp **+52 556 220 8987** · tallercreativoek@gmail.com
