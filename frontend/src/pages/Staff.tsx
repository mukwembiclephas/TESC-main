import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaffView } from "@/components/staff view";
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

import { useState, useMemo, useEffect } from "react";
import { getAllStaff } from "@/services/academic.service";
import { Staff } from "@/lib/types/academic.types";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaffStatistics } from "@/hooks/useStaff";
import { exportToExcel } from "@/lib/export-utils"; // Import the helper
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

export default function StaffPage() {
  // --- STATS HOOK ---
  const { data: statsData, loading: statsLoading } = useStaffStatistics();
  const handleExport = () => {
    // We export the filtered list so the user gets what they see on screen
    // Or use 'allStaff' if you want everything regardless of filters
    exportToExcel(filteredStaff, `Staff_Report_${new Date().toLocaleDateString()}`);
  };
  // --- STATE ---
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getAllStaff();
        // Since your API returns a direct list [], we use it directly
        setAllStaff(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // --- FILTER LOGIC ---
  const filteredStaff = useMemo(() => {
    if (!allStaff) return [];
    return allStaff.filter((staff) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        staff.full_name.toLowerCase().includes(search) ||
        staff.employee_id.toLowerCase().includes(search) ||
        (staff.email && staff.email.toLowerCase().includes(search));
      
      const matchesStatus =
        selectedStatus === "all" || 
        (selectedStatus === "Active" ? staff.is_active : !staff.is_active);
        
      return matchesSearch && matchesStatus;
    });
  }, [allStaff, searchTerm, selectedStatus]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStaff, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  if (isLoading && statsLoading) {
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Staff Records</h1>
              <p className="text-muted-foreground">Manage and track institutional personnel</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={filteredStaff.length === 0}>
      <Download className="mr-2 h-4 w-4" /> Export to Excel
    </Button>
              
            </div>
          </div>

          {/* Stats Cards using the useStaffStatistics hook */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard 
              title="Total Staff" 
              value={statsData?.kpis.total.toLocaleString() || "0"} 
              icon={Users} 
              variant="accent" 
            />
            <StatsCard 
              title="Active Staff" 
              value={statsData?.kpis.active.toLocaleString() || "0"} 
              icon={UserCheck} 
              variant="success" 
            />
            <StatsCard 
              title="Inactive Staff" 
              value={statsData?.kpis.inactive.toLocaleString() || "0"} 
              icon={Users} 
              variant="warning" 
            />
            <StatsCard 
              title="Active Rate" 
              value={`${statsData?.kpis.active_rate || 0}%`} 
              icon={UserCheck} 
              variant="success" 
            />
          </div>

          {/* Search & Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" /> Search and Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Search by name, ID or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Staff Table */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-4">
              <div>
                <CardTitle>Personnel List ({filteredStaff.length})</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {filteredStaff.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredStaff.length)}
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
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
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
                        <AlertCircle className="inline-block mr-2" /> Failed to load staff data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.employee_id}</TableCell>
                        <TableCell>{staff.full_name}</TableCell>
                        <TableCell>{staff.institution_name}</TableCell>
                        <TableCell>{staff.department_name || "N/A"}</TableCell>
                        <TableCell>{staff.position}</TableCell>
                        <TableCell>
                          <Badge variant={staff.is_active ? "default" : "outline"}>
                            {staff.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedStaff(staff)}>
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

      {/* Profile View Modal */}
      <StaffView data={selectedStaff} setData={setSelectedStaff} />
    </>
  );
}