import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface GeometryDiagramProps {
  type: 'CUBE_NET' | 'PARALLEL_ANGLES' | 'SHADED_CIRCLE' | 'CYLINDER_WATER' | 'COMPOSITE_3D' | 'POLYGON_GRID';
  data?: Record<string, unknown>;
  caption?: string;
  allowRotation?: boolean;
}

export const GeometryDiagram: React.FC<GeometryDiagramProps> = ({
  type,
  data = {},
  caption,
  allowRotation = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [rotationDegree, setRotationDegree] = useState<number>(0);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(1.6, prev + 0.2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.8, prev - 0.2));
  const handleRotate = () => setRotationDegree((prev) => (prev + 90) % 360);

  return (
    <div className="w-full max-w-md mx-auto my-3 p-3 rounded-2xl bg-arctic-950/80 border border-cyan-500/40 shadow-inner flex flex-col items-center select-none">
      {/* Controls Bar */}
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs text-cyan-300">
        <span className="font-bold flex items-center gap-1">
          📐 รูปเรขาคณิตเวกเตอร์มาตรฐาน (Vector SVG)
        </span>
        <div className="flex items-center gap-1.5">
          {allowRotation && (
            <button
              onClick={handleRotate}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="หมุนมุมมอง 90 องศา"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="ขยาย"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="ย่อ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        className="w-full h-52 flex items-center justify-center overflow-hidden transition-transform duration-200"
        style={{ transform: `scale(${zoomLevel}) rotate(${rotationDegree}deg)` }}
      >
        {type === 'CUBE_NET' && (
          /* Responsive 3D Cube Net SVG (1-4-1 standard net) */
          <svg viewBox="0 0 240 180" className="w-full h-full">
            <g stroke="#38bdf8" strokeWidth="2" fill="#0f172a">
              {/* Top square */}
              <rect x="70" y="10" width="40" height="40" rx="4" fill="#0369a1" />
              <text x="90" y="35" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">1</text>

              {/* Middle 4 squares row */}
              <rect x="30" y="50" width="40" height="40" rx="4" fill="#0f172a" />
              <text x="50" y="75" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">2</text>

              <rect x="70" y="50" width="40" height="40" rx="4" fill="#0284c7" />
              <text x="90" y="75" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">A</text>

              <rect x="110" y="50" width="40" height="40" rx="4" fill="#0f172a" />
              <text x="130" y="75" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">3</text>

              <rect x="150" y="50" width="40" height="40" rx="4" fill="#0f172a" />
              <text x="170" y="75" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">4</text>

              {/* Bottom square */}
              <rect x="70" y="90" width="40" height="40" rx="4" fill="#0369a1" />
              <text x="90" y="115" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">5</text>
            </g>
          </svg>
        )}

        {type === 'PARALLEL_ANGLES' && (
          /* Parallel Lines with Transversal */
          <svg viewBox="0 0 240 160" className="w-full h-full">
            <g stroke="#38bdf8" strokeWidth="2.5">
              {/* Line L1 */}
              <line x1="20" y1="40" x2="220" y2="40" />
              {/* Line L2 */}
              <line x1="20" y1="110" x2="220" y2="110" />
              {/* Transversal T */}
              <line x1="50" y1="10" x2="190" y2="140" stroke="#f59e0b" strokeWidth="2.5" />
            </g>
            {/* Angle labels */}
            <circle cx="85" cy="40" r="12" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" />
            <text x="110" y="35" fill="#38bdf8" fontSize="12" fontWeight="bold">65°</text>

            <circle cx="155" cy="110" r="12" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" />
            <text x="130" y="130" fill="#f59e0b" fontSize="12" fontWeight="bold">x°</text>
          </svg>
        )}

        {type === 'SHADED_CIRCLE' && (
          /* Shaded Leaf inside Square */
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <rect x="30" y="30" width="140" height="140" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            {/* Shaded Leaf formed by intersecting arcs */}
            <path
              d="M 30 170 A 140 140 0 0 1 170 30 A 140 140 0 0 1 30 170 Z"
              fill="#0284c7"
              fillOpacity="0.75"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <text x="100" y="105" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">พื้นที่แรเงา</text>
            <text x="100" y="190" fill="#94a3b8" fontSize="11" textAnchor="middle">ด้านยาว a = 14 ซม.</text>
          </svg>
        )}

        {type === 'CYLINDER_WATER' && (
          /* Cylinder Tank with Water Level */
          <svg viewBox="0 0 220 160" className="w-full h-full">
            {/* Cylinder Base/Top Ellipses */}
            <g stroke="#38bdf8" strokeWidth="2" fill="none">
              <ellipse cx="110" cy="30" rx="70" ry="18" fill="#0f172a" stroke="#38bdf8" />
              <path d="M 40 30 L 40 120 A 70 18 0 0 0 180 120 L 180 30" />
              {/* Water Level */}
              <ellipse cx="110" cy="75" rx="70" ry="18" fill="#0284c7" fillOpacity="0.5" stroke="#38bdf8" />
              <path d="M 40 75 L 40 120 A 70 18 0 0 0 180 120 L 180 75" fill="#0369a1" fillOpacity="0.6" />
            </g>
            <text x="110" y="100" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">ระดับน้ำ h = 8 ม.</text>
            <text x="110" y="25" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">รัศมี r = 7 ม.</text>
          </svg>
        )}

        {type === 'COMPOSITE_3D' && (
          /* Isometric 3D Composite Cubes */
          <svg viewBox="0 0 220 160" className="w-full h-full">
            <g stroke="#38bdf8" strokeWidth="1.5" fill="#1e293b">
              {/* Cube 1 (Bottom Left) */}
              <polygon points="60,90 90,75 90,105 60,120" fill="#0284c7" />
              <polygon points="90,75 120,90 120,120 90,105" fill="#0369a1" />
              <polygon points="60,90 90,75 120,90 90,105" fill="#38bdf8" />

              {/* Cube 2 (Bottom Right) */}
              <polygon points="120,90 150,75 150,105 120,120" fill="#0284c7" />
              <polygon points="150,75 180,90 180,120 150,105" fill="#0369a1" />
              <polygon points="120,90 150,75 180,90 150,105" fill="#38bdf8" />

              {/* Cube 3 (Stacked Top) */}
              <polygon points="90,60 120,45 120,75 90,90" fill="#0284c7" />
              <polygon points="120,45 150,60 150,90 120,75" fill="#0369a1" />
              <polygon points="90,60 120,45 150,60 120,75" fill="#7dd3fc" />
            </g>
            <text x="110" y="145" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">ลูกบาศก์ซ้อน 3 ลูก</text>
          </svg>
        )}

        {type === 'POLYGON_GRID' && (
          /* Coordinate Grid with Polygon */
          <svg viewBox="0 0 200 160" className="w-full h-full">
            {/* Grid dots */}
            <g fill="#475569">
              {Array.from({ length: 5 }).map((_, r) =>
                Array.from({ length: 6 }).map((_, c) => (
                  <circle key={`${r}-${c}`} cx={30 + c * 28} cy={20 + r * 28} r="2.5" />
                ))
              )}
            </g>
            {/* Polygon */}
            <polygon
              points="58,48 142,48 114,104 58,104"
              fill="#0284c7"
              fillOpacity="0.4"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <text x="100" y="80" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">รูปสี่เหลี่ยมด้านขนาน</text>
          </svg>
        )}
      </div>

      {caption && <span className="text-[11px] text-slate-300 text-center mt-1">{caption}</span>}
    </div>
  );
};
