import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Import Input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit2,
  HeartHandshake,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Search, // Import Search icon
} from "lucide-react";
import { getStudents, Student } from "@/services/students.services";
import { useAuth } from "@/context/AuthContext";
import { SupportEditDialog } from "@/components/SupportEditDialog";

const ITEMS_PER_PAGE = 50;

export default function SupportDirectory() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Search state

  // Filters State
  const [iseopFilter, setIseopFilter] = useState<string>("all");
  const [disabilityFilter, setDisabilityFilter] = useState<string>("all");
  const [workFilter, setWorkFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { user } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getStudents({
        institution: user.institution.id,
      });
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Filtering & Search Logic
  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => {
      // Search Logic (Name or ID)
      const matchesSearch = 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchIseop =
        iseopFilter === "all" ||
        (iseopFilter === "yes" ? s.is_iseop : !s.is_iseop);
      
      const matchDisability =
        disabilityFilter === "all" || s.disability_type === disabilityFilter;
      
      const matchWork =
        workFilter === "all" ||
        (workFilter === "yes" ? s.is_work_for_fees : !s.is_work_for_fees);

      return matchesSearch && matchIseop && matchDisability && matchWork;
    });
  }, [students, searchTerm, iseopFilter, disabilityFilter, workFilter]);

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, iseopFilter, disabilityFilter, workFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HeartHandshake className="text-primary" />
            Enrollment Support Manager
          </h1>
          <p className="text-muted-foreground text-sm">
            Targeted management for ISEOP and Special Needs groups.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            ISEOP Status
          </label>
          <Select value={iseopFilter} onValueChange={setIseopFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="yes">ISEOP Enrolled</SelectItem>
              <SelectItem value="no">Non-ISEOP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Disability Type
          </label>
          <Select value={disabilityFilter} onValueChange={setDisabilityFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Physical">Physical</SelectItem>
              <SelectItem value="Albino">Albino</SelectItem>
              <SelectItem value="Visual">Visual</SelectItem>
              <SelectItem value="Hearing">Hearing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Work Program
          </label>
          <Select value={workFilter} onValueChange={setWorkFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="yes">On Work-for-Fees</SelectItem>
              <SelectItem value="no">No Work Pledged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-md bg-card min-h-[400px] relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Student</TableHead>
              <TableHead>ISEOP Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Work Program</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Fetching records...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <Inbox className="h-10 w-10" />
                    <p>No students found matching these filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.full_name}</div>
                    <div className="text-xs text-muted-foreground">{s.student_id}</div>
                  </TableCell>
                  <TableCell>
                    {s.is_iseop ? (
                      <Badge className="bg-green-600 hover:bg-green-600">ISEOP</Badge>
                    ) : (
                      <Badge variant="outline">Standard</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{s.disability_type || "None"}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.is_work_for_fees ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-blue-600">{s.work_area}</span>
                        <span className="text-[10px] text-muted-foreground">{s.hours_pledged} Hours</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedStudent(s)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredStudents.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{paginatedStudents.length}</span> of{" "}
            <span className="font-medium">{filteredStudents.length}</span> students
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="text-sm font-medium px-2">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog placed outside of TableBody for better performance */}
      {selectedStudent && (
        <SupportEditDialog
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSuccess={() => {
            setSelectedStudent(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}