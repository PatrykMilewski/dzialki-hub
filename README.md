# Działki — atlas decyzji

Publiczny hub analiz działek pod dom w Trójmieście i okolicach.

**Strona:** https://patrykmilewski.github.io/dzialki-hub/

Analizy: **220508_5.0004.750/73**, **220508_5.0004.1209/2**, **220508_5.0004.775/193** oraz pakiet **220508_5.0004.768/136 + 220508_5.0004.768/137**, Chwaszczyno, stan ustaleń 25.10.2026. Katalog, porównanie, mapy, źródła, ryzyka i listy pytań. Kalkulator wspólnej drogi i mediów dotyczy wyłącznie 750/73; dla 1209/2 koszt przygotowania pozostaje nieustalony.

## Uruchomienie i sprawdzenie

Bez instalowania zależności, Node.js 22 lub nowszy do testów:

```sh
npm run check
python3 -m http.server 8767 --bind 127.0.0.1
```

Otwórz http://127.0.0.1:8767/. Strona wymaga HTTP ze względu na pobieranie JSON i moduły JavaScript. GitHub Pages publikuje katalog główny gałęzi `main`; `.nojekyll` wyłącza przetwarzanie Jekyll.

## Dodawanie kolejnej działki

1. Dodaj rekord do `data/plots.json`, zachowując strukturę istniejącego rekordu i unikalny `slug`, identyfikator działki oraz identyfikatory źródeł i pytań. Ustaw własne `updatedAt`, `imageLabel`, `imageAlt`, `cardNotice`, cenę i wnioski.
2. Umieść mapy w osobnym `assets/<numer>/`. Podaj datę zobrazowania, pochodzenie danych i ograniczenia w podpisach. `hero` jest mapą główną; `thumbnail` jej alternatywą.
3. Sekcje, fakty, pytania i źródła są renderowane z danych. Status dowodu: `verified`, `declared`, `assumed` lub `unknown`. Status całej analizy: `conditional`, `favorable` lub `excluded`.
4. `costFile` jest opcjonalne. Obecny formularz i opis kalkulacji w `scripts/calculator.js` dotyczą **wyłącznie 750/73**. Dla kolejnej działki pomiń to pole, dopóki nie przygotujesz jej osobnego modelu, opisu zakresu i mapy trasy. Nie kopiuj kosztów Chwaszczyna bez dostosowania.
5. Zmień datę aktualizacji atlasu, uruchom `npm run check` i sprawdź stronę na komputerze i telefonie. Link do analizy: `?dzialka=<slug>` — działa także po odświeżeniu na GitHub Pages.

## Kosztorys 750/73

`data/costs.json` przechowuje przedziały brutto dla 200 i 260 m. Model domyślny: **200 m, 5 równych udziałów, kruszywo, bez gazu**. Hipoteza istniejącej infrastruktury do rejonu 750/54 wymaga potwierdzenia. Kwoty pochodzą z analizy i audytu kosztorysu z 25.10.2026; nie są ofertami wykonawców.

Droga, wspólny wodociąg i rura teletechniczna są dzielone przez liczbę działek. Przyłącze wody do domu, prąd oraz opcjonalny gaz pozostają indywidualne. Droga zawiera 15% rezerwy. Ścieki i inne niewycenione prace są wyraźnie wyłączone z sumy. Ta suma nie stanowi pełnego budżetu zakupu ani budowy domu.

Kontrola względem raportu dla 200 m i pięciu udziałów, z wodą i prądem, bez gazu:

| Nawierzchnia | Łączny udział + indywidualne przyłącza |
| --- | --- |
| Kruszywo | 47 580–74 647 zł |
| Destrukt | 49 144–77 936 zł |
| JUMBO oszczędniejszy | 63 121–95 294 zł |
| JUMBO pełny zakres | 71 786–105 944 zł |

Warianty oszczędniejsze wymagają potwierdzenia nośności gruntu i konstrukcji drogi. Kruszywo i destrukt nie mają deklarowanej trwałości równej płytom.

## Źródła i prywatność

Źródła merytoryczne oraz ograniczenia znajdują się w rekordzie działki i na stronie. Mapy są opracowaniami analitycznymi na podstawie wskazanych danych publicznych. Dla 750/73 ortofotomapa pochodzi z 23.04.2023; pełnej decyzji WZ, praw do drogi i końców sieci nie zweryfikowano dokumentami. Dla 1209/2 wykorzystano NMT z 08.09.2024, a konkretna data zdjęcia w mozaice ortofotomapy pozostaje niepotwierdzona. Granica dwóch MPZP jest orientacyjna; test obrysów domu nie jest projektem ani potwierdzeniem dopuszczalności zabudowy.

Brak analityki, backendu, kluczy API i formularza wysyłającego wiadomości. Lista pytań zapisuje tylko identyfikatory zaznaczeń w `localStorage` użytkownika. Czcionki są pobierane z Google Fonts, a podkład mapy z OpenStreetMap. Leaflet 1.9.4 (licencja BSD-2-Clause w `vendor/leaflet/LICENSE`) oraz pozostałe zasoby strony są lokalne. Repozytorium i wszystkie jego dane są publiczne.

