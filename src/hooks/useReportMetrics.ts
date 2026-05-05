import type { ReportOrder } from "@/types/reportTypes";
import { defaultReportMetricsStrategy } from "@/patterns";

export const useReportMetrics = (orders: ReportOrder[]) => {
  return defaultReportMetricsStrategy.calculate(orders);
};
