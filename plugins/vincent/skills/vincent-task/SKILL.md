---
name: vincent-task
description: Utwórz ticket na Jirze wedle konwencji projektu — czyta .vincent.json z roota repo, używa MCP Atlassian. Jeśli brak configu, odpala kreator. Użyj tylko gdy użytkownik wprost zawoła /vincent:vincent-task.
disable-model-invocation: true
allowed-tools: Bash Read Write AskUserQuestion mcp__atlassian__getAccessibleAtlassianResources mcp__atlassian__getVisibleJiraProjects mcp__atlassian__getJiraProjectIssueTypesMetadata mcp__atlassian__createJiraIssue mcp__atlassian__getJiraIssue
argument-hint: [opcjonalny krótki opis ticketa]
---

# vincent-task

Twoja rola: zamień intencję ("zrób ticket o X") w gotowy ticket na Jirze wedle konwencji projektu, w którym właśnie jesteś. Akcję widoczną na zewnątrz (`createJiraIssue`) potwierdzasz przed wykonaniem.

## Ważne — granica plugin vs projekt

Config (project key, board, cloud ID) zawsze pochodzi z `.vincent.json` w roocie **bieżącego projektu usera**. **Nigdy** nie czytaj `.vincent.json` z `${CLAUDE_PLUGIN_ROOT}` i **nigdy** nie podpowiadaj wartości z innych projektów — każdy projekt ma własną konfigurację Jiry. Jedyne co plugin dostarcza to fallback templatka opisu w `${CLAUDE_PLUGIN_ROOT}/templates/jira_task_template.md`.

## Kroki

### 1. Ustal korzeń projektu
- `git rev-parse --show-toplevel` → ścieżka korzenia.
- Jeśli polecenie nie działa (nie jesteśmy w repo git) — użyj `cwd`, ale ostrzeż usera.

### 2. Wczytaj `.vincent.json`
- `Read` na `<root>/.vincent.json`.
- Wymagane pola w sekcji `jira`: `cloudId`, `projectKey`. Opcjonalne: `boardId`, `defaultIssueType` (domyślnie `Task`), `templatePath`.
- Jeśli plik nie istnieje **lub** sekcja `jira` jest niekompletna → idź do **kroku 2a (kreator)**.
- Jeśli kompletny → idź do **kroku 3**.

### 2a. Kreator configu (gdy brak `.vincent.json`)

1. `mcp__atlassian__getAccessibleAtlassianResources` — pobierz listę cloudów do których user ma dostęp.
   - Jeśli jeden cloud → użyj go.
   - Jeśli więcej niż jeden → `AskUserQuestion`, niech user wybierze.
2. `mcp__atlassian__getVisibleJiraProjects` (z wybranym `cloudId`) — pobierz listę projektów Jira.
   - Pokaż 5–10 najbardziej prawdopodobnych (po nazwie repo / cwd), niech user wybierze przez `AskUserQuestion`. Jeśli żaden nie pasuje — "inny" pozwala wpisać key ręcznie.
3. Zapytaj o `defaultIssueType` — `AskUserQuestion` z opcjami `Task` / `Story` / `Bug` (default: `Task`).
4. Opcjonalnie spytaj o `boardId` (do linku na boardzie po stworzeniu ticketa); user może odpowiedzieć "pomiń".
5. Pokaż user-owi proponowaną zawartość `.vincent.json` i poproś o akceptację **zanim** zapiszesz:
   ```json
   {
     "jira": {
       "cloudId": "...",
       "projectKey": "...",
       "boardId": ...,
       "defaultIssueType": "Task"
     }
   }
   ```
6. `Write` do `<root>/.vincent.json`.
7. Sprawdź `.gitignore` — jeśli `.vincent.json` jest tam wymieniony, powiadom usera (może być świadoma decyzja, ale zwykle config chcemy commitować).

