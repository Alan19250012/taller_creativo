/* ============================================================================
   TALLER CREATIVO EK · BLOG  (assets/ek-blog.js)
   ----------------------------------------------------------------------------
   Contenido del blog + el motor que lo pinta. Se carga en TODAS las páginas
   ANTES de assets/ek.js, que llama a window.EK_BLOG_INIT() al arrancar.
     · #ek-blog-lista → rejilla .ek-grid.ek-grid--3 con buscador y chips
     · #ek-blog-post  → artículo completo (blog-articulo.html?p=<slug>)
     · #ek-blog-home  → los 3 posts más recientes (index.html)
   Sin dependencias, sin backend: 100 % front-end.
   ========================================================================== */
(function () {
  "use strict";

  var MARCA = "Taller Creativo EK";

  /* ======================= UTILIDADES ======================= */
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function param(k) {
    try { return new URLSearchParams(location.search).get(k) || ""; } catch (e) { return ""; }
  }

  /* ======================= IMÁGENES (misma lógica del sitio) =======================
     Respeta assets/ek-imagenes.js: si ya subiste img/blog/<slug>-1.webp la usa,
     si no, trae una foto externa. Nunca deja una imagen rota.                  */
  function hotBlog(p, i, size) {
    var C = window.EK_CONFIG || { hotlink: { base: "https://loremflickr.com" } };
    return C.hotlink.base + "/" + size + "/" + size + "/" + encodeURIComponent(p.kw) + "?lock=" + (i + 37 + p.s.length * 13);
  }
  function localBlog(p, i) {
    var C = window.EK_CONFIG || {};
    var L = window.EK_IMG_LOCAL || {};
    return "img/blog/" + p.s + "-" + (i + 1) + "." + (L.ext || C.extImagenes || "webp");
  }
  function img(p, i, size) {
    var C = window.EK_CONFIG || { modoImagenes: "auto" };
    var L = window.EK_IMG_LOCAL || { blog: {} };
    var modo = C.modoImagenes || "auto";
    if (modo === "hotlink") return hotBlog(p, i, size);
    var a = L.blog && L.blog[p.s];
    if (a && a.indexOf(i + 1) > -1) return localBlog(p, i);
    return modo === "local" ? localBlog(p, i) : hotBlog(p, i, size);
  }
  function imgTag(p, i, size, alt, w, h, cls) {
    return '<img src="' + img(p, i, size) + '" data-hotlink="' + hotBlog(p, i, size) + '" alt="' + esc(alt || p.t) + '" loading="lazy" decoding="async" ' +
      'width="' + (w || size) + '" height="' + (h || size) + '" class="' + (cls || "") + '" onerror="EK_imgSwap(this)">';
  }
  function waLink(txt) {
    var n = (window.EK_CONFIG && window.EK_CONFIG.whatsapp) || "525562208987";
    return "https://wa.me/" + n + (txt ? "?text=" + encodeURIComponent(txt) : "");
  }
  function urlPost(p) { return location.href.split("#")[0].split("?")[0] + "?p=" + p.s; }

  /* ======================= CONTENIDO ======================= */
  window.EK_BLOG = {
    posts: [

      /* ---------------------------------------------------------------- 1 */
      {
        s: "como-montar-nacimiento-navideno-mdf",
        t: "Cómo montar un nacimiento navideño en MDF paso a paso",
        r: "Del trazo a la mesa: qué piezas lleva un nacimiento en MDF, cómo acomodarlas, cómo iluminarlo y cómo guardarlo para que te dure muchos diciembres.",
        f: "22 de noviembre de 2025",
        a: "Taller Creativo EK",
        c: "Navidad",
        kw: "christmas,nativity,decor",
        min: 5,
        h: `<p>Armar el nacimiento es, para muchísimas familias mexicanas, el momento en el que de verdad empieza la Navidad. En el taller lo vivimos cada año: hay quien nos pide una sola pieza para completar el nacimiento de la abuela y hay quien estrena el conjunto completo en MDF. La ventaja del material es clara: pesa poco, se corta con precisión milimétrica, no se astilla como la madera maciza y aguanta el ajetreo de subir y bajar del clóset temporada tras temporada. Aquí te contamos cómo lo montamos nosotros y cómo puedes montar el tuyo en casa sin batallar.</p>

<h2>Paso 1. Define tamaño y lugar antes de comprar</h2>
<p>El error más común es comprar las figuras primero y buscarles espacio después. Mide la superficie donde va a vivir el nacimiento —mesa de centro, repisa, recibidor o la base del árbol— y decide desde ahí. Como regla general: en una mesa de centro, entre 60 y 90 cm de ancho total se ve generoso sin estorbar; en una repisa angosta conviene un formato de 40 a 50 cm con figuras de 10 a 15 cm de alto.</p>
<ul>
<li><strong>Establo o portal:</strong> ancla la escena, va al centro y define el estilo (rústico, minimalista o tradicional).</li>
<li><strong>Figuras principales:</strong> Niño Jesús, María y José. Son las más grandes y las que más se ven.</li>
<li><strong>Figuras secundarias:</strong> ángel, pastores, ovejas, buey y burro. Van alrededor, sin tapar a las principales.</li>
<li><strong>Reyes Magos:</strong> pueden ir en el mismo conjunto o venir de camino por otra repisa hasta el 6 de enero.</li>
<li><strong>Base o piso:</strong> un corte rectangular pintado de blanco, azul noche o acabado madera ayuda a que el conjunto se vea intencional y no regado.</li>
</ul>
<p>Si vas a montar sobre una superficie que se limpia seguido, pide las piezas con acabado sellado. El DTF UV que aplicamos en el taller deja una película resistente a la humedad, así que puedes pasar un trapo húmedo sin miedo.</p>

<h2>Paso 2. Arma el establo y la base</h2>
<p>Trabaja de abajo hacia arriba: primero la base, luego el establo y al final las figuras. Si tu establo viene en varias piezas (frente, laterales y techo), ármalo en el piso antes de subirlo a la mesa; así detectas de inmediato si algún ensamble necesita una pasada de lija.</p>
<p>Ya armado, revisa que quede a plomo. Un truco: párate a dos metros, cierra un ojo y mira el conjunto completo. Si el techo se ve inclinado o alguna figura parece flotar, corrígelo antes de pegar nada. Nosotros recomendamos no pegar las piezas entre sí: así puedes cambiar la composición cada año y guardarlas planas, que es como mejor se conservan.</p>

<h2>Paso 3. Acomoda las figuras respetando la jerarquía</h2>
<p>Un nacimiento se lee como una escena, no como una colección de piezas. La mirada debe caer primero en el Niño Jesús, después en María y José, luego en el ángel y al final en pastores y animales.</p>
<ul>
<li>Deja al Niño Jesús al centro y ligeramente adelante del establo, nunca escondido al fondo.</li>
<li>Coloca a María y José a los lados, inclinados hacia el centro.</li>
<li>Pon al ángel arriba o detrás, sin tapar al Niño.</li>
<li>Usa pastores y ovejas para cerrar la escena por los costados.</li>
</ul>
<blockquote>Un nacimiento bonito no es el que tiene más figuras, sino el que se entiende de un vistazo. Si dudas, quita una pieza: casi siempre sobra.</blockquote>

<img src="${img({ s: "como-montar-nacimiento-navideno-mdf", kw: "christmas,nativity,decor" }, 1, 900)}" data-hotlink="${hotBlog({ s: "como-montar-nacimiento-navideno-mdf", kw: "christmas,nativity,decor" }, 1, 900)}" alt="Nacimiento navideño de MDF pintado a mano con figuras y luces cálidas" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

<p>Y si hay niños en casa, dales permiso de mover las figuras. Los nacimientos que más se disfrutan son los que se tocan y se reacomodan, y trabajamos el MDF con bordes lijados justo para eso.</p>

<h2>Paso 4. Ilumina y da el acabado final</h2>
<p>La luz cambia por completo el resultado. Una tira LED cálida, de 2700 a 3000 K, escondida detrás del establo da esa sensación de resplandor que ningún foco directo logra. Evita las luces frías y los colores intermitentes: cansan la vista y compiten con las figuras.</p>
<p>Si quieres un efecto más logrado, agrega una segunda fuente de luz muy tenue por un costado: genera sombras suaves que dan volumen a las siluetas de MDF, sobre todo cuando son de una sola cara. Y no olvides el detalle final: una tela o camino de mesa en tono neutro debajo del nacimiento hace que todo se vea de revista.</p>

<h2>Cómo guardarlo para que dure muchos diciembres</h2>
<ul>
<li>Envuelve cada figura en papel seda o plástico burbuja; nunca sueltas en la caja.</li>
<li>Guarda las piezas planas y sin peso encima: el MDF resiste, pero se deforma con humedad y presión constante.</li>
<li>Evita el garage si hay humedad; un clóset interior es mejor.</li>
<li>Etiqueta la caja con el año para saber qué piezas tienes y cuáles faltan.</li>
</ul>
<p>¿Quieres tu nacimiento completo, la figura que le falta a tu colección o un establo a la medida de tu mesa? En <strong>Taller Creativo EK</strong> cortamos y personalizamos cada pieza y te mandamos vista previa antes de producir. Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> con una foto del espacio donde lo vas a poner y te decimos qué tamaño te conviene; también puedes apartar desde nuestro <a href="tienda.html">catálogo en línea</a>, porque en noviembre y diciembre la producción se llena muy rápido.</p>`
      },

      /* ---------------------------------------------------------------- 2 */
      {
        s: "porta-uvas-ano-nuevo-tradicion-12-uvas",
        t: "Porta uvas de Año Nuevo: historia, tradición de las 12 uvas y cómo personalizarlo",
        r: "De dónde viene la costumbre de las 12 uvas, por qué un porta uvas cambia la mesa de Año Nuevo y cómo personalizarlo para tu familia o tu negocio.",
        f: "15 de noviembre de 2025",
        a: "Taller Creativo EK",
        c: "Año Nuevo",
        kw: "newyear,grapes,party",
        min: 4,
        h: `<p>A las doce campanadas, en México nadie discute: doce uvas, una por cada mes del año que empieza. La costumbre es tan fuerte que ya es parte del menú de la cena, junto al pavo, los tamales y el champurrado. Y como todo lo que se repite cada año, merece un objeto bonito que lo acompañe. De eso va este artículo: de la historia de la tradición y de por qué un porta uvas personalizado se volvió uno de los regalos más pedidos en el taller.</p>

<h2>De dónde viene la tradición de las 12 uvas</h2>
<p>La costumbre nació en España a finales del siglo XIX y se popularizó a partir de 1909, cuando una cosecha enorme de uva en Alicante llevó a los comerciantes a promoverla como una forma de vender el excedente. La idea era sencilla: comer una uva por campanada y recibir el año con suerte. De ahí saltó a Latinoamérica y en México se adoptó con entusiasmo, sobre todo a partir de los años cincuenta, cuando la radio y la televisión transmitían las campanadas en vivo.</p>
<p>Hoy conviven varias versiones. Unos piden un deseo por uva; otros asignan un mes a cada una y piden por ese mes en específico; los más organizados anotan los deseos en un papelito antes de la cena. Sea cual sea tu versión, el ritual se disfruta más cuando hay dónde ponerlas: nadie quiere estar cargando un plato hondo mientras suenan las campanadas.</p>

<h2>Por qué un porta uvas y no un plato cualquiera</h2>
<p>Un porta uvas hace tres cosas al mismo tiempo: mantiene las uvas limpias y a la mano, ordena la mesa y se convierte en el adorno del centro. Los nuestros se cortan en MDF y se imprimen con DTF UV, así que el diseño va sobre la superficie con acabado brillante y resistente a la humedad del lavado. Además:</p>
<ul>
<li><strong>Queda listo desde antes:</strong> pones las 12 uvas y lo dejas en la mesa hasta la hora cero.</li>
<li><strong>Evita accidentes:</strong> con la emoción de las campanadas el plato siempre termina en el piso.</li>
<li><strong>Se vuelve tradición:</strong> lo sacas cada 31 de diciembre y ya es parte de la fiesta.</li>
<li><strong>Es un regalo útil:</strong> con el nombre de la familia o del negocio, funciona como detalle de fin de año.</li>
</ul>

<img src="${img({ s: "porta-uvas-ano-nuevo-tradicion-12-uvas", kw: "newyear,grapes,party" }, 1, 900)}" data-hotlink="${hotBlog({ s: "porta-uvas-ano-nuevo-tradicion-12-uvas", kw: "newyear,grapes,party" }, 1, 900)}" alt="Porta uvas de MDF personalizado con uvas para la cena de Año Nuevo" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

<h2>Cómo personalizar tu porta uvas</h2>
<p>La personalización es lo que lo hace tuyo. Lo más pedido es el apellido de la familia, el año que entra y una frase corta. Si es para un negocio, va el logo y el clásico "Feliz Año Nuevo de parte de todo el equipo". Si es para una boda o un evento, se puede poner la fecha y los nombres de los novios.</p>
<ul>
<li><strong>Texto corto y grande:</strong> se lee mejor a distancia y no satura la pieza.</li>
<li><strong>Paleta de color:</strong> dorado y negro para un look elegante; rojo y verde si quieres algo más mexicano.</li>
<li><strong>Dos caras:</strong> el frente con el diseño y la parte de atrás con un mensaje personal.</li>
<li><strong>Pie de mesa:</strong> si lo quieres de pie, no acostado, te lo entregamos con base.</li>
</ul>
<blockquote>El detalle que más nos agradecen los clientes no es el diseño, es que las uvas ya estén servidas y contadas antes de que empiece la cuenta regresiva.</blockquote>

<h2>Ideas para servirlo y no batallar en la cena</h2>
<p>Sirve las uvas lavadas y secas, sin tallo, para que se coman de un bocado. Si tu familia es grande, arma varios porta uvas iguales y reparte uno por mesa: se ven increíbles en línea y nadie se queda sin sus doce. Y si vas a brindar con sidra o champán, colócalos junto a las copas para que el momento sea continuo.</p>
<p>Un consejo extra: guarda la pieza en su bolsa o caja durante el año, lejos de la humedad, y te va a durar muchísimos 31 de diciembre. El MDF bien cuidado no se dobla ni pierde el color.</p>
<p>¿Quieres tu porta uvas personalizado para esta cena de Año Nuevo? Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> con el nombre, el año y el color que quieres, y te mandamos la vista previa antes de producir. También puedes ver los diseños disponibles en nuestro <a href="tienda.html">catálogo</a> y apartar con tiempo, porque en diciembre los pedidos personalizados se saturan.</p>`
      },

      /* ---------------------------------------------------------------- 3 */
      {
        s: "decoracion-dia-de-muertos-mdf-calaveritas",
        t: "Decoración de Día de Muertos con MDF: calaveritas, catrinas y ofrenda",
        r: "Cómo armar una ofrenda con piezas de MDF: calaveritas, catrinas, papel picado rígido y letreros, con ideas para pintarlas en familia.",
        f: "25 de octubre de 2025",
        a: "Taller Creativo EK",
        c: "Día de Muertos",
        kw: "dayofthedead,catrina,skull",
        min: 5,
        h: `<p>El Día de Muertos es la fecha en la que más nos piden piezas decorativas en el taller, y tiene todo el sentido: es una celebración de casa, de familia y de recordar a quien ya no está. El MDF funciona perfecto para esta temporada porque se puede cortar en siluetas muy detalladas —calaveritas, catrinas, papel picado rígido, letreros con nombres— y se pinta con facilidad. Te compartimos cómo armar una ofrenda completa y cómo sacarle el máximo a tus piezas.</p>

<h2>La ofrenda: qué no puede faltar</h2>
<p>La ofrenda tradicional tiene niveles y cada elemento tiene un significado. No hay una sola forma correcta de armarla, pero esta base nunca falla:</p>
<ul>
<li><strong>Agua:</strong> para calmar la sed del que llega después del camino largo.</li>
<li><strong>Sal y velas o veladoras:</strong> la sal purifica y la luz guía el regreso.</li>
<li><strong>Cempasúchil:</strong> su color y su olor marcan el camino.</li>
<li><strong>Comida y bebida favoritas:</strong> lo que le gustaba a la persona recordada.</li>
<li><strong>Pan de muerto y calaveritas de azúcar:</strong> el toque dulce de la temporada.</li>
<li><strong>Foto de la persona:</strong> el centro emocional de todo el altar.</li>
<li><strong>Papel picado:</strong> representa el viento y le da movimiento a la ofrenda.</li>
</ul>
<p>Ahí es donde entran las piezas de MDF: sustituyen o complementan el papel picado con algo que no se rompe con el viento ni se transparenta con la humedad, y que puedes volver a usar cada año.</p>

<h2>Calaveritas y catrinas en MDF: dónde colocarlas</h2>
<p>Las calaveritas pequeñas, de 10 a 15 cm, quedan perfectas intercaladas entre las veladoras o colgadas del borde de la mesa. Las catrinas grandes, de 40 cm o más, funcionan como pieza principal: una a cada lado de la foto o una sola al centro detrás del altar. Los letreros con el nombre y la frase "en memoria de" se colocan al frente, en el nivel de abajo.</p>
<p>Si tu altar es de varios niveles, respeta una regla sencilla: piezas grandes atrás y arriba, piezas pequeñas adelante y abajo. Así la ofrenda se ve ordenada y nada tapa la fotografía.</p>

<img src="${img({ s: "decoracion-dia-de-muertos-mdf-calaveritas", kw: "dayofthedead,catrina,skull" }, 1, 900)}" data-hotlink="${hotBlog({ s: "decoracion-dia-de-muertos-mdf-calaveritas", kw: "dayofthedead,catrina,skull" }, 1, 900)}" alt="Ofrenda de Día de Muertos con calaveritas y catrinas de MDF pintadas" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

<h2>Cómo pintar tus calaveritas en casa</h2>
<p>Pintar las piezas en familia es de las mejores partes de la temporada, sobre todo si hay niños. Te dejamos el proceso que mejor resultado da:</p>
<ul>
<li><strong>Lija suave primero:</strong> una pasada de lija fina por los bordes deja la superficie lista para recibir la pintura.</li>
<li><strong>Base blanca o negra:</strong> dos capas delgadas cubren mejor que una gruesa y evitan que la pieza se hinche.</li>
<li><strong>Colores vivos encima:</strong> rosa mexicano, naranja, morado y turquesa son los clásicos.</li>
<li><strong>Detalles finos al final:</strong> los contornos y las flores pequeñas se hacen con pincel de punta fina o con marcador acrílico.</li>
<li><strong>Sellador:</strong> una capa de barniz mate o brillante protege el trabajo y facilita la limpieza.</li>
</ul>
<blockquote>Si vas a pintar con niños, prepara la mesa con periódico, un vaso de agua por persona y trapos húmedos. La diferencia entre una tarde divertida y un reguero es la organización previa.</blockquote>

<h2>Un altar que se guarda y se vuelve a armar</h2>
<p>Una ventaja enorme de las piezas de MDF es que se guardan planas y ocupan poquísimo espacio. Al terminar la temporada, envuelve cada pieza en papel seda, mételas en una caja rígida y guárdala en un lugar seco. El año siguiente armas la ofrenda en la mitad del tiempo y con las mismas piezas en buen estado.</p>
<p>Si quieres un altar distinto cada año, basta con cambiar dos o tres piezas: un letrero nuevo, una catrina de otro tamaño o un papel picado rígido con otro diseño. Con eso la ofrenda se siente renovada sin gastar de más.</p>
<p>¿Necesitas calaveritas, catrinas o un letrero con el nombre de tu familiar? Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> y te cotizamos al momento, con opción de piezas ya pintadas o en blanco para que las pintes en casa. También puedes revisar los diseños de temporada en nuestro <a href="tienda.html">catálogo en línea</a>.</p>`
      },

      /* ---------------------------------------------------------------- 4 */
      {
        s: "osos-de-graduacion-para-firmar-guia-completa",
        t: "Osos de graduación para firmar: la guía completa para grupos escolares",
        r: "Cuántos osos necesitas, de qué tamaño pedirlos, cómo organizar la firma el día del evento y qué personalizar. Guía práctica para escuelas y grupos.",
        f: "12 de septiembre de 2025",
        a: "Taller Creativo EK",
        c: "Graduación",
        kw: "graduation,bear,student",
        min: 6,
        h: `<p>Cada generación busca un recuerdo que no se repita, y en los últimos años el oso de graduación para firmar se volvió el favorito. La idea es simple y funciona: un oso rígido, cortado en MDF, que se va lleno de mensajes, firmas y dedicatorias de compañeros y maestros. Al final no es un adorno, es un objeto con la letra de todos los que estuvieron ahí. Aquí va la guía completa para pedirlos bien desde la primera vez.</p>

<h2>Qué es un oso de graduación para firmar</h2>
<p>Es una figura de oso cortada en MDF, normalmente de 30 a 60 cm de alto, con la base pintada o impresa con el nombre del graduado, la generación, la escuela y el año. La superficie lisa y clara es lo que permite firmarlo con marcador permanente o pluma de gel metálica. Se entrega con un pin o llavero extra cuando aplica la promoción de temporada.</p>
<ul>
<li><strong>Material:</strong> MDF de 3 a 6 mm, lijado en los bordes para que se pueda tomar sin astillas.</li>
<li><strong>Acabado:</strong> base blanca o negra con el diseño impreso en DTF UV, que no se despinta al escribir encima.</li>
<li><strong>Tamaños típicos:</strong> 30 cm para secundaria y primaria, 45 cm para bachillerato, 60 cm para universidad.</li>
<li><strong>Extras:</strong> base de madera para que se pare solo, cordón para colgarlo o llavero a juego.</li>
</ul>

<h2>Cuántos osos necesitas</h2>
<p>Esta es la pregunta que más nos hacen y la respuesta depende de cómo se organiza el grupo. Lo más común es que cada graduado tenga su propio oso y que sus compañeros lo firmen durante el evento. Otra variante es un oso por grupo, que se firma entre todos y se queda en el salón de clases o en la dirección de la escuela.</p>
<p>Cuenta así: número de graduados, más dos o tres de reserva por si alguien se suma a última hora o alguna pieza se maltrata en el evento. Si el grupo es de más de 40 personas, vale la pena dividir los pedidos por salón para que la entrega sea ordenada.</p>

<img src="${img({ s: "osos-de-graduacion-para-firmar-guia-completa", kw: "graduation,bear,student" }, 1, 900)}" data-hotlink="${hotBlog({ s: "osos-de-graduacion-para-firmar-guia-completa", kw: "graduation,bear,student" }, 1, 900)}" alt="Osos de graduación de MDF personalizados listos para firmar" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

<h2>Qué poner en el oso: ideas de personalización</h2>
<ul>
<li><strong>Nombre completo del graduado</strong> en la parte de abajo, con letra grande y legible.</li>
<li><strong>Generación y año:</strong> por ejemplo "Generación 2023-2026".</li>
<li><strong>Nombre de la escuela o del plantel.</strong></li>
<li><strong>Carrera o especialidad,</strong> si es bachillerato técnico o universidad.</li>
<li><strong>Frase corta:</strong> "Lo logramos", "Con todo mi cariño", "El esfuerzo valió la pena".</li>
<li><strong>Color del birrete o del listón</strong> en el tono de la escuela.</li>
</ul>
<blockquote>Antes de mandar a producir, confirma la lista de nombres con la escuela. Un nombre mal escrito en 60 piezas es un problema que se evita con una sola revisión.</blockquote>

<h2>Cómo organizar la firma el día del evento</h2>
<p>La logística es lo que hace la diferencia entre una actividad bonita y un caos. Reparte los osos al inicio de la ceremonia social, no al final, y acomódalos en mesas por grupo. Deja marcadores suficientes —dos por mesa, de punta fina y permanente— y un letrero que explique qué escribir: un mensaje corto, una firma y el año.</p>
<ul>
<li>Pide a los maestros que firmen primero; así se rompe el hielo y nadie se queda sin espacio.</li>
<li>Reserva una zona del oso solo para firmas: la cara y el diseño no se tocan.</li>
<li>Ten una caja o bolsa por graduado para guardar el oso al terminar.</li>
<li>Nombra a dos personas responsables de la entrega y el resguardo.</li>
</ul>

<h2>Tiempos de producción y mayoreo</h2>
<p>En temporada de graduaciones —mayo, junio y julio, y de nuevo en noviembre y diciembre— la producción se llena. Nuestro tiempo estándar para un pedido personalizado es de 3 a 7 días hábiles, pero en grupos de más de 30 piezas conviene apartar con dos o tres semanas de anticipación. Manejamos precio de mayoreo para escuelas, empresas y grupos grandes, y trabajamos con anticipo y saldo contra entrega.</p>
<p>¿Listo para cotizar los osos de tu generación? Mándanos por WhatsApp al <strong>+52 556 220 8987</strong> la cantidad, el tamaño y la lista de nombres, y te enviamos la vista previa de diseño antes de producir. También puedes ver modelos y acabados en nuestro <a href="tienda.html">catálogo en línea</a> y combinarlo con llaveros o pines para el resto del grupo.</p>`
      },

      /* ---------------------------------------------------------------- 5 */
      {
        s: "ideas-recuerdos-para-bodas-cilindros-e-iniciales",
        t: "Ideas de recuerdos para bodas: cilindros con iniciales, números de mesa y más",
        r: "Cilindros con iniciales, números de mesa, letreros y detalles que tus invitados se llevan a casa. Cómo calcular cantidades, tiempos y presupuesto.",
        f: "20 de agosto de 2025",
        a: "Taller Creativo EK",
        c: "Bodas",
        kw: "wedding,favors,decoration",
        min: 5,
        h: `<p>Los recuerdos de boda cumplen una función muy específica: que el invitado llegue a su casa y se acuerde de ustedes. Un detalle bien elegido se queda años en una repisa; uno genérico termina en el cajón. En el taller hemos armado recuerdos para cientos de eventos y estas son las ideas que mejor funcionan, con números reales para que calcules sin sorpresas.</p>

<h2>Cilindros con iniciales: el clásico que nunca falla</h2>
<p>El cilindro de MDF con las iniciales de los novios es el recuerdo más pedido por una razón sencilla: se ve elegante, se personaliza fácil y sirve para algo. Puede ir como centro de mesa, como recuerdo individual o como base para una vela. Los acabados más solicitados son blanco mate con iniciales en dorado, negro con letras blancas y madera natural con vinil oscuro.</p>
<ul>
<li><strong>Una inicial por invitado:</strong> el recuerdo se siente hecho para esa persona.</li>
<li><strong>Las dos iniciales juntas:</strong> funciona mejor si el cilindro es un adorno y no un obsequio individual.</li>
<li><strong>Con fecha y lugar:</strong> agrega la fecha de la boda en letra pequeña al frente.</li>
<li><strong>Con vela o suculenta:</strong> se convierte en un detalle útil desde el primer día.</li>
</ul>
<p>El detalle que marca la diferencia es la coherencia. Si tu paleta es blanco, verde salvia y dorado, pide los cilindros, los números de mesa y el letrero de bienvenida con exactamente los mismos tonos. Cuando todo el evento comparte el mismo lenguaje visual, hasta las fotografías se ven más profesionales, y no cuesta más caro: cuesta lo mismo bien coordinado que mal coordinado.</p>

<h2>Números de mesa y letreros que ordenan el evento</h2>
<p>Los números de mesa en MDF son de esas cosas que nadie nota cuando están bien y todos notan cuando faltan. Además de cumplir su función, ordenan la estética del salón. Se hacen en series completas, del 1 al número de mesas, con el mismo diseño que la invitación o el menú.</p>
<p>Complementa con un letrero de bienvenida grande, el seating chart con los nombres y las letras gigantes de las iniciales para el photo booth. Todo se corta en el mismo material y con la misma paleta, y eso hace que el evento se vea coherente en las fotos.</p>

<img src="${img({ s: "ideas-recuerdos-para-bodas-cilindros-e-iniciales", kw: "wedding,favors,decoration" }, 1, 900)}" data-hotlink="${hotBlog({ s: "ideas-recuerdos-para-bodas-cilindros-e-iniciales", kw: "wedding,favors,decoration" }, 1, 900)}" alt="Recuerdos de boda en MDF con cilindros, iniciales y números de mesa" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

<h2>Otros recuerdos que se van a casa con tus invitados</h2>
<ul>
<li><strong>Portavasos personalizados:</strong> útiles, económicos y se pueden hacer en serie grande.</li>
<li><strong>Llaveros con iniciales o con la fecha:</strong> el detalle más práctico para bodas numerosas.</li>
<li><strong>Cajitas para dulces:</strong> en MDF o acrílico, con el nombre de los novios en la tapa.</li>
<li><strong>Etiquetas para el recuerdo comestible:</strong> si regalan algo de comer o beber, la etiqueta personalizada hace toda la diferencia.</li>
<li><strong>Marcos de fotos pequeños:</strong> quedan perfectos para una foto instantánea que el invitado se lleva en el momento.</li>
</ul>
<p>Un consejo de presupuesto: define primero el recuerdo principal y ajusta el resto alrededor de él. Un cilindro bien hecho vale más que cinco detalles distintos que nadie recuerda. Si el presupuesto es limitado, invierte en las piezas que se van a casa con el invitado y simplifica la decoración del salón.</p>

<h2>Cómo calcular cantidades y tiempos</h2>
<p>La regla base para recuerdos individuales es contar entre el 85 y el 90 por ciento de los invitados confirmados: siempre hay quien no llega. Para piezas de decoración, en cambio, cuenta por mesa o por espacio, no por persona.</p>
<p>Sobre los tiempos: los personalizados tardan de 3 a 7 días hábiles, y en temporada alta —mayo, junio, noviembre y diciembre— conviene apartar con tres o cuatro semanas. Si el pedido es de más de 100 piezas, mejor cuatro semanas para poder revisar muestras y ajustar detalles sin prisas.</p>
<blockquote>Pide siempre una pieza de muestra antes de producir el total. Ver el cilindro terminado en tu paleta de colores evita sorpresas y es la mejor decisión que puedes tomar en todo el proceso.</blockquote>

<p>¿Estás armando los recuerdos de tu boda? Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> con la fecha del evento, el número de invitados y una foto de referencia del estilo que te gusta; te mandamos propuesta con precios de mayoreo. En nuestro <a href="tienda.html">catálogo en línea</a> puedes ver acabados y combinar varios detalles del mismo diseño.</p>`
      },

      /* ---------------------------------------------------------------- 6 */
      {
        s: "que-es-el-dtf-uv-y-por-que-dura-mas",
        t: "Qué es el DTF UV y por qué dura más que el vinil tradicional",
        r: "Explicamos sin tecnicismos qué es la impresión DTF UV, en qué materiales se aplica y por qué aguanta más lavadas y más sol que el vinil de siempre.",
        f: "5 de agosto de 2025",
        a: "Taller Creativo EK",
        c: "DTF UV",
        kw: "uvprinting,dtf,tshirt",
        min: 4,
        h: `<p>Cuando un cliente nos pregunta por qué su playera con vinil se empezó a despintar a los tres meses, la respuesta casi siempre es la misma: el material no era el adecuado para el uso que le dio. El DTF UV llegó a resolver justamente eso. Aquí te explicamos qué es, cómo funciona y en qué casos conviene de verdad, sin rodeos técnicos.</p>

<h2>Qué es exactamente el DTF UV</h2>
<p>El DTF UV es una técnica de impresión en la que se deposita tinta sobre una película especial y después se transfiere al material con calor y presión. La diferencia está en la tinta: se cura con luz ultravioleta en el momento de la impresión, no por evaporación. Eso hace que el diseño quede con un acabado flexible, brillante y muy resistente, con colores vivos desde la primera pasada.</p>
<ul>
<li><strong>Impresión:</strong> se imprime el diseño sobre la película con tintas de curado UV.</li>
<li><strong>Transferencia:</strong> con plancha o prensa térmica se aplica sobre la pieza, a temperatura y tiempo controlados.</li>
<li><strong>Acabado:</strong> el diseño queda integrado a la superficie, sin capas gruesas que se levanten en las orillas.</li>
</ul>
<p>En el taller la usamos para playeras, gorras, tazas, termos, madera, MDF, acrílico y algunos plásticos rígidos. Es una técnica muy versátil, sobre todo para pedidos con nombres, logos o fotografías.</p>

<h2>Por qué dura más que el vinil tradicional</h2>
<p>El vinil es una película que se pega encima del material. Con el uso, el lavado y el roce, esa película se despega por las orillas, se cuartea o pierde color. El DTF UV, en cambio, se integra a la superficie y su tinta ya está curada, así que soporta mucho mejor:</p>
<ul>
<li><strong>Lavados repetidos:</strong> resiste el ciclo de lavadora sin despegarse, siempre que se lave del revés.</li>
<li><strong>Sol y calor:</strong> no se amarillenta tan rápido como el vinil económico.</li>
<li><strong>Flexibilidad:</strong> se estira con la tela sin romperse en pedazos pequeños.</li>
<li><strong>Detalle fino:</strong> permite degradados, fotografías y letras pequeñas que el vinil no logra.</li>
</ul>
<p>En pruebas de uso real, una playera con DTF UV bien aplicado aguanta decenas de lavados sin perder color ni despegarse, mientras que un vinil económico empieza a mostrar las orillas levantadas a partir del décimo lavado. La clave está en dos cosas: que la superficie esté limpia y plana al momento de transferir, y que el lavado se haga del revés, sin secadora a temperatura alta.</p>

<img src="${img({ s: "que-es-el-dtf-uv-y-por-que-dura-mas", kw: "uvprinting,dtf,tshirt" }, 1, 900)}" data-hotlink="${hotBlog({ s: "que-es-el-dtf-uv-y-por-que-dura-mas", kw: "uvprinting,dtf,tshirt" }, 1, 900)}" alt="Impresión DTF UV aplicada sobre una prenda y una pieza de MDF" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

<h2>En qué materiales se puede aplicar</h2>
<p>Esta es la parte que más sorprende a la gente: el DTF UV no es solo para tela. Funciona muy bien sobre superficies rígidas y lisas, y ahí es donde más partido le sacamos.</p>
<ul>
<li><strong>Textil:</strong> algodón, mezclilla, poliéster y mezclas. Es el uso más común.</li>
<li><strong>MDF y madera sellada:</strong> perfecto para letreros, recuerdos y piezas decorativas.</li>
<li><strong>Acrílico y plásticos rígidos:</strong> ideal para llaveros y señalización.</li>
<li><strong>Metal pintado:</strong> termos y cilindros con acabado previo.</li>
<li><strong>Cerámica:</strong> tazas y platos, con el cuidado de no lavarlos en lavavajillas a temperatura alta.</li>
</ul>
<blockquote>La regla de oro del DTF UV es la superficie: mientras más lisa y limpia esté la pieza, mejor se ve y más dura el diseño. Ahí está el 80 por ciento del resultado.</blockquote>

<h2>Cuándo sí conviene el vinil</h2>
<p>Para ser justos: el vinil de corte sigue teniendo su lugar. Si el diseño es de uno o dos colores planos, si es texto sencillo o si necesitas una sola pieza para mañana, el vinil es rápido y económico. Para todo lo demás —degradados, fotografías, pedidos grandes, prendas que se van a lavar mucho— el DTF UV gana sin discusión.</p>
<p>Para alargar la vida de cualquier impresión, lava la prenda del revés con agua fría, evita la secadora a temperatura alta y no planches directamente sobre el diseño. Con esos tres hábitos, la diferencia entre DTF UV y vinil se vuelve todavía más evidente con el paso de los meses.</p>
<p>En <strong>Taller Creativo EK</strong> también hacemos maquila de DTF UV para otros negocios y talleres. Si tienes una marca de ropa, un equipo deportivo o un negocio de regalos, escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> y te pasamos precios por volumen y tiempos de entrega. Puedes ver ejemplos de trabajos terminados en nuestro <a href="tienda.html">catálogo</a>.</p>`
      },

      /* ---------------------------------------------------------------- 7 */
      {
        s: "como-elegir-taza-o-termo-personalizado",
        t: "Cómo elegir una taza o termo personalizado (cerámica, mágica, acero)",
        r: "Cerámica, mágica o acero inoxidable: diferencias reales de uso, precio y resistencia para que elijas el regalo correcto sin equivocarte.",
        f: "22 de julio de 2025",
        a: "Taller Creativo EK",
        c: "Tazas y termos",
        kw: "custom,mug,thermos",
        min: 4,
        h: `<p>La taza personalizada es el regalo más versátil que existe: sirve para cumpleaños, para el Día de las Madres, para un amigo secreto en la oficina, para agradecer a un cliente. El problema es que hay tantas opciones que la gente se pierde. Aquí te explicamos las diferencias reales entre cerámica, mágica y acero inoxidable, para que elijas según el uso y no según el precio nada más.</p>

<h2>Taza de cerámica: la opción de siempre</h2>
<p>Es la clásica de 11 onzas, la que aguanta el microondas y el lavavajillas. Si el regalo es para alguien que toma café o té todos los días en casa, esta es la elección. La impresión en DTF UV sobre cerámica queda con un color intenso y permanente si se cuida.</p>
<ul>
<li><strong>Ventajas:</strong> económica, resistente al calor, se puede meter al microondas y al lavavajillas.</li>
<li><strong>Ideal para:</strong> regalos de oficina, Día de las Madres, Día del Padre, promociones de negocio.</li>
<li><strong>Ojo con:</strong> los golpes en el borde y los cambios bruscos de temperatura.</li>
</ul>

<h2>Taza mágica: el efecto que nunca falla</h2>
<p>La taza mágica cambia de color con el calor: en frío se ve negra o de un color sólido y, al servir la bebida caliente, aparece el diseño. Es el regalo que más reacciones provoca, sobre todo cuando la imagen es una foto de la familia, de la pareja o de una mascota.</p>
<p>Funciona con un recubrimiento termosensible, así que el cuidado es un poco más delicado: se recomienda lavar a mano, con esponja suave, y no meterla al microondas. Si se cuida bien, el efecto dura muchísimo. Es la opción perfecta para sorprender, no para el uso rudo de todos los días.</p>

<img src="${img({ s: "como-elegir-taza-o-termo-personalizado", kw: "custom,mug,thermos" }, 1, 900)}" data-hotlink="${hotBlog({ s: "como-elegir-taza-o-termo-personalizado", kw: "custom,mug,thermos" }, 1, 900)}" alt="Tazas de cerámica y termo de acero inoxidable personalizados con DTF UV" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

<h2>Termo de acero inoxidable: para quien vive fuera de casa</h2>
<p>Si la persona pasa el día fuera, trabaja en obra, viaja o va al gym, el termo de acero es la respuesta. Mantiene la temperatura por horas, no se rompe si se cae y el diseño resiste muchísimo más que en cerámica.</p>
<ul>
<li><strong>Ventajas:</strong> conserva frío o caliente varias horas, muy resistente, ideal para uso diario intenso.</li>
<li><strong>Ideal para:</strong> regalos de empresa, equipos de trabajo, choferes, deportistas, estudiantes foráneos.</li>
<li><strong>Ojo con:</strong> no va al microondas y conviene lavarlo a mano para no dañar el diseño.</li>
</ul>

<h2>Cómo elegir en cuatro preguntas</h2>
<ul>
<li><strong>¿Dónde lo va a usar?</strong> Casa y oficina: cerámica. Fuera de casa todo el día: acero.</li>
<li><strong>¿Quieres sorprender o dar algo práctico?</strong> Sorprender: mágica. Práctico: cerámica o acero.</li>
<li><strong>¿Cuánto tiempo quieres que dure el diseño?</strong> Para años de uso rudo, el acero gana.</li>
<li><strong>¿Cuántas piezas necesitas?</strong> Para pedidos grandes de empresa, la cerámica blanca es la más rendidora.</li>
</ul>

<h3>Comparativa rápida</h3>
<p>El resumen en una línea: cerámica para el café de casa, mágica para sorprender, acero para quien no para quieto. En precio, la cerámica blanca es la más accesible por pieza, la mágica va en medio y el termo de acero es la inversión más alta, aunque también la que más dura. En resistencia al uso diario el orden se invierte: acero primero, cerámica después y mágica al final.</p>
<p>Un detalle que casi nadie considera es el tipo de diseño. Las fotografías se ven espectaculares en las tazas mágicas, los logos de una o dos tintas lucen mejor en cerámica blanca y los nombres en letra grande quedan perfectos en el termo de acero. Si nos mandas tu diseño antes de pedir, te decimos en qué modelo va a verse mejor.</p>
<blockquote>Un truco para regalos de empresa: elige un solo modelo para todos, pero personaliza cada pieza con el nombre de la persona. Se ve uniforme y cada quien siente que su regalo es único.</blockquote>

<p>¿Ya sabes cuál quieres? Mándanos por WhatsApp al <strong>+52 556 220 8987</strong> la foto, el logo o el diseño que quieres imprimir, la cantidad de piezas y la fecha en que lo necesitas; te cotizamos al momento y te enviamos vista previa antes de producir. Tenemos precios de mayoreo para empresas y eventos, y puedes ver modelos y acabados en nuestro <a href="tienda.html">catálogo en línea</a>.</p>`
      },

      /* ---------------------------------------------------------------- 8 */
      {
        s: "como-cuidar-tus-piezas-de-mdf",
        t: "Cómo cuidar tus piezas de MDF para que duren años",
        r: "Limpieza, humedad, sol y almacenaje: los cuidados básicos que hacen que una pieza de MDF personalizada se vea como nueva temporada tras temporada.",
        f: "10 de julio de 2025",
        a: "Taller Creativo EK",
        c: "MDF y cuidados",
        kw: "mdf,woodcraft,workshop",
        min: 4,
        h: `<p>Una pieza de MDF bien cuidada dura años. En serio: tenemos clientes que siguen sacando el mismo nacimiento que les hicimos hace cinco temporadas y se ve prácticamente nuevo. La diferencia entre eso y una pieza maltratada casi nunca es la calidad del material, sino cuatro hábitos sencillos de limpieza y guardado. Aquí van, explicados.</p>

<h2>Qué es el MDF y por qué se comporta distinto a la madera</h2>
<p>El MDF es un tablero de fibras de madera prensadas con resina. Eso le da dos cualidades que lo hacen ideal para decoración: es muy estable —no se dobla ni se abre con los cambios de temperatura como la madera maciza— y su superficie es perfectamente lisa, lo que permite cortes detallados e impresiones nítidas.</p>
<p>Su punto débil es el mismo que su virtud: al ser fibra prensada, la humedad penetra por los bordes sin sellar y puede hincharlos. Por eso en el taller sellamos los cantos de las piezas que van a estar en contacto con ambientes húmedos. Si tu pieza ya viene sellada, tienes la mitad del trabajo hecho.</p>

<h2>Limpieza: lo que sí y lo que no</h2>
<ul>
<li><strong>Sí:</strong> un trapo suave ligeramente húmedo, con agua y una gota de jabón neutro.</li>
<li><strong>Sí:</strong> plumero o paño de microfibra para el polvo de todos los días.</li>
<li><strong>No:</strong> trapos empapados, esponjas abrasivas ni fibras metálicas.</li>
<li><strong>No:</strong> alcohol, tiner, acetona ni limpiadores con amoniaco: opacan la impresión.</li>
<li><strong>No:</strong> dejar la pieza remojando ni meterla a la lavadora.</li>
</ul>
<p>Si la pieza tiene acabado con DTF UV, puedes pasar el trapo húmedo sin miedo, siempre con movimientos suaves y sin frotar fuerte sobre el diseño.</p>

<img src="${img({ s: "como-cuidar-tus-piezas-de-mdf", kw: "mdf,woodcraft,workshop" }, 1, 900)}" data-hotlink="${hotBlog({ s: "como-cuidar-tus-piezas-de-mdf", kw: "mdf,woodcraft,workshop" }, 1, 900)}" alt="Piezas decorativas de MDF personalizadas limpias y bien conservadas" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

<h2>Humedad, sol y calor: los tres enemigos</h2>
<p>De los tres, la humedad es el más dañino. Evita colocar tus piezas cerca de la ventana de la cocina, junto al área de la regadera o en paredes donde se note condensación. Si vives en zona costera o muy húmeda, guarda las piezas de temporada con una bolsita de sílice dentro de la caja.</p>
<p>El sol directo no destruye el MDF, pero sí decolora la impresión con el tiempo. Una pieza que recibe sol de frente todos los días va a perder intensidad en el transcurso de un año. Muévela unos centímetros o colócala donde la luz llegue de forma indirecta.</p>
<p>El calor extremo también importa: no dejes piezas de MDF dentro del coche en verano ni pegadas a un radiador o a un horno. El calor constante puede deformar el tablero delgado.</p>

<h2>Cómo guardar tus piezas de temporada</h2>
<ul>
<li>Envuélvelas individualmente en papel seda o plástico burbuja.</li>
<li>Guárdalas planas, nunca paradas ni recargadas contra una pared.</li>
<li>No pongas peso encima: es la causa número uno de piezas deformadas.</li>
<li>Usa una caja rígida y un lugar seco, fresco y sin luz directa.</li>
<li>Etiqueta la caja con el contenido y la temporada.</li>
</ul>
<blockquote>Si tu pieza tiene partes desmontables, guarda cada una en una bolsita por separado. El año siguiente vas a agradecer no tener que adivinar qué tornillo va dónde.</blockquote>

<h2>Si la pieza se maltrató, casi siempre se puede rescatar</h2>
<p>Un raspón en la pintura se retoca con acrílico del mismo tono y una capa de barniz. Un canto hinchado se lija con cuidado y se sella de nuevo. Una pieza que perdió color por el sol se puede repintar o reimprimir. Y si el daño es mayor, muchas veces conviene más reemplazar solo esa pieza que todo el conjunto: en el taller cortamos piezas sueltas justamente para eso.</p>
<p>¿Necesitas reponer una pieza, sellar un canto o repintar tu decoración antes de la temporada? Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> con una foto de la pieza y te decimos si se repara o conviene rehacerla. También puedes pedir piezas nuevas y diseños actualizados en nuestro <a href="tienda.html">catálogo en línea</a>.</p>`
      }

    ]
  };

  /* ======================= COMPONENTES ======================= */
  function tarjeta(p, i) {
    var url = "blog-articulo.html?p=" + p.s;
    return '<article class="ek-blogcard ek-reveal" data-id="' + p.s + '" style="transition-delay:' + ((i || 0) % 3 * 80) + 'ms">' +
      '<a class="ek-blogcard__img" href="' + url + '" style="display:block" aria-label="' + esc(p.t) + '">' +
        imgTag(p, 0, 500, p.t, 800, 500, "") +
      "</a>" +
      '<div class="ek-blogcard__b">' +
        '<span class="ek-pill ek-pill--azul">' + esc(p.c) + "</span>" +
        '<h3 class="ek-blogcard__t"><a href="' + url + '">' + esc(p.t) + "</a></h3>" +
        '<p class="ek-muted" style="margin:0;font-size:.92rem">' + esc(p.r) + "</p>" +
        '<div class="ek-post__m">' +
          '<span><i class="bi bi-calendar3"></i> ' + esc(p.f) + "</span>" +
          '<span><i class="bi bi-clock"></i> ' + p.min + " min de lectura</span>" +
        "</div>" +
        '<a class="ek-btn ek-btn--rojo ek-btn--sm" style="margin-top:auto;align-self:flex-start" href="' + url + '">Leer más <i class="bi bi-arrow-right"></i></a>' +
      "</div></article>";
  }

  function compartirHTML(p) {
    var u = urlPost(p), txt = p.t + " · " + MARCA;
    return '<div class="ek-share">' +
      '<a href="https://wa.me/?text=' + encodeURIComponent(txt + " " + u) + '" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp" title="Compartir por WhatsApp"><i class="bi bi-whatsapp"></i></a>' +
      '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(u) + '" target="_blank" rel="noopener" aria-label="Compartir en Facebook" title="Compartir en Facebook"><i class="bi bi-facebook"></i></a>' +
      '<a href="#" data-copiar="' + esc(u) + '" aria-label="Copiar enlace" title="Copiar enlace"><i class="bi bi-link-45deg"></i></a>' +
      "</div>";
  }

  function cajaAutor(p) {
    return '<div class="ek-card" style="max-width:var(--blog-ancho,900px);margin:22px auto 0">' +
      '<div class="ek-card__body">' +
        '<div class="ek-row" style="gap:12px">' +
          '<span style="width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:var(--degradado-2);color:#fff;font-weight:900;font-size:1.15rem;flex-shrink:0">EK</span>' +
          "<span><b>" + esc(p.a) + "</b><br><small class=\"ek-muted\">Regalos personalizados</small></span>" +
        "</div>" +
        '<p class="ek-muted" style="margin:0;font-size:.93rem">Escribimos desde el taller. Cortamos, imprimimos y personalizamos cada pieza en México, y te acompañamos desde la idea hasta la entrega. Si tienes dudas de este tema, pregúntanos sin compromiso.</p>' +
        '<div class="ek-row" style="gap:10px">' +
          '<a class="ek-btn ek-btn--wa ek-btn--sm" href="' + waLink("Hola, leí el artículo: " + p.t) + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Preguntar al taller</a>' +
          '<a class="ek-btn ek-btn--ghost ek-btn--sm" href="tienda.html"><i class="bi bi-bag"></i> Ver catálogo</a>' +
        "</div>" +
      "</div></div>";
  }

  function vacio(titulo, texto) {
    return '<div class="ek-empty">' +
      '<i class="bi bi-journal-x"></i>' +
      "<h3>" + esc(titulo) + "</h3>" +
      '<p class="ek-muted">' + esc(texto) + "</p>" +
      '<div class="ek-row" style="justify-content:center;gap:10px">' +
        '<a class="ek-btn ek-btn--rojo" href="blog.html"><i class="bi bi-arrow-left"></i> Ver todos los artículos</a>' +
        '<a class="ek-btn ek-btn--wa" href="' + waLink("Hola, busco información del taller") + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Escribir por WhatsApp</a>' +
      "</div></div>";
  }

  /* ======================= SALIDA 1 · LISTA (blog.html) ======================= */
  function initLista(cont, posts) {
    var estado = { q: "", cat: "Todas" };
    var cats = ["Todas"];
    posts.forEach(function (p) { if (cats.indexOf(p.c) < 0) cats.push(p.c); });
    /* Permite llegar desde el artículo con blog.html?cat=Navidad */
    var urlCat = param("cat");
    if (urlCat && cats.indexOf(urlCat) > -1) estado.cat = urlCat;

    var busc = document.getElementById("ek-blog-buscador");
    if (busc) {
      busc.innerHTML = '<form class="ek-search" role="search">' +
        '<i class="bi bi-search ek-search__ico"></i>' +
        '<input type="search" id="ek-blog-q" placeholder="Buscar: nacimiento, porta uvas, DTF UV, bodas, tazas…" aria-label="Buscar en el blog" autocomplete="off">' +
        '<button class="ek-search__btn" type="submit" aria-label="Buscar"><i class="bi bi-search"></i></button>' +
        "</form>";
      var form = $("form", busc);
      if (form) form.addEventListener("submit", function (e) { e.preventDefault(); pintar(); });
      var inp = document.getElementById("ek-blog-q");
      if (inp) inp.addEventListener("input", function () { estado.q = inp.value; pintar(); });
    }

    var chips = document.getElementById("ek-blog-chips");
    if (chips) {
      chips.className = "ek-chiplist";
      chips.innerHTML = cats.map(function (c) {
        return '<button type="button" class="ek-chip' + (c === estado.cat ? " is-on" : "") + '" data-cat="' + esc(c) + '">' +
          (c === "Todas" ? '<i class="bi bi-grid-3x3-gap"></i> Todas' : esc(c)) + "</button>";
      }).join("");
      chips.addEventListener("click", function (e) {
        var b = e.target.closest("[data-cat]"); if (!b) return;
        estado.cat = b.getAttribute("data-cat");
        $$("[data-cat]", chips).forEach(function (x) { x.classList.toggle("is-on", x === b); });
        pintar();
      });
    }

    if (cont.className.indexOf("ek-grid") < 0) cont.className = "ek-grid ek-grid--3";

    function filtrar() {
      var q = estado.q.trim().toLowerCase();
      return posts.filter(function (p) {
        if (estado.cat !== "Todas" && p.c !== estado.cat) return false;
        if (!q) return true;
        var txt = (p.t + " " + p.r + " " + p.c + " " + p.kw + " " + p.a).toLowerCase();
        return q.split(/\s+/).every(function (pal) { return txt.indexOf(pal) > -1; });
      });
    }

    function pintar() {
      var r = filtrar();
      cont.innerHTML = r.length ? r.map(tarjeta).join("") :
        '<div style="grid-column:1/-1">' + vacio("Sin artículos con ese filtro", "Prueba con otra palabra o quita el filtro de categoría. Y si buscas algo que no está escrito, pregúntanos por WhatsApp: seguro lo podemos hacer.") + "</div>";
      var info = document.getElementById("ek-blog-cuenta");
      if (info) info.innerHTML = "<b>" + r.length + "</b> artículo" + (r.length === 1 ? "" : "s") +
        (estado.cat !== "Todas" ? " en <b>" + esc(estado.cat) + "</b>" : "") +
        (estado.q.trim() ? ' para “<b>' + esc(estado.q.trim()) + "</b>”" : "");
      revelar();
    }

    pintar();
  }

  /* ======================= SALIDA 2 · ARTÍCULO (blog-articulo.html) ======================= */
  function initArticulo(cont, posts) {
    var slug = param("p"), p = null, i;
    for (i = 0; i < posts.length; i++) if (posts[i].s === slug) p = posts[i];
    var rel = document.getElementById("ek-blog-relacionados");

    if (!p) {
      if (rel) rel.style.display = "none";
      cont.innerHTML = '<div class="ek-crumbs"><a href="index.html">Inicio</a> <i class="bi bi-chevron-right"></i> <a href="blog.html">Blog</a> <i class="bi bi-chevron-right"></i> <span>Artículo no encontrado</span></div>' +
        '<div style="margin-top:22px">' + vacio("No encontramos ese artículo", "Puede que el enlace esté incompleto o que el artículo ya no exista. Mira el blog completo: tenemos guías de MDF, DTF UV, bodas, graduación y temporada.") + "</div>";
      return;
    }

    document.title = p.t + " · " + MARCA;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", p.r);

    var enc = [];
    enc.push('<div class="ek-crumbs">' +
      '<a href="index.html">Inicio</a> <i class="bi bi-chevron-right"></i> ' +
      '<a href="blog.html">Blog</a> <i class="bi bi-chevron-right"></i> ' +
      '<a href="blog.html?cat=' + encodeURIComponent(p.c) + '">' + esc(p.c) + "</a> <i class=\"bi bi-chevron-right\"></i> " +
      "<span>" + esc(p.t) + "</span></div>");

    enc.push('<article class="ek-post ek-reveal" style="margin-top:18px">' +
      '<div class="ek-post__img">' + imgTag(p, 0, 900, p.t, 900, 700, "") + "</div>" +
      '<div class="ek-post__b">' +
        '<span class="ek-pill ek-pill--rojo">' + esc(p.c) + "</span>" +
        '<h1 class="ek-post__t">' + esc(p.t) + "</h1>" +
        '<div class="ek-post__m">' +
          '<span><i class="bi bi-calendar3"></i> ' + esc(p.f) + "</span>" +
          '<span><i class="bi bi-person-circle"></i> ' + esc(p.a) + "</span>" +
          '<span><i class="bi bi-clock"></i> ' + p.min + " min de lectura</span>" +
        "</div>" +
        '<p class="ek-muted" style="margin:0">' + esc(p.r) + "</p>" +
      "</div></article>");

    enc.push('<div class="ek-article" style="margin-top:26px">' + p.h + compartirHTML(p) + "</div>");
    enc.push(cajaAutor(p));
    cont.innerHTML = enc.join("");

    var copiar = $("[data-copiar]", cont);
    if (copiar) {
      copiar.onclick = function (e) {
        e.preventDefault();
        var u = copiar.getAttribute("data-copiar");
        function ok() { if (window.EK_toast) window.EK_toast("Enlace copiado", "bi-clipboard-check-fill"); }
        function manual() {
          var ta = document.createElement("textarea");
          ta.value = u; ta.setAttribute("readonly", "");
          ta.style.position = "absolute"; ta.style.left = "-9999px";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); ok(); } catch (err) { }
          ta.remove();
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(u).then(ok, manual);
        } else manual();
      };
    }

    /* Relacionados: primero los de la misma categoría, luego el resto */
    if (rel) {
      var otros = posts.filter(function (x) { return x.s !== p.s; });
      var tres = otros.filter(function (x) { return x.c === p.c; })
        .concat(otros.filter(function (x) { return x.c !== p.c; })).slice(0, 3);
      if (tres.length) {
        rel.style.display = "";
        rel.innerHTML = '<div class="ek-container">' +
          '<div class="ek-sec__head"><div class="ek-sec__hd-l" data-aos="fade-up">' +
            '<span class="ek-sec__kicker">Sigue leyendo</span>' +
            '<h2 class="ek-sec__title">También te puede gustar</h2>' +
          "</div>" +
          '<a class="ek-sec__link" href="blog.html">Ver todos los artículos <i class="bi bi-arrow-right"></i></a></div>' +
          '<div class="ek-grid ek-grid--3">' + tres.map(tarjeta).join("") + "</div></div>";
      } else {
        rel.style.display = "none";
      }
    }

    /* Enlace directo al artículo en su categoría */
    var irCat = $("[data-ir-cat]", cont);
    if (irCat) irCat.onclick = function () { location.href = "blog.html?cat=" + encodeURIComponent(p.c); };
  }

  /* ======================= SALIDA 3 · PORTADA (index.html) ======================= */
  function initHome(cont, posts) {
    /* El arreglo está ordenado del más reciente al más antiguo */
    var recientes = posts.slice(0, 3);
    cont.innerHTML = recientes.map(tarjeta).join("");
  }

  /* ======================= ANIMACIÓN (AOS ya inicializó después) ======================= */
  function revelar() {
    var els = $$(".ek-reveal:not(.is-in)");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .06 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ======================= PUERTA DE ENTRADA (la llama ek.js) ======================= */
  window.EK_BLOG_INIT = function () {
    var B = window.EK_BLOG;
    var posts = (window.EK_BLOG_POSTS && window.EK_BLOG_POSTS.length)
      ? window.EK_BLOG_POSTS
      : (B && B.posts);
    if (!posts || !posts.length) return;
    var lista = document.getElementById("ek-blog-lista");
    if (lista) initLista(lista, posts);
    var art = document.getElementById("ek-blog-post");
    if (art) initArticulo(art, posts);
    var home = document.getElementById("ek-blog-home");
    if (home) initHome(home, posts);
  };
})();
