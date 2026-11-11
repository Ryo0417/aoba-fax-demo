import { useEffect, useState, type ReactNode } from 'react'
import { demoToday } from './demo-today'
import { createSeed } from './seed'
import type { DemoState, OrderLine } from './types'
import { DemoContext, type DemoContextValue } from './demo-context'

const STORAGE_KEY = `aoba-demo-${demoToday}`
const READ_DELAY_MS = 3000

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeed()
    const parsed = JSON.parse(raw) as DemoState
    if (!Array.isArray(parsed.faxes) || !Array.isArray(parsed.incoming)) return createSeed()
    return parsed
  } catch {
    return createSeed()
  }
}

function persist(state: DemoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadState)

  const processingIds = state.faxes
    .filter((fax) => fax.status === 'processing')
    .map((fax) => fax.id)
    .join(',')

  useEffect(() => {
    if (!processingIds) return
    const ids = new Set(processingIds.split(','))
    const timer = setTimeout(() => {
      setState((current) => {
        const next: DemoState = {
          ...current,
          faxes: current.faxes.map((fax) =>
            ids.has(fax.id) && fax.status === 'processing' ? { ...fax, status: 'needs_review' } : fax,
          ),
        }
        persist(next)
        return next
      })
    }, READ_DELAY_MS)
    return () => clearTimeout(timer)
  }, [processingIds])

  const commit = (recipe: (current: DemoState) => DemoState) => {
    setState((current) => {
      const next = recipe(current)
      persist(next)
      return next
    })
  }

  const value: DemoContextValue = {
    state,
    receiveNewFax: () => {
      if (state.incoming.length === 0) return false
      commit((current) => {
        const nextIncoming = current.incoming[0]
        if (!nextIncoming) return current
        return {
          ...current,
          faxes: [{ ...nextIncoming.fax, status: 'processing' }, ...current.faxes],
          lines: [...nextIncoming.lines, ...current.lines],
          incoming: current.incoming.slice(1),
        }
      })
      return true
    },
    saveFax: (faxId, customerId, lines) => {
      commit((current) => replaceFax(current, faxId, customerId, lines, false))
    },
    confirmFax: (faxId, customerId, lines) => {
      commit((current) => replaceFax(current, faxId, customerId, lines, true))
    },
    revertFax: (faxId) => {
      commit((current) => ({
        ...current,
        faxes: current.faxes.map((fax) =>
          fax.id === faxId ? { ...fax, status: 'needs_review', confirmedAt: undefined } : fax,
        ),
      }))
    },
    resetDemo: () => {
      const next = createSeed()
      persist(next)
      setState(next)
    },
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

function replaceFax(
  current: DemoState,
  faxId: string,
  customerId: string,
  lines: OrderLine[],
  confirm: boolean,
): DemoState {
  return {
    ...current,
    faxes: current.faxes.map((fax) => {
      if (fax.id !== faxId) return fax
      if (!confirm) return { ...fax, customerId }
      return {
        ...fax,
        customerId,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      }
    }),
    lines: [...lines.map((line) => ({ ...line, faxId })), ...current.lines.filter((line) => line.faxId !== faxId)],
  }
}
