import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { atlasMapMarkup, hasMapLocation, mapPrice } from "../scripts/map.js";

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
