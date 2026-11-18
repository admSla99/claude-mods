# claude-mods

Mods for Claude Code (terminal, desktop app and claude.ai/code).

## usage-band

One row above the prompt, in Anthropic's colors, showing how much of your
5-hour and weekly usage limits you have used (with time to reset) and how full
the current context window is:

```
5h ━━━━━━━━ 23% ↻2h14m  ·  Week ━━━━━━━━ 41% ↻3d5h  ·  Ctx ━━━━━━━━ 34% 68k/200k
```

The bar deepens from clay to rust as a window passes 70 % and 90 %. Limits
appear on a Claude subscription (Pro/Max) after the first reply of a session.

## Install

At the prompt of a Claude Code session:

```
/plugin install usage-band --marketplace admSla99/claude-mods
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```bash
claude plugin install usage-band --marketplace admSla99/claude-mods
```

In the desktop app, where `/plugin` does not run: click + next to the prompt
box, then Plugins, Add marketplace with `admSla99/claude-mods`, then Add plugin.

## License

MIT
