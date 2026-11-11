import { addDays } from './format'
import { demoToday } from './demo-today'
import type { DemoState } from './types'

function on(offset: number) {
  return addDays(demoToday, offset)
}

function at(offset: number, time: string) {
  return `${on(offset)}T${time}+09:00`
}

function faxFile(offset: number, hm: string) {
  const [, month, day] = on(offset).split('-')
  return `FAX_${month}${day}_${hm}.pdf`
}

/** 得意先は架空。品目名は業務の品目マスタと同じ。電話番号や住所は入れていません。 */
export function createSeed(): DemoState {
  return {
    customers: [
      { id: 'c1', name: 'みどり食堂' },
      { id: 'c2', name: 'ひかり給食センター' },
      { id: 'c3', name: 'さくら保育園' },
      { id: 'c4', name: 'みなと病院' },
      { id: 'c5', name: 'きたまちレストラン' },
      { id: 'c6', name: 'ひがし小学校' },
      { id: 'c7', name: 'みなみカフェ' },
    ],
    items: MASTER_ITEMS,
    faxes: [
      {
        id: 'fax-001',
        receivedAt: at(0, '08:12:00'),
        originalFilename: faxFile(0, '0812'),
        pdfUrl: '/pdfs/order-01.pdf',
        customerId: 'c1',
        status: 'needs_review',
      },
      {
        id: 'fax-005',
        receivedAt: at(0, '08:40:00'),
        originalFilename: faxFile(0, '0840'),
        pdfUrl: '/pdfs/order-05.pdf',
        customerId: 'c5',
        status: 'needs_review',
      },
      {
        id: 'fax-006',
        receivedAt: at(0, '08:55:00'),
        originalFilename: faxFile(0, '0855'),
        pdfUrl: '/pdfs/order-06.pdf',
        customerId: 'c6',
        status: 'needs_review',
      },
      {
        id: 'fax-007',
        receivedAt: at(0, '09:05:00'),
        originalFilename: faxFile(0, '0905'),
        pdfUrl: '/pdfs/order-07.pdf',
        customerId: 'c7',
        status: 'needs_review',
      },
      {
        id: 'fax-002',
        receivedAt: at(-1, '16:40:00'),
        originalFilename: faxFile(-1, '1640'),
        pdfUrl: '/pdfs/order-02.pdf',
        customerId: 'c2',
        status: 'confirmed',
        confirmedAt: at(-1, '17:05:00'),
      },
      {
        id: 'fax-004',
        receivedAt: at(0, '07:20:00'),
        originalFilename: faxFile(0, '0720'),
        pdfUrl: '/pdfs/order-04.pdf',
        customerId: 'c4',
        status: 'confirmed',
        confirmedAt: at(0, '07:40:00'),
      },
    ],
    lines: [
      line('l1', 'fax-001', on(2), 'キャベツ', '10', 'kg', '', false),
      line('l2', 'fax-001', on(2), '人参', '5', 'kg', '', false),
      line('l3', 'fax-001', on(2), '玉ねぎ', '8', 'kg', '', false),
      line('l4', 'fax-001', on(2), 'じゃがいも', '8', 'kg', '手書き。3にも見える', true),
      line('l5', 'fax-001', on(2), 'トマト', '2', 'kg', '手書きの追加行', true),
      line('l18', 'fax-005', on(5), 'ピーマン', '4', 'kg', '', false),
      line('l19', 'fax-005', on(5), 'なす', '3', 'kg', '', false),
      line('l20', 'fax-005', on(5), 'もやし', '2', 'kg', '', false),
      line('l21', 'fax-005', on(5), '生姜', '2', 'kg', '手書き。1にも見える', true),
      line('l22', 'fax-006', on(5), 'キャベツ', '30', 'kg', '', false),
      line('l23', 'fax-006', on(5), '人参', '10', 'kg', '', false),
      line('l24', 'fax-006', on(5), '玉ねぎ', '12', 'kg', '', false),
      line('l25', 'fax-006', on(5), 'じゃがいも', '8', 'kg', '', false),
      line('l26', 'fax-006', on(5), '白菜', '8', '玉', '手書き。5にも見える', true),
      line('l27', 'fax-007', on(6), 'レタス', '4', 'kg', '', false),
      line('l28', 'fax-007', on(6), 'ミニトマト', '20', '個', '', false),
      line('l29', 'fax-007', on(6), '大葉', '30', '枚', '', false),
      line('l30', 'fax-007', on(6), 'レモン', '8', 'ケ', '手書き。5にも見える', true),
      line('l6', 'fax-002', on(3), 'キャベツ', '20', 'kg', '', false),
      line('l7', 'fax-002', on(3), '人参', '15', 'kg', '', false),
      line('l8', 'fax-002', on(3), '大根', '10', '本', '', false),
      line('l9', 'fax-002', on(3), '白菜', '6', '玉', '', false),
      line('l14', 'fax-004', on(3), 'キャベツ', '12', 'kg', '', false),
      line('l15', 'fax-004', on(3), '人参', '8', 'kg', '', false),
      line('l16', 'fax-004', on(3), 'ほうれん草', '3', 'kg', '', false),
      line('l17', 'fax-004', on(3), 'きゅうり', '2', 'kg', '', false),
    ],
    incoming: [
      {
        fax: {
          id: 'fax-003',
          receivedAt: at(0, '09:48:00'),
          originalFilename: faxFile(0, '0948'),
          pdfUrl: '/pdfs/order-03.pdf',
          customerId: 'c3',
          status: 'processing',
        },
        lines: [
          line('l10', 'fax-003', on(4), 'きゅうり', '4', 'kg', '', false),
          line('l11', 'fax-003', on(4), 'トマト', '3', 'kg', '', false),
          line('l12', 'fax-003', on(4), 'レタス', '2', '玉', '', false),
          line('l13', 'fax-003', on(4), 'りんご', '8', 'kg', '手書き。5にも見える', true),
        ],
      },
    ],
  }
}

