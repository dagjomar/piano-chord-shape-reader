import type { SessionConfig } from '../domain/types'
import { DEFAULT_SESSION_CONFIG } from '../domain/types'

const STORAGE_KEY = 'pcsr-session-config'

export function loadSessionConfig(): SessionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SESSION_CONFIG
    return { ...DEFAULT_SESSION_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SESSION_CONFIG
  }
}

export function saveSessionConfig(config: SessionConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}
