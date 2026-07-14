import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/** The bust engraver. Real museum marble (photogrammetry, quantized GLB)
 *  rendered as an ink engraving: tone from a fixed north-west key light is
 *  translated into layered screen-space hatching, in the document's own ink
 *  on bare paper. On the ivory edition the ink is dark, so the hatch lives
 *  in the shadows; on the night edition the ink is light, so the engraving
 *  inverts into white-line work — strokes follow the LIGHT instead. No
 *  lighting realism, no material vanity: the point is that the plate looks
 *  PRINTED both ways.
 *
 *  Imported dynamically on first selection of a thinker who has marble.
 */

export type BustSpec = {
  file: string;
  rotation: [number, number, number];
  yaw: number;
  zoom: number;
  offsetY: number;
  /** extra ink for scans that read too pale at their framing */
  toneBias?: number;
};

const HATCH_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const HATCH_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uInk;
  uniform float uDpr;
  uniform float uFade;
  uniform float uToneBias;
  uniform float uLightInk; // 1 on the night edition: ink follows the light
  varying vec3 vN;
  varying vec3 vV;

  // a hatch line whose WIDTH carries the tone — the engraver's actual tool.
  // w in pixels; anti-aliased over ~1.2px.
  float hatch(vec2 p, float angle, float spacing, float w) {
    vec2 dir = vec2(cos(angle), sin(angle));
    float d = dot(p, vec2(-dir.y, dir.x));
    float dist = abs(fract(d / spacing) - 0.5) * spacing;
    return 1.0 - smoothstep(w * 0.5 - 0.6, w * 0.5 + 0.6, dist);
  }

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    if (dot(N, V) < 0.0) N = -N; // scanner meshes ship with mixed winding
    vec3 L = normalize(vec3(-0.3, 0.42, 0.86)); // NW, but mostly frontal
    float tone = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
    float rim = pow(1.0 - abs(dot(N, V)), 2.4);

    // ink strength: dark ink keys on shadow, light ink keys on light
    float k = mix(1.0 - tone, tone, uLightInk);
    k = clamp(k + rim * 0.18 + uToneBias, 0.0, 1.0);
    // remap the working band per mode: frontal light skews tone bright, so
    // the light-ink key needs a higher window for the face to span the
    // full stroke range instead of saturating
    float lo = mix(0.32, 0.58, uLightInk);
    float hi = mix(0.9, 0.985, uLightInk);
    k = smoothstep(lo, hi, k);

    vec2 sp = gl_FragCoord.xy / uDpr;
    // primary direction: thickness rides the tone from hairline to near-solid
    float ink = hatch(sp, 0.32, 5.5, k * 4.6);
    // cross direction joins only in the strongest third, thin to moderate
    float c = clamp((k - 0.62) / 0.38, 0.0, 1.0);
    ink = max(ink, hatch(sp, -0.88, 5.0, c * 3.2) * step(0.001, c));

    ink *= mix(0.92, 1.0, k); // faintest strokes sit lighter on the paper
    if (ink < 0.02) discard;
    gl_FragColor = vec4(uInk, ink * uFade);
  }
`;

const geometryCache = new Map<string, Promise<THREE.BufferGeometry>>();

function loadGeometry(file: string): Promise<THREE.BufferGeometry> {
  let p = geometryCache.get(file);
  if (!p) {
    p = new GLTFLoader().loadAsync(`/busts/${file}`).then((gltf) => {
      let geo: THREE.BufferGeometry | null = null;
      gltf.scene.traverse((o) => {
        if (!geo && (o as THREE.Mesh).isMesh) geo = (o as THREE.Mesh).geometry;
      });
      if (!geo) throw new Error(`no mesh in ${file}`);
      const g = geo as THREE.BufferGeometry;
      if (!g.getAttribute("normal")) g.computeVertexNormals();
      return g;
    });
    geometryCache.set(file, p);
  }
  return p;
}

export type BustController = {
  show: (spec: BustSpec) => void;
  setInk: (css: string) => void;
  dispose: () => void;
};

export function mountBust(
  container: HTMLElement,
  opts: { ink: string; reducedMotion: boolean },
): BustController | undefined {
  const canvas = document.createElement("canvas");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return undefined;
  }
  renderer.setClearColor(0x000000, 0);
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 10);
  camera.position.set(0, 0.1, 2.35);

  const ink = new THREE.Color(opts.ink);
  const dpr = Math.min(window.devicePixelRatio, 2);
  const inkIsLight = (c: THREE.Color) =>
    c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > 0.5 ? 1 : 0;
  const hatchMat = new THREE.ShaderMaterial({
    vertexShader: HATCH_VERT,
    fragmentShader: HATCH_FRAG,
    uniforms: {
      uInk: { value: ink },
      uDpr: { value: dpr },
      uFade: { value: 0 },
      uToneBias: { value: 0 },
      uLightInk: { value: inkIsLight(ink) },
    },
    transparent: true,
    side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  scene.add(group);

  let current: { spec: BustSpec; meshes: THREE.Mesh[] } | null = null;
  let reqSeq = 0;
  let targetYaw = 0;
  let yaw = 0;
  let fade = 0; // 0→1 after load
  let raf = 0;
  let visible = true;
  let disposed = false;
  let last = 0;

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;

    yaw += (targetYaw - yaw) * Math.min(1, dt * (opts.reducedMotion ? 30 : 3.2));
    if (current) {
      const [rx, ry, rz] = current.spec.rotation;
      group.rotation.set(rx, ry + yaw, rz);
      group.scale.setScalar(current.spec.zoom);
      group.position.y = current.spec.offsetY;
    }
    fade = Math.min(1, fade + dt * 2.2);
    hatchMat.uniforms.uFade.value = fade;

    renderer.render(scene, camera);
    const settling = Math.abs(targetYaw - yaw) > 0.002 || fade < 1;
    if (visible && settling && !disposed) raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (!raf && visible && !disposed) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  });
  io.observe(container);

  const ro = new ResizeObserver(() => {
    const r = container.getBoundingClientRect();
    if (r.width === 0) return;
    renderer.setPixelRatio(dpr);
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    wake();
  });
  ro.observe(container);

  return {
    show(spec) {
      const sameStone = current?.spec.file === spec.file;
      targetYaw = spec.yaw;
      hatchMat.uniforms.uToneBias.value = spec.toneBias ?? 0;
      if (sameStone) {
        current!.spec = spec;
        wake();
        return;
      }
      const req = ++reqSeq;
      loadGeometry(spec.file).then((geo) => {
        // a later selection may have overtaken this response
        if (disposed || req !== reqSeq) return;
        for (const m of current?.meshes ?? []) group.remove(m);
        const meshes = [new THREE.Mesh(geo, hatchMat)];
        for (const m of meshes) group.add(m);
        current = { spec, meshes };
        yaw = spec.yaw; // arrive already facing; only the herm turn animates
        fade = opts.reducedMotion ? 1 : 0;
        wake();
      });
    },
    setInk(css) {
      ink.set(css);
      hatchMat.uniforms.uLightInk.value = inkIsLight(ink);
      wake();
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      hatchMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
