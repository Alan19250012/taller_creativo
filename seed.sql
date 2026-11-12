-- ============================================================================
--  TALLER CREATIVO EK · SEED DEL CATÁLOGO REAL (generado)
--  Ejecuta DESPUÉS de schema.sql  (Supabase → SQL Editor → Run)
--  Generado por: node generar-seed.mjs
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE OR REPLACE FUNCTION ek_uuid(seed text) RETURNS uuid
LANGUAGE sql IMMUTABLE AS $$ SELECT md5(seed)::uuid $$;

-- ── Categorías ────────────────────────────────────────────
INSERT INTO "Categoria" ("id","nombre","slug","descripcion","orden","activo","esPrincipal","grupo","emoji","enNav","keywords","epoca") VALUES
(ek_uuid('cat:navidad'),'Navidad','navidad','Nacimientos, rampas, esferas, gnomos, coronas y letreros navideños.',1,true,true,'temporada','🎄',true,'christmas','Nov · Dic'),
(ek_uuid('cat:ano-nuevo'),'Año Nuevo','ano-nuevo','Porta uvas personalizados, copas y todo para recibir el año con estilo.',2,true,true,'temporada','🍇',true,'newyear','Dic · Ene'),
(ek_uuid('cat:amor-amistad'),'Amor y Amistad','amor-amistad','Paquetes, gnomos enamorados, cajas corazón y arreglos para San Valentín.',3,true,true,'temporada','💘',true,'valentine','Ene · Feb'),
(ek_uuid('cat:dia-muertos'),'Día de Muertos','dia-muertos','Calaveritas, catrinas, ofrendas y papel picado en MDF.',4,true,true,'temporada','💀',false,'dayofthedead','Oct · Nov'),
(ek_uuid('cat:graduacion'),'Graduación','graduacion','Osos para firmar, pines, birretes y recuerdos para grupos escolares.',5,true,true,'temporada','🎓',true,'graduation','Jun · Jul'),
(ek_uuid('cat:dia-madres'),'Día de las Madres','dia-madres','Tazas, letreros y detalles personalizados para mamá.',6,true,true,'temporada','💐',false,'mothersday','Mayo'),
(ek_uuid('cat:dia-padres'),'Día del Padre','dia-padres','Regalos útiles y personalizados para papá.',7,true,true,'temporada','🎁',false,'fathersday','Junio'),
(ek_uuid('cat:dia-nino'),'Día del Niño','dia-nino','Juguetes didácticos, alcancías y detalles para los peques.',8,true,true,'temporada','🧸',false,'kids,toys','Abril'),
(ek_uuid('cat:halloween'),'Halloween','halloween','Decoración de terror, calabazas y fantasmas con luz.',9,true,true,'temporada','🎃',false,'halloween','Octubre'),
(ek_uuid('cat:primavera'),'Primavera','primavera','Arreglos florales que nunca se marchitan.',10,true,true,'temporada','🌸',false,'spring,flowers','Mar · May'),
(ek_uuid('cat:mdf'),'Decoración MDF','mdf','Corte y grabado láser en MDF: letreros, figuras, charolas y más.',11,true,true,'producto','🪵',true,'wood,laser',NULL),
(ek_uuid('cat:dtf-uv'),'DTF UV y Maquila','dtf-uv','Impresión DTF UV profesional desde 38x100 cm y maquila para tu marca.',12,true,true,'producto','🖨️',true,'printing,uv',NULL),
(ek_uuid('cat:personalizados'),'Personalizados','personalizados','Tazas, termos, botellas, fundas, etiquetas y todo lo que imagines.',13,true,true,'producto','✨',true,'custom,personalized',NULL),
(ek_uuid('cat:playeras'),'Playeras y Textil','playeras','Playeras, sudaderas y bodies de temporada estampados con DTF UV.',14,true,true,'producto','👕',true,'tshirt,apparel',NULL),
(ek_uuid('cat:tazas-termos'),'Tazas y Termos','tazas-termos','Cerámica, tazas mágicas, termos de acero y vasos personalizados.',15,true,true,'producto','☕',true,'mug,tumbler',NULL),
(ek_uuid('cat:llaveros-pines'),'Llaveros y Pines','llaveros-pines','El recuerdo perfecto para eventos, escuelas y empresas. Precio por pieza.',16,true,true,'producto','🔑',false,'keychain,pin',NULL),
(ek_uuid('cat:lamparas'),'Lámparas LED','lamparas','Lámparas y cuadros de luz con grabado personalizado.',17,true,true,'producto','💡',true,'led,lamp',NULL),
(ek_uuid('cat:hogar-cocina'),'Hogar y Cocina','hogar-cocina','Charolas, relojes, organizadores y piezas útiles para tu casa.',18,true,true,'producto','🏠',false,'home,kitchen,decor',NULL),
(ek_uuid('cat:bodas-eventos'),'Bodas y Eventos','bodas-eventos','Cilindros con iniciales, recuerdos, números de mesa y toppers.',19,true,true,'producto','💍',true,'wedding,event',NULL),
(ek_uuid('cat:flores'),'Arreglos Florales','flores','Arreglos florales eternos, hechos a mano y a tu medida.',20,true,true,'producto','🌷',false,'flowers,arrangement',NULL),
(ek_uuid('cat:regalos'),'Regalos y Recuerdos','regalos','Detalles listos para regalar en cualquier ocasión.',21,true,true,'producto','🎀',false,'gift,present',NULL),
(ek_uuid('cat:decoracion'),'Decoración y Letreros','decoracion','Letreros, coronas y piezas decorativas para tu hogar o negocio.',22,true,true,'producto','🖼️',false,'decoration,sign',NULL)
ON CONFLICT ("slug") DO UPDATE SET "nombre"=EXCLUDED."nombre", "descripcion"=EXCLUDED."descripcion", "orden"=EXCLUDED."orden", "grupo"=EXCLUDED."grupo", "emoji"=EXCLUDED."emoji", "enNav"=EXCLUDED."enNav", "keywords"=EXCLUDED."keywords", "epoca"=EXCLUDED."epoca";

-- ── Subcategorías ─────────────────────────────────────────
INSERT INTO "Subcategoria" ("id","nombre","slug","icono","orden","activo") VALUES
(ek_uuid('sub:nacimientos'),'Nacimientos','nacimientos','bi-house-heart',0,true),
(ek_uuid('sub:esferas'),'Esferas','esferas','bi-circle',1,true),
(ek_uuid('sub:coronas-rampas'),'Coronas y rampas','coronas-rampas','bi-flower1',2,true),
(ek_uuid('sub:letreros'),'Letreros','letreros','bi-card-heading',3,true),
(ek_uuid('sub:gnomos'),'Gnomos','gnomos','bi-person-arms-up',4,true),
(ek_uuid('sub:santa-venados'),'Santa, venados y trineo','santa-venados','bi-snow2',5,true),
(ek_uuid('sub:botas-dulceros'),'Botas y dulceros','botas-dulceros','bi-gift',6,true),
(ek_uuid('sub:arboles-figuras'),'Árboles y figuras','arboles-figuras','bi-tree',7,true),
(ek_uuid('sub:cuadros-navidenos'),'Cuadros navideños','cuadros-navidenos','bi-image',8,true),
(ek_uuid('sub:camino-mesa'),'Mantelería','camino-mesa','bi-border-width',9,true),
(ek_uuid('sub:playeras-navidenas'),'Playeras navideñas','playeras-navidenas','bi-bag-heart',10,true),
(ek_uuid('sub:packs-familia'),'Packs familiares','packs-familia','bi-people',11,true),
(ek_uuid('sub:porta-uvas'),'Porta uvas','porta-uvas','bi-circle-square',12,true),
(ek_uuid('sub:copas-brindis'),'Copas y brindis','copas-brindis','bi-cup-straw',13,true),
(ek_uuid('sub:letreros-ano-nuevo'),'Letreros de Año Nuevo','letreros-ano-nuevo','bi-stars',14,true),
(ek_uuid('sub:paquetes-regalo'),'Paquetes de regalo','paquetes-regalo','bi-box-seam',15,true),
(ek_uuid('sub:cajas-corazon'),'Cajas y corazones','cajas-corazon','bi-heart',16,true),
(ek_uuid('sub:globos'),'Globos y sorpresas','globos','bi-balloon',17,true),
(ek_uuid('sub:para-pareja'),'Para pareja','para-pareja','bi-people-fill',18,true),
(ek_uuid('sub:osos-firmar'),'Osos para firmar','osos-firmar','bi-emoji-smile',19,true),
(ek_uuid('sub:pines'),'Pines','pines','bi-pin-angle',20,true),
(ek_uuid('sub:birretes-coronas'),'Birretes y coronas','birretes-coronas','bi-mortarboard',21,true),
(ek_uuid('sub:marcos'),'Marcos de foto','marcos','bi-card-image',22,true),
(ek_uuid('sub:maquila'),'Maquila y transfer','maquila','bi-printer',23,true),
(ek_uuid('sub:etiquetas'),'Etiquetas','etiquetas','bi-tags',24,true),
(ek_uuid('sub:invitaciones'),'Invitaciones','invitaciones','bi-envelope-heart',25,true),
(ek_uuid('sub:fundas'),'Fundas de celular','fundas','bi-phone',26,true),
(ek_uuid('sub:placas'),'Placas y reconocimientos','placas','bi-award',27,true),
(ek_uuid('sub:tazas'),'Tazas personalizadas','tazas','bi-cup-hot',28,true),
(ek_uuid('sub:termos'),'Termos','termos','bi-cup',29,true),
(ek_uuid('sub:vasos'),'Vasos y cerveceros','vasos','bi-cup-straw',30,true),
(ek_uuid('sub:llaveros'),'Llaveros','llaveros','bi-key',31,true),
(ek_uuid('sub:botellas-cilindros'),'Botellas y cilindros','botellas-cilindros','bi-bottle',32,true),
(ek_uuid('sub:lamparas'),'Lámparas LED','lamparas','bi-lightbulb',33,true),
(ek_uuid('sub:cuadros-luz'),'Cuadros de luz','cuadros-luz','bi-brightness-high',34,true),
(ek_uuid('sub:charolas'),'Charolas','charolas','bi-basket',35,true),
(ek_uuid('sub:relojes'),'Relojes','relojes','bi-clock',36,true),
(ek_uuid('sub:portarretratos'),'Portarretratos','portarretratos','bi-image-alt',37,true),
(ek_uuid('sub:organizadores'),'Organizadores','organizadores','bi-grid-3x3-gap',38,true),
(ek_uuid('sub:portavasos'),'Portavasos','portavasos','bi-circle-half',39,true),
(ek_uuid('sub:separadores'),'Separadores de libros','separadores','bi-bookmark',40,true),
(ek_uuid('sub:imanes'),'Imanes','imanes','bi-magnet',41,true),
(ek_uuid('sub:cajas-regalo'),'Cajas de regalo','cajas-regalo','bi-box2-heart',42,true),
(ek_uuid('sub:recuerdos-boda'),'Recuerdos de boda','recuerdos-boda','bi-gem',43,true),
(ek_uuid('sub:numeros-mesa'),'Números de mesa','numeros-mesa','bi-123',44,true),
(ek_uuid('sub:libro-firmas'),'Libro de firmas','libro-firmas','bi-journal-bookmark',45,true),
(ek_uuid('sub:toppers'),'Toppers de pastel','toppers','bi-cake2',46,true),
(ek_uuid('sub:arreglos-florales'),'Arreglos florales','arreglos-florales','bi-flower2',47,true),
(ek_uuid('sub:calaveritas'),'Calaveritas','calaveritas','bi-emoji-dizzy',48,true),
(ek_uuid('sub:catrinas'),'Catrinas','catrinas','bi-person-standing-dress',49,true),
(ek_uuid('sub:ofrendas'),'Ofrendas','ofrendas','bi-fire',50,true),
(ek_uuid('sub:mama'),'Para mamá','mama','bi-suit-heart',51,true),
(ek_uuid('sub:papa'),'Para papá','papa','bi-person-badge',52,true),
(ek_uuid('sub:ninos'),'Para niños','ninos','bi-balloon-heart',53,true),
(ek_uuid('sub:halloween'),'Halloween','halloween','bi-moon-stars',54,true),
(ek_uuid('sub:grupos'),'Grupos y escuelas','grupos','bi-people-fill',55,true)
ON CONFLICT ("slug") DO UPDATE SET "nombre"=EXCLUDED."nombre", "icono"=EXCLUDED."icono", "orden"=EXCLUDED."orden";

