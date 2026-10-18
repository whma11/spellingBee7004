import { LIST_IDS, POOL_MODES } from '../data/lists'
import { DEFAULT_SPEECH } from './speech'

export const STORAGE_KEY = 'spellingBee7004.v1'

function emptyProgress() {
  return Object.fromEntries(LIST_IDS.map((id) => [id, {}]))
}

export function emptyState() {
  return {
    selectedList: 'grades-3-4',
    poolMode: POOL_MODES.ALL_WORDS,
    progress: emptyProgress(),
    history: {},
    speech: { ...DEFAULT_SPEECH },
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    return {
      ...emptyState(),
      ...parsed,
      progress: { ...emptyProgress(), ...(parsed.progress || {}) },
      history: parsed.history || {},
      speech: { ...DEFAULT_SPEECH, ...(parsed.speech || {}) },
    }
  } catch {
    return emptyState()
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function wordProgress(state, listId, wordId) {
  return state.progress[listId]?.[String(wordId)] || {
    isMastered: false,
    wrongCount: 0,
  }
}

export function mergeWordProgress(state, listId, wordId, patch) {
  const key = String(wordId)
  const current = wordProgress(state, listId, wordId)
  return {
    ...state,
    progress: {
      ...state.progress,
      [listId]: {
        ...state.progress[listId],
        [key]: { ...current, ...patch },
      },
    },
  }
}

export function bumpHistory(state, field, delta) {
  if (!delta) return state
  const day = todayKey()
  const current = state.history[day] || { correct: 0, incorrect: 0 }
  const nextValue = Math.max(0, (current[field] || 0) + delta)
  return {
    ...state,
    history: {
      ...state.history,
      [day]: { ...current, [field]: nextValue },
    },
  }
}
