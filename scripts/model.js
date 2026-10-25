export const roadTypes = {
	gravel: {
		label: "Kruszywo",
		description:
			"20 cm dolnej warstwy + 10 cm kruszywa naturalnego. Niższy koszt początkowy; możliwe pylenie, koleiny i okresowe równanie.",
	},
	reclaimed: {
		label: "Destrukt asfaltowy",
		description:
			"20 cm podbudowy + 10 cm destruktu zagęszczanego na zimno. Parametry zależą od materiału; to nie asfalt na gorąco.",
	},
	jumbo: {
		label: "JUMBO — oszczędniejszy",
		description:
			"Płyty 100×75×10 cm po 50 zł brutto, podbudowa 25 cm, tańsze odpowiednie kruszywo, częściowe wykorzystanie ziemi, lokalne obrzeża. Wariant warunkowy.",
	},
	"jumbo-full": {
		label: "JUMBO — pełny zakres",
		description:
			"Te same płyty, podbudowa 30 cm z droższego kruszywa, pełny wywóz ziemi i obrzeża po obu stronach. Konserwatywny wariant budowy od zera.",
	},
};

export function calculateCosts(data, selection) {
	const { length, owners, road, gas } = selection;
	const scenario = Object.hasOwn(data.lengths, String(length))
		? data.lengths[String(length)]
		: undefined;
	if (!scenario || !Number.isInteger(owners) || owners < 1 || owners > 20) {
		throw new RangeError(
			"Wybierz poprawną długość i od 1 do 20 współfinansujących.",
		);
	}
	if (!Object.hasOwn(roadTypes, road) || !Object.hasOwn(scenario.roads, road))
		throw new RangeError("Nieznana nawierzchnia.");
	if (!["none", "short", "long"].includes(gas))
		throw new RangeError("Nieznany wariant gazu.");
	const share = (amount) => amount.map((value) => value / owners);
	const rows = [
		{
			label: `Droga — udział 1/${owners}`,
			values: share(scenario.roads[road]),
			kind: "common",
		},
		{
			label: `Wspólny wodociąg — udział 1/${owners}`,
			values: share(scenario.waterCommon),
			kind: "common",
		},
		{
			label: `Rura teletechniczna — udział 1/${owners}`,
			values: share(scenario.telecomCommon),
			kind: "common",
		},
		{
			label: "Twoje przyłącze wody do domu",
			values: scenario.waterPrivate,
			kind: "individual",
		},
		{
			label: "Twój prąd: operator + kabel do domu",
			values: scenario.electricity,
			kind: "individual",
		},
	];
	if (gas !== "none")
		rows.push({
			label: "Twój gaz — wybrany wariant",
			values: gas === "short" ? scenario.gasShort : scenario.gasLong,
			kind: "individual",
		});
	const total = [0, 1].map((i) =>
		rows.reduce((sum, row) => sum + row.values[i], 0),
	);
	return {
		rows,
		total,
		roadTotal: scenario.roads[road],
		roadShare: share(scenario.roads[road]),
	};
}

export function filterPlots(plots, query, status, sort) {
	const needle = query.trim().toLocaleLowerCase("pl");
	const result = plots.filter(
		(plot) =>
			`${plot.number} ${plot.id} ${plot.title} ${plot.location}`
				.toLocaleLowerCase("pl")
				.includes(needle) &&
			(status === "all" || plot.statusKey === status),
	);
	return result.sort((a, b) =>
		sort === "price"
			? a.pricePln - b.pricePln
			: sort === "area"
				? b.areaM2 - a.areaM2
				: a.number.localeCompare(b.number, "pl", { numeric: true }),
	);
}
