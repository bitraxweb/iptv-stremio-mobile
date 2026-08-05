"use strict";

/*
  ===============================================================
  LISTAS IPTV REMOTAS
  ===============================================================

  El reproductor descarga y combina automáticamente todas las listas
  activadas. Para desactivar una lista, cambia:

      enabled: true

  por:

      enabled: false

  IMPORTANTE:
  - Abre el proyecto desde un servidor HTTP/HTTPS, no con doble clic.
  - Los servidores de las listas deben permitir CORS.
  - Usa únicamente emisiones que tengas derecho a reproducir.
*/
const PLAYLIST_SOURCES = [
  {
    name: "Telechancho Infinity",
    url: "https://telechancho.github.io/telechancho-iptv/telechancho-infinity.m3u",
    enabled: true
  },

  // M3U.CL por países
  { name: "M3U.CL Argentina", url: "https://www.m3u.cl/lista/AR.m3u", country: "AR", enabled: true },
  { name: "M3U.CL Bolivia", url: "https://www.m3u.cl/lista/BO.m3u", country: "BO", enabled: true },
  { name: "M3U.CL Brasil", url: "https://www.m3u.cl/lista/BR.m3u", country: "BR", enabled: true },
  { name: "M3U.CL Chile", url: "https://www.m3u.cl/lista/CL.m3u", country: "CL", enabled: true },
  { name: "M3U.CL Colombia", url: "https://www.m3u.cl/lista/CO.m3u", country: "CO", enabled: true },
  { name: "M3U.CL Ecuador", url: "https://www.m3u.cl/lista/EC.m3u", country: "EC", enabled: true },
  { name: "M3U.CL España", url: "https://www.m3u.cl/lista/ES.m3u", country: "ES", enabled: true },
  { name: "M3U.CL México", url: "https://www.m3u.cl/lista/MX.m3u", country: "MX", enabled: true },
  { name: "M3U.CL Paraguay", url: "https://www.m3u.cl/lista/PY.m3u", country: "PY", enabled: true },
  { name: "M3U.CL Perú", url: "https://www.m3u.cl/lista/PE.m3u", country: "PE", enabled: true },
  { name: "M3U.CL República Dominicana", url: "https://www.m3u.cl/lista/DO.m3u", country: "DO", enabled: true },
  { name: "M3U.CL Venezuela", url: "https://www.m3u.cl/lista/VE.m3u", country: "VE", enabled: true },

  // M3U.CL temáticas y general
  {
    name: "M3U.CL Música",
    url: "https://www.m3u.cl/lista/musica.m3u",
    category: "Música",
    enabled: true
  },
  {
    name: "M3U.CL Religiosos",
    url: "https://www.m3u.cl/lista/religiosos.m3u",
    category: "Religión",
    enabled: true
  },
  {
    name: "M3U.CL Total",
    url: "https://www.m3u.cl/lista/total.m3u",
    enabled: true
  },

  // Otras listas
  {
    name: "IPTV-ORG Español",
    url: "https://iptv-org.github.io/iptv/languages/spa.m3u",
    enabled: true
  },

  // TDTChannels
  {
    name: "TDTChannels TV",
    url: "https://www.tdtchannels.com/lists/tv.m3u8",
    country: "ES",
    enabled: true
  },
  {
    name: "TDTChannels TV M3U8 + MPD",
    url: "https://www.tdtchannels.com/lists/tv_mpd.m3u8",
    country: "ES",
    enabled: true
  },
  {
    name: "TDTChannels Radio",
    url: "https://www.tdtchannels.com/lists/radio.m3u8",
    country: "ES",
    category: "Radio",
    enabled: true
  },
  {
    name: "TDTChannels TV + Radio",
    url: "https://www.tdtchannels.com/lists/tvradio.m3u8",
    country: "ES",
    enabled: true
  },
  {
    name: "TDTChannels TV + Radio M3U8 + MPD",
    url: "https://www.tdtchannels.com/lists/tvradio_mpd.m3u8",
    country: "ES",
    enabled: true
  }
];

