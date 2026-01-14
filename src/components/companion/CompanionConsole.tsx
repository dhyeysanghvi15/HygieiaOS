import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, Trash2 } from 'lucide-react'
import { GlassPanel } from '../common/GlassPanel'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { useCompanionStore } from '../../features/companion/store'
import { runCompanionAction } from '../../features/companion/tools'
import { ChatThread } from './ChatThread'
import { InputBar } from './InputBar'
import { VoiceOverlay } from './VoiceOverlay'
import { useCompanionUIStore } from '../../features/companion/uiStore'
import { companionRespond, companionRespondWithSmart } from '../../features/companion/engine'
import { useSettingsStore } from '../../features/settings/store'
import type { CompanionAction } from '../../features/companion/types'
import { vaultPut } from '../../features/vault/storage'

type SpeechRecognitionCtor = new () => SpeechRecognitionLike
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionResultLike = { transcript: string }
type SpeechRecognitionResultListLike = ArrayLike<SpeechRecognitionResultLike>
type SpeechRecognitionEventLike = { resultIndex: number; results: ArrayLike<SpeechRecognitionResultListLike> }
type SpeechRecognitionErrorEventLike = { error?: string }

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function CompanionConsole({ compactHeader }: { compactHeader?: boolean }) {
  const navigate = useNavigate()
  const messages = useCompanionStore((s) => s.messages)
  const addUser = useCompanionStore((s) => s.addUser)
  const addAssistant = useCompanionStore((s) => s.addAssistant)
  const clear = useCompanionStore((s) => s.clear)
  const { companionMode, set, whisperMode, ttsEnabled, liveWebMode } = useSettingsStore()
  const saveVoice = useSettingsStore((s) => s.storage.saveVoiceTranscripts)
  const setListening = useCompanionUIStore((s) => s.setListening)

  const [text, setText] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const [voiceOpen, setVoiceOpen] = React.useState(false)
  const [voiceListening, setVoiceListening] = React.useState(false)
  const [voiceError, setVoiceError] = React.useState<string | null>(null)
  const [transcript, setTranscript] = React.useState('')
  const recRef = React.useRef<SpeechRecognitionLike | null>(null)
  const voiceAvailable = !!getSpeechRecognitionCtor()

  const speak = React.useCallback(
    (utterance: string) => {
      if (whisperMode || !ttsEnabled) return
      if (!('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(utterance)
      u.rate = 1
      u.pitch = 1
      u.volume = 1
      window.speechSynthesis.speak(u)
    },
    [ttsEnabled, whisperMode],
  )

  React.useEffect(() => {
    if (!messages.length) return
    const last = messages[messages.length - 1]
    if (last.role !== 'assistant') return
    speak(last.payload.text)
  }, [messages, speak])

  function onRunAction(action: CompanionAction) {
    runCompanionAction(action, navigate)
  }

  async function sendMessage(raw: string) {
    const input = raw.trim()
    if (!input) return
    setBusy(true)
    addUser(input)
    setText('')
    try {
      const payload =
        companionMode === 'smart' ? await companionRespondWithSmart(input) : await companionRespond(input)
      addAssistant(payload)
    } finally {
      setBusy(false)
    }
  }

  function startVoice() {
    if (!voiceAvailable) return
    setVoiceError(null)
    setTranscript('')
    setVoiceOpen(true)
    setVoiceListening(true)
    setListening(true)

    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = navigator.language || 'en-US'
    rec.interimResults = true
    rec.continuous = false
    rec.onresult = (e) => {
      const parts: string[] = []
      for (let i = e.resultIndex; i < e.results.length; i++) parts.push(e.results[i][0].transcript)
      setTranscript(parts.join(' ').trim())
    }
    rec.onerror = (e) => {
      setVoiceError(e?.error ?? 'Voice error')
      setVoiceListening(false)
      setListening(false)
    }
    rec.onend = () => {
      setVoiceListening(false)
      setListening(false)
    }
    recRef.current = rec
    try {
      rec.start()
    } catch {
      setVoiceError('Unable to start voice in this browser session.')
      setVoiceListening(false)
      setListening(false)
    }
  }

  function stopVoice() {
    try {
      recRef.current?.stop?.()
    } catch {
      // ignore
    }
    setVoiceListening(false)
    setListening(false)
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <GlassPanel density="compact" className={compactHeader ? 'px-4 py-3' : 'px-5 py-4'}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white/80" />
            <div>
              <div className="text-sm font-semibold">Companion Console</div>
              <div className="text-xs text-white/60">
                Mode: <span className="font-semibold">{companionMode.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>Smart</span>
              <Switch
                checked={companionMode === 'smart'}
                onCheckedChange={(v) => set('companionMode', v ? 'smart' : 'core')}
                aria-label="Toggle smart mode"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>Whisper</span>
              <Switch
                checked={whisperMode}
                onCheckedChange={(v) => set('whisperMode', v)}
                aria-label="Toggle whisper mode"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>Live Web</span>
              <Switch
                checked={liveWebMode}
                onCheckedChange={(v) => set('liveWebMode', v)}
                aria-label="Toggle live web mode"
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/vault')}
              aria-label="Open privacy cockpit"
            >
              <Shield className="h-4 w-4" /> Vault
            </Button>
            <Button variant="ghost" onClick={() => clear()} aria-label="Clear chat">
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
          </div>
        </div>
      </GlassPanel>

      <div className="glass flex-1 rounded-2xl">
        <ChatThread messages={messages} whisperMode={whisperMode} onRunAction={onRunAction} />
      </div>

      <GlassPanel density="compact" className="p-3 sm:p-4">
        <InputBar
          value={text}
          onChange={setText}
          onSend={() => sendMessage(text)}
          onStartVoice={() => (voiceListening ? stopVoice() : startVoice())}
          voiceAvailable={voiceAvailable}
          busy={busy}
        />
      </GlassPanel>

      <AnimatePresence>
        {voiceOpen ? (
          <VoiceOverlay
            open={voiceOpen}
            transcript={transcript}
            setTranscript={setTranscript}
            listening={voiceListening}
            sttAvailable={voiceAvailable}
            error={voiceError}
            onCancel={() => {
              stopVoice()
              setVoiceOpen(false)
            }}
            onSend={() => {
              stopVoice()
              setVoiceOpen(false)
              if (saveVoice) void vaultPut('voice', { createdAt: Date.now(), transcript })
              void sendMessage(transcript)
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
