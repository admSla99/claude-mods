import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limit, Snapshot } from '../types'

const snap = atom({ plugin: 'usage-band', key: 'snap' } as const, null)

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: 'Week' }

// Anthropic brand palette
const CLAY = '#D97757' // primary orange
const CRAIL = '#C15F3C' // deeper clay, 70 %+
const RUST = '#BF4D43' // 90 %+
const CLOUD = '#B0AEA5' // mid gray, labels and empty track

const filledOf = (pct: number, width: number) =>
  Math.max(0, Math.min(width, Math.round((pct / 100) * width)))

const k = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`)

const until = (iso: string | undefined, now: number) => {
  if (!iso) return ''
  const ms = Date.parse(iso) - now
  if (!Number.isFinite(ms) || ms <= 0) return ''
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (h >= 24) return ` ↻${Math.floor(h / 24)}d${h % 24}h`
  return h > 0 ? ` ↻${h}h${m}m` : ` ↻${m}m`
}

const color = (pct: number) => (pct >= 90 ? RUST : pct >= 70 ? CRAIL : CLAY)

export const register: Register = on => {
  const toSnap = (u: {
    rateLimits: Limit[]
    context: { tokens?: number; window: number; percent?: number }
  }): Snapshot => ({
    limits: u.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })),
    ctxTokens: u.context.tokens,
    ctxWindow: u.context.window,
    ctxPercent: u.context.percent,
  })

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await update($, snap, () => null)
    try {
      const u = await $.session.usage()
      await update($, snap, () => toSnap(u))
    } catch {}
    return r
  })

  on('session.measure', async ($, e, next) => {
    await update($, snap, () => toSnap(e))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, snap)
    if (!s || e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const now = await $.clock.now()
    const W = 8

    type Item = { key: string; label: string; pct?: number; tail: string }
    const items: Item[] = s.limits
      .filter(l => l.kind in LABELS)
      .map(l => ({
        key: l.kind,
        label: LABELS[l.kind] ?? l.kind,
        pct: l.percentUsed,
        tail: until(l.resetsAt, now),
      }))
    if (items.length === 0) items.push({ key: 'none', label: 'Limits', tail: ' –' })
    items.push({
      key: 'ctx',
      label: 'Ctx',
      pct: s.ctxPercent,
      tail: ` ${s.ctxTokens === undefined ? '' : `${k(s.ctxTokens)}/`}${k(s.ctxWindow)}`,
    })

    return (
      <Box flexDirection="row">
        {items.map((it, i) => {
          const pct = it.pct ?? 0
          const f = filledOf(pct, W)
          return (
            <Text key={it.key}>
              {i > 0 ? <Text color={CLOUD}>{'  ·  '}</Text> : null}
              <Text color={CLOUD}>{it.label} </Text>
              {it.pct === undefined ? null : (
                <Text>
                  <Text color={color(pct)}>{'━'.repeat(f)}</Text>
                  <Text color={CLOUD} dimColor>{'━'.repeat(W - f)}</Text>
                  <Text color={color(pct)} bold>{` ${Math.round(pct)}%`}</Text>
                </Text>
              )}
              <Text color={CLOUD}>{it.tail}</Text>
            </Text>
          )
        })}
      </Box>
    )
  })
}
