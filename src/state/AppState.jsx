import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { WORD_LISTS } from '../data/lists'
import {
  cloudPayload,
  createFamilyCloud,
  downloadFamilyBackup,
  pullFamilyCloud,
  pushFamilyCloud,
  readFamilyBackupFile,
} from '../lib/cloud'
import { filteredPool, summarize } from '../lib/pool'
import { hashPin, newSalt, normalizePin, pinLooksValid, pinsMatch } from '../lib/pin'
import {
  activeProfile,
  applyCloudStore,
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
  const [syncNote, setSyncNote] = useState('')
  const skipNextPush = useRef(false)

  const commit = (updater) => {
    setStore((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return { ...next, updatedAt: Date.now() }
    })
  }

  useEffect(() => {
    let cancelled = false
    const local = loadStore()
    if (!local.familyCloudId) return undefined
    pullFamilyCloud(local.familyCloudId)
      .then((remote) => {
        if (cancelled) return
        if ((remote.updatedAt || 0) >= (local.updatedAt || 0)) {
          skipNextPush.current = true
          setStore(applyCloudStore(local, remote))
          setSyncNote('Loaded latest scores from the family cloud.')
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // Pull once when the app opens on this device.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    saveStore(store)
    if (!store.familyCloudId) return undefined
    if (skipNextPush.current) {
      skipNextPush.current = false
      return undefined
    }
    const timer = window.setTimeout(() => {
      pushFamilyCloud(store)
        .then(() => setSyncNote('Scores saved to the family cloud.'))
        .catch(() => setSyncNote('Cloud save failed. Download a backup file.'))
    }, 900)
    return () => window.clearTimeout(timer)
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
      familyCloudId: store.familyCloudId || '',
      syncNote,
      setSelectedList: (selectedList) =>
        commit((prev) => updateActiveProfile(prev, { selectedList })),
      setPoolMode: (poolMode) =>
        commit((prev) => updateActiveProfile(prev, { poolMode })),
      setSpeech: (patch) =>
        commit((prev) =>
          updateActiveProfile(prev, (current) => ({
            ...current,
            speech: { ...current.speech, ...patch },
          })),
        ),
      markResult: (wordId, result) => {
        commit((prev) =>
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
        commit((prev) => ({
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
        const next = {
          familyPinSalt,
          familyPinHash,
          familyCloudId: '',
          currentProfileId: profile.id,
          profiles: { [profile.id]: profile },
        }
        try {
          next.familyCloudId = await createFamilyCloud(next)
          setSyncNote('Family cloud created. Copy the code onto other devices.')
        } catch (err) {
          setSyncNote(err.message || 'Cloud unavailable. Download a backup file.')
        }
        commit(next)
      },
      async joinFamily(code) {
        const trimmed = String(code || '').trim()
        const remote = trimmed.startsWith('{')
          ? JSON.parse(trimmed)
          : await pullFamilyCloud(trimmed)
        if (!remote?.profiles) throw new Error('That family backup is not valid.')
        skipNextPush.current = true
        commit({
          ...applyCloudStore(store, remote),
          currentProfileId: null,
          familyCloudId: remote.familyCloudId || store.familyCloudId || '',
        })
        setSyncNote('This device joined the family. Pick a kid to continue.')
      },
      async copyFamilyJson() {
        await navigator.clipboard.writeText(JSON.stringify(cloudPayload(store)))
      },
      async importFamilyBackup(file) {
        const remote = await readFamilyBackupFile(file)
        skipNextPush.current = true
        commit({
          ...applyCloudStore(store, remote),
          currentProfileId: null,
          familyCloudId: remote.familyCloudId || store.familyCloudId || '',
        })
      },
      async ensureFamilyCloud() {
        if (store.familyCloudId) return store.familyCloudId
        const id = await createFamilyCloud(store)
        commit((prev) => ({ ...prev, familyCloudId: id }))
        setSyncNote('Family cloud created. Copy this code onto the iPad.')
        return id
      },
      downloadBackup: () => downloadFamilyBackup(store),
      async setFamilyPin(pin) {
        const clean = normalizePin(pin)
        if (!clean) {
          commit((prev) => ({
            ...prev,
            familyPinSalt: '',
            familyPinHash: '',
          }))
          return
        }
        if (!pinLooksValid(clean)) throw new Error('Family PIN must be 4–12 digits.')
        const salt = newSalt()
        const pinHash = await hashPin(clean, salt)
        commit((prev) => ({
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
        commit((prev) => ({
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
        commit((prev) => ({ ...prev, currentProfileId: profileId }))
      },
      async setProfilePin(profileId, pin) {
        const target = store.profiles[profileId]
        if (!target) throw new Error('That profile is missing.')
        const clean = normalizePin(pin)
        if (!clean) {
          commit((prev) => patchProfile(prev, profileId, { pinSalt: '', pinHash: '' }))
          return
        }
        if (!pinLooksValid(clean)) throw new Error('Kid PIN must be 4–12 digits.')
        const salt = newSalt()
        const pinHash = await hashPin(clean, salt)
        commit((prev) => patchProfile(prev, profileId, { pinSalt: salt, pinHash }))
      },
      deleteProfile(profileId) {
        commit((prev) => {
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
    [store, profile, list, words, pool, stats, syncNote],
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
