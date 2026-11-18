# 🎨 Módulo de Productos Personalizables — Arquitectura

> Diseño e implementación del módulo de personalización con vista previa en tiempo real.
> Aplica a: **Panel administrativo** (`/admin`) y **tienda** (`/`).

---

## 1. Modelo de datos

### 1.1 Tabla `Producto` (columnas nuevas)
```sql
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "personalizacion_campos" JSONB;
-- Array de definiciones de campos dinámicos (form builder):
-- [
--   { "tipo":"texto",      "label":"Nombre de la mascota", "max":7,   "obligatorio":true },
--   { "tipo":"textarea",   "label":"Dedicatoria",          "max":120, "obligatorio":false },
--   { "tipo":"select",     "label":"Tipografía", "opciones":["Block","Script","Serif"], "obligatorio":true },
--   { "tipo":"foto",       "label":"Foto",       "obligatorio":false }
-- ]
```

### 1.2 Tabla `Variante` (ya existente, reutilizada)
Cada variante (talla/color) ya guarda:
- `imagen` → foto de **muestra** (ejemplo CON texto).
- `imagen_personalizacion` → imagen **en blanco** (SIN texto) sobre la que se dibuja.
- `print_area` → `{x,y,width,height}` en % donde se imprime el texto.

### 1.3 Metadatos en la orden (`DetallePedido`)
El ítem personalizado guarda su payload como JSON:
```sql
ALTER TABLE "DetallePedido" ADD COLUMN IF NOT EXISTS "personalizacion" JSONB;
-- {
--   "imagen": "https://.../pedidos/xxxx.png",   (composición final en alta resolución)
--   "foto_cliente": "https://.../pedidos/yyyy.jpg",  (foto original subida por el cliente)
--   "campos": { "Nombre de la mascota": "Bobby", "Tipografía": "Script" }
-- }
```

---

## 2. Almacenamiento de archivos (seguro)

### 2.1 Fotos de clientes (privadas, no públicas)
- Bucket Supabase **`clientes`** con `public = false`.
- Subida **solo por el navegador autenticado del cliente** vía un endpoint firmado:
  `POST /api/subir-personalizacion` (verifica JWT del cliente) → devuelve una **URL firmada** temporal.
- La **URL pública no se expone**: el admin y el cliente ven una URL firmada (expira) o el admin usa la service role.

### 2.2 Composición final
- La vista previa usa `canvas.toBlob('image/png')` (alta resolución), NO `toDataURL` gigante.
- Se sube al bucket `pedidos` con la service role desde el checkout.

---

## 3. Flujo completo

```
Admin: define campos (form builder) ──▶ Producto.personalizacion_campos
                                          │
Cliente: rellena campos (texto/foto/fuente) ──▶ Live preview (canvas)
                                          │ valida obligatorios + máx. longitud
                                          ▼
"Agregar al carrito" ──▶ compone PNG ──▶ upload /api/subir-personalizacion ──▶ URL
                                          │ guarda { imagen, foto_cliente, campos }
                                          ▼
Checkout (Stripe/webhook) ──▶ DetallePedido.personalizacion (JSON) + factura
                                          │
Panel admin: Pedido → muestra miniatura + textos + opciones
```

---

## 4. Ejemplos de código (backend)

### 4.1 Recibir y validar campos (Pages Function)
```js
// POST /api/subir-personalizacion  (cliente autenticado)
export async function onRequestPost(ctx) {
  const env = ctx.env;
  const user = await verifyJwt(tokenDe(ctx.request), env.JWT_SECRET);
  if (!user) return json({ ok: false, error: "No autorizado" }, 401);

  const body = await ctx.request.json();
  // body: { productoId, imagen_base64, foto_cliente_base64, campos: { label: valor } }

  // 1) validar contra Producto.personalizacion_campos (máx, obligatorio)
  // 2) subir al bucket "clientes"/"pedidos" (service role)
  // 3) devolver URLs firmadas
}
```

### 4.2 Guardar metadatos en la orden
```js
// webhook.js — al crear el DetallePedido
await pg(env, "DetallePedido", "POST", {
  pedidoId, productoId, nombreProducto, cantidad: 1, precioUnitario,
  talla, personalizacion: { imagen, foto_cliente, campos },
});
```

---

## 5. Tipos de campo soportados (form builder)

| `tipo` | Render (cliente) | Restricciones |
|---|---|---|
| `texto` | `<input>` + contador | `max` |
| `textarea` | `<textarea>` + contador | `max` |
| `select` | `<select>` (opciones) | `opciones` |
| `foto` | subida de imagen + editor | JPG/PNG |

---

## 6. Editor de fotos (modal)
Componente `assets/ek-foto-editor.js` con:
- **Crop** (arrastrar rectángulo, aspect fijo o libre).
- **Zoom** (slider) y **Rotación** (botones ±90°).
- **Filtros**: Original · B/N (grayscale) · Vintage (sepia).
- **"Done"** → recorta y devuelve la imagen lista para la vista previa.
