import { Calendar, ChevronRight, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import type { DateRange } from "@/types/reportTypes";

interface ReportsHeaderProps {
  dateRange: DateRange;
  loading: boolean;
  showDatePicker: boolean;
  onToggleDatePicker: () => void;
  onSetDatePreset: (days: number) => void;
  onExport: () => void;
  onRefresh: () => void;
}

export const ReportsHeader = ({
  dateRange,
  loading,
  showDatePicker,
  onToggleDatePicker,
  onSetDatePreset,
  onExport,
  onRefresh,
}: ReportsHeaderProps) => (
  <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
    <div>
      <h1 className="text-4xl font-black font-fredoka">Reports</h1>
      <p className="text-gray-500">Sales and order insights</p>
    </div>
    <div className="flex gap-3">
      <div className="relative">
        <Button
          onClick={onToggleDatePicker}
          variant="outline"
          rightIcon={<ChevronRight size={16} />}
        >
          <Calendar size={18} />
          <span className="text-sm">
            {dateRange.startDate.toLocaleDateString()} -{" "}
            {dateRange.endDate.toLocaleDateString()}
          </span>
        </Button>
        {showDatePicker && (
          <div className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-48">
            <Button
              onClick={() => onSetDatePreset(1)}
              variant="ghost"
              fullWidth
              className="justify-start rounded-none"
            >
              Today
            </Button>
            <Button
              onClick={() => onSetDatePreset(7)}
              variant="ghost"
              fullWidth
              className="justify-start rounded-none"
            >
              Last 7 days
            </Button>
            <Button
              onClick={() => onSetDatePreset(30)}
              variant="ghost"
              fullWidth
              className="justify-start rounded-none"
            >
              Last 30 days
            </Button>
          </div>
        )}
      </div>
      <Button
        onClick={onExport}
        variant="solid"
        leftIcon={<Download size={18} />}
      >
        Export CSV
      </Button>
      <IconButton label="Refresh reports" onClick={onRefresh} variant="outline">
        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
      </IconButton>
    </div>
  </div>
);