const STORAGE_FAVORITES = "stremio-mobile-iptv-favorites-v4";
const PLAYLIST_CACHE_PREFIX = "stremio-mobile-playlist-cache-v1:";
const PLAYLIST_CACHE_MAX_AGE = 6 * 60 * 60 * 1000;
const INITIAL_VISIBLE_PER_GROUP = 24;

const COUNTRY_DATA = {
  AR: { name: "Argentina", flag: "🇦🇷", aliases: ["argentina", "arg"] },
  BO: { name: "Bolivia", flag: "🇧🇴", aliases: ["bolivia", "bol"] },
  BR: { name: "Brasil", flag: "🇧🇷", aliases: ["brasil", "brazil", "bra"] },
  CA: { name: "Canadá", flag: "🇨🇦", aliases: ["canada", "can"] },
  CL: { name: "Chile", flag: "🇨🇱", aliases: ["chile", "chi"] },
  CO: { name: "Colombia", flag: "🇨🇴", aliases: ["colombia", "col"] },
  CR: { name: "Costa Rica", flag: "🇨🇷", aliases: ["costa rica", "crc"] },
  CU: { name: "Cuba", flag: "🇨🇺", aliases: ["cuba", "cub"] },
  DE: { name: "Alemania", flag: "🇩🇪", aliases: ["alemania", "germany", "deutschland", "ger"] },
  DO: { name: "República Dominicana", flag: "🇩🇴", aliases: ["republica dominicana", "dominicana", "dom"] },
  EC: { name: "Ecuador", flag: "🇪🇨", aliases: ["ecuador", "ecu"] },
  ES: { name: "España", flag: "🇪🇸", aliases: ["espana", "spain", "esp", "españa"] },
  FR: { name: "Francia", flag: "🇫🇷", aliases: ["francia", "france", "fra"] },
  GB: { name: "Reino Unido", flag: "🇬🇧", aliases: ["reino unido", "united kingdom", "uk", "england", "britain"] },
  GT: { name: "Guatemala", flag: "🇬🇹", aliases: ["guatemala", "gua"] },
  HN: { name: "Honduras", flag: "🇭🇳", aliases: ["honduras", "hon"] },
  IT: { name: "Italia", flag: "🇮🇹", aliases: ["italia", "italy", "ita"] },
  MX: { name: "México", flag: "🇲🇽", aliases: ["mexico", "méxico", "mex"] },
  NI: { name: "Nicaragua", flag: "🇳🇮", aliases: ["nicaragua", "nic"] },
  PA: { name: "Panamá", flag: "🇵🇦", aliases: ["panama", "panamá", "pan"] },
  PE: { name: "Perú", flag: "🇵🇪", aliases: ["peru", "perú", "per"] },
  PR: { name: "Puerto Rico", flag: "🇵🇷", aliases: ["puerto rico", "pur"] },
  PT: { name: "Portugal", flag: "🇵🇹", aliases: ["portugal", "por"] },
  PY: { name: "Paraguay", flag: "🇵🇾", aliases: ["paraguay", "par"] },
  SV: { name: "El Salvador", flag: "🇸🇻", aliases: ["el salvador", "salvador", "slv"] },
  US: { name: "Estados Unidos", flag: "🇺🇸", aliases: ["estados unidos", "united states", "usa", "eeuu"] },
  UY: { name: "Uruguay", flag: "🇺🇾", aliases: ["uruguay", "uru"] },
  VE: { name: "Venezuela", flag: "🇻🇪", aliases: ["venezuela", "ven"] },
  INT: { name: "Internacional", flag: "🌍", aliases: ["internacional", "international", "latino", "latam"] },
  OTHER: { name: "Otros", flag: "🌐", aliases: [] }
};

const CATEGORY_RULES = [
  { name: "Noticias", icon: "N", regex: /noticias?|news|informaci[oó]n|24h|actualidad/i },
  { name: "Deportes", icon: "D", regex: /deportes?|sports?|f[uú]tbol|football|soccer|nba|nfl|tenis|motor/i },
  { name: "Cine", icon: "C", regex: /cine|cinema|movies?|pel[ií]culas?|film/i },
  { name: "Series", icon: "S", regex: /series?|novelas?|telenovelas?/i },
  { name: "Infantil", icon: "I", regex: /infantil|ni[nñ]os|kids?|cartoon|dibujos|junior/i },
  { name: "Música", icon: "M", regex: /m[uú]sica|music|radio|hits?|concert/i },
  { name: "Documentales", icon: "D", regex: /documentales?|documentary|naturaleza|history|historia|science/i },
  { name: "Entretenimiento", icon: "E", regex: /entretenimiento|entertainment|variedades|general|show/i },
  { name: "Religión", icon: "R", regex: /religi[oó]n|religious|cristian|iglesia|faith/i },
  { name: "Cultura", icon: "C", regex: /cultura|cultural|arte|educaci[oó]n|education/i }
];

