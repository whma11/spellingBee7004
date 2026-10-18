import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { WORD_LISTS } from '../data/lists'
import { filteredPool, summarize } from '../lib/pool'
import { hashPin, newSalt, normalizePin, pinLooksValid, pinsMatch } from '../lib/pin'
import {
  activeProfile,
  bumpHistory,
  emptyProfile,
  listProfiles,
  loadStore,
  mergeWordProgress,
  patchProfile,
  saveStore,
  updateActiveProfile,
  wordProgress,
} from '../lib/storage'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const [store, setStore] = useState(() => loadStore())

  useEffect(() => {
    saveStore(store)
  }, [store])

  const profile = activeProfile(store)
  const list = WORD_LISTS[profile?.selectedList || 'grades-3-4']
  const words = list.words
  const pool = useMemo(
    () => (profile ? filteredPool(words, profile, profile.selectedList) : []),
    [words, profile],
  )
  const stats = useMemo(
    () =>
      profile
        ? summarize(words, profile, profile.selectedList)
        : { total: words.length, mastered: 0, difficult: 0, remaining: words.length },
    [words, profile],
  )

  const value = useMemo(
    () => ({
      store,
      state: profile,
      profile,
      profiles: listProfiles(store),
      list,
      words,
      pool,
      stats,
      hasFamilyPin: Boolean(store.familyPinHash),
      setSelectedList: (selectedList) =>
        setStore((prev) => updateActiveProfile(prev, { selectedList })),
      setPoolMode: (poolMode) =>
        setStore((prev) => updateActiveProfile(prev, { poolMode })),
      setSpeech: (patch) =>
        setStore((prev) =>
          updateActiveProfile(prev, (current) => ({
            ...current,
            speech: { ...current.speech, ...patch },
          })),
        ),
      markResult: (wordId, result) => {
        setStore((prev) =>
          updateActiveProfile(prev, (current) => {
            const statsForWord = wordProgress(current, current.selectedList, wordId)
            if (result === 'correct') {
              let next = mergeWordProgress(current, current.selectedList, wordId, {
                isMastered: true,
              })
              if (!statsForWord.isMastered) next = bumpHistory(next, 'correct', 1)
              return next
            }
            let next = mergeWordProgress(current, current.selectedList, wordId, {
              isMastered: false,
              wrongCount: statsForWord.wrongCount + 1,
            })
            return bumpHistory(next, 'incorrect', 1)
          }),
        )
      },
      lock: () =>
        setStore((prev) => ({
          ...prev,
          currentProfileId: null,
        })),
      async bootstrapFamily({ name, kidPin, familyPin }) {
        const trimmed = String(name || '').trim()
        if (!trimmed) throw new Error('Please enter a name.')
        const familyClean = normalizePin(familyPin)
        const kidClean = normalizePin(kidPin)
        if (familyClean && !pinLooksValid(familyClean)) {
          throw new Error('Family PIN must be 4–12 digits.')
        }
        if (kidClean && !pinLooksValid(kidClean)) {
          throw new Error('Kid PIN must be 4–12 digits.')
        }
        let familyPinSalt = ''
        let familyPinHash = ''
        if (familyClean) {
          familyPinSalt = newSalt()
          familyPinHash = await hashPin(familyClean, familyPinSalt)
        }
        let profile = emptyProfile(trimmed)
        if (kidClean) {
          profile = { ...profile, pinSalt: newSalt() }
          profile.pinHash = await hashPin(kidClean, profile.pinSalt)
        }
        setStore({
          familyPinSalt,
          familyPinHash,
          currentProfileId: profile.id,
          profiles: { [profile.id]: profile },
        })
      },
      async setFamilyPin(pin) {
        const clean = normalizePin(pin)
        if (!clean) {
          setStore((prev) => ({
            ...prev,
            familyPinSalt: '',
            familyPinHash: '',
          }))
          return
        }
        if (!pinLooksValid(clean)) throw new Error('Family PIN must be 4–12 digits.')
        const salt = newSalt()
        const pinHash = await hashPin(clean, salt)
        setStore((prev) => ({
          ...prev,
          familyPinSalt: salt,
          familyPinHash: pinHash,
        }))
      },
      async verifyFamilyPin(pin) {
        if (!store.familyPinHash) return true
        return pinsMatch(pin, store.familyPinSalt, store.familyPinHash)
      },
      async createProfile({ name, pin }) {
        const trimmed = String(name || '').trim()
        if (!trimmed) throw new Error('Please enter a name.')
        let profile = emptyProfile(trimmed)
        const clean = normalizePin(pin)
        if (clean) {
          if (!pinLooksValid(clean)) throw new Error('Kid PIN must be 4–12 digits.')
          profile = {
            ...profile,
            pinSalt: newSalt(),
          }
          profile.pinHash = await hashPin(clean, profile.pinSalt)
        }
        setStore((prev) => ({
          ...prev,
          currentProfileId: profile.id,
          profiles: { ...prev.profiles, [profile.id]: profile },
        }))
        return profile.id
      },
      async unlockProfile(profileId, pin) {
        const target = store.profiles[profileId]
        if (!target) throw new Error('That profile is missing.')
        if (target.pinHash) {
          const ok = await pinsMatch(pin, target.pinSalt, target.pinHash)
          if (!ok) throw new Error('That PIN does not match.')
        }
        setStore((prev) => ({ ...prev, currentProfileId: profileId }))
      },
      async setProfilePin(profileId, pin) {
        const target = store.profiles[profileId]
        if (!target) throw new Error('That profile is missing.')
        const clean = normalizePin(pin)
        if (!clean) {
          setStore((prev) =>
            patchProfile(prev, profileId, { pinSalt: '', pinHash: '' }),
          )
          return
        }
        if (!pinLooksValid(clean)) throw new Error('Kid PIN must be 4–12 digits.')
        const salt = newSalt()
        const pinHash = await hashPin(clean, salt)
        setStore((prev) => patchProfile(prev, profileId, { pinSalt: salt, pinHash }))
      },
      deleteProfile(profileId) {
        setStore((prev) => {
          const profiles = { ...prev.profiles }
          delete profiles[profileId]
          return {
            ...prev,
            profiles,
            currentProfileId:
              prev.currentProfileId === profileId ? null : prev.currentProfileId,
          }
        })
      },
    }),
    [store, profile, list, words, pool, stats],
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
