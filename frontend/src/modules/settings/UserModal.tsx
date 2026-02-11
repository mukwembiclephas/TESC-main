import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function UserModal({
  open,
  onClose,
  user,
  setUser,
  onSave,
  departments,
  roles,
  editing,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit System User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="First Name"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            />
            <Input
              placeholder="Last Name"
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            />
          </div>

          <Input
            type="email"
            placeholder="Email Address"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Assign Department (Controls Page Access)
            </label>
            <Select
              value={user.department}
              onValueChange={(val) => setUser({ ...user, department: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Access Level
            </label>
            <Select
              value={user.level}
              onValueChange={(val) => setUser({ ...user, level: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Full Access (Admin)</SelectItem>
                {/* <SelectItem value="2">Level 2 - View & Edit</SelectItem>
                <SelectItem value="3">Level 3 - View Only</SelectItem> */}
                <SelectItem value="4">Limited Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {editing ? "Update User" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserModal;
