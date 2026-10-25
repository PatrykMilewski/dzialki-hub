import {
	escapeHtml as e,
	safeUrl,
	number,
	money,
	badge,
	sourceRefs,
	figureMarkup,
	plotLink,
	date,
} from "./ui.js";
import { calculatorMarkup } from "./calculator.js";

export function hubMarkup(data) {
	const locations = new Set(
		data.plots.map((plot) => plot.location.split(" · ")[0]),
	).size;
	return `<section class="hub-intro"><div><span class="eyebrow"><span class="status-dot"></span> TRÓJMIASTO I OKOLICE · ATLAS DZIAŁEK</span><h1>Zanim wybierzesz<br>miejsce <em>na dom.</em></h1><p>Wszystkie analizy w jednym miejscu. Zobacz, co wiemy o działce, co wymaga sprawdzenia i ile może kosztować przygotowanie jej do budowy.</p></div><aside class="intro-note"><span class="folio">01 / ATLAS</span><div class="intro-count"><strong>${data.plots.length}</strong><span>analiz w atlasie<br>${locations} miejscowości</span></div><span class="small">Aktualizacja<br><strong>${e(date(data.updatedAt))}</strong></span></aside></section>
    <section class="catalog" aria-labelledby="catalog-title"><div class="catalog-heading"><h2 id="catalog-title">Działki pod lupą <span class="count">${data.plots.length}</span></h2><span class="small">Ustalenia. Założenia. Otwarte pytania.</span></div>
    <form id="filters" class="filters" role="search"><label class="search-field"><span class="sr-only">Szukaj działki</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input name="query" type="search" placeholder="Szukaj miejscowości, ulicy lub numeru działki…" autocomplete="off"></label><label><span class="sr-only">Status analizy</span><select name="status"><option value="all">Wszystkie statusy</option><option value="conditional">Warunkowo</option><option value="favorable">Do rozważenia</option><option value="excluded">Odrzucone</option></select></label><label><span class="sr-only">Sortowanie</span><select name="sort"><option value="number">Numer działki</option><option value="price">Cena rosnąco</option><option value="area">Powierzchnia malejąco</option></select></label></form>
    <div class="catalog-toolbar"><span id="result-count" aria-live="polite"></span><div class="view-switch" aria-label="Widok wyników"><button type="button" data-view="cards" aria-pressed="true">Karty</button><button type="button" data-view="table" aria-pressed="false">Porównanie</button></div></div><div id="plot-results"></div></section>
    <section class="atlas-note"><span class="compass" aria-hidden="true">↗</span><div><h2>Nie każda ładna działka<br>pasuje do Twojego domu.</h2><p>Najpierw sprawdzamy dokumenty, teren i dostęp. Potem porównujemy cenę i scenariusze. Nowe analizy będą trafiały do tego samego atlasu.</p></div></section>`;
}

export function cardsMarkup(plots) {
	return plots
		.map(
			(plot, index) =>
				`<article class="plot-card"><a class="plot-map" data-plot="${e(plot.slug)}" href="${plotLink(plot.slug)}" aria-label="Otwórz analizę działki ${e(plot.number)}"><img src="${e(safeUrl(plot.hero ?? plot.thumbnail))}" alt="Działka ${e(plot.number)} na archiwalnej ortofotomapie" fetchpriority="${index === 0 ? "high" : "auto"}"><span class="map-label">${e(plot.imageLabel)}</span><span class="map-north">N ↑</span><span class="map-coordinate">${e(plot.id)}</span></a><div class="plot-summary"><div class="card-topline"><span class="eyebrow">${e(plot.location)}</span><span class="verdict-tag">${e(plot.statusLabel)}</span></div><h3><a data-plot="${e(plot.slug)}" href="${plotLink(plot.slug)}">${e(plot.title)}<span>Działka ${e(plot.number)}</span></a></h3><div class="card-numbers"><div><strong>${number(plot.areaM2)}<small> m²</small></strong><span>powierzchnia oferty</span></div><div><strong>${money(plot.pricePln)}</strong><span>${number(plot.pricePerM2)} zł/m² · cena ofertowa</span></div></div><p>${e(plot.summary)}</p><div class="card-warning"><span aria-hidden="true">!</span><div><strong>${e(plot.cardNotice.title)}</strong><small>${e(plot.cardNotice.text)}</small></div></div><a class="button primary" data-plot="${e(plot.slug)}" href="${plotLink(plot.slug)}">Otwórz analizę <span aria-hidden="true">↗</span></a></div></article>`,
		)
		.join("");
}

export function comparisonMarkup(plots) {
	return `<div class="table-scroll"><table><caption class="sr-only">Porównanie działek w atlasie</caption><thead><tr><th>Działka</th><th>Powierzchnia</th><th>Cena oferty</th><th>Za m²</th><th>Status</th><th>Najważniejszy wniosek</th></tr></thead><tbody>${plots.map((plot) => `<tr><th><a data-plot="${e(plot.slug)}" href="${plotLink(plot.slug)}">${e(plot.number)}</a><small>${e(plot.location)}</small></th><td>${number(plot.areaM2)} m²</td><td>${money(plot.pricePln)}</td><td>${number(plot.pricePerM2)} zł</td><td>${e(plot.statusLabel)}</td><td>${e(plot.verdict.title)}</td></tr>`).join("")}</tbody></table></div>`;
}

