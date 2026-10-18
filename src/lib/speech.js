import { useEffect, useState } from 'react'

export const SPEECH_ENGINES = {
  BROWSER: 'browser',
  ESPEAK: 'espeak',
}

export const DEFAULT_SPEECH = {
  engine: SPEECH_ENGINES.BROWSER,
  voiceURI: '',
  espeakVoice: 'en-us',
  rate: 0.85,
  pitch: 1,
  autoSpeakWord: false,
}

const ESPEAK_VOICES = [
  { id: 'en-us', label: 'English (US)' },
  { id: 'en-gb', label: 'English (UK)' },
  { id: 'en', label: 'English (default)' },
]

export function espeakVoiceOptions() {
  return ESPEAK_VOICES
}

let lastSpoken = { text: '', extras: {} }
let keepAliveId = 0
let audioContext = null
let playingSource = null
let espeakPromise = null
let espeakError = ''

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function listEnglishVoices() {
  if (!speechSupported()) return []
  const voices = window.speechSynthesis.getVoices() || []
  const english = voices.filter((voice) => /^en(-|$)/i.test(voice.lang))
  return (english.length ? english : voices).map((voice) => ({
    voiceURI: voice.voiceURI,
    name: voice.name,
    lang: voice.lang,
    localService: voice.localService,
  }))
}

export function useSpeechVoices() {
  const [voices, setVoices] = useState(() => listEnglishVoices())

  useEffect(() => {
    if (!speechSupported()) return undefined
    const refresh = () => setVoices(listEnglishVoices())
    refresh()
    window.speechSynthesis.addEventListener('voiceschanged', refresh)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refresh)
    }
  }, [])

  return voices
}

function pickVoice(voiceURI) {
  const voices = window.speechSynthesis?.getVoices?.() || []
  if (voiceURI) {
    const match = voices.find((voice) => voice.voiceURI === voiceURI)
    if (match) return match
  }
  const english = voices.filter((voice) => /^en(-|$)/i.test(voice.lang))
  const preferred = english.find((voice) =>
    /google|natural|neural|aria|jenny|samantha|zira|female/i.test(voice.name),
  )
  return preferred || english[0] || voices[0] || null
}

function stopChromeKeepAlive() {
  if (keepAliveId) {
    window.clearInterval(keepAliveId)
    keepAliveId = 0
  }
}

function startChromeKeepAlive() {
  stopChromeKeepAlive()
  keepAliveId = window.setInterval(() => {
    if (!window.speechSynthesis?.speaking) {
      stopChromeKeepAlive()
      return
    }
    window.speechSynthesis.pause()
    window.speechSynthesis.resume()
  }, 8000)
}

function getAudioContext() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioContext = new Ctx()
  }
  return audioContext
}

function stopEspeakAudio() {
  if (playingSource) {
    try {
      playingSource.stop()
    } catch {
      /* already stopped */
    }
    playingSource = null
  }
}

export function stopSpeaking() {
  stopChromeKeepAlive()
  window.speechSynthesis?.cancel()
  stopEspeakAudio()
}

function espeakDataUrl() {
  const base = import.meta.env.BASE_URL || './'
  return new URL('espeak-ng-data/', new URL(base, window.location.href)).href
}

export function getEspeakStatus() {
  return { error: espeakError, loading: Boolean(espeakPromise) && !espeakError }
}

export async function loadEspeak() {
  if (!espeakPromise) {
    espeakPromise = import('@spelling-creator/spellophone').then(
      ({ createEspeak }) =>
        createEspeak({
          dataUrl: espeakDataUrl(),
          languages: ['en'],
        }),
    )
  }
  try {
    const engine = await espeakPromise
    espeakError = ''
    return engine
  } catch (error) {
    espeakError = error?.message || 'Could not load eSpeak NG'
    espeakPromise = null
    throw error
  }
}

function mapEspeakRate(rate) {
  return Math.round(clamp(80 + Number(rate) * 140, 80, 280))
}

function mapEspeakPitch(pitch) {
  return Math.round(clamp(Number(pitch) * 50, 0, 99))
}

async function speakWithEspeak(text, settings, extras) {
  const engine = await loadEspeak()
  const ctx = getAudioContext()
  if (!ctx) throw new Error('Web Audio is not available')
  if (ctx.state === 'suspended') await ctx.resume()

  const { toFloat32 } = await import('@spelling-creator/spellophone')
  const result = engine.synthesize(text, {
    voice: extras.voice || settings.espeakVoice || 'en-us',
    rate: mapEspeakRate(extras.rate ?? settings.rate),
    pitch: mapEspeakPitch(extras.pitch ?? settings.pitch),
    wordGap: extras.wordGap ?? 8,
    endPause: true,
  })

  stopEspeakAudio()
  const buffer = ctx.createBuffer(1, result.samples.length, result.sampleRate)
  buffer.copyToChannel(toFloat32(result.samples), 0)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  playingSource = source
  source.onended = () => {
    if (playingSource === source) playingSource = null
  }
  source.start()
}

function speakWithBrowser(text, settings, extras) {
  if (!speechSupported()) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = clamp(Number(extras.rate ?? settings.rate ?? 0.85), 0.4, 1.4)
  utterance.pitch = clamp(Number(extras.pitch ?? settings.pitch ?? 1), 0.6, 1.6)
  const voice = pickVoice(extras.voiceURI || settings.voiceURI)
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang || 'en-US'
  }
  utterance.onend = () => stopChromeKeepAlive()
  utterance.onerror = () => stopChromeKeepAlive()
  window.speechSynthesis.speak(utterance)
  startChromeKeepAlive()
}

export function speak(text, settings = DEFAULT_SPEECH, extras = {}) {
  if (!text) return Promise.resolve()
  lastSpoken = { text, extras }
  stopSpeaking()
  const merged = { ...DEFAULT_SPEECH, ...settings }
  if ((extras.engine || merged.engine) === SPEECH_ENGINES.ESPEAK) {
    return speakWithEspeak(text, merged, extras).catch((error) => {
      espeakError = error?.message || 'eSpeak NG failed'
      speakWithBrowser(text, merged, extras)
    })
  }
  speakWithBrowser(text, merged, extras)
  return Promise.resolve()
}

export function speakLast(settings = DEFAULT_SPEECH) {
  if (!lastSpoken.text) return Promise.resolve()
  return speak(lastSpoken.text, settings, lastSpoken.extras)
}

export function speakSlowly(text, settings = DEFAULT_SPEECH, extras = {}) {
  const rate = clamp(Number(settings.rate || 0.85) * 0.62, 0.45, 0.8)
  return speak(text, settings, { ...extras, rate, wordGap: 18 })
}

export function primeVoices() {
  if (!speechSupported()) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.speechSynthesis.getVoices()
  })
}

export function displayWord(entry) {
  if (!entry) return ''
  if (entry.altSpellings?.length) {
    return [entry.word, ...entry.altSpellings].join(', ')
  }
  return entry.word
}

export function speakWordText(entry) {
  if (!entry) return ''
  if (entry.altSpellings?.length) {
    return `${entry.word}. Also spelled ${entry.altSpellings.join(', or ')}.`
  }
  return entry.word
}
