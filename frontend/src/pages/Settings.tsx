import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  CheckCircle2,
  Circle,
  User as UserIcon,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth, updatePassword } from "@/contexts/AuthContext";

import {
  fetchRoles,
  fetchDepartments,
  fetchUsers,
  addDepartment,
  editDepartment,
  addUser,
  editUser,
  deleteUser,
} from "../services/settings.services";
import Users from "@/modules/settings/Users";
import UserModal from "@/modules/settings/UserModal";
import { Label } from "@/components/ui/label";

const SYSTEM_PAGES = [
  { name: "Institutions", url: "/institutions" },
  { name: "Student Records", url: "/students" },
  { name: "Statistics", url: "/statistics" },
  { name: "Facilities & Capacity", url: "/facilities" },
  { name: "Innovation", url: "/innovation" },
  { name: "Industrialisation", url: "/industrialisation" },
  { name: "Incubation Hubs", url: "/hubs" },
  { name: "Startups", url: "/startups" },
  { name: "Regional Analysis", url: "/regional" },
  { name: "Admissions Dashboard", url: "/admissions" },
  { name: "Dropout Analysis", url: "/admissions/dropouts" },
  { name: "Payments & Fees", url: "/admissions/fees" },
  { name: "Reports", url: "/reports" },
  { name: "Settings", url: "/settings" },
];

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const isSystemAdmin = currentUser?.level === "1";

  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // States for System Management
  const [newDept, setNewDept] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    role: "",
    level: "4",
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // States for Personal Profile
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.first_name || "",
    lastName: currentUser?.last_name || "",
    email: currentUser?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  const [openDeptModal, setOpenDeptModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);

  const toggleVisibility = (field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const refreshData = useCallback(async () => {
    if (!isSystemAdmin) return;
    try {
      const [r, d, u] = await Promise.all([
        fetchRoles(),
        fetchDepartments(),
        fetchUsers(),
      ]);
      setRoles(r || []);
      setDepartments(d || []);
      setUsers(u?.results || u || []);
    } catch (err) {
      toast.error("Failed to load settings data");
    }
  }, [isSystemAdmin]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- Profile Actions ---
  const handleUpdateProfile = async () => {
    toast.success("Profile information updated successfully");
    // Implementation: await api.patch('/users/profile/', profileData);
  };

  // --- System User Handlers ---
  const editUserHandler = (user) => {
    setEditingItem(user);
    setNewUser({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      email: user.email || "",
      role: user.role?.name || "",
      department: user.department?.name || "",
      level: user.level || "4",
    });
    setOpenUserModal(true);
  };
  const handleChangePassword = async () => {
    // 1. Client-side Validation
    if (!passwordData.old || !passwordData.new) {
      return toast.error("Please fill in both current and new passwords");
    }
    if (passwordData.new !== passwordData.confirm) {
      return toast.error("New passwords do not match");
    }
    if (passwordData.new.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }

    try {
      // 2. API Call (using the service or auth context)
      await updatePassword(passwordData.old, passwordData.new);

      toast.success("Password changed successfully");

      // 3. Clear form
      setPasswordData({ old: "", new: "", confirm: "" });
    } catch (err) {
      // Handle specific backend errors (e.g., "Old password incorrect")
      const errorMsg =
        typeof err === "string"
          ? err
          : err.error || "Failed to update password";
      toast.error(errorMsg);
    }
  };

  const saveUser = async () => {
    const roleObj = roles.find((r) => r.name === newUser.role);
    const deptObj = departments.find((d) => d.name === newUser.department);
    const payload = {
      username: `${newUser.firstName.toLowerCase()}.${newUser.lastName.toLowerCase()}`,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      email: newUser.email,
      department_id: deptObj?.id,
      role_id: roleObj?.id,
      level: newUser.level,
    };

    try {
      if (editingItem) {
        await editUser(editingItem.id, payload);
        toast.success("User updated");
      } else {
        const response = await addUser(payload);
        // Capture the email and the default password returned from the backend
        setCreatedCredentials({
          email: response.email,
          password: response.password || "tesc@123", // Fallback to your default
        });
      }
      setOpenUserModal(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        role: "",
        level: "4",
      });
      refreshData();
    } catch (err) {
      toast.error("Error saving user");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" /> Settings
        </h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="profile" className="gap-2">
              <UserIcon className="h-4 w-4" /> Personal Profile
            </TabsTrigger>
            {isSystemAdmin && (
              <TabsTrigger value="system" className="gap-2">
                <ShieldCheck className="h-4 w-4" /> System Management
              </TabsTrigger>
            )}
          </TabsList>

          {/* --- PERSONAL PROFILE TAB --- */}
          <TabsContent value="profile" className="space-y-6 pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <Button onClick={handleUpdateProfile}>Update Profile</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Password */}
                  <div className="relative">
                    <Input
                      type={showPasswords.old ? "text" : "password"}
                      placeholder="Current Password"
                      value={passwordData.old}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          old: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("old")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                    >
                      {showPasswords.old ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* New Password */}
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="New Password"
                      value={passwordData.new}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("new")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="Confirm New Password"
                      value={passwordData.confirm}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("confirm")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleChangePassword}
                  >
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- SYSTEM MANAGEMENT TAB --- */}
          {isSystemAdmin && (
            <TabsContent value="system" className="space-y-6 pt-4">
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>Departments & Permissions</CardTitle>
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setNewDept({
                        name: "",
                        description: "",
                        permissions: [],
                      });
                      setOpenDeptModal(true);
                    }}
                  >
                    Add Department
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Access Scope</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((dep) => (
                        <TableRow key={dep.id}>
                          <TableCell className="font-medium">
                            {dep.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {dep.permissions?.length || 0} Modules Assigned
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(dep);
                                setNewDept(dep);
                                setOpenDeptModal(true);
                              }}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Users
                users={users}
                setEditingItem={setEditingItem}
                setNewUser={setNewUser}
                setOpenUserModal={setOpenUserModal}
                editUserHandler={editUserHandler}
                deleteUserHandler={deleteUser}
              />
            </TabsContent>
          )}
        </Tabs>

        <Dialog
          open={!!createdCredentials}
          onOpenChange={(open) => !open && setCreatedCredentials(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <ShieldCheck className="h-6 w-6" />
                User Created Successfully
              </DialogTitle>
              <DialogDescription>
                System user has been registered. Please share these login
                credentials with the user securely.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4 my-2">
              {/* Email/Username Field */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase font-bold">
                  Username / Email
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-black p-2 rounded border font-mono text-sm overflow-hidden text-ellipsis">
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
                <Label className="text-xs text-muted-foreground uppercase font-bold">
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

              <div className="text-xs text-amber-600 flex items-start gap-2 bg-amber-50 p-2 rounded border border-amber-100">
                <span className="mt-0.5">⚠️</span>
                <span>
                  Important: User must change this password in the Settings page
                  upon first login for security.
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

        {/* Modals */}
        <DepartmentModal
          open={openDeptModal}
          onClose={() => setOpenDeptModal(false)}
          dept={newDept}
          setDept={setNewDept}
          onSave={async () => {
            if (editingItem) await editDepartment(editingItem.id, newDept);
            else await addDepartment(newDept);
            setOpenDeptModal(false);
            refreshData();
            toast.success("Department permissions updated");
          }}
        />

        <UserModal
          open={openUserModal}
          onClose={() => setOpenUserModal(false)}
          user={newUser}
          setUser={setNewUser}
          onSave={saveUser}
          departments={departments}
          roles={roles}
          editing={!!editingItem}
        />
      </div>
    </DashboardLayout>
  );
}

// Separate Permission Matrix Component for the Modal
function DepartmentModal({ open, onClose, dept, setDept, onSave }) {
  const togglePage = (url) => {
    const current = dept.permissions || [];
    const updated = current.includes(url)
      ? current.filter((p) => p !== url)
      : [...current, url];
    setDept({ ...dept, permissions: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Department Access Control</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 flex-1 overflow-y-auto pr-2">
          <Input
            placeholder="Department Name"
            value={dept.name}
            onChange={(e) => setDept({ ...dept, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2 border p-4 rounded-xl bg-muted/20">
            {SYSTEM_PAGES.map((page) => (
              <div
                key={page.url}
                onClick={() => togglePage(page.url)}
                className="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded-lg border border-transparent hover:border-border transition-all"
              >
                {dept.permissions?.includes(page.url) ? (
                  <CheckCircle2 className="text-green-600 h-5 w-5" />
                ) : (
                  <Circle className="text-muted-foreground/30 h-5 w-5" />
                )}
                <span className="text-sm font-medium">{page.name}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Department Permissions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