const elements = {
  splash: document.getElementById("splash"),
  app: document.getElementById("app"),
  video: document.getElementById("video"),
  playerEmpty: document.getElementById("playerEmpty"),
  playerLoading: document.getElementById("playerLoading"),
  currentLogo: document.getElementById("currentLogo"),
  currentChannel: document.getElementById("currentChannel"),
  currentMeta: document.getElementById("currentMeta"),
  favoriteCurrentBtn: document.getElementById("favoriteCurrentBtn"),
  reloadBtn: document.getElementById("reloadBtn"),
  fullscreenBtn: document.getElementById("fullscreenBtn"),
  scrollSearchBtn: document.getElementById("scrollSearchBtn"),
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  channelCount: document.getElementById("channelCount"),
  groupsContainer: document.getElementById("groupsContainer"),
  toast: document.getElementById("toast")
};

let channels = [];
let playlistLoadErrors = [];
let favorites = loadFavorites();
let currentView = "country";
let activeChannel = null;
let hls = null;
let dashPlayer = null;
let searchTimer = null;
const collapsedGroups = new Set();
const visibleLimits = new Map();

window.addEventListener("DOMContentLoaded", async () => {
  const splashStartedAt = Date.now();

  elements.channelCount.textContent = "Cargando listas…";
  renderLoadingLibrary();

  try {
    channels = await loadAllPlaylists();
  } catch (error) {
    console.error("Error general cargando listas:", error);
    playlistLoadErrors.push({
      source: "Carga general",
      message: error instanceof Error ? error.message : String(error)
    });
  }

  renderLibrary();

  if (playlistLoadErrors.length) {
    console.warn("Listas que no pudieron cargarse:", playlistLoadErrors);
    showToast(
      `${playlistLoadErrors.length} ${playlistLoadErrors.length === 1 ? "lista no pudo" : "listas no pudieron"} cargarse. Revisa CORS o la consola.`,
      true
    );
  }

  const elapsed = Date.now() - splashStartedAt;
  const remainingSplashTime = Math.max(0, 3000 - elapsed);

  window.setTimeout(() => {
    elements.app.hidden = false;
    elements.splash.classList.add("is-leaving");

    window.setTimeout(() => {
      elements.splash.hidden = true;
    }, 450);
  }, remainingSplashTime);
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    currentView = button.dataset.view;
    visibleLimits.clear();

    document.querySelectorAll("[data-view]").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
    });

    renderLibrary();
  });
});

elements.searchInput.addEventListener("input", () => {
  elements.clearSearchBtn.hidden = !elements.searchInput.value;
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(renderLibrary, 130);
});

elements.clearSearchBtn.addEventListener("click", () => {
  elements.searchInput.value = "";
  elements.clearSearchBtn.hidden = true;
  elements.searchInput.focus();
  renderLibrary();
});

elements.scrollSearchBtn.addEventListener("click", () => {
  elements.searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => elements.searchInput.focus(), 350);
});

elements.reloadBtn.addEventListener("click", () => {
  if (!activeChannel) {
    showToast("Selecciona un canal primero.", true);
    return;
  }
  playChannel(activeChannel, false);
});

elements.fullscreenBtn.addEventListener("click", async () => {
  try {
    if (elements.video.requestFullscreen) {
      await elements.video.requestFullscreen();
    } else if (elements.video.webkitEnterFullscreen) {
      elements.video.webkitEnterFullscreen();
    }
  } catch {
    showToast("El navegador no permitió la pantalla completa.", true);
  }
});

elements.favoriteCurrentBtn.addEventListener("click", () => {
  if (activeChannel) toggleFavorite(activeChannel.id);
});

