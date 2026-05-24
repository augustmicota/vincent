---
name: vincent-bumpversion
description: Podbij wersję pluginu Claude Code w plugin.json zgodnie z semver. Użyj gdy pracujesz nad pluginem i potrzebujesz patch/minor/major bump przed commitem (auto-update Claude Code wymaga zmiany pola version). Tylko gdy użytkownik wprost zawoła /vincent:vincent-bumpversion.
disable-model-invocation: true
allowed-tools: Read Edit Bash Glob
argument-hint: [patch | minor | major]
---

# vincent-bumpversion

Podbij wersję w `plugin.json` pluginu Claude Code zgodnie z semver.

## Krok 1 — znajdź plugin.json

Po kolei:
1. `Glob` na `**/.claude-plugin/plugin.json` w bieżącym katalogu roboczym.
2. Jeśli znajdzie dokładnie jeden — to jest target.
3. Jeśli znajdzie więcej niż jeden — pokaż listę i zapytaj użytkownika który wybrać.
4. Jeśli zero — przerwij i powiedz że to nie wygląda na repo pluginu Claude Code.

## Krok 2 — odczytaj aktualną wersję

`Read` na znalezionym `plugin.json`. Zlokalizuj pole `"version"`.

Jeśli pole nie istnieje — przerwij i powiedz użytkownikowi, że ten plugin nie używa pola `version` (każdy commit liczy się wtedy jako nowa wersja po stronie CLI; bump nie jest potrzebny).

## Krok 3 — wylicz nową wersję

Wartość `$ARGUMENTS` decyduje:

- brak argumentu lub `patch` → bump patch (`0.1.5` → `0.1.6`)
- `minor` → bump minor, reset patch (`0.1.5` → `0.2.0`)
- `major` → bump major, reset minor i patch (`0.1.5` → `1.0.0`)

Walidacja: stara wersja musi być w formacie `X.Y.Z` (trzy liczby oddzielone kropkami). Jeśli nie — przerwij i poproś użytkownika o wyjaśnienie.

## Krok 4 — zapisz

`Edit` na `plugin.json`. Zamień **tylko** pole `version`. Nie modyfikuj nic innego.

## Krok 5 — pokaż diff

```bash
git diff -- <ścieżka-do-plugin.json>
```

Pokaż użytkownikowi co się zmieniło. **Nie commituj** — commit zostawiamy do `/vincent:vincent-commit` lub `/vincent:vincent-pr`.

## Wynik

Zwróć użytkownikowi jednym zdaniem nową wersję, np. `Bumped to 0.1.6 (patch).` Tyle.
