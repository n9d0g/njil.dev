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

export function mountSkyline(root: HTMLElement, graph: ContributionGraph) {
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
		count === 0 ? 0.15 : 0.4 + (4 * Math.sqrt(count)) / max

	const renderer = new WebGLRenderer({ antialias: true, alpha: true })
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
	renderer.domElement.setAttribute('aria-hidden', 'true')
	renderer.domElement.classList.add('absolute', 'inset-0', 'cursor-grab')
	root.prepend(renderer.domElement)

	const scene = new Scene()
	scene.add(new AmbientLight('#ffffff', 1.2))
	const sun = new DirectionalLight('#ffffff', 2)
	sun.position.set(10, 20, 10)
	scene.add(sun)

	const geometry = new BoxGeometry(0.8, 1, 0.8).translate(0, 0.5, 0)
	const mesh = new InstancedMesh(
		geometry,
		new MeshStandardMaterial({ roughness: 0.6 }),
		days.length
	)
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

	// Wide canvases fit the whole year with a margin. Phone-sized ones show
	// about half of it, close enough to read, and spinning brings the rest round
	function resize() {
		const { clientWidth: width, clientHeight: height } = root
		renderer.setSize(width, height)
		camera.aspect = width / height
		const visibleWeeks = graph.weeks.length * (width < 640 ? 0.5 : 1.15)
		const halfWidth = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect
		camera.position
			.setFromSphericalCoords(visibleWeeks / 2 / halfWidth, POLAR_ANGLE, 0)
			.add(controls.target)
		camera.updateProjectionMatrix()
		controls.update()
	}
	new ResizeObserver(resize).observe(root)
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
	new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting
		if (visible) requestAnimationFrame(frame)
	}).observe(root)

	const start = performance.now()
	let rising = true
	function frame(now: number) {
		if (!visible) return
		if (rising) rising = placeColumns(reducedMotion ? Infinity : now - start)
		controls.update()
		renderer.render(scene, camera)
		requestAnimationFrame(frame)
	}
	requestAnimationFrame(frame)
}
