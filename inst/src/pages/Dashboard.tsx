import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, BookOpen, TrendingUp, Calendar, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getStudents } from "@/services/students.services";
import { getStaff } from "@/services/staff.services";
import { getPrograms } from "@/services/programs.services";

// Helper to format dates relative to now (e.g., "2 hours ago")
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const Dashboard = () => {
  const { user } = useAuth();
  // @ts-ignore
  const institutionId = user?.institution?.id || user?.institution_id;

  const [stats, setStats] = useState([
    { title: "Total Students", value: "0", change: "0%", icon: Users, color: "text-blue-600" },
    { title: "Active Staff", value: "0", change: "0%", icon: UserCog, color: "text-purple-600" },
    { title: "Programs", value: "0", change: "0%", icon: BookOpen, color: "text-amber-600" },
    { title: "Avg Completion", value: "0%", change: "0%", icon: TrendingUp, color: "text-green-600" },
  ]);

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  // Mock events for now as we don't have an Events API
  const [upcomingEvents] = useState([
    { title: "Semester Registration Deadline", date: "Nov 15, 2025", type: "important" },
    { title: "Mid-term Examinations", date: "Dec 1-10, 2025", type: "normal" },
    { title: "Staff Meeting", date: "Nov 8, 2025", type: "normal" },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!institutionId) return;

      try {
        // 1. Fetch all data in parallel
        const [studentsData, staffData, programsData] = await Promise.all([
          getStudents({ institution_id: institutionId }),
          getStaff({ institution_id: institutionId }),
          getPrograms({ institution_id: institutionId })
        ]);

        // 2. Calculate Stats
        const totalStudents = studentsData.length;
        const activeStaff = staffData.filter((s: any) => s.is_active).length;
        const totalPrograms = programsData.length;
        
        // Mock calculation for completion (e.g., graduated / total)
        const graduated = studentsData.filter((s: any) => s.status === 'Graduated').length;
        const completionRate = totalStudents > 0 ? Math.round((graduated / totalStudents) * 100) : 0;

        setStats([
          { 
            title: "Total Students", 
            value: totalStudents.toString(), 
            change: "+5%", // You would need historical data for real trend
            icon: Users, 
            color: "text-blue-600" 
          },
          { 
            title: "Active Staff", 
            value: activeStaff.toString(), 
            change: "+2%", 
            icon: UserCog, 
            color: "text-purple-600" 
          },
          { 
            title: "Programs", 
            value: totalPrograms.toString(), 
            change: "0%", 
            icon: BookOpen, 
            color: "text-amber-600" 
          },
          { 
            title: "Graduation Rate", 
            value: `${completionRate}%`, 
            change: "+1.2%", 
            icon: TrendingUp, 
            color: "text-green-600" 
          },
        ]);

        // 3. Generate Recent Activity Feed
        // We combine the latest items from each category to simulate an activity log
        const newStudents = studentsData.slice(0, 3).map((s: any) => ({
          action: "New Student Enrolled",
          user: `${s.first_name} ${s.last_name}`,
          program: s.program_name || "General",
          time: s.created_at,
          type: "student"
        }));

        const newStaff = staffData.slice(0, 2).map((s: any) => ({
          action: "Staff Member Joined",
          user: `${s.first_name} ${s.last_name}`,
          program: s.department,
          time: s.created_at,
          type: "staff"
        }));

        const newPrograms = programsData.slice(0, 1).map((p: any) => ({
          action: "Program Created",
          user: "System Admin",
          program: p.name,
          time: p.created_at,
          type: "program"
        }));

        // Merge and sort by time (newest first)
        const combinedActivity = [...newStudents, ...newStaff, ...newPrograms]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5); // Take top 5

        setRecentActivities(combinedActivity);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchDashboardData();
  }, [institutionId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">{stat.change}</span> from last month
              </p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your institution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
              ) : (
                recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`h-2 w-2 rounded-full mt-2 
                      ${activity.type === 'student' ? 'bg-blue-500' : 
                        activity.type === 'staff' ? 'bg-purple-500' : 'bg-amber-500'}`} 
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{activity.user}</span>
                        <span>•</span>
                        <span>{activity.program}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(activity.time)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  {event.type === "important" && (
                    <Badge variant="destructive" className="text-xs">Important</Badge>
                  )}
                  {event.type === "normal" && (
                    <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;