elements.video.addEventListener("waiting", () => {
  elements.playerLoading.hidden = false;
});

elements.video.addEventListener("playing", () => {
  elements.playerLoading.hidden = true;
  elements.playerEmpty.hidden = true;
});

elements.video.addEventListener("canplay", () => {
  elements.playerLoading.hidden = true;
});

elements.video.addEventListener("error", () => {
  elements.playerLoading.hidden = true;
});

async function loadAllPlaylists() {
  playlistLoadErrors = [];

  const enabledSources = PLAYLIST_SOURCES.filter((source) => source.enabled !== false);
  const results = await Promise.allSettled(
    enabledSources.map((source) => loadPlaylistSource(source))
  );

  const mergedChannels = [];

  results.forEach((result, index) => {
    const source = enabledSources[index];

    if (result.status === "fulfilled") {
      mergedChannels.push(...result.value);
      return;
    }

    const message = result.reason instanceof Error
      ? result.reason.message
      : String(result.reason);

    playlistLoadErrors.push({
      source: source.name,
      message
    });

    console.error(`No se pudo cargar "${source.name}":`, result.reason);
  });

  return deduplicateChannels(mergedChannels).sort((a, b) =>
    a.country.localeCompare(b.country, "es") ||
    a.category.localeCompare(b.category, "es") ||
    a.name.localeCompare(b.name, "es")
  );
}

async function loadPlaylistSource(source) {
  const cacheKey = `${PLAYLIST_CACHE_PREFIX}${source.url}`;
  let playlistText = "";

  try {
    const response = await fetch(source.url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      credentials: "omit",
      headers: {
        Accept: "application/x-mpegURL, application/vnd.apple.mpegurl, audio/mpegurl, text/plain, */*"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }

    playlistText = await response.text();

    if (!playlistText.trim()) {
      throw new Error("La lista llegó vacía.");
    }

    savePlaylistCache(cacheKey, playlistText);
  } catch (networkError) {
    const cached = readPlaylistCache(cacheKey);

    if (!cached) {
      throw new Error(
        `${networkError instanceof Error ? networkError.message : String(networkError)}. ` +
        "El servidor puede estar bloqueando CORS."
      );
    }

    playlistText = cached.text;
    console.warn(`Usando caché para "${source.name}".`, networkError);
  }

  return parseM3U(playlistText, source);
}

function savePlaylistCache(key, text) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        text
      })
    );
  } catch {
    // La caché es opcional. La aplicación sigue funcionando sin ella.
  }
}

function readPlaylistCache(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");

    if (!value || typeof value.text !== "string" || typeof value.savedAt !== "number") {
      return null;
    }

    if (Date.now() - value.savedAt > PLAYLIST_CACHE_MAX_AGE) {
      localStorage.removeItem(key);
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

function renderLoadingLibrary() {
  elements.groupsContainer.innerHTML = `
    <div class="empty-library">
      <div class="empty-library__mark">
        <span class="spinner" aria-hidden="true"></span>
      </div>
      <h2>Cargando canales</h2>
      <p>Estamos descargando y organizando las listas por países y categorías.</p>
    </div>
  `;
}

function parseM3U(text, source = {}) {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = [];
  let pending = null;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      pending = parseExtInf(line);
      continue;
    }

    if (line.startsWith("#") || !pending) continue;

    const streamUrl = resolveRemoteUrl(line, source.url);

    if (streamUrl && isPlayableUrl(streamUrl)) {
      const forcedCountry = source.country || "";
      const rawCountry = pending.countryRaw || forcedCountry;
      const country = detectCountry(rawCountry, pending.group, pending.name);

      let category = detectCategory(
        pending.categoryRaw,
        pending.group,
        pending.name,
        country
      );

      if (
        source.category &&
        !pending.categoryRaw &&
        !pending.group
      ) {
        category = source.category;
      }

      const logo = pending.logo
        ? resolveRemoteUrl(pending.logo, source.url) || pending.logo
        : "";

      parsed.push({
        id: hashString(`${streamUrl}|${pending.name}`),
        name: pending.name,
        url: streamUrl,
        logo,
        countryCode: country.code,
        country: country.name,
        flag: country.flag,
        category,
        group: pending.group || source.category || category,
        sourceName: source.name || "Lista IPTV"
      });
    }

    pending = null;
  }

  return deduplicateByUrl(parsed);
}

