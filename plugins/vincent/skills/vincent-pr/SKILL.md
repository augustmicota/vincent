---
name: vincent-pr
description: End-to-end workflow — wykryj zmiany, utwórz brancha wg konwencji, zacommituj (Conventional Commits), wypchnij i otwórz PR wypełniając template repo. Użyj tylko gdy użytkownik wprost zawoła /vincent:vincent-pr.
disable-model-invocation: true
allowed-tools: Bash Read Write Grep Glob
argument-hint: [opcjonalny opis PR-a]
---

# vincent-pr

Twoja rola: poprowadź użytkownika od stanu "mam lokalne zmiany" do otwartego PR-a, bez niespodzianek. Każdą akcję widoczną na zewnątrz (push, `gh pr create`) potwierdzasz przed wykonaniem.

## Kroki

### 1. Sprawdź stan repo
- `git status` i `git diff` (oraz `git diff --cached`).
- Jeśli brak zmian (staged + unstaged + untracked) — przerwij i powiedz użytkownikowi.
- Jeśli HEAD jest detached — przerwij, poproś użytkownika o ogarnięcie brancha.

### 2. Wywnioskuj `type` (Conventional Commits)
Z natury diffu dobierz jedno z: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `build`, `ci`, `style`. Jeśli niejednoznaczne — zapytaj przez `AskUserQuestion`.

### 3. Zaproponuj brancha
- Format: `<type>/<kebab-slug>` (np. `feat/vincent-pr-skill`).
- Slug krótki (≤40 znaków), wywiedziony z istoty zmian.
- Jeśli aktualny branch to `main`/`master`/`develop` — utwórz nowy: `git checkout -b <type>/<slug>`. Najpierw pokaż propozycję i poczekaj na akceptację/edycję.
- Jeśli już na feature-branchu — użyj istniejącego i pomiń tworzenie.

### 4. Zaproponuj commit message
Format: `type(scope): summary` (≤72 znaków subject), opcjonalny body po pustej linii, opcjonalny `BREAKING CHANGE:` footer. Pokaż użytkownikowi do akceptacji/edycji **zanim** zacommitujesz.

### 5. Commit
- **Nigdy** `git add -A` ani `git add .`. Dodawaj konkretne pliki po nazwie (po `git status` wiesz, które).
- Pomiń pliki wyglądające na sekrety (`.env*`, `*.pem`, `credentials*`, `secrets*`) — ostrzeż użytkownika jeśli takie są w diffie.
- Commit przez HEREDOC:
  ```bash
  git commit -m "$(cat <<'EOF'
  type(scope): summary

  optional body
  EOF
  )"
  ```
- **Nie** używaj `--no-verify`. **Nie** dodawaj stopki `Co-Authored-By` — Vincent jest cichy.
- Jeśli pre-commit hook padnie — napraw przyczynę i zrób NOWY commit (nie `--amend`).

### 6. Push
- Potwierdź z użytkownikiem: "pushuję `<branch>` na origin, ok?"
- `git push -u origin HEAD`.

### 7. Wykryj template PR-a
W kolejności:
1. `Read` na `.github/pull_request_template.md`
2. `Read` na `.github/PULL_REQUEST_TEMPLATE.md`
3. `Read` na `docs/pull_request_template.md`
4. Fallback: `Read` na `${CLAUDE_PLUGIN_ROOT}/templates/pull_request_template.md`

Pierwszy znaleziony wygrywa.

### 8. Wypełnij PR title i body
- **Title**: subject commita (bez prefiksu `type(scope):` jeśli jest długi — wtedy krótkie streszczenie); maks 70 znaków.
- **Body**: wypełnij sekcje template'a opierając się o diff. Nie zostawiaj placeholderów typu `<...>` — albo wypełnij, albo usuń sekcję jeśli nie ma treści.
- Pokaż użytkownikowi pełny title + body do akceptacji. Pozwól edytować.

### 9. Otwórz PR
- Potwierdź jeszcze raz przed `gh pr create`.
- ```bash
  gh pr create --title "..." --body "$(cat <<'EOF'
  ...
  EOF
  )"
  ```
- Zwróć URL z outputu `gh`.

## Zasady

- Każda destruktywna / widoczna na zewnątrz akcja (push, create PR) — wymaga zgody użytkownika.
- Nie modyfikuj kodu pod commit — pracujesz z tym, co użytkownik już zmienił.
- Jeśli `gh` nie jest zainstalowane lub niezalogowane — powiedz to użytkownikowi i przerwij na kroku 9 (commit i push zostają jak są).
- Branch protection: nie pushuj force, nie pushuj bezpośrednio na `main`/`master`.
