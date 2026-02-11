import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit2, Building2, Loader2, Save, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

// Import from your consolidated services file
import { 
  getDepartments, 
  createDepartment, 
  deleteDepartment, 
  Department 
} from "@/services/faculties.services";

interface ManageDepartmentsDialogProps {
  facultyId: number;
  facultyName: string;
}

export function ManageDepartmentsDialog({ facultyId, facultyName }: ManageDepartmentsDialogProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  
  
  // New Department Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Departments
  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await getDepartments({ faculty: facultyId }); 
      setDepartments(data || []);
    } catch (error) {
      console.error("Failed to load departments", error);
      toast.error("Could not load departments");
    } finally {
      setIsLoading(false);
    }
  };

  // Create Department
  const handleCreate = async () => {
    if (!newDeptName || !newDeptCode) {
        toast.error("Name and Code are required");
        return;
    }
    
    setIsSaving(true);
    try {
      await createDepartment({
        faculty: facultyId,
        name: newDeptName,
        code: newDeptCode,
        head_of_department: "", // Optional for now
        description: ""
      });
      toast.success("Department added");
      setNewDeptName("");
      setNewDeptCode("");
      setIsAdding(false);
      fetchDepartments(); // Refresh list
    } catch (error) {
      toast.error("Failed to add department");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Department
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will delete all linked programs.")) return;
    try {
      await deleteDepartment(id);
      toast.success("Department deleted");
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchDepartments()}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="flex-1">
          Manage Departments
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Departments</DialogTitle>
          <DialogDescription>
            Manage departments for <strong>{facultyName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Add New Section */}
          {isAdding ? (
            <div className="flex items-end gap-2 p-3 bg-muted/50 rounded-md mb-4 border">
                <div className="grid gap-2 flex-1">
                    <Label>Department Name</Label>
                    <Input 
                        value={newDeptName} 
                        onChange={(e) => setNewDeptName(e.target.value)} 
                        placeholder="e.g. Computer Science"
                        autoFocus
                    />
                </div>
                <div className="grid gap-2 w-24">
                    <Label>Code</Label>
                    <Input 
                        value={newDeptCode} 
                        onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())} 
                        placeholder="CS"
                    />
                </div>
                <Button size="icon" onClick={handleCreate} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)}>
                    <X className="h-4 w-4"/>
                </Button>
            </div>
          ) : (
            <Button 
                variant="outline" 
                className="w-full mb-4 border-dashed" 
                onClick={() => setIsAdding(true)}
            >
                <Plus className="h-4 w-4 mr-2" /> Add Department
            </Button>
          )}

          {/* List Section */}
          {isLoading ? (
             <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : departments.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground border rounded-md">
                No departments found.
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.code}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}