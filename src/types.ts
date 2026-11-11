export type FaxStatus = 'received' | 'processing' | 'needs_review' | 'confirmed'

export const FAX_STATUS_LABEL: Record<FaxStatus, string> = {
  received: '受信',
  processing: '処理中',
  needs_review: '確認待ち',
  confirmed: '確定済',
}

export type Customer = {
  id: string
  name: string
}

export type Item = {
  id: string
  name: string
  unit: string
}

export type FaxDocument = {
  id: string
  receivedAt: string
  originalFilename: string
  pdfUrl: string
  customerId: string
  status: FaxStatus
  confirmedAt?: string
}

export type OrderLine = {
  id: string
  faxId: string
  deliveryDate: string
  itemName: string
  quantity: string
  unit: string
  note: string
  needsReview: boolean
}

export type IncomingFax = {
  fax: FaxDocument
  lines: OrderLine[]
}

export type DemoState = {
  customers: Customer[]
  items: Item[]
  faxes: FaxDocument[]
  lines: OrderLine[]
  incoming: IncomingFax[]
}

export const UNITS = ['kg', '本', '玉', '個', '枚', '束', 'ケ', 'ケース', '房', '袋'] as const
