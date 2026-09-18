import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { applySingleQubit, describeStateWithPct, GATES, probabilities, toBloch } from "../../lib/simulator";
import type { CircuitOp, GateType, Complex } from "../../types";
import { Ket } from "../quantum/display";
import { Card } from "../ui";
import { useTheme } from "../../lib/theme";

const GATE_LABELS: Record<GateType, string> = {
  H: "Hadamard gate placed the qubit into an equal superposition of |0⟩ and |1⟩ — the state vector moved to the equator.",
  X: "X gate flipped the qubit: |0⟩ ↔ |1⟩ — a 180° rotation around the X axis.",
  Y: "Y gate rotated the qubit 180° around the Y axis.",
  Z: "Z gate flipped the phase of |1⟩ — a 180° rotation around the Z axis.",
  S: "S gate rotated the phase by 90° around the Z axis.",
  T: "T gate rotated the phase by 45° around the Z axis.",
  CNOT: "", SWAP: "", M: "",
};

const INITIAL: Complex[] = [{ re: 1, im: 0 }, { re: 0, im: 0 }];

function makeLabel(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 48;
  const ctx = canvas.getContext("2d")!;
  ctx.font = "bold 28px monospace";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 24);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.55, 0.21, 1);
  return sprite;
}

export function BlochSphere() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<Complex[]>(INITIAL);
  const [log, setLog] = useState<string[]>([]);
  const arrowRef = useRef<THREE.Group | null>(null);
  const targetDir = useRef(new THREE.Vector3(0, 1, 0));
  const { theme } = useTheme();

  // Build the scene once per theme (colors are baked into three.js materials).
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    // Renderer is transparent: the themed page background shows through.
    const wireColor = theme === "dark" ? 0xf0f1f4 : 0x16181d;
    const ringColor = theme === "dark" ? 0x4a4f60 : 0xcfd4dd;
    const arrowColor = theme === "dark" ? 0xc4b5fd : 0x6d28d9;
    const headColor = theme === "dark" ? 0xf0f1f4 : 0x16181d;
    const originColor = theme === "dark" ? 0x6e7482 : 0x838893;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(2.4, 1.8, 3.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.8;
    controls.maxDistance = 6;

    // sphere wireframe
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 28, 18),
      new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: theme === "dark" ? 0.1 : 0.14 })
    );
    scene.add(sphere);

    // equator + meridians hints
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.985, 1.015, 48),
      new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // axes
    const axisLen = 1.5;
    const axisMat = (c: number) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.75 });
    const makeAxis = (dir: THREE.Vector3, color: number, label: string, labelColor: string) => {
      const pts = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(axisLen)];
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), axisMat(color));
      scene.add(line);
      const l = makeLabel(label, labelColor);
      l.position.copy(dir.clone().multiplyScalar(axisLen + 0.22));
      scene.add(l);
    };
    makeAxis(new THREE.Vector3(1, 0, 0), 0xff6b6b, "+X", "#ff6b6b");
    makeAxis(new THREE.Vector3(-1, 0, 0), 0xff6b6b, "−X", "#ff6b6b");
    makeAxis(new THREE.Vector3(0, 1, 0), 0x34d399, "|0⟩", "#34d399");
    makeAxis(new THREE.Vector3(0, -1, 0), 0x34d399, "|1⟩", "#34d399");
    makeAxis(new THREE.Vector3(0, 0, 1), 0x818cf8, "+Y", "#818cf8");
    makeAxis(new THREE.Vector3(0, 0, -1), 0x818cf8, "−Y", "#818cf8");

    // state arrow group
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 1.5, 12),
      new THREE.MeshBasicMaterial({ color: arrowColor })
    );
    shaft.position.y = 0.75;
    const head = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.22, 16),
      new THREE.MeshBasicMaterial({ color: headColor })
    );
    head.position.y = 1.55;
    group.add(shaft, head);
    scene.add(group);
    arrowRef.current = group;

    // faint point at origin
    const origin = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: originColor }));
    scene.add(origin);

    const resize = () => {
      const w = mount.clientWidth;
      const h = Math.max(260, Math.min(420, w * 0.85));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    const up = new THREE.Vector3(0, 1, 0);
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const current = new THREE.Vector3(0, 1, 0);
      if (arrowRef.current) {
        arrowRef.current.getWorldDirection(current);
        current.lerp(targetDir.current, 0.08).normalize();
        arrowRef.current.quaternion.setFromUnitVectors(up, current);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [theme]);

  // update arrow target when state changes
  useEffect(() => {
    const b = toBloch(state);
    targetDir.current.set(b.x, b.z, b.y).normalize();
  }, [state]);

  const apply = (gate: GateType) => {
    const op: CircuitOp = { id: crypto.randomUUID(), gate, qubits: [0], col: 0 };
    setState((s) => applySingleQubit(s, GATES[gate], 0));
    const msg = GATE_LABELS[gate];
    if (msg) setLog((l) => [msg, ...l].slice(0, 3));
  };

  const reset = () => {
    setState(INITIAL);
    setLog([]);
  };

  const probs = useMemo(() => probabilities(state), [state]);
  const b = toBloch(state);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Card className="p-5">
        <div ref={mountRef} className="w-full [&>canvas]:w-full" />
        <p className="mt-3 text-center text-xs text-ink-3">
          Drag to rotate · scroll to zoom · the arrow is the qubit's state
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {(["H", "X", "Y", "Z", "S", "T"] as GateType[]).map((g) => (
            <button
              key={g}
              onClick={() => apply(g)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-qx-violet/40 bg-qx-violet/10 font-mono text-sm font-bold text-qx-violet transition hover:bg-qx-violet/25"
            >
              {g}
            </button>
          ))}
          <button onClick={reset} className="rounded-xl border border-line bg-card2 px-4 text-sm text-ink-2 hover:bg-card2">
            Reset
          </button>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button onClick={() => setState([{ re: 1, im: 0 }, { re: 0, im: 0 }])} className="rounded-lg border border-line bg-card2 px-3 py-1.5 font-mono text-xs text-ink-2 hover:bg-card2"><Ket value={0} /></button>
          <button onClick={() => setState([{ re: 0, im: 0 }, { re: 1, im: 0 }])} className="rounded-lg border border-line bg-card2 px-3 py-1.5 font-mono text-xs text-ink-2 hover:bg-card2"><Ket value={1} /></button>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="font-semibold text-ink">State</h3>
          <p className="mt-2 font-mono text-lg text-qx-cyan">{describeStateWithPct(state, 1)}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-xs">
            <div className="rounded-lg bg-card2/70 p-2"><p className="text-rose-400">x</p><p className="text-ink">{b.x.toFixed(2)}</p></div>
            <div className="rounded-lg bg-card2/70 p-2"><p className="text-qx-mint">y</p><p className="text-ink">{b.y.toFixed(2)}</p></div>
            <div className="rounded-lg bg-card2/70 p-2"><p className="text-qx-indigo">z</p><p className="text-ink">{b.z.toFixed(2)}</p></div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 font-mono text-sm">
            <span className="text-qx-violet"><Ket value={0} /> {Math.round(probs[0] * 100)}%</span>
            <span className="text-qx-cyan"><Ket value={1} /> {Math.round(probs[1] * 100)}%</span>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-ink">What just happened?</h3>
          {log.length === 0 ? (
            <p className="mt-2 text-sm text-ink-3">
              The qubit starts at the north pole (<Ket value={0} />). Apply gates to rotate it, or jump to <Ket value={1} />.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {log.map((m, i) => (
                <li key={i} className="text-sm text-ink-2">{i === 0 ? "→ " : ""}{m}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}