# Consultoría y auditoría del sistema

## Análisis del proceso comercial anterior

Antes del sistema, el taller atendía pedidos y cotizaciones por WhatsApp y redes sociales. Las solicitudes se registraban de forma manual o se perdían entre conversaciones, sin un lugar donde consultar el historial de un cliente ni el estado de una cotización. El catálogo dependía de enviar fotos por mensaje.

## Problemas identificados

- Las cotizaciones no quedaban registradas ni se les daba seguimiento por estado.
- No existía un historial de pedidos por cliente.
- El catálogo no estaba disponible para que el cliente lo consultara por su cuenta.
- La administración dependía por completo de la memoria y de los mensajes.

## Levantamiento de requerimientos

A partir de ese diagnóstico se definieron los requerimientos funcionales y no funcionales que se describen en `REQUERIMIENTOS_Y_CRONOGRAMA.md`. El módulo de cotizaciones se diseñó para reflejar el flujo real del taller: el cliente indica producto, cantidad, materiales, medidas y una imagen de referencia, y el personal cambia el estado de la solicitud hasta aceptarla o rechazarla.

## Evaluación del sistema desarrollado

Se realizaron revisiones del código, de la base de datos y de la documentación. Se ejecutaron verificaciones de sintaxis, de migración y de integridad de la base de datos (`verificar-db.mjs`), cuyos resultados están en `docs/PRUEBAS.md`. La auditoría detectó y corrigió la documentación desactualizada y la ausencia del módulo de cotizaciones.

## Comparación del proceso anterior y el propuesto

| Aspecto | Antes | Con el sistema |
|---|---|---|
| Catálogo | Fotos por WhatsApp | Tienda con filtros y buscador |
| Cotizaciones | Mensajes sueltos | Registro con estado e imagen |
| Pedidos | Sin historial | Registro por cliente |
| Pago | Solo transferencia o efectivo | Tarjeta y WhatsApp |

## Validación con la empresa

La validación formal del sistema con los responsables de Taller Creativo E K queda pendiente de realizarse de manera presencial o por videollamada, y debe registrarse como evidencia antes de la presentación final.
