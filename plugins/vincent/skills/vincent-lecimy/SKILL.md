---
name: vincent-lecimy
description: Odczytaj plan z ~/.claude/plans/, zaprezentuj kroki i od razu wykonaj sekwencyjnie — po każdym kroku weryfikuj zgodność z planem, na końcu zaraportuj odchylenia.
disable-model-invocation: true
allowed-tools: Bash Read Glob Grep Write Edit TodoWrite
argument-hint: [opcjonalna nazwa pliku planu lub ścieżka do niego]
---

# vincent-lecimy

Twoja rola: wykonaj plan krok po kroku — pokaż podsumowanie kroków i od razu wykonaj, bez pytania o zgodę. Pełny raport PO zakończeniu. W trakcie nie przerywasz na mikro-potwierdzenia; anomalie zatrzymują cię natychmiast.

---

## Krok 1 — Zlokalizuj plik planu

**Jeśli argument był podany:**
- Jeśli argument to pełna ścieżka i plik istnieje → użyj jej.
- Jeśli argument to sama nazwa pliku → sprawdź `~/.claude/plans/<argument>` i `~/.claude/plans/<argument>.md`.
- Gdy nadal nie znaleziono → powiedz userowi jakiej ścieżki szukałeś i przerwij.

**Jeśli nie podano argumentu:**
- `Glob` na `~/.claude/plans/*.md` — pokaż listę numerowaną.
- Jeśli lista pusta → poinformuj "Brak planów w ~/.claude/plans/" i przerwij.
- Jeśli jeden plik → użyj go automatycznie (powiedz który).
- Jeśli kilka → pokaż listę i zapytaj który wybrać.

---

## Krok 2 — Wczytaj i sparsuj plan

`Read` na znaleziony plik planu.

Zidentyfikuj kroki planu. Szukaj (w kolejności priorytetu):
1. Numerowanych list (`1.`, `2.`, `3.` lub `1)`, `2)`)
2. Sekcji `## Krok N` / `### Step N`
3. Checkboxów `- [ ] ...`
4. Wypunktowania (`- ` lub `* `) jeśli pozostałe formy nie istnieją

Dla każdego kroku zapamiętaj:
- **ID** (numer lub tytuł)
- **Opis** (treść)
- **Narzędzia/akcje** wymienione w opisie (np. "uruchom testy", "git commit", "edytuj plik X")

---

## Krok 3 — Prezentacja planu

Wypisz userowi:

```
Plan: <nazwa pliku>
Liczba kroków: <N>

Kroki do wykonania:
  1. <opis kroku 1>
  2. <opis kroku 2>
  ...

Narzędzia których użyję: <lista unikalnych akcji/narzędzi z planu>

Wykonuję wszystkie kroki sekwencyjnie. Anomalie zatrzymają mnie natychmiast.
```

Wywołanie skilla jest akceptacją planu — przejdź od razu do kroku 4. Działasz autonomicznie: nie pytasz o zgodę na każde wywołanie narzędzia. Wyjątek: akcja nieobecna w planie = natychmiastowe zatrzymanie (patrz krok 5).

---

## Krok 4 — Wykonanie kroków

Utwórz `TodoWrite` checklist odzwierciedlającą kroki planu — każdy krok jako osobne todo.

Dla każdego kroku w kolejności:

1. Oznacz krok jako `in_progress` w TodoWrite.
2. Wykonaj akcje opisane w tym kroku, używając odpowiednich narzędzi.
3. Zweryfikuj rezultat (patrz krok 5).
4. Oznacz krok jako `completed` lub `failed` w TodoWrite.
5. Zaloguj wewnętrznie: `{ krok: N, status: ok|fail|anomalia, uwagi: "..." }` — potrzebujesz tego do raportu końcowego.

**Zasady wykonania:**
- Wykonujesz kroki w kolejności z planu — nie zmieniasz kolejności bez zaznaczenia w logu.
- Jeśli krok wymaga informacji której nie masz (np. zewnętrzny URL, token) — zatrzymaj się, zapytaj usera, kontynuuj po odpowiedzi.
- Jeśli krok kończy się błędem (niezerowy exit code, test nie przechodzi) — oznacz jako `failed`, zaloguj błąd, zatrzymaj wykonanie, zaraportuj userowi. Nie naprawiaj bez akceptacji.

---

## Krok 5 — Weryfikacja po każdym kroku

Po wykonaniu każdej akcji sprawdź:

**A) Czy akcja była w planie?**
- Porównaj co właśnie zrobiłeś z opisem bieżącego kroku w planie.
- Jeśli wykonałeś coś czego plan nie przewidywał → to **anomalia**.

**Gdy wykryjesz anomalię:**
```
[ANOMALIA] Krok <N>
Wykonałem: <opis tego co zrobiłem>
Plan przewidywał: <opis kroku z planu>
Odchylenie: <co jest poza zakresem>

Zatrzymuję się. Decyzja należy do Ciebie:
  a) Cofnij zmianę i kontynuuj plan bez tej akcji
  b) Zaakceptuj odchylenie i kontynuuj
  c) Przerwij wykonanie
```

Czekaj na odpowiedź usera. Nie kontynuuj bez decyzji.

**B) Czy krok zakończył się sukcesem?**
- Sukces = output zgodny z oczekiwanym wynikiem kroku.
- Porażka = błąd lub nieoczekiwany wynik → zatrzymaj i zaraportuj.

---

## Krok 6 — Raport końcowy

Po wykonaniu wszystkich kroków (lub po zatrzymaniu) wypisz:

```
## Raport wykonania: <nazwa pliku planu>

### Podsumowanie
- Wykonano kroków: <X> / <N>
- Pominięto: <Y>
- Anomalie: <Z>
- Status: SUKCES | CZĘŚCIOWY | PRZERWANY

### Szczegóły
| Krok | Opis | Status | Uwagi |
|------|------|--------|-------|
| 1    | ...  | OK     |       |
| 2    | ...  | FAIL   | <błąd> |

### Odchylenia od planu
<lista anomalii lub "Brak">

### Co dalej
<opcjonalna sugestia: czy warto ponowić nieudane kroki, czy plan wymaga aktualizacji>
```

---

## Zasady

- **Zero checkpointów w trakcie (poza anomaliami).** Wywołanie skilla = zgoda na wykonanie. Nie pytaj "czy zaczynamy?".
- **Anomalia = stop natychmiastowy.** Nie wykonujesz akcji poza planem po cichu.
- **Błąd = stop, nie naprawa po cichu.** Gdy krok padnie, czekasz na decyzję usera.
- **TodoWrite jako live-widok.** User widzi postęp bez konieczności pytania.
- **Raport jest zawsze.** Nawet przy przerwaniu w połowie.
