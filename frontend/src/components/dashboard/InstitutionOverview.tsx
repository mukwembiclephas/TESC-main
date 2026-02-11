import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, GraduationCap, Building } from "lucide-react";
import { DashboardService, InstitutionOverviewItem } from "@/services/admin.dashboard.service";

export function InstitutionOverview() {
  const [institutions, setInstitutions] = useState<InstitutionOverviewItem[]>([]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      const data = await DashboardService.getInstitutionOverview();
      setInstitutions(data);
    };
    fetchInstitutions();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Institution Overview (Top 10)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {institutions.length === 0 ? (
             <div className="text-center text-muted-foreground py-8">No active institutions found</div>
          ) : (
            institutions.map((institution) => (
              <div key={institution.id} className="p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-base">{institution.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {institution.location}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="hidden sm:inline-flex">{institution.type}</Badge>
                    <Badge 
                      variant={institution.status === "Active" ? "default" : "secondary"}
                    >
                      {institution.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <Users className="h-3 w-3" />
                      Students
                    </div>
                    <div className="font-semibold">{institution.students.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <Building className="h-3 w-3" />
                      Capacity
                    </div>
                    <div className="font-semibold">{institution.capacity.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <GraduationCap className="h-3 w-3" />
                      Programs
                    </div>
                    <div className="font-semibold">{institution.programs}</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                    <span>Utilization</span>
                    <span className={institution.utilization > 100 ? "text-red-500 font-bold" : ""}>
                      {institution.utilization}%
                    </span>
                  </div>
                  <Progress 
                    value={institution.utilization} 
                    className="h-2"
                    // Add a conditional class for color if supported by your Progress component, 
                    // or handle via style override if needed for over-utilization
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}