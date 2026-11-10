# 📸 IMAGENES.md · Taller Creativo EK

Guía completa de **nombres, formatos y tamaños** de todas las imágenes del sitio.
Solo tienes que respetar el **nombre exacto** y subir el archivo a la carpeta indicada.

> ⚠️ **No tienes que configurar nada.** El sitio detecta solo qué archivos ya
> subiste (`assets/ek-imagenes.js`) y usa tus fotos en cuanto existen; lo que
> falte se trae de fuera (hotlinking a loremflickr.com, **0 peso en tu servidor**).
> Si algún archivo local falla, la imagen cae a la foto externa: nunca se ve rota.
>
> Después de subir fotos nuevas, corre este comando para que las detecte:
> ```bash
> node build/detectar-imagenes.mjs
> ```

---

## 1. Formato recomendado

| Uso | Carpeta | Tamaño en píxeles | Proporción | Formato | Peso máx. |
|---|---|---|---|---|---|
| Foto de artículo (3 por artículo) | `img/productos/` | **1000 × 1000** | 1:1 cuadrada | **.webp** | 120 KB |
| Banner de portada (máx. 10) | `img/banner/` | **1600 × 1000** | 16:10 | **.webp** | 180 KB |
| Foto de categoría | `img/categorias/` | **600 × 420** | 10:7 | **.webp** | 60 KB |
| Portada de blog | `img/blog/` | **1200 × 675** | 16:9 | **.webp** | 140 KB |
| Logo | `img/logo/` | libre (alto 46 px visible) | vectorial | **.svg** (respaldo .png 512×512) | 40 KB |
| Favicon | `img/favicon/` | 32×32 · 180×180 · 48×48 | cuadrada | .ico · .png | 15 KB |
| Imagen para compartir | `img/banner/` | **1200 × 630** | 1.91:1 | .jpg | 200 KB |

**Reglas de oro**
1. Nombres **en minúsculas, sin acentos, sin espacios y sin ñ** (usa guiones).
2. La extensión debe ser exactamente la configurada en `extImagenes` (ahora: **webp**).
3. Comprime antes de subir: <https://squoosh.app> o <https://tinypng.com>.
4. Si usas otro formato (jpg/png), cámbialo en `assets/ek-config.js` → `extImagenes: "jpg"`.

### Convertir todas tus fotos a webp de una sola vez (Windows + PowerShell)
```powershell
# Opción A: con ImageMagick instalado (magick)
Get-ChildItem *.jpg | ForEach-Object { magick "$($_.Name)" -resize 1000x1000^ -gravity center -extent 1000x1000 -quality 78 "$($_.BaseName).webp" }

# Opción B: con ffmpeg
Get-ChildItem *.jpg | ForEach-Object { ffmpeg -i "$($_.Name)" -vf "scale=1000:1000:force_original_aspect_ratio=increase,crop=1000:1000" -q:v 78 "$($_.BaseName).webp" }
```

---

## 2. 🎯 LOGO Y FAVICON (dónde van exactamente)

| Archivo | Carpeta | Medidas | Notas |
|---|---|---|---|
| `logo-taller-creativo-ek.png` | `img/logo/` | **1484 × 689 px** (2.15:1), fondo transparente | **El único logo del sitio.** Cabecera a 54 px de alto y pie a 62 px sobre tarjeta blanca. **Sin texto al lado**: el logo ya dice "Taller Creativo EK" |
| `favicon.ico` | `img/favicon/` | 48 × 48 px (multi 16/32/48) | Icono de la pestaña del navegador |
| `favicon-32x32.png` | `img/favicon/` | 32 × 32 px | ✅ ya generado desde tu logo |
| `apple-touch-icon.png` | `img/favicon/` | 180 × 180 px | ✅ ya generado (monograma EK en círculo) |
| `icono-512.png` | `img/favicon/` | 512 × 512 px | ✅ ya generado, para el manifest de la app |
| `og-taller-creativo-ek.jpg` | `img/banner/` | 1200 × 630 px | Vista previa al compartir en WhatsApp/Facebook |

> Los tres PNG de `img/favicon/` se generan solos desde tu logo con
> `node build/generar-favicons.mjs` (recorta el monograma EK y lo centra sobre blanco).
> Si cambias el logo, vuelve a correrlo.

**Colores de marca:** rojo `#DA1D2A` · azul `#244093`.
El nombre del archivo del logo se configura en `assets/ek-config.js` → `logo`.

---

## 3. Banners de portada (máximo 10)

| # | Archivo | Tema del banner |
|---|---|---|
| 1 | `img/banner/banner-01.webp` | Recibe el Año Nuevo con estilo y tradición |
| 2 | `img/banner/banner-02.webp` | Llena tu hogar de espíritu navideño |
| 3 | `img/banner/banner-03.webp` | Maquila de DTF UV para tu marca |
| 4 | `img/banner/banner-04.webp` | Celebra la graduación con algo único |
| 5 | `img/banner/banner-05.webp` | Personaliza tu botella y llévate un regalo |
| 6 | `img/banner/banner-06.webp` | 80 cilindros con las iniciales de los novios |
| 7 | `img/banner/banner-07.webp` | Paquetes de Amor y Amistad |
| 8 | `img/banner/banner-08.webp` | Arma tu ofrenda de Día de Muertos |
| 9 | `img/banner/banner-09.webp` | Lámparas LED con tu diseño |
| 10 | `img/banner/banner-10.webp` | Envío gratis desde $999 |

