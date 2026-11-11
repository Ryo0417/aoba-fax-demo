import type { DemoState } from './types'

/** 架空の得意先・品目・注文書。電話番号や住所は入れていません。 */
export function createSeed(): DemoState {
  return {
    customers: [
      { id: 'c1', name: 'みどり食堂' },
      { id: 'c2', name: 'ひかり給食センター' },
      { id: 'c3', name: 'さくら保育園' },
    ],
    items: [
      { id: 'i1', name: 'キャベツ', unit: 'kg' },
      { id: 'i2', name: 'にんじん', unit: 'kg' },
      { id: 'i3', name: '玉ねぎ', unit: 'kg' },
      { id: 'i4', name: 'じゃがいも', unit: 'kg' },
      { id: 'i5', name: 'トマト', unit: 'kg' },
      { id: 'i6', name: '大根', unit: '本' },
      { id: 'i7', name: '白菜', unit: '玉' },
      { id: 'i8', name: 'きゅうり', unit: 'kg' },
      { id: 'i9', name: 'レタス', unit: '玉' },
      { id: 'i10', name: 'りんご', unit: 'kg' },
    ],
    faxes: [
      {
        id: 'fax-001',
        receivedAt: '2026-11-07T08:12:00+09:00',
        originalFilename: 'FAX_1107_0812.pdf',
        pdfUrl: '/pdfs/order-01.pdf',
        customerId: 'c1',
        status: 'needs_review',
      },
      {
        id: 'fax-002',
        receivedAt: '2026-11-06T16:40:00+09:00',
        originalFilename: 'FAX_1106_1640.pdf',
        pdfUrl: '/pdfs/order-02.pdf',
        customerId: 'c2',
        status: 'confirmed',
        confirmedAt: '2026-11-06T17:05:00+09:00',
      },
    ],
    lines: [
      line('l1', 'fax-001', '2026-11-09', 'キャベツ', '10', 'kg', '', false),
      line('l2', 'fax-001', '2026-11-09', 'にんじん', '5', 'kg', '', false),
      line('l3', 'fax-001', '2026-11-09', '玉ねぎ', '8', 'kg', '', false),
      line('l4', 'fax-001', '2026-11-09', 'じゃがいも', '8', 'kg', '手書き。3にも見える', true),
      line('l5', 'fax-001', '2026-11-09', 'トマト', '2', 'kg', '手書きの追加行', true),
      line('l6', 'fax-002', '2026-11-10', 'キャベツ', '20', 'kg', '', false),
      line('l7', 'fax-002', '2026-11-10', 'にんじん', '15', 'kg', '', false),
      line('l8', 'fax-002', '2026-11-10', '大根', '10', '本', '', false),
      line('l9', 'fax-002', '2026-11-10', '白菜', '6', '玉', '', false),
    ],
    incoming: [
      {
        fax: {
          id: 'fax-003',
          receivedAt: '2026-11-07T09:48:00+09:00',
          originalFilename: 'FAX_1107_0948.pdf',
          pdfUrl: '/pdfs/order-03.pdf',
          customerId: 'c3',
          status: 'processing',
        },
        lines: [
          line('l10', 'fax-003', '2026-11-11', 'きゅうり', '4', 'kg', '', false),
          line('l11', 'fax-003', '2026-11-11', 'トマト', '3', 'kg', '', false),
          line('l12', 'fax-003', '2026-11-11', 'レタス', '2', '玉', '', false),
          line('l13', 'fax-003', '2026-11-11', 'りんご', '8', 'kg', '手書き。5にも見える', true),
        ],
      },
    ],
  }
}

function line(
  id: string,
  faxId: string,
  deliveryDate: string,
  itemName: string,
  quantity: string,
  unit: string,
  note: string,
  needsReview: boolean,
) {
  return { id, faxId, deliveryDate, itemName, quantity, unit, note, needsReview }
}
