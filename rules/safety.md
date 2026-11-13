# Bezpieczeństwo

Zakazane (część egzekwuje `.claude/hooks/guard.js`):

- push na `main`/`master`, force-push,
- merge PR,
- odczyt i zapis `.env*`, kluczy, credentiali,
- zapis poza worktree zadania (wyjątek: edycja Vincenta),
- usuwanie branchy i worktree, których nie stworzyłeś.
