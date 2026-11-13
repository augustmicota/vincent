// PreToolUse guard — egzekwuje rules/safety.md. Exit 2 = blokada.
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  const { tool_name, tool_input = {} } = JSON.parse(raw || '{}');
  const block = (msg) => {
    process.stderr.write(`guard: ${msg} (rules/safety.md)\n`);
    process.exit(2);
  };

  const path = tool_input.file_path || tool_input.path || '';
  if (/(^|[\\/])\.env(\.|$)/.test(path)) block('dostęp do .env zabroniony');

  if (tool_name !== 'Bash') return;
  const cmd = tool_input.command || '';
  if (/(^|[\s\/\\'"=<>])\.env(?!\.example)(\.\w+)?\b/.test(cmd)) block('dostęp do .env zabroniony');
  if (/\bgh\s+pr\s+merge\b/.test(cmd)) block('merge PR zabroniony');

  for (const seg of cmd.split(/&&|\|\||;|\||\n/)) {
    const m = seg.match(/\bgit\b.*?\bpush\b(.*)/);
    if (!m) continue;
    const args = m[1].trim().split(/\s+/).filter(Boolean);
    if (args.some((a) => /^(--force|--force-with-lease|-f|--mirror|--delete|-d)$|^\+/.test(a) || /^--force/.test(a)))
      block('force/delete push zabroniony');
    const pos = args.filter((a) => !a.startsWith('-'));
    if (pos.length < 2) block('push wymaga jawnego `origin <branch>`');
    if (pos.slice(1).some((r) => /(^|:)(refs\/heads\/)?(main|master)$/.test(r))) block('push na main/master zabroniony');
  }
});
