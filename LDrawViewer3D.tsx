/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LDrawBrickItem } from '../types';
import { parseLDrawCode } from '../utils/ldrParser';
import { RotateCcw, RotateCw, Layers, Eye, Maximize2, Compass, Sparkles } from 'lucide-react';

interface LDrawViewer3DProps {
  ldrCode: string;
  modelName: string;
  onPartSelect?: (brick: LDrawBrickItem | null) => void;
}

// Convert LDraw stud dimensions to Three.js world units (1 stud = 20 LDraw units)
const STUD_UNIT = 20;
const BRICK_HEIGHT_UNIT = 24; // standard 1 brick height = 24 LDraw units (plates = 8 units)

export const LDrawViewer3D: React.FC<LDrawViewer3DProps> = ({
  ldrCode,
  modelName,
  onPartSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const bricksGroupRef = useRef<THREE.Group | null>(null);

  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [hoveredBrick, setHoveredBrick] = useState<LDrawBrickItem | null>(null);
  const [totalBricksCount, setTotalBricksCount] = useState<number>(0);

  // Parse LDraw code whenever it changes
  const { bricks } = React.useMemo(() => parseLDrawCode(ldrCode), [ldrCode]);

  useEffect(() => {
    setTotalBricksCount(bricks.length);
  }, [bricks]);

  // Setup Three.js scene, lights, and renderer
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.00085);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 5000);
    camera.position.set(220, 180, 260);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Append to DOM
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls (allows mouse rotate, zoom, pan, tilt)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI / 2 + 0.08; // prevent going below ground
    controls.minDistance = 40;
    controls.maxDistance = 1200;
    controls.target.set(0, 45, 0);
    controlsRef.current = controls;

    // Alpine / Luxury Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8e7, 1.8);
    dirLight.position.set(250, 400, 300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 50;
    dirLight.shadow.camera.far = 1000;
    const d = 240;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0003;
    scene.add(dirLight);

    // Notch & Stud Teal Fill Light
    const goldLight = new THREE.PointLight(0x00a896, 1.2, 800);
    goldLight.position.set(-200, -80, -200);
    scene.add(goldLight);

    // Notch & Stud Teal Accent Light (#00A896)
    const tealLight = new THREE.PointLight(0x00a896, 0.9, 800);
    tealLight.position.set(200, -50, -200);
    scene.add(tealLight);

    // Subtle Grid Floor
    const gridHelper = new THREE.GridHelper(500, 25, 0x00a896, 0x242428);
    gridHelper.position.y = -6;
    (gridHelper.material as THREE.Material).opacity = 0.22;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    // Studio Table Shadow Plane
    const shadowPlaneGeom = new THREE.PlaneGeometry(800, 800);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -5.8;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Group for Lego Bricks
    const bricksGroup = new THREE.Group();
    scene.add(bricksGroup);
    bricksGroupRef.current = bricksGroup;


    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        if (autoRotate) {
          controlsRef.current.autoRotate = true;
          controlsRef.current.autoRotateSpeed = 1.2;
        } else {
          controlsRef.current.autoRotate = false;
        }
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer with requestAnimationFrame debouncing to prevent ResizeObserver loop limit exceeded errors
    let resizeRafId: number | null = null;
    let lastWidth = 0;
    let lastHeight = 0;

    const handleResize = () => {
      if (resizeRafId !== null) return;
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        if (newWidth === 0 || newHeight === 0) return;
        if (newWidth === lastWidth && newHeight === lastHeight) return;
        lastWidth = newWidth;
        lastHeight = newHeight;
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      });
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Re-build 3D Brick Geometries when bricks array or wireframe/exploded view changes
  useEffect(() => {
    if (!bricksGroupRef.current) return;
    const group = bricksGroupRef.current;

    // Clear existing meshes
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
    }

    if (bricks.length === 0) return;

    // Calculate center bounding box to center model automatically
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    bricks.forEach(b => {
      minX = Math.min(minX, b.x);
      maxX = Math.max(maxX, b.x);
      minY = Math.min(minY, b.y);
      maxY = Math.max(maxY, b.y);
      minZ = Math.min(minZ, b.z);
      maxZ = Math.max(maxZ, b.z);
    });

    const centerX = (minX + maxX) / 2 || 0;
    const baseY = maxY || 0; // lowest Y coordinate in LDraw is ground level 0
    const centerZ = (minZ + maxZ) / 2 || 0;

    // Build each brick mesh
    bricks.forEach((brickItem) => {
      const { width, height, length, studs } = brickItem.dimensions;
      const worldW = width * STUD_UNIT;
      const worldL = length * STUD_UNIT;
      const worldH = height * BRICK_HEIGHT_UNIT;

      const partId = brickItem.partId.toLowerCase();
      let bodyGeom: THREE.BufferGeometry;

      // Handle specific shapes (slopes, rounds)
      if (partId === '3062b.dat') {
        bodyGeom = new THREE.CylinderGeometry(worldW / 2 - 0.3, worldW / 2 - 0.3, worldH - 0.4, 16);
        bodyGeom.translate(0, -worldH / 2, 0);
      } else if (partId === '3040.dat' || partId === '3039.dat' || partId === '3298.dat' || partId === '3048.dat') {
        // Simple slope approximation using an extruded triangle
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(worldL - 0.6, 0);
        shape.lineTo(worldL - 0.6, worldH - 0.4);
        shape.lineTo(0, 0);
        
        const extrudeSettings = { depth: worldW - 0.6, bevelEnabled: false };
        bodyGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        // Extrude goes along Z, we need to rotate and center it
        bodyGeom.rotateY(-Math.PI / 2);
        bodyGeom.translate((worldW - 0.6) / 2, -worldH + 0.2, -(worldL - 0.6) / 2);
      } else {
        // Standard Box
        bodyGeom = new THREE.BoxGeometry(worldW - 0.6, worldH - 0.4, worldL - 0.6);
        // LDraw standard: origin is at the top center of the bounding box
        bodyGeom.translate(0, -worldH / 2, 0);
      }

      // Create Material
      const isTrans = brickItem.colorName.toLowerCase().includes('trans');
      const isGold = brickItem.colorName.toLowerCase().includes('gold') || brickItem.colorHex === '#AA7F2E';

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(brickItem.colorHex),
        roughness: isGold ? 0.25 : isTrans ? 0.1 : 0.35,
        metalness: isGold ? 0.65 : 0.1,
        transparent: isTrans,
        opacity: isTrans ? 0.7 : 1.0,
        wireframe: wireframe
      });

      // Combine brick body + studs into a single Group per brick
      const brickGroup = new THREE.Group();

      const bodyMesh = new THREE.Mesh(bodyGeom, material);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      brickGroup.add(bodyMesh);

      // Add Cylindrical Studs on Top Face if part has studs
      if (studs && !wireframe) {
        const studGeom = new THREE.CylinderGeometry(5.2, 5.2, 3.8, 16);
        // Since brick origin is at the top, studs sit directly on top of Y=0
        const topY = 1.9;

        // Create stud grid based on width x length
        const startX = -((width - 1) * STUD_UNIT) / 2;
        const startZ = -((length - 1) * STUD_UNIT) / 2;

        for (let ix = 0; ix < width; ix++) {
          for (let iz = 0; iz < length; iz++) {
            const studMesh = new THREE.Mesh(studGeom, material);
            studMesh.position.set(
              startX + ix * STUD_UNIT,
              topY,
              startZ + iz * STUD_UNIT
            );
            studMesh.castShadow = true;
            brickGroup.add(studMesh);
          }
        }
      }

      // Position in LDraw coordinate system (and apply exploded view offset along Y)
      const explodedYOffset = explodedFactor * ((brickItem.y - baseY) * 0.35);
      brickGroup.position.set(
        brickItem.x - centerX,
        -(brickItem.y - baseY) + explodedYOffset, // Invert Y so lowest brick sits at ground Y=0
        brickItem.z - centerZ
      );


      // Apply rotation matrix if specified (LDraw 3x3 matrix)
      // Since LDraw Y-axis is inverted in Three.js, we adjust the rotation matrix to avoid reflections and maintain right-handedness
      if (brickItem.matrix && brickItem.matrix.length === 9) {
        const m = brickItem.matrix;
        const mat4 = new THREE.Matrix4();
        // Negate the off-diagonal elements pairing Y with X/Z to correct for Y reflection:
        mat4.set(
          m[0], -m[1],  m[2], 0,
         -m[3],  m[4], -m[5], 0,
          m[6], -m[7],  m[8], 0,
             0,     0,     0, 1
        );
        brickGroup.setRotationFromMatrix(mat4);
      }

      // Attach user data for tooltip/selection
      brickGroup.userData = { brickItem };

      group.add(brickGroup);
    });

    // Adjust camera target to center of model
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [bricks, wireframe, explodedFactor]);

  // View control handlers
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(220, 180, 260);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const handleRotateLeft = () => {
    if (!controlsRef.current) return;
    controlsRef.current.autoRotate = false;
    setAutoRotate(false);
    const cam = cameraRef.current;
    if (cam) {
      cam.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8);
      controlsRef.current.update();
    }
  };

  const handleRotateRight = () => {
    if (!controlsRef.current) return;
    controlsRef.current.autoRotate = false;
    setAutoRotate(false);
    const cam = cameraRef.current;
    if (cam) {
      cam.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 8);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0F0F0F] overflow-hidden select-none">
      {/* Subtle Radial Dots Grid Background (Notch & Stud Sleek Theme) */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#00A896 0.7px, transparent 0.7px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Top Left Sleek Viewport Badge */}
      <div className="absolute top-5 left-5 z-20 flex items-center space-x-3 pointer-events-none">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00A896]/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#00A896]/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#00A896]/15" />
        </div>
        <div className="bg-[#00A896]/10 border border-[#00A896]/40 px-3 py-1 rounded">
          <span className="text-[#00A896] font-bold text-xs tracking-widest uppercase">
            3D VIEWPORT • {modelName}
          </span>
        </div>
        <div className="bg-[#18181A]/80 border border-[#00A896]/20 px-2.5 py-1 rounded text-[10px] text-[#F5F5F7]/70 font-mono">
          {totalBricksCount} Bricks geladen
        </div>
      </div>

      {/* Top Right Quick Controls Toolbar */}
      <div className="absolute top-5 right-5 z-20 flex items-center space-x-2">
        <button
          onClick={handleRotateLeft}
          title="Modell nach links drehen"
          className="p-2.5 rounded-lg border border-[#00A896]/30 bg-[#151515]/90 text-[#00A896] hover:bg-[#00A896]/20 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleRotateRight}
          title="Modell nach rechts drehen"
          className="p-2.5 rounded-lg border border-[#00A896]/30 bg-[#151515]/90 text-[#00A896] hover:bg-[#00A896]/20 transition-colors cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setWireframe(!wireframe)}
          title="Wireframe Gitterstruktur an/aus"
          className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
            wireframe
              ? 'border-[#00A896] bg-[#00A896] text-[#121212]'
              : 'border-[#00A896]/30 bg-[#151515]/90 text-[#00A896] hover:bg-[#00A896]/20'
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title="Automatische Rotation an/aus"
          className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
            autoRotate
              ? 'border-[#00A896] bg-[#00A896] text-[#121212]'
              : 'border-[#00A896]/30 bg-[#151515]/90 text-[#00A896] hover:border-[#00A896]/60 hover:text-[#00A896]'
          }`}
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          title="Kamerawinkel zurücksetzen"
          className="p-2.5 rounded-lg border border-[#00A896]/30 bg-[#151515]/90 text-[#00A896] hover:bg-[#00A896]/20 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Exploded View Architecture Slider (Bottom Center) */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3 bg-[#151515]/95 border border-[#00A896]/40 px-4 py-2 rounded-full shadow-lg">
        <Layers className="w-4 h-4 text-[#00A896]" />
        <span className="text-[10px] uppercase tracking-wider text-[#F5F5F7]/70 font-semibold">
          Explosionsdarstellung
        </span>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={explodedFactor}
          onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
          aria-label="Exploded View Slider"
          className="w-28 accent-[#00A896] cursor-pointer"
        />
        <span className="text-[11px] font-mono text-[#00A896] min-w-[28px] text-right">
          {explodedFactor === 0 ? 'Normal' : `${(explodedFactor * 100).toFixed(0)}%`}
        </span>
      </div>

      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Status & Engine Validation Bar */}
      <div className="absolute bottom-4 left-6 right-6 z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between pointer-events-none gap-3">
        <div className="max-w-xl text-[9px] text-[#F5F5F7]/60 flex flex-col bg-[#121212]/95 p-3 rounded-lg border border-[#00A896]/25 shadow-lg pointer-events-auto leading-normal">
          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider text-[#00A896] font-bold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A896] animate-pulse" />
            <span>Präzise 3D-Vorschau (Stud.io-Kalibriert)</span>
          </div>
          Das LDraw-Koordinaten- und Rotationssystem ist präzise auf den Standard von BrickLink Studio (Stud.io) kalibriert. Geringfügige WebGL-Vorschau-Differenzen beeinträchtigen die heruntergeladene .ldr-Konstruktionsdatei nicht.
        </div>

        <div className="text-[10px] uppercase tracking-widest text-[#F5F5F7]/40 bg-[#121212]/90 px-3 py-1.5 rounded border border-[#00A896]/20 self-end pointer-events-auto">
          Maus: Links + Ziehen = Drehen • Scroll = Zoom • Rechts + Ziehen = Verschieben
        </div>
      </div>
    </div>
  );
};
