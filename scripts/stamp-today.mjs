import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date())

const dateFile = join(root, 'src/demo-today.ts')
const previous = readFileSync(dateFile, 'utf8').includes(`'${today}'`)
writeFileSync(
  dateFile,
  `/** npm run dev を実行した日（日本時間）。scripts/stamp-today.mjs が上書きする。 */\nexport const demoToday = '${today}'\n`,
)

const orders = [
  ['order-01', 0, 2],
  ['order-02', -1, 3],
  ['order-03', 0, 4],
  ['order-04', 0, 3],
  ['order-05', 0, 5],
  ['order-06', 0, 5],
  ['order-07', 0, 6],
]

if (previous && process.argv[2] !== '--force') {
  console.log(`FAXの日付はすでに ${today} です`)
  process.exit(0)
}

mkdirSync(join(root, 'public/pdfs'), { recursive: true })
mkdirSync(join(root, 'pdf-src/.generated'), { recursive: true })

for (const [name, orderOffset, deliveryOffset] of orders) {
  const html = readFileSync(join(root, 'pdf-src', `${name}.html`), 'utf8')
    .replaceAll('{{ORDER_DATE}}', label(addDays(today, orderOffset)))
    .replaceAll('{{DELIVERY_DATE}}', label(addDays(today, deliveryOffset)))
    .replace('href="order.css"', 'href="../order.css"')
  const generated = join(root, 'pdf-src/.generated', `${name}.html`)
  writeFileSync(generated, html)
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--virtual-time-budget=12000',
    `--print-to-pdf=${join(root, 'public/pdfs', `${name}.pdf`)}`,
    `file://${generated}`,
  ], { stdio: 'ignore' })
  console.log(`wrote ${name}.pdf`)
}

function addDays(isoDate, days) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function label(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${Number(year)}年${Number(month)}月${Number(day)}日`
}