> El sitio admite **hasta 10 banners** rotando automáticamente. Si subes menos, edita la
> lista `banners` en `assets/ek-data.js` (puedes borrar los que no uses).

---

## 4. Fotos de categoría (22 archivos)

| Categoría | Archivo |
|---|---|
| 🎄 Navidad | `img/categorias/navidad.webp` |
| 🍇 Año Nuevo | `img/categorias/ano-nuevo.webp` |
| 💘 Amor y Amistad | `img/categorias/amor-amistad.webp` |
| 💀 Día de Muertos | `img/categorias/dia-muertos.webp` |
| 🎓 Graduación | `img/categorias/graduacion.webp` |
| 💐 Día de las Madres | `img/categorias/dia-madres.webp` |
| 🎁 Día del Padre | `img/categorias/dia-padres.webp` |
| 🧸 Día del Niño | `img/categorias/dia-nino.webp` |
| 🎃 Halloween | `img/categorias/halloween.webp` |
| 🌸 Primavera | `img/categorias/primavera.webp` |
| 🪵 Decoración MDF | `img/categorias/mdf.webp` |
| 🖨️ DTF UV y Maquila | `img/categorias/dtf-uv.webp` |
| ✨ Personalizados | `img/categorias/personalizados.webp` |
| 👕 Playeras y Textil | `img/categorias/playeras.webp` |
| ☕ Tazas y Termos | `img/categorias/tazas-termos.webp` |
| 🔑 Llaveros y Pines | `img/categorias/llaveros-pines.webp` |
| 💡 Lámparas LED | `img/categorias/lamparas.webp` |
| 🏠 Hogar y Cocina | `img/categorias/hogar-cocina.webp` |
| 💍 Bodas y Eventos | `img/categorias/bodas-eventos.webp` |
| 🌷 Arreglos Florales | `img/categorias/flores.webp` |
| 🎀 Regalos y Recuerdos | `img/categorias/regalos.webp` |
| 🖼️ Decoración y Letreros | `img/categorias/decoracion.webp` |

---

## 5. Fotos de artículos (100 artículos × 3 fotos = 300 archivos)

Cada artículo necesita **3 fotos**: la 1 es la principal, la 2 y la 3 se ven en la ficha
y como segunda imagen al pasar el mouse.

### 🎄 Navidad

**Letrero de Bienvenida con Santa 40x35** · también en: Decoración y Letreros, Decoración MDF
```
img/productos/letrero-bienvenida-santa-40x35-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/letrero-bienvenida-santa-40x35-2.webp   ← segundo ángulo o detalle
img/productos/letrero-bienvenida-santa-40x35-3.webp   ← producto en uso / empaque
```
**Nacimiento Impresión UV 22x22** · también en: Decoración MDF, Decoración y Letreros, Regalos y Recuerdos
```
img/productos/nacimiento-impresion-uv-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/nacimiento-impresion-uv-2.webp   ← segundo ángulo o detalle
img/productos/nacimiento-impresion-uv-3.webp   ← producto en uso / empaque
```
**Rampa Navideña MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/rampa-navidad-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/rampa-navidad-mdf-2.webp   ← segundo ángulo o detalle
img/productos/rampa-navidad-mdf-3.webp   ← producto en uso / empaque
```
**Árbolito Navideño de MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/arbolito-navideno-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/arbolito-navideno-mdf-2.webp   ← segundo ángulo o detalle
img/productos/arbolito-navideno-mdf-3.webp   ← producto en uso / empaque
```
**Familia de Venados MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/familia-venados-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/familia-venados-mdf-2.webp   ← segundo ángulo o detalle
img/productos/familia-venados-mdf-3.webp   ← producto en uso / empaque
```
**Esferas Navideñas M1 a M4** · también en: Decoración y Letreros
```
img/productos/esferas-navidenas-m1-m4-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/esferas-navidenas-m1-m4-2.webp   ← segundo ángulo o detalle
img/productos/esferas-navidenas-m1-m4-3.webp   ← producto en uso / empaque
```
**Esferas Navideñas Set 12 Piezas** · también en: Decoración y Letreros, Regalos y Recuerdos
```
img/productos/esferas-navidenas-set-12-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/esferas-navidenas-set-12-2.webp   ← segundo ángulo o detalle
img/productos/esferas-navidenas-set-12-3.webp   ← producto en uso / empaque
```
**Santa Claus MDF 30 cm** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/santa-claus-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/santa-claus-mdf-2.webp   ← segundo ángulo o detalle
img/productos/santa-claus-mdf-3.webp   ← producto en uso / empaque
```
**Gnomos Navideños 10 cm** · también en: Amor y Amistad, Decoración y Letreros
```
img/productos/gnomos-navidenos-10cm-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/gnomos-navidenos-10cm-2.webp   ← segundo ángulo o detalle
img/productos/gnomos-navidenos-10cm-3.webp   ← producto en uso / empaque
```
**Arreglo Floral Navideño 25x20** · también en: Arreglos Florales, Decoración y Letreros
```
img/productos/arreglo-floral-navideno-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/arreglo-floral-navideno-2.webp   ← segundo ángulo o detalle
img/productos/arreglo-floral-navideno-3.webp   ← producto en uso / empaque
```
**Corona Navideña MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/corona-navidad-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/corona-navidad-mdf-2.webp   ← segundo ángulo o detalle
img/productos/corona-navidad-mdf-3.webp   ← producto en uso / empaque
```
**Trineo Decorativo MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/trineo-decorativo-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/trineo-decorativo-mdf-2.webp   ← segundo ángulo o detalle
img/productos/trineo-decorativo-mdf-3.webp   ← producto en uso / empaque
```
**Camino de Mesa Navideño DTF UV** · también en: DTF UV y Maquila, Hogar y Cocina
```
img/productos/camino-mesa-navideno-dtf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/camino-mesa-navideno-dtf-2.webp   ← segundo ángulo o detalle
img/productos/camino-mesa-navideno-dtf-3.webp   ← producto en uso / empaque
```
**Adorno Feliz Navidad Madera** · también en: Decoración y Letreros, Decoración MDF, Regalos y Recuerdos
```
img/productos/adorno-feliz-navidad-madera-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/adorno-feliz-navidad-madera-2.webp   ← segundo ángulo o detalle
img/productos/adorno-feliz-navidad-madera-3.webp   ← producto en uso / empaque
```
**Set 4 Cuadros Navideños UV** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/set-4-cuadros-navidenos-uv-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/set-4-cuadros-navidenos-uv-2.webp   ← segundo ángulo o detalle
img/productos/set-4-cuadros-navidenos-uv-3.webp   ← producto en uso / empaque
```
**Botita Navideña para Dulces** · también en: Regalos y Recuerdos, Decoración y Letreros
```
img/productos/botita-navidad-dulces-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/botita-navidad-dulces-2.webp   ← segundo ángulo o detalle
img/productos/botita-navidad-dulces-3.webp   ← producto en uso / empaque
```
**Bota Navideña DTF UV Personalizada** · también en: DTF UV y Maquila, Personalizados, Regalos y Recuerdos
```
img/productos/bota-navidad-dtf-personalizada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/bota-navidad-dtf-personalizada-2.webp   ← segundo ángulo o detalle
img/productos/bota-navidad-dtf-personalizada-3.webp   ← producto en uso / empaque
```
**Guirnalda de Estrellas MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/guirnalda-estrellas-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/guirnalda-estrellas-mdf-2.webp   ← segundo ángulo o detalle
img/productos/guirnalda-estrellas-mdf-3.webp   ← producto en uso / empaque
```
**Vela LED Navideña Decorada** · también en: Lámparas LED, Decoración y Letreros
```
img/productos/vela-led-navidad-decorada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/vela-led-navidad-decorada-2.webp   ← segundo ángulo o detalle
img/productos/vela-led-navidad-decorada-3.webp   ← producto en uso / empaque
```
**Topper para Pastel Navideño** · también en: Regalos y Recuerdos, Decoración y Letreros
```
img/productos/topper-pastel-navideno-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/topper-pastel-navideno-2.webp   ← segundo ángulo o detalle
img/productos/topper-pastel-navideno-3.webp   ← producto en uso / empaque
```
### 🍇 Año Nuevo

