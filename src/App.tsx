import { ThrottleBrakeChart } from './components/ThrottleBrakeChart'
import { SpeedChart } from './components/SpeedChart'
import './styles/global.scss'
import './App.scss'

function App() {
  return (
    <div className="app">

      {/* ── Scanline overlay ── */}
      <div className="app__scanlines" aria-hidden="true" />
      <div className="app__grid" aria-hidden="true" />

      {/* ── HUD Header ── */}
      <header className="hud">
        <div className="hud__left">
          <span className="hud__session">RACE SESSION</span>
        </div>
        <div className="hud__center">
          <span className="hud__title">PERFORMANCE</span>
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

      {/* ── Driver strip ── */}
      <div className="driver-strip">
        <div className="driver-strip__number">44</div>
        <div className="driver-strip__info">
          <span className="driver-strip__name">L. HAMILTON</span>
        </div>
        <div className="driver-strip__badges">
          <span className="badge badge--pos">P3</span>
          <span className="badge badge--gap">+4.2s</span>
          <span className="badge badge--tire tire--medium">H</span>
        </div>
      </div>

      {/* ── Charts ── */}
      <main className="dashboard">
        <section className="panel">
          <div className="panel__label">Acceleration</div>
          <ThrottleBrakeChart
            throttlePercent={60}
            brakePercent={40}
            throttleSpikes={40}
            brakeSpikes={30}
          />
        </section>

        <section className="panel">
          <div className="panel__label">SPEED</div>
          <SpeedChart avgSpeed={55} maxSpeed={120} />
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="app__footer">
        <span>PERF ANALYTICS v2.4.1</span>
        <span className="footer__sep" />
        <span>DATA INTERVAL: 50ms</span>
        <span className="footer__sep" />
        <span>ECU SYNC: ✓</span>
      </footer>
    </div>
  )
}

export default App