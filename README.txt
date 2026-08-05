REPRODUCTOR IPTV MÓVIL — DISEÑO TIPO STREMIO
=============================================

1. LOGO PRINCIPAL
-----------------
Coloca tu logo exactamente en esta ruta:

  img/logo.png

El logo aparecerá grande durante 3 segundos, en la cabecera y en el pie.
Se recomienda una imagen PNG transparente de al menos 600 px de ancho.

2. PEGAR TU LISTA M3U EN EL CÓDIGO
----------------------------------
Abre el archivo script.js y busca:

  const M3U_PLAYLIST = String.raw`#EXTM3U

  `;

Pega toda tu lista M3U entre las comillas invertidas.

Ejemplo:

  const M3U_PLAYLIST = String.raw`#EXTM3U
  #EXTINF:-1 tvg-country="ES" tvg-logo="logos/canal-1.png" group-title="Noticias",Canal 1
  https://tu-servidor.com/canal-1.m3u8
  `;

3. LOGOS DE LOS CANALES
-----------------------
Guarda los logos de los canales dentro de:

  logos/

Y escribe su ruta en la lista:

  tvg-logo="logos/nombre-del-canal.png"

Los logos se muestran grandes en cada tarjeta. Se recomiendan imágenes PNG
transparentes o cuadradas de 300 x 300 px como mínimo.

4. ORGANIZACIÓN AUTOMÁTICA
--------------------------
La aplicación organiza los canales por:

  - Países
  - Categorías
  - Favoritos

Para obtener mejores resultados, usa estos datos en cada canal:

  tvg-country="ES"
  group-title="Noticias"

También se detectan países y categorías a partir del nombre y del grupo.

5. PUBLICACIÓN
--------------
Abre el proyecto mediante un servidor web HTTPS. Algunos enlaces IPTV no se
reproducen directamente en navegadores debido a CORS, formato, permisos del
servidor o restricciones del proveedor.

ESTRUCTURA
----------
iptv-stremio-mobile/
  index.html
  style.css
  script.js
  README.txt
  img/
    logo.png
  logos/
    canal-1.png
    canal-2.png

Usa únicamente listas y emisiones que tengas derecho a reproducir.
