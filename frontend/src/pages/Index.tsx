import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { InstitutionOverview } from "@/components/dashboard/InstitutionOverview";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardService} from "@/services/admin.dashboard.service";
import { DashboardStats } from "@/lib/types/dashboard.types";
import { 
  Users, 
  GraduationCap, 
  Building, 
  TrendingUp, 
  UserCheck, 
  BookOpen,
  Award,
  Loader2
} from "lucide-react";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await DashboardService.getStats();
        setStats(data);
      } catch (error) {
        // Handle error specifically if needed, e.g. toast notification
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-primary rounded-lg p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">TESC Student Records & Statistics</h1>
          <p className="text-lg opacity-90">
            Zimbabwe Human Capital Planning and Skills Development Department
          </p>
          <p className="text-sm opacity-75 mt-2">
            National dashboard for Teachers Colleges, Polytechnics, and Industrial Training Colleges
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Students"
            value={stats?.total_students || 0}
            description="Across all institutions"
            icon={Users}
            // trend={{ value: 8.2, label: "from last year" }} // You can calculate this dynamically too if backend supports it
            variant="accent"
          />
          <StatsCard
            title="Active Institutions"
            value={stats?.active_institutions || 0}
            description="Nationwide coverage"
            icon={Building}
            // trend={{ value: 0, label: "stable" }}
            variant="success"
          />
          <StatsCard
            title="Graduates (This Year)"
            value={stats?.graduates_year || 0}
            description="Completed programs"
            icon={GraduationCap}
            // trend={{ value: 12.5, label: "increase" }}
            variant="default"
          />
          <StatsCard
            title="Program Completion Rate"
            value={`${stats?.completion_rate}%`}
            description="System average"
            icon={Award}
            // trend={{ value: 2.1, label: "improvement" }}
            variant="success"
          />
        </div>

        {/* Institution Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Teachers Colleges"
            value={stats?.breakdown.teachers_colleges || 0}
            description="Students enrolled"
            icon={BookOpen}
            variant="default"
          />
          <StatsCard
            title="Polytechnics"
            value={stats?.breakdown.polytechnics || 0}
            description="Students enrolled"
            icon={TrendingUp}
            variant="default"
          />
          <StatsCard
            title="Industrial Training"
            value={stats?.breakdown.industrial_training || 0}
            description="Students enrolled"
            icon={UserCheck}
            variant="default"
          />
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnrollmentChart />
          <InstitutionOverview />
        </div>

        {/* Quick Actions */}
        {/* <QuickActions /> */}
      </div>
    </DashboardLayout>
  );
};

export default Index;