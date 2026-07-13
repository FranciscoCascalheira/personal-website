import * as THREE from "three";
import { PLATE_W, PLATE_H } from "./porto-plate";
import {
  companies,
  candidates,
  edges,
  nodeAt,
  sampleEdge,
  sampleTrace,
} from "./plate-network";

/** The fig. 0 depth layer. A transparent WebGL canvas is laid over the SVG
 *  engraving with an orthographic camera mapped 1:1 onto the plate's viewBox,
 *  so at rest every 3D element sits exactly where its flat twin was. The
 *  matching network is then lifted off the paper — pins with stems, wires
 *  arcing between them, ink shadows cast back onto the map — and the whole
 *  plate tilts toward the cursor. The system literally stands over the city.
 *
 *  This module is imported dynamically after LCP, only on capable clients
 *  (fine pointer, ≥640px, motion allowed, WebGL). The SVG stays the record:
 *  its network layer fades under [data-plate-3d] and returns on cleanup.
 */

const PIN_Z = 20; // node height above the paper
const ARC_Z = 12; // extra lift at mid-wire
const TRACE_Z = 46; // the route enters high and descends into the city
const SHADOW = { x: 2.5, y: 3.5 }; // ink-shadow cast, light from the northwest
const CSS_TILT = 2.2; // degrees, whole-plate CSS rotation
const GL_TILT = 1.35; // extra world rotation on top of the CSS tilt (parallax)
const INTRO_MS = 1150;

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

  // rotate the world around the plate's centre
  const world = new THREE.Group();
  world.position.set(PLATE_W / 2, PLATE_H / 2, 0);
  scene.add(world);
  const at = (x: number, y: number, z: number) =>
    new THREE.Vector3(x - PLATE_W / 2, y - PLATE_H / 2, z);

  // ---- materials (colors re-read on theme change) ----
  const ink = cssColor("--text");
  const amber = cssColor("--accent");
  const mats = {
    wire: new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.5 }),
    stem: new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.35 }),
    node: new THREE.MeshBasicMaterial({ color: ink }),
    square: new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.9 }),
    shadow: new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.1 }),
    shadowDot: new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.1 }),
    amberTube: new THREE.MeshBasicMaterial({ color: amber }),
    amberRing: new THREE.MeshBasicMaterial({ color: amber, side: THREE.DoubleSide }),
    pulse: new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: 0 }),
    trace: new THREE.LineDashedMaterial({
      color: ink,
      transparent: true,
      opacity: 0.5,
      dashSize: 3,
      gapSize: 4,
    }),
  };
  const inkMats = [mats.wire, mats.stem, mats.node, mats.square, mats.shadow, mats.shadowDot, mats.trace];
  const amberMats = [mats.amberTube, mats.amberRing, mats.pulse];

  const intros: Intro[] = [];
  const disposables: { dispose(): void }[] = Object.values(mats);
  const track = <T extends { dispose(): void }>(g: T): T => {
    disposables.push(g);
    return g;
  };

  // ---- wires: the network lifted to pin height, arcing at mid-span ----
  const edgePoints3D = (e: (typeof edges)[number]) =>
    sampleEdge(e.from, e.to, e.bend, 28).map((p, i, arr) => {
      const t = i / (arr.length - 1);
      return at(p.x, p.y, PIN_Z + Math.sin(t * Math.PI) * ARC_Z);
    });

  let amberCurve: THREE.CatmullRomCurve3 | null = null;
  edges.forEach((e, i) => {
    const pts = edgePoints3D(e);
    if (e.amber) {
      // the accepted match gets real body: a fine tube instead of a hairline
      amberCurve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(
        track(new THREE.TubeGeometry(amberCurve, 40, 0.85, 6)),
        mats.amberTube,
      );
      intros.push({
        start: 550 + i * 60,
        dur: 500,
        apply: (p) => {
          mats.amberTube.transparent = p < 1;
          mats.amberTube.opacity = p;
        },
      });
      world.add(tube);
    } else {
      const geo = track(new THREE.BufferGeometry().setFromPoints(pts));
      const line = new THREE.Line(geo, mats.wire);
      const total = pts.length;
      geo.setDrawRange(0, 0);
      intros.push({
        start: 380 + i * 60,
        dur: 480,
        apply: (p) => geo.setDrawRange(0, Math.round(p * total)),
      });
      world.add(line);
    }

    // its ink shadow, flat on the paper
    const flat = sampleEdge(e.from, e.to, e.bend, 28).map((p) =>
      at(p.x + SHADOW.x, p.y + SHADOW.y, 0.5),
    );
    const sGeo = track(new THREE.BufferGeometry().setFromPoints(flat));
    sGeo.setDrawRange(0, 0);
    intros.push({
      start: 380 + i * 60,
      dur: 480,
      apply: (p) => sGeo.setDrawRange(0, Math.round(p * flat.length)),
    });
    world.add(new THREE.Line(sGeo, mats.shadow));
  });

  // ---- pins: stem from the paper up to the mark ----
  const squareGeo = track(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.6, -2.6, 0),
      new THREE.Vector3(2.6, -2.6, 0),
      new THREE.Vector3(2.6, 2.6, 0),
      new THREE.Vector3(-2.6, 2.6, 0),
    ]),
  );
  const sphereGeo = track(new THREE.SphereGeometry(2.3, 12, 8));
  const dotGeo = track(new THREE.CircleGeometry(2, 10));

  [...candidates, ...companies].forEach((n, i) => {
    const isCompany = n.id.startsWith("c-");
    const pin = new THREE.Group();
    pin.position.copy(at(n.x, n.y, 0));

    const stemGeo = track(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, PIN_Z),
      ]),
    );
    pin.add(new THREE.Line(stemGeo, mats.stem));

    const mark = isCompany
      ? new THREE.LineLoop(squareGeo, mats.square)
      : new THREE.Mesh(sphereGeo, mats.node);
    mark.position.z = PIN_Z;
    pin.add(mark);

    pin.scale.z = 0;
    intros.push({
      start: 200 + i * 45,
      dur: 420,
      apply: (p) => {
        pin.scale.z = p;
      },
    });
    world.add(pin);

    const dot = new THREE.Mesh(dotGeo, mats.shadowDot);
    dot.position.copy(at(n.x + SHADOW.x, n.y + SHADOW.y, 0.4));
    world.add(dot);
  });

  // amber endpoint rings at pin height on the accepted match
  const ringGeo = track(new THREE.RingGeometry(3.1, 3.9, 24));
  for (const id of ["y-campanha", "c-cedofeita"]) {
    const n = nodeAt(id);
    const ring = new THREE.Mesh(ringGeo, mats.amberRing);
    ring.position.copy(at(n.x, n.y, PIN_Z + 0.5));
    ring.scale.setScalar(0);
    intros.push({
      start: 900,
      dur: 380,
      apply: (p) => ring.scale.setScalar(p),
    });
    world.add(ring);
  }

  // ---- the author's route: descends from the frame edge into FEUP ----
  const tracePts = sampleTrace(60).map((p, i, arr) => {
    const t = i / (arr.length - 1);
    return at(p.x, p.y, TRACE_Z * Math.pow(1 - t, 1.5));
  });
  const traceGeo = track(new THREE.BufferGeometry().setFromPoints(tracePts));
  const traceLine = new THREE.Line(traceGeo, mats.trace);
  traceLine.computeLineDistances();
  traceGeo.setDrawRange(0, 0);
  intros.push({
    start: 750,
    dur: 550,
    apply: (p) => traceGeo.setDrawRange(0, Math.round(p * tracePts.length)),
  });
  world.add(traceLine);

  // ---- the pulse: one application travelling the amber wire, like fig. 2 ----
  const pulseGeo = track(new THREE.SphereGeometry(1.7, 10, 8));
  const pulse = new THREE.Mesh(pulseGeo, mats.pulse);
  world.add(pulse);

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

  // ---- tilt: the plate faces the cursor; wires overshoot for parallax ----
  const target = { x: 0, y: 0 }; // normalised cursor, -0.5..0.5 from centre
  const current = { x: 0, y: 0 };
  const onPointerMove = (ev: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    target.x = (ev.clientX - r.left) / r.width - 0.5;
    target.y = (ev.clientY - r.top) / r.height - 0.5;
  };
  const onPointerLeave = () => {
    target.x = 0;
    target.y = 0;
  };
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerleave", onPointerLeave);

  // ---- frame loop: runs only while the plate is on screen ----
  // When the flat network's etch just played, replaying it in 3D would read
  // as a stutter — the SVG→GL crossfade is the whole handover instead.
  const introMs = opts.skipIntro ? 0 : INTRO_MS;
  if (opts.skipIntro) for (const it of intros) it.apply(1);
  const t0 = performance.now();
  let raf = 0;
  let visible = false;

  const frame = (now: number) => {
    raf = 0;
    const elapsed = now - t0;

    let animating = elapsed < introMs + 700;
    if (!opts.skipIntro) {
      for (const it of intros) {
        it.apply(easePress((elapsed - it.start) / it.dur));
      }
    }

    // damped tilt
    current.x += (target.x - current.x) * 0.08;
    current.y += (target.y - current.y) * 0.08;
    const rx = -current.y * CSS_TILT; // degrees
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

    // the travelling application, after the intro settles
    if (amberCurve && elapsed > introMs) {
      const u = ((elapsed - introMs) % 2600) / 2600;
      amberCurve.getPointAt(u, pulse.position);
      mats.pulse.opacity = Math.sin(u * Math.PI) * 0.9;
      animating = true; // pulse runs while visible; loop parks when scrolled away
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

  // keep the drawing buffer matched to the stage box
  const ro = new ResizeObserver(() => {
    const r = stage.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(r.width, r.height, false);
    wake();
  });
  ro.observe(stage);

  // hand the network over from the SVG to the depth layer
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
    stage.removeAttribute("data-plate-3d"); // the SVG network returns
    card.style.transform = "";
    for (const d of disposables) d.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
