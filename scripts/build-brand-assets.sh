#!/bin/sh
# Regenerates the site icon set from public/brand/*.svg.
# Run by hand after changing a mark; the outputs are committed.
# Needs rsvg-convert (librsvg) and magick (ImageMagick) on PATH. Deliberately
# not an npm script: CI does not have these and does not need them.
set -eu

cd "$(dirname "$0")/.."

rsvg-convert -w 180 -h 180 public/brand/mark.svg       -o public/apple-touch-icon.png
rsvg-convert -w  32 -h  32 public/brand/mark.svg       -o public/favicon-32x32.png
rsvg-convert -w  16 -h  16 public/brand/mark-solid.svg -o public/favicon-16x16.png

magick public/favicon-16x16.png public/favicon-32x32.png public/favicon.ico

echo "brand assets rebuilt:"
ls -l public/apple-touch-icon.png public/favicon-32x32.png public/favicon-16x16.png public/favicon.ico
