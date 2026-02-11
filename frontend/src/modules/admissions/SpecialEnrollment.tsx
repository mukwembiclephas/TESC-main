import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, UserCheck, CreditCard, Loader2, Inbox } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useSpecialEnrollment } from "@/hooks/useSpecialEnrollment";

export default function SpecialEnrollment() {
  const { data, pieData, loading } = useSpecialEnrollment();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="pb-2 border-b">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-7 w-7 text-primary" />
            Special Enrollment & Support
          </h1>
          <p className="text-muted-foreground">Backend-synchronized tracking for student assistance programs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Special Needs Total"
            value={data?.counts.disabled || 0}
            icon={User}
            variant="accent"
          />
          <StatsCard
            title="Work-for-Fees"
            value={data?.counts.work_for_fees || 0}
            icon={CreditCard}
            variant="info"
          />
          <StatsCard
            title="ISEOP Enrollment"
            value={data?.counts.iseop || 0}
            icon={UserCheck}
            variant="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>Disability Categories</CardTitle></CardHeader>
            <CardContent className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-50"><Inbox className="mb-2" /> No records.</div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Work-for-Fees Allocation</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Area</TableHead>
                    <TableHead className="text-center">Count</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.work_for_fees.map((item) => (
                    <TableRow key={item.work_area}>
                      <TableCell>{item.work_area}</TableCell>
                      <TableCell className="text-center">{item.students}</TableCell>
                      <TableCell className="text-right">{item.hours} hrs</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}