function parseExtInf(line) {
  const commaIndex = findMetadataComma(line);
  const metadata = commaIndex >= 0 ? line.slice(0, commaIndex) : line;
  const visibleName = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : "";
  const attributes = {};
  const attributeRegex = /([\w-]+)\s*=\s*"([^"]*)"/g;
  let match;

  while ((match = attributeRegex.exec(metadata)) !== null) {
    attributes[match[1].toLowerCase()] = match[2].trim();
  }

  return {
    name: attributes["tvg-name"] || visibleName || "Canal sin nombre",
    logo: attributes["tvg-logo"] || "",
    countryRaw: attributes["tvg-country"] || attributes.country || "",
    categoryRaw: attributes["tvg-category"] || "",
    group: attributes["group-title"] || ""
  };
}

function findMetadataComma(line) {
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') insideQuotes = !insideQuotes;
    if (line[index] === "," && !insideQuotes) return index;
  }

  return -1;
}

function detectCountry(rawCountry, group, channelName) {
  const directCode = String(rawCountry).split(/[;,|]/)[0].trim().toUpperCase();

  if (COUNTRY_DATA[directCode]) {
    return { code: directCode, ...COUNTRY_DATA[directCode] };
  }

  const source = normalizeText(`${rawCountry} ${group} ${channelName}`);

  for (const [code, data] of Object.entries(COUNTRY_DATA)) {
    if (code === "OTHER") continue;
    const candidates = [code.toLowerCase(), data.name, ...data.aliases].map(normalizeText);
    if (candidates.some((candidate) => candidate && containsWholeTerm(source, candidate))) {
      return { code, ...data };
    }
  }

  return { code: "OTHER", ...COUNTRY_DATA.OTHER };
}

function detectCategory(rawCategory, group, channelName, country) {
  const explicit = String(rawCategory).trim();
  if (explicit) return cleanCategory(explicit);

  const groupParts = String(group)
    .split(/\s*[|;/>]+\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !isCountryLabel(part, country));

  const candidate = groupParts.at(-1) || group || channelName;
  const matchedRule = CATEGORY_RULES.find((rule) => rule.regex.test(candidate));

  if (matchedRule) return matchedRule.name;

  const nameRule = CATEGORY_RULES.find((rule) => rule.regex.test(channelName));
  if (nameRule) return nameRule.name;

  if (candidate && !isCountryLabel(candidate, country)) return cleanCategory(candidate);
  return "General";
}

function isCountryLabel(value, country) {
  const normalized = normalizeText(value);
  if (!normalized) return false;

  const countryTerms = [country.code, country.name, ...(COUNTRY_DATA[country.code]?.aliases || [])]
    .map(normalizeText);

  return countryTerms.some((term) => term && (normalized === term || normalized.includes(term)));
}

function cleanCategory(value) {
  const clean = String(value)
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const rule = CATEGORY_RULES.find((item) => item.regex.test(clean));
  if (rule) return rule.name;

  return clean || "General";
}

function renderLibrary() {
  const query = normalizeText(elements.searchInput.value);
  const filtered = channels.filter((channel) => {
    if (currentView === "favorites" && !favorites.has(channel.id)) return false;
    if (!query) return true;

    return normalizeText(`${channel.name} ${channel.country} ${channel.category} ${channel.group}`).includes(query);
  });

  elements.channelCount.textContent = `${filtered.length} ${filtered.length === 1 ? "canal" : "canales"}`;
  elements.groupsContainer.innerHTML = "";

  if (!channels.length) {
    renderEmptyPlaylist();
    return;
  }

  if (!filtered.length) {
    renderNoResults(query);
    return;
  }

  const grouped = groupChannels(filtered);

  grouped.forEach(([groupName, groupChannelsList]) => {
    elements.groupsContainer.appendChild(createGroup(groupName, groupChannelsList));
  });
}

