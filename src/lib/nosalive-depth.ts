import * as THREE from "three";
import { PLATE_W, PLATE_H, nodes } from "./nosalive-plate";

/** The fig. 0 depth layer for the NOS Alive plate. Same engine as the Porto
 *  plate's (plate-depth.ts): a transparent WebGL canvas over the SVG, an
 *  orthographic camera mapped 1:1 onto the plate's viewBox, and a whole-plate
 *  tilt toward the cursor.
 *
 *  What lifts is only the LIT bars — FR Eventos', the ones in the database.
 *  They rise off the paper as pins (a stem, an ink head, an amber ring) while
 *  the ghost bars stay flat on the map, drawn by the SVG. So the depth says the
 *  same thing the colour does: the platform's bars stand up off the plan; the
 *  other operators' lie flat on it.
 *
 *  Imported dynamically after the plate is in view, only on capable clients
 *  (fine pointer, ≥640px, motion allowed, WebGL). The SVG stays the record: its
 *  .plate-net layer (the lit nodes) fades under [data-plate-3d] and returns on
 *  cleanup. Verify on real hardware — headless Chrome reports pointer:fine
 *  false, so this never mounts in the automated browser.
 */

const PIN_Z = 18; // how high a lit bar stands above the paper
const SHADOW = { x: 2.5, y: 3.5 }; // ink-shadow cast, light from the northwest
const CSS_TILT = 2.2; // degrees, whole-plate CSS rotation
const GL_TILT = 1.35; // extra world rotation on top of the CSS tilt (parallax)
const INTRO_MS = 900;

const lit = nodes.filter((n) => n.lit);

const easePress = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 5);
};

function cssColor(name: string): THREE.Color {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return new THREE.Color(raw || "#191510");
}

type Intro = { start: number; dur: number; apply: (p: number) => void };

