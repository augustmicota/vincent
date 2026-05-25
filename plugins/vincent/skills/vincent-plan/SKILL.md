---
name: vincent-plan
description: Auto-fire przy wchodzeniu w plan mode lub gdy projektujesz implementację nowej zmiany w repo, w którym jesteś. Czyta CLAUDE.md (preferowane sekcje GUARDRAILS i Praktyka, fallback — cały plik) oraz .vincent.json bieżącego projektu, dokleja do planu sekcję "Guardrails check" z PASS/N/A/VIOLATION per reguła — gate przed ExitPlanMode. Read-only, nie edytuje nic poza plikiem planu. Można też wywołać jawnie /vincent:vincent-plan.
allowed-tools: Bash Read Glob Grep
argument-hint: [opcjonalny opis planowanej zmiany]
---

# vincent-plan

Twoja rola: zanim plan wyjdzie z plan mode, sprawdź że respektuje guardraile i konwencje projektu, w którym Claude Code akurat działa. Nie piszesz planu od zera — uzupełniasz go o ocenę regułową. Skill jest read-only; jedyny plik, który Claude może edytować w plan mode (plan file) i tak nie należy do skilla, tylko do orkiestratora.

## Kroki

### 1. Ustal korzeń projektu
- `git rev-parse --show-toplevel` → ścieżka korzenia.
- Jeśli polecenie nie działa (nie jesteśmy w repo) → użyj `cwd` z ostrzeżeniem dla usera.

### 2. Wczytaj `CLAUDE.md` projektu
- `Read` na `<root>/CLAUDE.md`.
- Brak pliku → **cicho passuj**: wypisz jednolinijkowo "vincent-plan: brak CLAUDE.md w projekcie, pomijam guardrails check (rozważ utworzenie przez `/init`)" i oddaj kontrolę. Nie modyfikuj planu.
- Plik jest → wyciągnij regułki:
  - **Preferowane**: szukaj sekcji nagłówkowych zawierających "GUARDRAILS" lub "Praktyka" (case-insensitive). W ich obrębie każdy `## G<N>` lub każda numerowana/wypunktowana reguła to osobny rule.
  - **Fallback** (brak takich sekcji): potraktuj cały plik jako pulę reguł. Ekstraktuj zdania zawierające: "MUSI", "NIE WOLNO", "ZAWSZE", "NIGDY", "MUST", "NEVER", "ALWAYS", oraz wszystkie listy z imperatywami.
  - Z każdej reguły zapamiętaj: ID (np. `G1` lub krótki slug), 1-zdaniową esencję, oraz źródłową linię (do cytatu).

### 3. Wczytaj `.vincent.json` (jeśli jest)
- `Read` na `<root>/.vincent.json`. Brak → kontynuuj bez błędu.
- Jest → wciągnij sekcje `jira`, `conventions`, `plan` (jeśli istnieją). W v1 nie definiujemy nowych pól — tylko czytamy, co już jest, i odnotowujemy w kontekście (np. obecny `jira.projectKey` = wskazówka stylu identyfikatorów).

### 4. Zmapuj reguły do bieżącej zmiany
Dla każdej reguły z kroku 2 zdecyduj na podstawie:
- argumentu skilla (jeśli był),
- aktywnego planu w plan file (jeśli istnieje, `Read` go),
- kontekstu rozmowy.

Każdej regule przypisz jeden z werdyktów:
- `PASS` — reguła applikuje się i plan ją respektuje.
- `N/A` — reguła nie dotyczy tej zmiany (uzasadnij krótko: "zmiana poza zakresem `plugins/vincent/`" itp.).
- `VIOLATION` — reguła applikuje się i plan ją łamie (lub byłby naruszony przy implementacji). Wskaż konkretnie którą linijkę planu, i jak naprawić.

### 5. Wypisz sekcję "Guardrails check"
W finalnej odpowiedzi userowi (i jeśli to ma sens — proponuj dopisanie na końcu plan file'a) dolicz blok w formacie:

```
## Guardrails check

- [PASS] G1 — bump wersji w plugin.json zawarty w planie (krok 2)
- [N/A] G2 — zmiana nie tworzy nowego skilla
- [VIOLATION] G3 — plan przewiduje edycję pliku poza `plugins/vincent/` bez zaznaczenia że nie wymaga bumpa
```

Pierwsza linia każdej pozycji: status + ID + krótki werdykt. Bez placeholderów `<...>` — albo realna ocena, albo pomiń regułę.

### 6. Gate przed ExitPlanMode
- Jeśli jest **dowolny `VIOLATION`** → powiedz userowi explicite: "Plan łamie X regułek — popraw zanim wyjdziesz z plan mode" + lista konkretów. **Nie wołaj `ExitPlanMode`**. Czekaj aż user poprawi plan i ponownie odpali skilla (lub samodzielnie zdecyduje przejść dalej).
- Jeśli wszystko `PASS`/`N/A` → powiedz "Plan respektuje guardraile (X PASS, Y N/A). Można `ExitPlanMode`." Decyzję o wyjściu z plan mode pozostawiasz orkiestratorowi/userowi — nie wywołujesz `ExitPlanMode` samodzielnie.

### 7. Zwróć kontrolę
Skill kończy się tutaj. Nie modyfikuje plików (poza ewentualnym dopisaniem sekcji "Guardrails check" do plan file'a, jeśli orkiestrator o to poprosi).

## Zasady

- **Read-only.** Jedyny plik dotykalny to plan file z plan mode (i to tylko w celu doklejenia sekcji "Guardrails check"). Nie modyfikuj `CLAUDE.md`, `.vincent.json` ani żadnego innego pliku projektu.
- **Granica plugin vs projekt.** Czytaj `CLAUDE.md` i `.vincent.json` z **roota bieżącego projektu** (`git rev-parse --show-toplevel`). Nigdy z `${CLAUDE_PLUGIN_ROOT}`.
- **Brak CLAUDE.md = passuj cicho.** Nie crashuj, nie wymuszaj. Zasugeruj `/init` lub ręczne utworzenie i oddaj kontrolę.
- **Nie wołaj `ExitPlanMode` samodzielnie.** Skill jest gatem doradczym; decyzja o wyjściu z plan mode należy do orkiestratora.
- **Bez placeholderów.** Każda pozycja w "Guardrails check" musi być realnie oceniona lub pominięta — nie pisz `<TODO>`, `<uzupełnij>`, itp.
- **Kolizja z innymi vincent-skillami.** W v1 ignorujemy temat. Jeśli vincent-task / vincent-pr już prowadzi flow — vincent-plan i tak nie zaszkodzi (jest read-only).
