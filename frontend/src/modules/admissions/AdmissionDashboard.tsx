import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  UserPlus,
  UserX,
  CheckCircle,
  Wallet,
  Percent,
  ArrowUpRight,
} from "lucide-react";
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

// Mock Data for Enrollment by Program Category
const enrollmentByProgram = [
  { name: "Education", Enrolled: 18200, Goal: 20000 },
  { name: "Engineering", Enrolled: 27100, Goal: 30000 },
  { name: "Industrial Arts", Enrolled: 14200, Goal: 15000 },
  { name: "Business", Enrolled: 9500, Goal: 10000 },
];

// --- COMPONENT ---
export default function AdmissionsDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-blue-600/90 rounded-lg p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <GraduationCap className="h-8 w-8" /> Admissions Management
            Dashboard
          </h1>
          <p className="text-lg opacity-90">
            Overview of current enrollment figures, completion rates, and
            financial status.
          </p>
        </div>

        {/* Key Admissions Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="New Enrollments (2025)"
            value={28750}
            description="Students registered this semester"
            icon={UserPlus}
            trend={{ value: 5.4, label: "YoY increase" }}
            variant="accent"
          />
          <StatsCard
            title="Total Graduates (YTD)"
            value={18420}
            description="Students who completed their courses"
            icon={CheckCircle}
            trend={{ value: 12.5, label: "vs. previous year" }}
            variant="success"
          />
          <StatsCard
            title="Dropout Rate"
            value="12.7%"
            description="Percentage of program dropouts"
            icon={UserX}
            trend={{ value: -1.1, label: "reduction" }}
            variant="destructive"
          />
          <StatsCard
            title="Pending Fees"
            value="ZWL 4.5M"
            description="Outstanding payments from students"
            icon={Wallet}
            trend={{ value: 0.5, label: "monthly increase" }}
            variant="info"
          />
        </div>

        {/* Enrollment Chart and Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Enrollment Distribution by Program Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentByProgram} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      className="text-muted-foreground"
                    />
                    <XAxis type="number" className="text-muted-foreground" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="Enrolled"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Current Enrollment"
                    />
                    <Bar
                      dataKey="Goal"
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                      name="Target Enrollment"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatsCard
                title="Registration Compliance"
                value="98.5%"
                description="Students fully registered"
                icon={Percent}
                variant="success"
              />
              <StatsCard
                title="ISEOP Students"
                value={1240}
                description="Total enrolled under ISEOP"
                icon={ArrowUpRight}
                variant="default"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
