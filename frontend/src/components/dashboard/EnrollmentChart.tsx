import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DashboardService } from "@/services/admin.dashboard.service";
import { EnrollmentTrendItem } from "@/lib/types/dashboard.types";

const COLOR_POOL = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
];

/* Collect ALL possible institution keys (sparse-safe) */
const getSeriesKeys = (data: EnrollmentTrendItem[]) => {
  const keys = new Set<string>();
  data.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (k !== "year") keys.add(k);
    });
  });
  return Array.from(keys);
};

export function EnrollmentChart() {
  const [data, setData] = useState<EnrollmentTrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* Which series are visible */
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>(
    {}
  );

  /* Which series is isolated (null = none) */
  const [isolatedKey, setIsolatedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const trends = await DashboardService.getEnrollmentTrends();
      setData(trends);
      setLoading(false);
    };
    fetchData();
  }, []);

  /* Initialize visibility */
  useEffect(() => {
    if (data.length) {
      const keys = getSeriesKeys(data);
      const visibility: Record<string, boolean> = {};
      keys.forEach((k) => (visibility[k] = true));
      setVisibleSeries(visibility);
    }
  }, [data]);

  const seriesKeys = getSeriesKeys(data);

  /* Legend click = isolate */
  const handleLegendClick = (e: any) => {
    const key = e.dataKey;

    setIsolatedKey((prev) => {
      // If clicking the same key again → reset
      if (prev === key) {
        const reset: Record<string, boolean> = {};
        seriesKeys.forEach((k) => (reset[k] = true));
        setVisibleSeries(reset);
        return null;
      }

      // Isolate selected key
      const isolated: Record<string, boolean> = {};
      seriesKeys.forEach((k) => (isolated[k] = k === key));
      setVisibleSeries(isolated);
      return key;
    });
  };

  /* Controlled legend payload (prevents reorder/ghost items) */
  const legendPayload = seriesKeys.map((key, index) => ({
    id: key,
    value: key,
    type: "line",
    dataKey: key,
    color: visibleSeries[key]
      ? COLOR_POOL[index % COLOR_POOL.length]
      : "hsl(var(--muted-foreground))",
  }));

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart data...</span>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Trends (Last 5 Years)</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />

              <Legend
                payload={legendPayload}
                onClick={handleLegendClick}
              />

              {seriesKeys.map((key, index) => {
                const color = COLOR_POOL[index % COLOR_POOL.length];
                const visible = visibleSeries[key];

                return (
                  <Line
                    key={key}
                    dataKey={key}
                    name={key}
                    stroke={color}
                    strokeWidth={2}
                    strokeOpacity={visible ? 1 : 0.15}
                    dot={visible ? { fill: color } : false}
                    activeDot={visible ? { r: 6 } : false}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
