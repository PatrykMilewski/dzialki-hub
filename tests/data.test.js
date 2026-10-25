import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { reportMarkup, cardsMarkup } from "../scripts/render.js";
import { evidence } from "../scripts/ui.js";

const root = new URL("../", import.meta.url);
const atlas = JSON.parse(await readFile(new URL("data/plots.json", root)));

test("all records have unique links, valid evidence references and existing map files", async () => {
	assert.equal(
		new Set(atlas.plots.map((plot) => plot.slug)).size,
		atlas.plots.length,
	);
	for (const plot of atlas.plots) {
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
		for (const source of plot.sources)
			assert.equal(new URL(source.url).protocol, "https:");
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
