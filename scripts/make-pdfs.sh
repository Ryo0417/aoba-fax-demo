#!/bin/bash
# pdf-src の注文書HTMLを、ヘッダーなしのA4 PDFにする。
# Chromeのヘッダーを出すとファイルパス（ユーザー名）が載るので、必ず消す。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$ROOT/public/pdfs"
mkdir -p "$OUT"

if [[ ! -x "$CHROME" ]]; then
  echo "Google Chrome が見つかりません: $CHROME" >&2
  exit 1
fi

for name in order-01 order-02 order-03; do
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-pdf-header-footer \
    --virtual-time-budget=12000 \
    --print-to-pdf="$OUT/$name.pdf" \
    "file://$ROOT/pdf-src/$name.html"
  echo "wrote $OUT/$name.pdf"
done
