import { mountCalculator } from "./calculator.js";
import { mountAtlasMap } from "./map.js";
import { filterPlots } from "./model.js";
import {
	cardsMarkup,
	comparisonMarkup,
	hubMarkup,
	reportMarkup,
} from "./render.js";
import { escapeHtml as e, safeUrl } from "./ui.js";

let disposeMap = () => {};
const main = document.querySelector("#main");
let atlas;
let view = "cards";
let renderSequence = 0;
let renderedSearch;

async function loadJson(path) {
	const response = await fetch(path);
	if (!response.ok)
		throw new Error(`Nie udało się pobrać danych (${response.status}).`);
	return response.json();
}

function updateResults() {
	const form = document.querySelector("#filters");
	const plots = filterPlots(
		atlas.plots,
		form.elements.query.value,
		form.elements.status.value,
		form.elements.sort.value,
	);
	document.querySelector("#result-count").textContent =
		`Wyświetlono ${plots.length} z ${atlas.plots.length} analiz`;
	document.querySelector("#plot-results").innerHTML = plots.length
		? view === "cards"
			? cardsMarkup(plots)
			: comparisonMarkup(plots)
		: '<div class="empty-state"><h3>Nie znaleziono działki.</h3><p>Zmień wyszukiwanie lub status analizy.</p><button type="button" class="button secondary" id="clear-filters">Wyczyść filtry</button></div>';
}

function mountHub() {
	main.innerHTML = hubMarkup(atlas);
	disposeMap = mountAtlasMap(atlas.plots);
	document.querySelector("#filters").addEventListener("input", updateResults);
	document
		.querySelector("#filters")
		.addEventListener("submit", (event) => event.preventDefault());
	document.querySelectorAll("[data-view]").forEach((button) => {
		button.setAttribute("aria-pressed", String(button.dataset.view === view));
		button.addEventListener("click", () => {
			view = button.dataset.view;
			document.querySelectorAll("[data-view]").forEach((item) => {
				item.setAttribute("aria-pressed", String(item === button));
			});
			updateResults();
		});
	});
	updateResults();
}

function checkedQuestions(key) {
	try {
		const value = JSON.parse(localStorage.getItem(key) ?? "[]");
		return new Set(
			Array.isArray(value)
				? value.filter((item) => typeof item === "string")
				: [],
		);
	} catch {
		return new Set();
	}
}

function mountChecklist(plot) {
	const key = `dzialki-hub:questions:${plot.id}`;
	const saved = checkedQuestions(key);
	const inputs = [...document.querySelectorAll("[data-question]")];
	const progress = () => {
		document.querySelector("#check-progress").textContent =
			`${inputs.filter((input) => input.checked).length} / ${inputs.length} odpowiedzi zebranych`;
	};
	inputs.forEach((input) => {
		input.checked = saved.has(input.dataset.question);
		input.addEventListener("change", () => {
			try {
				localStorage.setItem(
					key,
					JSON.stringify(
						inputs
							.filter((item) => item.checked)
							.map((item) => item.dataset.question),
					),
				);
			} catch {
				document.querySelector("#copy-status").textContent =
					"Przeglądarka nie pozwala zapisać listy. Zaznaczenia pozostają do zamknięcia strony.";
			}
			progress();
		});
	});
	document
		.querySelector("#copy-questions")
		.addEventListener("click", async () => {
			const text = `Pytania dotyczące działki ${plot.number}\n\n${plot.questions.map((question, i) => `${i + 1}. ${question.text}`).join("\n\n")}`;
			try {
				await navigator.clipboard.writeText(text);
				document.querySelector("#copy-status").textContent =
					"Pytania skopiowane. Nic nie zostało wysłane.";
			} catch {
				document.querySelector("#copy-status").textContent =
					"Schowek jest niedostępny. Zaznacz i skopiuj tekst pytań z listy.";
			}
		});
	progress();
}

async function renderRoute() {
	const sequence = ++renderSequence;
	disposeMap();
	disposeMap = () => {};
	renderedSearch = location.search;
	const slug = new URLSearchParams(location.search).get("dzialka");
	const plot = atlas.plots.find((item) => item.slug === slug);
	document.body.classList.toggle("detail-view", Boolean(plot));
	if (!slug) {
		document.title = "Działki — atlas decyzji";
		mountHub();
		return;
	}
	if (!plot) {
		main.innerHTML =
			'<div class="empty-state"><h1>Nie ma takiej analizy.</h1><a class="button primary" href="./" data-home>Wróć do atlasu</a></div>';
		return;
	}
	document.title = `${plot.number} · ${plot.location} — Działki`;
	main.innerHTML = reportMarkup(plot);
	mountChecklist(plot);
	if (plot.costFile && /^data\/[a-zA-Z0-9_-]+\.json$/.test(plot.costFile)) {
		try {
			const costs = await loadJson(plot.costFile);
			if (sequence === renderSequence) mountCalculator(costs, plot);
		} catch {
			if (sequence === renderSequence)
				document.querySelector("#cost-output").innerHTML =
					'<p class="notice">Nie udało się pobrać kosztorysu. Odśwież stronę, aby spróbować ponownie.</p>';
		}
	}
	if (sequence === renderSequence && location.hash)
		document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

function navigate(slug) {
	const url = new URL(location.href);
	url.search = slug ? new URLSearchParams({ dzialka: slug }).toString() : "";
	url.hash = "";
	history.pushState({}, "", url);
	renderRoute();
	window.scrollTo({ top: 0 });
	main.focus({ preventScroll: true });
}

function openMap(button) {
	const dialog = document.querySelector("#map-dialog");
	document.querySelector("#map-title").textContent = button.dataset.alt;
	document.querySelector("#map-image").src = safeUrl(button.dataset.map);
	document.querySelector("#map-image").alt = button.dataset.alt;
	document.querySelector("#map-caption").textContent = button.dataset.caption;
	document.querySelector("#map-original").href = safeUrl(button.dataset.map);
	dialog.showModal();
}

document.addEventListener("click", (event) => {
	const target = event.target.closest("a, button");
	if (!target) return;
	if (
		target.matches("[data-plot], [data-home]") &&
		!event.metaKey &&
		!event.ctrlKey &&
		!event.shiftKey &&
		event.button === 0
	) {
		event.preventDefault();
		navigate(target.dataset.plot);
		return;
	}
	if (target.matches("[data-map]")) openMap(target);
	if (target.matches("[data-print]")) window.print();
	if (target.id === "clear-filters") {
		document.querySelector("#filters").reset();
		updateResults();
	}
});
document
	.querySelector("#close-map")
	.addEventListener("click", () =>
		document.querySelector("#map-dialog").close(),
	);
document.querySelector("#map-dialog").addEventListener("click", (event) => {
	if (event.target === event.currentTarget) event.currentTarget.close();
});
window.addEventListener("popstate", () => {
	if (location.search !== renderedSearch) renderRoute();
});

try {
	atlas = await loadJson("data/plots.json");
	if (!Array.isArray(atlas.plots))
		throw new Error("Niepoprawny format atlasu.");
	await renderRoute();
} catch (error) {
	main.innerHTML = `<div class="empty-state"><h1>Atlas chwilowo niedostępny.</h1><p>${e(error.message)}</p><a class="button primary" href="./">Spróbuj ponownie</a></div>`;
}
