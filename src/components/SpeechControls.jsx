import { useEffect, useState } from 'react'
import { useAppState } from '../state/AppState'
import {
  SPEECH_ENGINES,
  espeakVoiceOptions,
  loadEspeak,
  speak,
  speakLast,
  speechSupported,
  stopSpeaking,
  useSpeechVoices,
} from '../lib/speech'

export default function SpeechControls() {
  const { state, setSpeech } = useAppState()
  const speech = state.speech
  const voices = useSpeechVoices()
  const [espeakNote, setEspeakNote] = useState('')

  useEffect(() => {
    if (speech.engine !== SPEECH_ENGINES.ESPEAK) {
      setEspeakNote('')
      return undefined
    }
    let cancelled = false
    setEspeakNote('Loading eSpeak NG…')
    loadEspeak()
      .then(() => {
        if (!cancelled) setEspeakNote('eSpeak NG ready (open-source, same on every device).')
      })
      .catch((error) => {
        if (!cancelled) {
          setEspeakNote(
            error?.message ||
              'eSpeak NG could not start. Browser voices will be used if playback fails.',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [speech.engine])

  const patch = (partial) => setSpeech(partial)

  return (
    <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-amber-200">
      <h3 className="font-bold">Pronunciation</h3>
      <p className="mt-1 text-xs text-slate-600">
        Free, on-device speech. No cloud text-to-speech account.
      </p>

      {!speechSupported() && speech.engine === SPEECH_ENGINES.BROWSER ? (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs">
          This browser has no Web Speech API. Switch to eSpeak NG, or use Chrome
          or Edge.
        </p>
      ) : null}

      <fieldset className="mt-4 space-y-2">
        <legend className="text-sm font-semibold">Engine</legend>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="radio"
            name="speech-engine"
            className="mt-1"
            checked={speech.engine === SPEECH_ENGINES.BROWSER}
            onChange={() => patch({ engine: SPEECH_ENGINES.BROWSER })}
          />
          <span>
            <span className="font-semibold">Browser voices</span>
            <span className="block text-xs text-slate-600">
              Web Speech API — uses voices already on this computer (free).
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="radio"
            name="speech-engine"
            className="mt-1"
            checked={speech.engine === SPEECH_ENGINES.ESPEAK}
            onChange={() => patch({ engine: SPEECH_ENGINES.ESPEAK })}
          />
          <span>
            <span className="font-semibold">eSpeak NG</span>
            <span className="block text-xs text-slate-600">
              Open-source synthesizer in the page (GPL). Clear, consistent
              pronunciation for spelling drills.
            </span>
          </span>
        </label>
      </fieldset>

      {speech.engine === SPEECH_ENGINES.BROWSER ? (
        <label className="mt-4 block text-sm font-semibold">
          Voice
          <select
            className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-normal"
            value={speech.voiceURI}
            onChange={(event) => patch({ voiceURI: event.target.value })}
          >
            <option value="">Auto (English)</option>
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
                {voice.localService ? '' : ' · online'}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="mt-4 block text-sm font-semibold">
          eSpeak voice
          <select
            className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-normal"
            value={speech.espeakVoice}
            onChange={(event) => patch({ espeakVoice: event.target.value })}
          >
            {espeakVoiceOptions().map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {espeakNote && speech.engine === SPEECH_ENGINES.ESPEAK ? (
        <p className="mt-2 text-xs text-slate-600">{espeakNote}</p>
      ) : null}

      <label className="mt-4 block text-sm font-semibold">
        Speed {Math.round(speech.rate * 100)}%
        <input
          type="range"
          min="0.5"
          max="1.15"
          step="0.05"
          className="mt-1 w-full"
          value={speech.rate}
          onChange={(event) => patch({ rate: Number(event.target.value) })}
        />
      </label>

      <label className="mt-3 block text-sm font-semibold">
        Pitch {speech.pitch.toFixed(2)}
        <input
          type="range"
          min="0.7"
          max="1.3"
          step="0.05"
          className="mt-1 w-full"
          value={speech.pitch}
          onChange={(event) => patch({ pitch: Number(event.target.value) })}
        />
      </label>

      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={speech.autoSpeakWord}
          onChange={(event) => patch({ autoSpeakWord: event.target.checked })}
        />
        <span>Auto-speak the word when the next card loads</span>
      </label>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold"
          onClick={() => speakLast(speech)}
        >
          Repeat last
        </button>
        <button
          type="button"
          className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold"
          onClick={() => stopSpeaking()}
        >
          Stop
        </button>
        <button
          type="button"
          className="col-span-2 rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold"
          onClick={() => speak('Pronunciation check. Spelling bee.', speech)}
        >
          Test voice
        </button>
      </div>
    </div>
  )
}
