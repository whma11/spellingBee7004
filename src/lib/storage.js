import { LIST_IDS, POOL_MODES } from '../data/lists'
import { DEFAULT_SPEECH } from './speech'

export const LEGACY_STORAGE_KEY = 'spellingBee7004.v1'
export const STORAGE_KEY = 'spellingBee7004.v2'

function emptyProgress() {
  return Object.fromEntries(LIST_IDS.map((id) => [id, {}]))
}

export function emptyPracticeFields() {
  return {
    selectedList: 'grades-3-4',
    poolMode: POOL_MODES.ALL_WORDS,
    progress: emptyProgress(),
    history: {},
    speech: { ...DEFAULT_SPEECH },
  }
}

export function newProfileId() {
  return crypto.randomUUID()
}

export function emptyProfile(name, id = newProfileId()) {
  return {
    id,
    name: name.trim(),
    pinSalt: '',
    pinHash: '',
    createdAt: new Date().toISOString(),
    ...emptyPracticeFields(),
  }
}

export function emptyStore() {
  return {
    familyPinSalt: '',
    familyPinHash: '',
    currentProfileId: null,
    profiles: {},
  }
}

function normalizeProfile(raw) {
  const base = emptyProfile(raw.name || 'Kid', raw.id || newProfileId())
  return {
    ...base,
    ...raw,
    name: String(raw.name || 'Kid').trim() || 'Kid',
    progress: { ...emptyProgress(), ...(raw.progress || {}) },
    history: raw.history || {},
    speech: { ...DEFAULT_SPEECH, ...(raw.speech || {}) },
  }
}

function normalizeStore(raw) {
  const store = { ...emptyStore(), ...raw }
  const profiles = {}
  for (const [id, profile] of Object.entries(raw.profiles || {})) {
    const next = normalizeProfile({ ...profile, id })
    profiles[next.id] = next
  }
  store.profiles = profiles
  if (store.currentProfileId && !profiles[store.currentProfileId]) {
    store.currentProfileId = null
  }
  return store
}

function migrateLegacy(parsed) {
  const profile = normalizeProfile({
    ...emptyPracticeFields(),
    ...parsed,
    name: 'Kid 1',
  })
  return {
    ...emptyStore(),
    currentProfileId: null,
    profiles: { [profile.id]: profile },
  }
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeStore(JSON.parse(raw))
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) return migrateLegacy(JSON.parse(legacy))
    return emptyStore()
  } catch {
    return emptyStore()
  }
}

export function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function listProfiles(store) {
  return Object.values(store.profiles).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )
}

export function activeProfile(store) {
  return store.profiles[store.currentProfileId] || null
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

export function patchProfile(store, profileId, patch) {
  const current = store.profiles[profileId]
  if (!current) return store
  return {
    ...store,
    profiles: {
      ...store.profiles,
      [profileId]: { ...current, ...patch },
    },
  }
}

export function updateActiveProfile(store, updater) {
  const id = store.currentProfileId
  if (!id || !store.profiles[id]) return store
  const current = store.profiles[id]
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
  return patchProfile(store, id, next)
}
