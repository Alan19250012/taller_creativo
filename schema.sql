-- ============================================================================
--  TALLER CREATIVO EK · ESQUEMA FINAL (PostgreSQL / Supabase)
-- ----------------------------------------------------------------------------
--  Este archivo REEMPLAZA el esquema anterior. Está alineado con el catálogo
--  real del sitio (assets/ek-data.js, ek-config.js, ek-blog.js, ek-subcategorias.js).
--
--  CÓMO USARLO (en orden):
--    1) Supabase → SQL Editor → pega ESTE archivo y ejecuta (Run).
--    2) Ejecuta seed.sql (catálogo real: 100 productos, 22 categorías, banners, blog).
--
--  CAMBIOS RESPECTO AL ESQUEMA ANTERIOR (hechos para que la BD = sitio real):
--    · Producto: se reemplazó "color" por colores TEXT[] y se añadieron
--      tallas TEXT[], caracteristicas TEXT[], keywords, precioAnterior.
--    · Categoria: se añadieron grupo, emoji, enNav, keywords, epoca.
--    · Banner: se añadieron boton, keywords, etiqueta, tema.
--    · Articulo (blog): se añadieron autor, categoria, keywords, minutos, fecha.
--    · Resena: se añadieron autor, ciudad, fecha (y usuarioId ahora es opcional).
--    · Se eliminaron Talla, CambioRol y Direccion (la talla va en Producto.tallas[],
--      la auditoría queda en Auditoria y la dirección en Pedido.direccionEnvio).
--
--  AUTENTICACIÓN: login propio (bcrypt vía pgcrypto) sobre la tabla Usuario.
--  La función ek_login() se llama desde la Pages Function /api/login.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Utilidad: UUID determinista a partir de un texto legible.
CREATE OR REPLACE FUNCTION ek_uuid(seed text) RETURNS uuid
LANGUAGE sql IMMUTABLE AS $$ SELECT md5(seed)::uuid $$;

-- ═══════════════════════════ BORRADO LIMPIO (re-ejecutable) ═══════════════════════════
-- Elimina las tablas del esquema anterior (y las actuales) para recrearlas.
-- Así puedes pegar este archivo de nuevo sin errores de "ya existe".
DROP TABLE IF EXISTS
  "Auditoria", "Configuracion", "Cupon", "Pagina", "Banner", "Articulo", "Factura",
  "DetallePedido", "Pedido", "Resena", "Variante", "Producto", "Subcategoria",
  "Categoria", "Usuario",
  "_CategoriaToProducto", "_ProductoToSubcategoria", "_CategoriaToSubcategoria",
  "Talla", "CambioRol", "Direccion"
CASCADE;

-- ═══════════════════════════ TABLAS ═══════════════════════════

CREATE TABLE "Usuario" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "contrasena" TEXT NOT NULL,          -- hash bcrypt (pgcrypto)
  "rol" TEXT NOT NULL DEFAULT 'CLIENTE',
  "telefono" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

CREATE TABLE "Categoria" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "descripcion" TEXT,
  "imagen" TEXT,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "esPrincipal" BOOLEAN NOT NULL DEFAULT true,
  "grupo" TEXT NOT NULL DEFAULT 'producto',   -- 'temporada' | 'producto'
  "emoji" TEXT NOT NULL DEFAULT '🎁',
  "enNav" BOOLEAN NOT NULL DEFAULT true,
  "enSidebar" BOOLEAN NOT NULL DEFAULT true,   -- mostrarla en la barra lateral izquierda
  "keywords" TEXT,
  "epoca" TEXT
);
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

CREATE TABLE "Subcategoria" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "icono" TEXT,
  "iconoImagen" TEXT,                       -- icono subido (PNG/SVG) que reemplaza al icono de Bootstrap
  "orden" INTEGER NOT NULL DEFAULT 0,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "padreId" UUID,
  CONSTRAINT "Subcategoria_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "Subcategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Subcategoria_slug_key" ON "Subcategoria"("slug");