function groupChannels(list) {
  const map = new Map();

  list.forEach((channel) => {
    const key = currentView === "category" ? channel.category : channel.country;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(channel);
  });

  return [...map.entries()]
    .map(([name, values]) => [name, values.sort((a, b) => a.name.localeCompare(b.name, "es"))])
    .sort(([nameA], [nameB]) => {
      if (nameA === "Otros" || nameA === "General") return 1;
      if (nameB === "Otros" || nameB === "General") return -1;
      return nameA.localeCompare(nameB, "es");
    });
}

function createGroup(groupName, groupChannelsList) {
  const key = `${currentView}:${groupName}`;
  const limit = visibleLimits.get(key) || INITIAL_VISIBLE_PER_GROUP;
  const visibleChannels = groupChannelsList.slice(0, limit);
  const isCollapsed = collapsedGroups.has(key);
  const section = document.createElement("section");
  section.className = `group${isCollapsed ? " is-collapsed" : ""}`;

  const symbol = currentView === "category"
    ? getCategoryIcon(groupName)
    : (groupChannelsList[0]?.flag || "🌐");

  section.innerHTML = `
    <div class="group__header">
      <span class="group__symbol">${escapeHtml(symbol)}</span>
      <div class="group__title">
        <strong>${escapeHtml(groupName)}</strong>
        <span>${groupChannelsList.length} ${groupChannelsList.length === 1 ? "canal" : "canales"}</span>
      </div>
      <button class="group__toggle" type="button" aria-label="Mostrar u ocultar ${escapeHtml(groupName)}" aria-expanded="${!isCollapsed}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
    <div class="channel-list"></div>
  `;

  const listElement = section.querySelector(".channel-list");
  visibleChannels.forEach((channel) => listElement.appendChild(createChannelRow(channel)));

  section.querySelector(".group__toggle").addEventListener("click", () => {
    if (collapsedGroups.has(key)) collapsedGroups.delete(key);
    else collapsedGroups.add(key);
    section.classList.toggle("is-collapsed");
    section.querySelector(".group__toggle").setAttribute("aria-expanded", String(!section.classList.contains("is-collapsed")));
  });

  if (visibleChannels.length < groupChannelsList.length) {
    const moreButton = document.createElement("button");
    moreButton.className = "group__more";
    moreButton.type = "button";
    moreButton.textContent = `Mostrar ${Math.min(INITIAL_VISIBLE_PER_GROUP, groupChannelsList.length - visibleChannels.length)} más`;
    moreButton.addEventListener("click", () => {
      visibleLimits.set(key, limit + INITIAL_VISIBLE_PER_GROUP);
      renderLibrary();
    });
    section.appendChild(moreButton);
  }

  return section;
}

