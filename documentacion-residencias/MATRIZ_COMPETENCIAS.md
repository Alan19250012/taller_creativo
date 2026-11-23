# Matriz de evaluación del Perfil de Egreso

Escala: Cumple (1.0), Cumple parcialmente (0.5), No cumple (0).

| # | Competencia | Estado | Evidencia principal |
|---|---|---|---|
| 1 | Redes de cómputo y comunicaciones | Cumple parcialmente | `COMUNICACIONES_Y_RED.md`: uso y configuración de HTTPS, DNS, CDN y REST (la parte de comunicaciones, no la de administración de redes) |
| 2 | Administración de proyectos TIC | Cumple | `REQUERIMIENTOS_Y_CRONOGRAMA.md`, historial de Git, `HANDOVER.md` |
| 3 | Sistemas de información | Cumple | Panel administrativo, backend Functions, catálogo, cotizaciones, bitácora |
| 4 | Bases de datos | Cumple | `schema.sql`, `DICCIONARIO_DE_DATOS.md`, RLS |
| 5 | Integración de sistemas de comunicación | Cumple | Stripe, Resend, WhatsApp, Supabase Storage |
| 6 | Consultoría y auditoría | Cumple | `DIAGNOSTICO_EMPRESARIAL.md`, `AUDITORIA.md`, `VALIDACION_TECNICA.md`, bitácora verificada |
| 7 | Creación de empresas TIC | No cumple | El proyecto es para una empresa existente; `VIABILIDAD_ECONOMICA.md` documenta el análisis, pero no equivale a crear una empresa |
| 8 | Arquitectura HW / plataformas de software | Cumple | `ENTORNO_Y_PLATAFORMAS.md`, `DEPLOY.md` |
| 9 | Seguridad informática | Cumple | JWT, RLS, bcrypt, HMAC, lista blanca, secretos en entorno |
| 10 | Legislación informática | Cumple | Aviso de privacidad publicado en `politicas.html` |
| 11 | Software embebido | No cumple | No hay dispositivos con firmware |
| 12 | Tecnologías emergentes y herramientas actuales | Cumple | Serverless, Supabase, Stripe, WebCrypto |
| 13 | Interfaces gráficas de usuario | Cumple | `ek.css`, `ek.js`, editor de fotos, panel |
| 14 | Investigación | Cumple | `INVESTIGACION.md`, `DECISIONES_TECNICAS.md` |
| 15 | Herramientas matemáticas | Cumple | `MATEMATICAS.md`, cálculo del carrito y del personalizador |
| 16 | Legal, ético y sustentable | Cumple | `ASPECTOS_LEGALES_ETICOS.md` |

## Resultado

- Cumple: 13 competencias (13.0 puntos).
- Cumple parcialmente: 1 competencia (0.5 puntos).
- No cumple: 2 competencias (0 puntos).

**Puntuación: 13.5 / 16 = 84.4%.**

## Clasificación de evidencias

- Demostradas con desarrollo de software: 3, 4, 5, 9, 12, 13.
- Demostradas con integración tecnológica: 5, 9.
- Demostradas con administración de plataformas: 8.
- Demostradas con seguridad implementada: 9, 10.
- Demostradas con investigación y documentación: 2, 14, 15, 16.
- Demostradas con consultoría, auditoría y análisis: 6.
- Demostrada parcialmente (solo comunicaciones): 1.
- No corresponden al alcance: 7, 11.

## Nota sobre la competencia 7

El análisis de viabilidad económica (`VIABILIDAD_ECONOMICA.md`) es documentación útil para la defensa, pero no demuestra la creación de una empresa de TIC, por lo que la competencia se mantiene como no cumplida. No se marcó como parcial para no inflar la matriz.
