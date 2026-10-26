import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateCosts, filterPlots } from "../scripts/model.js";
import { escapeHtml, safeUrl } from "../scripts/ui.js";

const data = JSON.parse(
	await readFile(new URL("../data/costs.json", import.meta.url)),
);
const selection = { length: 200, owners: 5, road: "gravel", gas: "none" };
const rounded = (values) =>
	values.map((value) => Math.round(value * 100) / 100);

test("200 m / five owners matches the audited report for all four surfaces", () => {
	const expected = {
		gravel: [47580.36, 74646.66],
		reclaimed: [49144.36, 77935.66],
		jumbo: [63121.19, 95293.58],
		"jumbo-full": [71785.56, 105943.91],
	};
	for (const [road, total] of Object.entries(expected)) {
		assert.deepEqual(
			rounded(calculateCosts(data, { ...selection, road }).total),
			total,
		);
	}
});

test("only common infrastructure is divided, individual connections and gas stay whole", () => {
	const single = calculateCosts(data, { ...selection, owners: 1, gas: "long" });
	const shared = calculateCosts(data, { ...selection, gas: "long" });
	shared.rows.forEach((row, index) => {
		assert.deepEqual(
			row.values,
			single.rows[index].values.map((value) =>
				row.kind === "common" ? value / 5 : value,
			),
		);
	});
	assert.deepEqual(shared.rows.at(-1).values, [38605.927, 42605.927]);
});

test("260 m full JUMBO road is the original 282–383k total, not the per-owner cost", () => {
	const result = calculateCosts(data, {
		...selection,
		length: 260,
		road: "jumbo-full",
	});
	assert.deepEqual(result.roadTotal, [282880.45, 382629.72]);
	assert.deepEqual(rounded(result.roadShare), [56576.09, 76525.94]);
});

test("invalid calculator selections are rejected", () => {
	for (const change of [
		{ owners: 0 },
		{ owners: 21 },
		{ owners: 1.5 },
		{ length: 201 },
		{ length: "constructor" },
		{ road: "__proto__" },
		{ gas: "free" },
	]) {
		assert.throws(
			() => calculateCosts(data, { ...selection, ...change }),
			RangeError,
		);
	}
});

test("search, status and sorting work with multiple plots without changing source order", () => {
	const plots = [
		{
			number: "2",
			id: "b",
			title: "Las",
			location: "Żukowo",
			pricePln: 300,
			areaM2: 1200,
			statusKey: "conditional",
		},
		{
			number: "1",
			id: "a",
			title: "Jezioro",
			location: "Chwaszczyno",
			pricePln: 100,
			areaM2: 900,
			statusKey: "favorable",
		},
	];
	assert.deepEqual(filterPlots(plots, " ŻUKOWO ", "conditional", "price"), [
		plots[0],
	]);
	assert.deepEqual(filterPlots(plots, "", "all", "price"), [
		plots[1],
		plots[0],
	]);
	assert.deepEqual(filterPlots(plots, "Las", "favorable", "number"), []);
	assert.equal(plots[0].number, "2");
});

test("rendering escapes markup and rejects executable and traversing URLs", () => {
	assert.equal(
		escapeHtml('<img onerror="x">'),
		"&lt;img onerror=&quot;x&quot;&gt;",
	);
	for (const value of [
		"javascript:alert(1)",
		"data:text/html,x",
		"assets/../secret",
		"//evil.test",
		"zagospodarowanie-../secret.html",
		'zagospodarowanie-750-73.html" onclick="alert(1)',
		undefined,
	])
		assert.equal(safeUrl(value), "#");
	assert.equal(safeUrl("assets/750-73/hero.svg"), "assets/750-73/hero.svg");
	assert.equal(
		safeUrl("zagospodarowanie-750-73.html"),
		"zagospodarowanie-750-73.html",
	);
	assert.equal(safeUrl("https://example.com/map"), "https://example.com/map");
});