function createChannelRow(channel) {
  const article = document.createElement("article");
  const isActive = activeChannel?.id === channel.id;
  const isFavorite = favorites.has(channel.id);
  article.className = `channel${isActive ? " is-active" : ""}`;

  const initials = makeInitials(channel.name);
  const meta = `${channel.flag} ${channel.country} · ${channel.category}`;

  article.innerHTML = `
    <div class="channel__logo">
      <span>${escapeHtml(initials)}</span>
      ${channel.logo ? `<img src="${escapeAttribute(channel.logo)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
    </div>
    <div class="channel__info" role="button" tabindex="0" aria-label="Reproducir ${escapeAttribute(channel.name)}">
      <strong>${escapeHtml(channel.name)}</strong>
      <span>${escapeHtml(meta)}</span>
    </div>
    <button class="channel__favorite${isFavorite ? " is-favorite" : ""}" type="button" aria-label="${isFavorite ? "Quitar de" : "Añadir a"} favoritos">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"/></svg>
    </button>
    <button class="channel__play" type="button" aria-label="Reproducir ${escapeAttribute(channel.name)}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z"/></svg>
    </button>
  `;

  const openChannel = () => playChannel(channel);
  const info = article.querySelector(".channel__info");
  info.addEventListener("click", openChannel);
  info.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openChannel();
    }
  });
  article.querySelector(".channel__play").addEventListener("click", openChannel);
  article.querySelector(".channel__favorite").addEventListener("click", () => toggleFavorite(channel.id));

  return article;
}

function playChannel(channel, scrollToPlayer = true) {
  if (!channel || !isPlayableUrl(channel.url)) {
    showToast("La dirección del canal no es válida.", true);
    return;
  }

  destroyPlayers();
  elements.video.pause();
  elements.video.removeAttribute("src");
  elements.video.load();

  activeChannel = channel;
  elements.playerEmpty.hidden = true;
  elements.playerLoading.hidden = false;
  updateNowPlaying();
  renderLibrary();

  if (scrollToPlayer) {
    document.getElementById("top").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const startPlayback = () => {
    const promise = elements.video.play();
    if (promise) {
      promise.catch(() => {
        elements.playerLoading.hidden = true;
        showToast("Pulsa reproducir para iniciar el canal.");
      });
    }
  };

  if (isDashUrl(channel.url)) {
    playDashChannel(channel.url, startPlayback);
    return;
  }

  if (isDirectMediaUrl(channel.url)) {
    elements.video.src = channel.url;
    elements.video.addEventListener("loadedmetadata", startPlayback, { once: true });
    elements.video.addEventListener("canplay", startPlayback, { once: true });
    return;
  }

  if (window.Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 30,
      maxBufferLength: 30
    });

    hls.loadSource(channel.url);
    hls.attachMedia(elements.video);
    hls.on(Hls.Events.MANIFEST_PARSED, startPlayback);
    hls.on(Hls.Events.ERROR, (_event, data) => handleHlsError(data));
    return;
  }

  if (elements.video.canPlayType("application/vnd.apple.mpegurl")) {
    elements.video.src = channel.url;
    elements.video.addEventListener("loadedmetadata", startPlayback, { once: true });
    return;
  }

  elements.playerLoading.hidden = true;
  elements.playerEmpty.hidden = false;
  showToast("Este navegador no puede reproducir este formato.", true);
}

function handleHlsError(data) {
  if (!data.fatal || !hls) return;

  elements.playerLoading.hidden = true;

  if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
    showToast("No se pudo conectar. Revisa el enlace, CORS o tu conexión.", true);
    hls.startLoad();
  } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
    showToast("Recuperando la reproducción…");
    hls.recoverMediaError();
  } else {
    showToast("Este canal no se pudo reproducir.", true);
    destroyHls();
  }
}

function updateNowPlaying() {
  if (!activeChannel) return;

  elements.currentChannel.textContent = activeChannel.name;
  elements.currentMeta.textContent = `${activeChannel.flag} ${activeChannel.country} · ${activeChannel.category}`;
  elements.favoriteCurrentBtn.disabled = false;
  elements.favoriteCurrentBtn.classList.toggle("is-favorite", favorites.has(activeChannel.id));
  elements.favoriteCurrentBtn.setAttribute(
    "aria-label",
    favorites.has(activeChannel.id) ? "Quitar de favoritos" : "Añadir a favoritos"
  );

  elements.currentLogo.innerHTML = `<span>${escapeHtml(makeInitials(activeChannel.name))}</span>`;
  if (activeChannel.logo) {
    const image = document.createElement("img");
    image.src = activeChannel.logo;
    image.alt = "";
    image.addEventListener("error", () => image.remove(), { once: true });
    elements.currentLogo.appendChild(image);
  }
}

function toggleFavorite(channelId) {
  if (favorites.has(channelId)) favorites.delete(channelId);
  else favorites.add(channelId);

  localStorage.setItem(STORAGE_FAVORITES, JSON.stringify([...favorites]));
  updateNowPlayingFavoriteState();
  renderLibrary();
}

function updateNowPlayingFavoriteState() {
  if (!activeChannel) return;
  const isFavorite = favorites.has(activeChannel.id);
  elements.favoriteCurrentBtn.classList.toggle("is-favorite", isFavorite);
  elements.favoriteCurrentBtn.setAttribute("aria-label", isFavorite ? "Quitar de favoritos" : "Añadir a favoritos");
}

function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || "[]");
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function renderEmptyPlaylist() {
  elements.groupsContainer.innerHTML = `
    <div class="empty-library">
      <div class="empty-library__mark">M3U</div>
      <h2>No se pudieron cargar canales</h2>
      <p>Abre el proyecto mediante un servidor HTTP/HTTPS y revisa la consola. Algunos proveedores pueden bloquear la descarga por CORS.</p>
    </div>
  `;
}

function renderNoResults(query) {
  const message = currentView === "favorites" && !query
    ? "Todavía no has guardado canales favoritos."
    : "No encontramos canales con esa búsqueda.";

  elements.groupsContainer.innerHTML = `
    <div class="empty-library">
      <div class="empty-library__mark">—</div>
      <h2>Sin resultados</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

async function playDashChannel(url, startPlayback) {
  try {
    await ensureDashJs();

    if (!window.dashjs?.MediaPlayer) {
      throw new Error("DASH.js no está disponible.");
    }

    dashPlayer = window.dashjs.MediaPlayer().create();
    dashPlayer.initialize(elements.video, url, true);

    const events = window.dashjs.MediaPlayer.events;

    dashPlayer.on(events.STREAM_INITIALIZED, () => {
      startPlayback();
    });

    dashPlayer.on(events.ERROR, () => {
      elements.playerLoading.hidden = true;
      showToast("La emisión DASH no se pudo reproducir.", true);
    });
  } catch (error) {
    elements.playerLoading.hidden = true;
    elements.playerEmpty.hidden = false;
    console.error("Error iniciando DASH:", error);
    showToast("No se pudo cargar el reproductor DASH.", true);
  }
}

function ensureDashJs() {
  if (window.dashjs?.MediaPlayer) {
    return Promise.resolve();
  }

  if (ensureDashJs.promise) {
    return ensureDashJs.promise;
  }

  ensureDashJs.promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/dashjs@4.7.4/dist/dash.all.min.js";
    script.async = true;

    script.addEventListener("load", resolve, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("No se pudo descargar DASH.js.")),
      { once: true }
    );

    document.head.appendChild(script);
  });

  return ensureDashJs.promise;
}

