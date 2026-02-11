import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Receipt, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { getStudents } from "@/services/students.services";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";

export function FinanceStudentTable() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuth();

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    if (!user?.institution?.id) return;
    setLoading(true);
    try {
      const data = await getStudents({ institution: user.institution.id });
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch student finance data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.institution?.id]);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    return students.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.student_id?.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  return (
    <Card className="shadow-none border-t-0 rounded-t-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-6">
        <div>
          <CardTitle className="text-lg">Student Ledger Directory</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tracking balances for <strong>Active</strong> students.
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or ID..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Student</TableHead>
                <TableHead className="font-bold">Program</TableHead>
                <TableHead className="font-bold">Semester Fee</TableHead>
                <TableHead className="font-bold">Total Paid</TableHead>
                <TableHead className="font-bold">Current Balance</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((s) => {
                  const fee = Number(s.semester_fee || 0);
                  const paid = Number(s.total_paid || 0);
                  const balance = fee - paid;

                  return (
                    <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-semibold">{s.full_name}</div>
                        <div className="text-[10px] uppercase text-muted-foreground font-mono">
                          {s.student_id}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">
                        {s.program_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${fee.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ${paid.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                            ${balance.toLocaleString()}
                          </span>
                          {balance > 0 && <AlertCircle className="h-3 w-3 text-red-400" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 border-primary/20 hover:bg-primary hover:text-white transition-all"
                          onClick={() => setSelectedId(s.student_id)}
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          Pay Fees
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- Pagination Controls --- */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of {filtered.length} students
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center justify-center text-sm font-medium w-20">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0 || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>

      <RecordPaymentDialog
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
        initialStudentId={selectedId}
        onSuccess={loadData}
      />
    </Card>
  );
}