import { useEffect, useState, useCallback } from "react";
// 1. Import useAuth
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
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Users, Clock, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddProgramDialog } from "@/components/AddProgramDialog";
import { getPrograms, Program } from "@/services/programs.services";

const Programs = () => {
  // 2. Get User Context
  const { user } = useAuth();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true); // Start as true
  const [searchQuery, setSearchQuery] = useState("");

  // 3. Update fetch logic to use Institution ID
  const fetchPrograms = useCallback(async () => {
    // Prevent fetching if user data isn't ready
    if (!user?.institution?.id) return;

    try {
      setLoading(true);
      // Pass the filter to the backend
      const data = await getPrograms({ 
        institution_id: user.institution.id 
      });
      // Ensure we set an array
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch programs", error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch when user context is ready
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const filteredPrograms = programs.filter((program) => {
    return (
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Programs & Courses
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage academic programs for <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Pass ID to Add Dialog if needed */}
        {user?.institution?.id && (
            <AddProgramDialog 
                institutionId={user.institution.id} 
                onSuccess={fetchPrograms} // Using onSuccess to match AddFacultyDialog pattern
            />
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPrograms.length === 0 ? (
             <div className="col-span-2 text-center py-12 border rounded-lg border-dashed text-muted-foreground bg-muted/10">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No programs found.</p>
                {searchQuery && <p className="text-sm">Try adjusting your search terms.</p>}
             </div>
          ) : (
            filteredPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-md transition-shadow group flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <Badge variant="outline">{program.code}</Badge>
                        <Badge variant="secondary">
                           {program.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {program.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Duration</span>
                      </div>
                      <p className="text-sm font-medium">{program.duration} Years</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Capacity</span>
                      </div>
                      <p className="text-sm font-medium">{program.student_capacity}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">Department</span>
                      </div>
                      {/* Show Department name here, fallback to Faculty if Dept missing */}
                      <p className="text-sm font-medium truncate w-28" title={program.department_name || program.faculty_name}>
                        {program.department_name || program.faculty_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{program.name}</DialogTitle>
                          <DialogDescription>
                            {program.code} • {program.department_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="p-3 bg-muted rounded-md text-sm">
                             {program.description || "No description available."}
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" /> Program Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground text-xs">Level</span>
                                <p className="font-medium">{program.level}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs">Coordinator</span>
                                <p className="font-medium">{program.coordinator || "Unassigned"}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground text-xs">Entry Requirements</span>
                                <p className="font-medium">{program.entry_requirements || "None specified"}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground text-xs">Modules</span>
                                <p className="font-medium">{program.modules || "No modules listed"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit Program
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Programs;