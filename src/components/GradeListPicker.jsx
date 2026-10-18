import { LIST_IDS, WORD_LISTS } from '../data/lists'
import { useAppState } from '../state/AppState'

export default function GradeListPicker({ compact = false }) {
  const { state, setSelectedList, profile } = useAppState()

  if (compact) {
    return (
      <label className="block text-sm font-semibold">
        Spelling list
        <select
          className="mt-1 w-full max-w-xs rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-normal"
          value={state.selectedList}
          onChange={(event) => setSelectedList(event.target.value)}
          aria-label="UIL spelling list for this kid"
        >
          {LIST_IDS.map((id) => (
            <option key={id} value={id}>
              {WORD_LISTS[id].label} · {WORD_LISTS[id].words.length} words
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Spelling list</legend>
      <p className="mb-2 text-xs text-slate-600">
        Saved for {profile.name}. Scores for 3–4, 5–6, and 7–8 stay separate, so
        moving up does not erase the easier list.
      </p>
      <div className="space-y-2">
        {LIST_IDS.map((id) => (
          <label key={id} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="list"
              checked={state.selectedList === id}
              onChange={() => setSelectedList(id)}
              className="mt-1"
            />
            <span>
              <span className="font-semibold">{WORD_LISTS[id].label}</span>
              <span className="block text-slate-600">
                {WORD_LISTS[id].words.length} words · {WORD_LISTS[id].contestNote}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
