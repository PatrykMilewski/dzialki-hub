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

Brak analityki, backendu, kluczy API i formularza wysyłającego wiadomości. Lista pytań zapisuje tylko identyfikatory zaznaczeń w `localStorage` użytkownika. Czcionki są pobierane z Google Fonts; pozostałe zasoby strony są lokalne. Repozytorium i wszystkie jego dane są publiczne.

Analiza 775/193 obejmuje MPZP 05029/05029z, dwa obrysy 200 m², teren i media. NMT: 08.09.2024; data zdjęcia ortofotomapy nieustalona. Nie ma kalkulatora: koszt drogi, przyłączy i przygotowania gruntu pozostaje nieustalony.

Pakiet 768/136 + 768/137 jest jedną kartą zakupu pod jeden dom. Cena 700 000 zł i ofertowe 1224 m² dotyczą całości; pole `id` zawiera oba pełne identyfikatory, więc wyszukiwanie działa dla każdego. NMT: 08.09.2024; data zdjęcia ortofotomapy niepotwierdzona. Warianty domu i ogrodu zależą od zachowania zadrzewienia; koszt przygotowania pozostaje nieustalony, bez kalkulatora.
