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
  varying vec3 vP;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vP = mv.xyz;
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
  uniform float uCamZ;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vP;

  // an engraver's line: anti-aliased by derivative, width carries the tone
  float lineAA(float coord, float spacing, float w) {
    float d = abs(fract(coord / spacing) - 0.5) * spacing;
    float aa = fwidth(coord) * 0.9 + 0.4;
    return 1.0 - smoothstep(w * 0.5 - aa, w * 0.5 + aa, d);
  }

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    if (dot(N, V) < 0.0) N = -N; // scanner meshes ship with mixed winding
    vec3 L = normalize(vec3(-0.3, 0.42, 0.86)); // NW, but mostly frontal
    float tone = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
    float rim = pow(1.0 - abs(dot(N, V)), 2.4);

    // ink strength: dark ink keys on shadow, light ink keys on light,
    // remapped per mode because frontal light skews the tone bright
    float k = mix(1.0 - tone, tone, uLightInk);
    k = clamp(k + rim * 0.12 + uToneBias, 0.0, 1.0);
    float lo = mix(0.3, 0.56, uLightInk);
    float hi = mix(0.9, 0.985, uLightInk);
    k = smoothstep(lo, hi, k);

    // banknote-style displacement: the surface relief bends the line work.
    // vP.z sits at -uCamZ on the focal plane; nearer surface pushes the
    // lines up, hollows pull them down — the strokes wrap the face.
    float relief = vP.z + uCamZ;
    vec2 sp = gl_FragCoord.xy / uDpr;
    float coord = sp.y + sp.x * 0.055 + relief * 30.0 + N.x * 2.4;
    float ink = lineAA(coord, 6.0, k * 5.1);

    // a second, finer family joins only in the strongest third
    float c = clamp((k - 0.66) / 0.34, 0.0, 1.0);
    float coord2 = sp.x - sp.y * 0.1 - relief * 22.0;
    ink = max(ink, lineAA(coord2, 5.0, c * 2.8) * step(0.002, c));

    // the silhouette is drawn, as an engraver would close the figure
    float edge = 1.0 - smoothstep(0.08, 0.2, abs(dot(N, V)));
    ink = max(ink, edge * 0.85);

    ink *= mix(0.9, 1.0, k);
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
      uCamZ: { value: 2.35 },
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
