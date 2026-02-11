import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Building, GraduationCap, UserCheck } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useStatistics } from "@/hooks/useStatistics";
import { useStudentDistribution } from "@/hooks/useStudentDistribution";
import { useStudentTeacherRatio } from "@/hooks/useRatios";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { InstitutionOverview } from "@/components/dashboard/InstitutionOverview";
import { useNavigate } from "react-router-dom";

// RECHARTS
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Rectangle,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent-foreground))",
  "hsl(var(--success))",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
      <p className="font-bold">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Statistics() {
  const { data, loading, error } = useStatistics();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              TESC Statistics
            </h1>
            <p className="text-muted-foreground">
              Overall insights and analytics for all institutions
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        {loading && <p className="text-muted-foreground">Loading statistics…</p>}
        {error && <p className="text-red-500">Failed to load statistics.</p>}

        {!loading && data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Institutions"
              value={data.total_institutions}
              description="All institution types"
              icon={Building}
              variant="default"
              onClick={() => navigate("/institutions")}
            />

            <StatsCard
              title="Total Students"
              value={data.total_students}
              description="Currently enrolled"
              icon={Users}
              variant="accent"
              onClick={() => navigate("/students")}
            />

            <StatsCard
              title="Total Programs"
              value={data.total_programs}
              description="Across all institutions"
              icon={GraduationCap}
              variant="success"
              onClick={() => navigate("/programs")}
            />

            <StatsCard
              title="Total Staff"
              value={data.total_staff}
              description="Lecturing & Admin"
              icon={UserCheck}
              variant="success"
              onClick={() => navigate("/staff")}
            />
          </div>
        )}

        {!loading && !data && !error && (
          <p className="text-muted-foreground">No statistics available.</p>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnrollmentChart />
          <InstitutionOverview />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Student Distribution by Institution Type</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentDistributionChart />
            </CardContent>
          </Card>

          {/* Student-Staff Ratio */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Student-Staff Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <RatioChart />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* -------------------- Charts -------------------- */

export function StudentDistributionChart() {
  const { data, loading, error } = useStudentDistribution();

  if (loading) return <p>Loading student distribution…</p>;
  if (error) return <p>Failed to load distribution.</p>;
  if (!data) return <p>No data available.</p>;

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RatioChart() {
  const { data, loading, error } = useStudentTeacherRatio();

  if (loading) return <p>Loading…</p>;
  if (error || !data) return <p>Failed to load data.</p>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="ratio"
          name="Student-Staff Ratio"
          fill="hsl(var(--primary))"
          activeBar={<Rectangle fill="hsl(var(--primary-foreground))" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}