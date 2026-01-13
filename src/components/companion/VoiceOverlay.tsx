import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

export function VoiceOverlay({
  open,
  transcript,
  setTranscript,
  listening,
  sttAvailable,
  error,
  onCancel,
  onSend,
}: {
  open: boolean
  transcript: string
  setTranscript: (t: string) => void
  listening: boolean
  sttAvailable: boolean
  error: string | null
  onCancel: () => void
  onSend: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onCancel() : null)}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Voice</DialogTitle>
          <DialogDescription>
            {sttAvailable
              ? listening
                ? 'Listening… speak naturally.'
                : 'Review the transcript before sending.'
              : 'Speech recognition is not available in this browser.'}
          </DialogDescription>
        </DialogHeader>
        {error ? <div className="mb-3 text-sm text-accent-warn">{error}</div> : null}
        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Transcript…"
          aria-label="Voice transcript"
        />
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={onSend} disabled={!transcript.trim()}>
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