/** 品目マスタの品名と既定単位。得意先名は入れていません。 */
const MASTER_ITEMS: DemoState['items'] = [
  ['じゃがいも', 'kg'],
  ['メークイン', 'kg'],
  ['さつまいも', 'kg'],
  ['里芋', 'kg'],
  ['人参', 'kg'],
  ['大根', 'kg'],
  ['ごぼう', 'kg'],
  ['玉ねぎ', 'kg'],
  ['むき玉ねぎ', 'kg'],
  ['ねぎ（めん用）', 'kg'],
  ['青ねぎ', 'kg'],
  ['白ねぎ', 'kg'],
  ['キャベツ', 'kg'],
  ['キャベツゆで', 'kg'],
  ['白菜', 'kg'],
  ['レタス', 'kg'],
  ['リーフレタス', 'kg'],
  ['ベビーリーフ', 'kg'],
  ['小松菜', 'kg'],
  ['ほうれん草', 'kg'],
  ['水菜', 'kg'],
  ['紅たで', 'kg'],
  ['ニラ', 'kg'],
  ['三つ葉', '束'],
  ['大葉', '枚'],
  ['貝割', 'P'],
  ['ピーマン', 'kg'],
  ['赤ピーマン（赤パプリカ）', 'kg'],
  ['黄ピーマン（黄パプリカ）', 'kg'],
  ['きゅうり', 'kg'],
  ['なす', 'kg'],
  ['トマト', 'kg'],
  ['ミニトマト', '個'],
  ['南瓜', 'kg'],
  ['もやし', 'kg'],
  ['しめじ', 'kg'],
  ['えのきたけ', 'kg'],
  ['エリンギ', 'kg'],
  ['生姜', 'kg'],
  ['みょうが', 'kg'],
  ['レモン', 'ケ'],
  ['ライム', 'コ'],
  ['米', '袋'],
  ['りんご', 'kg'],
].map(([name, unit], index) => ({ id: `i${index + 1}`, name, unit }))

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
