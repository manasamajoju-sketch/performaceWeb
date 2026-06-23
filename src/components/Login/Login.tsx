import { useState, useRef } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'
import styles from './Login.module.scss'
import type { LoginProps } from './Login.types'
import { ThrottleBrakeChart } from '../ThrottleBrakeChart'
import { SpeedChart } from '../SpeedChart'

const PASSCODE_LENGTH = 6

// ─── Quin wordmark from real SVG assets ───────────────────────────────────────
// Native pixel measurements taken directly from the Figma export
// (Figma absolute positions, normalized to relative offsets):
//
//   q: 133.06 × 193.35   u: 184.88 × 130.48   n: 121.56 × 130.46   dot: 54.40 × 54.98
//
//   q, u, n all share the same TOP line — they are top-aligned, not
//   bottom-aligned. q's loop is almost exactly as tall as u/n; only its
//   stem/descender extends further down below the shared row.
//   (The previous version aligned u/n's BOTTOM to q's full descender,
//   which is why they sat too low relative to q.)
//
//   Gaps are not uniform: q→u ≈ 15.25px, u→n ≈ 18.94px.
//   The i-dot floats above the row with an ~8.5px gap, positioned over
//   the right upstroke of u (its left edge sits ~136.68px into u).
function QuinWordmark() {
  const qWidth = 133.06, qHeight = 193.35
  const uWidth = 184.88, uHeight = 130.48
  const nWidth = 121.56, nHeight = 130.46
  const dotWidth = 54.40, dotHeight = 54.98

  const gapQU = 15.25            // q → u
  const gapUN = 18.94            // u → n
  const dotGapAboveRow = 8.51    // gap between dot's bottom and the shared top line
  const dotLeftInU = 136.68      // dot's left edge, measured from u's own left edge

  const qX = 0
  const uX = qWidth + gapQU
  const nX = uX + uWidth + gapUN
  const totalWidth = nX + nWidth

  // q/u/n's shared top line, shifted down so the dot (the topmost element)
  // starts at y = 0 instead of needing a negative viewBox.
  const rowTop = dotGapAboveRow + dotHeight   // ≈ 63.49
  const totalHeight = rowTop + qHeight        // ≈ 256.84

  const iDotX = uX + dotLeftInU
  const iDotY = 0

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.quinSvg}
      aria-label="quin"
    >
      {/* q */}
      <g transform={`translate(${qX}, ${rowTop})`}>
        <path d="M66.5381 0C29.7913 0 0 30.1092 0 67.248C0 104.387 29.7913 134.496 66.5381 134.496C74.8398 134.496 84.014 132.417 91.0443 127.781V193.354H133.064V68.0165C133.064 67.7645 133.064 67.5126 133.064 67.2607C133.064 30.1218 103.272 0.0126103 66.5256 0.0126103L66.5381 0ZM65.6406 96.2486C50.022 96.2486 37.3576 83.449 37.3576 67.6638C37.3576 51.8785 50.022 39.0789 65.6406 39.0789C81.2592 39.0789 93.9237 51.8785 93.9237 67.6638C93.9237 83.449 81.2592 96.2486 65.6406 96.2486Z" fill="white"/>
      </g>

      {/* u */}
      <g transform={`translate(${uX}, ${rowTop})`}>
        <path d="M79.5515 0.0251821H142.425C165.872 0.0251821 184.881 19.2371 184.881 42.9339V47.9983V126.874H142.861V47.4188C142.861 44.6976 140.68 42.493 137.987 42.493H121.583V73.1439C121.583 104.803 94.3724 130.477 60.7917 130.477C27.2111 130.477 0 104.815 0 73.1439V0.0125911H42.0195V75.9911C42.0195 80.6901 44.3005 85.0868 48.1148 87.7576C63.2847 98.3651 79.5391 87.6316 79.5391 73.0683V0" fill="white"/>
      </g>

      {/* i dot — floats above the i-stem (right upstroke of u) */}
      <g transform={`translate(${iDotX}, ${iDotY})`}>
        <path d="M27.1986 54.9776C42.22 54.9776 54.3972 42.6704 54.3972 27.4888C54.3972 12.3071 42.22 0 27.1986 0C12.1772 0 0 12.3071 0 27.4888C0 42.6704 12.1772 54.9776 27.1986 54.9776Z" fill="white"/>
      </g>

      {/* n */}
      <g transform={`translate(${nX}, ${rowTop})`}>
        <path d="M60.7917 0C27.2235 0 0 25.6621 0 57.3334V130.465H42.0195V57.3964C42.0195 46.9275 50.4208 38.4365 60.7792 38.4365C71.1376 38.4365 79.5391 46.9275 79.5391 57.3964V130.465H121.559V57.3334C121.559 25.6747 94.3475 0 60.7668 0H60.7917Z" fill="white"/>
      </g>
    </svg>
  )
}

