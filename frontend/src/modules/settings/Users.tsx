import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Fix: Use Table from UI components, not Lucide
import React from "react";

// Using a single object for props destructuring
export default function Users({
  setEditingItem,
  setNewUser,
  setOpenUserModal,
  users = [], // Default to empty array
  editUserHandler,
  deleteUserHandler,
}) {
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle>Users</CardTitle>
          <Button
            onClick={() => {
              // Now these will work if passed correctly from SettingsPage
              if (setEditingItem) setEditingItem(null);
              if (setNewUser)
                setNewUser({
                  firstName: "",
                  lastName: "",
                  email: "",
                  role: "",
                  department: "",
                  level: "4",
                });
              if (setOpenUserModal) setOpenUserModal(true);
            }}
          >
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-500 py-8"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role?.name || "N/A"}</TableCell>
                    <TableCell>{user.department?.name || "N/A"}</TableCell>
                    <TableCell>Level {user.level}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editUserHandler(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUserHandler(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
