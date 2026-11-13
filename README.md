# vincent

Centrum dowodzenia do kodowania. Odpalasz Claude Code w tym repo, mówisz „w `<projekt>` zrób X” — orkiestrator planuje, `implementer` koduje w worktree, `reviewer` sprawdza, na końcu dostajesz link do PR.

## Struktura

```
CLAUDE.md            # R1 (zwięzłość) + pipeline orkiestratora
rules/               # git, code, safety
projects/            # <projekt>.md — ścieżka, stack, komendy; _template.md
.claude/agents/      # implementer, reviewer
.claude/hooks/       # guard.js — egzekwuje rules/safety.md
worktrees/           # robocze worktree (gitignored)
```

## Start

```
cd vincent && claude
> w <projekt> zrób X
```

Nowy projekt: przy pierwszym zadaniu orkiestrator zapyta o ścieżkę i stworzy `projects/<projekt>.md`.
