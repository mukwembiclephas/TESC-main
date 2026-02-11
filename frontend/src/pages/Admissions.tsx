import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Calendar, BookOpen, Loader2, UserPlus, FolderOpen } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
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
    PieChart,
    Pie,
    Cell
} from "recharts";
import { getAdmissionStats } from "@/services/analysis.services";

const COLORS = ["#2563eb", "#e11d48", "#16a34a", "#d97706", "#7c3aed"];

export default function Admissions() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdmissionStats()
            .then(setData)
            .catch(err => console.error("Failed to load admissions", err))
            .finally(() => setLoading(false));
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

    const stats = data?.stats || {};
    const trend = data?.trend || [];
    const genderData = data?.gender_distribution || [];
    const topPrograms = data?.top_programs || [];
    const recentAdmissions = data?.recent_admissions || [];

    const hasTrendData = trend.length > 0;
    const hasGenderData = genderData.length > 0;

    // Transform gender data for Recharts if needed
    const genderChartData = hasGenderData ? genderData : [{ gender: 'No Data', value: 1 }];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                
                {/* Header */}
                <div className="pb-2 border-b">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <UserPlus className="h-7 w-7 text-primary" />
                        Admissions Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Tracking student enrollment trends and intake statistics.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard 
                        title="Current Intake" 
                        value={stats.current_intake || 0} 
                        description="Students enrolled this year" 
                        icon={Calendar} 
                        variant="default"
                    />
                    <StatsCard 
                        title="Total Student Body" 
                        value={stats.total_enrolled || 0} 
                        description="Active across all years" 
                        icon={Users} 
                        variant="info"
                    />
                    <StatsCard 
                        title="Growth Rate" 
                        value={`${stats.growth_rate}%`} 
                        description="Compared to last year" 
                        icon={TrendingUp} 
                        variant={stats.growth_rate >= 0 ? "success" : "destructive"} 
                    />
                    <StatsCard 
                        title="Top Program" 
                        value={topPrograms[0]?.program__name || "N/A"} 
                        description="Highest enrollment count" 
                        icon={BookOpen} 
                        variant="accent"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                    
                    {/* Enrollment Trend Chart (Span 4) */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Enrollment Trends (Last 5 Years)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80 relative">
                            {hasTrendData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trend}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                        <XAxis dataKey="enrollment_year" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{fill: 'hsl(var(--muted)/0.4)'}}
                                        />
                                        <Bar 
                                            dataKey="count" 
                                            name="Students" 
                                            fill="hsl(var(--primary))" 
                                            radius={[4, 4, 0, 0]} 
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-md">
                                    <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-sm">No historical enrollment data found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Demographics Pie Chart (Span 3) */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Intake Demographics</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderChartData}
                                        dataKey="value"
                                        nameKey="gender"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={hasGenderData ? 5 : 0}
                                    >
                                        {genderChartData.map((entry: any, index: number) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={hasGenderData ? COLORS[index % COLORS.length] : '#e2e8f0'} 
                                            />
                                        ))}
                                    </Pie>
                                    {hasGenderData && <Tooltip />}
                                    {hasGenderData && <Legend verticalAlign="bottom" height={36}/>}
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {!hasGenderData && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-xs text-muted-foreground font-medium bg-background/80 px-2 py-1 rounded">No Data</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Programs List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Programs by Intake</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topPrograms.length > 0 ? (
                                <div className="space-y-4">
                                    {topPrograms.map((item: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                    {index + 1}
                                                </div>
                                                <span className="text-sm font-medium">{item.program__name}</span>
                                            </div>
                                            <span className="text-sm font-bold">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                                    No enrollment data for current year.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Admissions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Admissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentAdmissions.length > 0 ? (
                                        recentAdmissions.map((student: any) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium text-xs">{student.id}</TableCell>
                                                <TableCell className="text-sm">{student.name}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{student.program}</TableCell>
                                                <TableCell className="text-right text-xs">{student.date}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                No recent admissions found.
                                            </TableCell>
                                        </TableRow>
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