function destroyPlayers() {
  if (hls) {
    hls.destroy();
    hls = null;
  }

  if (dashPlayer) {
    try {
      dashPlayer.reset();
    } catch {
      // Ignorar errores durante la limpieza.
    }

    dashPlayer = null;
  }
}

function getCategoryIcon(category) {
  return CATEGORY_RULES.find((item) => item.name === category)?.icon || category.trim().charAt(0).toUpperCase() || "G";
}

function resolveRemoteUrl(value, baseUrl = window.location.href) {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) return "";

  // Algunas listas añaden opciones después de una barra vertical.
  // El navegador no puede usar esas opciones directamente.
  const urlWithoutOptions = cleanValue.split("|")[0].trim();

  try {
    return new URL(urlWithoutOptions, baseUrl || window.location.href).href;
  } catch {
    return "";
  }
}

function isDashUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return /\.mpd$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function isDirectMediaUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return /\.(mp3|aac|m4a|ogg|oga|wav|flac|mp4|m4v|webm)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function deduplicateChannels(list) {
  const seenUrls = new Set();
  const seenFallbackKeys = new Set();

  return list.filter((channel) => {
    const normalizedUrl = String(channel.url).trim().toLowerCase();
    const fallbackKey = normalizeText(
      `${channel.countryCode}|${channel.name}|${channel.category}`
    );

    if (seenUrls.has(normalizedUrl)) return false;

    /*
      Solo usamos nombre + país como segunda defensa cuando la URL está vacía.
      Así no eliminamos distintas señales válidas del mismo canal.
    */
    if (!normalizedUrl && seenFallbackKeys.has(fallbackKey)) return false;

    seenUrls.add(normalizedUrl);
    seenFallbackKeys.add(fallbackKey);
    return true;
  });
}

function isPlayableUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function deduplicateByUrl(list) {
  const seen = new Set();
  return list.filter((channel) => {
    if (seen.has(channel.url)) return false;
    seen.add(channel.url);
    return true;
  });
}

function makeInitials(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "TV";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function containsWholeTerm(source, term) {
  return ` ${source} `.includes(` ${term} `);
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `ch-${(hash >>> 0).toString(36)}`;
}

function showToast(text, isError = false) {
  elements.toast.textContent = text;
  elements.toast.classList.toggle("is-error", isError);
  elements.toast.hidden = false;

  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 4300);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