**Porta Uvas de MDF Personalizado DTF UV** · también en: Decoración MDF, Personalizados, DTF UV y Maquila
```
img/productos/porta-uvas-mdf-personalizado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/porta-uvas-mdf-personalizado-2.webp   ← segundo ángulo o detalle
img/productos/porta-uvas-mdf-personalizado-3.webp   ← producto en uso / empaque
```
**Set 12 Porta Uvas Mini MDF** · también en: Decoración MDF, Regalos y Recuerdos
```
img/productos/set-12-porta-uvas-mini-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/set-12-porta-uvas-mini-2.webp   ← segundo ángulo o detalle
img/productos/set-12-porta-uvas-mini-3.webp   ← producto en uso / empaque
```
**Corona Mis 12 Deseos Año Nuevo** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/corona-12-deseos-ano-nuevo-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/corona-12-deseos-ano-nuevo-2.webp   ← segundo ángulo o detalle
img/productos/corona-12-deseos-ano-nuevo-3.webp   ← producto en uso / empaque
```
**Letrero Feliz Año Nuevo MDF 30x20** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/letrero-feliz-ano-nuevo-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/letrero-feliz-ano-nuevo-2.webp   ← segundo ángulo o detalle
img/productos/letrero-feliz-ano-nuevo-3.webp   ← producto en uso / empaque
```
**Copa Decorada DTF UV Año Nuevo** · también en: DTF UV y Maquila, Personalizados
```
img/productos/copa-decorada-dtf-ano-nuevo-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/copa-decorada-dtf-ano-nuevo-2.webp   ← segundo ángulo o detalle
img/productos/copa-decorada-dtf-ano-nuevo-3.webp   ← producto en uso / empaque
```
**Kit Brindis 6 Copas + Porta Uvas** · también en: Regalos y Recuerdos, Personalizados
```
img/productos/kit-brindis-6-copas-porta-uvas-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/kit-brindis-6-copas-porta-uvas-2.webp   ← segundo ángulo o detalle
img/productos/kit-brindis-6-copas-porta-uvas-3.webp   ← producto en uso / empaque
```
**Banderín Año Nuevo DTF UV** · también en: DTF UV y Maquila, Decoración y Letreros
```
img/productos/banderin-ano-nuevo-dtf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/banderin-ano-nuevo-dtf-2.webp   ← segundo ángulo o detalle
img/productos/banderin-ano-nuevo-dtf-3.webp   ← producto en uso / empaque
```
### 💘 Amor y Amistad

