import { Clock } from "lucide-react";
import type { BusyHour } from "../../types/reportTypes";

interface BusyHoursPanelProps {
  busyHours: BusyHour[];
}

export const BusyHoursPanel = ({ busyHours }: BusyHoursPanelProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
    <div className="flex items-center gap-2 mb-4">
      <Clock className="text-brown-two" size={20} />
      <h3 className="font-bold text-lg">Busiest Hours</h3>
    </div>
    {busyHours.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {busyHours.map(({ display, count }, index) => (
          <div key={display} className="text-center p-4 bg-brown/5 rounded-xl">
            <Clock className="w-6 h-6 mx-auto text-brown-two mb-2" />
            <p className="text-2xl font-bold">{display}</p>
            <p className="text-sm text-gray-500">{count} orders</p>
            {index === 0 && (
              <p className="text-xs text-green-600 mt-1">Peak hour</p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400 text-center py-4">No orders yet</p>
    )}
  </div>
);
