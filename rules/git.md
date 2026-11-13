# Git

- Branch: `<type>/<kebab-slug>`, slug ≤40 zn.
- Commit: Conventional Commits `type(scope): summary`, subject ≤72 zn. Typy: feat, fix, chore, refactor, docs, test, perf, build, ci, style.
- Dodawaj pliki po nazwie, nie `git add -A`. Bez `--no-verify`, bez `--amend` po padniętym hooku.
- Bez stopki `Co-Authored-By`.
- Push: `git push -u origin <branch>` — zawsze jawnie nazwany branch.
- PR: template repo (`.github/pull_request_template.md`), a gdy brak — sekcje `## Summary` (1–3 punkty) i `## Why`. Tytuł ≤70 zn.