**Paquete Amor y Amistad 1** · también en: Regalos y Recuerdos, Decoración MDF
```
img/productos/paquete-amor-amistad-1-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/paquete-amor-amistad-1-2.webp   ← segundo ángulo o detalle
img/productos/paquete-amor-amistad-1-3.webp   ← producto en uso / empaque
```
**Paquete Amor y Amistad 2** · también en: Regalos y Recuerdos, Decoración MDF
```
img/productos/paquete-amor-amistad-2-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/paquete-amor-amistad-2-2.webp   ← segundo ángulo o detalle
img/productos/paquete-amor-amistad-2-3.webp   ← producto en uso / empaque
```
**Paquete Amor y Amistad 3** · también en: Regalos y Recuerdos, Decoración MDF
```
img/productos/paquete-amor-amistad-3-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/paquete-amor-amistad-3-2.webp   ← segundo ángulo o detalle
img/productos/paquete-amor-amistad-3-3.webp   ← producto en uso / empaque
```
**Gnomos Enamorados 10 cm** · también en: Decoración y Letreros, Decoración MDF
```
img/productos/gnomos-enamorados-10cm-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/gnomos-enamorados-10cm-2.webp   ← segundo ángulo o detalle
img/productos/gnomos-enamorados-10cm-3.webp   ← producto en uso / empaque
```
**Caja Corazón MDF** · también en: Decoración MDF, Regalos y Recuerdos
```
img/productos/caja-corazon-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/caja-corazon-mdf-2.webp   ← segundo ángulo o detalle
img/productos/caja-corazon-mdf-3.webp   ← producto en uso / empaque
```
**Letrero Te Amo MDF** · también en: Decoración MDF, Decoración y Letreros, Regalos y Recuerdos
```
img/productos/letrero-te-amo-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/letrero-te-amo-mdf-2.webp   ← segundo ángulo o detalle
img/productos/letrero-te-amo-mdf-3.webp   ← producto en uso / empaque
```
**Arreglo Floral San Valentín 25x20** · también en: Arreglos Florales, Regalos y Recuerdos
```
img/productos/arreglo-floral-san-valentin-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/arreglo-floral-san-valentin-2.webp   ← segundo ángulo o detalle
img/productos/arreglo-floral-san-valentin-3.webp   ← producto en uso / empaque
```
**Globo Burbuja con Mensaje** · también en: Regalos y Recuerdos, Personalizados
```
img/productos/globo-burbuja-con-mensaje-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/globo-burbuja-con-mensaje-2.webp   ← segundo ángulo o detalle
img/productos/globo-burbuja-con-mensaje-3.webp   ← producto en uso / empaque
```
**Set 2 Tazas Pareja Personalizadas** · también en: Tazas y Termos, Personalizados, Regalos y Recuerdos
```
img/productos/set-2-tazas-pareja-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/set-2-tazas-pareja-2.webp   ← segundo ángulo o detalle
img/productos/set-2-tazas-pareja-3.webp   ← producto en uso / empaque
```
**Llavero Pareja MDF** · también en: Llaveros y Pines, Decoración MDF, Regalos y Recuerdos
```
img/productos/llavero-pareja-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/llavero-pareja-mdf-2.webp   ← segundo ángulo o detalle
img/productos/llavero-pareja-mdf-3.webp   ← producto en uso / empaque
```
### 💀 Día de Muertos

