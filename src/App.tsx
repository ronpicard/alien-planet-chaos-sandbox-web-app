import { useEffect, useRef, useState } from 'react'
import { createSandbox, type SandboxApi, type SandboxState, type Tool } from './game/engine'
import './App.css'

const INITIAL: SandboxState = {
  tool: 'bh',
  auto: false,
  gx: 0,
  gy: 1,
  rotating: false,
  speed: 1,
  speedSlider: 50,
}

const TOOLS: { id: Tool; label: string; hint: string; className: string }[] = [
  { id: 'bh', label: 'Black Hole', hint: '1', className: 'tool-bh' },
  { id: 'sun', label: 'Sun', hint: '2', className: 'tool-sun' },
  { id: 'bolt', label: 'Lightning', hint: '3', className: 'tool-bolt' },
  { id: 'tor', label: 'Tornado', hint: '4', className: 'tool-tor' },
  { id: 'wave', label: 'Tidal Wave', hint: '5', className: 'tool-wave' },
]

function formatSpeed(speed: number): string {
  return `${Math.round(speed * 10) / 10}×`
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<SandboxApi | null>(null)
  const [state, setState] = useState<SandboxState>(INITIAL)

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return

    const api = createSandbox(canvas, stage, setState)
    apiRef.current = api

    const ro = new ResizeObserver(() => api.resize())
    ro.observe(stage)

    return () => {
      ro.disconnect()
      api.destroy()
      apiRef.current = null
    }
  }, [])

  const api = () => apiRef.current

  return (
    <div className="app">
      <header className="hd">
        <h1>Alien Planet Chaos Sandbox</h1>
        <p>
          Click to unleash <b className="c-bh">black holes</b>, <b className="c-sun">suns</b>,{' '}
          <b className="c-bolt">lightning</b>, <b className="c-tor">tornadoes</b>, or{' '}
          <b className="c-wave">tidal waves</b> on a tiny alien world. <b className="c-auto">Auto</b>{' '}
          spawns all randomly. Use arrows or hold <b className="c-rot">T/R</b> to rotate gravity.
          Watch aliens, pets, hover cars, buildings & more react!
        </p>
      </header>

      <div className="stage" ref={stageRef}>
        <canvas id="cv" ref={canvasRef} />
      </div>

      <div className="row">
        <span className="lb">Tool:</span>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${t.className}${state.tool === t.id ? ' on' : ''}`}
            onClick={() => api()?.setTool(t.id)}
          >
            {t.label} <span className="hint">[{t.hint}]</span>
          </button>
        ))}
        <button
          type="button"
          className={`tool-auto${state.auto ? ' on' : ''}`}
          onClick={() => api()?.toggleAuto()}
        >
          Auto <span className="hint">[A]</span>
        </button>

        <div className="sp" />

        <span className="lb">Gravity:</span>
        <button
          type="button"
          className={`gb${!state.rotating && !state.gx && state.gy === -1 ? ' on' : ''}`}
          onClick={() => api()?.setGravity(0, -1)}
        >
          ↑
        </button>
        <button
          type="button"
          className={`gb${!state.rotating && !state.gx && state.gy === 1 ? ' on' : ''}`}
          onClick={() => api()?.setGravity(0, 1)}
        >
          ↓
        </button>
        <button
          type="button"
          className={`gb${!state.rotating && state.gx === -1 && !state.gy ? ' on' : ''}`}
          onClick={() => api()?.setGravity(-1, 0)}
        >
          ←
        </button>
        <button
          type="button"
          className={`gb${!state.rotating && state.gx === 1 && !state.gy ? ' on' : ''}`}
          onClick={() => api()?.setGravity(1, 0)}
        >
          →
        </button>
        <button
          type="button"
          className="gr"
          onMouseDown={() => api()?.setRotateDir(-1)}
          onMouseUp={() => api()?.setRotateDir(0)}
          onMouseLeave={() => api()?.setRotateDir(0)}
          onTouchStart={(e) => {
            e.preventDefault()
            api()?.setRotateDir(-1)
          }}
          onTouchEnd={() => api()?.setRotateDir(0)}
        >
          ↺T
        </button>
        <button
          type="button"
          className="gr"
          onMouseDown={() => api()?.setRotateDir(1)}
          onMouseUp={() => api()?.setRotateDir(0)}
          onMouseLeave={() => api()?.setRotateDir(0)}
          onTouchStart={(e) => {
            e.preventDefault()
            api()?.setRotateDir(1)
          }}
          onTouchEnd={() => api()?.setRotateDir(0)}
        >
          ↻R
        </button>

        <div className="sp" />

        <div className="sl-wrap">
          <span className="lb">Speed:</span>
          <input
            type="range"
            min={1}
            max={100}
            value={state.speedSlider}
            style={{ ['--pct' as string]: `${state.speedSlider}%` }}
            onChange={(e) => api()?.setSpeed(Number(e.target.value))}
          />
          <span className="sl-val">{formatSpeed(state.speed)}</span>
        </div>

        <div className="sp" />

        <button type="button" className="re" onClick={() => api()?.reset()}>
          Reset
        </button>
      </div>
    </div>
  )
}
