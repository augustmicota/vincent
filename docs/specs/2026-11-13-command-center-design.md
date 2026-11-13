# Vincent — centrum dowodzenia (design)

## Cel

Vincent przestaje być pluginem. Staje się workspace'em: Claude startuje w `vincent/` i orkiestruje pracę agentów w innych repo. Wszystkie reguły żyją tutaj.

## R1 — Zwięzłość (reguła nadrzędna)

Każda reguła, prompt agenta i instrukcja orkiestracji: krótka, deklaratywna, opisuje *co*, nie *jak*. Nie powtarzamy tego, co model wie. Nie mieści się w kilku linijkach → dziel albo usuń.

## Struktura

```
vincent/
├── CLAUDE.md              # R1 + rola orkiestratora + pipeline
├── rules/
│   ├── git.md             # Conventional Commits, branch <type>/<slug>, opis PR
│   ├── code.md            # ogólne zasady kodowania
│   └── safety.md          # zakazy
├── projects/
│   ├── _template.md
│   └── <nazwa>.md         # ścieżka repo, stack, komendy test/build, lokalne reguły
├── .claude/
│   ├── agents/implementer.md
│   ├── agents/reviewer.md
│   └── settings.json      # hooki + deny egzekwujące safety.md
└── README.md
```

## Usuwane

`plugins/`, `.claude-plugin/marketplace.json`, wszystkie skille, templatki, MCP Atlassian, guardrails G1/G2. Konwencje git ze starych skilli → skrót w `rules/git.md`.

## Pipeline

1. Użytkownik: „w `<projekt>` zrób X” (zwykły tekst, bez Jiry).
2. Orkiestrator czyta `projects/<projekt>.md` + `rules/`, planuje, tworzy worktree w repo docelowym na branchu `<type>/<slug>`.
3. Implementer koduje w worktree, odpala testy z pliku projektu.
4. Reviewer sprawdza diff względem `rules/`; uwagi → implementer, max 2 rundy.
5. Orkiestrator: commit, push, PR przez `gh`; zwraca link.
6. Niezależne zadania równolegle, każde w osobnym worktree.

Autonomia: pełna do otwartego PR. Brak checkpointów — review robi użytkownik na PR.

## Bezpieczeństwo (`safety.md`)

Zakazane: push na `main`/`master`, force-push, odczyt/zapis `.env` i sekretów, zapis poza worktree zadania, merge PR. Co da się wyrazić technicznie → `deny`/hook w `settings.json`.

## Błędy

Testy czerwone po 2 rundach lub niejasne zadanie → PR jako **draft** z opisem problemu albo pytanie do użytkownika. Nie zgadujemy po cichu.

## Poza zakresem (na teraz)

Jira / trackery zadań, dodatkowe role agentów (explorer, tester, architect) — dojdą w miarę pracy.
