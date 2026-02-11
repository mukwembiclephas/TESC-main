import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentView } from "@/components/student view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserCheck, 
  Download, 
  Filter, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import AddStudent from "@/modules/students/AddStudent";

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents } from "@/services/student.service";
import { Student } from "@/lib/types/academic.types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpecialEnrollment } from "@/hooks/useSpecialEnrollment";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
  </TableRow>
);

export default function Students() {
  const navigate = useNavigate();
  const [addStudent, setAddStudent] = useState(false);
  
  const { data: specialData, loading: specialLoading } = useSpecialEnrollment();

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [student,setstudent] =useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const students = await getAllStudents();
        setAllStudents(students || []);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!allStudents) return [];
    return allStudents.filter((student) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        student.full_name.toLowerCase().includes(search) ||
        student.student_id.toLowerCase().includes(search);
      const matchesStatus =
        selectedStatus === "all" || student.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [allStudents, searchTerm, selectedStatus]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const totalStudents = allStudents?.length || 0;
  const femaleStudents = allStudents?.filter((s) => s.gender === "Female").length || 0;
  const femalePercentage = totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(1) : "0";
  const maleStudents = allStudents?.filter((s) => s.gender === "Male").length || 0;
  const malePercentage = totalStudents > 0 ? ((maleStudents / totalStudents) * 100).toFixed(1) : "0";
  const disabledCount = specialData?.counts?.disabled || 0;
  const specialPercentage = totalStudents > 0 ? ((disabledCount / totalStudents) * 100).toFixed(1) : "0";

  if (isLoading && specialLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Student Records</h1>
              <p className="text-muted-foreground">Manage and track student information</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button onClick={() => setAddStudent(true)}>Add Student</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Students" value={totalStudents.toLocaleString()} icon={Users} variant="accent" />
            <StatsCard title="Female Students" value={femaleStudents.toLocaleString()} description={`${femalePercentage}%`} icon={UserCheck} variant="success" />
            <StatsCard title="Male Students" value={maleStudents.toLocaleString()} description={`${malePercentage}%`} icon={UserCheck} variant="success" />
            <StatsCard title="Special Support" value={disabledCount.toLocaleString()} description={`${specialPercentage}%`} icon={Users} variant="warning" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" /> Search and Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Attachment">Attachment</SelectItem>
                    <SelectItem value="Graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Student Records Table */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-4">
              <div>
                <CardTitle>Student Records ({filteredStudents.length})</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="text-sm font-medium px-2">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || totalPages === 0}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-red-500 py-10">
                        <AlertCircle className="inline-block mr-2" /> Failed to load data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.institution_name}</TableCell>
                        <TableCell>{student.program_name}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === "Active" ? "default" : "outline"}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={()=>setstudent(student)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      <StudentView data={student} setdata={setstudent}/>

      <AddStudent open={addStudent} onOpenChange={setAddStudent} />
    </>
  );
}