**Calaverita MDF Día de Muertos** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/calaverita-mdf-dia-muertos-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/calaverita-mdf-dia-muertos-2.webp   ← segundo ángulo o detalle
img/productos/calaverita-mdf-dia-muertos-3.webp   ← producto en uso / empaque
```
**Catrina Decorativa 30 cm** · también en: Decoración y Letreros, Decoración MDF
```
img/productos/catrina-decorativa-30cm-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/catrina-decorativa-30cm-2.webp   ← segundo ángulo o detalle
img/productos/catrina-decorativa-30cm-3.webp   ← producto en uso / empaque
```
**Arreglo Floral Día de Muertos** · también en: Arreglos Florales, Decoración y Letreros
```
img/productos/arreglo-floral-dia-muertos-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/arreglo-floral-dia-muertos-2.webp   ← segundo ángulo o detalle
img/productos/arreglo-floral-dia-muertos-3.webp   ← producto en uso / empaque
```
**Set Ofrenda MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/set-ofrenda-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/set-ofrenda-mdf-2.webp   ← segundo ángulo o detalle
img/productos/set-ofrenda-mdf-3.webp   ← producto en uso / empaque
```
**Guirnalda Papel Picado MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/guirnalda-papel-picado-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/guirnalda-papel-picado-mdf-2.webp   ← segundo ángulo o detalle
img/productos/guirnalda-papel-picado-mdf-3.webp   ← producto en uso / empaque
```
### 🎓 Graduación

**Oso de Graduación para Firmar 30 cm** · también en: Regalos y Recuerdos, Personalizados
```
img/productos/oso-graduacion-firmar-30cm-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/oso-graduacion-firmar-30cm-2.webp   ← segundo ángulo o detalle
img/productos/oso-graduacion-firmar-30cm-3.webp   ← producto en uso / empaque
```
**Oso de Graduación 40 cm** · también en: Regalos y Recuerdos, Personalizados
```
img/productos/oso-graduacion-40cm-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/oso-graduacion-40cm-2.webp   ← segundo ángulo o detalle
img/productos/oso-graduacion-40cm-3.webp   ← producto en uso / empaque
```
**Oso de Graduación Gigante 50 cm** · también en: Regalos y Recuerdos, Personalizados
```
img/productos/oso-graduacion-50cm-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/oso-graduacion-50cm-2.webp   ← segundo ángulo o detalle
img/productos/oso-graduacion-50cm-3.webp   ← producto en uso / empaque
```
**Pin Personalizado Graduación** · también en: Llaveros y Pines, Personalizados, Regalos y Recuerdos
```
img/productos/pin-personalizado-graduacion-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/pin-personalizado-graduacion-2.webp   ← segundo ángulo o detalle
img/productos/pin-personalizado-graduacion-3.webp   ← producto en uso / empaque
```
**Birrete Decorativo MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/birrete-decorativo-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/birrete-decorativo-mdf-2.webp   ← segundo ángulo o detalle
img/productos/birrete-decorativo-mdf-3.webp   ← producto en uso / empaque
```
**Letrero Felicidades Graduado** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/letrero-felicidades-graduado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/letrero-felicidades-graduado-2.webp   ← segundo ángulo o detalle
img/productos/letrero-felicidades-graduado-3.webp   ← producto en uso / empaque
```
**Marco de Foto Graduación MDF** · también en: Decoración MDF, Regalos y Recuerdos
```
img/productos/marco-foto-graduacion-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/marco-foto-graduacion-mdf-2.webp   ← segundo ángulo o detalle
img/productos/marco-foto-graduacion-mdf-3.webp   ← producto en uso / empaque
```
**Set 20 Osos Firmables + 20 Pines** · también en: Regalos y Recuerdos, Personalizados
```
img/productos/set-20-osos-firmables-pines-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/set-20-osos-firmables-pines-2.webp   ← segundo ángulo o detalle
img/productos/set-20-osos-firmables-pines-3.webp   ← producto en uso / empaque
```
### 💐 Día de las Madres

**Taza Día de las Madres Personalizada** · también en: Tazas y Termos, Personalizados, Regalos y Recuerdos
```
img/productos/taza-dia-madres-personalizada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/taza-dia-madres-personalizada-2.webp   ← segundo ángulo o detalle
img/productos/taza-dia-madres-personalizada-3.webp   ← producto en uso / empaque
```
**Letrero Feliz Día Mamá MDF** · también en: Decoración MDF, Decoración y Letreros, Regalos y Recuerdos
```
img/productos/letrero-feliz-dia-mama-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/letrero-feliz-dia-mama-2.webp   ← segundo ángulo o detalle
img/productos/letrero-feliz-dia-mama-3.webp   ← producto en uso / empaque
```
### 🎁 Día del Padre

**Taza Día del Padre Personalizada** · también en: Tazas y Termos, Personalizados, Regalos y Recuerdos
```
img/productos/taza-dia-padres-personalizada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/taza-dia-padres-personalizada-2.webp   ← segundo ángulo o detalle
img/productos/taza-dia-padres-personalizada-3.webp   ← producto en uso / empaque
```
**Llavero Papá MDF Grabado** · también en: Llaveros y Pines, Decoración MDF, Regalos y Recuerdos
```
img/productos/llavero-papa-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/llavero-papa-mdf-2.webp   ← segundo ángulo o detalle
img/productos/llavero-papa-mdf-3.webp   ← producto en uso / empaque
```
### 🧸 Día del Niño

**Alcancía MDF Personalizada** · también en: Decoración MDF, Personalizados, Regalos y Recuerdos
```
img/productos/alcancia-mdf-personalizada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/alcancia-mdf-personalizada-2.webp   ← segundo ángulo o detalle
img/productos/alcancia-mdf-personalizada-3.webp   ← producto en uso / empaque
```
**Set Bloques Didácticos MDF** · también en: Decoración MDF, Regalos y Recuerdos
```
img/productos/set-bloques-didacticos-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/set-bloques-didacticos-mdf-2.webp   ← segundo ángulo o detalle
img/productos/set-bloques-didacticos-mdf-3.webp   ← producto en uso / empaque
```
### 🎃 Halloween

**Calabaza Halloween MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/calabaza-halloween-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/calabaza-halloween-mdf-2.webp   ← segundo ángulo o detalle
img/productos/calabaza-halloween-mdf-3.webp   ← producto en uso / empaque
```
### 🌸 Primavera

**Arreglo Floral Primavera 25x20** · también en: Arreglos Florales, Decoración y Letreros
```
img/productos/arreglo-floral-primavera-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/arreglo-floral-primavera-2.webp   ← segundo ángulo o detalle
img/productos/arreglo-floral-primavera-3.webp   ← producto en uso / empaque
```
### 🪵 Decoración MDF

