import { calculateCosts, roadTypes } from "./model.js";
import { escapeHtml as e, range, rangeThousands, money } from "./ui.js";

export function calculatorMarkup() {
	return `<section id="koszty" class="report-section cost-section"><div class="section-heading"><span class="section-no">06</span><div><span class="eyebrow">DROGA I MEDIA</span><h2>Ile dopłacisz do działki?</h2></div></div>
    <p class="section-lead">Sprawdź udział w kosztach wspólnych oraz przyłącza, które finansujesz samodzielnie. Kwoty brutto, stan kalkulacji: 25.10.2026.</p>
    <div class="notice"><strong>Scenariusz, nie potwierdzone uzbrojenie.</strong> Przyjmujemy, że droga, wodociąg i sieć elektryczna dochodzą do rejonu 750/54. Od punktu A pozostaje około 192 m — do budżetu 200 m. Dokładnych końców sieci i zgód na finansowanie nie potwierdzono.</div>
    <div class="cost-layout"><form id="cost-form" class="cost-controls" aria-label="Założenia kalkulacji">
      <label>Nawierzchnia<select name="road">${Object.entries(roadTypes)
				.map(
					([key, value]) => `<option value="${key}">${e(value.label)}</option>`,
				)
				.join("")}</select></label>
      <div class="input-pair"><label>Długość trasy<select name="length"><option value="200">200 m · od rejonu 750/54</option><option value="260">260 m · od istniejącej ulicy</option></select></label><label>Liczba działek<select name="owners">${Array.from({ length: 20 }, (_, i) => `<option value="${i + 1}" ${i === 4 ? "selected" : ""}>${i + 1}</option>`).join("")}</select></label></div>
      <label>Gaz — koszt indywidualny<select name="gas"><option value="none">Nie uwzględniam gazu</option><option value="short">PSG rozbudowuje sieć, krótkie przyłącze</option><option value="long">Cała trasa jako długie przyłącze</option></select></label>
      <p id="road-description" class="small"></p><button class="text-button" type="reset">Przywróć założenia początkowe ↺</button>
    </form><div class="cost-output" aria-live="polite" aria-atomic="true" id="cost-output"></div></div>
    <details class="method-details"><summary>Co obejmuje koszt i skąd biorą się różnice?</summary><div><p>Droga ma pełną nawierzchnię szerokości 3 m, warstwy podbudowy na 3,5 m, prace ziemne, zagęszczanie, pobocza, proste odwodnienie i rezerwę 15%. Warianty oszczędniejsze zakładają nośny grunt oraz możliwość wykorzystania części ziemi na miejscu. Doboru warstw i materiału nie potwierdzono projektem.</p><p>JUMBO oszczędniejszy zachowuje cenę płyt 50 zł/szt. Oszczędność dotyczy 25 zamiast 30 cm podbudowy, tańszego odpowiedniego kruszywa, mniejszego wywozu ziemi i lokalnych obrzeży. Dla 200 m potrzeba 824 płyt z zapasem, czyli 41 200 zł za same płyty.</p><p>Przez liczbę działek dzielimy drogę, rozbudowę wspólnego wodociągu i pustą rurę teletechniczną. Każdy finansuje pełne własne przyłącze wody, prąd i opcjonalny gaz. Model zakłada równy podział. Nawet dla jednego właściciela pozostaje to model rozbudowy wodociągu, nie alternatywa długiego indywidualnego przyłącza.</p><p>Prąd: przykład 20 kW i złącza przy działce, według taryfy ENERGA 2026; osobno kabel do domu. Długość trasy nie zawsze jest długością przyłącza operatora. Gaz ma dwa alternatywne modele, zależnie od warunków PSG. Media należy wykonać przed docelową nawierzchnią.</p><p><strong>Poza sumą:</strong> ścieki, zakup udziałów/służebności, podatki i notariusz, dom, instalacje wewnętrzne, mijanka i plac zawracania, wymiana słabego gruntu, mury, przepusty i kanalizacja deszczowa. Niepotwierdzona kanalizacja nie została wyceniona jako zero. Rezerwa 15% dotyczy drogi; nie doliczamy jej ponownie do mediów.</p><p>To własne założenia budżetowe oparte na ilościach i cennikach, nie oferty dla działki. Nośność i równość nawierzchni wymagają niezależnej oceny. Kruszywo wymaga okresowego utrzymania; destrukt na zimno nie jest asfaltem na gorąco.</p><p><a href="https://cdn-netpr.pl/file/mediakit/2933024/8/20251217_taryfa_2026.pdf" target="_blank" rel="noopener noreferrer">ENERGA 2026 ↗</a> · <a href="https://www.psgaz.pl/pobierz/d29cc4aa-6ca4-478c-98d8-fec002230208/page" target="_blank" rel="noopener noreferrer">PSG — taryfa 14 ↗</a> · <a href="https://zwik.sochaczew.pl/cennik.html" target="_blank" rel="noopener noreferrer">Benchmark robót wodociągowych ↗</a> · <a href="https://www.krusz.bet/kruszywo-betonowe/" target="_blank" rel="noopener noreferrer">Kruszywo — lokalny dostawca ↗</a></p></div></details>
    <figure><button type="button" class="map-button" data-map="assets/750-73/trasa-media-droga.png" data-alt="Dwa warianty trasy drogą do 750/73" data-caption="A: około 192 m. B: około 257 m. Punkty początku sieci są założeniem; ortofotomapa z 23.04.2023." aria-label="Powiększ mapę trasy"><img src="assets/750-73/trasa-media-droga.png" alt="Trasa przez działki drogowe 750/55 i 750/69" loading="lazy"><span class="map-zoom">Powiększ trasę ↗</span></button><figcaption>A: wariant 200 m. B: wariant 260 m. Istniejące odcinki i końce sieci wymagają potwierdzenia.</figcaption></figure>
  </section>`;
}