function reportHero(plot) {
	return `<div class="breadcrumb"><a href="./" data-home>← Wszystkie działki</a><span>ANALIZA / ${e(plot.number)}</span><button class="text-button print-button" type="button" data-print>Drukuj / PDF ↗</button></div><section class="report-hero"><div><span class="eyebrow">${e(plot.location)}</span><h1>${e(plot.title)}<em>${e(plot.number)}</em></h1><span class="parcel-id">${e(plot.id)}</span><div class="report-price"><strong>${money(plot.pricePln)}</strong><span>${number(plot.areaM2)} m² · ${number(plot.pricePerM2)} zł/m²</span></div><p class="small">Cena ofertowa, stan analizy ${e(date(plot.updatedAt))}.</p><a class="text-link" href="${e(safeUrl(plot.offerUrl))}" target="_blank" rel="noopener noreferrer">Zobacz ogłoszenie OLX ↗</a></div><div class="report-map"><img src="${e(safeUrl(plot.hero ?? plot.thumbnail))}" alt="Granice działki ${e(plot.number)} na archiwalnej ortofotomapie"><span class="map-label">${e(plot.imageLabel)} · STAN ARCHIWALNY</span><span class="map-north">N ↑</span></div></section>`;
}

function sectionMarkup(section, index) {
	return `<section class="report-section" id="${e(section.id)}"><div class="section-heading"><span class="section-no">${String(index + 1).padStart(2, "0")}</span><div><h2>${e(section.title)}</h2></div></div><p class="section-lead">${e(section.lead)}</p><div class="findings">${section.items.map((item) => `<article class="finding"><div>${badge(item.status)}<h3>${e(item.label)}</h3></div><p>${e(item.text)} ${sourceRefs(item.sourceIds)}</p></article>`).join("")}</div><div class="figures">${section.figures.map(figureMarkup).join("")}</div></section>`;
}

function risksMarkup(plot) {
	return `<section class="report-section" id="ryzyka"><div class="section-heading"><span class="section-no">07</span><h2>Co musi się wyjaśnić?</h2></div><div class="risk-list">${plot.risks.map((risk, i) => `<article class="risk ${risk.severity === "high" ? "high" : "medium"}"><span class="risk-index">${String(i + 1).padStart(2, "0")}</span><div><span class="eyebrow">${risk.severity === "high" ? "PRIORYTET PRZED ZAKUPEM" : "DO WERYFIKACJI"}</span><h3>${e(risk.title)}</h3><p>${e(risk.detail)}</p></div></article>`).join("")}</div></section>`;
}

function questionsMarkup(plot) {
	return `<section class="report-section" id="pytania"><div class="section-heading"><span class="section-no">08</span><h2>Pytania do sprzedającej</h2></div><p class="section-lead">Zaznacz pytania, na które masz już odpowiedź. Lista jest zapisywana tylko w tej przeglądarce.</p><div class="checklist-toolbar"><span id="check-progress" aria-live="polite"></span><button type="button" class="button secondary" id="copy-questions">Skopiuj wszystkie pytania</button></div><div class="checklist">${plot.questions.map((question) => `<label class="check-item"><input type="checkbox" data-question="${e(question.id)}"><span>${e(question.text)}</span></label>`).join("")}</div><p id="copy-status" class="small" role="status"></p></section>`;
}

function sourcesMarkup(plot) {
	return `<section class="report-section" id="zrodla"><div class="section-heading"><span class="section-no">09</span><h2>Źródła i ślad analizy</h2></div><p class="section-lead">Analiza z ${e(date(plot.updatedAt))}. Przy każdym źródle opisano, co potwierdza i jakie ma ograniczenia. Źródła cen mediów znajdują się także przy kalkulatorze.</p><div class="sources">${plot.sources.map((source) => `<article id="source-${e(source.id)}"><a href="${e(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${e(source.label)} ↗</a><p>${e(source.note)}</p></article>`).join("")}</div><div class="notice"><strong>To materiał do podejmowania decyzji.</strong> Mapy i schematy nie są dokumentacją projektową. Nie potwierdzają praw do gruntu, dopuszczalności zabudowy ani faktycznego przebiegu sieci.</div></section>`;
}

export function reportMarkup(plot) {
	const navigation = [
		...plot.sections.map(({ id, title }) => ({ id, title })),
		{ id: "koszty", title: "Droga i media" },
		{ id: "ryzyka", title: "Ryzyka" },
		{ id: "pytania", title: "Pytania" },
		{ id: "zrodla", title: "Źródła" },
	];
	return `${reportHero(plot)}<div class="verdict-panel"><span class="verdict-tag">${e(plot.statusLabel)}</span><div><h2>${e(plot.verdict.title)}</h2><p>${e(plot.verdict.text)}</p></div></div><div class="fact-grid">${plot.facts.map((fact) => `<article>${badge(fact.status)}<h3>${e(fact.label)}</h3><strong>${e(fact.value)}</strong><p>${e(fact.note)}</p></article>`).join("")}</div><nav class="report-nav" aria-label="Sekcje analizy">${navigation
		.filter((item) => plot.costFile || item.id !== "koszty")
		.map((item) => `<a href="#${e(item.id)}">${e(item.title)}</a>`)
		.join(
			"",
		)}</nav><div class="report-body">${plot.sections.map(sectionMarkup).join("")}${plot.costFile ? calculatorMarkup() : ""}${risksMarkup(plot)}${questionsMarkup(plot)}${sourcesMarkup(plot)}</div>`;
}
