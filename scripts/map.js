import { escapeHtml as e, money, plotLink } from "./ui.js";

export function hasMapLocation(plot) {
	const point = plot.mapLocation;
	return Boolean(
		point &&
			Number.isFinite(point.lat) &&
			Number.isFinite(point.lng) &&
			Math.abs(point.lat) <= 90 &&
			Math.abs(point.lng) <= 180,
	);
}

export function mapPrice(plot) {
	return Number.isFinite(plot.pricePln) && plot.pricePln > 0
		? money(plot.pricePln)
		: "Cena nieustalona";
}

export function atlasMapMarkup(plots) {
	return `<section class="atlas-map-section" aria-labelledby="atlas-map-title">
		<div class="catalog-heading"><h2 id="atlas-map-title">Znajdź swoje miejsce</h2><span class="small">Wszystkie działki · ceny ofertowe</span></div>
		<p class="small">Najedź na punkt, aby zobaczyć cenę. Kliknij lub dotknij punktu, aby otworzyć opis i przejść do analizy.</p>
		<div id="atlas-map" role="region" aria-label="Mapa działek z cenami"></div>
		<p id="atlas-map-status" class="small" role="status">Punkty wskazują orientacyjne środki działek, nie ich granice. Mapa pokazuje cały atlas niezależnie od filtrów katalogu.</p>
		<ul class="map-links" aria-label="Wszystkie działki na mapie">${plots.map((plot) => `<li><a href="${plotLink(plot.slug)}" data-plot="${e(plot.slug)}"><span>${e(plot.number)} · ${e(plot.location.split(" · ")[0])}</span><strong>${e(mapPrice(plot))}</strong>${hasMapLocation(plot) ? "" : "<small>Lokalizacja nieustalona</small>"}</a></li>`).join("")}</ul>
	</section>`;
}

function popupContent(plot) {
	const content = document.createElement("div");
	const title = document.createElement("strong");
	title.textContent = `${plot.number} · ${plot.title}`;
	const detail = document.createElement("p");
	detail.textContent = `${plot.location} — ${mapPrice(plot)}${plot.id.includes(" + ") ? " za pakiet" : ""}`;
	const link = document.createElement("a");
	link.href = plotLink(plot.slug);
	link.dataset.plot = plot.slug;
	link.textContent = "Otwórz analizę →";
	content.append(title, detail, link);
	return content;
}

function addPlotMarker(L, map, plot) {
	const tooltip = document.createElement("span");
	tooltip.textContent = `${plot.number} · ${mapPrice(plot)}`;
	const marker = L.marker([plot.mapLocation.lat, plot.mapLocation.lng], {
		icon: L.divIcon({
			className: "plot-marker",
			html: "",
			iconSize: [24, 24],
			iconAnchor: [12, 12],
		}),
		keyboard: true,
	})
		.addTo(map)
		.bindTooltip(tooltip, { direction: "top", offset: [0, -12], opacity: 1 })
		.bindPopup(popupContent(plot), { maxWidth: 240 });
	marker
		.getElement()
		.setAttribute(
			"aria-label",
			`Działka ${plot.number} — pokaż cenę i analizę`,
		);
}

export function mountAtlasMap(plots) {
	const container = document.querySelector("#atlas-map");
	const status = document.querySelector("#atlas-map-status");
	const located = plots.filter(hasMapLocation);
	const L = window.L;
	if (!L || !located.length) {
		container.hidden = true;
		status.textContent =
			"Mapa jest niedostępna. Wszystkie działki i ceny znajdziesz na liście poniżej.";
		return () => {};
	}
	const map = L.map(container, { scrollWheelZoom: false });
	const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	}).addTo(map);
	tiles.on("tileerror", () => {
		status.textContent =
			"Nie udało się wczytać części podkładu mapy. Znaczniki i lista działek pozostają dostępne.";
	});
	const bounds = L.latLngBounds(
		located.map((plot) => [plot.mapLocation.lat, plot.mapLocation.lng]),
	);
	map.fitBounds(bounds, { padding: [75, 65], maxZoom: 15 });
	for (const plot of located) addPlotMarker(L, map, plot);
	return () => map.remove();
}
