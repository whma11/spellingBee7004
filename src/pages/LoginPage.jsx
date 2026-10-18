import { useState } from 'react'
import { pinLooksValid } from '../lib/pin'
import { useAppState } from '../state/AppState'

export default function LoginPage() {
  const {
    profiles,
    hasFamilyPin,
    createProfile,
    unlockProfile,
    verifyFamilyPin,
    bootstrapFamily,
  } = useAppState()
  const firstRun = profiles.length === 0
  const [mode, setMode] = useState(firstRun ? 'setup' : 'pick')
  const [name, setName] = useState('')
  const [kidPin, setKidPin] = useState('')
  const [kidPinAgain, setKidPinAgain] = useState('')
  const [familyPin, setFamilyPinValue] = useState('')
  const [familyPinAgain, setFamilyPinAgain] = useState('')
  const [pendingId, setPendingId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const pending = profiles.find((p) => p.id === pendingId)

  const run = async (fn) => {
    setError('')
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const onSetup = () =>
    run(async () => {
      if (familyPin && familyPin !== familyPinAgain) {
        throw new Error('Family PINs do not match.')
      }
      if (familyPin && !pinLooksValid(familyPin)) {
        throw new Error('Family PIN must be 4–12 digits.')
      }
      if (kidPin && kidPin !== kidPinAgain) {
        throw new Error('Kid PINs do not match.')
      }
      await bootstrapFamily({ name, kidPin, familyPin })
    })

  const onCreate = () =>
    run(async () => {
      if (hasFamilyPin) {
        const ok = await verifyFamilyPin(familyPin)
        if (!ok) throw new Error('Family PIN is not correct.')
      }
      if (kidPin && kidPin !== kidPinAgain) {
        throw new Error('Kid PINs do not match.')
      }
      await createProfile({ name, pin: kidPin })
    })

  const onUnlock = () =>
    run(async () => {
      await unlockProfile(pendingId, kidPin)
    })

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
        Family spelling practice
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Who is practicing?</h1>
      <p className="mt-2 text-sm text-slate-700">
        Each kid gets a private scorecard on this device. Optional PINs keep siblings
        out of each other’s charts. This is not a cloud login — nothing is sent to a
        server.
      </p>

      {error ? (
        <p className="mt-4 rounded-2xl bg-amber-100 px-4 py-3 text-sm font-medium text-ink">
          {error}
        </p>
      ) : null}

      {mode === 'setup' ? (
        <form
          className="mt-6 space-y-4 rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200"
          onSubmit={(event) => {
            event.preventDefault()
            onSetup()
          }}
        >
          <h2 className="font-bold">First-time setup</h2>
          <label className="block text-sm font-semibold">
            Family PIN (optional)
            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
              value={familyPin}
              onChange={(e) => setFamilyPinValue(e.target.value)}
              placeholder="4–12 digits, for adding or deleting kids"
            />
          </label>
          {familyPin ? (
            <label className="block text-sm font-semibold">
              Repeat family PIN
              <input
                type="password"
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
                value={familyPinAgain}
                onChange={(e) => setFamilyPinAgain(e.target.value)}
              />
            </label>
          ) : null}
          <label className="block text-sm font-semibold">
            First kid’s name
            <input
              required
              className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maya"
            />
          </label>
          <label className="block text-sm font-semibold">
            Kid PIN (optional)
            <input
              type="password"
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
              value={kidPin}
              onChange={(e) => setKidPin(e.target.value)}
              placeholder="4–12 digits"
            />
          </label>
          {kidPin ? (
            <label className="block text-sm font-semibold">
              Repeat kid PIN
              <input
                type="password"
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
                value={kidPinAgain}
                onChange={(e) => setKidPinAgain(e.target.value)}
              />
            </label>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-amber-50 disabled:opacity-40"
          >
            Save and start
          </button>
        </form>
      ) : null}

      {mode === 'pick' ? (
        <div className="mt-6 rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200">
          <h2 className="font-bold">Choose a profile</h2>
          <div className="mt-4 grid gap-2">
            {profiles.map((person) => (
              <button
                key={person.id}
                type="button"
                className="rounded-2xl bg-amber-100 px-4 py-3 text-left font-bold"
                onClick={() => {
                  setError('')
                  setKidPin('')
                  if (person.pinHash) {
                    setPendingId(person.id)
                    setMode('pin')
                  } else {
                    run(() => unlockProfile(person.id, ''))
                  }
                }}
              >
                {person.name}
                <span className="block text-xs font-medium text-slate-600">
                  {person.pinHash ? 'PIN required' : 'No PIN'}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 text-sm font-semibold underline"
            onClick={() => {
              setName('')
              setKidPin('')
              setKidPinAgain('')
              setFamilyPinValue('')
              setError('')
              setMode('create')
            }}
          >
            Add another kid
          </button>
        </div>
      ) : null}

      {mode === 'pin' && pending ? (
        <form
          className="mt-6 space-y-4 rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200"
          onSubmit={(event) => {
            event.preventDefault()
            onUnlock()
          }}
        >
          <h2 className="font-bold">Enter PIN for {pending.name}</h2>
          <label className="block text-sm font-semibold">
            PIN
            <input
              autoFocus
              type="password"
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
              value={kidPin}
              onChange={(e) => setKidPin(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-amber-50 disabled:opacity-40"
          >
            Open dashboard
          </button>
          <button
            type="button"
            className="w-full text-sm font-semibold underline"
            onClick={() => {
              setMode('pick')
              setPendingId('')
              setKidPin('')
              setError('')
            }}
          >
            Back to profiles
          </button>
        </form>
      ) : null}

      {mode === 'create' ? (
        <form
          className="mt-6 space-y-4 rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200"
          onSubmit={(event) => {
            event.preventDefault()
            onCreate()
          }}
        >
          <h2 className="font-bold">New kid profile</h2>
          {hasFamilyPin ? (
            <label className="block text-sm font-semibold">
              Family PIN
              <input
                type="password"
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
                value={familyPin}
                onChange={(e) => setFamilyPinValue(e.target.value)}
              />
            </label>
          ) : null}
          <label className="block text-sm font-semibold">
            Name
            <input
              required
              className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Kid PIN (optional)
            <input
              type="password"
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
              value={kidPin}
              onChange={(e) => setKidPin(e.target.value)}
            />
          </label>
          {kidPin ? (
            <label className="block text-sm font-semibold">
              Repeat kid PIN
              <input
                type="password"
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2 font-normal"
                value={kidPinAgain}
                onChange={(e) => setKidPinAgain(e.target.value)}
              />
            </label>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-amber-50 disabled:opacity-40"
          >
            Create profile
          </button>
          <button
            type="button"
            className="w-full text-sm font-semibold underline"
            onClick={() => {
              setMode('pick')
              setError('')
            }}
          >
            Cancel
          </button>
        </form>
      ) : null}
    </div>
  )
}
