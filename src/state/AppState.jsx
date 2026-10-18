import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { WORD_LISTS } from '../data/lists'
import { filteredPool, summarize } from '../lib/pool'
import {
  bumpHistory,
  loadState,
  mergeWordProgress,
  saveState,
  wordProgress,
} from '../lib/storage'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const [state, setState] = useState(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const list = WORD_LISTS[state.selectedList]
  const words = list.words
  const pool = useMemo(
    () => filteredPool(words, state, state.selectedList),
    [words, state],
  )
  const stats = useMemo(
    () => summarize(words, state, state.selectedList),
    [words, state],
  )

  const value = useMemo(
    () => ({
      state,
      list,
      words,
      pool,
      stats,
      setSelectedList: (selectedList) =>
        setState((prev) => ({ ...prev, selectedList })),
      setPoolMode: (poolMode) => setState((prev) => ({ ...prev, poolMode })),
      setSpeech: (patch) =>
        setState((prev) => ({
          ...prev,
          speech: { ...prev.speech, ...patch },
        })),
      markResult: (wordId, result) => {
        setState((prev) => {
          const current = wordProgress(prev, prev.selectedList, wordId)
          if (result === 'correct') {
            let next = mergeWordProgress(prev, prev.selectedList, wordId, {
              isMastered: true,
            })
            if (!current.isMastered) {
              next = bumpHistory(next, 'correct', 1)
            }
            return next
          }
          let next = mergeWordProgress(prev, prev.selectedList, wordId, {
            isMastered: false,
            wrongCount: current.wrongCount + 1,
          })
          next = bumpHistory(next, 'incorrect', 1)
          return next
        })
      },
    }),
    [state, list, words, pool, stats],
  )

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState() {
  const value = useContext(AppStateContext)
  if (!value) throw new Error('useAppState must be used inside AppStateProvider')
  return value
}