export function mountCalculator(data, plot) {
	const form = document.querySelector("#cost-form");
	const render = () => {
		const selection = {
			road: form.elements.road.value,
			length: Number(form.elements.namedItem("length").value),
			owners: Number(form.elements.owners.value),
			gas: form.elements.gas.value,
		};
		const result = calculateCosts(data, selection);
		document.querySelector("#road-description").textContent =
			roadTypes[selection.road].description;
		document.querySelector("#cost-output").innerHTML = outputMarkup(
			result,
			plot,
			selection,
		);
	};
	form.addEventListener("change", render);
	form.addEventListener("submit", (event) => event.preventDefault());
	form.addEventListener("reset", () => setTimeout(render, 0));
	render();
}

function outputMarkup(result, plot, selection) {
	const gasLabel = {
		none: "bez gazu",
		short: "gaz: krótkie przyłącze",
		long: "gaz: długie przyłącze",
	}[selection.gas];
	const entry = result.total.map((value) => value + plot.pricePln);
	return `<span class="eyebrow">TWÓJ UDZIAŁ · DROGA I WYBRANE MEDIA</span><p class="cost-scenario">${e(roadTypes[selection.road].label)} · ${selection.length} m · podział na ${selection.owners} · ${gasLabel}</p><strong class="cost-total" data-testid="cost-total">${rangeThousands(result.total)}</strong><p class="cost-subtitle">Brutto. Bez ścieków i pozostałych niewycenionych prac.</p><dl class="cost-breakdown">${result.rows.map((row) => `<div><dt>${e(row.label)}</dt><dd>${range(row.values)}</dd></div>`).join("")}</dl><div class="road-subtotal"><span>Sama droga — całość / Twój udział</span><strong>${rangeThousands(result.roadTotal)} / ${rangeThousands(result.roadShare)}</strong></div><div class="purchase-total"><span>Cena ofertowa ${money(plot.pricePln)} + powyższy zakres</span><strong>${rangeThousands(entry)}</strong><small>To częściowa suma, nie pełny koszt zakupu i budowy.</small></div>`;
}
