# 🎨 Módulo de Productos Personalizables — Arquitectura

> Diseño e implementación del módulo de personalización con vista previa en tiempo real.
> Aplica a: **Panel administrativo** (`/admin`) y **tienda** (`/`).

---

## 1. Modelo de datos

### 1.1 Tabla `Producto` (columnas nuevas)
```sql
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "personalizacion_campos" JSONB;
-- Array de definiciones de campos dinámicos. CADA campo tiene su propia área
-- de impresión (porcentajes) y las fotos su forma (cuadrada o redonda):
-- [
--   { "tipo":"texto",     "label":"Nombre",      "max":7,  "obligatorio":true,
--     "area":{ "x":20, "y":35, "width":40, "height":12 } },
--   { "tipo":"textarea",  "label":"Dedicatoria", "max":120, "obligatorio":false,
--     "area":{ "x":15, "y":50, "width":70, "height":25 } },
--   { "tipo":"select",    "label":"Tipografía", "opciones":["Block","Script","Serif"], "obligatorio":true },
--   { "tipo":"foto",      "label":"Foto", "obligatorio":false, "forma":"redonda",
--     "area":{ "x":38, "y":8, "width":24, "height":20 } }
-- ]
-- "select" es el selector de FUENTE global (no se posiciona).
```

`Producto` también guarda:
- `imagen_personalizacion` → imagen **en blanco** (SIN texto) sobre la que se dibujan campos y foto. Es el lienzo de referencia para posicionar (a nivel de producto).

### 1.2 Tabla `Variante` (legado)
La personalización ya NO depende de la variante: `imagen_personalizacion` y `print_area`
de la variante quedaron como **respaldo legado** (el personalizador las usa solo si el
producto no tiene `imagen_personalizacion` propia). La variante conserva:
- `imagen` → foto de **muestra** (ejemplo CON texto).

### 1.3 Metadatos en la orden (`DetallePedido`)
El ítem personalizado guarda su payload como JSON:
```sql
ALTER TABLE "DetallePedido" ADD COLUMN IF NOT EXISTS "personalizacion" JSONB;
-- {
--   "imagen": "https://.../pedidos/xxxx.png",   (composición final)
--   "campos": { "Nombre": "Bobby", "Tipografía": "Script" }
-- }
```

---

## 2. Almacenamiento de archivos

- **Composición final**: la vista previa se compone en un `<canvas>` y se exporta a PNG;
  se sube al bucket público `imagenes/pedidos` vía `POST /api/subir-personalizacion`
  (abierto, límite 8 MB) y devuelve una URL pública. Esa URL viaja en los metadatos del
  carrito/checkout y se guarda en `DetallePedido.personalizacion.imagen`.
- La **foto original del cliente** queda embebida en la composición (no se guarda por
  separado en esta versión).

---

## 3. Flujo completo

```
Admin: sube imagen base + define campos + ARRASTRA cada campo sobre la imagen
       (elige forma cuadrada/redonda para las fotos)  ──▶ Producto.personalizacion_campos
                                                          Producto.imagen_personalizacion
                                                          │
Cliente: rellena campos (texto/foto/fuente) ──▶ Live preview (canvas)
                                                          │ cada campo se dibuja EN SU área
                                                          ▼
"Agregar al carrito" ──▶ compone PNG ──▶ upload /api/subir-personalizacion ──▶ URL
                                                          │ guarda { imagen, campos }
                                                          ▼
Checkout (Stripe/webhook) ──▶ DetallePedido.personalizacion (JSON) + factura
                                                          │
Panel admin: Pedido → muestra miniatura + textos + opciones
```

---

## 4. Panel administrativo — editor visual

Componente `admin/personalizacion-editor.js` (`window.PersonalizacionEditor`):
- Une en un solo lugar: **subir imagen base** + **lista de campos** + **cajas arrastrables**.
- Cada campo de texto/foto se dibuja como una caja de color sobre la imagen; se arrastra
  para moverla y su esquina roja cambia el tamaño.
- Los campos `foto` tienen un selector **Cuadrada / Redonda** (la caja se ve como círculo).
- El campo `select` es el selector de fuente y **no se posiciona**.
- Devuelve `getCampos()` (con `area` y `forma`) y `getImagen()`.

---

## 5. Tipos de campo soportados

| `tipo` | Render (cliente) | Posición | Extras |
|---|---|---|---|
| `texto` | `<input>` + contador | sí (`area`) | `max` |
| `textarea` | `<textarea>` + contador | sí (`area`) | `max` |
| `select` | `<select>` (fuente global) | no | `opciones` |
| `foto` | subida + editor de fotos | sí (`area`) | `forma` = `cuadrada` \| `redonda` |

---

## 6. Editor de fotos (modal)
Componente `assets/ek-foto-editor.js` con:
- **Crop** (arrastrar rectángulo, aspect fijo o libre).
- **Zoom** (slider) y **Rotación** (botones ±90°).
- **Filtros**: Original · B/N (grayscale) · Vintage (sepia).
- **"Done"** → recorta y devuelve la imagen lista para la vista previa.