export function mountPlateDepth(
  stage: HTMLElement,
  opts: { skipIntro?: boolean } = {},
): (() => void) | undefined {
  const card = stage.firstElementChild as HTMLElement | null;
  if (!card) return undefined;

  const canvas = document.createElement("canvas");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return undefined; // no WebGL — the SVG engraving stands
  }
  renderer.setClearColor(0x000000, 0);

  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
  card.appendChild(canvas);

  const scene = new THREE.Scene();
  // top=0 / bottom=H maps world coords straight onto SVG viewBox coords
  const camera = new THREE.OrthographicCamera(0, PLATE_W, 0, PLATE_H, -400, 400);

  const world = new THREE.Group();
  world.position.set(PLATE_W / 2, PLATE_H / 2, 0);
  scene.add(world);
  const at = (x: number, y: number, z: number) =>
    new THREE.Vector3(x - PLATE_W / 2, y - PLATE_H / 2, z);

  // ---- materials (colors re-read on theme change) ----
  const ink = cssColor("--text");
  const amber = cssColor("--accent");
  const mats = {
    stem: new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.3 }),
    node: new THREE.MeshBasicMaterial({ color: ink }),
    amberRing: new THREE.MeshBasicMaterial({ color: amber, side: THREE.DoubleSide }),
    shadowDot: new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.12 }),
  };
  const inkMats = [mats.stem, mats.node, mats.shadowDot];
  const amberMats = [mats.amberRing];

  const intros: Intro[] = [];
  const disposables: { dispose(): void }[] = Object.values(mats);
  const track = <T extends { dispose(): void }>(g: T): T => {
    disposables.push(g);
    return g;
  };

  // ---- the lit bars: a stem from the paper up to an ink head in an amber ring ----
  const headGeo = track(new THREE.SphereGeometry(2.3, 12, 8));
  const ringGeo = track(new THREE.RingGeometry(5.8, 7, 28));
  const dotGeo = track(new THREE.CircleGeometry(2.2, 12));

  lit.forEach((n, i) => {
    const pin = new THREE.Group();
    pin.position.copy(at(n.x, n.y, 0));

    const stemGeo = track(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, PIN_Z),
      ]),
    );
    pin.add(new THREE.Line(stemGeo, mats.stem));

    const head = new THREE.Mesh(headGeo, mats.node);
    head.position.z = PIN_Z;
    pin.add(head);

    const ring = new THREE.Mesh(ringGeo, mats.amberRing);
    ring.position.z = PIN_Z;
    pin.add(ring);

    pin.scale.z = 0;
    intros.push({
      start: 120 + i * 45,
      dur: 420,
      apply: (p) => {
        pin.scale.z = p;
      },
    });
    world.add(pin);

    // its ink shadow, flat on the paper, offset from the northwest light
    const dot = new THREE.Mesh(dotGeo, mats.shadowDot);
    dot.position.copy(at(n.x + SHADOW.x, n.y + SHADOW.y, 0.4));
    world.add(dot);
  });

  // ---- theme: re-read the ink/amber vars when [data-theme] flips ----
  const themeObserver = new MutationObserver(() => {
    const nextInk = cssColor("--text");
    const nextAmber = cssColor("--accent");
    for (const m of inkMats) m.color.copy(nextInk);
    for (const m of amberMats) m.color.copy(nextAmber);
    wake();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // ---- tilt: the plate faces the cursor; pins overshoot for parallax ----
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  // wake() the loop on every move: unlike the Porto plate there is no perpetual
  // pulse keeping it alive, so once the intro settles the loop parks — and a
  // pointer move must restart it or the tilt never responds. It re-parks itself
  // when the damped tilt catches up to the cursor and stops.
  const onPointerMove = (ev: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    target.x = (ev.clientX - r.left) / r.width - 0.5;
    target.y = (ev.clientY - r.top) / r.height - 0.5;
    wake();
  };
  const onPointerLeave = () => {
    target.x = 0;
    target.y = 0;
    wake();
  };
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerleave", onPointerLeave);

  // ---- frame loop: runs only while the plate is on screen ----
  const introMs = opts.skipIntro ? 0 : INTRO_MS;
  if (opts.skipIntro) for (const it of intros) it.apply(1);
  const t0 = performance.now();
  let raf = 0;
  let visible = false;

  const frame = (now: number) => {
    raf = 0;
    const elapsed = now - t0;

    let animating = elapsed < introMs + 500;
    if (!opts.skipIntro) {
      for (const it of intros) {
        it.apply(easePress((elapsed - it.start) / it.dur));
      }
    }

    current.x += (target.x - current.x) * 0.08;
    current.y += (target.y - current.y) * 0.08;
    const rx = -current.y * CSS_TILT;
    const ry = current.x * CSS_TILT;
    card.style.transform = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
    world.rotation.x = THREE.MathUtils.degToRad(rx * GL_TILT);
    world.rotation.y = THREE.MathUtils.degToRad(ry * GL_TILT);
    if (
      Math.abs(target.x - current.x) > 0.001 ||
      Math.abs(target.y - current.y) > 0.001 ||
      Math.abs(current.x) > 0.001 ||
      Math.abs(current.y) > 0.001
    ) {
      animating = true;
    }

    renderer.render(scene, camera);
    if (visible && animating) raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  });
  io.observe(stage);

  const onVisibility = () => {
    if (document.visibilityState === "visible") wake();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const ro = new ResizeObserver(() => {
    const r = stage.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(r.width, r.height, false);
    wake();
  });
  ro.observe(stage);

  // hand the lit nodes over from the SVG to the depth layer
  stage.setAttribute("data-plate-3d", "");
  wake();

  return () => {
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    themeObserver.disconnect();
    stage.removeEventListener("pointermove", onPointerMove);
    stage.removeEventListener("pointerleave", onPointerLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    stage.removeAttribute("data-plate-3d"); // the SVG lit nodes return
    card.style.transform = "";
    for (const d of disposables) d.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
