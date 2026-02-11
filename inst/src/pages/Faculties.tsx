import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  MapPin,
  Mail,
  Loader2, // Added loader icon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Components & Services
import { AddFacultyDialog } from "@/components/AddFacultyDialog";
import { ManageDepartmentsDialog } from "@/components/ManageDepartmentsDialog"; // Import new dialog
import { getFaculties, Faculty } from "@/services/faculties.services"; // Updated import path
import { useAuth } from "@/context/AuthContext";

const Faculties = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFaculties = async () => {
    if (!user?.institution?.id) return;
    
    try {
      setLoading(true);
      const data = await getFaculties(user.institution.id);
      
      if (Array.isArray(data)) {
        setFaculties(data);
      } else {
        console.error("Received invalid data format:", data);
        setFaculties([]);
      }
    } catch (error) {
      console.error("Failed to fetch faculties:", error);
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, [user]); // Add user dependency

  const filteredFaculties = faculties.filter((faculty) => {
    const query = searchQuery.toLowerCase();
    return (
      faculty.name.toLowerCase().includes(query) ||
      (faculty.dean && faculty.dean.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Faculties</h1>
        <p className="text-muted-foreground mt-1">
          Manage faculty departments, deans, and resource allocations
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculties or deans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Add Faculty Dialog */}
        {user?.institution?.id && (
            <AddFacultyDialog 
                onSuccess={fetchFaculties} 
                institutionId={user.institution.id} 
            />
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
           <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
           Loading faculties...
        </div>
      ) : filteredFaculties.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
           <Building2 className="mx-auto h-12 w-12 opacity-20 mb-3"/>
           <p>No faculties found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Responsive grid */}
            {filteredFaculties.map((faculty) => (
            <Card
                key={faculty.id}
                className="hover:shadow-md transition-shadow group flex flex-col h-full"
            >
                <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <Badge variant="outline" className="text-xs">
                        ID: {faculty.id}
                        </Badge>
                        <Badge
                        variant={
                            faculty.status === "Active" ? "default" : "secondary"
                        }
                        className={
                            faculty.status === "Active"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-amber-500 hover:bg-amber-600"
                        }
                        >
                        {faculty.status}
                        </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-1" title={faculty.name}>{faculty.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {faculty.location || "No location assigned"}
                    </div>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="space-y-1 p-2 bg-secondary/20 rounded-lg text-center">
                            <div className="flex justify-center items-center text-muted-foreground mb-1">
                                <Briefcase className="h-3 w-3" />
                            </div>
                            <p className="text-lg font-bold">{faculty.departments_count || 0}</p>
                            <span className="text-[10px] uppercase text-muted-foreground">Depts</span>
                        </div>
                        <div className="space-y-1 p-2 bg-secondary/20 rounded-lg text-center">
                            <div className="flex justify-center items-center text-muted-foreground mb-1">
                                <Users className="h-3 w-3" />
                            </div>
                            <p className="text-lg font-bold">-</p>
                            <span className="text-[10px] uppercase text-muted-foreground">Staff</span>
                        </div>
                        <div className="space-y-1 p-2 bg-secondary/20 rounded-lg text-center">
                            <div className="flex justify-center items-center text-muted-foreground mb-1">
                                <GraduationCap className="h-3 w-3" />
                            </div>
                            <p className="text-lg font-bold">-</p>
                            <span className="text-[10px] uppercase text-muted-foreground">Students</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                        {faculty.description || "No description provided for this faculty."}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mt-auto">
                    {/* View Details Dialog */}
                    <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                        Details
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-full">
                            <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                            <DialogTitle>{faculty.name}</DialogTitle>
                            <DialogDescription>
                                {faculty.status} • {faculty.location || "No Location"}
                            </DialogDescription>
                            </div>
                        </div>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                        <div className="bg-muted/50 p-4 rounded-md text-sm">
                            {faculty.description || "No description provided."}
                        </div>

                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Administration
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground text-xs block mb-1">Dean</span>
                                <p className="font-medium">{faculty.dean || "Unassigned"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs block mb-1">Email</span>
                                <p className="font-medium text-primary break-all">{faculty.email || "N/A"}</p>
                            </div>
                            </div>
                        </div>
                        </div>
                    </DialogContent>
                    </Dialog>
                    
                    {/* NEW: Manage Departments Dialog */}
                    <ManageDepartmentsDialog 
                        facultyId={faculty.id} 
                        facultyName={faculty.name} 
                    />
                </div>
                </CardContent>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default Faculties;