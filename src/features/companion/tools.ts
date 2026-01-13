import type { CompanionAction } from './types'
import { useTimersStore } from '../timers/timers'
import { useCheckinsStore } from '../checkins/store'

export function runCompanionAction(action: CompanionAction, navigate: (to: string) => void) {
  if (action.kind === 'start_timer') {
    useTimersStore.getState().startPreset(action.timer)
    return
  }
  if (action.kind === 'log_water') {
    useCheckinsStore.getState().addWater(action.ml)
    return
  }
  if (action.kind === 'open_tools') {
    navigate('/tools')
    return
  }
  if (action.kind === 'open_vault') {
    navigate('/vault')
    return
  }
  if (action.kind === 'copy_text') {
    navigator.clipboard.writeText(action.text).catch(() => {})
    return
  }
}

