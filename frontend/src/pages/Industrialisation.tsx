import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, Handshake, Rocket, DollarSign, Loader2, FolderOpen } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getIndustrialStats } from "@/services/analysis.services";

const COLORS = [
  "hsl(var(--primary))", 
  "hsl(var(--accent-foreground))", 
  "hsl(var(--success))", 
  "hsl(var(--info))", 
  "hsl(var(--muted-foreground))",
  "#FACC15",  // yellow fallback
  "#3B82F6",  // blue fallback
  "#F59E0B",  // amber fallback
  "#8B5CF6",  // purple fallback
  "#EF4444",  // red fallback
  "#10B981",  // green fallback
  "#6B7280",  // gray fallback
];
const SECTOR_COLORS: Record<string, string> = {
  edtech: "#FACC15",        // yellow
  energy: "#3B82F6",        // blue
  healthtech: "#F59E0B",    // amber
  manufacturing: "#8B5CF6", // purple
  mining: "#EF4444",        // red
  fintech: "#10B981",       // green
  agritech: "#6B7280",      // gray
  other: "#A855F7",          // custom purple
};

export default function Industrialisation() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getIndustrialStats()
            .then(setData)
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center h-[80vh] items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const formatMoney = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return "$0";
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD', 
            notation: "compact" 
        }).format(amount);
    };

    const stats = data?.stats || {};
    const sectors = data?.sectors || [];
    const partnerships = data?.partnerships || [];

    const hasSectorData = sectors.length > 0;
    const displaySectors = hasSectorData ? sectors : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

    // Map each sector to a unique color **outside JSX**
    const sectorColorsMap: Record<string, string> = displaySectors.reduce(
        (acc, sector, i) => {
            acc[sector.name] = COLORS[i % COLORS.length];
            return acc;
        },
        {} as Record<string, string>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                
                {/* Header */}
                <div className="pb-2 border-b">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Factory className="h-7 w-7 text-primary" /> 
                        Industrialisation
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor industry linkages, startups, and commercialization.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard 
                        title="Commercialized Products" 
                        value={stats.commercialized || 0} 
                        description="Market ready" 
                        icon={DollarSign} 
                        variant="success" 
                    />
                    <StatsCard 
                        title="Industry Partnerships" 
                        value={stats.partnerships || 0} 
                        description="Active Projects" 
                        icon={Handshake} 
                        variant="info" 
                    />
                    <StatsCard 
                        title="Student Startups" 
                        value={stats.startups || 0} 
                        description="Across All Institutions" 
                        icon={Rocket} 
                        variant="accent" 
                    />
                    <StatsCard 
                        title="Revenue Generated" 
                        value={formatMoney(stats.revenue)} 
                        description="Total Income" 
                        icon={DollarSign} 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Sector Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Sectors</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80 relative">
                            {!hasSectorData && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <span className="text-muted-foreground font-medium bg-background/80 px-2 py-1 rounded">
                                        No Sector Data
                                    </span>
                                </div>
                            )}
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    {hasSectorData && <Tooltip />}
                                    {hasSectorData && <Legend verticalAlign="bottom" height={36} />}
                                    <Pie
                                        data={displaySectors}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={0}
                                        stroke="none"
                                    >
                                        {displaySectors.map((entry) => (
                                            <Cell
                                                key={entry.name}
                                                fill={SECTOR_COLORS[entry.name]}
                                                opacity={1}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Partnership Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Key Industry Partners</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border max-h-[320px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Partner</TableHead>
                                            <TableHead>Focus Area</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {partnerships.length > 0 ? (
                                            partnerships.map((item: any, i: number) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-medium">{item.partner_name}</TableCell>
                                                    <TableCell>{item.focus_area}</TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {item.status}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-48 text-center">
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                        <FolderOpen className="h-8 w-8 mb-2 opacity-20" />
                                                        <p>No partnerships recorded.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
