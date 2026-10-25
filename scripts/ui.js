export const evidence = {
	verified: "Potwierdzone",
	declared: "Deklaracja",
	assumed: "Założenie",
	unknown: "Do sprawdzenia",
};

export function escapeHtml(value) {
	return String(value ?? "").replace(
		/[&<>"']/g,
		(char) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[char],
	);
}

export function safeUrl(value) {
	if (typeof value !== "string") return "#";
	if (/^assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes(".."))
		return value;
	try {
		const parsed = new URL(value);
		return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "#";
	} catch {
		return "#";
	}
}

export const number = (value, digits = 0) =>
	new Intl.NumberFormat("pl-PL", {
		maximumFractionDigits: digits,
	}).format(value);

export const money = (value) => `${number(value)} zł`;
export const range = (values) => `${number(values[0])}–${number(values[1])} zł`;
export const rangeThousands = (values) =>
	`${number(values[0] / 1000, 1)}–${number(values[1] / 1000, 1)} tys. zł`;
export const badge = (status) =>
	`<span class="badge ${Object.hasOwn(evidence, status) ? status : "unknown"}">${evidence[status] ?? evidence.unknown}</span>`;
export const plotLink = (slug) => `?dzialka=${encodeURIComponent(slug)}`;

export function sourceRefs(ids = []) {
	return ids
		.map(
			(id) =>
				`<a class="source-ref" href="#source-${escapeHtml(id)}" aria-label="Źródło ${escapeHtml(id)}">[${escapeHtml(id)}]</a>`,
		)
		.join(" ");
}

export function figureMarkup(figure) {
	return `<figure><button class="map-button" type="button" data-map="${escapeHtml(safeUrl(figure.src))}" data-caption="${escapeHtml(figure.caption)}" data-alt="${escapeHtml(figure.alt)}" aria-label="Powiększ: ${escapeHtml(figure.alt)}"><img src="${escapeHtml(safeUrl(figure.src))}" alt="${escapeHtml(figure.alt)}" loading="lazy"><span class="map-zoom">Powiększ ↗</span></button><figcaption>${escapeHtml(figure.caption)}</figcaption></figure>`;
}

export const date = (value) =>
	new Intl.DateTimeFormat("pl-PL", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${value}T00:00:00Z`));
