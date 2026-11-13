// PreToolUse guard — egzekwuje rules/safety.md i rules/tools.md. Exit 2 = blokada.
const INTERP = '(?:node|deno|bun|python[0-9.]*|py|perl|ruby|php|powershell|pwsh)(?:\\.exe)?';
const ADHOC = [
  new RegExp(`\\b${INTERP}\\s+(?:-\\S+\\s+)*(?:-e|--eval|-p|--print|-c|-command|-encodedcommand)\\b`, 'i'), // inline kod
  new RegExp(`\\b${INTERP}\\s+(?:-\\S+\\s+)*-?\\s*<<`, 'i'), // heredoc
  new RegExp(`^\\s*${INTERP}\\s*(?:-\\s*)?$`, 'i'), // stdin z pipe
  new RegExp(`\\b${INTERP}\\s+\\S*(?:[\\\\/]tmp[\\\\/]|[\\\\/]temp[\\\\/])`, 'i'), // skrypt z temp
];
const TEMP_SCRIPT = /([\\/]tmp[\\/]|[\\/]temp[\\/]).*\.(m?js|cjs|ts|py|sh|ps1|rb|pl|php|bat|cmd)$/i;
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

  if (TEMP_SCRIPT.test(path)) block('ad-hoc skrypty zabronione — użyj wbudowanych narzędzi (rules/tools.md)');

  if (tool_name !== 'Bash' && tool_name !== 'PowerShell') return;
  const cmd = tool_input.command || '';
  const bare = cmd.replace(/'[^']*'|"(?:\\.|[^"\\])*"/g, "''"); // bez treści w cudzysłowach (opisy, commity)
  for (const seg of bare.split(/&&|\|\||;|\||\n/))
    if (ADHOC.some((re) => re.test(seg))) block('ad-hoc skrypty zabronione — użyj wbudowanych narzędzi (rules/tools.md)');
  if (/(^|[\s\/\\'"=<>])\.env(?!\.example)(\.\w+)?\b/.test(cmd)) block('dostęp do .env zabroniony');
  if (/\bgh\s+pr\s+merge\b/.test(bare)) block('merge PR zabroniony');

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
