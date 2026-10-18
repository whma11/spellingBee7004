import { useEffect, useState } from 'react'
import GradeListPicker from '../components/GradeListPicker'
import SpeechControls from '../components/SpeechControls'
import { useAppState } from '../state/AppState'
import { pickNextWord } from '../lib/pool'
import {
  displayWord,
  speak,
  speakSlowly,
  speakWordText,
  stopSpeaking,
} from '../lib/speech'
import { wordProgress } from '../lib/storage'

export default function PracticePage() {
  const { state, list, pool, stats, markResult } = useAppState()
  const speech = state.speech
  const [current, setCurrent] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [sentenceIndex, setSentenceIndex] = useState(1)
  const [result, setResult] = useState('')

  const loadNext = () => {
    stopSpeaking()
    const next = pickNextWord(pool, current?.id)
    setCurrent(next)
    setRevealed(false)
    setSentenceIndex(1)
    setResult('')
    if (next && state.speech.autoSpeakWord) {
      speak(speakWordText(next), state.speech)
    }
  }

  useEffect(() => {
    stopSpeaking()
    setCurrent(null)
    setRevealed(false)
    setSentenceIndex(1)
    setResult('')
  }, [state.selectedList, state.poolMode])

  useEffect(() => {
    if (!current && pool.length) loadNext()
    // loadNext is intentionally recreated; this effect only fills an empty slot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pool, state.selectedList, state.poolMode])

  const progress = current
    ? wordProgress(state, state.selectedList, current.id)
    : null

  const onResult = (value) => {
    if (!current) return
    if (result) return
    setResult(value)
    markResult(current.id, value)
  }

  const emptyPool = pool.length === 0

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Spell tab</h2>
            <p className="mb-3 text-sm text-slate-600">
              {state.poolMode === 'ALL_WORDS' ? 'all words' : 'unlearned & difficult'}
            </p>
            <GradeListPicker compact />
          </div>
          <button
            type="button"
            onClick={loadNext}
            disabled={emptyPool}
            className="rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-amber-50 disabled:opacity-40"
          >
            Load next word
          </button>
        </div>

        {emptyPool ? (
          <p className="rounded-2xl bg-amber-50 p-6 text-sm">
            This filter has no remaining words. Switch to “Practice all words”
            on the Progress tab, or un-pass some entries after more practice.
          </p>
        ) : (
          <>
            <div className="mb-6 min-h-28 rounded-2xl bg-ink px-5 py-8 text-center text-amber-50">
              {revealed && current ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-200">
                    Parent peek
                  </p>
                  <p className="mt-2 text-3xl font-black sm:text-4xl">
                    {displayWord(current)}
                  </p>
                  {current.note ? (
                    <p className="mt-2 text-sm text-amber-100">({current.note})</p>
                  ) : null}
                </div>
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-200">
                    Screen-free round
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-amber-100">
                    Word hidden — listen only
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-2xl bg-honey px-4 py-4 text-base font-bold text-ink"
                onClick={() => current && speak(speakWordText(current), speech)}
              >
                Sound word
              </button>
              <button
                type="button"
                className="rounded-2xl bg-amber-100 px-4 py-4 text-base font-bold text-ink"
                onClick={() => {
                  if (!current) return
                  setSentenceIndex(1)
                  speak(current.sentence1, speech)
                }}
              >
                Sound sentence
              </button>
              <button
                type="button"
                className="rounded-2xl bg-amber-100 px-4 py-4 text-base font-bold text-ink"
                onClick={() => {
                  if (!current) return
                  setSentenceIndex(2)
                  speak(current.sentence2, speech)
                }}
              >
                Alternate sentence
              </button>
              <button
                type="button"
                className="rounded-2xl border border-amber-300 bg-white px-4 py-4 text-base font-bold"
                onClick={() =>
                  current && speakSlowly(speakWordText(current), speech)
                }
              >
                Say slowly
              </button>
              <button
                type="button"
                className="rounded-2xl border border-amber-300 bg-white px-4 py-4 text-base font-bold"
                onClick={() => setRevealed((v) => !v)}
              >
                {revealed ? 'Hide word' : 'Peek word (parent)'}
              </button>
            </div>

            <fieldset className="mt-6 rounded-2xl border border-amber-200 p-4">
              <legend className="px-2 text-sm font-semibold">Word result</legend>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="result"
                    checked={result === 'correct'}
                    onChange={() => onResult('correct')}
                    disabled={!current || Boolean(result)}
                  />
                  Correct / Pass
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="result"
                    checked={result === 'incorrect'}
                    onChange={() => onResult('incorrect')}
                    disabled={!current || Boolean(result)}
                  />
                  Incorrect / Fail
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Pass marks the word mastered. Fail increases its wrong count and
                keeps it in the unlearned pool. Load the next word after you score.
              </p>
            </fieldset>
          </>
        )}
      </div>

      <aside className="space-y-4">
        <SpeechControls />
        <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200">
          <h3 className="font-bold">This round</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Spoken context</dt>
              <dd className="font-semibold">
                {sentenceIndex === 2 ? 'Sentence 2' : 'Sentence 1'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Wrong count</dt>
              <dd className="font-semibold">{progress?.wrongCount ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Mastered?</dt>
              <dd className="font-semibold">{progress?.isMastered ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Pool size</dt>
              <dd className="font-semibold">{pool.length}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200">
          <h3 className="font-bold">{list.label} snapshot</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Mastered: {stats.mastered}</li>
            <li>Difficult: {stats.difficult}</li>
            <li>Remaining pool: {stats.remaining}</li>
            <li>List size: {stats.total}</li>
          </ul>
        </div>
      </aside>
    </section>
  )
}
