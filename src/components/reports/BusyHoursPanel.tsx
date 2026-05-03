import { Clock } from "lucide-react";
import type { BusyHour } from "@/types/reportTypes";

interface BusyHoursPanelProps {
  busyHours: BusyHour[];
}

export const BusyHoursPanel = ({ busyHours }: BusyHoursPanelProps) => {
  const maxCount = Math.max(...busyHours.map((h) => h.count), 1);
  const relevantHours = busyHours.filter(h => h.hour >= 6 && h.hour <= 22);
  const peakHour = busyHours.reduce((prev, current) => (prev.count > current.count) ? prev : current, busyHours[0]);

  // SVG dimensions
  const width = 800;
  const height = 150;
  const padding = 20;
  
  // Calculate points for the line chart
  const points = relevantHours.map((h, i) => {
    const x = (i / (relevantHours.length - 1)) * (width - padding * 2) + padding;
    const y = height - (h.count / maxCount) * (height - padding * 2) - padding;
    return { x, y, ...h };
  });

  const pathData = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaData = `${pathData} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brown/10 rounded-xl">
            <Clock className="text-brown-two" size={22} />
          </div>
          <div>
            <h3 className="font-black text-xl text-dark-brown">Order Volume by Hour</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Hourly traffic trends</p>
          </div>
        </div>
        {peakHour && peakHour.count > 0 && (
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Time</p>
            <p className="text-lg font-black text-emerald-600">{peakHour.display}</p>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto drop-shadow-sm"
          preserveAspectRatio="none"
        >
          {/* Area Fill */}
          <path d={areaData} className="fill-brown/5 transition-all duration-1000" />
          
          {/* Grid Lines */}
          <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
          
          {/* The Line */}
          <path 
            d={pathData} 
            fill="none" 
            stroke="#9c6644" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-1000"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group/point cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                className={`fill-white stroke-2 transition-all ${p.count === peakHour.count ? 'stroke-emerald-500' : 'stroke-brown-two'}`} 
              />
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="12" 
                className="fill-transparent group-hover/point:fill-brown/10 transition-colors" 
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-6 mt-2">
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>10 PM</span>
      </div>
    </div>
  );
};
