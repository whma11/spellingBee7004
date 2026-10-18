import { POOL_MODES } from '../data/lists'
import { wordProgress } from './storage'

export function filteredPool(words, state, listId) {
  if (state.poolMode !== POOL_MODES.UNLEARNED_DIFFICULT) return words
  return words.filter((entry) => {
    const stats = wordProgress(state, listId, entry.id)
    return stats.isMastered === false || stats.wrongCount > 0
  })
}

export function pickNextWord(pool, currentId) {
  if (!pool.length) return null
  if (pool.length === 1) return pool[0]
  const candidates = pool.filter((entry) => entry.id !== currentId)
  const list = candidates.length ? candidates : pool
  return list[Math.floor(Math.random() * list.length)]
}

export function summarize(words, state, listId) {
  let mastered = 0
  let difficult = 0
  for (const entry of words) {
    const stats = wordProgress(state, listId, entry.id)
    if (stats.isMastered) mastered += 1
    if (stats.wrongCount > 0) difficult += 1
  }
  const remaining = words.filter((entry) => {
    const stats = wordProgress(state, listId, entry.id)
    return stats.isMastered === false || stats.wrongCount > 0
  }).length
  return {
    total: words.length,
    mastered,
    difficult,
    remaining,
  }
}
