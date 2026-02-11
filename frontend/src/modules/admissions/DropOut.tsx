import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserX, DollarSign, HeartCrack, AlertCircle, Loader2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getDropoutAnalysis, DropoutStats } from "@/services/analysis.services";

export default function DropoutAnalysis() {
  const [stats, setStats] = useState<DropoutStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getDropoutAnalysis();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dropout stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) return null;

  const { total_dropouts, chart_data } = stats;

  // Map reasons for quick access
  const reasonMap = chart_data.reduce((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {} as Record<string, number>);

  // Determine top reason
  const topReasonItem = chart_data.reduce((prev, curr) =>
    curr.value > prev.value ? curr : prev,
    { name: "N/A", value: 0, color: "#000000" }
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="pb-2 border-b">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserX className="h-7 w-7 text-destructive" />
            National Dropout Analysis
          </h1>
          <p className="text-muted-foreground">
            Overview of student attrition across the higher education landscape.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Dropouts"
            value={total_dropouts}
            description="Across all institutions"
            icon={UserX}
            variant="destructive"
          />
          <StatsCard 
  title="Financial Hardship"
  value={reasonMap["Financial Hardship"] || 0}
  description={
    total_dropouts
      ? `${(((reasonMap["Financial Hardship"] || 0) / total_dropouts) * 100).toFixed(1)}% of total`
      : "0%"
  }
  icon={DollarSign}
  variant="default"
/>
          <StatsCard
            title="Personal Issues"
            value={reasonMap["Personal/Family Issues"] || 0}
            description="Marital or family related"
            icon={HeartCrack}
            variant="accent"
          />
          <StatsCard
            title="Primary Cause"
            value={topReasonItem.name}
            description={`${topReasonItem.value} cases`}
            icon={AlertCircle}
            variant="warning"
          />
        </div>

        {/* Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dropout Reasons Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 relative">
                {!total_dropouts && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-muted-foreground font-medium">No Data Available</span>
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
  <Pie
    data={chart_data.filter(entry => entry.value > 0)}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    innerRadius={80}
    outerRadius={120}
    paddingAngle={2}
    stroke="none"
    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
  >
    {chart_data
      .filter(entry => entry.value > 0)
      .map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
  </Pie>
  {total_dropouts > 0 && (
    <>
      <Tooltip
        contentStyle={{
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      />
      <Legend verticalAlign="bottom" height={36} />
    </>
  )}
</PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Breakdown by Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chart_data.map((d) => (
                    <TableRow key={d.name}>
                      <TableCell className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </TableCell>
                      <TableCell className="text-right font-medium">{d.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
