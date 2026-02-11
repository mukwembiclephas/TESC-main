import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Loader2, BookOpen, Banknote } from "lucide-react";
import { toast } from "sonner";
import { updateProgramFee } from "@/services/analysis.services";

interface ProgramFee {
  id: number;
  name: string;
  semester_fee: number; // Reflecting the backend's returned value
}

export function ProgramFeeSettings({ programs, onUpdate }: { programs: ProgramFee[], onUpdate: () => void }) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleSave = async (programId: number) => {
    const input = document.getElementById(`fee-input-${programId}`) as HTMLInputElement;
    const newFee = parseFloat(input.value);

    if (isNaN(newFee)) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoadingId(programId);
    try {
      await updateProgramFee(programId, newFee);
      toast.success("Semester fee updated successfully");
      onUpdate(); // Refreshes the parent dashboard metrics
    } catch (error) {
      toast.error("Failed to update fee. Check permissions.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="shadow-none border-t-0 rounded-t-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-green-600" />
          Institutional Fee Pricing
        </CardTitle>
        <CardDescription>
          Configure the <strong>Semester Tuition</strong> for each program. 
          Student balances will update automatically based on these values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Program Name</TableHead>
                <TableHead className="w-[250px] font-bold">Semester Fee ($)</TableHead>
                <TableHead className="text-right font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs?.length > 0 ? (
                programs.map((program) => (
                  <TableRow key={program.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {program.name}
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                        <Input
                          id={`fee-input-${program.id}`}
                          type="number"
                          defaultValue={program.semester_fee || 0}
                          className="pl-7 h-10 bg-background"
                          placeholder="0.00"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSave(program.id)}
                        disabled={loadingId === program.id}
                        className="h-9 gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        {loadingId === program.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-60">
                      <BookOpen className="h-10 w-10" />
                      <p>No active programs found for this institution.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}