CREATE TABLE "Producto" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "numeroArticulo" TEXT,
  "colores" TEXT[] NOT NULL DEFAULT '{}',
  "tallas" TEXT[] NOT NULL DEFAULT '{}',
  "caracteristicas" TEXT[] NOT NULL DEFAULT '{}',
  "keywords" TEXT,
  "destacado" BOOLEAN NOT NULL DEFAULT false,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "nuevo" BOOLEAN NOT NULL DEFAULT false,
  "liquidacion" BOOLEAN NOT NULL DEFAULT false,
  "precioMinorista" DOUBLE PRECISION NOT NULL,
  "precioDistribuidor" DOUBLE PRECISION,
  "precioAnterior" DOUBLE PRECISION,       -- NULL = sin oferta
  "stock" INTEGER NOT NULL DEFAULT 0,
  "vendidos" INTEGER NOT NULL DEFAULT 0,
  "calificacion" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "imagen" TEXT,
  "imagenes" TEXT[] NOT NULL DEFAULT '{}',   -- 1 a 5 imágenes del producto
  "imagen_personalizacion" TEXT,             -- imagen base del personalizador (NO se muestra en la galería)
  "print_area" JSONB,          -- área de personalización: {x,y,width,height} en %
  "personalizable" BOOLEAN NOT NULL DEFAULT false,  -- si es personalizable, se muestra el editor
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Producto_slug_key" ON "Producto"("slug");

-- Variante = combinación talla/color con su propio stock y precio (opcional)
CREATE TABLE "Variante" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productoId" UUID NOT NULL,
  "talla" TEXT,
  "color" TEXT,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "extra" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "precio" DOUBLE PRECISION,
  "imagen" TEXT,                            -- foto específica de esta talla/color
  CONSTRAINT "Variante_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Variante_productoId_idx" ON "Variante"("productoId");

CREATE TABLE "Resena" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productoId" UUID NOT NULL,
  "usuarioId" UUID,
  "autor" TEXT NOT NULL,
  "ciudad" TEXT,
  "estrellas" INTEGER NOT NULL DEFAULT 5,
  "comentario" TEXT NOT NULL,
  "fecha" TEXT,
  "aprobada" BOOLEAN NOT NULL DEFAULT false,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Resena_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Resena_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Pedido" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuarioId" UUID,
  "cliente" TEXT,                          -- nombre libre (por si no hay cuenta)
  "telefono" TEXT,                         -- teléfono del cliente (capturado en el checkout)
  "codigo" TEXT,                           -- código único de pedido (generado automáticamente)
  "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
  "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "impuesto" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "envio" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "direccionEnvio" TEXT,
  "metodoPago" TEXT,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Pedido_codigo_key" ON "Pedido"("codigo");

CREATE TABLE "DetallePedido" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pedidoId" UUID NOT NULL,
  "productoId" UUID,
  "nombreProducto" TEXT,
  "cantidad" INTEGER NOT NULL,
  "precioUnitario" DOUBLE PRECISION NOT NULL,
  "tipoPrecio" TEXT,
  "talla" TEXT,
  CONSTRAINT "DetallePedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Factura" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "numero" TEXT NOT NULL,
  "pedidoId" UUID NOT NULL,
  "pdfUrl" TEXT,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Factura_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Factura_numero_key" ON "Factura"("numero");
CREATE UNIQUE INDEX "Factura_pedidoId_key" ON "Factura"("pedidoId");

CREATE TABLE "Articulo" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titulo" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "resumen" TEXT,
  "contenido" TEXT NOT NULL,
  "bloques" JSONB,          -- bloques del constructor (texto/imagen) para editar el contenido
  "imagen" TEXT,
  "publicado" BOOLEAN NOT NULL DEFAULT false,
  "autor" TEXT,
  "categoria" TEXT,
  "keywords" TEXT,
  "minutos" INTEGER,
  "fecha" TEXT,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Articulo_slug_key" ON "Articulo"("slug");

