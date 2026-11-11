import { createContext, useContext } from 'react'
import type { DemoState, OrderLine } from './types'

export type DemoContextValue = {
  state: DemoState
  receiveNewFax: () => boolean
  saveFax: (faxId: string, customerId: string, lines: OrderLine[]) => void
  confirmFax: (faxId: string, customerId: string, lines: OrderLine[]) => void
  resetDemo: () => void
}

export const DemoContext = createContext<DemoContextValue | null>(null)

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
