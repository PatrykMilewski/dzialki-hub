import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { cardsMarkup, reportMarkup } from "../scripts/render.js";
import { evidence } from "../scripts/ui.js";

const root = new URL("../", import.meta.url);
const atlas = JSON.parse(await readFile(new URL("data/plots.json", root)));

test("all records have unique links, valid evidence references and existing map files", async () => {
	assert.equal(
		new Set(atlas.plots.map((plot) => plot.slug)).size,
		atlas.plots.length,
	);
	assert.equal(
		new Set(atlas.plots.map((plot) => plot.id)).size,
		atlas.plots.length,
	);
	for (const plot of atlas.plots) {
		const sectionIds = plot.sections.map((section) => section.id);
		assert.equal(new Set(sectionIds).size, sectionIds.length);
		assert.ok(
			sectionIds.every(
				(id) => !["koszty", "ryzyka", "pytania", "zrodla"].includes(id),
			),
		);
		assert.match(plot.slug, /^[a-z0-9-]+$/);
		assert.ok(Number.isFinite(plot.pricePln) && plot.pricePln > 0);
		const sources = new Set(plot.sources.map((source) => source.id));
		assert.equal(sources.size, plot.sources.length);
		for (const fact of [
			...plot.facts,
			...plot.sections.flatMap((section) => section.items),
		]) {
			assert.ok(Object.hasOwn(evidence, fact.status));
			for (const id of fact.sourceIds ?? [])
				assert.ok(sources.has(id), `Missing source ${id}`);
		}
		const images = [
			plot.thumbnail,
			plot.hero,
			...plot.sections.flatMap((section) =>
				section.figures.map((figure) => figure.src),
			),
		];
		for (const image of images) {
			assert.match(image, /^assets\//);
			await access(new URL(image, root));
		}
		if (plot.costFile) await access(new URL(plot.costFile, root));
		for (const source of plot.sources) {
			if (source.url !== undefined)
				assert.equal(new URL(source.url).protocol, "https:");
			else assert.ok(source.note.includes("niepubliczn"));
		}
		assert.equal(
			new Set(plot.questions.map((question) => question.id)).size,
			plot.questions.length,
		);
		assert.doesNotMatch(
			reportMarkup(plot),
			/undefined|NaN|\/Users\/|file:\/\//,
		);
	}
});

test("1209/2 has its own terrain provenance and no inherited cost calculator", () => {
	const plot = atlas.plots.find((plot) => plot.id === "220508_5.0004.1209/2");
	assert.ok(plot);
	assert.equal(plot.pricePln, 700000);
	assert.equal(plot.areaM2, 1108);
	assert.equal(plot.costFile, undefined);
	for (const html of [cardsMarkup([plot]), reportMarkup(plot)]) {
		assert.match(html, /NMT 08\.09\.2024/);
		assert.match(html, /alt="Mapa wysokości działki 1209\/2/);
		assert.doesNotMatch(
			html,
			/archiwalnej ortofotomapie|OLX|750\/73|750\/54|cost-form|href="#koszty"|przy kalkulatorze/,
		);
	}
});

test("section numbering follows content length with or without a calculator", () => {
	for (const costFile of [undefined, "data/costs.json"]) {
		const plot = {
			...atlas.plots[0],
			sections: atlas.plots[0].sections.slice(0, 2),
			costFile,
		};
		const numbers = [
			...reportMarkup(plot).matchAll(/class="section-no">(\d+)</g),
		].map((match) => Number(match[1]));
		const count = plot.sections.length + (costFile ? 1 : 0) + 3;
		assert.deepEqual(
			numbers,
			Array.from({ length: count }, (_, i) => i + 1),
		);
	}
});

test("first record preserves the specific 750/73 price rather than the listing headline", () => {
	const plot = atlas.plots[0];
	assert.equal(plot.id, "220508_5.0004.750/73");
	assert.equal(plot.areaM2, 944);
	assert.equal(plot.pricePln, 542800);
	assert.equal(plot.pricePerM2, 575);
});

test("future cards use their own image dates and notices", () => {
	const plot = {
		...atlas.plots[0],
		imageLabel: "ORTO · 2025",
		cardNotice: { title: "Sprawdź dojazd", text: "Inny problem" },
	};
	const html = cardsMarkup([plot]);
	assert.match(html, /ORTO · 2025/);
	assert.match(html, /Sprawdź dojazd/);
	assert.doesNotMatch(html, /23\.04\.2023|Najpierw sprawdź WZ/);
});

test("private sources render escaped text without a fabricated link", () => {
	const plot = {
		...atlas.plots[0],
		sources: [
			{
				id: "private",
				label: "Opinia <prywatna>",
				note: "Dokument niepubliczny",
			},
		],
	};
	const html = reportMarkup(plot);
	assert.match(
		html,
		/<article id="source-private"><strong>Opinia &lt;prywatna&gt;<\/strong>/,
	);
	assert.doesNotMatch(html, /href="#"/);
});

test("750/71 exposes both published layouts while existing single layouts still render", async () => {
	for (const plot of atlas.plots) {
		const layouts =
			plot.exampleLayouts ?? (plot.exampleLayout ? [plot.exampleLayout] : []);
		const html = reportMarkup(plot);
		assert.equal(
			(html.match(/class="example-layout-link"/g) ?? []).length,
			layouts.length,
		);
		for (const layout of layouts) {
			await access(new URL(layout.href, root));
			assert.ok(html.includes(`href="${layout.href}"`));
		}
	}
	const plot = atlas.plots.find((item) => item.slug === "chwaszczyno-750-71");
	assert.equal(plot.exampleLayouts.length, 2);
});

test("multiple layout links escape content and reject executable URLs", () => {
	const plot = {
		...atlas.plots[0],
		exampleLayouts: [
			{
				title: '<img onerror="x">',
				description: "<script>x</script>",
				href: "javascript:alert(1)",
			},
		],
	};
	const html = reportMarkup(plot);
	assert.match(html, /&lt;img onerror=&quot;x&quot;&gt;/);
	assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
	assert.doesNotMatch(html, /javascript:|<img onerror=|<script>x/);
});