-- ── Productos ─────────────────────────────────────────────
INSERT INTO "Producto" ("id","nombre","slug","descripcion","colores","tallas","caracteristicas","keywords","destacado","activo","nuevo","liquidacion","precioMinorista","precioAnterior","stock","vendidos","calificacion") VALUES
(ek_uuid('prod:letrero-bienvenida-santa-40x35'),'Letrero de Bienvenida con Santa 40x35','letrero-bienvenida-santa-40x35','Letrero navideño con Santa Claus en MDF, ideal para puerta, recibidor o negocio.',ARRAY['Rojo','Blanco','Verde','Dorado'],ARRAY['30x25 cm','40x35 cm','50x45 cm'],ARRAY['MDF 3 mm corte láser','Impresión UV full color','Cuerda para colgar incluida','Acabado resistente a interiores'],'santa,christmas,sign',true,true,false,false,380,450,14,96,4.9),
(ek_uuid('prod:nacimiento-impresion-uv'),'Nacimiento Impresión UV 22x22','nacimiento-impresion-uv','Nacimiento impreso en UV sobre MDF con detalles a todo color y base para mesa.',ARRAY['Natural','Dorado','Azul'],ARRAY['15x15 cm','22x22 cm','30x30 cm','40x40 cm'],ARRAY['Impresión UV alta definición','Base incluida','4 tamaños disponibles','Listo para regalar'],'nativity,christmas,manger',false,true,false,true,150,190,42,318,4.8),
(ek_uuid('prod:rampa-navidad-mdf'),'Rampa Navideña MDF','rampa-navidad-mdf','Rampa navideña de MDF para lucir tu nacimiento o tus figuras favoritas.',ARRAY['Natural','Rojo','Blanco'],ARRAY['Chica','Mediana','Grande','XL'],ARRAY['Corte y grabado láser','Se arma sin herramientas','Varios niveles','Pintura horneada'],'christmas,wood,stairs',false,true,false,false,260,320,18,74,4.7),
(ek_uuid('prod:arbolito-navideno-mdf'),'Árbolito Navideño de MDF','arbolito-navideno-mdf','Árbolito de MDF para escritorio, mesa de dulces o centro de mesa.',ARRAY['Natural','Verde','Dorado','Blanco'],ARRAY['20 cm','30 cm','40 cm'],ARRAY['MDF 3 mm','Base desmontable','Se arma en segundos','Pintura acrílica sellada'],'christmas,tree,wood',true,true,false,false,140,NULL,60,240,4.8),
(ek_uuid('prod:familia-venados-mdf'),'Familia de Venados MDF','familia-venados-mdf','Set de 3 venados de MDF para decorar mesa, repisa o jardín interior.',ARRAY['Natural','Dorado','Blanco','Rojo'],ARRAY['15 cm','25 cm','35 cm','45 cm'],ARRAY['Set de 3 piezas','Corte láser de precisión','Pintura base incluida','Resistente a interiores'],'reindeer,christmas,deer',true,true,false,false,290,360,22,128,4.9),
(ek_uuid('prod:esferas-navidenas-m1-m4'),'Esferas Navideñas M1 a M4','esferas-navidenas-m1-m4','Esferas navideñas personalizadas. Elige tamaño, color y diseño.',ARRAY['Rojo','Azul','Dorado','Plateado','Blanco','Verde'],ARRAY['M1','M2','M3','M4'],ARRAY['Precio por pieza','4 tamaños (M1 a M4)','Impresión UV o vinil','Listón incluido'],'christmas,bauble,ornament',true,true,false,false,35,NULL,320,1480,4.9),
(ek_uuid('prod:esferas-navidenas-set-12'),'Esferas Navideñas Set 12 Piezas','esferas-navidenas-set-12','Set de esferas decoradas a juego para dejar tu árbol espectacular.',ARRAY['Multicolor','Rojo','Dorado'],ARRAY['12 piezas','24 piezas','36 piezas'],ARRAY['Diseños combinados','Precio por set','Empaque de regalo','Personalizables con nombres'],'christmas,ornaments,set',false,true,false,true,360,420,40,210,4.8),
(ek_uuid('prod:santa-claus-mdf'),'Santa Claus MDF 30 cm','santa-claus-mdf','Figura de Santa Claus en MDF con acabado a todo color y base incluida.',ARRAY['Rojo','Blanco','Natural'],ARRAY['20 cm','30 cm','40 cm','50 cm'],ARRAY['Pintura a mano','MDF 3 mm','Base incluida','4 tamaños'],'santa,claus,christmas',false,true,false,false,220,NULL,26,88,4.7),
(ek_uuid('prod:gnomos-navidenos-10cm'),'Gnomos Navideños 10 cm','gnomos-navidenos-10cm','Gnomos de MDF para decorar rincones, mesas y detalles de regalo.',ARRAY['Rojo','Gris','Blanco','Rosa'],ARRAY['10 cm','15 cm','20 cm'],ARRAY['Precio por pieza','Ideal para souvenirs','Tres tamaños','Combinables en set'],'gnome,christmas,nordic',true,true,false,false,45,NULL,180,620,4.9),
(ek_uuid('prod:arreglo-floral-navideno'),'Arreglo Floral Navideño 25x20','arreglo-floral-navideno','Arreglo floral navideño con base decorada y toques dorados.',ARRAY['Rojo','Verde','Dorado'],ARRAY['25x20 cm','30x25 cm','35x30 cm'],ARRAY['Flor artificial premium','Base decorada','Hecho a mano','Ideal para negocio'],'christmas,flowers,arrangement',false,true,false,false,160,NULL,20,64,4.8),
(ek_uuid('prod:corona-navidad-mdf'),'Corona Navideña MDF','corona-navidad-mdf','Corona navideña rígida de MDF para puerta o pared, se reutiliza cada año.',ARRAY['Verde','Rojo','Dorado'],ARRAY['25 cm','30 cm','40 cm'],ARRAY['No se maltrata','Reutilizable por años','Moño incluido','Personalizable'],'christmas,wreath,door',false,true,false,true,250,300,24,140,4.8),
(ek_uuid('prod:trineo-decorativo-mdf'),'Trineo Decorativo MDF','trineo-decorativo-mdf','Trineo de MDF armado en 3D para colocar dulces, regalos o figuras.',ARRAY['Natural','Rojo','Blanco'],ARRAY['Chico','Mediano','Grande'],ARRAY['Armado 3D','Espacio para dulces','Corte y grabado láser','Pintura sellada'],'sled,christmas,wood',false,true,false,false,280,NULL,16,52,4.7),
(ek_uuid('prod:camino-mesa-navideno-dtf'),'Camino de Mesa Navideño DTF UV','camino-mesa-navideno-dtf','Camino de mesa con estampado DTF UV que resiste el lavado sin despintarse.',ARRAY['Rojo','Verde','Blanco'],ARRAY['1.20 m','1.80 m','2.40 m'],ARRAY['DTF UV de alta duración','No se despinta','Lavable en máquina','Diseño exclusivo'],'table,runner,christmas',false,true,false,false,190,NULL,30,58,4.6),
(ek_uuid('prod:adorno-feliz-navidad-madera'),'Adorno Feliz Navidad Madera','adorno-feliz-navidad-madera','Adorno de madera con la frase Feliz Navidad, perfecto para regalar.',ARRAY['Natural','Rojo','Dorado'],ARRAY['10 cm','15 cm','20 cm'],ARRAY['Listón incluido','Súper ligero','Impresión UV','Precio por pieza'],'christmas,ornament,wooden',false,true,false,false,85,NULL,90,260,4.7),
(ek_uuid('prod:set-4-cuadros-navidenos-uv'),'Set 4 Cuadros Navideños UV','set-4-cuadros-navidenos-uv','Cuatro cuadros navideños impresos en UV para vestir cualquier pared.',ARRAY['Natural','Rojo','Verde'],ARRAY['20x20 cm','25x25 cm','30x30 cm'],ARRAY['Set de 4 piezas','Impresión UV','Cinta doble cara incluida','Diseños a juego'],'christmas,wall,art',false,true,false,true,340,420,18,46,4.8),
(ek_uuid('prod:botita-navidad-dulces'),'Botita Navideña para Dulces','botita-navidad-dulces','Botita de MDF para dulces, ideal para recuerditos escolares y posadas.',ARRAY['Rojo','Verde','Blanco'],ARRAY['Chica','Mediana','Grande'],ARRAY['Se arma fácil','Ideal mayoreo','Personalizable con nombre','Precio por pieza'],'christmas,stocking,candy',false,true,false,false,60,NULL,120,340,4.6),
(ek_uuid('prod:bota-navidad-dtf-personalizada'),'Bota Navideña DTF UV Personalizada','bota-navidad-dtf-personalizada','Bota navideña personalizada con nombre y estampado DTF UV.',ARRAY['Rojo','Verde','Blanco'],ARRAY['Chica','Mediana','Grande'],ARRAY['Nombre incluido','DTF UV duradero','Tela resistente','Lista para colgar'],'christmas,stocking,personalized',true,true,false,false,130,NULL,60,180,4.8),
(ek_uuid('prod:guirnalda-estrellas-mdf'),'Guirnalda de Estrellas MDF','guirnalda-estrellas-mdf','Guirnalda de estrellas de MDF para decorar pared, ventana o escaleras.',ARRAY['Natural','Dorado','Blanco'],ARRAY['1.5 m','2 m','3 m'],ARRAY['Ligera','Reutilizable','Cordón incluido','Pintura mate'],'garland,stars,christmas',false,true,false,false,170,NULL,44,96,4.7),
(ek_uuid('prod:vela-led-navidad-decorada'),'Vela LED Navideña Decorada','vela-led-navidad-decorada','Vela LED con luz cálida: decoración segura, sin flama ni riesgo.',ARRAY['Blanco','Dorado','Rojo'],ARRAY['15 cm','20 cm','25 cm'],ARRAY['Luz LED cálida','Funciona con pila','Segura con niños','Base decorada'],'led,candle,christmas',false,true,false,false,120,NULL,70,150,4.6),
(ek_uuid('prod:topper-pastel-navideno'),'Topper para Pastel Navideño','topper-pastel-navideno','Topper navideño para pastel: el detalle final de tu mesa.',ARRAY['Rojo','Dorado','Verde'],ARRAY['12 cm','15 cm','20 cm'],ARRAY['Palillo incluido','Impresión UV doble cara','Reutilizable','Varios diseños'],'cake,topper,christmas',false,true,false,false,110,NULL,85,190,4.8),
(ek_uuid('prod:playera-grinch-merry-christmas'),'Playera Navideña Grinch Merry Christmas','playera-grinch-merry-christmas','Playera de temporada Grinch Merry Christmas con estampado DTF UV.',ARRAY['Negro','Blanco','Rojo','Verde','Azul marino'],ARRAY['CH','M','G','XG','2XG'],ARRAY['DTF UV que no se despinta','Algodón peinado','5 tallas','Diseño de temporada'],'christmas,tshirt,grinch',true,true,false,false,320,380,48,210,4.9),
(ek_uuid('prod:playera-copo-de-nieve'),'Playera Copo de Nieve','playera-copo-de-nieve','Playera navideña con diseño de copo de nieve: elegante y discreta.',ARRAY['Blanco','Azul','Negro','Gris'],ARRAY['CH','M','G','XG','2XG'],ARRAY['Estampado DTF UV','Tela suave','Corte unisex','Lavable en máquina'],'snowflake,tshirt,winter',false,true,false,false,320,380,40,168,4.8),
(ek_uuid('prod:playera-merry-grinch-mas'),'Playera Merry Grinch más','playera-merry-grinch-mas','Playera Merry Grinch más, la favorita de la temporada navideña.',ARRAY['Verde','Negro','Blanco','Rojo'],ARRAY['CH','M','G','XG','2XG'],ARRAY['Diseño exclusivo','DTF UV premium','Corte unisex','Tallas CH a 2XG'],'grinch,christmas,tshirt',false,true,false,false,320,NULL,36,152,4.8),
(ek_uuid('prod:playera-navidad-familia-pack4'),'Playera Navideña Familia Pack 4','playera-navidad-familia-pack4','Pack familiar de playeras navideñas personalizadas con el nombre de cada quien.',ARRAY['Rojo','Verde','Negro','Blanco'],ARRAY['Pack 4 piezas','Pack 5 piezas','Pack 6 piezas'],ARRAY['Nombres incluidos','Ahorro vs. pieza suelta','Diseños combinados','Ideal para la foto familiar'],'family,christmas,tshirts',false,true,false,true,1150,1400,12,38,5),
(ek_uuid('prod:sudadera-navideno-personalizada'),'Sudadera Navideña Personalizada','sudadera-navideno-personalizada','Sudadera con capucha y estampado navideño personalizado.',ARRAY['Negro','Gris','Rojo','Verde'],ARRAY['CH','M','G','XG','2XG'],ARRAY['Interior afelpado','DTF UV','Personaliza tu nombre','Unisex'],'hoodie,christmas,sweater',false,true,false,false,480,560,26,74,4.8),
(ek_uuid('prod:body-bebe-navideno'),'Body Bebé Navideño','body-bebe-navideno','Body para bebé con diseño navideño y nombre personalizado.',ARRAY['Blanco','Rojo','Verde'],ARRAY['0-3 m','3-6 m','6-9 m','9-12 m'],ARRAY['Algodón suave','Broches laterales','Nombre incluido','Regalo perfecto'],'baby,bodysuit,christmas',false,true,false,false,260,NULL,30,68,4.9),
(ek_uuid('prod:porta-uvas-mdf-personalizado'),'Porta Uvas de MDF Personalizado DTF UV','porta-uvas-mdf-personalizado','Porta uvas de MDF personalizado con DTF UV. Porque cada uva merece un deseo especial.',ARRAY['Natural','Dorado','Rojo','Azul'],ARRAY['12 uvas','24 uvas','Con base'],ARRAY['Diseño único con nombre','Acabado brillante','12 o 24 espacios','Haz de tu mesa un momento inolvidable'],'grapes,newyear,wood',true,true,false,false,180,220,90,540,5),
(ek_uuid('prod:set-12-porta-uvas-mini'),'Set 12 Porta Uvas Mini MDF','set-12-porta-uvas-mini','Set de 12 porta uvas individuales para tu cena de Año Nuevo.',ARRAY['Natural','Dorado','Multicolor'],ARRAY['12 piezas','24 piezas','48 piezas'],ARRAY['Ideal para cena familiar','Precio por set','Personalizables','Listos para la mesa'],'newyear,table,grapes',false,true,false,true,520,640,30,128,4.9),
(ek_uuid('prod:corona-12-deseos-ano-nuevo'),'Corona Mis 12 Deseos Año Nuevo','corona-12-deseos-ano-nuevo','Corona con 12 espacios para escribir los deseos de cada mes del año.',ARRAY['Dorado','Natural','Rojo'],ARRAY['25 cm','30 cm','40 cm'],ARRAY['12 tarjetitas incluidas','Reutilizable cada año','Pluma incluida','Centro de mesa perfecto'],'newyear,crown,decoration',false,true,false,false,240,NULL,40,96,4.8),
(ek_uuid('prod:letrero-feliz-ano-nuevo'),'Letrero Feliz Año Nuevo MDF 30x20','letrero-feliz-ano-nuevo','Letrero Feliz Año Nuevo con acabado metálico dorado.',ARRAY['Dorado','Negro','Natural'],ARRAY['20x15 cm','30x20 cm','40x30 cm'],ARRAY['Acabado espejo','Corte láser','Base incluida','3 tamaños'],'newyear,sign,party',false,true,false,false,210,NULL,34,88,4.7),
(ek_uuid('prod:copa-decorada-dtf-ano-nuevo'),'Copa Decorada DTF UV Año Nuevo','copa-decorada-dtf-ano-nuevo','Copa decorada con DTF UV para el brindis de Año Nuevo.',ARRAY['Transparente','Dorado','Rojo'],ARRAY['1 copa','6 copas','12 copas'],ARRAY['Vinil resistente','Se lava a mano','Personaliza el nombre','Precio por pieza'],'champagne,glass,newyear',false,true,false,false,150,NULL,120,320,4.7),
(ek_uuid('prod:kit-brindis-6-copas-porta-uvas'),'Kit Brindis 6 Copas + Porta Uvas','kit-brindis-6-copas-porta-uvas','Kit completo para tu brindis: 6 copas decoradas y porta uvas a juego.',ARRAY['Dorado','Rojo','Plateado'],ARRAY['Kit 6 piezas','Kit 12 piezas','Kit 24 piezas'],ARRAY['Todo personalizado','Listo para usar','Ahorro vs. suelto','Empaque de regalo'],'newyear,party,glassware',false,true,false,true,890,1080,14,42,4.9),
(ek_uuid('prod:banderin-ano-nuevo-dtf'),'Banderín Año Nuevo DTF UV','banderin-ano-nuevo-dtf','Banderín de tela con estampado DTF UV para tu fiesta de Año Nuevo.',ARRAY['Dorado','Negro','Rojo'],ARRAY['1.5 m','2 m','3 m'],ARRAY['Tela resistente','Reutilizable','Cordón incluido','Fácil de colgar'],'bunting,newyear,party',false,true,false,false,95,NULL,80,140,4.5),
(ek_uuid('prod:paquete-amor-amistad-1'),'Paquete Amor y Amistad 1','paquete-amor-amistad-1','Paquete 1 de Amor y Amistad (22.5x13x9 cm): caja decorada con detalles y dulces.',ARRAY['Rojo','Rosa','Blanco'],ARRAY['22.5x13x9 cm','24x14.5x10 cm','34x23.5x8.5 cm'],ARRAY['Caja decorada a mano','Incluye detalles sorpresa','Listo para regalar','Personalizable con nombre'],'valentine,gift,box',true,true,false,false,230,NULL,28,118,4.9),
(ek_uuid('prod:paquete-amor-amistad-2'),'Paquete Amor y Amistad 2','paquete-amor-amistad-2','Paquete 2 de Amor y Amistad (24x14.5x10 cm) con más piezas y moño premium.',ARRAY['Rojo','Rosa','Dorado'],ARRAY['24x14.5x10 cm','22.5x13x9 cm','34x23.5x8.5 cm'],ARRAY['Tamaño mediano','Más piezas incluidas','Moño premium','Tarjeta personalizada'],'valentine,gift,heart',false,true,false,false,270,NULL,24,96,4.9),
(ek_uuid('prod:paquete-amor-amistad-3'),'Paquete Amor y Amistad 3','paquete-amor-amistad-3','Paquete 3 de Amor y Amistad (34x23.5x8.5 cm), el formato más completo.',ARRAY['Rojo','Rosa','Blanco'],ARRAY['34x23.5x8.5 cm','24x14.5x10 cm','22.5x13x9 cm'],ARRAY['Formato alargado','Ideal para arreglo','Tapa decorada','Sorprende a esa persona'],'valentine,gift,romantic',false,true,false,true,270,320,22,88,4.8),
(ek_uuid('prod:gnomos-enamorados-10cm'),'Gnomos Enamorados 10 cm','gnomos-enamorados-10cm','Gnomos enamorados de 10 cm: el detalle tierno para San Valentín.',ARRAY['Rosa','Rojo','Blanco','Morado'],ARRAY['10 cm','15 cm','20 cm'],ARRAY['Precio por pieza','Se venden en par','Tres tamaños','Hechos a mano'],'gnome,valentine,love',true,true,false,false,45,NULL,200,730,4.9),
(ek_uuid('prod:caja-corazon-mdf'),'Caja Corazón MDF','caja-corazon-mdf','Caja en forma de corazón para guardar dulces, cartas o joyería.',ARRAY['Rojo','Rosa','Natural','Dorado'],ARRAY['10 cm','15 cm','20 cm','25 cm'],ARRAY['Tapa deslizante','Grabado personalizado','Interior forrado','4 tamaños'],'heart,box,valentine',false,true,false,false,160,NULL,65,210,4.8),
(ek_uuid('prod:letrero-te-amo-mdf'),'Letrero Te Amo MDF','letrero-te-amo-mdf','Letrero Te Amo en MDF, perfecto para decorar o para regalar.',ARRAY['Rojo','Rosa','Dorado','Natural'],ARRAY['20 cm','30 cm','40 cm'],ARRAY['Corte láser','Pintura sellada','Para base o pared','Personalizable'],'love,sign,wood',false,true,false,false,190,NULL,48,132,4.8),
(ek_uuid('prod:arreglo-floral-san-valentin'),'Arreglo Floral San Valentín 25x20','arreglo-floral-san-valentin','Arreglo floral eterno para San Valentín: nunca se marchita.',ARRAY['Rojo','Rosa','Blanco'],ARRAY['25x20 cm','30x25 cm','35x30 cm'],ARRAY['Flores artificiales premium','Base decorada','Hecho a mano','Entrega el mismo día en CDMX'],'roses,valentine,flowers',false,true,false,false,160,NULL,26,74,4.8),
(ek_uuid('prod:globo-burbuja-con-mensaje'),'Globo Burbuja con Mensaje','globo-burbuja-con-mensaje','Globo burbuja relleno con mensaje personalizado y detalles.',ARRAY['Rojo','Rosa','Transparente','Dorado'],ARRAY['Chico','Mediano','Grande'],ARRAY['Mensaje personalizado','Relleno decorativo','Se entrega inflado','Ideal para sorpresa'],'balloon,gift,valentine',false,true,false,true,280,340,32,110,4.7),
(ek_uuid('prod:set-2-tazas-pareja'),'Set 2 Tazas Pareja Personalizadas','set-2-tazas-pareja','Par de tazas personalizadas con nombres o una frase especial.',ARRAY['Blanco','Rojo','Rosa','Negro'],ARRAY['11 oz','15 oz','Set 2 piezas'],ARRAY['Impresión UV full color','Aptas lavavajillas','Nombres incluidos','Empaque de regalo'],'mug,couple,gift',true,true,false,false,340,400,40,160,4.9),
(ek_uuid('prod:llavero-pareja-mdf'),'Llavero Pareja MDF','llavero-pareja-mdf','Llavero de pareja en MDF con los nombres grabados. Se vende el par.',ARRAY['Rojo','Rosa','Natural','Negro'],ARRAY['2 piezas','4 piezas','6 piezas'],ARRAY['Par con nombres','Argolla reforzada','Grabado láser','Precio por par'],'keychain,couple,love',false,true,false,false,60,NULL,150,420,4.8),
(ek_uuid('prod:oso-graduacion-firmar-30cm'),'Oso de Graduación para Firmar 30 cm','oso-graduacion-firmar-30cm','Oso de graduación con espacio para que todos firmen y dejen mensajes inolvidables.',ARRAY['Blanco','Café','Gris','Azul marino'],ARRAY['30 cm','40 cm','50 cm'],ARRAY['Espacio para firmas','Plumón incluido','Birrete y toga','Recuerdo inolvidable'],'graduation,bear,teddy',true,true,false,false,320,380,60,240,4.9),
(ek_uuid('prod:oso-graduacion-40cm'),'Oso de Graduación 40 cm','oso-graduacion-40cm','Oso de graduación tamaño mediano, el favorito para la sesión de fotos.',ARRAY['Blanco','Café','Azul marino'],ARRAY['40 cm','50 cm','60 cm'],ARRAY['Tela suave premium','Birrete personalizado','Nombre bordado opcional','Lavable a mano'],'graduation,teddy,bear',false,true,false,false,420,NULL,34,118,4.9),
(ek_uuid('prod:oso-graduacion-50cm'),'Oso de Graduación Gigante 50 cm','oso-graduacion-50cm','Oso gigante de graduación para un recuerdo monumental.',ARRAY['Blanco','Café','Gris'],ARRAY['50 cm','60 cm','70 cm'],ARRAY['Tamaño XL','Personaliza nombre y año','Birrete a juego','Envío protegido'],'big,teddy,bear,graduation',false,true,false,false,520,NULL,20,62,4.8),
(ek_uuid('prod:pin-personalizado-graduacion'),'Pin Personalizado Graduación','pin-personalizado-graduacion','Pin personalizado de graduación: el recuerdo ideal para grupos escolares.',ARRAY['Dorado','Plateado','Azul marino','Rojo'],ARRAY['25 pz','50 pz','100 pz'],ARRAY['Precio por pieza','Diseño a tu medida','Cierre seguro','Mayoreo disponible'],'pin,badge,graduation',true,true,false,false,35,NULL,400,1250,4.8),
(ek_uuid('prod:birrete-decorativo-mdf'),'Birrete Decorativo MDF','birrete-decorativo-mdf','Birrete de MDF decorativo para mesa de dulces o recuerdo de foto.',ARRAY['Negro','Azul marino','Dorado'],ARRAY['15 cm','20 cm','25 cm'],ARRAY['Corte láser','Borla incluida','Personaliza el año','Base opcional'],'graduation,cap,mortarboard',false,true,false,false,150,NULL,55,130,4.7),
(ek_uuid('prod:letrero-felicidades-graduado'),'Letrero Felicidades Graduado','letrero-felicidades-graduado','Letrero Felicidades Graduado con acabado elegante y nombre incluido.',ARRAY['Dorado','Negro','Azul marino','Natural'],ARRAY['25 cm','35 cm','45 cm'],ARRAY['Acabado metálico','Nombre incluido','Corte láser','Reutilizable'],'graduation,sign,congrats',false,true,false,false,240,NULL,30,78,4.8),
(ek_uuid('prod:marco-foto-graduacion-mdf'),'Marco de Foto Graduación MDF','marco-foto-graduacion-mdf','Marco personalizado con nombre, carrera y año de graduación.',ARRAY['Natural','Negro','Dorado'],ARRAY['4x6 pulg','5x7 pulg','6x8 pulg'],ARRAY['Grabado personalizado','Base de mesa','Acrílico protector','Regalo ideal'],'photo,frame,graduation',false,true,false,true,280,330,28,86,4.9),
(ek_uuid('prod:set-20-osos-firmables-pines'),'Set 20 Osos Firmables + 20 Pines','set-20-osos-firmables-pines','PROMO grupal: al comprar 20 osos o más te regalamos 1 pin personalizado por cada oso.',ARRAY['Blanco','Café','Gris'],ARRAY['20 osos + 20 pines','30 osos + 30 pines','40 osos + 40 pines'],ARRAY['1 pin gratis por oso','Ideal grupos escolares o despedidas','Precio de mayoreo','Entrega programada'],'graduation,party,bears',false,true,false,true,6400,7800,8,22,5),
(ek_uuid('prod:maquila-dtf-uv-38x100'),'Maquila DTF UV Planilla 38x100 cm','maquila-dtf-uv-38x100','Producción profesional de DTF UV desde 38x100 cm con calidad premium.',ARRAY['Multicolor'],ARRAY['38x100 cm','38x200 cm','38x500 cm'],ARRAY['Producción profesional','Calidad premium','Ideal mayoreo','Atención personalizada'],'printing,uv,workshop',true,true,false,false,380,NULL,100,480,4.9),
(ek_uuid('prod:maquila-dtf-uv-hoja-a4'),'Maquila DTF UV Hoja A4','maquila-dtf-uv-hoja-a4','Hoja DTF UV tamaño A4 lista para aplicar en tus productos.',ARRAY['Multicolor'],ARRAY['A4','A3','A2'],ARRAY['Entrega rápida','Alta definición','Para tazas, telas y más','Precio por hoja'],'dtf,transfer,printing',false,true,false,false,90,NULL,300,980,4.8),
(ek_uuid('prod:transfer-dtf-uv-metro'),'Transfer DTF UV por Metro Lineal','transfer-dtf-uv-metro','Transfer DTF UV por metro lineal a precio de mayoreo.',ARRAY['Multicolor'],ARRAY['1 m','5 m','10 m'],ARRAY['Precio por metro','Colores vivos','Resistente al lavado','Ideal para producción'],'transfer,textile,print',false,true,false,true,220,260,150,320,4.8),
(ek_uuid('prod:taza-ceramica-personalizada'),'Taza Cerámica 11 oz Personalizada','taza-ceramica-personalizada','Taza de cerámica personalizada con foto, nombre o el logo de tu negocio.',ARRAY['Blanco','Interior rojo','Interior azul','Interior negro'],ARRAY['6 oz','9 oz','11 oz','15 oz'],ARRAY['Impresión UV full color','Apta microondas','4 tamaños','Precio por pieza'],'mug,ceramic,custom',true,true,false,false,180,NULL,180,640,4.9),
(ek_uuid('prod:taza-magica-cambia-color'),'Taza Mágica Cambia Color','taza-magica-cambia-color','Taza mágica que revela tu diseño al contacto con el líquido caliente.',ARRAY['Negro','Mágico'],ARRAY['9 oz','11 oz','15 oz'],ARRAY['Efecto sorpresa','Impresión UV','Ideal para regalo','Caja incluida'],'magic,mug,color',false,true,false,true,250,300,70,240,4.8),
(ek_uuid('prod:taza-color-interior'),'Taza de Color Interior Personalizada','taza-color-interior','Taza blanca con interior y asa de color, personalizada a tu gusto.',ARRAY['Interior rojo','Interior azul','Interior rosa','Interior verde','Interior negro'],ARRAY['11 oz','15 oz','20 oz'],ARRAY['Interior de color','Impresión UV','5 colores','Ideal para regalo'],'colorful,mug,cup',false,true,false,false,210,NULL,90,210,4.7),
(ek_uuid('prod:termo-20oz-personalizado'),'Termo 20 oz Personalizado','termo-20oz-personalizado','Termo de acero inoxidable personalizado que mantiene la temperatura por horas.',ARRAY['Acero','Blanco','Negro','Rojo','Azul'],ARRAY['12 oz','20 oz','30 oz'],ARRAY['Acero inoxidable','Tapa antiderrame','Grabado o impresión UV','3 tamaños'],'tumbler,steel,thermos',true,true,false,false,380,NULL,60,190,4.9),
(ek_uuid('prod:termo-30oz-personalizado'),'Termo 30 oz Personalizado','termo-30oz-personalizado','Termo grande de 30 oz, ideal para el gym, la oficina o el diario.',ARRAY['Acero','Blanco','Negro','Turquesa'],ARRAY['20 oz','30 oz','40 oz'],ARRAY['Doble pared','Mango opcional','Popote incluido','Personalizado'],'tumbler,large,bottle',false,true,false,true,450,520,44,128,4.9),
(ek_uuid('prod:funda-celular-personalizada'),'Funda para Celular Personalizada','funda-celular-personalizada','Funda personalizada con tu foto, logo o el diseño que quieras.',ARRAY['Transparente','Negro','Blanco','Rosa'],ARRAY['iPhone','Samsung','Xiaomi','Huawei','Otro modelo'],ARRAY['Impresión UV resistente','Varios modelos','No se despinta','Protege tu equipo'],'phone,case,custom',false,true,false,false,220,NULL,120,280,4.6),
(ek_uuid('prod:etiquetas-adhesivas-personalizadas'),'Etiquetas Adhesivas Personalizadas','etiquetas-adhesivas-personalizadas','Etiquetas para tus productos, tu marca personal o tu negocio.',ARRAY['Blanco','Transparente','Kraft','Dorado'],ARRAY['50 pz','100 pz','250 pz','500 pz'],ARRAY['Adhesivo resistente','Corte a medida','Ideal emprendedores','Precio de mayoreo'],'stickers,labels,branding',false,true,false,false,150,NULL,200,540,4.8),
(ek_uuid('prod:pines-personalizados'),'Pines Personalizados','pines-personalizados','Pines personalizados con tu diseño: ideales para eventos y campañas.',ARRAY['Dorado','Plateado','Blanco','Multicolor'],ARRAY['25 pz','50 pz','100 pz','200 pz'],ARRAY['Precio por pieza','Cierre metálico','Diseño a todo color','Mayoreo disponible'],'pin,badge,button',true,true,false,false,35,NULL,500,1600,4.8),
(ek_uuid('prod:llavero-mdf-personalizado'),'Llavero MDF Personalizado','llavero-mdf-personalizado','Llavero de MDF personalizado con nombre, logo o frase.',ARRAY['Natural','Blanco','Negro','Rojo','Dorado'],ARRAY['1 pieza','10 piezas','25 piezas','50 piezas'],ARRAY['Grabado o impresión UV','Argolla reforzada','Precio por pieza','Listo en 24 h'],'keychain,wood,custom',true,true,false,false,45,NULL,400,1480,4.9),
(ek_uuid('prod:llavero-acrilico-personalizado'),'Llavero Acrílico Personalizado','llavero-acrilico-personalizado','Llavero de acrílico con acabado brillante y corte a la forma de tu diseño.',ARRAY['Transparente','Blanco','Negro','Rosa'],ARRAY['3 mm','5 mm','Doble cara'],ARRAY['Acrílico 3 mm','Corte a forma','Impresión UV','Económico'],'acrylic,keychain,clear',false,true,false,false,55,NULL,260,720,4.7),
(ek_uuid('prod:llavero-dtf-uv-doble-cara'),'Llavero DTF UV Doble Cara','llavero-dtf-uv-doble-cara','Llavero con estampado DTF UV por ambos lados, súper resistente.',ARRAY['Blanco','Negro','Multicolor'],ARRAY['1 pieza','10 piezas','25 piezas','50 piezas'],ARRAY['Doble cara','No se borra','Súper ligero','Precio de mayoreo'],'keychain,double,print',false,true,false,false,65,NULL,220,640,4.8),
(ek_uuid('prod:placa-reconocimiento-uv'),'Placa de Reconocimiento UV','placa-reconocimiento-uv','Placa de reconocimiento con impresión UV y base para escritorio.',ARRAY['Transparente','Dorado','Natural'],ARRAY['15x20 cm','20x25 cm','30x40 cm'],ARRAY['Acabado premium','Base incluida','Texto personalizado','Ideal para empresas'],'award,plaque,trophy',false,true,false,true,320,380,30,68,4.9),
(ek_uuid('prod:botella-personalizada-dtf-llavero'),'Botella Personalizada DTF UV + Llavero Gratis','botella-personalizada-dtf-llavero','Personaliza tu botella con DTF UV y llévate GRATIS un llavero de MDF personalizado.',ARRAY['Transparente','Ámbar','Verde','Azul'],ARRAY['330 ml','500 ml','750 ml','1 L'],ARRAY['Llavero de regalo','Diseño con tu equipo o nombre','Acabado duradero','Ideal para eventos'],'bottle,custom,drink',false,true,false,true,250,300,140,520,4.9),
(ek_uuid('prod:cilindro-1l-personalizado'),'Cilindro 1 L Personalizado','cilindro-1l-personalizado','Cilindro personalizado con iniciales: el recuerdo elegante para tu evento.',ARRAY['Transparente','Ámbar','Azul'],ARRAY['500 ml','1 L','1.75 L'],ARRAY['DTF UV duradero','Acabado elegante','Mayoreo para eventos','Entrega programada'],'glass,bottle,wedding',true,true,false,false,280,NULL,110,380,4.9),
(ek_uuid('prod:vaso-cervecero-personalizado'),'Vaso Cervecero Personalizado','vaso-cervecero-personalizado','Vaso cervecero personalizado: el regalo perfecto para papá o los amigos.',ARRAY['Transparente','Ámbar'],ARRAY['350 ml','500 ml','1 L'],ARRAY['Grabado resistente','Capacidad real','Ideal para regalo','Se lava a mano'],'beer,glass,mug',false,true,false,false,230,NULL,95,240,4.7),
(ek_uuid('prod:lampara-led-personalizada'),'Lámpara LED Personalizada','lampara-led-personalizada','Lámpara LED con tu diseño grabado y luz cálida o RGB.',ARRAY['Blanco','Cálido','RGB'],ARRAY['15 cm','20 cm','25 cm','30 cm'],ARRAY['Luz LED regulable','Grabado a láser','Base de madera','Cable USB incluido'],'led,lamp,night',true,true,false,false,380,450,40,160,4.9),
(ek_uuid('prod:lampara-led-3d-acrilico'),'Lámpara LED 3D Acrílico','lampara-led-3d-acrilico','Lámpara 3D de acrílico grabado con un efecto visual impresionante.',ARRAY['Blanco','RGB'],ARRAY['15 cm','20 cm','25 cm'],ARRAY['Efecto 3D','7 colores','Control táctil','Regalo estrella'],'3d,lamp,acrylic',false,true,false,false,450,NULL,32,118,4.8),
(ek_uuid('prod:lampara-led-base-madera'),'Lámpara LED Base de Madera','lampara-led-base-madera','Lámpara LED con base de madera natural y acrílico grabado.',ARRAY['Natural','Nogal','Blanco'],ARRAY['18 cm','22 cm','28 cm'],ARRAY['Madera natural','Acrílico 4 mm','Luz cálida','Hecho a mano'],'wood,lamp,led',false,true,false,false,420,NULL,26,74,4.8),
(ek_uuid('prod:charola-portapapeles-mdf'),'Charola Portapapeles MDF','charola-portapapeles-mdf','Charola portapapeles de MDF: práctica, resistente y personalizada.',ARRAY['Natural','Blanco','Negro','Dorado'],ARRAY['20x30 cm','25x35 cm','30x40 cm'],ARRAY['MDF 6 mm','Grabado personalizado','Sellado protector','Varios tamaños'],'tray,wood,clipboard',false,true,false,false,220,NULL,48,140,4.8),
(ek_uuid('prod:charola-decorativa-mdf'),'Charola Decorativa MDF','charola-decorativa-mdf','Charola decorativa con asas, ideal para desayunos sorpresa o regalo.',ARRAY['Natural','Blanco','Dorado'],ARRAY['25x35 cm','30x40 cm','35x45 cm'],ARRAY['Con asas','Sellado contra humedad','Diseño impreso en UV','Fácil de limpiar'],'serving,tray,decorative',false,true,false,true,260,300,34,96,4.8),
(ek_uuid('prod:portarretrato-mdf-personalizado'),'Portarretrato MDF Personalizado','portarretrato-mdf-personalizado','Portarretrato de MDF con frase, nombre o fecha grabada.',ARRAY['Natural','Blanco','Negro','Dorado'],ARRAY['4x6 pulg','5x7 pulg','6x8 pulg'],ARRAY['Grabado a láser','Base de mesa','Acrílico protector','3 medidas'],'photo,frame,wood',false,true,false,false,190,NULL,52,132,4.8),
(ek_uuid('prod:organizador-escritorio-mdf'),'Organizador de Escritorio MDF','organizador-escritorio-mdf','Organizador de escritorio en MDF para tu oficina o espacio de estudio.',ARRAY['Natural','Blanco','Negro'],ARRAY['3 divisiones','4 divisiones','5 divisiones'],ARRAY['Armado 3D','Varias divisiones','Grabado opcional','Resistente'],'desk,organizer,wood',false,true,false,false,290,NULL,26,62,4.7),
(ek_uuid('prod:reloj-mdf-personalizado'),'Reloj MDF Personalizado','reloj-mdf-personalizado','Reloj de pared en MDF con diseño y nombre personalizado.',ARRAY['Natural','Blanco','Negro','Dorado'],ARRAY['20 cm','25 cm','30 cm','40 cm'],ARRAY['Maquinaria silenciosa','Grabado personalizado','Pila incluida','4 tamaños'],'clock,wood,wall',false,true,false,false,340,NULL,30,88,4.8),
(ek_uuid('prod:cuadro-luz-led'),'Cuadro de Luz LED','cuadro-luz-led','Cuadro de luz LED con tu foto o frase favorita grabada.',ARRAY['Cálido','Blanco','RGB'],ARRAY['20x20 cm','30x30 cm','40x40 cm'],ARRAY['Iluminación LED','Grabado fino','Para colgar o base','Enchufe USB'],'led,light,frame',false,true,false,true,520,620,20,54,4.9),
(ek_uuid('prod:portallaves-pared-mdf'),'Portallaves de Pared MDF','portallaves-pared-mdf','Portallaves de pared con ganchos metálicos y diseño personalizado.',ARRAY['Natural','Blanco','Negro','Dorado'],ARRAY['20 cm','30 cm','40 cm'],ARRAY['Ganchos metálicos','Grabado incluido','Fácil instalación','Regalo útil'],'key,holder,wall',false,true,false,false,180,NULL,44,118,4.7),
(ek_uuid('prod:cilindros-boda-iniciales'),'Cilindros para Boda con Iniciales','cilindros-boda-iniciales','Cilindros personalizados con las iniciales de los novios. Hicimos 80 para una boda.',ARRAY['Transparente','Ámbar'],ARRAY['50 pz','80 pz','100 pz','150 pz'],ARRAY['Precio por pieza','Acabado duradero y elegante','Recuerdo perfecto para invitados','Mayoreo para eventos'],'wedding,bottle,favors',true,true,false,false,95,NULL,500,2400,5),
(ek_uuid('prod:recuerdo-boda-mdf'),'Recuerdo de Boda MDF Personalizado','recuerdo-boda-mdf','Recuerdo de boda en MDF con los nombres y la fecha grabados.',ARRAY['Natural','Dorado','Blanco'],ARRAY['50 pz','100 pz','150 pz'],ARRAY['Nombres y fecha','Precio por pieza','Entrega programada','Empaque individual'],'wedding,favor,wood',false,true,false,false,75,NULL,400,1100,4.9),
(ek_uuid('prod:letrero-mr-mrs-mdf'),'Letrero Mr & Mrs MDF','letrero-mr-mrs-mdf','Letrero Mr & Mrs para decorar el banquete o la sesión de fotos.',ARRAY['Dorado','Natural','Blanco','Negro'],ARRAY['30 cm','40 cm','50 cm'],ARRAY['Acabado espejo','Corte láser','Reutilizable','3 tamaños'],'wedding,mr,mrs,sign',false,true,false,true,290,340,24,62,4.9),
(ek_uuid('prod:numeros-mesa-mdf'),'Números de Mesa MDF','numeros-mesa-mdf','Números de mesa en MDF con base: elegantes y reutilizables.',ARRAY['Natural','Dorado','Blanco'],ARRAY['1-10','1-15','1-20','1-30'],ARRAY['Base incluida','Precio por pieza','Acabado mate o brillante','Sets a tu medida'],'table,numbers,wedding',false,true,false,false,85,NULL,90,280,4.8),
(ek_uuid('prod:libro-firmas-mdf'),'Libro de Firmas MDF','libro-firmas-mdf','Libro de firmas con portada de MDF grabada para tu evento.',ARRAY['Natural','Dorado','Blanco'],ARRAY['20x25 cm','25x30 cm','30x40 cm'],ARRAY['Portada grabada','Hojas de calidad','Nombres incluidos','Recuerdo duradero'],'guestbook,wedding,book',false,true,false,false,380,NULL,18,44,4.9),
(ek_uuid('prod:topper-pastel-boda'),'Topper para Pastel de Boda','topper-pastel-boda','Topper para pastel de boda con iniciales o frase personalizada.',ARRAY['Dorado','Blanco','Natural'],ARRAY['12 cm','15 cm','20 cm'],ARRAY['Personalizado','Reutilizable','Palillo reforzado','Varios estilos'],'cake,topper,wedding',false,true,false,false,150,NULL,70,190,4.8),
(ek_uuid('prod:invitaciones-dtf-uv'),'Invitaciones DTF UV','invitaciones-dtf-uv','Invitaciones impresas en DTF UV para bodas, XV años y eventos.',ARRAY['Blanco','Kraft','Dorado','Rosa'],ARRAY['50 pz','100 pz','150 pz','200 pz'],ARRAY['Impresión UV nítida','Precio por pieza','Diseño incluido','Entrega rápida'],'invitation,card,wedding',false,true,false,false,45,NULL,350,820,4.7),
(ek_uuid('prod:corona-xv-anos-decorada'),'Corona XV Años Decorada','corona-xv-anos-decorada','Corona decorada para XV años: el accesorio estrella de la sesión de fotos.',ARRAY['Dorado','Plateado','Rosa'],ARRAY['20 cm','25 cm','30 cm'],ARRAY['Piedras y perlas','Base reforzada','Peine incluido','Se ajusta a la cabeza'],'tiara,crown,quinceanera',false,true,false,true,320,380,22,58,4.8),
(ek_uuid('prod:calaverita-mdf-dia-muertos'),'Calaverita MDF Día de Muertos','calaverita-mdf-dia-muertos','Calaverita de MDF decorada para tu ofrenda, altar o pared.',ARRAY['Blanco','Negro','Multicolor','Dorado'],ARRAY['15 cm','20 cm','30 cm'],ARRAY['Pintura a mano','Diseño mexicano','Base opcional','Varios estilos'],'dayofthedead,skull,muertos',true,true,false,false,120,NULL,85,250,4.9),
(ek_uuid('prod:catrina-decorativa-30cm'),'Catrina Decorativa 30 cm','catrina-decorativa-30cm','Catrina decorativa de MDF con detalles florales pintados a mano.',ARRAY['Multicolor','Blanco','Negro'],ARRAY['20 cm','30 cm','40 cm','50 cm'],ARRAY['Pintada a mano','MDF 3 mm','Base incluida','Pieza de colección'],'catrina,dayofthedead,mexico',false,true,false,true,380,450,30,96,5),
(ek_uuid('prod:arreglo-floral-dia-muertos'),'Arreglo Floral Día de Muertos','arreglo-floral-dia-muertos','Arreglo floral con cempasúchil artificial que nunca se marchita.',ARRAY['Naranja','Morado','Rojo'],ARRAY['25x20 cm','30x25 cm','35x30 cm'],ARRAY['Cempasúchil artificial','Reutilizable cada año','Base decorada','Hecho a mano'],'marigold,dayofthedead,flowers',false,true,false,false,260,NULL,24,62,4.8),
(ek_uuid('prod:set-ofrenda-mdf'),'Set Ofrenda MDF','set-ofrenda-mdf','Set de piezas de MDF para montar tu ofrenda completa.',ARRAY['Natural','Multicolor','Naranja'],ARRAY['Set 5 piezas','Set 8 piezas','Set 12 piezas'],ARRAY['Pan de muerto decorativo','Velas decoradas','Papel picado incluido','Set armado'],'altar,dayofthedead,offering',false,true,false,false,340,NULL,26,70,4.8),
(ek_uuid('prod:guirnalda-papel-picado-mdf'),'Guirnalda Papel Picado MDF','guirnalda-papel-picado-mdf','Guirnalda de papel picado en MDF: resistente y reutilizable.',ARRAY['Multicolor','Rosa','Morado'],ARRAY['1.5 m','2 m','3 m'],ARRAY['No se rompe','Reutilizable','Cordón incluido','Diseño tradicional'],'papel,picado,bunting',false,true,false,false,150,NULL,60,140,4.7),
(ek_uuid('prod:taza-dia-madres-personalizada'),'Taza Día de las Madres Personalizada','taza-dia-madres-personalizada','Taza personalizada para mamá con foto, nombre o mensaje especial.',ARRAY['Blanco','Interior rosa','Interior rojo'],ARRAY['11 oz','15 oz','Set 2 piezas'],ARRAY['Foto y texto incluidos','Impresión UV','Caja de regalo','Entrega rápida'],'mothersday,mug,gift',true,true,false,false,180,220,120,430,4.9),
(ek_uuid('prod:letrero-feliz-dia-mama'),'Letrero Feliz Día Mamá MDF','letrero-feliz-dia-mama','Letrero decorativo para el Día de las Madres, personalizable con su nombre.',ARRAY['Rosa','Dorado','Blanco','Natural'],ARRAY['20 cm','30 cm','40 cm'],ARRAY['Nombre incluido','Acabado brillante','Para base o pared','Regalo emotivo'],'mothersday,sign,love',false,true,false,false,210,NULL,55,160,4.8),
(ek_uuid('prod:taza-dia-padres-personalizada'),'Taza Día del Padre Personalizada','taza-dia-padres-personalizada','Taza para papá con la frase, foto o logo que él elija.',ARRAY['Blanco','Negro','Interior azul'],ARRAY['11 oz','15 oz','Set 2 piezas'],ARRAY['Personalizada','Impresión UV','Caja de regalo','Ideal para papá'],'fathersday,mug,gift',false,true,false,false,180,NULL,100,320,4.8),
(ek_uuid('prod:llavero-papa-mdf'),'Llavero Papá MDF Grabado','llavero-papa-mdf','Llavero grabado con una frase para papá: detalle pequeño, recuerdo grande.',ARRAY['Natural','Negro','Dorado'],ARRAY['1 pieza','5 piezas','10 piezas','25 piezas'],ARRAY['Grabado a láser','Argolla reforzada','Precio por pieza','Listo en 24 h'],'keychain,dad,wood',false,true,false,false,55,NULL,220,480,4.7),
(ek_uuid('prod:alcancia-mdf-personalizada'),'Alcancía MDF Personalizada','alcancia-mdf-personalizada','Alcancía de MDF personalizada con el nombre del peque: enseña y decora.',ARRAY['Natural','Blanco','Rosa','Azul'],ARRAY['12 cm','15 cm','20 cm'],ARRAY['Con tapa y candado','Nombre grabado','Pintura no tóxica','3 tamaños'],'piggy,bank,kids,wood',false,true,false,false,190,NULL,75,210,4.8),
(ek_uuid('prod:set-bloques-didacticos-mdf'),'Set Bloques Didácticos MDF','set-bloques-didacticos-mdf','Bloques didácticos de MDF con letras y números para aprender jugando.',ARRAY['Multicolor','Natural'],ARRAY['Set 6 piezas','Set 10 piezas','Set 15 piezas'],ARRAY['Pintura no tóxica','Bordes redondeados','Letras y números','Empaque de regalo'],'blocks,toys,kids,wooden',false,true,false,true,240,290,40,96,4.9),
(ek_uuid('prod:calabaza-halloween-mdf'),'Calabaza Halloween MDF','calabaza-halloween-mdf','Calabaza de Halloween en MDF para decorar la entrada o el interior.',ARRAY['Naranja','Negro','Blanco'],ARRAY['15 cm','20 cm','30 cm'],ARRAY['Pintura a mano','Se arma en 3D','Reutilizable','Varios tamaños'],'halloween,pumpkin,decor',false,true,false,false,180,NULL,65,180,4.8),
(ek_uuid('prod:arreglo-floral-primavera'),'Arreglo Floral Primavera 25x20','arreglo-floral-primavera','Arreglo floral de primavera que nunca se marchita: color todo el año.',ARRAY['Rosa','Blanco','Amarillo','Morado','Verde'],ARRAY['25x20 cm','30x25 cm','35x30 cm'],ARRAY['Flores artificiales premium','Base decorada','Hecho a mano','5 colores disponibles'],'spring,flowers,bouquet',false,true,false,false,160,NULL,28,82,4.8)
ON CONFLICT ("slug") DO UPDATE SET "nombre"=EXCLUDED."nombre", "descripcion"=EXCLUDED."descripcion", "colores"=EXCLUDED."colores", "tallas"=EXCLUDED."tallas", "caracteristicas"=EXCLUDED."caracteristicas", "keywords"=EXCLUDED."keywords", "destacado"=EXCLUDED."destacado", "nuevo"=EXCLUDED."nuevo", "liquidacion"=EXCLUDED."liquidacion", "precioMinorista"=EXCLUDED."precioMinorista", "precioAnterior"=EXCLUDED."precioAnterior", "stock"=EXCLUDED."stock", "vendidos"=EXCLUDED."vendidos", "calificacion"=EXCLUDED."calificacion";