// ─── Brand panel (right side) ─────────────────────────────────────────────────
function BrandPanel() {
  return (
    <div className={styles.brand}>
      {/* INTELLIGENT SAFETY TECHNOLOGY — left edge */}
      <span className={styles.tagLeft}>Intelligent Safety Technology</span>

      {/* Logo: quin wordmark + PERFORMANCE */}
      <div className={styles.logoWrap}>
        <QuinWordmark />
        <p className={styles.performance}>PERFORMANCE</p>
      </div>

      {/* INTELLIGENT SAFETY TECHNOLOGY — right edge */}
      <span className={styles.tagRight}>Intelligent Safety Technology</span>
    </div>
  )
}

// ─── Login component ──────────────────────────────────────────────────────────
export function Login({ onLogin, onForgotCode }: LoginProps) {
  const [email, setEmail]     = useState('')
  const [passcode, setPasscode] = useState<string[]>(Array(PASSCODE_LENGTH).fill(''))
  const boxRefs = useRef<(HTMLInputElement | null)[]>([])

  const handlePasscodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const updated = [...passcode]
    updated[index] = digit
    setPasscode(updated)
    if (digit && index < PASSCODE_LENGTH - 1) boxRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) boxRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowLeft'  && index > 0)                    boxRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < PASSCODE_LENGTH - 1)  boxRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PASSCODE_LENGTH)
    const updated = Array(PASSCODE_LENGTH).fill('')
    pasted.split('').forEach((d, i) => { updated[i] = d })
    setPasscode(updated)
    boxRefs.current[Math.min(pasted.length, PASSCODE_LENGTH - 1)]?.focus()
  }

  const [view, setView] = useState<'login' | 'dashboard'>('login')

  const handleSubmit = () => {
    const code = passcode.join('')
    if (email && code.length === PASSCODE_LENGTH) {
      setView('dashboard')
      onLogin?.(email, code)
    }
  }

  if (view === 'dashboard') {
    return (
      <div className="app">
        <div className="app__scanlines" aria-hidden="true" />
        <div className="app__grid" aria-hidden="true" />

        <header className="hud">
          <div className="hud__left">
            <span className="hud__session">RACE SESSION</span>
            <span className="hud__divider" />
            <span className="hud__track">Circuit de Monaco</span>
          </div>
          <div className="hud__center">
            <span className="hud__title">TELEMETRY</span>
          </div>
          <div className="hud__right">
            <div className="hud__stat">
              <span className="hud__stat-value">32</span>
              <span className="hud__stat-label">LAPS</span>
            </div>
            <div className="hud__sep" />
            <div className="hud__stat">
              <span className="hud__stat-value live">LIVE</span>
              <span className="hud__stat-label">STATUS</span>
            </div>
          </div>
        </header>

        <div className="driver-strip">
          <div className="driver-strip__number">44</div>
          <div className="driver-strip__info">
            <span className="driver-strip__name">L. HAMILTON</span>
            <span className="driver-strip__team">Mercedes-AMG Petronas</span>
          </div>
          <div className="driver-strip__badges">
            <span className="badge badge--pos">P3</span>
            <span className="badge badge--gap">+4.2s</span>
            <span className="badge badge--tire tire--medium">M</span>
          </div>
        </div>

        <main className="dashboard">
          <section className="panel">
            <div className="panel__label">THROTTLE / BRAKE</div>
            <ThrottleBrakeChart
              throttlePercent={60}
              brakePercent={40}
              throttleSpikes={40}
              brakeSpikes={30}
            />
          </section>

          <section className="panel">
            <div className="panel__label">SPEED TRACE</div>
            <SpeedChart avgSpeed={55} maxSpeed={120} />
          </section>
        </main>

        <footer className="app__footer">
          <span>QUIN PERFORMANCE v2.4.1</span>
          <span className="footer__sep" />
          <span>DATA INTERVAL: 50ms</span>
          <span className="footer__sep" />
          <span>ECU SYNC: ✓</span>
        </footer>
      </div>
    )
  }

  return (
    <div className={styles.page}>

      {/* ── Left: login form ── */}
      <div className={styles.left}>
        <div className={styles.formWrap}>

          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Login with your Registered E-mail Id and passcode</p>

          <label className={styles.fieldLabel} htmlFor="email-input">Email ID</label>
          <input
            id="email-input"
            type="email"
            className={styles.input}
            placeholder="example@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />

          <div className={styles.passcodeSection}>
            <label className={styles.fieldLabel}>Passcode</label>
            <div className={styles.passcodeBoxes}>
              {passcode.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { boxRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  className={styles.passcodeBox}
                  onChange={e => handlePasscodeChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  autoComplete="one-time-code"
                  aria-label={`Passcode digit ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <span className={styles.forgotCode} onClick={onForgotCode} role="button" tabIndex={0}>
            Forgot Code?
          </span>

          <button className={styles.loginBtn} onClick={handleSubmit} type="button">
            Login
          </button>

          <p className={styles.terms}>
            By logging in, you agree to{' '}
            <a>Quin Performance Terms of Use</a>
            {' '}and{' '}
            <a>Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* ── Right: brand panel ── */}
      <BrandPanel />

    </div>
  )
}