CREATE TABLE "Banner" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titulo" TEXT NOT NULL,
  "subtitulo" TEXT,
  "imagen" TEXT,
  "enlace" TEXT,
  "boton" TEXT,
  "keywords" TEXT,
  "etiqueta" TEXT,
  "tema" TEXT NOT NULL DEFAULT 'rojo',
  "orden" INTEGER NOT NULL DEFAULT 0,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Cupon" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "codigo" TEXT NOT NULL,
  "tipo" TEXT NOT NULL DEFAULT 'pct',     -- 'pct' | 'monto' | 'envio'
  "valor" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "minimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "texto" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "usos" INTEGER NOT NULL DEFAULT 0,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Cupon_codigo_key" ON "Cupon"("codigo");

CREATE TABLE "Pagina" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "bloques" JSONB NOT NULL DEFAULT '[]',
  "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Pagina_slug_key" ON "Pagina"("slug");

CREATE TABLE "Configuracion" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clave" TEXT NOT NULL,
  "valor" TEXT NOT NULL
);
CREATE UNIQUE INDEX "Configuracion_clave_key" ON "Configuracion"("clave");

CREATE TABLE "Auditoria" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "adminId" UUID,
  "accion" TEXT NOT NULL,
  "detalle" TEXT,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Auditoria_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ═══════════════════════ TABLAS PUENTE (muchos a muchos) ═══════════════════════

CREATE TABLE "_CategoriaToProducto" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL,
  CONSTRAINT "_CategoriaToProducto_AB_pkey" PRIMARY KEY ("A","B")
);
CREATE INDEX "_CategoriaToProducto_B_index" ON "_CategoriaToProducto"("B");
ALTER TABLE "_CategoriaToProducto" ADD CONSTRAINT "_CategoriaToProducto_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoriaToProducto" ADD CONSTRAINT "_CategoriaToProducto_B_fkey" FOREIGN KEY ("B") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "_ProductoToSubcategoria" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL,
  CONSTRAINT "_ProductoToSubcategoria_AB_pkey" PRIMARY KEY ("A","B")
);
CREATE INDEX "_ProductoToSubcategoria_B_index" ON "_ProductoToSubcategoria"("B");
ALTER TABLE "_ProductoToSubcategoria" ADD CONSTRAINT "_ProductoToSubcategoria_A_fkey" FOREIGN KEY ("A") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProductoToSubcategoria" ADD CONSTRAINT "_ProductoToSubcategoria_B_fkey" FOREIGN KEY ("B") REFERENCES "Subcategoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "_CategoriaToSubcategoria" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL,
  CONSTRAINT "_CategoriaToSubcategoria_AB_pkey" PRIMARY KEY ("A","B")
);
CREATE INDEX "_CategoriaToSubcategoria_B_index" ON "_CategoriaToSubcategoria"("B");
ALTER TABLE "_CategoriaToSubcategoria" ADD CONSTRAINT "_CategoriaToSubcategoria_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoriaToSubcategoria" ADD CONSTRAINT "_CategoriaToSubcategoria_B_fkey" FOREIGN KEY ("B") REFERENCES "Subcategoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ═══════════════════════ AUTENTICACIÓN (bcrypt) ═══════════════════════
-- Verifica email+contraseña con crypt(). La Pages Function /api/login la llama
-- vía PostgREST (rpc/ek_login) y luego firma el JWT de sesión.