-- ── Relación Producto ↔ Categoría ────────────────────────
INSERT INTO "_CategoriaToProducto" ("A","B") VALUES
(ek_uuid('cat:navidad'),ek_uuid('prod:letrero-bienvenida-santa-40x35')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:letrero-bienvenida-santa-40x35')),
(ek_uuid('cat:mdf'),ek_uuid('prod:letrero-bienvenida-santa-40x35')),
(ek_uuid('cat:navidad'),ek_uuid('prod:nacimiento-impresion-uv')),
(ek_uuid('cat:mdf'),ek_uuid('prod:nacimiento-impresion-uv')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:nacimiento-impresion-uv')),
(ek_uuid('cat:regalos'),ek_uuid('prod:nacimiento-impresion-uv')),
(ek_uuid('cat:navidad'),ek_uuid('prod:rampa-navidad-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:rampa-navidad-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:rampa-navidad-mdf')),
(ek_uuid('cat:navidad'),ek_uuid('prod:arbolito-navideno-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:arbolito-navideno-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:arbolito-navideno-mdf')),
(ek_uuid('cat:navidad'),ek_uuid('prod:familia-venados-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:familia-venados-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:familia-venados-mdf')),
(ek_uuid('cat:navidad'),ek_uuid('prod:esferas-navidenas-m1-m4')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:esferas-navidenas-m1-m4')),
(ek_uuid('cat:navidad'),ek_uuid('prod:esferas-navidenas-set-12')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:esferas-navidenas-set-12')),
(ek_uuid('cat:regalos'),ek_uuid('prod:esferas-navidenas-set-12')),
(ek_uuid('cat:navidad'),ek_uuid('prod:santa-claus-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:santa-claus-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:santa-claus-mdf')),
(ek_uuid('cat:navidad'),ek_uuid('prod:gnomos-navidenos-10cm')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:gnomos-navidenos-10cm')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:gnomos-navidenos-10cm')),
(ek_uuid('cat:navidad'),ek_uuid('prod:arreglo-floral-navideno')),
(ek_uuid('cat:flores'),ek_uuid('prod:arreglo-floral-navideno')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:arreglo-floral-navideno')),
(ek_uuid('cat:navidad'),ek_uuid('prod:corona-navidad-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:corona-navidad-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:corona-navidad-mdf')),
(ek_uuid('cat:navidad'),ek_uuid('prod:trineo-decorativo-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:trineo-decorativo-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:trineo-decorativo-mdf')),
(ek_uuid('cat:navidad'),ek_uuid('prod:camino-mesa-navideno-dtf')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:camino-mesa-navideno-dtf')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('prod:camino-mesa-navideno-dtf')),
(ek_uuid('cat:navidad'),ek_uuid('prod:adorno-feliz-navidad-madera')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:adorno-feliz-navidad-madera')),
(ek_uuid('cat:mdf'),ek_uuid('prod:adorno-feliz-navidad-madera')),
(ek_uuid('cat:regalos'),ek_uuid('prod:adorno-feliz-navidad-madera')),
(ek_uuid('cat:navidad'),ek_uuid('prod:set-4-cuadros-navidenos-uv')),
(ek_uuid('cat:mdf'),ek_uuid('prod:set-4-cuadros-navidenos-uv')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:set-4-cuadros-navidenos-uv')),
(ek_uuid('cat:navidad'),ek_uuid('prod:botita-navidad-dulces')),
(ek_uuid('cat:regalos'),ek_uuid('prod:botita-navidad-dulces')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:botita-navidad-dulces')),
(ek_uuid('cat:navidad'),ek_uuid('prod:bota-navidad-dtf-personalizada')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:bota-navidad-dtf-personalizada')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:bota-navidad-dtf-personalizada')),
(ek_uuid('cat:regalos'),ek_uuid('prod:bota-navidad-dtf-personalizada')),
(ek_uuid('cat:navidad'),ek_uuid('prod:guirnalda-estrellas-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:guirnalda-estrellas-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:guirnalda-estrellas-mdf')),
(ek_uuid('cat:navidad'),ek_uuid('prod:vela-led-navidad-decorada')),
(ek_uuid('cat:lamparas'),ek_uuid('prod:vela-led-navidad-decorada')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:vela-led-navidad-decorada')),
(ek_uuid('cat:navidad'),ek_uuid('prod:topper-pastel-navideno')),
(ek_uuid('cat:regalos'),ek_uuid('prod:topper-pastel-navideno')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:topper-pastel-navideno')),
(ek_uuid('cat:playeras'),ek_uuid('prod:playera-grinch-merry-christmas')),
(ek_uuid('cat:navidad'),ek_uuid('prod:playera-grinch-merry-christmas')),
(ek_uuid('cat:playeras'),ek_uuid('prod:playera-copo-de-nieve')),
(ek_uuid('cat:navidad'),ek_uuid('prod:playera-copo-de-nieve')),
(ek_uuid('cat:playeras'),ek_uuid('prod:playera-merry-grinch-mas')),
(ek_uuid('cat:navidad'),ek_uuid('prod:playera-merry-grinch-mas')),
(ek_uuid('cat:playeras'),ek_uuid('prod:playera-navidad-familia-pack4')),
(ek_uuid('cat:navidad'),ek_uuid('prod:playera-navidad-familia-pack4')),
(ek_uuid('cat:regalos'),ek_uuid('prod:playera-navidad-familia-pack4')),
(ek_uuid('cat:playeras'),ek_uuid('prod:sudadera-navideno-personalizada')),
(ek_uuid('cat:navidad'),ek_uuid('prod:sudadera-navideno-personalizada')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:sudadera-navideno-personalizada')),
(ek_uuid('cat:playeras'),ek_uuid('prod:body-bebe-navideno')),
(ek_uuid('cat:navidad'),ek_uuid('prod:body-bebe-navideno')),
(ek_uuid('cat:regalos'),ek_uuid('prod:body-bebe-navideno')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('prod:porta-uvas-mdf-personalizado')),
(ek_uuid('cat:mdf'),ek_uuid('prod:porta-uvas-mdf-personalizado')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:porta-uvas-mdf-personalizado')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:porta-uvas-mdf-personalizado')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('prod:set-12-porta-uvas-mini')),
(ek_uuid('cat:mdf'),ek_uuid('prod:set-12-porta-uvas-mini')),
(ek_uuid('cat:regalos'),ek_uuid('prod:set-12-porta-uvas-mini')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('prod:corona-12-deseos-ano-nuevo')),
(ek_uuid('cat:mdf'),ek_uuid('prod:corona-12-deseos-ano-nuevo')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:corona-12-deseos-ano-nuevo')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('prod:letrero-feliz-ano-nuevo')),
(ek_uuid('cat:mdf'),ek_uuid('prod:letrero-feliz-ano-nuevo')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:letrero-feliz-ano-nuevo')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('prod:copa-decorada-dtf-ano-nuevo')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:copa-decorada-dtf-ano-nuevo')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:copa-decorada-dtf-ano-nuevo')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('prod:kit-brindis-6-copas-porta-uvas')),
(ek_uuid('cat:regalos'),ek_uuid('prod:kit-brindis-6-copas-porta-uvas')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:kit-brindis-6-copas-porta-uvas')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('prod:banderin-ano-nuevo-dtf')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:banderin-ano-nuevo-dtf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:banderin-ano-nuevo-dtf')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:paquete-amor-amistad-1')),
(ek_uuid('cat:regalos'),ek_uuid('prod:paquete-amor-amistad-1')),
(ek_uuid('cat:mdf'),ek_uuid('prod:paquete-amor-amistad-1')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:paquete-amor-amistad-2')),
(ek_uuid('cat:regalos'),ek_uuid('prod:paquete-amor-amistad-2')),
(ek_uuid('cat:mdf'),ek_uuid('prod:paquete-amor-amistad-2')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:paquete-amor-amistad-3')),
(ek_uuid('cat:regalos'),ek_uuid('prod:paquete-amor-amistad-3')),
(ek_uuid('cat:mdf'),ek_uuid('prod:paquete-amor-amistad-3')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:gnomos-enamorados-10cm')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:gnomos-enamorados-10cm')),
(ek_uuid('cat:mdf'),ek_uuid('prod:gnomos-enamorados-10cm')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:caja-corazon-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:caja-corazon-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:caja-corazon-mdf')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:letrero-te-amo-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:letrero-te-amo-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:letrero-te-amo-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:letrero-te-amo-mdf')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:arreglo-floral-san-valentin')),
(ek_uuid('cat:flores'),ek_uuid('prod:arreglo-floral-san-valentin')),
(ek_uuid('cat:regalos'),ek_uuid('prod:arreglo-floral-san-valentin')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:globo-burbuja-con-mensaje')),
(ek_uuid('cat:regalos'),ek_uuid('prod:globo-burbuja-con-mensaje')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:globo-burbuja-con-mensaje')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:set-2-tazas-pareja')),
(ek_uuid('cat:tazas-termos'),ek_uuid('prod:set-2-tazas-pareja')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:set-2-tazas-pareja')),
(ek_uuid('cat:regalos'),ek_uuid('prod:set-2-tazas-pareja')),
(ek_uuid('cat:amor-amistad'),ek_uuid('prod:llavero-pareja-mdf')),
(ek_uuid('cat:llaveros-pines'),ek_uuid('prod:llavero-pareja-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:llavero-pareja-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:llavero-pareja-mdf')),
(ek_uuid('cat:graduacion'),ek_uuid('prod:oso-graduacion-firmar-30cm')),
(ek_uuid('cat:regalos'),ek_uuid('prod:oso-graduacion-firmar-30cm')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:oso-graduacion-firmar-30cm')),
(ek_uuid('cat:graduacion'),ek_uuid('prod:oso-graduacion-40cm')),
(ek_uuid('cat:regalos'),ek_uuid('prod:oso-graduacion-40cm')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:oso-graduacion-40cm')),
(ek_uuid('cat:graduacion'),ek_uuid('prod:oso-graduacion-50cm')),
(ek_uuid('cat:regalos'),ek_uuid('prod:oso-graduacion-50cm')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:oso-graduacion-50cm')),
(ek_uuid('cat:graduacion'),ek_uuid('prod:pin-personalizado-graduacion')),
(ek_uuid('cat:llaveros-pines'),ek_uuid('prod:pin-personalizado-graduacion')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:pin-personalizado-graduacion')),
(ek_uuid('cat:regalos'),ek_uuid('prod:pin-personalizado-graduacion')),
(ek_uuid('cat:graduacion'),ek_uuid('prod:birrete-decorativo-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:birrete-decorativo-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:birrete-decorativo-mdf')),
(ek_uuid('cat:graduacion'),ek_uuid('prod:letrero-felicidades-graduado')),
(ek_uuid('cat:mdf'),ek_uuid('prod:letrero-felicidades-graduado')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:letrero-felicidades-graduado')),
(ek_uuid('cat:graduacion'),ek_uuid('prod:marco-foto-graduacion-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:marco-foto-graduacion-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:marco-foto-graduacion-mdf')),
(ek_uuid('cat:graduacion'),ek_uuid('prod:set-20-osos-firmables-pines')),
(ek_uuid('cat:regalos'),ek_uuid('prod:set-20-osos-firmables-pines')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:set-20-osos-firmables-pines')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:maquila-dtf-uv-38x100')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:maquila-dtf-uv-38x100')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:maquila-dtf-uv-hoja-a4')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:maquila-dtf-uv-hoja-a4')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:transfer-dtf-uv-metro')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:transfer-dtf-uv-metro')),
(ek_uuid('cat:tazas-termos'),ek_uuid('prod:taza-ceramica-personalizada')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:taza-ceramica-personalizada')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:taza-ceramica-personalizada')),
(ek_uuid('cat:regalos'),ek_uuid('prod:taza-ceramica-personalizada')),
(ek_uuid('cat:tazas-termos'),ek_uuid('prod:taza-magica-cambia-color')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:taza-magica-cambia-color')),
(ek_uuid('cat:regalos'),ek_uuid('prod:taza-magica-cambia-color')),
(ek_uuid('cat:tazas-termos'),ek_uuid('prod:taza-color-interior')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:taza-color-interior')),
(ek_uuid('cat:tazas-termos'),ek_uuid('prod:termo-20oz-personalizado')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:termo-20oz-personalizado')),
(ek_uuid('cat:regalos'),ek_uuid('prod:termo-20oz-personalizado')),
(ek_uuid('cat:tazas-termos'),ek_uuid('prod:termo-30oz-personalizado')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:termo-30oz-personalizado')),
(ek_uuid('cat:regalos'),ek_uuid('prod:termo-30oz-personalizado')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:funda-celular-personalizada')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:funda-celular-personalizada')),
(ek_uuid('cat:regalos'),ek_uuid('prod:funda-celular-personalizada')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:etiquetas-adhesivas-personalizadas')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:etiquetas-adhesivas-personalizadas')),
(ek_uuid('cat:regalos'),ek_uuid('prod:etiquetas-adhesivas-personalizadas')),
(ek_uuid('cat:llaveros-pines'),ek_uuid('prod:pines-personalizados')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:pines-personalizados')),
(ek_uuid('cat:regalos'),ek_uuid('prod:pines-personalizados')),
(ek_uuid('cat:llaveros-pines'),ek_uuid('prod:llavero-mdf-personalizado')),
(ek_uuid('cat:mdf'),ek_uuid('prod:llavero-mdf-personalizado')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:llavero-mdf-personalizado')),
(ek_uuid('cat:regalos'),ek_uuid('prod:llavero-mdf-personalizado')),
(ek_uuid('cat:llaveros-pines'),ek_uuid('prod:llavero-acrilico-personalizado')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:llavero-acrilico-personalizado')),
(ek_uuid('cat:llaveros-pines'),ek_uuid('prod:llavero-dtf-uv-doble-cara')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:llavero-dtf-uv-doble-cara')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:llavero-dtf-uv-doble-cara')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:placa-reconocimiento-uv')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:placa-reconocimiento-uv')),
(ek_uuid('cat:regalos'),ek_uuid('prod:placa-reconocimiento-uv')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:botella-personalizada-dtf-llavero')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:botella-personalizada-dtf-llavero')),
(ek_uuid('cat:regalos'),ek_uuid('prod:botella-personalizada-dtf-llavero')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:botella-personalizada-dtf-llavero')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:cilindro-1l-personalizado')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:cilindro-1l-personalizado')),
(ek_uuid('cat:regalos'),ek_uuid('prod:cilindro-1l-personalizado')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:vaso-cervecero-personalizado')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:vaso-cervecero-personalizado')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('prod:vaso-cervecero-personalizado')),
(ek_uuid('cat:lamparas'),ek_uuid('prod:lampara-led-personalizada')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:lampara-led-personalizada')),
(ek_uuid('cat:regalos'),ek_uuid('prod:lampara-led-personalizada')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:lampara-led-personalizada')),
(ek_uuid('cat:lamparas'),ek_uuid('prod:lampara-led-3d-acrilico')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:lampara-led-3d-acrilico')),
(ek_uuid('cat:regalos'),ek_uuid('prod:lampara-led-3d-acrilico')),
(ek_uuid('cat:lamparas'),ek_uuid('prod:lampara-led-base-madera')),
(ek_uuid('cat:mdf'),ek_uuid('prod:lampara-led-base-madera')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:lampara-led-base-madera')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('prod:lampara-led-base-madera')),
(ek_uuid('cat:mdf'),ek_uuid('prod:charola-portapapeles-mdf')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('prod:charola-portapapeles-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:charola-portapapeles-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:charola-decorativa-mdf')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('prod:charola-decorativa-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:charola-decorativa-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:charola-decorativa-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:portarretrato-mdf-personalizado')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('prod:portarretrato-mdf-personalizado')),
(ek_uuid('cat:regalos'),ek_uuid('prod:portarretrato-mdf-personalizado')),
(ek_uuid('cat:mdf'),ek_uuid('prod:organizador-escritorio-mdf')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('prod:organizador-escritorio-mdf')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:organizador-escritorio-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:reloj-mdf-personalizado')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('prod:reloj-mdf-personalizado')),
(ek_uuid('cat:regalos'),ek_uuid('prod:reloj-mdf-personalizado')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:reloj-mdf-personalizado')),
(ek_uuid('cat:lamparas'),ek_uuid('prod:cuadro-luz-led')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:cuadro-luz-led')),
(ek_uuid('cat:regalos'),ek_uuid('prod:cuadro-luz-led')),
(ek_uuid('cat:mdf'),ek_uuid('prod:portallaves-pared-mdf')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('prod:portallaves-pared-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:portallaves-pared-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:portallaves-pared-mdf')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:cilindros-boda-iniciales')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:cilindros-boda-iniciales')),
(ek_uuid('cat:regalos'),ek_uuid('prod:cilindros-boda-iniciales')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:recuerdo-boda-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:recuerdo-boda-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:recuerdo-boda-mdf')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:letrero-mr-mrs-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:letrero-mr-mrs-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:letrero-mr-mrs-mdf')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:numeros-mesa-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:numeros-mesa-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:numeros-mesa-mdf')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:libro-firmas-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:libro-firmas-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:libro-firmas-mdf')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:topper-pastel-boda')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:topper-pastel-boda')),
(ek_uuid('cat:regalos'),ek_uuid('prod:topper-pastel-boda')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:invitaciones-dtf-uv')),
(ek_uuid('cat:dtf-uv'),ek_uuid('prod:invitaciones-dtf-uv')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:invitaciones-dtf-uv')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('prod:corona-xv-anos-decorada')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:corona-xv-anos-decorada')),
(ek_uuid('cat:regalos'),ek_uuid('prod:corona-xv-anos-decorada')),
(ek_uuid('cat:dia-muertos'),ek_uuid('prod:calaverita-mdf-dia-muertos')),
(ek_uuid('cat:mdf'),ek_uuid('prod:calaverita-mdf-dia-muertos')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:calaverita-mdf-dia-muertos')),
(ek_uuid('cat:dia-muertos'),ek_uuid('prod:catrina-decorativa-30cm')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:catrina-decorativa-30cm')),
(ek_uuid('cat:mdf'),ek_uuid('prod:catrina-decorativa-30cm')),
(ek_uuid('cat:dia-muertos'),ek_uuid('prod:arreglo-floral-dia-muertos')),
(ek_uuid('cat:flores'),ek_uuid('prod:arreglo-floral-dia-muertos')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:arreglo-floral-dia-muertos')),
(ek_uuid('cat:dia-muertos'),ek_uuid('prod:set-ofrenda-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:set-ofrenda-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:set-ofrenda-mdf')),
(ek_uuid('cat:dia-muertos'),ek_uuid('prod:guirnalda-papel-picado-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:guirnalda-papel-picado-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:guirnalda-papel-picado-mdf')),
(ek_uuid('cat:dia-madres'),ek_uuid('prod:taza-dia-madres-personalizada')),
(ek_uuid('cat:tazas-termos'),ek_uuid('prod:taza-dia-madres-personalizada')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:taza-dia-madres-personalizada')),
(ek_uuid('cat:regalos'),ek_uuid('prod:taza-dia-madres-personalizada')),
(ek_uuid('cat:dia-madres'),ek_uuid('prod:letrero-feliz-dia-mama')),
(ek_uuid('cat:mdf'),ek_uuid('prod:letrero-feliz-dia-mama')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:letrero-feliz-dia-mama')),
(ek_uuid('cat:regalos'),ek_uuid('prod:letrero-feliz-dia-mama')),
(ek_uuid('cat:dia-padres'),ek_uuid('prod:taza-dia-padres-personalizada')),
(ek_uuid('cat:tazas-termos'),ek_uuid('prod:taza-dia-padres-personalizada')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:taza-dia-padres-personalizada')),
(ek_uuid('cat:regalos'),ek_uuid('prod:taza-dia-padres-personalizada')),
(ek_uuid('cat:dia-padres'),ek_uuid('prod:llavero-papa-mdf')),
(ek_uuid('cat:llaveros-pines'),ek_uuid('prod:llavero-papa-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:llavero-papa-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:llavero-papa-mdf')),
(ek_uuid('cat:dia-nino'),ek_uuid('prod:alcancia-mdf-personalizada')),
(ek_uuid('cat:mdf'),ek_uuid('prod:alcancia-mdf-personalizada')),
(ek_uuid('cat:personalizados'),ek_uuid('prod:alcancia-mdf-personalizada')),
(ek_uuid('cat:regalos'),ek_uuid('prod:alcancia-mdf-personalizada')),
(ek_uuid('cat:dia-nino'),ek_uuid('prod:set-bloques-didacticos-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:set-bloques-didacticos-mdf')),
(ek_uuid('cat:regalos'),ek_uuid('prod:set-bloques-didacticos-mdf')),
(ek_uuid('cat:halloween'),ek_uuid('prod:calabaza-halloween-mdf')),
(ek_uuid('cat:mdf'),ek_uuid('prod:calabaza-halloween-mdf')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:calabaza-halloween-mdf')),
(ek_uuid('cat:primavera'),ek_uuid('prod:arreglo-floral-primavera')),
(ek_uuid('cat:flores'),ek_uuid('prod:arreglo-floral-primavera')),
(ek_uuid('cat:decoracion'),ek_uuid('prod:arreglo-floral-primavera'))
ON CONFLICT ("A","B") DO NOTHING;

-- ── Relación Producto ↔ Subcategoría ─────────────────────
INSERT INTO "_ProductoToSubcategoria" ("A","B") VALUES
(ek_uuid('prod:letrero-bienvenida-santa-40x35'),ek_uuid('sub:letreros')),
(ek_uuid('prod:letrero-bienvenida-santa-40x35'),ek_uuid('sub:santa-venados')),
(ek_uuid('prod:nacimiento-impresion-uv'),ek_uuid('sub:nacimientos')),
(ek_uuid('prod:rampa-navidad-mdf'),ek_uuid('sub:nacimientos')),
(ek_uuid('prod:rampa-navidad-mdf'),ek_uuid('sub:coronas-rampas')),
(ek_uuid('prod:arbolito-navideno-mdf'),ek_uuid('sub:botas-dulceros')),
(ek_uuid('prod:arbolito-navideno-mdf'),ek_uuid('sub:arboles-figuras')),
(ek_uuid('prod:familia-venados-mdf'),ek_uuid('sub:santa-venados')),
(ek_uuid('prod:esferas-navidenas-m1-m4'),ek_uuid('sub:esferas')),
(ek_uuid('prod:esferas-navidenas-set-12'),ek_uuid('sub:esferas')),
(ek_uuid('prod:santa-claus-mdf'),ek_uuid('sub:santa-venados')),
(ek_uuid('prod:gnomos-navidenos-10cm'),ek_uuid('sub:gnomos')),
(ek_uuid('prod:arreglo-floral-navideno'),ek_uuid('sub:arreglos-florales')),
(ek_uuid('prod:corona-navidad-mdf'),ek_uuid('sub:coronas-rampas')),
(ek_uuid('prod:trineo-decorativo-mdf'),ek_uuid('sub:santa-venados')),
(ek_uuid('prod:trineo-decorativo-mdf'),ek_uuid('sub:botas-dulceros')),
(ek_uuid('prod:camino-mesa-navideno-dtf'),ek_uuid('sub:camino-mesa')),
(ek_uuid('prod:adorno-feliz-navidad-madera'),ek_uuid('sub:letreros')),
(ek_uuid('prod:set-4-cuadros-navidenos-uv'),ek_uuid('sub:cuadros-navidenos')),
(ek_uuid('prod:botita-navidad-dulces'),ek_uuid('sub:botas-dulceros')),
(ek_uuid('prod:bota-navidad-dtf-personalizada'),ek_uuid('sub:botas-dulceros')),
(ek_uuid('prod:guirnalda-estrellas-mdf'),ek_uuid('sub:arboles-figuras')),
(ek_uuid('prod:vela-led-navidad-decorada'),ek_uuid('sub:arboles-figuras')),
(ek_uuid('prod:vela-led-navidad-decorada'),ek_uuid('sub:lamparas')),
(ek_uuid('prod:topper-pastel-navideno'),ek_uuid('sub:toppers')),
(ek_uuid('prod:playera-grinch-merry-christmas'),ek_uuid('sub:playeras-navidenas')),
(ek_uuid('prod:playera-copo-de-nieve'),ek_uuid('sub:playeras-navidenas')),
(ek_uuid('prod:playera-merry-grinch-mas'),ek_uuid('sub:playeras-navidenas')),
(ek_uuid('prod:playera-navidad-familia-pack4'),ek_uuid('sub:playeras-navidenas')),
(ek_uuid('prod:playera-navidad-familia-pack4'),ek_uuid('sub:packs-familia')),
(ek_uuid('prod:sudadera-navideno-personalizada'),ek_uuid('sub:playeras-navidenas')),
(ek_uuid('prod:body-bebe-navideno'),ek_uuid('sub:playeras-navidenas')),
(ek_uuid('prod:body-bebe-navideno'),ek_uuid('sub:ninos')),
(ek_uuid('prod:porta-uvas-mdf-personalizado'),ek_uuid('sub:porta-uvas')),
(ek_uuid('prod:set-12-porta-uvas-mini'),ek_uuid('sub:packs-familia')),
(ek_uuid('prod:set-12-porta-uvas-mini'),ek_uuid('sub:porta-uvas')),
(ek_uuid('prod:set-12-porta-uvas-mini'),ek_uuid('sub:letreros-ano-nuevo')),
(ek_uuid('prod:corona-12-deseos-ano-nuevo'),ek_uuid('sub:letreros-ano-nuevo')),
(ek_uuid('prod:letrero-feliz-ano-nuevo'),ek_uuid('sub:letreros')),
(ek_uuid('prod:letrero-feliz-ano-nuevo'),ek_uuid('sub:letreros-ano-nuevo')),
(ek_uuid('prod:copa-decorada-dtf-ano-nuevo'),ek_uuid('sub:copas-brindis')),
(ek_uuid('prod:copa-decorada-dtf-ano-nuevo'),ek_uuid('sub:letreros-ano-nuevo')),
(ek_uuid('prod:kit-brindis-6-copas-porta-uvas'),ek_uuid('sub:porta-uvas')),
(ek_uuid('prod:kit-brindis-6-copas-porta-uvas'),ek_uuid('sub:copas-brindis')),
(ek_uuid('prod:banderin-ano-nuevo-dtf'),ek_uuid('sub:letreros-ano-nuevo')),
(ek_uuid('prod:paquete-amor-amistad-1'),ek_uuid('sub:botas-dulceros')),
(ek_uuid('prod:paquete-amor-amistad-1'),ek_uuid('sub:paquetes-regalo')),
(ek_uuid('prod:paquete-amor-amistad-2'),ek_uuid('sub:paquetes-regalo')),
(ek_uuid('prod:paquete-amor-amistad-3'),ek_uuid('sub:paquetes-regalo')),
(ek_uuid('prod:gnomos-enamorados-10cm'),ek_uuid('sub:gnomos')),
(ek_uuid('prod:caja-corazon-mdf'),ek_uuid('sub:botas-dulceros')),
(ek_uuid('prod:caja-corazon-mdf'),ek_uuid('sub:cajas-corazon')),
(ek_uuid('prod:letrero-te-amo-mdf'),ek_uuid('sub:letreros')),
(ek_uuid('prod:letrero-te-amo-mdf'),ek_uuid('sub:pines')),
(ek_uuid('prod:arreglo-floral-san-valentin'),ek_uuid('sub:arreglos-florales')),
(ek_uuid('prod:globo-burbuja-con-mensaje'),ek_uuid('sub:globos')),
(ek_uuid('prod:set-2-tazas-pareja'),ek_uuid('sub:para-pareja')),
(ek_uuid('prod:set-2-tazas-pareja'),ek_uuid('sub:tazas')),
(ek_uuid('prod:set-2-tazas-pareja'),ek_uuid('sub:termos')),
(ek_uuid('prod:llavero-pareja-mdf'),ek_uuid('sub:para-pareja')),
(ek_uuid('prod:llavero-pareja-mdf'),ek_uuid('sub:pines')),
(ek_uuid('prod:llavero-pareja-mdf'),ek_uuid('sub:llaveros')),
(ek_uuid('prod:oso-graduacion-firmar-30cm'),ek_uuid('sub:osos-firmar')),
(ek_uuid('prod:oso-graduacion-firmar-30cm'),ek_uuid('sub:birretes-coronas')),
(ek_uuid('prod:oso-graduacion-40cm'),ek_uuid('sub:osos-firmar')),
(ek_uuid('prod:oso-graduacion-40cm'),ek_uuid('sub:birretes-coronas')),
(ek_uuid('prod:oso-graduacion-50cm'),ek_uuid('sub:osos-firmar')),
(ek_uuid('prod:oso-graduacion-50cm'),ek_uuid('sub:birretes-coronas')),
(ek_uuid('prod:pin-personalizado-graduacion'),ek_uuid('sub:pines')),
(ek_uuid('prod:pin-personalizado-graduacion'),ek_uuid('sub:llaveros')),
(ek_uuid('prod:pin-personalizado-graduacion'),ek_uuid('sub:grupos')),
(ek_uuid('prod:birrete-decorativo-mdf'),ek_uuid('sub:birretes-coronas')),
(ek_uuid('prod:letrero-felicidades-graduado'),ek_uuid('sub:letreros')),
(ek_uuid('prod:marco-foto-graduacion-mdf'),ek_uuid('sub:marcos')),
(ek_uuid('prod:set-20-osos-firmables-pines'),ek_uuid('sub:osos-firmar')),
(ek_uuid('prod:set-20-osos-firmables-pines'),ek_uuid('sub:pines')),
(ek_uuid('prod:set-20-osos-firmables-pines'),ek_uuid('sub:grupos')),
(ek_uuid('prod:maquila-dtf-uv-38x100'),ek_uuid('sub:maquila')),
(ek_uuid('prod:maquila-dtf-uv-hoja-a4'),ek_uuid('sub:maquila')),
(ek_uuid('prod:maquila-dtf-uv-hoja-a4'),ek_uuid('sub:tazas')),
(ek_uuid('prod:transfer-dtf-uv-metro'),ek_uuid('sub:maquila')),
(ek_uuid('prod:taza-ceramica-personalizada'),ek_uuid('sub:tazas')),
(ek_uuid('prod:taza-ceramica-personalizada'),ek_uuid('sub:termos')),
(ek_uuid('prod:taza-magica-cambia-color'),ek_uuid('sub:tazas')),
(ek_uuid('prod:taza-magica-cambia-color'),ek_uuid('sub:termos')),
(ek_uuid('prod:taza-color-interior'),ek_uuid('sub:tazas')),
(ek_uuid('prod:taza-color-interior'),ek_uuid('sub:termos')),
(ek_uuid('prod:termo-20oz-personalizado'),ek_uuid('sub:tazas')),
(ek_uuid('prod:termo-20oz-personalizado'),ek_uuid('sub:termos')),
(ek_uuid('prod:termo-30oz-personalizado'),ek_uuid('sub:tazas')),
(ek_uuid('prod:termo-30oz-personalizado'),ek_uuid('sub:termos')),
(ek_uuid('prod:funda-celular-personalizada'),ek_uuid('sub:pines')),
(ek_uuid('prod:funda-celular-personalizada'),ek_uuid('sub:fundas')),
(ek_uuid('prod:etiquetas-adhesivas-personalizadas'),ek_uuid('sub:etiquetas')),
(ek_uuid('prod:pines-personalizados'),ek_uuid('sub:pines')),
(ek_uuid('prod:pines-personalizados'),ek_uuid('sub:llaveros')),
(ek_uuid('prod:llavero-mdf-personalizado'),ek_uuid('sub:pines')),
(ek_uuid('prod:llavero-mdf-personalizado'),ek_uuid('sub:llaveros')),
(ek_uuid('prod:llavero-acrilico-personalizado'),ek_uuid('sub:pines')),
(ek_uuid('prod:llavero-acrilico-personalizado'),ek_uuid('sub:llaveros')),
(ek_uuid('prod:llavero-dtf-uv-doble-cara'),ek_uuid('sub:pines')),
(ek_uuid('prod:llavero-dtf-uv-doble-cara'),ek_uuid('sub:llaveros')),
(ek_uuid('prod:placa-reconocimiento-uv'),ek_uuid('sub:placas')),
(ek_uuid('prod:botella-personalizada-dtf-llavero'),ek_uuid('sub:llaveros')),
(ek_uuid('prod:botella-personalizada-dtf-llavero'),ek_uuid('sub:botellas-cilindros')),
(ek_uuid('prod:cilindro-1l-personalizado'),ek_uuid('sub:botellas-cilindros')),
(ek_uuid('prod:vaso-cervecero-personalizado'),ek_uuid('sub:vasos')),
(ek_uuid('prod:lampara-led-personalizada'),ek_uuid('sub:lamparas')),
(ek_uuid('prod:lampara-led-3d-acrilico'),ek_uuid('sub:lamparas')),
(ek_uuid('prod:lampara-led-base-madera'),ek_uuid('sub:lamparas')),
(ek_uuid('prod:charola-portapapeles-mdf'),ek_uuid('sub:charolas')),
(ek_uuid('prod:charola-decorativa-mdf'),ek_uuid('sub:charolas')),
(ek_uuid('prod:portarretrato-mdf-personalizado'),ek_uuid('sub:portarretratos')),
(ek_uuid('prod:organizador-escritorio-mdf'),ek_uuid('sub:organizadores')),
(ek_uuid('prod:reloj-mdf-personalizado'),ek_uuid('sub:relojes')),
(ek_uuid('prod:cuadro-luz-led'),ek_uuid('sub:lamparas')),
(ek_uuid('prod:cuadro-luz-led'),ek_uuid('sub:cuadros-luz')),
(ek_uuid('prod:portallaves-pared-mdf'),ek_uuid('sub:organizadores')),
(ek_uuid('prod:cilindros-boda-iniciales'),ek_uuid('sub:botellas-cilindros')),
(ek_uuid('prod:recuerdo-boda-mdf'),ek_uuid('sub:recuerdos-boda')),
(ek_uuid('prod:letrero-mr-mrs-mdf'),ek_uuid('sub:letreros')),
(ek_uuid('prod:numeros-mesa-mdf'),ek_uuid('sub:numeros-mesa')),
(ek_uuid('prod:libro-firmas-mdf'),ek_uuid('sub:libro-firmas')),
(ek_uuid('prod:topper-pastel-boda'),ek_uuid('sub:toppers')),
(ek_uuid('prod:invitaciones-dtf-uv'),ek_uuid('sub:invitaciones')),
(ek_uuid('prod:corona-xv-anos-decorada'),ek_uuid('sub:birretes-coronas')),
(ek_uuid('prod:calaverita-mdf-dia-muertos'),ek_uuid('sub:calaveritas')),
(ek_uuid('prod:calaverita-mdf-dia-muertos'),ek_uuid('sub:ofrendas')),
(ek_uuid('prod:catrina-decorativa-30cm'),ek_uuid('sub:catrinas')),
(ek_uuid('prod:arreglo-floral-dia-muertos'),ek_uuid('sub:arreglos-florales')),
(ek_uuid('prod:set-ofrenda-mdf'),ek_uuid('sub:ofrendas')),
(ek_uuid('prod:guirnalda-papel-picado-mdf'),ek_uuid('sub:arboles-figuras')),
(ek_uuid('prod:guirnalda-papel-picado-mdf'),ek_uuid('sub:ofrendas')),
(ek_uuid('prod:taza-dia-madres-personalizada'),ek_uuid('sub:tazas')),
(ek_uuid('prod:taza-dia-madres-personalizada'),ek_uuid('sub:termos')),
(ek_uuid('prod:taza-dia-madres-personalizada'),ek_uuid('sub:cajas-regalo')),
(ek_uuid('prod:taza-dia-madres-personalizada'),ek_uuid('sub:mama')),
(ek_uuid('prod:letrero-feliz-dia-mama'),ek_uuid('sub:letreros')),
(ek_uuid('prod:letrero-feliz-dia-mama'),ek_uuid('sub:mama')),
(ek_uuid('prod:taza-dia-padres-personalizada'),ek_uuid('sub:tazas')),
(ek_uuid('prod:taza-dia-padres-personalizada'),ek_uuid('sub:termos')),
(ek_uuid('prod:taza-dia-padres-personalizada'),ek_uuid('sub:cajas-regalo')),
(ek_uuid('prod:taza-dia-padres-personalizada'),ek_uuid('sub:papa')),
(ek_uuid('prod:llavero-papa-mdf'),ek_uuid('sub:pines')),
(ek_uuid('prod:llavero-papa-mdf'),ek_uuid('sub:llaveros')),
(ek_uuid('prod:llavero-papa-mdf'),ek_uuid('sub:papa')),
(ek_uuid('prod:alcancia-mdf-personalizada'),ek_uuid('sub:pines')),
(ek_uuid('prod:alcancia-mdf-personalizada'),ek_uuid('sub:ninos')),
(ek_uuid('prod:set-bloques-didacticos-mdf'),ek_uuid('sub:pines')),
(ek_uuid('prod:set-bloques-didacticos-mdf'),ek_uuid('sub:ninos')),
(ek_uuid('prod:calabaza-halloween-mdf'),ek_uuid('sub:halloween')),
(ek_uuid('prod:arreglo-floral-primavera'),ek_uuid('sub:arreglos-florales'))
ON CONFLICT ("A","B") DO NOTHING;

-- ── Relación Categoría ↔ Subcategoría ────────────────────
INSERT INTO "_CategoriaToSubcategoria" ("A","B") VALUES
(ek_uuid('cat:navidad'),ek_uuid('sub:nacimientos')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:nacimientos')),
(ek_uuid('cat:navidad'),ek_uuid('sub:esferas')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:esferas')),
(ek_uuid('cat:navidad'),ek_uuid('sub:coronas-rampas')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:coronas-rampas')),
(ek_uuid('cat:navidad'),ek_uuid('sub:letreros')),
(ek_uuid('cat:graduacion'),ek_uuid('sub:letreros')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:letreros')),
(ek_uuid('cat:mdf'),ek_uuid('sub:letreros')),
(ek_uuid('cat:navidad'),ek_uuid('sub:gnomos')),
(ek_uuid('cat:amor-amistad'),ek_uuid('sub:gnomos')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:gnomos')),
(ek_uuid('cat:navidad'),ek_uuid('sub:santa-venados')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:santa-venados')),
(ek_uuid('cat:navidad'),ek_uuid('sub:botas-dulceros')),
(ek_uuid('cat:regalos'),ek_uuid('sub:botas-dulceros')),
(ek_uuid('cat:navidad'),ek_uuid('sub:arboles-figuras')),
(ek_uuid('cat:mdf'),ek_uuid('sub:arboles-figuras')),
(ek_uuid('cat:navidad'),ek_uuid('sub:cuadros-navidenos')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:cuadros-navidenos')),
(ek_uuid('cat:navidad'),ek_uuid('sub:camino-mesa')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('sub:camino-mesa')),
(ek_uuid('cat:playeras'),ek_uuid('sub:playeras-navidenas')),
(ek_uuid('cat:navidad'),ek_uuid('sub:playeras-navidenas')),
(ek_uuid('cat:playeras'),ek_uuid('sub:packs-familia')),
(ek_uuid('cat:regalos'),ek_uuid('sub:packs-familia')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('sub:porta-uvas')),
(ek_uuid('cat:mdf'),ek_uuid('sub:porta-uvas')),
(ek_uuid('cat:regalos'),ek_uuid('sub:porta-uvas')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('sub:copas-brindis')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:copas-brindis')),
(ek_uuid('cat:ano-nuevo'),ek_uuid('sub:letreros-ano-nuevo')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:letreros-ano-nuevo')),
(ek_uuid('cat:amor-amistad'),ek_uuid('sub:paquetes-regalo')),
(ek_uuid('cat:regalos'),ek_uuid('sub:paquetes-regalo')),
(ek_uuid('cat:amor-amistad'),ek_uuid('sub:cajas-corazon')),
(ek_uuid('cat:regalos'),ek_uuid('sub:cajas-corazon')),
(ek_uuid('cat:mdf'),ek_uuid('sub:cajas-corazon')),
(ek_uuid('cat:amor-amistad'),ek_uuid('sub:globos')),
(ek_uuid('cat:regalos'),ek_uuid('sub:globos')),
(ek_uuid('cat:amor-amistad'),ek_uuid('sub:para-pareja')),
(ek_uuid('cat:regalos'),ek_uuid('sub:para-pareja')),
(ek_uuid('cat:graduacion'),ek_uuid('sub:osos-firmar')),
(ek_uuid('cat:regalos'),ek_uuid('sub:osos-firmar')),
(ek_uuid('cat:graduacion'),ek_uuid('sub:pines')),
(ek_uuid('cat:llaveros-pines'),ek_uuid('sub:pines')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('sub:pines')),
(ek_uuid('cat:regalos'),ek_uuid('sub:pines')),
(ek_uuid('cat:graduacion'),ek_uuid('sub:birretes-coronas')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:birretes-coronas')),
(ek_uuid('cat:graduacion'),ek_uuid('sub:marcos')),
(ek_uuid('cat:mdf'),ek_uuid('sub:marcos')),
(ek_uuid('cat:regalos'),ek_uuid('sub:marcos')),
(ek_uuid('cat:dtf-uv'),ek_uuid('sub:maquila')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:maquila')),
(ek_uuid('cat:dtf-uv'),ek_uuid('sub:etiquetas')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:etiquetas')),
(ek_uuid('cat:dtf-uv'),ek_uuid('sub:invitaciones')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('sub:invitaciones')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:fundas')),
(ek_uuid('cat:dtf-uv'),ek_uuid('sub:fundas')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:placas')),
(ek_uuid('cat:dtf-uv'),ek_uuid('sub:placas')),
(ek_uuid('cat:regalos'),ek_uuid('sub:placas')),
(ek_uuid('cat:tazas-termos'),ek_uuid('sub:tazas')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:tazas')),
(ek_uuid('cat:regalos'),ek_uuid('sub:tazas')),
(ek_uuid('cat:dia-madres'),ek_uuid('sub:tazas')),
(ek_uuid('cat:dia-padres'),ek_uuid('sub:tazas')),
(ek_uuid('cat:tazas-termos'),ek_uuid('sub:termos')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:termos')),
(ek_uuid('cat:tazas-termos'),ek_uuid('sub:vasos')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('sub:vasos')),
(ek_uuid('cat:llaveros-pines'),ek_uuid('sub:llaveros')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:llaveros')),
(ek_uuid('cat:regalos'),ek_uuid('sub:llaveros')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('sub:botellas-cilindros')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:botellas-cilindros')),
(ek_uuid('cat:regalos'),ek_uuid('sub:botellas-cilindros')),
(ek_uuid('cat:lamparas'),ek_uuid('sub:lamparas')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:lamparas')),
(ek_uuid('cat:regalos'),ek_uuid('sub:lamparas')),
(ek_uuid('cat:lamparas'),ek_uuid('sub:cuadros-luz')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:cuadros-luz')),
(ek_uuid('cat:mdf'),ek_uuid('sub:charolas')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('sub:charolas')),
(ek_uuid('cat:mdf'),ek_uuid('sub:relojes')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('sub:relojes')),
(ek_uuid('cat:mdf'),ek_uuid('sub:portarretratos')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('sub:portarretratos')),
(ek_uuid('cat:regalos'),ek_uuid('sub:portarretratos')),
(ek_uuid('cat:mdf'),ek_uuid('sub:organizadores')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('sub:organizadores')),
(ek_uuid('cat:mdf'),ek_uuid('sub:portavasos')),
(ek_uuid('cat:hogar-cocina'),ek_uuid('sub:portavasos')),
(ek_uuid('cat:mdf'),ek_uuid('sub:separadores')),
(ek_uuid('cat:regalos'),ek_uuid('sub:separadores')),
(ek_uuid('cat:personalizados'),ek_uuid('sub:imanes')),
(ek_uuid('cat:regalos'),ek_uuid('sub:imanes')),
(ek_uuid('cat:mdf'),ek_uuid('sub:cajas-regalo')),
(ek_uuid('cat:regalos'),ek_uuid('sub:cajas-regalo')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('sub:recuerdos-boda')),
(ek_uuid('cat:regalos'),ek_uuid('sub:recuerdos-boda')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('sub:numeros-mesa')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:numeros-mesa')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('sub:libro-firmas')),
(ek_uuid('cat:regalos'),ek_uuid('sub:libro-firmas')),
(ek_uuid('cat:bodas-eventos'),ek_uuid('sub:toppers')),
(ek_uuid('cat:navidad'),ek_uuid('sub:toppers')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:toppers')),
(ek_uuid('cat:flores'),ek_uuid('sub:arreglos-florales')),
(ek_uuid('cat:amor-amistad'),ek_uuid('sub:arreglos-florales')),
(ek_uuid('cat:navidad'),ek_uuid('sub:arreglos-florales')),
(ek_uuid('cat:dia-muertos'),ek_uuid('sub:arreglos-florales')),
(ek_uuid('cat:primavera'),ek_uuid('sub:arreglos-florales')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:arreglos-florales')),
(ek_uuid('cat:dia-muertos'),ek_uuid('sub:calaveritas')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:calaveritas')),
(ek_uuid('cat:dia-muertos'),ek_uuid('sub:catrinas')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:catrinas')),
(ek_uuid('cat:dia-muertos'),ek_uuid('sub:ofrendas')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:ofrendas')),
(ek_uuid('cat:dia-madres'),ek_uuid('sub:mama')),
(ek_uuid('cat:regalos'),ek_uuid('sub:mama')),
(ek_uuid('cat:dia-padres'),ek_uuid('sub:papa')),
(ek_uuid('cat:regalos'),ek_uuid('sub:papa')),
(ek_uuid('cat:dia-nino'),ek_uuid('sub:ninos')),
(ek_uuid('cat:regalos'),ek_uuid('sub:ninos')),
(ek_uuid('cat:halloween'),ek_uuid('sub:halloween')),
(ek_uuid('cat:decoracion'),ek_uuid('sub:halloween')),
(ek_uuid('cat:graduacion'),ek_uuid('sub:grupos')),
(ek_uuid('cat:regalos'),ek_uuid('sub:grupos'))
ON CONFLICT ("A","B") DO NOTHING;

-- ── Banners ──────────────────────────────────────────────
INSERT INTO "Banner" ("id","titulo","subtitulo","enlace","boton","keywords","etiqueta","tema","orden","activo") VALUES
(ek_uuid('banner:0'),'Recibe el Año Nuevo con estilo y tradición','Porta uvas de MDF personalizado con DTF UV: diseño único y acabado brillante para hacer de tu mesa un momento inolvidable.','categoria.html?cat=ano-nuevo','Ver Año Nuevo','newyear,grapes,party','🍇 Año Nuevo 2025','rojo',0,true),
(ek_uuid('banner:1'),'Llena tu hogar de espíritu navideño','Nacimientos, rampas navideñas y figuras decorativas en diferentes estilos. Perfectas para tu hogar, tu negocio o para regalar.','categoria.html?cat=navidad','Ver Navidad','christmas,decoration,cozy','🎄 Navidad','azul',1,true),
(ek_uuid('banner:2'),'Maquila de DTF UV para tu marca','Crea productos únicos para bodas, XV años, graduaciones o eventos. Producción profesional desde 38x100 cm.','categoria.html?cat=dtf-uv','Ver DTF UV','printing,uv,workshop','🖨️ Maquila','rojo',2,true),
(ek_uuid('banner:3'),'Celebra la graduación con algo único','Osos de graduación para firmar. Al comprar 20 osos o más te regalamos 1 pin personalizado por cada oso.','categoria.html?cat=graduacion','Ver Graduación','graduation,teddy,celebration','🎓 Promo grupal','azul',3,true),
(ek_uuid('banner:4'),'Personaliza tu botella y llévate un regalo','En la compra de una botella personalizada con DTF UV te llevas GRATIS un llavero de MDF personalizado.','categoria.html?cat=personalizados','Ver Personalizados','bottle,custom,drink','🎁 Regalo gratis','rojo',4,true),
(ek_uuid('banner:5'),'80 cilindros con las iniciales de los novios','Gracias a nuestra técnica de DTF UV cada botella tiene un acabado duradero y elegante, perfecto como recuerdo para tus invitados.','categoria.html?cat=bodas-eventos','Ver Bodas','wedding,bottle,table','💍 Bodas y eventos','azul',5,true),
(ek_uuid('banner:6'),'Paquetes de Amor y Amistad','Tres paquetes desde 230 pesos con caja decorada, detalles sorpresa y tarjeta. Listos para regalar.','categoria.html?cat=amor-amistad','Ver Amor y Amistad','valentine,gift,romantic','💘 San Valentín','rojo',6,true),
(ek_uuid('banner:7'),'Arma tu ofrenda de Día de Muertos','Calaveritas, catrinas, papel picado en MDF y arreglos con cempasúchil que nunca se marchitan.','categoria.html?cat=dia-muertos','Ver Día de Muertos','dayofthedead,catrina,altar','💀 Tradición','azul',7,true),
(ek_uuid('banner:8'),'Lámparas LED con tu diseño','Luz cálida o RGB, base de madera y grabado a láser. El regalo que todos quieren tener en su cuarto.','categoria.html?cat=lamparas','Ver Lámparas','led,lamp,night','💡 Lámparas','rojo',8,true),
(ek_uuid('banner:9'),'Envío gratis desde $999','Precios de mayoreo para escuelas, empresas y eventos. Cotiza tu proyecto por WhatsApp en minutos.','contacto.html','Cotizar por WhatsApp','gift,boxes,smallbusiness','🚚 Envíos a todo México','azul',9,true)
ON CONFLICT ("id") DO UPDATE SET "titulo"=EXCLUDED."titulo", "subtitulo"=EXCLUDED."subtitulo", "enlace"=EXCLUDED."enlace", "boton"=EXCLUDED."boton", "keywords"=EXCLUDED."keywords", "etiqueta"=EXCLUDED."etiqueta", "tema"=EXCLUDED."tema", "orden"=EXCLUDED."orden";

-- ── Reseñas ───────────────────────────────────────────────
INSERT INTO "Resena" ("id","productoId","autor","ciudad","estrellas","comentario","fecha","aprobada") VALUES
(ek_uuid('resena:0:porta-uvas-mdf-personalizado'),(SELECT "id" FROM "Producto" WHERE "slug" = 'porta-uvas-mdf-personalizado'),'Mariana G.','Ciudad de México',5,'Los porta uvas quedaron hermosos, el acabado brillante se ve increíble en la mesa. Mis invitados preguntaron dónde los compré.','Hace 2 semanas',true),
(ek_uuid('resena:1:cilindros-boda-iniciales'),(SELECT "id" FROM "Producto" WHERE "slug" = 'cilindros-boda-iniciales'),'Luis Fernando R.','Guadalajara, Jal.',5,'Pedimos 80 cilindros con las iniciales para nuestra boda y quedaron perfectos. Muy buena atención y entrega puntual.','Hace 1 mes',true),
(ek_uuid('resena:2:oso-graduacion-firmar-30cm'),(SELECT "id" FROM "Producto" WHERE "slug" = 'oso-graduacion-firmar-30cm'),'Karla M.','Puebla, Pue.',5,'Los osos para firmar fueron el hit de la graduación de mi hija. La promo del pin por cada oso fue un súper detalle.','Hace 3 semanas',true),
(ek_uuid('resena:3:pin-personalizado-graduacion'),(SELECT "id" FROM "Producto" WHERE "slug" = 'pin-personalizado-graduacion'),'Escuela Primaria Benito Juárez','CDMX',5,'Pedimos 120 pines personalizados para la generación. Excelente precio de mayoreo y calidad impecable.','Hace 2 meses',true),
(ek_uuid('resena:4:playera-grinch-merry-christmas'),(SELECT "id" FROM "Producto" WHERE "slug" = 'playera-grinch-merry-christmas'),'Ana Sofía T.','Monterrey, N.L.',4,'La playera está padrísima y no se ha despintado con las lavadas. Pedí una talla más y me quedó perfecta.','Hace 1 mes',true),
(ek_uuid('resena:5:botella-personalizada-dtf-llavero'),(SELECT "id" FROM "Producto" WHERE "slug" = 'botella-personalizada-dtf-llavero'),'Roberto C.','Querétaro, Qro.',5,'Compré una botella personalizada y me regalaron el llavero. Súper rápido por WhatsApp y llegó bien empaquetado.','Hace 3 días',true),
(ek_uuid('resena:6:paquete-amor-amistad-2'),(SELECT "id" FROM "Producto" WHERE "slug" = 'paquete-amor-amistad-2'),'Fernanda L.','Toluca, Edo. Méx.',5,'El paquete 2 de Amor y Amistad superó lo que esperaba. Mi novio quedó encantado con la caja decorada.','Hace 5 días',true),
(ek_uuid('resena:7:lampara-led-personalizada'),(SELECT "id" FROM "Producto" WHERE "slug" = 'lampara-led-personalizada'),'Diana P.','Ciudad de México',5,'La lámpara LED con el nombre de mi hijo es preciosa, la luz cálida se ve increíble de noche.','Hace 2 semanas',true),
(ek_uuid('resena:8:maquila-dtf-uv-38x100'),(SELECT "id" FROM "Producto" WHERE "slug" = 'maquila-dtf-uv-38x100'),'Jorge A.','Mérida, Yuc.',5,'Tengo un negocio de tazas y la maquila de DTF UV me salvó. Producción profesional y atención personalizada.','Hace 1 mes',true),
(ek_uuid('resena:9:set-20-osos-firmables-pines'),(SELECT "id" FROM "Producto" WHERE "slug" = 'set-20-osos-firmables-pines'),'Grupo Escolar 6°B','CDMX',5,'Pedimos el set de 20 osos para la despedida de la generación. Todos firmaron y quedó como recuerdo increíble.','Hace 3 meses',true)
ON CONFLICT ("id") DO NOTHING;

-- ── Blog ─────────────────────────────────────────────────
INSERT INTO "Articulo" ("id","titulo","slug","resumen","contenido","publicado","autor","categoria","keywords","minutos","fecha") VALUES
(ek_uuid('blog:como-montar-nacimiento-navideno-mdf'),'Cómo montar un nacimiento navideño en MDF paso a paso','como-montar-nacimiento-navideno-mdf','Del trazo a la mesa: qué piezas lleva un nacimiento en MDF, cómo acomodarlas, cómo iluminarlo y cómo guardarlo para que te dure muchos diciembres.','<p>Armar el nacimiento es, para muchísimas familias mexicanas, el momento en el que de verdad empieza la Navidad. En el taller lo vivimos cada año: hay quien nos pide una sola pieza para completar el nacimiento de la abuela y hay quien estrena el conjunto completo en MDF. La ventaja del material es clara: pesa poco, se corta con precisión milimétrica, no se astilla como la madera maciza y aguanta el ajetreo de subir y bajar del clóset temporada tras temporada. Aquí te contamos cómo lo montamos nosotros y cómo puedes montar el tuyo en casa sin batallar.</p>

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

<img src="https://loremflickr.com/900/900/christmas%2Cnativity%2Cdecor?lock=493" data-hotlink="https://loremflickr.com/900/900/christmas%2Cnativity%2Cdecor?lock=493" alt="Nacimiento navideño de MDF pintado a mano con figuras y luces cálidas" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

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
<p>¿Quieres tu nacimiento completo, la figura que le falta a tu colección o un establo a la medida de tu mesa? En <strong>Taller Creativo EK</strong> cortamos y personalizamos cada pieza y te mandamos vista previa antes de producir. Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> con una foto del espacio donde lo vas a poner y te decimos qué tamaño te conviene; también puedes apartar desde nuestro <a href="tienda.html">catálogo en línea</a>, porque en noviembre y diciembre la producción se llena muy rápido.</p>',true,'Taller Creativo EK','Navidad','christmas,nativity,decor',5,'22 de noviembre de 2025'),
(ek_uuid('blog:porta-uvas-ano-nuevo-tradicion-12-uvas'),'Porta uvas de Año Nuevo: historia, tradición de las 12 uvas y cómo personalizarlo','porta-uvas-ano-nuevo-tradicion-12-uvas','De dónde viene la costumbre de las 12 uvas, por qué un porta uvas cambia la mesa de Año Nuevo y cómo personalizarlo para tu familia o tu negocio.','<p>A las doce campanadas, en México nadie discute: doce uvas, una por cada mes del año que empieza. La costumbre es tan fuerte que ya es parte del menú de la cena, junto al pavo, los tamales y el champurrado. Y como todo lo que se repite cada año, merece un objeto bonito que lo acompañe. De eso va este artículo: de la historia de la tradición y de por qué un porta uvas personalizado se volvió uno de los regalos más pedidos en el taller.</p>

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

<img src="https://loremflickr.com/900/900/newyear%2Cgrapes%2Cparty?lock=532" data-hotlink="https://loremflickr.com/900/900/newyear%2Cgrapes%2Cparty?lock=532" alt="Porta uvas de MDF personalizado con uvas para la cena de Año Nuevo" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

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
<p>¿Quieres tu porta uvas personalizado para esta cena de Año Nuevo? Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> con el nombre, el año y el color que quieres, y te mandamos la vista previa antes de producir. También puedes ver los diseños disponibles en nuestro <a href="tienda.html">catálogo</a> y apartar con tiempo, porque en diciembre los pedidos personalizados se saturan.</p>',true,'Taller Creativo EK','Año Nuevo','newyear,grapes,party',4,'15 de noviembre de 2025'),
(ek_uuid('blog:decoracion-dia-de-muertos-mdf-calaveritas'),'Decoración de Día de Muertos con MDF: calaveritas, catrinas y ofrenda','decoracion-dia-de-muertos-mdf-calaveritas','Cómo armar una ofrenda con piezas de MDF: calaveritas, catrinas, papel picado rígido y letreros, con ideas para pintarlas en familia.','<p>El Día de Muertos es la fecha en la que más nos piden piezas decorativas en el taller, y tiene todo el sentido: es una celebración de casa, de familia y de recordar a quien ya no está. El MDF funciona perfecto para esta temporada porque se puede cortar en siluetas muy detalladas —calaveritas, catrinas, papel picado rígido, letreros con nombres— y se pinta con facilidad. Te compartimos cómo armar una ofrenda completa y cómo sacarle el máximo a tus piezas.</p>

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

<img src="https://loremflickr.com/900/900/dayofthedead%2Ccatrina%2Cskull?lock=571" data-hotlink="https://loremflickr.com/900/900/dayofthedead%2Ccatrina%2Cskull?lock=571" alt="Ofrenda de Día de Muertos con calaveritas y catrinas de MDF pintadas" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

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
<p>¿Necesitas calaveritas, catrinas o un letrero con el nombre de tu familiar? Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> y te cotizamos al momento, con opción de piezas ya pintadas o en blanco para que las pintes en casa. También puedes revisar los diseños de temporada en nuestro <a href="tienda.html">catálogo en línea</a>.</p>',true,'Taller Creativo EK','Día de Muertos','dayofthedead,catrina,skull',5,'25 de octubre de 2025'),
(ek_uuid('blog:osos-de-graduacion-para-firmar-guia-completa'),'Osos de graduación para firmar: la guía completa para grupos escolares','osos-de-graduacion-para-firmar-guia-completa','Cuántos osos necesitas, de qué tamaño pedirlos, cómo organizar la firma el día del evento y qué personalizar. Guía práctica para escuelas y grupos.','<p>Cada generación busca un recuerdo que no se repita, y en los últimos años el oso de graduación para firmar se volvió el favorito. La idea es simple y funciona: un oso rígido, cortado en MDF, que se va lleno de mensajes, firmas y dedicatorias de compañeros y maestros. Al final no es un adorno, es un objeto con la letra de todos los que estuvieron ahí. Aquí va la guía completa para pedirlos bien desde la primera vez.</p>

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

<img src="https://loremflickr.com/900/900/graduation%2Cbear%2Cstudent?lock=610" data-hotlink="https://loremflickr.com/900/900/graduation%2Cbear%2Cstudent?lock=610" alt="Osos de graduación de MDF personalizados listos para firmar" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

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
<p>¿Listo para cotizar los osos de tu generación? Mándanos por WhatsApp al <strong>+52 556 220 8987</strong> la cantidad, el tamaño y la lista de nombres, y te enviamos la vista previa de diseño antes de producir. También puedes ver modelos y acabados en nuestro <a href="tienda.html">catálogo en línea</a> y combinarlo con llaveros o pines para el resto del grupo.</p>',true,'Taller Creativo EK','Graduación','graduation,bear,student',6,'12 de septiembre de 2025'),
(ek_uuid('blog:ideas-recuerdos-para-bodas-cilindros-e-iniciales'),'Ideas de recuerdos para bodas: cilindros con iniciales, números de mesa y más','ideas-recuerdos-para-bodas-cilindros-e-iniciales','Cilindros con iniciales, números de mesa, letreros y detalles que tus invitados se llevan a casa. Cómo calcular cantidades, tiempos y presupuesto.','<p>Los recuerdos de boda cumplen una función muy específica: que el invitado llegue a su casa y se acuerde de ustedes. Un detalle bien elegido se queda años en una repisa; uno genérico termina en el cajón. En el taller hemos armado recuerdos para cientos de eventos y estas son las ideas que mejor funcionan, con números reales para que calcules sin sorpresas.</p>

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

<img src="https://loremflickr.com/900/900/wedding%2Cfavors%2Cdecoration?lock=662" data-hotlink="https://loremflickr.com/900/900/wedding%2Cfavors%2Cdecoration?lock=662" alt="Recuerdos de boda en MDF con cilindros, iniciales y números de mesa" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

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

<p>¿Estás armando los recuerdos de tu boda? Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> con la fecha del evento, el número de invitados y una foto de referencia del estilo que te gusta; te mandamos propuesta con precios de mayoreo. En nuestro <a href="tienda.html">catálogo en línea</a> puedes ver acabados y combinar varios detalles del mismo diseño.</p>',true,'Taller Creativo EK','Bodas','wedding,favors,decoration',5,'20 de agosto de 2025'),
(ek_uuid('blog:que-es-el-dtf-uv-y-por-que-dura-mas'),'Qué es el DTF UV y por qué dura más que el vinil tradicional','que-es-el-dtf-uv-y-por-que-dura-mas','Explicamos sin tecnicismos qué es la impresión DTF UV, en qué materiales se aplica y por qué aguanta más lavadas y más sol que el vinil de siempre.','<p>Cuando un cliente nos pregunta por qué su playera con vinil se empezó a despintar a los tres meses, la respuesta casi siempre es la misma: el material no era el adecuado para el uso que le dio. El DTF UV llegó a resolver justamente eso. Aquí te explicamos qué es, cómo funciona y en qué casos conviene de verdad, sin rodeos técnicos.</p>

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

<img src="https://loremflickr.com/900/900/uvprinting%2Cdtf%2Ctshirt?lock=493" data-hotlink="https://loremflickr.com/900/900/uvprinting%2Cdtf%2Ctshirt?lock=493" alt="Impresión DTF UV aplicada sobre una prenda y una pieza de MDF" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

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
<p>En <strong>Taller Creativo EK</strong> también hacemos maquila de DTF UV para otros negocios y talleres. Si tienes una marca de ropa, un equipo deportivo o un negocio de regalos, escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> y te pasamos precios por volumen y tiempos de entrega. Puedes ver ejemplos de trabajos terminados en nuestro <a href="tienda.html">catálogo</a>.</p>',true,'Taller Creativo EK','DTF UV','uvprinting,dtf,tshirt',4,'5 de agosto de 2025'),
(ek_uuid('blog:como-elegir-taza-o-termo-personalizado'),'Cómo elegir una taza o termo personalizado (cerámica, mágica, acero)','como-elegir-taza-o-termo-personalizado','Cerámica, mágica o acero inoxidable: diferencias reales de uso, precio y resistencia para que elijas el regalo correcto sin equivocarte.','<p>La taza personalizada es el regalo más versátil que existe: sirve para cumpleaños, para el Día de las Madres, para un amigo secreto en la oficina, para agradecer a un cliente. El problema es que hay tantas opciones que la gente se pierde. Aquí te explicamos las diferencias reales entre cerámica, mágica y acero inoxidable, para que elijas según el uso y no según el precio nada más.</p>

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

<img src="https://loremflickr.com/900/900/custom%2Cmug%2Cthermos?lock=532" data-hotlink="https://loremflickr.com/900/900/custom%2Cmug%2Cthermos?lock=532" alt="Tazas de cerámica y termo de acero inoxidable personalizados con DTF UV" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

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

<p>¿Ya sabes cuál quieres? Mándanos por WhatsApp al <strong>+52 556 220 8987</strong> la foto, el logo o el diseño que quieres imprimir, la cantidad de piezas y la fecha en que lo necesitas; te cotizamos al momento y te enviamos vista previa antes de producir. Tenemos precios de mayoreo para empresas y eventos, y puedes ver modelos y acabados en nuestro <a href="tienda.html">catálogo en línea</a>.</p>',true,'Taller Creativo EK','Tazas y termos','custom,mug,thermos',4,'22 de julio de 2025'),
(ek_uuid('blog:como-cuidar-tus-piezas-de-mdf'),'Cómo cuidar tus piezas de MDF para que duren años','como-cuidar-tus-piezas-de-mdf','Limpieza, humedad, sol y almacenaje: los cuidados básicos que hacen que una pieza de MDF personalizada se vea como nueva temporada tras temporada.','<p>Una pieza de MDF bien cuidada dura años. En serio: tenemos clientes que siguen sacando el mismo nacimiento que les hicimos hace cinco temporadas y se ve prácticamente nuevo. La diferencia entre eso y una pieza maltratada casi nunca es la calidad del material, sino cuatro hábitos sencillos de limpieza y guardado. Aquí van, explicados.</p>

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

<img src="https://loremflickr.com/900/900/mdf%2Cwoodcraft%2Cworkshop?lock=415" data-hotlink="https://loremflickr.com/900/900/mdf%2Cwoodcraft%2Cworkshop?lock=415" alt="Piezas decorativas de MDF personalizadas limpias y bien conservadas" loading="lazy" decoding="async" width="900" height="600" onerror="EK_imgSwap(this)">

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
<p>¿Necesitas reponer una pieza, sellar un canto o repintar tu decoración antes de la temporada? Escríbenos por WhatsApp al <strong>+52 556 220 8987</strong> con una foto de la pieza y te decimos si se repara o conviene rehacerla. También puedes pedir piezas nuevas y diseños actualizados en nuestro <a href="tienda.html">catálogo en línea</a>.</p>',true,'Taller Creativo EK','MDF y cuidados','mdf,woodcraft,workshop',4,'10 de julio de 2025')
ON CONFLICT ("slug") DO UPDATE SET "titulo"=EXCLUDED."titulo", "resumen"=EXCLUDED."resumen", "contenido"=EXCLUDED."contenido", "autor"=EXCLUDED."autor", "categoria"=EXCLUDED."categoria", "keywords"=EXCLUDED."keywords", "minutos"=EXCLUDED."minutos", "fecha"=EXCLUDED."fecha";

-- ── Configuración (desde assets/ek-config.js) ────────────
INSERT INTO "Configuracion" ("clave","valor") VALUES
('marca','Taller Creativo EK'),
('lema','Detalles personalizados que dejan huella'),
('descripcion','Taller de decoración en MDF, impresión DTF UV y regalos personalizados. Navidad, Año Nuevo, graduación, bodas, amor y amistad y más.'),
('logo','img/logo/logo-taller-creativo-ek.png'),
('favicon','img/favicon/favicon.ico'),
('favicon32','img/favicon/favicon-32x32.png'),
('appleIcon','img/favicon/apple-touch-icon.png'),
('ogImagen','img/banner/og-taller-creativo-ek.jpg'),
('whatsapp','525562208987'),
('whatsappBonito','+52 556 220 8987'),
('email','tallercreativoek@gmail.com'),
('emailAlt','ADZAJU90MX@GMAIL.COM'),
('facebook','https://www.facebook.com/Reqr2'),
('instagram','https://www.instagram.com/tallercreativoek'),
('direccion','Ciudad de México, México · Envíos a todo el país'),
('horario','Lun a Sáb · 9:00 a 19:00 h'),
('moneda','MXN'),
('simbolo','$'),
('iva','0'),
('envio','120'),
('envioGratisDesde','999'),
('porPagina','24'),
('talleres','["Ciudad de México","Área metropolitana","Foráneo (paquetería)"]'),
('pagos','{"mercadopago":"","clip":"","paypal":"","spei":{"banco":"BBVA","titular":"Taller Creativo EK","clabe":"","tarjeta":""}}'),
('mesesSinIntereses','3, 6 y 9 MSI con Mercado Pago (tarjetas participantes)'),
('modoImagenes','auto'),
('extImagenes','webp'),
('hotlink','{"base":"https://loremflickr.com","respaldo":"https://placehold.co","respaldoColor":"DA1D2A/FFFFFF","kwDefault":"handmade,craft"}'),
('titulo','Taller Creativo EK · Decoración MDF, DTF UV y regalos personalizados'),
('url','https://tallercreativoek.com'),
('colores','{"rojo":"#DA1D2A","azul":"#244093"}'),
('particulas','true'),
('particulasMax','38'),
('aos','true'),
('animaciones','true'),
('cache','1.0.0')
ON CONFLICT ("clave") DO UPDATE SET "valor"=EXCLUDED."valor";

-- ── FAQ (JSON) ───────────────────────────────────────────
INSERT INTO "Configuracion" ("clave","valor") VALUES ('faq', '[{"p":"¿Cómo hago un pedido?","r":"Elige tus artículos, agrégalos al carrito y envía tu pedido por WhatsApp con un clic. Ahí confirmamos diseño, pago y envío contigo."},{"p":"¿Cuánto tarda mi pedido?","r":"Los artículos en existencia salen en 24 a 48 h. Los personalizados y pedidos de mayoreo toman de 3 a 7 días hábiles según cantidad."},{"p":"¿Hacen envíos a todo México?","r":"Sí, enviamos por paquetería a todo el país. Envío GRATIS en compras desde $999 y entregas personales en CDMX y área metropolitana."},{"p":"¿Qué formas de pago aceptan?","r":"Transferencia SPEI, efectivo, y pagos con tarjeta por Mercado Pago o Clip. Para mayoreo podemos dar anticipo del 50%."},{"p":"¿Puedo personalizar cualquier diseño?","r":"¡Claro! Trabajamos con tu foto, logo, nombre o idea. Mándanos la referencia por WhatsApp y te mandamos una vista previa antes de producir."},{"p":"¿Manejan precios de mayoreo?","r":"Sí, para escuelas, empresas, bodas y eventos. Escríbenos por WhatsApp con la cantidad y te cotizamos en minutos."}]')
ON CONFLICT ("clave") DO UPDATE SET "valor"=EXCLUDED."valor";

-- ============================================================================
--  LISTO. Tienda: /   ·   Panel: /admin  (admin@ek.com / admin123)
-- ============================================================================