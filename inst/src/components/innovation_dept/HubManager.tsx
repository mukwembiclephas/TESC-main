import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Edit, Activity } from "lucide-react";
import { HubFormDialog } from "./HubFormDialog";

interface HubManagerProps {
  hubs: any[];
  onRefresh?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "High": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Medium": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Full": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-secondary";
  }
};

const HubManager = ({ hubs = [], onRefresh }: HubManagerProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-background p-1 rounded-lg">
         <div>
            <h2 className="text-lg font-semibold tracking-tight">Innovation Centers</h2>
            <p className="text-sm text-muted-foreground">Manage capacity and activity levels.</p>
         </div>
         <HubFormDialog onSuccess={onRefresh} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hubs.map((hub) => {
          const usage = hub.capacity > 0 ? (hub.occupied / hub.capacity) * 100 : 0;
          
          return (
            <Card key={hub.id} className="group hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: usage >= 100 ? '#ef4444' : '#3b82f6' }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Building2 className="h-5 w-5" />
                     </div>
                     <div>
                        <CardTitle className="text-base font-bold">{hub.name}</CardTitle>
                        <CardDescription className="text-xs">Capacity: {hub.capacity} Units</CardDescription>
                     </div>
                  </div>
                  
                  {/* Edit Button */}
                  <HubFormDialog 
                    hub={hub} 
                    onSuccess={onRefresh}
                    trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                        </Button>
                    }
                  />
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-4">
                  
                  {/* Status Badge */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5" /> Activity Level
                    </span>
                    <Badge variant="outline" className={getStatusColor(hub.status)}>
                        {hub.status} Activity
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Occupancy</span>
                      <span className={usage > 90 ? "text-red-600" : "text-muted-foreground"}>
                        {hub.occupied} / {hub.capacity} ({Math.round(usage)}%)
                      </span>
                    </div>
                    <Progress value={usage} className={`h-2 ${usage > 90 ? "bg-red-100" : "bg-secondary"}`} />
                  </div>

                </div>
              </CardContent>
            </Card>
          );
        })}

        {hubs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                <Building2 className="h-10 w-10 mb-2 opacity-20" />
                <p>No Innovation Hubs found.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default HubManager;