import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import styles from './HelmetViewer.module.scss'
import type { HelmetViewerProps } from './HelmetViewer.types'

const DEG = Math.PI / 180
const MODEL_URL = '/models/Helmet.glb'

export function HelmetViewer({ yaw, pitch, roll }: HelmetViewerProps) {
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const rendererRef    = useRef<THREE.WebGLRenderer | null>(null)
  // pivotGroup is what we rotate — the GLB sits inside it
  const pivotRef       = useRef<THREE.Group | null>(null)
  const orientationRef = useRef({ yaw, pitch, roll })
  const rafRef         = useRef<number>(0)

  // Keep orientationRef in sync without re-running the setup effect
  useEffect(() => {
    orientationRef.current = { yaw, pitch, roll }
  }, [yaw, pitch, roll])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.outputColorSpace = THREE.SRGBColorSpace
    rendererRef.current = renderer

    // ── Scene ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()

    // ── Camera ────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      38,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0.4, 3.8)
    camera.lookAt(0, 0, 0)

    // ── Lighting ──────────────────────────────────────────────────────────
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(3, 4, 3)
    scene.add(key)

    const fill = new THREE.DirectionalLight(0x8899cc, 0.6)
    fill.position.set(-3, 1, 2)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0x4466ff, 0.8)
    rim.position.set(0, -2, -3)
    scene.add(rim)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    // ── Pivot group — THIS is what yaw/pitch/roll rotates ─────────────────
    // The GLB goes inside the pivot so its own transform is preserved.
    const pivot = new THREE.Group()
    pivot.rotation.order = 'YXZ'
    scene.add(pivot)
    pivotRef.current = pivot

    // ── Load GLB ──────────────────────────────────────────────────────────
    const loader = new GLTFLoader()
    loader.load(
      MODEL_URL,
      (gltf: GLTF) => {
        const model = gltf.scene

        // Centre the model on the pivot origin using its bounding box
        const box = new THREE.Box3().setFromObject(model)
        const centre = new THREE.Vector3()
        box.getCenter(centre)
        model.position.sub(centre)   // shift so bbox centre is at (0,0,0)

        // Optional: normalise scale so the model fills ~1 unit
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim > 0) model.scale.setScalar(1.6 / maxDim)

        pivot.add(model)
      },
      undefined,
      (error: unknown) => {
        console.error('Failed to load helmet GLB:', error)
      }
    )

    // ── Render loop ───────────────────────────────────────────────────────
    const renderLoop = () => {
      rafRef.current = requestAnimationFrame(renderLoop)

      const p = pivotRef.current
      if (p) {
        const { yaw: y, pitch: pi, roll: r } = orientationRef.current
        p.rotation.y = y  * DEG
        p.rotation.x = pi * DEG
        p.rotation.z = r  * DEG
      }

      renderer.render(scene, camera)
    }
    renderLoop()

    // ── Resize ────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      renderer.dispose()
    }
  }, [])

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}