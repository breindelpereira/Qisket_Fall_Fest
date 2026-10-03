import React, { useRef, useState } from 'react';
import type { BlochCoordinates } from '../../core/circuit/bloch';

interface Props {
  coordinates: BlochCoordinates;
  targetCoordinates?: BlochCoordinates;
  interactive?: boolean;
  onCoordinatesChange?: (theta: number, phi: number) => void;
  size?: number;
}

export const BlochSphereVisualizer: React.FC<Props> = ({
  coordinates,
  targetCoordinates,
  interactive = false,
  onCoordinatesChange,
  size = 280,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Projection angles for 3D isometric perspective
  const rotX = 20 * (Math.PI / 180);
  const rotY = 45 * (Math.PI / 180);

  // Leave room inside the svg for the axis labels, which sit 1.25 radii from the centre
  const radius = size * 0.3;
  const cx = size / 2;
  const cy = size / 2;

  // Project 3D coordinate (x, y, z) onto 2D canvas (screenX, screenY)
  // Standard quantum physics convention: Z is up, X is forward/left, Y is right
  const project = (x: number, y: number, z: number): [number, number] => {
    // Rotate around Y-axis (view angle)
    const x1 = x * Math.cos(rotY) - y * Math.sin(rotY);
    const y1 = x * Math.sin(rotY) + y * Math.cos(rotY);

    // Rotate around X-axis (pitch)
    const z2 = y1 * Math.sin(rotX) + z * Math.cos(rotX);

    // Orthographic projection to 2D
    const screenX = cx + x1 * radius;
    const screenY = cy - z2 * radius; // inverted Y for screen coordinates
    return [screenX, screenY];
  };


  const [stateX, stateY] = project(coordinates.x, coordinates.y, coordinates.z);
  const [originX, originY] = project(0, 0, 0);

  // Axis end points
  const [zPlusX, zPlusY] = project(0, 0, 1.25);
  const [zMinusX, zMinusY] = project(0, 0, -1.25);
  const [xPlusX, xPlusY] = project(1.25, 0, 0);
  const [xMinusX, xMinusY] = project(-1.25, 0, 0);
  const [yPlusX, yPlusY] = project(0, 1.25, 0);
  const [yMinusX, yMinusY] = project(0, -1.25, 0);

  // Target coordinates if challenge active
  const targetPt = targetCoordinates ? project(targetCoordinates.x, targetCoordinates.y, targetCoordinates.z) : null;

  // Handle pointer dragging to set theta and phi interactively
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || (!isDragging && e.buttons !== 1)) return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const touchX = (e.clientX - rect.left - cx) / radius;
    const touchY = (cy - (e.clientY - rect.top)) / radius;

    // Map 2D touch to sphere theta (polar) and phi (azimuthal)
    const theta = Math.PI * (1 - (touchY + 1) / 2);
    const phi = Math.atan2(touchY, touchX);


    const clampedTheta = Math.max(0, Math.min(Math.PI, theta));
    onCoordinatesChange?.(clampedTheta, phi);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        style={{
          touchAction: 'none',
          cursor: interactive ? 'grab' : 'default',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0, 210, 255, 0.12)" />
            <stop offset="85%" stopColor="rgba(19, 25, 67, 0.4)" />
            <stop offset="100%" stopColor="rgba(0, 210, 255, 0.25)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sphere Outer Silhouette */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="url(#sphereGlow)"
          stroke="rgba(0, 210, 255, 0.35)"
          strokeWidth="1.5"
        />

        {/* Equator (XY Plane) Ellipse */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={radius}
          ry={radius * Math.sin(rotX)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Meridian (XZ Plane) Ellipse */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={radius * Math.cos(rotY)}
          ry={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Axes Lines */}
        {/* Z Axis (|0> to |1>) */}
        <line
          x1={zMinusX}
          y1={zMinusY}
          x2={zPlusX}
          y2={zPlusY}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1.5"
        />
        {/* X Axis (|+> to |->) */}
        <line
          x1={xMinusX}
          y1={xMinusY}
          x2={xPlusX}
          y2={xPlusY}
          stroke="rgba(0, 210, 255, 0.25)"
          strokeWidth="1.2"
        />
        {/* Y Axis (|+i> to |-i>) */}
        <line
          x1={yMinusX}
          y1={yMinusY}
          x2={yPlusX}
          y2={yPlusY}
          stroke="rgba(192, 132, 252, 0.25)"
          strokeWidth="1.2"
        />

        {/* Named State Labels at Poles and Equator */}
        <text x={zPlusX} y={zPlusY - 8} fill="#00d2ff" fontSize="12" fontWeight="800" textAnchor="middle">
          |0⟩ (+Z)
        </text>
        <text x={zMinusX} y={zMinusY + 16} fill="#ff4081" fontSize="12" fontWeight="800" textAnchor="middle">
          |1⟩ (-Z)
        </text>
        <text x={xPlusX + 12} y={xPlusY + 4} fill="#e6dcff" fontSize="10" fontWeight="600" textAnchor="start">
          |+⟩ (+X)
        </text>
        <text x={xMinusX - 12} y={xMinusY + 4} fill="#e6dcff" fontSize="10" fontWeight="600" textAnchor="end">
          |-⟩ (-X)
        </text>

        {/* Target State Ring (If challenge mode active) */}
        {targetPt && (
          <g>
            <circle
              cx={targetPt[0]}
              cy={targetPt[1]}
              r="10"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeDasharray="3 3"
            />
            <circle cx={targetPt[0]} cy={targetPt[1]} r="3" fill="#fbbf24" />
            <text x={targetPt[0]} y={targetPt[1] - 12} fill="#fbbf24" fontSize="10" fontWeight="700" textAnchor="middle">
              Target
            </text>
          </g>
        )}

        {/* State Vector Arrow */}
        <line
          x1={originX}
          y1={originY}
          x2={stateX}
          y2={stateY}
          stroke="#00d2ff"
          strokeWidth="3.5"
          filter="url(#glow)"
        />

        {/* State Arrow Head / Tip */}
        <circle
          cx={stateX}
          cy={stateY}
          r="6.5"
          fill="#ff4081"
          stroke="#ffffff"
          strokeWidth="2"
          filter="url(#glow)"
        />
      </svg>

      {/* Coordinate Readout Badge */}
      <div style={{
        display: 'flex',
        gap: 12,
        fontSize: '0.72rem',
        color: 'var(--text-secondary)',
        background: 'rgba(16, 21, 48, 0.7)',
        padding: '4px 12px',
        borderRadius: 20,
        border: '1px solid var(--border-subtle)',
        marginTop: 4
      }}>
        <span><b>x:</b> {coordinates.x}</span>
        <span><b>y:</b> {coordinates.y}</span>
        <span><b>z:</b> {coordinates.z}</span>
        <span><b>θ:</b> {(coordinates.theta * (180 / Math.PI)).toFixed(0)}°</span>
        <span><b>φ:</b> {(coordinates.phi * (180 / Math.PI)).toFixed(0)}°</span>
      </div>
    </div>
  );
};
