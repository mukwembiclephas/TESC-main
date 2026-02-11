import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Handshake, Calendar, Search } from "lucide-react";
import { PartnershipFormDialog } from "./Partnership";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PartnershipManagerProps {
  partnerships: any[];
  onRefresh?: () => void;
}

const PartnershipManager = ({ partnerships = [], onRefresh }: PartnershipManagerProps) => {
  const [search, setSearch] = useState("");

  const filteredPartnerships = partnerships.filter(p => 
    p.partner_name.toLowerCase().includes(search.toLowerCase()) ||
    p.focus_area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" /> Strategic Partnerships
            </CardTitle>
            <CardDescription>
              Manage MOUs and industry collaborations.
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search partners..." 
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <PartnershipFormDialog onSuccess={onRefresh} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Partner Organization</TableHead>
                <TableHead>Focus Area</TableHead>
                <TableHead>Agreement Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartnerships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No partnerships found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPartnerships.map((partner) => (
                  <TableRow key={partner.id} className="hover:bg-muted/5">
                    <TableCell className="font-medium">
                      {partner.partner_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {partner.focus_area}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(partner.agreement_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={partner.status === 'Active' ? 'default' : 'secondary'}
                        className={partner.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' : ''}
                      >
                        {partner.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <PartnershipFormDialog 
                         partnership={partner} 
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

export default PartnershipManager;