**Charola Portapapeles MDF** · también en: Hogar y Cocina, Decoración y Letreros
```
img/productos/charola-portapapeles-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/charola-portapapeles-mdf-2.webp   ← segundo ángulo o detalle
img/productos/charola-portapapeles-mdf-3.webp   ← producto en uso / empaque
```
**Charola Decorativa MDF** · también en: Hogar y Cocina, Decoración y Letreros, Regalos y Recuerdos
```
img/productos/charola-decorativa-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/charola-decorativa-mdf-2.webp   ← segundo ángulo o detalle
img/productos/charola-decorativa-mdf-3.webp   ← producto en uso / empaque
```
**Portarretrato MDF Personalizado** · también en: Hogar y Cocina, Regalos y Recuerdos
```
img/productos/portarretrato-mdf-personalizado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/portarretrato-mdf-personalizado-2.webp   ← segundo ángulo o detalle
img/productos/portarretrato-mdf-personalizado-3.webp   ← producto en uso / empaque
```
**Organizador de Escritorio MDF** · también en: Hogar y Cocina, Personalizados
```
img/productos/organizador-escritorio-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/organizador-escritorio-mdf-2.webp   ← segundo ángulo o detalle
img/productos/organizador-escritorio-mdf-3.webp   ← producto en uso / empaque
```
**Reloj MDF Personalizado** · también en: Hogar y Cocina, Regalos y Recuerdos, Decoración y Letreros
```
img/productos/reloj-mdf-personalizado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/reloj-mdf-personalizado-2.webp   ← segundo ángulo o detalle
img/productos/reloj-mdf-personalizado-3.webp   ← producto en uso / empaque
```
**Portallaves de Pared MDF** · también en: Hogar y Cocina, Decoración y Letreros, Regalos y Recuerdos
```
img/productos/portallaves-pared-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/portallaves-pared-mdf-2.webp   ← segundo ángulo o detalle
img/productos/portallaves-pared-mdf-3.webp   ← producto en uso / empaque
```
### 🖨️ DTF UV y Maquila

**Maquila DTF UV Planilla 38x100 cm** · también en: Personalizados
```
img/productos/maquila-dtf-uv-38x100-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/maquila-dtf-uv-38x100-2.webp   ← segundo ángulo o detalle
img/productos/maquila-dtf-uv-38x100-3.webp   ← producto en uso / empaque
```
**Maquila DTF UV Hoja A4** · también en: Personalizados
```
img/productos/maquila-dtf-uv-hoja-a4-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/maquila-dtf-uv-hoja-a4-2.webp   ← segundo ángulo o detalle
img/productos/maquila-dtf-uv-hoja-a4-3.webp   ← producto en uso / empaque
```
**Transfer DTF UV por Metro Lineal** · también en: Personalizados
```
img/productos/transfer-dtf-uv-metro-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/transfer-dtf-uv-metro-2.webp   ← segundo ángulo o detalle
img/productos/transfer-dtf-uv-metro-3.webp   ← producto en uso / empaque
```
### ✨ Personalizados

**Funda para Celular Personalizada** · también en: DTF UV y Maquila, Regalos y Recuerdos
```
img/productos/funda-celular-personalizada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/funda-celular-personalizada-2.webp   ← segundo ángulo o detalle
img/productos/funda-celular-personalizada-3.webp   ← producto en uso / empaque
```
**Etiquetas Adhesivas Personalizadas** · también en: DTF UV y Maquila, Regalos y Recuerdos
```
img/productos/etiquetas-adhesivas-personalizadas-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/etiquetas-adhesivas-personalizadas-2.webp   ← segundo ángulo o detalle
img/productos/etiquetas-adhesivas-personalizadas-3.webp   ← producto en uso / empaque
```
**Placa de Reconocimiento UV** · también en: DTF UV y Maquila, Regalos y Recuerdos
```
img/productos/placa-reconocimiento-uv-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/placa-reconocimiento-uv-2.webp   ← segundo ángulo o detalle
img/productos/placa-reconocimiento-uv-3.webp   ← producto en uso / empaque
```
**Botella Personalizada DTF UV + Llavero Gratis** · también en: DTF UV y Maquila, Regalos y Recuerdos, Bodas y Eventos
```
img/productos/botella-personalizada-dtf-llavero-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/botella-personalizada-dtf-llavero-2.webp   ← segundo ángulo o detalle
img/productos/botella-personalizada-dtf-llavero-3.webp   ← producto en uso / empaque
```
**Cilindro 1 L Personalizado** · también en: Bodas y Eventos, Regalos y Recuerdos
```
img/productos/cilindro-1l-personalizado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/cilindro-1l-personalizado-2.webp   ← segundo ángulo o detalle
img/productos/cilindro-1l-personalizado-3.webp   ← producto en uso / empaque
```
**Vaso Cervecero Personalizado** · también en: DTF UV y Maquila, Hogar y Cocina
```
img/productos/vaso-cervecero-personalizado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/vaso-cervecero-personalizado-2.webp   ← segundo ángulo o detalle
img/productos/vaso-cervecero-personalizado-3.webp   ← producto en uso / empaque
```
### 👕 Playeras y Textil

**Playera Navideña Grinch Merry Christmas** · también en: Navidad
```
img/productos/playera-grinch-merry-christmas-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/playera-grinch-merry-christmas-2.webp   ← segundo ángulo o detalle
img/productos/playera-grinch-merry-christmas-3.webp   ← producto en uso / empaque
```
**Playera Copo de Nieve** · también en: Navidad
```
img/productos/playera-copo-de-nieve-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/playera-copo-de-nieve-2.webp   ← segundo ángulo o detalle
img/productos/playera-copo-de-nieve-3.webp   ← producto en uso / empaque
```
**Playera Merry Grinch más** · también en: Navidad
```
img/productos/playera-merry-grinch-mas-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/playera-merry-grinch-mas-2.webp   ← segundo ángulo o detalle
img/productos/playera-merry-grinch-mas-3.webp   ← producto en uso / empaque
```
**Playera Navideña Familia Pack 4** · también en: Navidad, Regalos y Recuerdos
```
img/productos/playera-navidad-familia-pack4-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/playera-navidad-familia-pack4-2.webp   ← segundo ángulo o detalle
img/productos/playera-navidad-familia-pack4-3.webp   ← producto en uso / empaque
```
**Sudadera Navideña Personalizada** · también en: Navidad, Personalizados
```
img/productos/sudadera-navideno-personalizada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/sudadera-navideno-personalizada-2.webp   ← segundo ángulo o detalle
img/productos/sudadera-navideno-personalizada-3.webp   ← producto en uso / empaque
```
**Body Bebé Navideño** · también en: Navidad, Regalos y Recuerdos
```
img/productos/body-bebe-navideno-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/body-bebe-navideno-2.webp   ← segundo ángulo o detalle
img/productos/body-bebe-navideno-3.webp   ← producto en uso / empaque
```
### ☕ Tazas y Termos

