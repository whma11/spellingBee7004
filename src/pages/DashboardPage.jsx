import TrendChart from '../components/TrendChart'
import { LIST_IDS, POOL_MODES, WORD_LISTS } from '../data/lists'
import { useAppState } from '../state/AppState'

export default function DashboardPage() {
  const { state, list, stats, setSelectedList, setPoolMode } = useAppState()

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200 sm:p-8">
        <h2 className="text-xl font-bold">Progress & configuration</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose a UIL division and the practice pool. Metrics stay in this
          browser via LocalStorage.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Spelling list</legend>
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
          Correct and incorrect marks saved for the last 14 days in this browser.
        </p>
        <TrendChart history={state.history} />
      </div>
    </section>
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
