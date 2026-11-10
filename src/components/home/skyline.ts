import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	InstancedMesh,
	Matrix4,
	MeshStandardMaterial,
	PerspectiveCamera,
	Raycaster,
	Scene,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { ContributionDay, ContributionGraph } from '@lib/contributions'

// Tailwind slate-800, then blue-900 → blue-300, matching the flat fallback
const LEVEL_COLORS = ['#1e293b', '#1e3a8a', '#1d4ed8', '#3b82f6', '#93c5fd']
const HOVER_COLOR = new Color('#f8fafc')
const RISE_MS = 1200
const STAGGER_MS = 15
// Fixed tilt: the skyline only spins around, so vertical swipes still scroll
const POLAR_ANGLE = 1.15
const MAX_HEIGHT = 4.4
// How much of the canvas the plane may fill, in clip space, at its widest
const FRAME_FILL = { x: 0.98, y: 0.96 }

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

const label = ({ count, date }: ContributionDay) =>
	`${count} contribution${count === 1 ? '' : 's'} on ${new Date(
		`${date}T00:00:00Z`
	).toLocaleDateString('en-CA', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	})}`

export function mountSkyline(
	root: HTMLElement,
	graph: ContributionGraph,
	onReady: () => void
) {
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
	const tooltip = root.querySelector<HTMLElement>('[data-tooltip]')!

	const days = graph.weeks.flatMap((week, x) =>
		week.map((day) => ({
			day,
			x: x - graph.weeks.length / 2,
			z: new Date(`${day.date}T00:00:00Z`).getUTCDay() - 3,
			delay: x * STAGGER_MS,
		}))
	)
	// Square root keeps one huge day from flattening every other column
	const max = Math.sqrt(Math.max(1, ...days.map(({ day }) => day.count)))
	const heightOf = (count: number) =>
		count === 0 ? 0.15 : 0.4 + ((MAX_HEIGHT - 0.4) * Math.sqrt(count)) / max

	const renderer = new WebGLRenderer({ antialias: true, alpha: true })
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
	renderer.domElement.setAttribute('aria-hidden', 'true')
	renderer.domElement.classList.add(
		'absolute',
		'inset-0',
		'cursor-grab',
		'opacity-0'
	)
	if (!reducedMotion)
		renderer.domElement.classList.add('transition-opacity', 'duration-500')
	root.prepend(renderer.domElement)

	const scene = new Scene()
	scene.add(new AmbientLight('#ffffff', 1.2))
	const sun = new DirectionalLight('#ffffff', 2)
	sun.position.set(10, 20, 10)
	scene.add(sun)

	const geometry = new BoxGeometry(0.8, 1, 0.8).translate(0, 0.5, 0)
	const material = new MeshStandardMaterial({ roughness: 0.6 })
	const mesh = new InstancedMesh(geometry, material, days.length)
	days.forEach(({ day }, i) =>
		mesh.setColorAt(i, new Color(LEVEL_COLORS[day.level]))
	)
	scene.add(mesh)

	const camera = new PerspectiveCamera(35, 1, 0.1, 500)
	const controls = new OrbitControls(camera, renderer.domElement)
	controls.enableZoom = false
	controls.enablePan = false
	controls.enableDamping = true
	controls.minPolarAngle = controls.maxPolarAngle = POLAR_ANGLE
	controls.autoRotate = !reducedMotion
	controls.autoRotateSpeed = 0.6
	// OrbitControls sets touch-action: none, which would trap page scrolling
	renderer.domElement.style.touchAction = 'pan-y'

	controls.target.set(0, 1, 0)

	// The plane spins, so frame the cylinder it sweeps rather than the plane
	// itself: then no corner leaves the canvas at any angle
	const radius = Math.hypot(graph.weeks.length / 2 + 0.4, 3.4)
	const sweep = Array.from({ length: 64 }, (_, i) => {
		const angle = (i / 64) * Math.PI * 2
		const [x, z] = [Math.cos(angle) * radius, Math.sin(angle) * radius]
		return [new Vector3(x, 0, z), new Vector3(x, MAX_HEIGHT, z)]
	}).flat()
	const projected = new Vector3()
	const fits = (distance: number) => {
		camera.position
			.setFromSphericalCoords(distance, POLAR_ANGLE, 0)
			.add(controls.target)
		camera.lookAt(controls.target)
		camera.updateMatrixWorld()
		return sweep.every((point) => {
			projected.copy(point).project(camera)
			return (
				projected.z < 1 &&
				Math.abs(projected.x) <= FRAME_FILL.x &&
				Math.abs(projected.y) <= FRAME_FILL.y
			)
		})
	}

	function resize() {
		const { clientWidth: width, clientHeight: height } = root
		if (!width || !height) return
		renderer.setSize(width, height)
		camera.aspect = width / height
		camera.updateProjectionMatrix()
		// Closest camera distance that still fits the whole sweep. Search only
		// within the draw distance: past it nothing fits, which would send the
		// search the wrong way
		let [near, far] = [radius, camera.far / 2]
		for (let i = 0; i < 24; i++) {
			const mid = (near + far) / 2
			if (fits(mid)) far = mid
			else near = mid
		}
		fits(far)
		controls.update()
	}
	const resizeObserver = new ResizeObserver(resize)
	resizeObserver.observe(root)
	resize()

	const matrix = new Matrix4()
	function placeColumns(elapsed: number) {
		let rising = false
		days.forEach(({ day, x, z, delay }, i) => {
			const t = Math.min(1, Math.max(0, (elapsed - delay) / RISE_MS))
			if (t < 1) rising = true
			const height = heightOf(day.count) * easeOutCubic(t)
			mesh.setMatrixAt(
				i,
				matrix.makeScale(1, Math.max(height, 0.001), 1).setPosition(x, 0, z)
			)
		})
		mesh.instanceMatrix.needsUpdate = true
		return rising
	}

	let hovered: number | undefined
	const raycaster = new Raycaster()
	const pointer = new Vector2()
	renderer.domElement.addEventListener('pointermove', (event) => {
		const rect = renderer.domElement.getBoundingClientRect()
		pointer.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1
		)
		raycaster.setFromCamera(pointer, camera)
		const hit = raycaster.intersectObject(mesh)[0]?.instanceId

		if (hovered !== undefined)
			mesh.setColorAt(hovered, new Color(LEVEL_COLORS[days[hovered].day.level]))
		hovered = hit
		if (hit !== undefined) {
			mesh.setColorAt(hit, HOVER_COLOR)
			tooltip.textContent = label(days[hit].day)
			tooltip.style.left = `${event.clientX - rect.left + 12}px`
			tooltip.style.top = `${event.clientY - rect.top + 12}px`
		}
		tooltip.classList.toggle('hidden', hit === undefined)
		mesh.instanceColor!.needsUpdate = true
	})
	renderer.domElement.addEventListener('pointerleave', () => {
		if (hovered !== undefined)
			mesh.setColorAt(hovered, new Color(LEVEL_COLORS[days[hovered].day.level]))
		hovered = undefined
		mesh.instanceColor!.needsUpdate = true
		tooltip.classList.add('hidden')
	})
	controls.addEventListener('start', () =>
		renderer.domElement.classList.replace('cursor-grab', 'cursor-grabbing')
	)
	controls.addEventListener('end', () =>
		renderer.domElement.classList.replace('cursor-grabbing', 'cursor-grab')
	)

	// Only animate while the graph is on screen
	let visible = true
	const visibilityObserver = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting
		if (visible) requestAnimationFrame(frame)
	})
	visibilityObserver.observe(root)

	const start = performance.now()
	let rising = true
	let ready = false
	function frame(now: number) {
		if (!visible) return
		if (rising) rising = placeColumns(reducedMotion ? Infinity : now - start)
		controls.update()
		renderer.render(scene, camera)
		if (!ready) {
			ready = true
			renderer.domElement.classList.remove('opacity-0')
			onReady()
		}
		requestAnimationFrame(frame)
	}
	requestAnimationFrame(frame)

	// Browsers cap live WebGL contexts, so free this one when the page is left
	return function dispose() {
		visible = false
		resizeObserver.disconnect()
		visibilityObserver.disconnect()
		controls.dispose()
		geometry.dispose()
		material.dispose()
		mesh.dispose()
		renderer.dispose()
		renderer.forceContextLoss()
	}
}
