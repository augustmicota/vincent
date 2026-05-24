---
name: vincent-commit
description: Utwórz commit w stylu Conventional Commits z bieżących zmian (bez push, bez PR). Użyj tylko gdy użytkownik wprost zawoła /vincent:vincent-commit.
disable-model-invocation: true
allowed-tools: Bash Read Grep
argument-hint: [opcjonalny opis commita]
---

# vincent-commit

Twoja rola: zrób jeden czysty commit w Conventional Commits z bieżących zmian. Bez pusha, bez PR-a.

## Kroki

### 1. Sprawdź stan repo
- `git status` + `git diff` + `git diff --cached`.
- Brak zmian → przerwij.

### 2. Wywnioskuj `type`
`feat | fix | chore | refactor | docs | test | perf | build | ci | style`. Niejednoznaczne → zapytaj przez `AskUserQuestion`.

### 3. Zaproponuj commit message
- Format: `type(scope): summary` (≤72 znaków subject).
- Opcjonalny body po pustej linii.
- Opcjonalny `BREAKING CHANGE:` footer.
- Pokaż użytkownikowi do akceptacji.

### 4. Commit
- **Nigdy** `git add -A` / `git add .`. Dodawaj konkretne pliki.
- Pomiń pliki wyglądające na sekrety (`.env*`, `*.pem`, `credentials*`) — ostrzeż.
- HEREDOC:
  ```bash
  git commit -m "$(cat <<'EOF'
  type(scope): summary

  optional body
  EOF
  )"
  ```
- Bez `--no-verify`. Bez stopki `Co-Authored-By`.
- Pre-commit padł → napraw i zrób NOWY commit (nie `--amend`).

### 5. Potwierdź
Pokaż `git log -1 --stat` po commicie i zwróć użytkownikowi kontrolę. Nie pushuj.
