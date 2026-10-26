import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
	atlasMapMarkup,
	hasMapLocation,
	mapPrice,
	placeLabels,
} from "../scripts/map.js";

const atlas = JSON.parse(
	await readFile(new URL("../data/plots.json", import.meta.url)),
);

test("every atlas analysis has a sourced location and exactly one map list link", () => {
	const html = atlasMapMarkup(atlas.plots);
	for (const plot of atlas.plots) {
		assert.ok(hasMapLocation(plot), plot.slug);
		assert.ok(plot.mapLocation.lat > 54 && plot.mapLocation.lat < 55);
		assert.ok(plot.mapLocation.lng > 18 && plot.mapLocation.lng < 19);
		assert.equal(
			new URL(plot.mapLocation.sourceUrl).hostname,
			"uldk.gugik.gov.pl",
		);
		assert.match(plot.mapLocation.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
		assert.ok(plot.mapLocation.method);
		assert.equal(html.split(`data-plot="${plot.slug}"`).length - 1, 1);
		assert.ok(html.includes(mapPrice(plot)));
	}
});

test("missing price and coordinates stay explicit and fallback links escape data", () => {
	const plot = {
		slug: "test",
		number: "<img onerror=alert(1)>",
		location: "Test",
		pricePln: null,
	};
	assert.equal(mapPrice(plot), "Cena nieustalona");
	assert.equal(hasMapLocation(plot), false);
	assert.equal(hasMapLocation({ mapLocation: { lat: 100, lng: 18 } }), false);
	assert.equal(hasMapLocation({ mapLocation: { lat: "54", lng: 18 } }), false);
	const html = atlasMapMarkup([plot]);
	assert.match(html, /Cena nieustalona/);
	assert.match(html, /Lokalizacja nieustalona/);
	assert.match(html, /href="\?dzialka=test"/);
	assert.doesNotMatch(html, /<img/);
});

test("seven neighboring price labels remain separate on a phone", () => {
	const points = Array.from({ length: 7 }, (_, i) => ({
		x: 160 + i,
		y: 170 + i,
	}));
	const labels = placeLabels(points, { x: 320, y: 360 });
	for (const [i, point] of labels.entries()) {
		assert.ok(point.x >= 63 && point.x <= 320 - 63);
		assert.ok(point.y >= 24 && point.y <= 360 - 24);
		for (const other of labels.slice(i + 1)) {
			assert.ok(
				Math.abs(point.x - other.x) >= 126 || Math.abs(point.y - other.y) >= 48,
			);
		}
	}
	assert.deepEqual(placeLabels([{ x: -200, y: -200 }], { x: 320, y: 360 }), [
		{ x: -200, y: -200 },
	]);
});

test("current atlas positions have no overlapping prices on narrow phones", () => {
	const points = [
		{ x: 128, y: 160 },
		{ x: 181, y: 77 },
		{ x: 135, y: 93 },
		{ x: 150, y: 119 },
		{ x: 226, y: 283 },
		{ x: 174, y: 92 },
		{ x: 140, y: 168 },
	];
	for (const width of [280, 288, 320, 339, 354, 400]) {
		const labels = placeLabels(points, { x: width, y: 360 });
		for (const [i, point] of labels.entries()) {
			for (const other of labels.slice(i + 1))
				assert.ok(
					Math.abs(point.x - other.x) >= 126 ||
						Math.abs(point.y - other.y) >= 48,
					`Overlap at ${width}px`,
				);
		}
	}
});
