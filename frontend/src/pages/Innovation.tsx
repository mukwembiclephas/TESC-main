import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Factory, Globe, Zap, Loader2, FolderOpen } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInnovationStats, useDetailedInnovations } from "@/hooks/useInnovationAnalytics";

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold">{label}</p>
        <p style={{ color: payload[0].stroke || payload[0].fill }}>
          {`${payload[0].name}: ${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

// Pipeline visualization component
function InnovationStageFlow({ data, total }: { data: { stage: string; count: number; color: string }[], total: number }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle>Innovation Project Pipeline</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((item) => (
              <div key={item.stage} className="flex items-center space-x-4">
                <span className="w-32 text-sm font-medium text-muted-foreground">{item.stage}</span>
                <div className="flex-grow bg-muted rounded-full h-3 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / (total || 1)) * 100}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="w-10 text-right font-bold" style={{ color: item.color }}>{item.count}</span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FolderOpen className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No active projects in the pipeline.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function InnovationOverview() {
  const { data: stats, loading: statsLoading } = useInnovationStats();
  const { data: projects, loading: projectsLoading } = useDetailedInnovations();

  const loading = statsLoading || projectsLoading;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const pipelineProjects = projects || [];

  // Map API stage names to internal keys
  const stageNameMap: Record<string, string> = {
    'Ideation': 'ideation',
    'Prototyping': 'prototype',
    'Incubation': 'incubation',
    'Market Ready': 'market_ready',
    'Scaling / Startup': 'scaling',
    'Industrialised': 'industrial',
  };

  const stageOrder = ['ideation', 'prototype', 'incubation', 'market_ready', 'scaling', 'industrial'];

  const stageColors: Record<string, string> = {
    ideation: '#FACC15',      // yellow
    prototype: '#F59E0B',     // amber
    incubation: '#8B5CF6',    // purple
    market_ready: '#10B981',  // green
    scaling: '#6B7280',       // gray
    industrial: '#EF4444',    // red
  };

  // Count projects per stage
  const stageCounts = stageOrder.reduce<Record<string, number>>((acc, stage) => {
    acc[stage] = pipelineProjects.filter(p => stageNameMap[p.stage] === stage).length;
    return acc;
  }, {});

  // Build pipeline data
  const pipelineData = stageOrder.map(stage => ({
    stage: stage.charAt(0).toUpperCase() + stage.slice(1),
    count: stageCounts[stage],
    color: stageColors[stage],
  }));

  const totalProjects = pipelineData.reduce((sum, item) => sum + item.count, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2 border-b">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-accent" />
            Innovation Lifecycle Management
          </h1>
          <p className="text-muted-foreground">
            Track progress of all projects across Ideation, Prototyping, and Commercialisation phases.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Projects in Pipeline" value={stats.total_projects || 0} description="Total active projects" icon={Zap} variant="accent" />
          <StatsCard title="Industrialised Projects" value={stats.industrial || 0} description="Moved past prototype stage" icon={Factory} variant="info" />
          <StatsCard title="Innovation Hubs" value={stats.innovation_hubs || 0} description="Across all institutions" icon={Globe} />
        </div>

        {/* Charts & Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InnovationStageFlow data={pipelineData} total={totalProjects} />
        </div>

        {/* Detailed Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Project Activity</CardTitle>
            <p className="text-sm text-muted-foreground">List of recently updated projects across the ecosystem.</p>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineProjects.length > 0 ? pipelineProjects.map(item => {
                    const stageColorsClass: Record<string, string> = {
                      ideation: 'bg-yellow-100 text-yellow-700',
                      prototype: 'bg-amber-100 text-amber-700',
                      incubation: 'bg-purple-100 text-purple-700',
                      market_ready: 'bg-green-100 text-green-700',
                      scaling: 'bg-gray-100 text-gray-700',
                      industrial: 'bg-red-100 text-red-700',
                    };
                    const stageKey = stageNameMap[item.stage];
                    const colorClass = stageColorsClass[stageKey] || 'bg-gray-100 text-gray-700';

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.institution}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                            {item.stage}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p>No projects found.</p>
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
    </DashboardLayout>
  );
}