**Taza Cerámica 11 oz Personalizada** · también en: DTF UV y Maquila, Personalizados, Regalos y Recuerdos
```
img/productos/taza-ceramica-personalizada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/taza-ceramica-personalizada-2.webp   ← segundo ángulo o detalle
img/productos/taza-ceramica-personalizada-3.webp   ← producto en uso / empaque
```
**Taza Mágica Cambia Color** · también en: Personalizados, Regalos y Recuerdos
```
img/productos/taza-magica-cambia-color-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/taza-magica-cambia-color-2.webp   ← segundo ángulo o detalle
img/productos/taza-magica-cambia-color-3.webp   ← producto en uso / empaque
```
**Taza de Color Interior Personalizada** · también en: Personalizados
```
img/productos/taza-color-interior-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/taza-color-interior-2.webp   ← segundo ángulo o detalle
img/productos/taza-color-interior-3.webp   ← producto en uso / empaque
```
**Termo 20 oz Personalizado** · también en: Personalizados, Regalos y Recuerdos
```
img/productos/termo-20oz-personalizado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/termo-20oz-personalizado-2.webp   ← segundo ángulo o detalle
img/productos/termo-20oz-personalizado-3.webp   ← producto en uso / empaque
```
**Termo 30 oz Personalizado** · también en: Personalizados, Regalos y Recuerdos
```
img/productos/termo-30oz-personalizado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/termo-30oz-personalizado-2.webp   ← segundo ángulo o detalle
img/productos/termo-30oz-personalizado-3.webp   ← producto en uso / empaque
```
### 🔑 Llaveros y Pines

**Pines Personalizados** · también en: Personalizados, Regalos y Recuerdos
```
img/productos/pines-personalizados-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/pines-personalizados-2.webp   ← segundo ángulo o detalle
img/productos/pines-personalizados-3.webp   ← producto en uso / empaque
```
**Llavero MDF Personalizado** · también en: Decoración MDF, Personalizados, Regalos y Recuerdos
```
img/productos/llavero-mdf-personalizado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/llavero-mdf-personalizado-2.webp   ← segundo ángulo o detalle
img/productos/llavero-mdf-personalizado-3.webp   ← producto en uso / empaque
```
**Llavero Acrílico Personalizado** · también en: Personalizados
```
img/productos/llavero-acrilico-personalizado-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/llavero-acrilico-personalizado-2.webp   ← segundo ángulo o detalle
img/productos/llavero-acrilico-personalizado-3.webp   ← producto en uso / empaque
```
**Llavero DTF UV Doble Cara** · también en: DTF UV y Maquila, Personalizados
```
img/productos/llavero-dtf-uv-doble-cara-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/llavero-dtf-uv-doble-cara-2.webp   ← segundo ángulo o detalle
img/productos/llavero-dtf-uv-doble-cara-3.webp   ← producto en uso / empaque
```
### 💡 Lámparas LED

**Lámpara LED Personalizada** · también en: Personalizados, Regalos y Recuerdos, Decoración y Letreros
```
img/productos/lampara-led-personalizada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/lampara-led-personalizada-2.webp   ← segundo ángulo o detalle
img/productos/lampara-led-personalizada-3.webp   ← producto en uso / empaque
```
**Lámpara LED 3D Acrílico** · también en: Decoración y Letreros, Regalos y Recuerdos
```
img/productos/lampara-led-3d-acrilico-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/lampara-led-3d-acrilico-2.webp   ← segundo ángulo o detalle
img/productos/lampara-led-3d-acrilico-3.webp   ← producto en uso / empaque
```
**Lámpara LED Base de Madera** · también en: Decoración MDF, Decoración y Letreros, Hogar y Cocina
```
img/productos/lampara-led-base-madera-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/lampara-led-base-madera-2.webp   ← segundo ángulo o detalle
img/productos/lampara-led-base-madera-3.webp   ← producto en uso / empaque
```
**Cuadro de Luz LED** · también en: Decoración y Letreros, Regalos y Recuerdos
```
img/productos/cuadro-luz-led-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/cuadro-luz-led-2.webp   ← segundo ángulo o detalle
img/productos/cuadro-luz-led-3.webp   ← producto en uso / empaque
```
### 💍 Bodas y Eventos

