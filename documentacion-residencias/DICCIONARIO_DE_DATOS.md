# Diccionario de datos

El modelo usa 16 tablas de entidad y 3 tablas puente, todas con llave primaria `id` de tipo UUID. Los campos se describen con su tipo y propósito; la definición completa está en `schema.sql`.

## Usuario

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Llave primaria |
| nombre | TEXT | Nombre de la persona |
| email | TEXT | Correo, único |
| contrasena | TEXT | Hash bcrypt |
| rol | TEXT | ADMINISTRADOR o CLIENTE |
| telefono | TEXT | Teléfono de contacto |
| activo | BOOLEAN | Cuenta habilitada |

## Categoria y Subcategoria

`Categoria` guarda el nombre, el slug único, el grupo, el emoji, el orden y dos banderas para mostrarla en el menú y en la barra lateral. `Subcategoria` guarda el nombre, el slug, el icono y el orden; se relaciona con las categorías mediante la tabla `_CategoriaToSubcategoria`.

## Producto y Variante

`Producto` guarda nombre, slug, descripción, precios (minorista y distribuidor), stock, colores, tallas, imágenes (arreglo de hasta cinco), la configuración de personalización (`personalizacion_campos`) y las marcas de miniatura (`imagenes_mini`). `Variante` guarda la combinación de talla y color con su stock, precio e imagen, y se relaciona con `Producto` por `productoId`.

## Pedido, DetallePedido y Factura

`Pedido` guarda el cliente, el teléfono, el código único, el estado, el subtotal, el impuesto, el envío y el total. `DetallePedido` guarda cada línea con producto, cantidad, precio y la personalización en JSON. `Factura` se relaciona con un pedido y guarda su número.

## Cotizacion

| Campo | Tipo | Descripción |
|---|---|---|
| nombre | TEXT | Nombre del solicitante |
| telefono, email | TEXT | Datos de contacto |
| producto | TEXT | Producto o servicio solicitado |
| descripcion | TEXT | Descripción del trabajo |
| cantidad, materiales, medidas, fecha | TEXT | Especificaciones |
| imagen | TEXT | URL de la imagen de referencia |
| estado | TEXT | PENDIENTE, EN_REVISION, COTIZADA, ACEPTADA o RECHAZADA |

## Configuracion y Auditoria

`Configuracion` almacena pares clave/valor para la configuración de la tienda (FAQ, políticas, datos de contacto). `Auditoria` está prevista para registrar operaciones administrativas.

## Relaciones de muchos a muchos

- `_CategoriaToProducto`: una categoría puede contener varios productos y viceversa.
- `_ProductoToSubcategoria`: un producto puede pertenecer a varias subcategorías.
- `_CategoriaToSubcategoria`: una subcategoría puede aparecer en varias categorías.
