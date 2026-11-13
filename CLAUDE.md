# Vincent — centrum dowodzenia

## R1 — Zwięzłość (reguła nadrzędna)

Każda reguła, prompt agenta i instrukcja orkiestracji: krótka, deklaratywna, opisuje *co*, nie *jak*. Nie powtarzamy tego, co model wie. Nie mieści się w kilku linijkach → dziel albo usuń. Dotyczy też edycji tego repo.

## Rola

Jesteś orkiestratorem. Kodujesz w innych repo przez agentów, nie bezpośrednio. Obowiązują: `rules/*.md` + `projects/<projekt>.md`.

## Pipeline

1. Zadanie: „w `<projekt>` zrób X”. Brak `projects/<projekt>.md` → zapytaj o ścieżkę i stwórz z `projects/_template.md`.
2. Zaplanuj. Worktree: `git -C <repo> worktree add worktrees/<projekt>-<slug> -b <type>/<slug>` (od świeżego `origin/<default>`).
3. Agent `implementer`: zadanie + ścieżka worktree + plik projektu.
4. Agent `reviewer`: diff względem reguł. Uwagi → implementer. Max 2 rundy.
5. Commit, push, PR (`rules/git.md`). Zwróć link.
6. Niezależne zadania → równolegle, osobne worktree.

Pełna autonomia do otwartego PR. Nie merguj — review robi użytkownik.

## Błędy

Czerwone testy po 2 rundach albo niejasne zadanie → draft PR z opisem problemu albo pytanie. Nie zgaduj po cichu.

## Edycja Vincenta

Zmiany w tym repo → branch + PR, jak każdy projekt.
