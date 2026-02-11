import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, Wallet, Percent, AlertTriangle, 
  TrendingDown, Loader2, FolderOpen, RefreshCcw 
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from "recharts";
import { useFinancialAnalysis } from "@/hooks/useFinancialAnalysis";

export default function PaymentsAndFees() {
  const { stats, feeStructure, paymentData, loading, error, refresh } = useFinancialAnalysis();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: 'USD',
      notation: "compact",
      maximumFractionDigits: 1
    }).format(amount || 0);
  };

  console.log("Stats:", stats);
  console.log("Payment Data:", paymentData);
  console.log("Fee Structure:", feeStructure);

  const hasPaymentData = paymentData && paymentData.length > 0 && paymentData.some(d => d.Collected > 0 || d.Target > 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Aggregating National Financial Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-[80vh] gap-4 text-red-600">
          <p>{error}</p>
          <Button onClick={refresh}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2 border-b flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wallet className="h-7 w-7 text-green-600" />
              Payments & Fees Management
            </h1>
            <p className="text-muted-foreground">National overview of revenue collection and fee compliance.</p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Pending Fees" value={formatCurrency(stats.totalPending)} description="Global outstanding student debt" icon={AlertTriangle} variant="destructive"/>
          <StatsCard title="Collection Rate" value={`${stats.complianceRate?.toFixed(1) || 0}%`} description="National revenue compliance" icon={Percent} variant="success"/>
          <StatsCard title="Debtors Count" value={stats.studentsWithPending || 0} description="Students with balances" icon={TrendingDown} variant="warning"/>
          <StatsCard title="Total Revenue (YTD)" value={formatCurrency(stats.totalCollectedYTD)} description="Collected across all institutions" icon={DollarSign} variant="info"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Monthly National Collection</CardTitle></CardHeader>
            <CardContent>
              <div className="h-80 relative">
                {!hasPaymentData ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/50 z-10">
                    <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">No historical payment data found.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(val) => formatCurrency(val)} />
                      <Tooltip formatter={(val: number) => formatCurrency(val)} />
                      <Legend />
                      <Bar dataKey="Target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Expected" />
                      <Bar dataKey="Collected" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fee Table */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Program Fee Benchmarks</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program Name</TableHead>
                    <TableHead className="text-right">Avg. Annual Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructure.length > 0 ? feeStructure.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{item.name}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{formatCurrency(item.annual_fee)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-32 text-center text-muted-foreground">
                        No fee structures defined in the system.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
