import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Banknote, Calendar, Search, ArrowUpRight } from "lucide-react";
import { GrantFormDialog } from "./GrantFormDialog";

interface GrantManagerProps {
  grants: any[];
  onRefresh?: () => void;
}

const GrantManager = ({ grants = [], onRefresh }: GrantManagerProps) => {
  const [search, setSearch] = useState("");

  const filteredGrants = grants.filter(g => 
    g.donor.toLowerCase().includes(search.toLowerCase()) ||
    (g.project_name && g.project_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" /> Research Grants
            </CardTitle>
            <CardDescription>
              Track funding received for specific projects.
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search donor or project..." 
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <GrantFormDialog onSuccess={onRefresh} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Donor / Organization</TableHead>
                <TableHead>Linked Project</TableHead>
                <TableHead>Amount Awarded</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No grants recorded.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGrants.map((grant) => (
                  <TableRow key={grant.id} className="hover:bg-muted/5">
                    <TableCell className="font-medium">
                      {grant.donor}
                    </TableCell>
                    <TableCell>
                      {grant.project_name ? (
                        <div className="flex items-center gap-1 text-primary">
                             <ArrowUpRight className="h-3 w-3" />
                             {grant.project_name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Unlinked</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-emerald-600">
                      ${parseFloat(grant.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(grant.date_awarded).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                       <GrantFormDialog 
                         grant={grant} 
                         onSuccess={onRefresh} 
                         trigger={
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                             <Edit className="h-4 w-4 text-muted-foreground" />
                           </Button>
                         }
                       />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrantManager;