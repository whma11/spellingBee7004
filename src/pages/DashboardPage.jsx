import { useState } from 'react'
import GradeListPicker from '../components/GradeListPicker'
import TrendChart from '../components/TrendChart'
import { POOL_MODES } from '../data/lists'
import { pinLooksValid } from '../lib/pin'
import { useAppState } from '../state/AppState'

export default function DashboardPage() {
  const { state, list, stats, setPoolMode, profile } = useAppState()

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200 sm:p-8">
        <h2 className="text-xl font-bold">{profile.name}’s progress</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose a UIL division and the practice pool. Scores and the trend
          chart belong only to this kid on this device.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <GradeListPicker />

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Word pool</legend>
            <div className="space-y-2">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="pool"
                  checked={state.poolMode === POOL_MODES.ALL_WORDS}
                  onChange={() => setPoolMode(POOL_MODES.ALL_WORDS)}
                  className="mt-1"
                />
                <span>
                  <span className="font-semibold">Practice all words</span>
                  <span className="block text-slate-600">
                    Randomize across the full {list.label} list.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="pool"
                  checked={state.poolMode === POOL_MODES.UNLEARNED_DIFFICULT}
                  onChange={() => setPoolMode(POOL_MODES.UNLEARNED_DIFFICULT)}
                  className="mt-1"
                />
                <span>
                  <span className="font-semibold">Unlearned & difficult only</span>
                  <span className="block text-slate-600">
                    Words that are not mastered or have a wrong count above zero.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total mastered" value={stats.mastered} hint={`of ${stats.total}`} />
        <StatCard label="Difficult items" value={stats.difficult} hint="wrongCount > 0" />
        <StatCard label="Remaining pool" value={stats.remaining} hint="unlearned or missed" />
      </div>

      <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200 sm:p-8">
        <h3 className="font-bold">Daily trend</h3>
        <p className="mb-4 text-sm text-slate-600">
          Correct and incorrect marks for {profile.name} over the last 14 days.
        </p>
        <TrendChart history={state.history} />
      </div>

      <FamilySettings />
    </section>
  )
}

function FamilySettings() {
  const {
    profile,
    profiles,
    hasFamilyPin,
    familyCloudId,
    syncNote,
    verifyFamilyPin,
    setFamilyPin,
    setProfilePin,
    deleteProfile,
    lock,
    ensureFamilyCloud,
    downloadBackup,
    copyFamilyJson,
  } = useAppState()
  const [familyPin, setFamilyPinValue] = useState('')
  const [newFamilyPin, setNewFamilyPin] = useState('')
  const [kidPin, setKidPin] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const requireFamily = async () => {
    if (!hasFamilyPin) return true
    const ok = await verifyFamilyPin(familyPin)
    if (!ok) throw new Error('Enter the family PIN first.')
    return true
  }

  const run = async (fn, success) => {
    setError('')
    setMessage('')
    try {
      await fn()
      setMessage(success)
      setKidPin('')
      setNewFamilyPin('')
    } catch (err) {
      setError(err.message || 'Could not update.')
    }
  }

  return (
    <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200 sm:p-8">
      <h3 className="font-bold">Family profiles</h3>
      <p className="mt-1 text-sm text-slate-600">
        Change PINs or remove a kid. Kids in this family:{' '}
        {profiles.map((p) => p.name).join(', ')}.
      </p>

      <div className="mt-4 rounded-2xl bg-amber-50 p-4">
        <p className="text-sm font-semibold">Family code (all devices)</p>
        <p className="mt-1 text-xs text-slate-600">
          On the iPad, choose <strong>This family already exists</strong> and
          paste this code so scores stay in one place.
        </p>
        <p className="mt-2 break-all font-mono text-xs">
          {familyCloudId || 'Not created yet'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-amber-200"
            onClick={() =>
              run(async () => {
                const id = familyCloudId || (await ensureFamilyCloud())
                await navigator.clipboard.writeText(id)
              }, 'Family code copied.')
            }
          >
            Copy family code
          </button>
          <button
            type="button"
            className="rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-amber-200"
            onClick={() =>
              run(async () => {
                await ensureFamilyCloud()
              }, 'Family cloud is ready.')
            }
          >
            Create / refresh cloud
          </button>
          <button
            type="button"
            className="rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-amber-200"
            onClick={() => downloadBackup()}
          >
            Download backup file
          </button>
          <button
            type="button"
            className="rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-amber-200"
            onClick={() =>
              run(async () => {
                await copyFamilyJson()
              }, 'Family backup copied. Paste it on the iPad join screen.')
            }
          >
            Copy backup JSON
          </button>
        </div>
        {syncNote ? <p className="mt-2 text-xs text-slate-600">{syncNote}</p> : null}
      </div>
      {hasFamilyPin ? (
        <label className="mt-4 block text-sm font-semibold">
          Family PIN (required for changes)
          <input
            type="password"
            inputMode="numeric"
            className="mt-1 w-full max-w-xs rounded-xl border border-amber-200 px-3 py-2 font-normal"
            value={familyPin}
            onChange={(e) => setFamilyPinValue(e.target.value)}
          />
        </label>
      ) : (
        <p className="mt-3 text-sm text-slate-600">
          No family PIN is set. Anyone using this browser can add or delete
          profiles.
        </p>
      )}

      <label className="mt-4 block text-sm font-semibold">
        New family PIN (blank removes it)
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            type="password"
            inputMode="numeric"
            className="rounded-xl border border-amber-200 px-3 py-2 font-normal"
            value={newFamilyPin}
            onChange={(e) => setNewFamilyPin(e.target.value)}
            placeholder="4–12 digits"
          />
          <button
            type="button"
            className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold"
            onClick={() =>
              run(async () => {
                await requireFamily()
                if (newFamilyPin && !pinLooksValid(newFamilyPin)) {
                  throw new Error('Family PIN must be 4–12 digits.')
                }
                await setFamilyPin(newFamilyPin)
              }, 'Family PIN updated.')
            }
          >
            Save family PIN
          </button>
        </div>
      </label>

      <label className="mt-4 block text-sm font-semibold">
        New PIN for {profile.name} (blank removes it)
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            type="password"
            inputMode="numeric"
            className="rounded-xl border border-amber-200 px-3 py-2 font-normal"
            value={kidPin}
            onChange={(e) => setKidPin(e.target.value)}
            placeholder="4–12 digits"
          />
          <button
            type="button"
            className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold"
            onClick={() =>
              run(async () => {
                await requireFamily()
                await setProfilePin(profile.id, kidPin)
              }, `${profile.name}’s PIN updated.`)
            }
          >
            Save kid PIN
          </button>
        </div>
      </label>

      <button
        type="button"
        className="mt-6 rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-800"
        onClick={() =>
          run(async () => {
            await requireFamily()
            if (
              !window.confirm(
                `Delete ${profile.name}’s profile and all of their scores on this device?`,
              )
            ) {
              throw new Error('Delete canceled.')
            }
            deleteProfile(profile.id)
            lock()
          }, 'Profile deleted.')
        }
      >
        Delete {profile.name}’s profile
      </button>

      {error ? <p className="mt-3 text-sm font-medium text-red-800">{error}</p> : null}
      {message ? <p className="mt-3 text-sm font-medium text-green-800">{message}</p> : null}
    </div>
  )
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="text-xs text-slate-600">{hint}</p>
    </div>
  )
}
