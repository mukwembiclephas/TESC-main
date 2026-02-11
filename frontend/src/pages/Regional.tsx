import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building, Users, Beaker, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
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
} from "recharts";
import { getRegionalStats, RegionalStats } from "@/services/analysis.services";
import { useNavigate } from "react-router-dom";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold text-sm">{label}</p>
        <p style={{ color: payload[0].fill }} className="text-xs">
          {`${payload[0].name}: ${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function Regional() {
  const [data, setData] = useState<RegionalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getRegionalStats();
        setData(response);
      } catch (error) {
        console.error("Failed to fetch regional stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- DATA AGGREGATION LOGIC ---
  // This groups the data so that each location appears only once
  const distinctChartData = useMemo(() => {
    if (!data?.chart_data) return [];

    const grouped = data.chart_data.reduce((acc: any, curr) => {
      const loc = curr.location || "Unknown";
      if (!acc[loc]) {
        acc[loc] = {
          location: loc,
          students: 0,
          hubs: 0,
          institutions: [], // We'll store names as an array to list them
        };
      }
      acc[loc].students += curr.students;
      acc[loc].hubs += curr.hubs;
      // Prevent duplicate institution names in the list
      if (!acc[loc].institutions.includes(curr.institutions)) {
        acc[loc].institutions.push(curr.institutions);
      }
      return acc;
    }, {});

    // Convert the object back into an array and join institution names into a string
    return Object.values(grouped)
      .map((item: any) => ({
        ...item,
        institutions: item.institutions.join(", "),
      }))
      .sort((a: any, b: any) => b.students - a.students); // Sort by highest enrollment
  }, [data]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;
  const { stats } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-7 w-7 text-primary" />
            Regional Analysis
          </h1>
          <p className="text-muted-foreground">
            Aggregated institutional footprint by location
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Provinces Covered"
            value={stats.provinces_covered}
            description="Active regions"
            icon={MapPin}
            onClick={() => navigate("/institutions?group=province")}
          />
          <StatsCard
            title="Top Location"
            value={stats.top_enrollment}
            description="Highest enrollment"
            icon={Users}
            variant="accent"
            onClick={() => navigate("/students?sort=location")}
          />
          <StatsCard
            title="Total Institutions"
            value={stats.total_institutions}
            description="Registered"
            icon={Building}
            variant="info"
            onClick={() => navigate("/institutions")}
          />
          <StatsCard
            title="Innovation Hubs"
            value={distinctChartData.reduce((acc, curr) => acc + curr.hubs, 0)}
            description="Active centers"
            icon={Beaker}
            variant="success"
            onClick={() => navigate("/innovation")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Bar Chart Section */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Total Enrollment by Location</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distinctChartData}
                  layout="vertical"
                  margin={{ left: 20, right: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis
                    dataKey="location"
                    type="category"
                    fontSize={11}
                    width={100}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  />
                  <Bar
                    dataKey="students"
                    name="Total Students"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Distinct Location Stats</CardTitle>
            </CardHeader>
            <CardContent className="h-96 overflow-y-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-center">Hubs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distinctChartData.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="py-3">
                        <div className="font-medium text-xs">
                          {item.location}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {item.institutions}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold">
                        {item.students.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {item.hubs}
                      </TableCell>
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
