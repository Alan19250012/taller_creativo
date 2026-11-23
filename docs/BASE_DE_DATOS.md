# Base de datos

## Motor

La base de datos es **PostgreSQL** alojada en Supabase. El esquema completo se define en `schema.sql`, los datos iniciales en `seed.sql` y las migraciones incrementales en `migrar-db.mjs` (en la raíz del proyecto).

## Tablas

El modelo tiene 16 tablas de entidad y 3 tablas puente para las relaciones de muchos a muchos.

| Tabla | Propósito |
|---|---|
| `Usuario` | Clientes y administradores; la contraseña se guarda con hash bcrypt. |
| `Categoria` | Categorías principales (grupo, emoji, navegación, barra lateral, imagen). |
| `Subcategoria` | Subcategorías con icono de Bootstrap o imagen propia. |
| `Producto` | Catálogo: precios, stock, colores, tallas, imágenes y configuración de personalización. |
| `Variante` | Combinaciones de talla/color con stock, precio e imagen propios. |
| `Resena` | Reseñas de productos, con aprobación por el panel. |
| `Pedido` | Pedidos con estado, importes y datos de contacto. |
| `DetallePedido` | Líneas de cada pedido, incluida la personalización. |
| `Factura` | Factura generada a partir de un pedido. |
| `Cotizacion` | Solicitudes de cotización del formulario público, con imagen de referencia y estado. |
| `Articulo` | Entradas del blog. |
| `Banner` | Banners de la portada. |
| `Cupon` | Códigos de descuento. |
| `Pagina` | Bloques JSONB de la página de inicio. |
| `Configuracion` | Pares clave/valor de configuración (FAQ, políticas, datos de contacto). |
| `Auditoria` | Registro de operaciones administrativas. |

Las tablas puente son `_CategoriaToProducto`, `_ProductoToSubcategoria` y `_CategoriaToSubcategoria`.

## Campos principales

- `Producto.precioMinorista` y `Producto.precioDistribuidor` permiten el precio de mayoreo.
- `Producto.imagenes` es un arreglo de 1 a 5 imágenes; `Producto.imagenes_mini` marca cuáles se muestran como miniatura en la ficha.
- `Producto.personalizacion_campos` (JSONB) define los campos del formulario de personalización; `Variante.areas_campos` (JSONB) guarda la posición de cada campo sobre la imagen de esa variante.
- `Pedido.codigo` es un código único legible para el cliente.
- `DetallePedido.personalizacion` (JSONB) guarda la imagen compuesta y los textos capturados por el cliente.

## Llaves y relaciones

Todas las tablas usan una llave primaria `id` de tipo UUID generada por `gen_random_uuid()`. Las relaciones se establecen con llaves foráneas con borrado en cascada donde corresponde; por ejemplo, al eliminar un producto se eliminan sus variantes y reseñas.

Las relaciones de muchos a muchos (producto-categoría, producto-subcategoría y categoría-subcategoría) se resuelven con las tablas puente, donde cada fila guarda dos UUID.

## Restricciones e índices

- Índices únicos en `slug`, `email`, `codigo` de pedido y `numero` de factura.
- Valores por defecto para estados (`PENDIENTE`), fechas (`CURRENT_TIMESTAMP`) y arreglos vacíos.
- La integridad de la contraseña se maneja con la función `ek_login`, que compara el hash bcrypt dentro de PostgreSQL.

## Seguridad a nivel de fila

Supabase aplica Row Level Security (RLS). La clave anónima que usa la tienda solo puede leer los datos públicos: productos, categorías, subcategorías, banners, cupones activos, artículos publicados y reseñas aprobadas. Las tablas privadas (`Usuario`, `Pedido`, `Cotizacion`, `Configuracion`, entre otras) no tienen política de lectura pública, de modo que solo se acceden desde el servidor con la service role.

## Consultas relevantes

- `ek_login` (RPC) valida correo y contraseña y devuelve los datos del usuario.
- `ek_registrar_cliente` crea una cuenta de cliente con la contraseña cifrada.
- `ek_upsert_usuario` crea o edita usuarios desde el panel.
- La tienda filtra productos por categoría y subcategoría usando las tablas puente, que se materializan en `ek-subcategorias.js` durante la generación.

## Estrategia de respaldo

Actualmente no hay un respaldo automático documentado. Supabase conserva copias del proyecto, pero se recomienda programar un export periódico de la base de datos y documentarlo como parte de la operación del negocio.
