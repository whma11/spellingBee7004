import { useAppState } from '../state/AppState'

export default function ProfileBar() {
  const { profile, lock } = useAppState()
  if (!profile) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold ring-1 ring-amber-200">
        {profile.name}
      </p>
      <button
        type="button"
        className="text-sm font-semibold underline"
        onClick={() => lock()}
      >
        Switch kid
      </button>
    </div>
  )
}
