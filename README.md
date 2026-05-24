# vincent

Osobisty plugin Claude Code: automatyzuje rutynę „zrób brancha, zacommituj zmiany, otwórz PR” zgodnie z Conventional Commits.

## Skille

| Skill | Co robi |
| --- | --- |
| `/vincent:vincent-pr` | End-to-end: wykrywa zmiany → branch → commit → push → PR (wypełnia template repo lub fallback z pluginu). |
| `/vincent:vincent-commit` | Sam commit w stylu Conventional Commits. Bez push, bez PR. |
| `/vincent:vincent-branch` | Sam branch w formacie `<type>/<slug>`. |

Każdy skill jest `disable-model-invocation: true` — Claude nie odpali ich sam, tylko gdy wprost zawołasz slasha.

## Instalacja

### Dev lokalny (iteracja w tym repo)

```text
/plugin marketplace add c:/Users/august/Desktop/workspace/vincent
/plugin install vincent@vincent
```

Po edycjach plików w pluginie: `/reload-plugins`.

### W innym projekcie (po release na GitHub)

```text
/plugin marketplace add <github-user>/vincent
/plugin install vincent@vincent
```

Aktualizacja: `/plugin update vincent`.

## Struktura

```
vincent/
├── .claude-plugin/
│   ├── plugin.json          # manifest pluginu
│   └── marketplace.json     # single-plugin marketplace (self)
├── skills/
│   ├── vincent-pr/SKILL.md
│   ├── vincent-commit/SKILL.md
│   └── vincent-branch/SKILL.md
├── templates/
│   └── pull_request_template.md   # fallback gdy repo nie ma swojego
└── README.md
```

## Konwencje

- **Branch**: `<type>/<kebab-slug>`, np. `feat/login-rate-limit`.
- **Commit**: Conventional Commits — `type(scope): summary` (≤72 zn.), opcjonalny body, opcjonalny `BREAKING CHANGE:` footer.
- **PR body**: wypełnia `.github/pull_request_template.md` z repo, a gdy go nie ma — używa `templates/pull_request_template.md` z pluginu.

## Rozwój

1. Edytuj `SKILL.md` lub dodaj nowy skill w `skills/<nazwa>/SKILL.md`.
2. `/reload-plugins` w sesji Claude Code, gdzie plugin jest zainstalowany lokalnie.
3. Bump `version` w `.claude-plugin/plugin.json` przed pushem na GitHub.
