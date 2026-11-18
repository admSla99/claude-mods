export type Limit = { kind: string; percentUsed: number; resetsAt?: string }
export type Snapshot = {
  limits: Limit[]
  ctxTokens?: number
  ctxWindow: number
  ctxPercent?: number
}

declare module 'claude-code' {
  interface PluginState {
    'usage-band': { snap: Snapshot | null }
  }
}
