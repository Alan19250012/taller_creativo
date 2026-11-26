# Diagramas del sistema · Taller Creativo E K

Diagramas formales del proyecto. Están en formato Mermaid (se renderizan en GitHub, GitLab y VS Code).

## 1. Arquitectura general

```mermaid
flowchart LR
  C[Cliente] -->|HTTPS| CF[Cloudflare Pages]
  CF -->|estáticos HTML/CSS/JS| T[Tienda pública]
  T -->|clave anónima + RLS| SB[(Supabase PostgreSQL + Storage)]
  T -->|/api/checkout · /api/cotizaciones · /api/subir-personalizacion| FN[Pages Functions]
  ADM[Administrador] -->|HTTPS| PA[Panel /admin]
  PA -->|/api/admin · /api/publish| FN
  FN -->|service role| SB
  FN -->|REST| STR[Stripe]
  FN -->|REST| MP[Mercado Pago]
  FN -->|REST| RS[Resend]
  STR -->|webhook firmado| FN
  MP -->|webhook + reconsulta| FN
```

## 2. Modelo entidad-relación (resumen)

```mermaid
erDiagram
  USUARIO ||--o{ PEDIDO : realiza
  PEDIDO ||--|{ DETALLEPEDIDO : contiene
  DETALLEPEDIDO }o--|| PRODUCTO : referencia
  PEDIDO ||--o| FACTURA : genera
  PRODUCTO ||--o{ VARIANTE : tiene
  CATEGORIA ||--o{ PRODUCTO : agrupa
  CATEGORIA ||--o{ SUBCATEGORIA : contiene
  PRODUCTO }o--o{ SUBCATEGORIA : pertenece
  CLIENTE ||--o{ COTIZACION : solicita
  PRODUCTO ||--o{ RESENA : recibe
```

> Nota: el modelo real usa tablas puente para las relaciones muchos-a-muchos (`_CategoriaToProducto`, `_ProductoToSubcategoria`, `_CategoriaToSubcategoria`) y 19 tablas en total. El detalle está en `schema.sql` y `DICCIONARIO_DE_DATOS.md`.

## 3. Flujo de pago con tarjeta (Stripe / Mercado Pago)

```mermaid
sequenceDiagram
  participant C as Cliente
  participant F as Function /api/checkout
  participant SB as Supabase
  participant P as Pasarela
  participant W as Webhook
  C->>F: items (slug, cantidad, talla, color, cupón)
  F->>SB: revalida precios, cupón y envío
  F->>P: crea sesión / preferencia con precios del servidor
  P-->>F: URL de pago
  F-->>C: redirige a la pasarela
  C->>P: paga
  P->>W: notifica el pago (webhook)
  W->>W: verifica firma / reconsulta estado
  W->>SB: crea Pedido + DetallePedido + Factura
  W->>C: envía factura por correo
```

## 4. Flujo de cotización

```mermaid
flowchart LR
  C[Cliente] -->|formulario + imagen| FN[/api/cotizaciones]
  FN --> SB[(tabla Cotizacion · estado PENDIENTE)]
  SB --> PA[Panel admin]
  PA -->|cambia estado| SB
  C -->|WhatsApp| WA[Taller]
  PA -->|aceptada| WA
```

## 5. Publicación del catálogo (SSG + Deploy Hook)

```mermaid
flowchart LR
  A[Admin edita en el panel] -->|POST /api/admin| SB[(Supabase)]
  A -->|click Publicar| PB[/api/publish]
  PB -->|Deploy Hook| CF[Cloudflare Pages]
  CF -->|build/sincronizar-supabase.mjs| SB
  SB -->|regenera| J[ek-data.js · ek-config.js · ek-subcategorias.js · ek-blog-data.js]
```
