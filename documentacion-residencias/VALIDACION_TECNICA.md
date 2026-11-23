# Validación técnica del sistema

La validación se hizo ejecutando las herramientas del propio proyecto sobre la base de datos real y el código fuente. Se registra lo que devolvió cada comando, sin simular resultados.

## Verificación de sintaxis

Se ejecutó `node --check` sobre los archivos del backend (`functions/`), del panel (`admin/app.js`) y de la tienda (`assets/ek.js`), así como sobre los scripts de la raíz. Todos devolvieron salida limpia, sin errores de sintaxis.

## Verificación de la base de datos

Se ejecutó `node verificar-db.mjs`. Confirmó 19 tablas (incluida `Cotizacion`), 100 productos, 22 categorías, 56 subcategorías, el bucket de imágenes público y el usuario administrador activo. El comando terminó con código de salida 0.

## Verificación del catálogo

Se ejecutó `node build/verificar.mjs`. Reportó un aviso: el producto `adorno-feliz-ocasiones-papel` tiene tallas fuera de rango. No afecta el funcionamiento general, pero conviene revisar ese dato.

## Registro de auditoría

El proxy administrativo (`functions/api/admin.js`) registra las operaciones de escritura en la tabla `Auditoria` con el identificador del administrador, la acción y el detalle. De esta forma queda una bitácora de quién modificó qué y cuándo.

La bitácora se probó con una operación real mediante `probar-auditoria.mjs`, que inserta una fila con el mismo formato que usa el proxy, la lee de vuelta y la elimina. El resultado fue: inserción HTTP 201, lectura HTTP 200 con la fila encontrada y borrado HTTP 200.

## Casos de prueba

| Caso | Resultado |
|---|---|
| Sintaxis de JavaScript | Correcto |
| Conexión y lectura de la base de datos | Correcto |
| Tabla de cotizaciones presente | Correcto |
| Bitácora de operaciones administrativas | Verificada (inserción, lectura y borrado de una fila de prueba) |
| Integridad del catálogo | Correcto, con un aviso de tallas |

## Limitaciones

La prueba integral de pagos y correo requiere el entorno de prueba de Stripe y Resend, por lo que queda pendiente. La aceptación formal con los responsables de la empresa se registrará en `FORMATO_VALIDACION_EMPRESARIAL.md`.
