# Cálculos matemáticos del sistema

## Cálculo del carrito

El motor de la tienda (`assets/ek.js`) calcula los importes de la compra con las siguientes operaciones:

- Subtotal: suma del precio unitario por la cantidad de cada línea.
- Descuento por cupón: si el cupón es de porcentaje, se aplica sobre el subtotal; si es de monto fijo, se resta ese valor; si es de envío, se elimina el costo de envío.
- Envío gratis: el envío se condona cuando el subtotal alcanza el umbral configurado (`envioGratisDesde`).
- Total: subtotal menos descuento más envío.

## Ubicación de texto y foto en el personalizador

La posición de cada campo se guarda en porcentajes respecto a la imagen del producto. Para dibujarlo se convierte a píxeles:

- `px = (x / 100) × ancho de la imagen`
- `py = (y / 100) × alto de la imagen`
- `pw = (ancho / 100) × ancho de la imagen`
- `ph = (alto / 100) × alto de la imagen`

Esto hace que el diseño conserve su proporción aunque la imagen se muestre en distintos tamaños.

## Ajuste de texto

El personalizador reduce el tamaño de fuente de forma iterativa hasta que el texto cabe en el área disponible. En cada intento mide el ancho del texto con `measureText`, lo parte en líneas y comprueba que la altura total (número de líneas por el interlineado) no supere el alto del área. El interlineado se calcula como `tamaño × 1.28`.

## Prueba de ejemplo

Para verificar el cálculo del carrito: un producto de $500 con dos piezas da un subtotal de $1,000; un cupón de 10% resta $100 y deja $900; si el envío es de $120 y el umbral de envío gratis es $999, al aplicar el descuento el total queda en $900 + $120 = $1,020. Este tipo de comprobación se registra en `docs/PRUEBAS.md` como caso manual.