### 3. Wczytaj templatkę opisu
Kaskada (pierwszy znaleziony wygrywa):
1. `<root>/<jira.templatePath>` — jeśli pole istnieje w configu.
2. `<root>/.vincent/jira_task_template.md` — konwencja per-project override.
3. Fallback: `${CLAUDE_PLUGIN_ROOT}/templates/jira_task_template.md`.

### 4. Ustal `issueType`
- Jeśli był argument do skilla i wskazuje typ (np. "bug w loggerze") — zaproponuj `Bug`.
- W razie wątpliwości użyj `defaultIssueType` z configu.
- Pozwól userowi zmienić przez `AskUserQuestion`, jeśli wybór nie jest oczywisty.
- Walidacja: `mcp__atlassian__getJiraProjectIssueTypesMetadata` — sprawdź że wybrany typ istnieje w projekcie. Jeśli nie — pokaż dostępne i niech user wybierze.

### 5. Ustal `summary` (title)
- Krótki, imperatywny, ≤80 znaków. Bez kropki na końcu.
- Jeśli był argument do skilla → użyj go jako punkt wyjścia, ewentualnie skróć/popraw stylistycznie.
- Brak argumentu → zapytaj usera (`AskUserQuestion` albo otwarte pytanie).

### 6. Wypełnij `description` z templatki
- Wczytaj sekcje templatki (np. `## Context`, `## Acceptance criteria`, `## Notes`).
- Wypełnij na podstawie kontekstu rozmowy / argumentu. **Nie zostawiaj placeholderów `<...>`** — albo wypełnij realną treścią, albo usuń sekcję (templatka mówi "usuń sekcję jeśli brak").
- Jeśli brakuje informacji do wypełnienia AC — dopytaj usera punktowo.

### 7. Preview + akceptacja
Pokaż userowi blok:
```
Project: <projectKey> (cloud: <cloudId fragment>)
Type:    <issueType>
Title:   <summary>

Description:
<description markdown>
```
Pozwól edytować (title, type, description). Pytaj "tworzę ticket?" — czekaj na "tak".

### 8. Utwórz ticket
- `mcp__atlassian__createJiraIssue` z polami: `cloudId`, `projectKey`, `issueTypeName`, `summary`, `description`.
- **Format `description`**: Jira REST API v3 oczekuje ADF (Atlassian Document Format). Przy pierwszym uruchomieniu sprawdź czy MCP akceptuje markdown jako string — jeśli odpowiedź to błąd typu "expected ADF", skonwertuj ręcznie:
  - `## Header` → `{ "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "..." }] }`
  - akapit → `{ "type": "paragraph", "content": [{ "type": "text", "text": "..." }] }`
  - lista punktowana z `- [ ] X` → `bulletList` z `listItem` zawierającym `paragraph`
  - Cały dokument: `{ "type": "doc", "version": 1, "content": [...] }`
- Jeśli `createJiraIssue` wymaga dodatkowych pól wymaganych przez projekt (np. priority, components) — odczytaj z `getJiraProjectIssueTypesMetadata` i dopytaj usera.

### 9. Zwróć linki
- URL ticketa: `https://<cloud-site>.atlassian.net/browse/<key>` — `<key>` z odpowiedzi MCP.
- Jeśli `boardId` jest w configu → dodaj URL boardu: `https://<cloud-site>.atlassian.net/jira/software/projects/<projectKey>/boards/<boardId>`.

## Zasady

- Akcja zewnętrzna (`createJiraIssue`) — zawsze za zgodą usera.
- Nigdy nie czytaj configu spoza projektu. Nigdy nie zapisuj `.vincent.json` w `${CLAUDE_PLUGIN_ROOT}`.
- Jeśli MCP atlassian zwróci `401`/`403` — powiedz userowi "uruchom `/mcp` żeby autoryzować server `atlassian`" i przerwij.
- Jeśli user prosi o ticket bez wystarczającego kontekstu (samo "zrób task") — dopytaj o cel/treść zanim utworzysz pusty stub.
- Nie zmieniaj plików projektu poza `.vincent.json` (i to tylko w kreatorze, za zgodą).
