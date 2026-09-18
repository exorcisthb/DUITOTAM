import { useEffect, useRef } from "react";
import * as THREE from "three";

export function SilkOrbit() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 7);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(1.45, 0.44, 220, 24, 2, 3);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d9d1bb"),
      roughness: 0.72,
      metalness: 0.02,
      sheen: 1,
      sheenColor: new THREE.Color("#f5efe2"),
      clearcoat: 0.08,
    });
    const textile = new THREE.Mesh(geometry, material);
    textile.rotation.set(0.35, -0.5, 0.15);
    scene.add(textile);

    const key = new THREE.DirectionalLight("#fff4df", 4.2);
    key.position.set(4, 5, 5);
    const fill = new THREE.DirectionalLight("#819078", 2.1);
    fill.position.set(-4, -2, 2);
    scene.add(key, fill, new THREE.AmbientLight("#f8f1e4", 1.2));

    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const move = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 0.5;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 0.35;
    };
    const render = () => {
      textile.rotation.y += reduced ? 0 : 0.0022;
      textile.rotation.x += (pointerY - textile.rotation.x) * 0.025;
      textile.rotation.z += (-pointerX - textile.rotation.z) * 0.025;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);
    render();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" aria-hidden="true" />;
}