# vincent

Osobisty plugin Claude Code: automatyzuje rutynę „zrób brancha, zacommituj zmiany, otwórz PR” zgodnie z Conventional Commits.

## Skille

| Skill | Co robi |
| --- | --- |
| `/vincent:vincent-pr` | End-to-end: wykrywa zmiany → branch → commit → push → PR (wypełnia template repo lub fallback z pluginu). |
| `/vincent:vincent-commit` | Sam commit w stylu Conventional Commits. Bez push, bez PR. |
| `/vincent:vincent-branch` | Sam branch w formacie `<type>/<slug>`. |
| `/vincent:vincent-task` | Tworzy ticket na Jirze wedle `.vincent.json` z roota projektu (kreator przy pierwszym użyciu). Używa MCP Atlassian. |
| `/vincent:vincent-bumpversion` | Podbija semver w `plugin.json` (patch/minor/major) — używaj zanim zacommitujesz zmiany w pluginie. |

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
│   ├── plugin.json          # manifest pluginu (deklaruje też MCP atlassian)
│   └── marketplace.json     # single-plugin marketplace (self)
├── skills/
│   ├── vincent-pr/SKILL.md
│   ├── vincent-commit/SKILL.md
│   ├── vincent-branch/SKILL.md
│   ├── vincent-task/SKILL.md
│   └── vincent-bumpversion/SKILL.md
├── templates/
│   ├── pull_request_template.md   # fallback dla vincent-pr
│   └── jira_task_template.md      # fallback dla vincent-task
└── README.md
```

## Konwencje

- **Branch**: `<type>/<kebab-slug>`, np. `feat/login-rate-limit`.
- **Commit**: Conventional Commits — `type(scope): summary` (≤72 zn.), opcjonalny body, opcjonalny `BREAKING CHANGE:` footer.
- **PR body**: wypełnia `.github/pull_request_template.md` z repo, a gdy go nie ma — używa `templates/pull_request_template.md` z pluginu.
- **Ticket Jira**: wypełnia `.vincent/jira_task_template.md` z repo, a gdy go nie ma — `templates/jira_task_template.md` z pluginu.

## Konfiguracja per-project: `.vincent.json`

Skille, które potrzebują znać kontekst projektu (np. `vincent-task` — który board Jira), czytają plik `.vincent.json` z **korzenia repo użytkownika** (nie pluginu). Schemat:

```json
{
  "jira": {
    "cloudId": "...",
    "projectKey": "ABC",
    "boardId": 1,
    "defaultIssueType": "Task",
    "templatePath": ".vincent/jira_task_template.md"
  }
}
```

`templatePath` jest opcjonalny. Przy pierwszym `/vincent:vincent-task` w projekcie bez `.vincent.json` skill odpala kreator (pyta o cloud / projekt / typ / board, wykrywa przez MCP Atlassian) i proponuje zapis pliku — wszystko za zgodą użytkownika.

Plik `.vincent.json` należy do **konkretnego projektu**, nie do pluginu — commituj go do repo projektu, a nie do pluginu Vincenta.

## MCP: Atlassian

Plugin deklaruje serwer `atlassian` (oficjalny Remote MCP `https://mcp.atlassian.com/v1/sse`) w `plugin.json` — instaluje się razem z pluginem. Przy pierwszym wywołaniu `/vincent:vincent-task` (albo dowolnego narzędzia `mcp__atlassian__*`) Claude poprosi o autoryzację OAuth: uruchom `/mcp`, wybierz `atlassian`, przeglądarka otworzy się sama. Token jest cachowany i odświeżany automatycznie.

## Rozwój

1. Edytuj `SKILL.md` lub dodaj nowy skill w `skills/<nazwa>/SKILL.md`.
2. `/reload-plugins` w sesji Claude Code, gdzie plugin jest zainstalowany lokalnie.
3. Bump `version` w `.claude-plugin/plugin.json` przed pushem na GitHub.
