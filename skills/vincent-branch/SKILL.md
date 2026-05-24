---
name: vincent-branch
description: Utwórz nowego brancha w formacie <type>/<slug> wg Conventional Commits. Bez commita, bez push. Użyj tylko gdy użytkownik wprost zawoła /vincent:vincent-branch.
disable-model-invocation: true
allowed-tools: Bash, AskUserQuestion
argument-hint: [opcjonalny opis o czym branch]
---

# vincent-branch

Twoja rola: utworzyć feature-brancha w konwencji `<type>/<kebab-slug>`.

## Kroki

### 1. Sprawdź obecny branch
- `git status -sb` i `git rev-parse --abbrev-ref HEAD`.
- Jeśli już na feature-branchu (czyli nie `main`/`master`/`develop`) — zapytaj użytkownika czy na pewno tworzyć kolejny.

### 2. Ustal `type`
`feat | fix | chore | refactor | docs | test | perf | build | ci | style`. Niejasne → `AskUserQuestion`.

### 3. Zaproponuj slug
- Kebab-case, ≤40 znaków, wyciągnięty z argumentu/opisu od użytkownika lub z bieżącego diffu (`git diff` jeśli są zmiany lokalne).
- Pokaż propozycję `<type>/<slug>`. Pozwól edytować przed utworzeniem.

### 4. Utwórz brancha
- `git checkout -b <type>/<slug>`.
- Potwierdź outputem `git status -sb`.
- Nie pushuj.
