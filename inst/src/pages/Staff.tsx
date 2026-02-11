import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  MoreVertical,
  Filter,
  Mail,
  Phone,
  Users,
  TrendingDown,
  Briefcase,
  GraduationCap,
  Award,
  Loader2,
  UserCog, // Generic icon
  Shield, // Admin icon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddStaffDialog } from "@/components/AddStaffDialog";
import { 
  getStaff,
  Staff as StaffType,
  getVacancies,
  Vacancy,
} from "@/services/staff.services";
import { AddVacancyDialog } from "@/components/AddVacancyDialog";
import { UploadStaffDialog } from "@/components/helpers/UploadStaffDialog";
import { exportStaffToExcel } from "@/services/staff.services";

const Staff = () => {
  const { user } = useAuth();

  const [staff, setStaff] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterFaculty, setFilterFaculty] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [vacanciesLoading, setVacanciesLoading] = useState(true);

  // 1. Fetch Staff
  const fetchStaff = useCallback(async () => {
    if (!user?.institution?.id) return;
    try {
      setLoading(true);
      const data = await getStaff({ institution_id: user.institution.id });
      if (Array.isArray(data)) setStaff(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 2. Fetch Vacancies
  const fetchVacancies = useCallback(async () => {
    if (!user?.institution?.id) return;
    try {
      setVacanciesLoading(true);
      const data = await getVacancies(user.institution.id);
      
      if (Array.isArray(data)) setVacancies(data);
    } catch (error) {
      console.error("Failed to fetch vacancies:", error);
    } finally {
      setVacanciesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStaff();
    fetchVacancies();
  }, [fetchStaff, fetchVacancies]);

  // --- DYNAMIC CALCULATIONS ---

  // 1. Calculate counts for every unique position found in the data
  const roleStats = useMemo(() => {
    return staff.reduce((acc, person) => {
        const role = person.position || "Other";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
  }, [staff]);

  // 2. Helper to get icon based on role name
  const getRoleIcon = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('professor')) return <Award className="h-4 w-4" />;
    if (r.includes('lecturer')) return <GraduationCap className="h-4 w-4" />;
    if (r.includes('assistant')) return <Users className="h-4 w-4" />;
    if (r.includes('admin')) return <Shield className="h-4 w-4" />;
    return <UserCog className="h-4 w-4" />;
  };

  // --- Filtering ---
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      (s.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (s.employee_id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (s.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filterDepartment === "all" || s.department_name === filterDepartment;
    const matchesFaculty =
      filterFaculty === "all" ||
      (s.faculty_name || "Unassigned") === filterFaculty;

    return matchesSearch && matchesDepartment && matchesFaculty;
  });

  const uniqueDepartments = Array.from(new Set(staff.map((s) => s.department_name).filter(Boolean)));
  const uniqueFaculties = Array.from(new Set(staff.map((s) => s.faculty_name).filter(Boolean)));

  const handleExport = () => {
    if (filteredStaff.length === 0) return;
    const dateStr = new Date().toISOString().split('T')[0];
    exportStaffToExcel(filteredStaff, `Staff_Export_${dateStr}.xlsx`);
  };

  const handleViewProfile = (staffMember: StaffType) => {
    setSelectedStaff(staffMember);
    setShowProfile(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage academic and non-academic staff for{" "}
          <span className="font-semibold text-primary">
            {user?.institution?.name}
          </span>
        </p>
      </div>

      {/* --- DYNAMIC STATS GRID --- */}
      <div className="grid gap-4 md:grid-cols-4">
        
        {/* Always keep Total Staff card */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Staff</CardDescription>
            <CardTitle className="text-3xl">{staff.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All departments</p>
          </CardContent>
        </Card>

        {/* Generate a card for each role found in DB */}
        {Object.entries(roleStats).map(([role, count]) => (
            <Card key={role}>
                <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                        {getRoleIcon(role)}
                        {role}s {/* Simple pluralization */}
                    </CardDescription>
                    <CardTitle className="text-3xl">
                        {count}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Active records</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vacant Positions</CardTitle>
              <CardDescription>
                Open positions awaiting recruitment
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 hover:bg-amber-200"
              >
                {vacancies.length} Open
              </Badge>
              <AddVacancyDialog
                institutionId={user?.institution?.id}
                onVacancyAdded={fetchVacancies}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vacanciesLoading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Loading vacancies...
              </div>
            ) : vacancies.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No active job openings.
              </div>
            ) : (
              vacancies.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{position.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {position.faculty ? `${position.faculty_name} - ` : ""}
                        {position.department_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">
                        {position.quantity} position(s)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Deadline: {position.deadline}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>
                View and manage all staff members
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <UploadStaffDialog onSuccess={fetchStaff} />
              <AddStaffDialog
                onStaffAdded={fetchStaff}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterFaculty} onValueChange={setFilterFaculty}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {uniqueFaculties.map((fac) => (
                  <SelectItem key={fac} value={fac as string}>
                    {fac}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterDepartment}
              onValueChange={setFilterDepartment}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept as string}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <span className="text-xs text-muted-foreground mt-2 block">
                        Loading Staff...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No staff members found for {user?.institution?.name}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staff) => (
                    <TableRow
                      key={staff.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewProfile(staff)}
                    >
                      <TableCell className="font-medium">
                        {staff.employee_id}
                      </TableCell>
                      <TableCell>{staff.full_name}</TableCell>
                      <TableCell>{staff.position}</TableCell>
                      <TableCell>{staff.faculty_name || "N/A"}</TableCell>
                      <TableCell>{staff.department_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{staff.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{staff.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={staff.is_active ? "default" : "secondary"}
                          className={
                            staff.is_active
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-gray-500"
                          }
                        >
                          {staff.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewProfile(staff)}
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Suspend Staff
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredStaff.length} of {staff.length} staff members
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* ... Profile details (same as before) ... */}
          <DialogHeader>
            <DialogTitle className="text-2xl">Staff Profile</DialogTitle>
            <DialogDescription>
              Detailed information and qualifications
            </DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedStaff.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedStaff.position}
                  </p>
                  <Badge
                    variant={selectedStaff.is_active ? "default" : "secondary"}
                    className={`mt-2 ${
                      selectedStaff.is_active ? "bg-green-600" : ""
                    }`}
                  >
                    {selectedStaff.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{selectedStaff.employee_id}</p>
                  <p className="text-muted-foreground">
                    Joined: {selectedStaff.date_joined}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Department Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Institution:
                      </span>
                      <p className="font-medium">
                        {selectedStaff.institution_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Faculty:</span>
                      <p className="font-medium">
                        {selectedStaff.faculty_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <p className="font-medium">{selectedStaff.department_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Specialization:
                      </span>
                      <p className="font-medium">
                        {selectedStaff.specialization || "Not Specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{selectedStaff.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{selectedStaff.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Academic Qualifications
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Award className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm">
                      Highest Qualification:{" "}
                      <strong>{selectedStaff.qualification}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Edit Profile</Button>
                <Button variant="outline" className="flex-1">
                  Download CV
                </Button>
                <Button variant="outline">Reset Password</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Staff;