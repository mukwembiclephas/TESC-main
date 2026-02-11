import { useState } from "react";
import { useInstitutionalFinance } from "@/hooks/useInstitutionalFinance";
import { StatsCard } from "@/components/common/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Plus,
  Users,
} from "lucide-react";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";
import { FinanceStudentTable } from "@/components/FinanceStudentTable"; // New component
import { ProgramFeeSettings } from "@/components/ProgramFeeSettings";
export default function InstitutionalFinance() {
  const { data, loading, refresh } = useInstitutionalFinance();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  if (loading) return <p className="p-8 text-center animate-pulse">Loading Finance Data...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="text-primary" /> Finance & Bursar Office
          </h1>
          <p className="text-muted-foreground">
            Revenue tracking based on <strong>Active</strong> students (Current Semester).
          </p>
        </div>
        <Button onClick={() => setIsPaymentDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Record Payment
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <ArrowUpRight className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" /> Student Ledger
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Plus className="h-4 w-4" /> Fee Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Collection Rate"
              value={`${data?.stats.complianceRate}%`}
              variant="success"
              icon={CheckCircle}
              description="Against Active semester targets"
            />
            <StatsCard
              title="Semester Arrears"
              value={`$${data?.stats.totalPending.toLocaleString()}`}
              variant="destructive"
              icon={AlertTriangle}
              description="Total unpaid for Active students"
            />
            <StatsCard
              title="Total Active"
              value={data?.stats.studentsWithPending}
              variant="warning"
              icon={Users}
              description="Students currently being billed"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Semester Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead className="text-right">Per Semester</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.fee_structure.map((fee: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{fee.program__name}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ${Number(fee.semester_fee).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Arrears (Active Only)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.top_pending?.map((student: any) => (
                      <TableRow key={student.student_id}>
                        <TableCell>
                          <div className="font-medium">{student.full_name}</div>
                          <div className="text-xs text-muted-foreground">{student.student_id}</div>
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-bold">
                          ${student.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <FinanceStudentTable />
        </TabsContent>
        
        <TabsContent value="settings">
          <ProgramFeeSettings
            programs={data?.fee_structure.map((f: any) => ({
                id: f.program_id,
                name: f.program__name,
                semester_fee: f.semester_fee
            })) || []}
            onUpdate={refresh}
          />
        </TabsContent>
      </Tabs>

      <RecordPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSuccess={refresh}
      />
    </div>
  );
}