# Vincent — instrukcje dla Claude'a pracującego nad tym repo

To repo jest **pluginem Claude Code**. Plik `plugins/vincent/.claude-plugin/plugin.json` jest manifestem dystrybuowanym do innych projektów przez GitHub marketplace.

## Reguła: zawsze bumpuj wersję przed commitem

**Każda zmiana w `plugins/vincent/` MUSI być commitowana razem z bumpem patch wersji** w `plugins/vincent/.claude-plugin/plugin.json`.

Przykład: `0.1.5` → `0.1.6`.

### Dlaczego

Auto-update u użytkowników Vincenta odpala się tylko gdy `version` w manifeście się zmieni. Commit bez bumpa = zmiana nigdy nie trafia do drugiego projektu, nawet jeśli pushniesz na GitHub.

### Kiedy bumpować

- **Patch** (`0.1.X` → `0.1.X+1`) — domyślnie. Każda zmiana w skillach, templatkach, fixach.
- **Minor** (`0.X.0` → `0.X+1.0`) — gdy dodajesz nowy skill albo nowy widoczny feature.
- **Major** (`X.0.0` → `X+1.0.0`) — gdy łamiesz wsteczną kompatybilność (np. usuwasz/przemianowujesz skill).

### Jak to zrobić w praktyce

Dogfood: użyj skilla Vincenta do bumpowania samego Vincenta.

1. Na początku pracy nad zmianą: `/vincent:vincent-bumpversion` (domyślnie patch, można `/vincent:vincent-bumpversion minor` albo `major`).
2. Skill znajdzie `plugins/vincent/.claude-plugin/plugin.json`, podbije wersję i pokaże diff.
3. Dalej commitujesz normalnie — `/vincent:vincent-commit` lub `/vincent:vincent-pr`.

Jeśli zapomnisz odpalić `vincent-bumpversion` i przejdziesz prosto do commita — **przerwij**, odpal bumpversion, dopiero potem commit.

### Wyjątek

Zmiany **poza** `plugins/vincent/` (np. README, CLAUDE.md, `.claude/`, dokumentacja w roocie) nie wymagają bumpa — nie są dystrybuowane jako część pluginu.

## Struktura repo (skrót)

```
vincent/
├── .claude-plugin/marketplace.json     # marketplace listing — NIE jest dystrybuowany
├── plugins/vincent/                    # PLUGIN — to leci do użytkowników
│   ├── .claude-plugin/plugin.json      # bumpuj tutaj
│   ├── skills/
│   └── templates/
├── CLAUDE.md                           # ten plik
└── README.md
```
