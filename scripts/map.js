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
		<p class="small">Kliknij cenę, aby otworzyć opis i przejść do analizy. Kropka wskazuje działkę, a linia łączy ją z ceną.</p>
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
	const label = document.createElement("span");
	const price = document.createElement("strong");
	price.textContent = mapPrice(plot);
	const number = document.createElement("small");
	number.textContent = plot.number;
	label.append(price, number);
	const icon = L.divIcon({
		className: "plot-price-marker",
		html: label,
		iconSize: [126, 48],
		iconAnchor: [63, 24],
	});
	return L.marker([plot.mapLocation.lat, plot.mapLocation.lng], {
		icon,
		title: `${plot.number}: ${mapPrice(plot)}`,
		keyboard: true,
	})
		.addTo(map)
		.bindPopup(popupContent(plot), { maxWidth: 240 });
}

export function placeLabels(points, size) {
	const occupied = [];
	return points.map((point) => {
		if (point.x < 0 || point.x > size.x || point.y < 0 || point.y > size.y)
			return point;
		const candidates = [];
		for (let x = 70; x <= size.x - 70; x += 136) {
			for (let y = 85; y <= size.y - 35; y += 58) candidates.push({ x, y });
		}
		candidates.sort(
			(a, b) =>
				Math.hypot(a.x - point.x, a.y - point.y) -
				Math.hypot(b.x - point.x, b.y - point.y),
		);
		const position =
			candidates.find(
				(candidate) =>
					candidate.x >= 70 &&
					candidate.x <= size.x - 70 &&
					candidate.y >= 65 &&
					candidate.y <= size.y - 35 &&
					occupied.every(
						(other) =>
							Math.abs(candidate.x - other.x) >= 136 ||
							Math.abs(candidate.y - other.y) >= 58,
					),
			) ?? point;
		occupied.push(position);
		return position;
	});
}

function mountMarkers(L, map, plots) {
	const entries = plots.map((plot) => {
		const origin = [plot.mapLocation.lat, plot.mapLocation.lng];
		L.circleMarker(origin, {
			radius: 4,
			color: "#173e35",
			fillOpacity: 1,
			interactive: false,
		}).addTo(map);
		const line = L.polyline([], {
			color: "#173e35",
			weight: 1.5,
			interactive: false,
		}).addTo(map);
		return { origin, line, marker: addPlotMarker(L, map, plot) };
	});
	const arrange = () => {
		if (entries.some((entry) => entry.marker.isPopupOpen())) return;
		const points = entries.map((entry) =>
			map.latLngToContainerPoint(entry.origin),
		);
		const positions = placeLabels(points, map.getSize());
		entries.forEach((entry, index) => {
			const position = map.containerPointToLatLng(positions[index]);
			entry.marker.setLatLng(position);
			entry.line.setLatLngs([entry.origin, position]);
		});
	};
	map.on("moveend resize popupclose", arrange);
	arrange();
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
	mountMarkers(L, map, located);
	return () => map.remove();
}