CREATE OR REPLACE FUNCTION ek_login(p_email text, p_password text)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE u record;
BEGIN
  SELECT id, nombre, email, rol, telefono INTO u
  FROM "Usuario"
  WHERE lower(email) = lower(p_email)
    AND activo = true
    AND contrasena = crypt(p_password, contrasena)
  LIMIT 1;

  IF u.id IS NULL THEN
    RETURN json_build_object('ok', false);
  END IF;

  RETURN json_build_object(
    'ok', true,
    'id', u.id,
    'nombre', u.nombre,
    'email', u.email,
    'rol', u.rol,
    'telefono', u.telefono
  );
END;
$$;

REVOKE ALL ON FUNCTION ek_login(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ek_login(text, text) TO anon, authenticated;

-- Crea/actualiza un usuario. La contraseña se cifra (bcrypt) aquí mismo.
-- Solo la service role (vía el proxy /api/admin) puede ejecutarla: la anon key
-- NO tiene permiso, así que nadie puede resetear contraseñas desde el navegador.
CREATE OR REPLACE FUNCTION ek_upsert_usuario(
  p_id uuid, p_nombre text, p_email text, p_password text, p_rol text, p_telefono text, p_activo boolean
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO "Usuario" ("id","nombre","email","contrasena","rol","telefono","activo")
  VALUES (
    COALESCE(p_id, gen_random_uuid()),
    p_nombre,
    lower(p_email),
    CASE WHEN p_password IS NOT NULL AND p_password <> '' THEN crypt(p_password, gen_salt('bf', 10)) ELSE '' END,
    COALESCE(p_rol, 'CLIENTE'),
    p_telefono,
    COALESCE(p_activo, true)
  )
  ON CONFLICT ("email") DO UPDATE SET
    "nombre" = EXCLUDED."nombre",
    "rol" = EXCLUDED."rol",
    "telefono" = EXCLUDED."telefono",
    "activo" = EXCLUDED."activo",
    "contrasena" = CASE WHEN EXCLUDED."contrasena" <> '' THEN EXCLUDED."contrasena" ELSE "Usuario"."contrasena" END
  RETURNING "id" INTO v_id;

  RETURN json_build_object('ok', true, 'id', v_id);
END;
$$;

REVOKE ALL ON FUNCTION ek_upsert_usuario(uuid, text, text, text, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ek_upsert_usuario(uuid, text, text, text, text, text, boolean) TO service_role;

-- Registro público de clientes (nombre, correo, teléfono, contraseña).
-- La Pages Function /api/registro la llama con la service role y luego firma el JWT.
CREATE OR REPLACE FUNCTION ek_registrar_cliente(p_nombre text, p_email text, p_telefono text, p_password text)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM "Usuario" WHERE lower(email) = lower(p_email)) THEN
    RETURN json_build_object('ok', false, 'error', 'Ya existe una cuenta con ese correo');
  END IF;
  INSERT INTO "Usuario" ("nombre","email","contrasena","rol","telefono","activo")
  VALUES (p_nombre, lower(p_email), crypt(p_password, gen_salt('bf', 10)), 'CLIENTE', p_telefono, true)
  RETURNING "id" INTO v_id;
  RETURN json_build_object('ok', true, 'id', v_id, 'nombre', p_nombre, 'email', lower(p_email), 'rol', 'CLIENTE', 'telefono', p_telefono);
END;
$$;

REVOKE ALL ON FUNCTION ek_registrar_cliente(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ek_registrar_cliente(text, text, text, text) TO service_role;

-- Actualización del perfil del cliente (nombre, teléfono, contraseña) sin tocar email ni rol.
CREATE OR REPLACE FUNCTION ek_actualizar_perfil(p_id uuid, p_nombre text, p_telefono text, p_password text)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_nombre text; v_telefono text;
BEGIN
  UPDATE "Usuario" SET
    "nombre" = NULLIF(p_nombre, ''),
    "telefono" = p_telefono,
    "contrasena" = CASE WHEN COALESCE(p_password, '') <> '' THEN crypt(p_password, gen_salt('bf', 10)) ELSE "contrasena" END
  WHERE "id" = p_id
  RETURNING "nombre", "telefono" INTO v_nombre, v_telefono;
  IF v_nombre IS NULL THEN RETURN json_build_object('ok', false, 'error', 'Usuario no encontrado'); END IF;
  RETURN json_build_object('ok', true, 'nombre', v_nombre, 'telefono', v_telefono);
END;
$$;

REVOKE ALL ON FUNCTION ek_actualizar_perfil(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ek_actualizar_perfil(uuid, text, text, text) TO service_role;

-- ═══════════════════════ ROW LEVEL SECURITY ═══════════════════════
-- · El sitio público (anon key) solo LEE datos públicos: productos, categorías,
--   subcategorías, banners, artículos publicados y reseñas aprobadas.
-- · El panel admin NO usa la anon key para escribir: pasa por las Pages Functions,
--   que usan la service role key (bypasea RLS). Así las claves sensibles no salen
--   al navegador y los datos privados (pedidos, clientes, config) quedan cerrados.

ALTER TABLE "Producto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Variante" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Categoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subcategoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Banner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pagina" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Articulo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resena" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pedido" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DetallePedido" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Factura" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Configuracion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Auditoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_CategoriaToProducto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_ProductoToSubcategoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_CategoriaToSubcategoria" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica_productos" ON "Producto" FOR SELECT USING (true);
CREATE POLICY "lectura_publica_categorias" ON "Categoria" FOR SELECT USING (true);
CREATE POLICY "lectura_publica_subcategorias" ON "Subcategoria" FOR SELECT USING (true);
CREATE POLICY "lectura_publica_banners" ON "Banner" FOR SELECT USING (true);
CREATE POLICY "lectura_publica_cupones" ON "Cupon" FOR SELECT USING ("activo" = true);
CREATE POLICY "lectura_publica_paginas" ON "Pagina" FOR SELECT USING (true);
CREATE POLICY "lectura_publica_articulos" ON "Articulo" FOR SELECT USING ("publicado" = true);
CREATE POLICY "lectura_publica_resenas" ON "Resena" FOR SELECT USING ("aprobada" = true);
CREATE POLICY "lectura_publica_rel_cat_prod" ON "_CategoriaToProducto" FOR SELECT USING (true);
CREATE POLICY "lectura_publica_rel_prod_sub" ON "_ProductoToSubcategoria" FOR SELECT USING (true);
CREATE POLICY "lectura_publica_rel_cat_sub" ON "_CategoriaToSubcategoria" FOR SELECT USING (true);

-- ═══════════════════════ DATOS MÍNIMOS DE ARRANQUE ═══════════════════════
-- (El catálogo completo se carga con seed.sql)

-- Usuario administrador (contraseña: admin123)
INSERT INTO "Usuario" ("nombre","email","contrasena","rol","activo","creadoEn")
VALUES ('Administrador','admin@ek.com', crypt('admin123', gen_salt('bf', 10)), 'ADMINISTRADOR', true, now())
ON CONFLICT ("email") DO NOTHING;

-- Cupones de descuento iniciales (se gestionan desde el panel → Cupones)
INSERT INTO "Cupon" ("codigo","tipo","valor","minimo","texto","activo") VALUES
('EK10','pct',10,0,'10% de descuento',true),
('EK200','monto',200,1500,'$200 de descuento en compras +$1,500',true),
('ENVIOGRATIS','envio',0,0,'Envío gratis',true),
('MAYOREO5','pct',5,2500,'5% de mayoreo en compras +$2,500',true)
ON CONFLICT ("codigo") DO NOTHING;

-- Página de inicio del constructor visual (bloques vacíos por defecto)
INSERT INTO "Pagina" ("slug","nombre","bloques") VALUES ('inicio','Página de inicio','[]'::jsonb)
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
--  LISTO. Ejecuta ahora seed.sql para cargar el catálogo real.
--  Panel: /admin  (admin@ek.com / admin123)
-- ============================================================================
