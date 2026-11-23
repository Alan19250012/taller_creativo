# Pruebas

## Verificaciones ejecutadas

### Sintaxis de JavaScript

Se ejecutó `node --check` sobre los archivos modificados del backend y del frontend:

- `functions/_lib.js`, `functions/api/*.js`
- `admin/app.js`
- `assets/ek.js`, `assets/ek-personalizador.js`, `assets/ek-foto-editor.js`
- `build/sincronizar-supabase.mjs`

No se encontraron errores de sintaxis.

### Migración de base de datos

Se ejecutó `node migrar-db.mjs`. Todas las instrucciones se aplicaron sin error, incluida la creación de la tabla `Cotizacion` y sus políticas de Row Level Security.

### Verificación de la base de datos

Se ejecutó `node verificar-db.mjs`. El resultado confirma:

- 19 tablas presentes, incluida `Cotizacion`.
- Columnas clave presentes (`imagenes_mini`, `print_area`, `areas_campos`, `imagen` de cotización).
- Datos reales: 100 productos, 22 categorías, 56 subcategorías, 10 banners, 8 artículos, 3 usuarios, 4 cupones.
- Bucket de imágenes `imagenes` público y usuario administrador activo.

### Verificación del catálogo

Se ejecutó `node build/verificar.mjs`. Revisó categorías, subcategorías y pesos de los archivos base. Reportó **1 error**:

- `adorno-feliz-ocasiones-papel`: tallas fuera de rango (2).

Se trata de un dato de catálogo que no afecta el funcionamiento general, pero conviene revisar la lista de tallas de ese producto en el panel.

### Prueba completa del catálogo

`node build/prueba.mjs` no se ejecutó porque requiere la librería `jsdom`, que no está instalada en el entorno. Queda pendiente instalar esa dependencia y volver a correr la prueba.

## Casos de prueba manuales recomendados

Los siguientes flujos requieren navegador y, algunos, credenciales de servicios externos:

- Registro e inicio de sesión de un cliente.
- Agregar un producto con variante al carrito y completar la compra por WhatsApp.
- Personalizar un producto, subir una foto y generar la vista previa.
- Enviar una solicitud de cotización desde `contacto.html` y verla en el panel.
- Cambiar el estado de una cotización y verificar que se guarda.
- Crear una sesión de Stripe Checkout y recibir el webhook (requiere entorno de prueba de Stripe).

## Pruebas pendientes

- Pruebas funcionales automatizadas (end-to-end) con un navegador.
- Pruebas de seguridad: límite de intentos de login, validación de cabeceras y de subida de archivos.
- Pruebas de usabilidad en dispositivos móviles.
- Prueba integral de pagos y correo en el entorno de prueba de Stripe y Resend.

## Errores encontrados y correcciones

El único aviso pendiente es el de las tallas del producto `adorno-feliz-ocasiones-papel`.
