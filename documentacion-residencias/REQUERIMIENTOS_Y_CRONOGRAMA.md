# Requerimientos, cronograma y metodología

## Requerimientos funcionales

Los requerimientos se levantaron a partir de la operación real del taller, que atendía pedidos y cotizaciones por WhatsApp sin un registro central. Se identificaron los siguientes:

1. Mostrar el catálogo de productos con categorías, subcategorías, filtros y buscador.
2. Permitir seleccionar variantes de talla y color con su propio precio y stock.
3. Agregar productos al carrito y completar la compra por WhatsApp o con tarjeta.
4. Registrar clientes con correo y contraseña, y mostrar su historial de pedidos.
5. Personalizar productos con texto y fotos, con vista previa sobre la imagen del producto.
6. Recibir solicitudes de cotización con cantidad, materiales, medidas e imagen de referencia.
7. Administrar productos, pedidos, clientes y cotizaciones desde un panel protegido.
8. Publicar los cambios del catálogo sin intervención manual sobre los archivos.

## Requerimientos no funcionales

- La tienda debe cargar rápido; el catálogo se sirve como archivo estático y el peso comprimido de la portada ronda los 66 KB.
- El sitio debe verse correctamente desde 320 px hasta pantallas de escritorio.
- Los datos privados (pedidos, clientes, contraseñas) no deben exponerse en el navegador.
- El acceso administrativo debe exigir autenticación y distinguir el rol de administrador.
- La solución no debe generar costos fijos elevados para el negocio.

## Cronograma

El proyecto se organizó en ocho fases distribuidas en dieciséis semanas:

| Semanas | Fase |
|---|---|
| 1 | Análisis y levantamiento de requerimientos |
| 2 | Diseño de arquitectura y estructura |
| 3 | Diseño e implementación de la base de datos |
| 4 | Diseño y desarrollo del sitio web |
| 5 | Catálogo y tienda en línea |
| 6 | Cotizaciones y panel administrativo |
| 7 | Seguridad e integración de servicios |
| 8 | Pruebas, correcciones, documentación y entrega |

## Metodología

El desarrollo se hizo de forma incremental, entregando módulos funcionales en cada etapa: primero el catálogo estático, después la tienda con carrito, el panel administrativo, la personalización y por último las cotizaciones. El historial de Git conserva esa secuencia, con un commit por bloque de funcionalidad, y el archivo `HANDOVER.md` funciona como punto de control entre sesiones de trabajo.

El control de cambios se apoya en el propio sistema de versiones: cada cambio queda registrado con su descripción y puede revertirse. Las incidencias encontradas durante las pruebas quedaron documentadas en `docs/PRUEBAS.md`.
