// Speed colour scale: slow = teal/cyan, fast = amber/red
// ratio is 0 (slowest) → 1 (fastest)

const STOPS: Array<{ ratio: number; r: number; g: number; b: number }> = [
  { ratio: 0.00, r: 32,  g: 178, b: 170 }, // teal
  { ratio: 0.33, r: 51,  g: 204, b: 204 }, // cyan
  { ratio: 0.66, r: 255, b: 165, g: 0   }, // orange
  { ratio: 1.00, r: 220, g: 50,  b: 50  }, // red
]

export function speedColorAtRatio(ratio: number): string {
  const clamped = Math.max(0, Math.min(1, ratio))

  // find surrounding stops
  let lo = STOPS[0]!
  let hi = STOPS[STOPS.length - 1]!

  for (let i = 0; i < STOPS.length - 1; i++) {
    if (clamped <= STOPS[i + 1]!.ratio) {
      lo = STOPS[i]!
      hi = STOPS[i + 1]!
      break
    }
  }

  const span = hi.ratio - lo.ratio
  const t    = span === 0 ? 0 : (clamped - lo.ratio) / span

  const r = Math.round(lo.r + (hi.r - lo.r) * t)
  const g = Math.round(lo.g + (hi.g - lo.g) * t)
  const b = Math.round(lo.b + (hi.b - lo.b) * t)

  return `rgb(${r},${g},${b})`
}

// CSS gradient string for the legend bar
export const SPEED_COLOR_GRADIENT_CSS = `linear-gradient(to right, ${
  STOPS.map(s => `rgb(${s.r},${s.g},${s.b}) ${s.ratio * 100}%`).join(', ')
})`