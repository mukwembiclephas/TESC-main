import { useState } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Filter, Briefcase, MapPin, Banknote, TrendingUp, Users, Edit, Building2 
} from "lucide-react";
import { ProjectFormDialog } from "./InnovationForms";

// Helper for stage colors
const getStageColor = (stage: string) => {
  switch (stage) {
    case 'ideation': return "bg-gray-100 text-gray-800 border-gray-200";
    case 'prototype': return "bg-purple-100 text-purple-800 border-purple-200";
    case 'incubation': return "bg-blue-100 text-blue-800 border-blue-200";
    case 'market_ready': return "bg-green-100 text-green-800 border-green-200";
    case 'scaling': return "bg-amber-100 text-amber-800 border-amber-200";
    case 'industrial': return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default: return "bg-secondary text-secondary-foreground";
  }
};

interface ProjectManagerProps {
  projects: any[];
  onRefresh?: () => void;
}

const ProjectManager = ({ projects = [], onRefresh }: ProjectManagerProps) => {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.team_name.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || p.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-background p-1 rounded-lg">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="ideation">Ideation</SelectItem>
              <SelectItem value="prototype">Prototyping</SelectItem>
              <SelectItem value="incubation">Incubation</SelectItem>
              <SelectItem value="market_ready">Market Ready</SelectItem>
              <SelectItem value="scaling">Scaling / Startup</SelectItem>
              <SelectItem value="industrial">Industrialised</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Create Button */}
        <ProjectFormDialog onSuccess={onRefresh} />
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 flex flex-col" style={{ borderLeftColor: project.stage === 'industrial' ? '#4f46e5' : 'transparent' }}>
            <CardHeader className="pb-3 relative">
              <div className="flex justify-between items-start mb-2">
                <Badge className={`uppercase text-[10px] font-bold tracking-wider ${getStageColor(project.stage)}`}>
                  {project.stage_display || project.stage}
                </Badge>
                
                {/* EDIT BUTTON */}
                <ProjectFormDialog 
                  project={project} 
                  onSuccess={onRefresh}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground hover:text-foreground">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
              </div>
              
              <CardTitle className="text-xl font-bold leading-tight line-clamp-1 pr-6" title={project.name}>
                {project.name}
              </CardTitle>
              
              <div className="flex flex-col gap-1 mt-1">
                <CardDescription className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="truncate">{project.sector_display || project.sector}</span>
                </CardDescription>
                {project.hub_name && (
                   <CardDescription className="flex items-center gap-2 text-indigo-600">
                     <Building2 className="w-3.5 h-3.5" />
                     <span className="truncate font-medium">{project.hub_name}</span>
                   </CardDescription>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-3 flex-1">
              <div className="mb-4">
                 <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {project.problem_statement || "No description provided."}
                 </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                 <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Revenue
                    </p>
                    <p className="text-sm font-bold text-emerald-600">
                        ${parseFloat(project.revenue_generated || '0').toLocaleString()}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> Funding
                    </p>
                    <p className="text-sm font-bold text-blue-600">
                        ${parseFloat(project.funding_acquired || '0').toLocaleString()}
                    </p>
                 </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 flex justify-between items-center text-sm text-muted-foreground">
               <div className="flex items-center gap-1.5" title="Team Name">
                  <Users className="w-4 h-4" />
                  <span className="font-medium text-foreground truncate max-w-[120px]">
                    {project.team_name}
                  </span>
               </div>
               {project.jobs_created > 0 && (
                 <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                    {project.jobs_created} Jobs
                 </Badge>
               )}
            </CardFooter>
          </Card>
        ))}
        
        {filteredProjects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
            <Filter className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-lg font-medium">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;