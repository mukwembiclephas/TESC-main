import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Loader2, Check, Copy, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createInstitution,
  updateInstitution,
} from "@/services/institution.service";
import { getAllFacilities } from "@/services/academic.service";
import { InstitutionWriteData, Institution } from "@/lib/types/academic.types";

interface RegisterInstProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionToEdit: Institution | null;
}

const INSTITUTION_TYPES: InstitutionWriteData["type"][] = [
  "Polytechnic",
  "Teachers College",
  "Industrial Training",
  "Other",
];
const INSTITUTION_STATUSES: InstitutionWriteData["status"][] = [
  "Active",
  "Renovation",
  "Closed",
];
const INSTITUTION_LOCATION: InstitutionWriteData["location"][] = [
  "HARARE",
  "BULAWAYO",
  "MANICALAND",
  "MASHONALAND CENTRAL",
  "MASHONALAND EAST",
  "MASHONALAND WEST",
  "MASVINGO",
  "MATABELELAND NORTH",
  "MATABELELAND SOUTH",
  "MIDLANDS",
];

const initialFormData: InstitutionWriteData = {
  name: "",
  email: "",
  type: "Polytechnic",
  location: "",
  address: "",
  capacity: 0,
  staff: 0,
  status: "Active",
  established: new Date().getFullYear(),
  facility_ids: [],
};

export default function RegisterInst({
  open,
  onOpenChange,
  institutionToEdit,
}: RegisterInstProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] =
    useState<InstitutionWriteData>(initialFormData);
  const [selectedFacilities, setSelectedFacilities] = useState(
    new Set<number>(),
  );
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  // New state to hold credentials after successful creation
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const isEditMode = !!institutionToEdit;

  // --- Data Fetching ---
  const { data: allFacilities } = useQuery({
    queryKey: ["facilities"],
    queryFn: getAllFacilities,
    enabled: open,
  });

  // --- Populate form on edit ---
  useEffect(() => {
    if (institutionToEdit && open) {
      setFormData({
        name: institutionToEdit.name,
        email: institutionToEdit.email || "",
        type: institutionToEdit.type,
        location: institutionToEdit.location,
        address: institutionToEdit.address,
        capacity: institutionToEdit.capacity,
        staff: institutionToEdit.staff,
        status: institutionToEdit.status,
        established: institutionToEdit.established,
        facility_ids: institutionToEdit.facilities.map((f) => f.id),
      });
      setSelectedFacilities(
        new Set(institutionToEdit.facilities.map((f) => f.id)),
      );
      setApiErrors({});
    } else {
      if (!open) setApiErrors({}); // Clear errors when closed
      // Note: We don't reset form here to allow preserving state if accidentally closed,
      // or you can reset if preferred.
    }
  }, [institutionToEdit, open]);

  // --- Reset credentials when the main dialog opens (start fresh) ---
  useEffect(() => {
    if (open) {
      setCreatedCredentials(null);
    }
  }, [open]);

  // --- Form Submission ---
  const { mutate, isPending } = useMutation({
    mutationFn: (data: InstitutionWriteData) =>
      isEditMode
        ? updateInstitution(institutionToEdit!.id, data)
        : createInstitution(data),
    onSuccess: (response: any) => {
      // 1. Refresh Data
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      if (isEditMode && institutionToEdit) {
        queryClient.invalidateQueries({
          queryKey: ["institution", institutionToEdit.id],
        });
      }

      // 2. Handle Success Message
      if (isEditMode) {
        toast.success("Institution updated successfully!");
        onOpenChange(false);
      } else {
        // 3. Handle Creation Credentials
        // Check if backend returned the credentials in the response
        const creds =
          response?.admin_credentials || response?.data?.admin_credentials;

        if (creds) {
          setCreatedCredentials(creds);
          // Close the registration form, but KEEP the component mounted so we can show the credentials dialog
          onOpenChange(false);
        } else {
          toast.success("Institution registered successfully!");
          onOpenChange(false);
        }
      }
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        setApiErrors(error.response.data);
        toast.error("Please correct the errors in the form.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({});
    const dataToSend: InstitutionWriteData = {
      ...formData,
      capacity: Number(formData.capacity) || 0,
      staff: Number(formData.staff) || 0,
      established: Number(formData.established) || new Date().getFullYear(),
      facility_ids: Array.from(selectedFacilities),
    };
    mutate(dataToSend);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      {/* 1. Main Registration Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {isEditMode ? "Edit Institution" : "Register New Institution"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? `Updating details for ${institutionToEdit?.name}.`
                : "Fill in the details for the new educational institution."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="max-h-[70vh] overflow-y-auto pr-6 space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Institution Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Kwekwe Polytechnic"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {apiErrors.name && (
                    <p className="text-xs text-red-500">{apiErrors.name[0]}</p>
                  )}
                </div>

                {/* Institutional Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Institutional Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., admin@poly.ac.zw"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isEditMode} // Usually better not to change email/username on edit
                  />
                  {apiErrors.email && (
                    <p className="text-xs text-red-500">{apiErrors.email[0]}</p>
                  )}
                </div>

                {/* Institution Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Institution Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTITUTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Province)</Label>

                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, location: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTITUTION_LOCATION.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {apiErrors.location && (
                    <p className="text-xs text-red-500">
                      {apiErrors.location[0]}
                    </p>
                  )}
                </div>

                {/* Established Year */}
                <div className="space-y-2">
                  <Label htmlFor="established">Established (Year)</Label>
                  <Input
                    id="established"
                    type="number"
                    value={formData.established}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTITUTION_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Full Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main Street, Kwekwe"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending
                  ? "Saving..."
                  : isEditMode
                    ? "Save Changes"
                    : "Save Institution"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Credentials Success Dialog */}
      <Dialog
        open={!!createdCredentials}
        onOpenChange={(open) => !open && setCreatedCredentials(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <ShieldCheck className="h-6 w-6" />
              Registration Successful
            </DialogTitle>
            <DialogDescription>
              The institution has been registered. Please share these login
              credentials with the administrator securely.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4 my-2">
            {/* Email Field */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">
                Username / Email
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white dark:bg-black p-2 rounded border font-mono text-sm">
                  {createdCredentials?.email}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    copyToClipboard(createdCredentials?.email || "")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">
                Default Password
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white dark:bg-black p-2 rounded border font-mono text-sm">
                  {createdCredentials?.password}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    copyToClipboard(createdCredentials?.password || "")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-amber-600 flex items-center gap-2 bg-amber-50 p-2 rounded">
              <span>
                ⚠️ Note: The user will be prompted to change this password upon
                first login.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setCreatedCredentials(null)}
              className="w-full"
            >
              <Check className="mr-2 h-4 w-4" />
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
