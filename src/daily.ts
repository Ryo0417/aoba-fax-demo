import { addDays } from './format'
import { demoToday } from './demo-today'
import type { DemoState, OrderLine } from './types'

export const DEFAULT_DAILY_DATE = addDays(demoToday, 3)

export type DailyRow = {
  itemName: string
  unit: string
  qty: number
  notes: string[]
  needsReview: boolean
  confirmed: boolean
  faxId: string
}

export type CustomerBlock = {
  customerId: string
  customerName: string
  rows: DailyRow[]
}

function qtyOf(line: OrderLine): number {
  const qty = Number(line.quantity)
  return Number.isFinite(qty) ? qty : 0
}

export function deliveryDates(state: DemoState, includeDrafts: boolean): string[] {
  const faxById = new Map(state.faxes.map((fax) => [fax.id, fax]))
  const dates = new Set<string>()
  for (const line of state.lines) {
    const fax = faxById.get(line.faxId)
    if (!fax) continue
    if (fax.status === 'confirmed' || (includeDrafts && fax.status === 'needs_review')) {
      dates.add(line.deliveryDate)
    }
  }
  return [...dates].sort()
}

export function dailyView(state: DemoState, date: string, includeDrafts: boolean): CustomerBlock[] {
  const faxById = new Map(state.faxes.map((fax) => [fax.id, fax]))
  const customerById = new Map(state.customers.map((customer) => [customer.id, customer.name]))
  const blocks = new Map<string, CustomerBlock>()

  for (const line of state.lines) {
    if (line.deliveryDate !== date) continue
    const fax = faxById.get(line.faxId)
    if (!fax) continue
    const confirmed = fax.status === 'confirmed'
    if (!confirmed && !(includeDrafts && fax.status === 'needs_review')) continue

    const block = blocks.get(fax.customerId) ?? {
      customerId: fax.customerId,
      customerName: customerById.get(fax.customerId) ?? '（得意先未設定）',
      rows: [],
    }
    const key = `${line.itemName}\0${line.unit}`
    const existing = block.rows.find((row) => `${row.itemName}\0${row.unit}` === key)
    if (existing) {
      existing.qty += qtyOf(line)
      if (line.note.trim()) existing.notes.push(line.note.trim())
      existing.needsReview = existing.needsReview || line.needsReview
      existing.confirmed = existing.confirmed && confirmed
    } else {
      block.rows.push({
        itemName: line.itemName,
        unit: line.unit,
        qty: qtyOf(line),
        notes: line.note.trim() ? [line.note.trim()] : [],
        needsReview: line.needsReview,
        confirmed,
        faxId: fax.id,
      })
    }
    blocks.set(fax.customerId, block)
  }

  return state.customers
    .map((customer) => blocks.get(customer.id))
    .filter((block): block is CustomerBlock => Boolean(block))
}

export function itemTotals(blocks: CustomerBlock[]): DailyRow[] {
  const rows: DailyRow[] = []
  for (const block of blocks) {
    for (const row of block.rows) {
      const existing = rows.find((item) => item.itemName === row.itemName && item.unit === row.unit)
      if (existing) {
        existing.qty += row.qty
        existing.notes.push(...row.notes)
        existing.needsReview = existing.needsReview || row.needsReview
        existing.confirmed = existing.confirmed && row.confirmed
      } else {
        rows.push({ ...row, notes: [...row.notes] })
      }
    }
  }
  return rows
}
