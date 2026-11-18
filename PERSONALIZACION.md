# 🎨 Módulo de Productos Personalizables — Arquitectura

> Diseño e implementación del módulo de personalización con vista previa en tiempo real.
> Aplica a: **Panel administrativo** (`/admin`) y **tienda** (`/`).

---

## 1. Modelo de datos

### 1.1 Tabla `Producto` — campos (definiciones, compartidas por todas las variantes)
```sql
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "personalizacion_campos" JSONB;
-- Array de DEFINICIONES de campos. Las ÁREAS se guardan por variante (ver 1.2).
-- [
--   { "tipo":"texto",     "label":"Nombre",      "max":7,  "obligatorio":true },
--   { "tipo":"textarea",  "label":"Dedicatoria", "max":120, "obligatorio":false },
--   { "tipo":"select",    "label":"Tipografía", "opciones":["Block","Script","Serif"], "obligatorio":true },
--   { "tipo":"foto",      "label":"Foto", "obligatorio":false, "forma":"redonda" }
-- ]
-- "select" = selector de FUENTE global (no se posiciona). "forma" solo aplica a "foto".
```

### 1.2 Tabla `Variante` — imagen y áreas POR VARIANTE (talla/color)
```sql
ALTER TABLE "Variante" ADD COLUMN IF NOT EXISTS "areas_campos" JSONB;
-- Cada variante tiene su propia imagen en blanco y sus propias áreas por campo:
--   "imagen_personalizacion"  → imagen en blanco (SIN texto) de esta talla/color
--   "print_area"              → área general {x,y,width,height} en % (respaldo)
--   "areas_campos"            → array PARALELO a Producto.personalizacion_campos:
--                               [ {x,y,width,height}, {x,y,width,height}, null, … ]
--                               (null = ese campo usa print_area o el default)
```

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
Admin: define los CAMPOS una vez (producto)  ──▶ Producto.personalizacion_campos
Admin: POR VARIANTE sube la imagen en blanco y arrastra cada campo ──▶ Variante.imagen_personalizacion + Variante.areas_campos
                                                          │
Cliente: elige talla/color → rellena campos → Live preview (canvas)
                                                          │ cada campo se dibuja EN el área de ESA variante
                                                          ▼
"Agregar al carrito" ──▶ compone PNG ──▶ upload /api/subir-personalizacion ──▶ URL
                                                          │ guarda { imagen, campos }
                                                          ▼
Checkout (Stripe/webhook) ──▶ DetallePedido.personalizacion (JSON) + factura
                                                          │
Panel admin: Pedido → muestra miniatura + textos + opciones
```

---

## 4. Panel administrativo

- **Campos de personalización** (nivel producto): define tipo, etiqueta, máx. caracteres,
  opciones de fuente, obligatorio y (para fotos) la forma **cuadrada/redonda**.
- **Dentro de cada variante** (`PosicionadorPersonalizacion`, `admin/personalizacion-editor.js`):
  subir la imagen en blanco de esa talla/color y **arrastrar una caja por cada campo** para
  ubicarlo; la esquina roja cambia el tamaño. Las fotos se ven como círculo si son redondas.

---

## 5. Tipos de campo soportados

| `tipo` | Render (cliente) | Posición | Extras |
|---|---|---|---|
| `texto` | `<input>` + contador | por variante (`areas_campos`) | `max` |
| `textarea` | `<textarea>` + contador | por variante (`areas_campos`) | `max` |
| `select` | `<select>` (fuente global) | no | `opciones` |
| `foto` | subida + editor de fotos | por variante (`areas_campos`) | `forma` = `cuadrada` \| `redonda` |

---

## 6. Editor de fotos (modal)
Componente `assets/ek-foto-editor.js` con:
- **Crop** (arrastrar rectángulo, aspect fijo o libre).
- **Zoom** (slider) y **Rotación** (botones ±90°).
- **Filtros**: Original · B/N (grayscale) · Vintage (sepia).
- **"Done"** → recorta y devuelve la imagen lista para la vista previa.