Analiza 775/193 obejmuje MPZP 05029/05029z, dwa obrysy 200 m², teren i media. NMT: 08.09.2024; data zdjęcia ortofotomapy nieustalona. Nie ma kalkulatora: koszt drogi, przyłączy i przygotowania gruntu pozostaje nieustalony.

Pakiet 768/136 + 768/137 jest jedną kartą zakupu pod jeden dom. Cena 700 000 zł i ofertowe 1224 m² dotyczą całości; pole `id` zawiera oba pełne identyfikatory, więc wyszukiwanie działa dla każdego. NMT: 08.09.2024; data zdjęcia ortofotomapy niepotwierdzona. Warianty domu i ogrodu zależą od zachowania zadrzewienia; koszt przygotowania pozostaje nieustalony, bez kalkulatora.

Analiza **226101_1.0003.260/3**, Gdańsk Klukowo, ul. Telewizyjna: stan 25.10.2026, publikacja i rozwinięcie wniosku o podziale 26.10.2026. MPZP 2706/011-21 wymaga minimum 2000 m² działki; standardowy podział na dwie budowlane po około 1000 m² nie spełnia planu. Dom dwumieszkaniowy to osobny wariant na jednej parceli. Siedem map, NMT 23.09.2024; dokładna data mozaiki ortofoto niepotwierdzona. Cena z kopii oferty, dojazd, ścieki i grunt wymagają weryfikacji. Bez kalkulatora kosztów.

Analiza **220508_5.0004.771/134**, Chwaszczyno, Cicha: stan i publikacja 26.10.2026. Zakres obejmuje podział na dwie działki w 38.MN, wariant geometryczny i status LsIV. Cztery mapy; data ortofotomapy nieustalona. Wyłączenie leśne, dostęp drogowy i odległości od lasu pozostają warunkami. Bez NMT, pełnej oceny zakupu i kalkulatora kosztów.

Analiza **220508_5.0002.319/49**, Nowy Świat, ul. Witrażowa (obręb Barniewice), stan 26.10.2026. Dom 200 m² testowany w MN; ZK z zakazem niwelacji, dodatkowy pas WP, nierozstrzygnięta sprawa Strugi Wysockiej. Cztery mapy publiczne; wnioski prywatnej opinii geotechnicznej bez skanów i lokalizacji otworów. Brak kalkulatora: dawne koszty nasypów są warunkowe. Źródła bez `url` są prezentowane tekstowo i muszą wskazywać niepubliczny charakter dokumentu.

## Mapa całego atlasu

Strona główna zaczyna się od mapy wszystkich rekordów `plots`, bez bloku powitalnego.
Ceny pojawiają się po najechaniu na punkt lub ustawieniu fokusu klawiaturą,
a po kliknięciu lub dotknięciu dostępne jest okno z ceną i linkiem do analizy.
Filtry katalogu nie ograniczają mapy. Punkty wskazują orientacyjne środki geometrii
ULDK. Pakiet działek ma jeden znacznik i cenę całości. Pod mapą pozostaje lista dostępna także
bez podkładu lub biblioteki mapowej.

Nowa analiza wymaga `mapLocation`: `lat`, `lng` (WGS84), `sourceUrl`, `checkedAt`
i `method`. Punkt wyznacz z geometrii pełnego EGiB; dla pakietu zachowaj źródła
każdej geometrii (`additionalSourceUrl` dla drugiej działki). Nie zgaduj lokalizacji.
Nieustalony punkt lub cena powinny być jawnie opisane. Ceny mapy pochodzą z `pricePln`.

Treść etykiet i okien Leaflet jest tworzona przez DOM `textContent`, a nie przez
przekazanie danych jako HTML; chroni to przed wstrzyknięciem kodu do popupów.
Podkład korzysta z HTTPS i standardowego cache przeglądarki, z widoczną atrybucją
OpenStreetMap; bez pobierania offline i prefetch.

Analizy **220508_5.0004.750/70**, **750/71** i **750/74** (ten sam obręb), stan 26.10.2026: trzy osobne karty, skupione na usytuowaniu domu. Każda pokazuje dwa rzuty 200 m² oraz mniejszy wariant 140/115/120 m², wjazd, garaż, taras i południową część ogrodu. Korekta użytkownika z 26.10.2026 zastępuje błędne 14,5% z oferty wskaźnikiem WZ 20%. Limity dla 70/71/73/74 to 205,2/163,4/188,8/174,8 m²: rzut 200 m² mieści się w limicie tylko na 750/70. Pełnych decyzji nie otrzymano. Wspólne mapy planów, Ls, NMT 30.04.2022 i przekrojów z przebiegiem tras. Brak osobnego kosztorysu i pełnej oceny zakupu.

Aktualizacja planowania/lasu 750/73 z 26.10.2026: poglądowa georeferencja załącznika XXXVI/393/2017 umieszcza wszystkie cztery działki oraz sąsiedni las w obszarze przystąpienia. Nie ustalono projektu przeznaczeń ani harmonogramu cięć. To nie uchwalony MPZP ani zgoda na odlesienie. Pozostałe ustalenia i kosztorys 750/73 zachowują dotychczasowe daty.
