export type Tool = 'bh' | 'sun' | 'bolt' | 'tor' | 'wave'

export type SandboxState = {
  tool: Tool
  auto: boolean
  gx: number
  gy: number
  rotating: boolean
  speed: number
  speedSlider: number
}

export type SandboxApi = {
  getState: () => SandboxState
  setTool: (tool: Tool) => void
  setGravity: (gx: number, gy: number) => void
  setAuto: (on: boolean) => void
  toggleAuto: () => void
  setSpeed: (slider: number) => void
  setRotateDir: (dir: -1 | 0 | 1) => void
  reset: () => void
  resize: () => void
  destroy: () => void
}

export function createSandbox(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  onChange?: (state: SandboxState) => void,
): SandboxApi
