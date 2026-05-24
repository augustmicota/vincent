# Vincent — instrukcje dla Claude'a pracującego nad tym repo

To repo jest **pluginem Claude Code**. Plik `plugins/vincent/.claude-plugin/plugin.json` jest manifestem dystrybuowanym do innych projektów przez GitHub marketplace.

---

# 🛡️ GUARDRAILS

Bezwzględne reguły, których AI **musi** przestrzegać pracując nad tym repo. **Brak wyjątków. Brak negocjacji.** Jeśli widzisz że za chwilę je złamiesz — zatrzymaj się i powiedz użytkownikowi, nie kontynuuj.

Każdy guardrail ma format:

- **Reguła** — co konkretnie ma się stać / nie stać.
- **Zakres** — gdzie reguła obowiązuje (jakie pliki, jakie akcje).
- **Dlaczego** — żeby AI rozumiało intencję i potrafiło ocenić edge case, a nie tylko ślepo dopasowywało literę.
- **Jak weryfikować** — krótki check, czy regułę spełniłeś przed przejściem dalej.

---

## G1 — Bump wersji przed commitem

**Reguła:** Każdy commit, który dotyka czegokolwiek w `plugins/vincent/`, MUSI zawierać też zmianę pola `version` w `plugins/vincent/.claude-plugin/plugin.json`.

**Zakres:** dowolny plik pod `plugins/vincent/` (skille, templatki, plugin.json, agents/, hooks/ itd.). Zmiany **poza** `plugins/vincent/` (README, CLAUDE.md, `.claude/`, .gitignore) są zwolnione — nie są dystrybuowane.

**Dlaczego:** auto-update Claude Code u użytkowników odpala się **tylko gdy pole `version` w manifeście się zmieni**. Commit bez bumpa = zmiana wisi na GitHubie, ale nikt jej nigdy nie dostanie.

**Jak weryfikować:** przed `git commit` uruchom mentalnie:

```
git diff --cached --name-only | grep '^plugins/vincent/' && \
git diff --cached plugins/vincent/.claude-plugin/plugin.json | grep '"version"'
```

Pierwszy filtr łapie zmiany w pluginie, drugi sprawdza że plugin.json:version też jest w stage. Oba muszą dać match albo żaden.

**Jak bumpować:** `/vincent:vincent-bumpversion` (patch domyślnie; `minor` przy nowym skillu/featurze; `major` przy breaking change).

---

## G2 — Każdy skill ma prefix `vincent-`

**Reguła:** Każdy skill w `plugins/vincent/skills/` ma nazwę zaczynającą się od `vincent-`. Dotyczy to **i** nazwy katalogu, **i** pola `name:` w frontmatterze.

**Zakres:** każdy `plugins/vincent/skills/<dir>/SKILL.md`. Lokalne skille (`.claude/skills/` poza pluginem) są zwolnione — to nie są skille Vincenta.

**Dlaczego:** chcemy `/vincent:vincent-commit`, nie `/vincent:commit`. Dłuższy zapis daje jednoznaczność w logach, autouzupełnianiu i dokumentacji — czytelne "to skill Vincenta" bez kontekstu.

**Jak weryfikować:** po dodaniu skilla — nazwa katalogu zaczyna się od `vincent-`, frontmatter `name:` jest identyczny z nazwą katalogu, oba zaczynają się od `vincent-`.

---

## Jak dodawać nowe guardrails

1. Numeruj sekwencyjnie (`G3`, `G4`, ...). Nie używaj ponownie numerów po usuniętych regułach — to wprowadza zamęt w historii.
2. Stosuj cztery sekcje: **Reguła / Zakres / Dlaczego / Jak weryfikować**. Brak "Dlaczego" = guardrail nie do utrzymania, bo nikt nie wie kiedy odstąpić.
3. Reguły piszesz w trybie rozkazującym ("MUSI", "NIE WOLNO"). Nie "raczej powinno", nie "warto".
4. Jeśli reguła ma legitne wyjątki — to nie guardrail, tylko zwykła wytyczna. Umieść poniżej, pod `## Wytyczne` (osobna sekcja, nie tutaj).

---

# Praktyka

## Workflow pracy nad Vincentem

```
1. Edytujesz coś w plugins/vincent/
2. /vincent:vincent-bumpversion           # spełnia G1
3. /vincent:vincent-commit                # albo vincent-pr
```

Edycje poza `plugins/vincent/` (np. ten plik) — krok 2 pomijasz.

## Struktura repo

```
vincent/
├── .claude-plugin/marketplace.json     # marketplace listing — NIE jest dystrybuowany
├── plugins/vincent/                    # PLUGIN — to leci do użytkowników
│   ├── .claude-plugin/plugin.json      # bumpuj tutaj (G1)
│   ├── skills/                         # wszystkie nazwy z prefiksem vincent- (G2)
│   └── templates/
├── CLAUDE.md                           # ten plik
└── README.md
```
