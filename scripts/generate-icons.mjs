import { Buffer } from 'node:buffer'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
// 生成品牌图标（PWA / apple-touch / favicon）。
// 图形与 public/icon.svg 保持一致：深蓝渐变圆角底 + 金色「王」字。
// 用法：node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const BASE = 512
const CORNER_RADIUS = 112
const SS = 4

const BG_FROM = [0x1B, 0x2A, 0x4A]
const BG_TO = [0x0B, 0x12, 0x20]
const GOLD_FROM = [0xF7, 0xDD, 0x8B]
const GOLD_TO = [0xD4, 0xA0, 0x17]

// 「王」字：三横一竖
const STROKES = [
  [120, 150, 392, 194],
  [120, 234, 392, 278],
  [120, 318, 392, 362],
  [234, 150, 278, 362],
]
const STROKE_RADIUS = 22

function insideRoundRect(px, py, x0, y0, x1, y1, r) {
  const cx = Math.min(Math.max(px, x0 + r), x1 - r)
  const cy = Math.min(Math.max(py, y0 + r), y1 - r)
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy <= r * r
}

function lerp(from, to, t) {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ]
}

function sample(px, py, rounded) {
  if (rounded && !insideRoundRect(px, py, 0, 0, BASE, BASE, CORNER_RADIUS))
    return [0, 0, 0, 0]

  const gold = STROKES.some(([x0, y0, x1, y1]) => insideRoundRect(px, py, x0, y0, x1, y1, STROKE_RADIUS))
  if (gold) {
    const t = Math.min(Math.max((py - STROKES[0][1]) / (STROKES[3][3] - STROKES[0][1]), 0), 1)
    return [...lerp(GOLD_FROM, GOLD_TO, t), 255]
  }

  const t = Math.min(Math.max((px + py) / (BASE * 2), 0), 1)
  return [...lerp(BG_FROM, BG_TO, t), 255]
}

function render(size, { rounded }) {
  const rgba = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let ar = 0
      let ag = 0
      let ab = 0
      let aa = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = ((x + (sx + 0.5) / SS) / size) * BASE
          const py = ((y + (sy + 0.5) / SS) / size) * BASE
          const [r, g, b, a] = sample(px, py, rounded)
          ar += r * a
          ag += g * a
          ab += b * a
          aa += a
        }
      }
      const offset = (y * size + x) * 4
      if (aa === 0) {
        rgba[offset] = rgba[offset + 1] = rgba[offset + 2] = rgba[offset + 3] = 0
      }
      else {
        rgba[offset] = Math.round(ar / aa)
        rgba[offset + 1] = Math.round(ag / aa)
        rgba[offset + 2] = Math.round(ab / aa)
        rgba[offset + 3] = Math.round(aa / (SS * SS))
      }
    }
  }
  return rgba
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++)
    c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (const byte of buf)
    c = CRC_TABLE[(c ^ byte) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, payload) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(payload.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), payload])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function encodeIco(png, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry[0] = size >= 256 ? 0 : size
  entry[1] = size >= 256 ? 0 : size
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(22, 12)
  return Buffer.concat([header, entry, png])
}

const targets = [
  { file: 'pwa-192x192.png', size: 192, rounded: true },
  { file: 'pwa-512x512.png', size: 512, rounded: true },
  { file: 'apple-touch-icon.png', size: 180, rounded: false },
  { file: 'maskable-icon.png', size: 512, rounded: false },
]

for (const { file, size, rounded } of targets) {
  writeFileSync(join(OUT_DIR, file), encodePng(size, render(size, { rounded })))
  console.log('wrote', file)
}

const faviconPng = encodePng(32, render(32, { rounded: true }))
writeFileSync(join(OUT_DIR, 'favicon.ico'), encodeIco(faviconPng, 32))
console.log('wrote favicon.ico')