**Cilindros para Boda con Iniciales** · también en: Personalizados, Regalos y Recuerdos
```
img/productos/cilindros-boda-iniciales-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/cilindros-boda-iniciales-2.webp   ← segundo ángulo o detalle
img/productos/cilindros-boda-iniciales-3.webp   ← producto en uso / empaque
```
**Recuerdo de Boda MDF Personalizado** · también en: Decoración MDF, Regalos y Recuerdos
```
img/productos/recuerdo-boda-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/recuerdo-boda-mdf-2.webp   ← segundo ángulo o detalle
img/productos/recuerdo-boda-mdf-3.webp   ← producto en uso / empaque
```
**Letrero Mr & Mrs MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/letrero-mr-mrs-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/letrero-mr-mrs-mdf-2.webp   ← segundo ángulo o detalle
img/productos/letrero-mr-mrs-mdf-3.webp   ← producto en uso / empaque
```
**Números de Mesa MDF** · también en: Decoración MDF, Decoración y Letreros
```
img/productos/numeros-mesa-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/numeros-mesa-mdf-2.webp   ← segundo ángulo o detalle
img/productos/numeros-mesa-mdf-3.webp   ← producto en uso / empaque
```
**Libro de Firmas MDF** · también en: Decoración MDF, Regalos y Recuerdos
```
img/productos/libro-firmas-mdf-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/libro-firmas-mdf-2.webp   ← segundo ángulo o detalle
img/productos/libro-firmas-mdf-3.webp   ← producto en uso / empaque
```
**Topper para Pastel de Boda** · también en: Decoración y Letreros, Regalos y Recuerdos
```
img/productos/topper-pastel-boda-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/topper-pastel-boda-2.webp   ← segundo ángulo o detalle
img/productos/topper-pastel-boda-3.webp   ← producto en uso / empaque
```
**Invitaciones DTF UV** · también en: DTF UV y Maquila, Personalizados
```
img/productos/invitaciones-dtf-uv-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/invitaciones-dtf-uv-2.webp   ← segundo ángulo o detalle
img/productos/invitaciones-dtf-uv-3.webp   ← producto en uso / empaque
```
**Corona XV Años Decorada** · también en: Decoración y Letreros, Regalos y Recuerdos
```
img/productos/corona-xv-anos-decorada-1.webp   ← foto principal (producto completo, fondo claro)
img/productos/corona-xv-anos-decorada-2.webp   ← segundo ángulo o detalle
img/productos/corona-xv-anos-decorada-3.webp   ← producto en uso / empaque
```

---

## 6. Imágenes del blog (8 artículos × 2 fotos)

**Cómo montar un nacimiento navideño en MDF paso a paso**
```
img/blog/como-montar-nacimiento-navideno-mdf-1.webp   ← portada (1200×675)
img/blog/como-montar-nacimiento-navideno-mdf-2.webp   ← imagen interior (1000×600)
```
**Porta uvas de Año Nuevo: historia, tradición de las 12 uvas y cómo personalizarlo**
```
img/blog/porta-uvas-ano-nuevo-tradicion-12-uvas-1.webp   ← portada (1200×675)
img/blog/porta-uvas-ano-nuevo-tradicion-12-uvas-2.webp   ← imagen interior (1000×600)
```
**Decoración de Día de Muertos con MDF: calaveritas, catrinas y ofrenda**
```
img/blog/decoracion-dia-de-muertos-mdf-calaveritas-1.webp   ← portada (1200×675)
img/blog/decoracion-dia-de-muertos-mdf-calaveritas-2.webp   ← imagen interior (1000×600)
```
**Osos de graduación para firmar: la guía completa para grupos escolares**
```
img/blog/osos-de-graduacion-para-firmar-guia-completa-1.webp   ← portada (1200×675)
img/blog/osos-de-graduacion-para-firmar-guia-completa-2.webp   ← imagen interior (1000×600)
```
**Ideas de recuerdos para bodas: cilindros con iniciales, números de mesa y más**
```
img/blog/ideas-recuerdos-para-bodas-cilindros-e-iniciales-1.webp   ← portada (1200×675)
img/blog/ideas-recuerdos-para-bodas-cilindros-e-iniciales-2.webp   ← imagen interior (1000×600)
```
**Qué es el DTF UV y por qué dura más que el vinil tradicional**
```
img/blog/que-es-el-dtf-uv-y-por-que-dura-mas-1.webp   ← portada (1200×675)
img/blog/que-es-el-dtf-uv-y-por-que-dura-mas-2.webp   ← imagen interior (1000×600)
```
**Cómo elegir una taza o termo personalizado (cerámica, mágica, acero)**
```
img/blog/como-elegir-taza-o-termo-personalizado-1.webp   ← portada (1200×675)
img/blog/como-elegir-taza-o-termo-personalizado-2.webp   ← imagen interior (1000×600)
```
**Cómo cuidar tus piezas de MDF para que duren años**
```
img/blog/como-cuidar-tus-piezas-de-mdf-1.webp   ← portada (1200×675)
img/blog/como-cuidar-tus-piezas-de-mdf-2.webp   ← imagen interior (1000×600)
```

---

## 7. Resumen rápido de carpetas

```
img/
├── productos/   300 archivos   <slug>-1.webp · <slug>-2.webp · <slug>-3.webp
├── banner/      11 archivos   banner-01.webp … banner-10.webp + og-taller-creativo-ek.jpg
├── categorias/  22 archivos   <slug-categoria>.webp
├── blog/        16 archivos   <slug-post>-1.webp · <slug-post>-2.webp
├── logo/        1 archivo     logo-taller-creativo-ek.png (1484×689, fondo transparente)
└── favicon/     4 archivos    favicon.ico · favicon-32x32.png · apple-touch-icon.png · icono-512.png
```

**Total si subes todo:** 349 imágenes.
Generado automáticamente el 5/10/2026 · vuelve a correr `node build/generar-seo.mjs` cuando cambie el catálogo.
