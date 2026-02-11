import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Building, Bed, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useStatistics } from "@/hooks/useStatistics";
import { useFacilities, Facility } from "@/hooks/useFacilities";

import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Facilities() {
  const { data: statsData, loading: statsLoading } = useStatistics();
  const {
    data: facilities,
    loading: facilitiesLoading,
    error,
  } = useFacilities();

  if (error) return <div>Error loading facilities: {error}</div>;

  // Calculate total capacity and enrollment for utilization
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const totalCurrentUsage = facilities.reduce(
    (sum, f) => sum + (f.current_usage || 0),
    0
  );
  const utilization =
    totalCapacity > 0 ? (totalCurrentUsage / totalCapacity) * 100 : 0;

  // Prepare data for chart: group by facility type
  const chartData = facilities.reduce<{
    [key: string]: { name: string; capacity: number; usage: number };
  }>((acc, f) => {
    const key = f.facility_type;
    if (!acc[key]) {
      acc[key] = { name: key, capacity: 0, usage: 0 };
    }
    acc[key].capacity += f.capacity;

    acc[key].usage += f.current_usage || 0;
    return acc;
  }, {});

  const capacityData = Object.values(chartData);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <School className="h-7 w-7" />
            Facilities & Capacity
          </h1>
          <p className="text-muted-foreground">
            Manage infrastructure, capacity, and resource utilization
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Capacity"
            value={totalCapacity.toLocaleString()}
            description="Student accommodation & learning"
            icon={Building}
          />
          <StatsCard
            title="Current Usage"
            value={totalCurrentUsage.toLocaleString()}
            description="Students currently using facilities"
            icon={Users}
            variant="accent"
          />

        
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Capacity Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {utilization.toFixed(1)}%
              </div>
              <Progress value={utilization} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {totalCurrentUsage.toLocaleString()} /{" "}
                {totalCapacity.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment vs Capacity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity vs. Current Usage by Facility Type</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capacityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="capacity" fill="hsl(var(--accent))" />
                  <Bar
                    dataKey="usage"
                    fill="hsl(var(--primary))"
                    name="Current Usage"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Major Facilities Table */}
          <Card>
            <CardHeader>
              <CardTitle>Major Facilities Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Current Usage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilitiesLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : facilities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No facilities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    facilities.map((f: Facility) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell>{f.facility_type}</TableCell>
                        <TableCell>{f.capacity.toLocaleString()}</TableCell>
                        <TableCell>
                          {f.current_usage.toLocaleString()}
                        </TableCell>
                        <TableCell>{f.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
