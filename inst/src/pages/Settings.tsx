import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Building2, Lock, Bell, Upload } from "lucide-react";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    studentRegistration: true,
    resultUploads: false,
    ministryUpdates: true,
  });

  const handleSaveProfile = () => {
    toast.success("Institution profile updated successfully");
  };

  const handleSaveSecurity = () => {
    toast.success("Security settings updated successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage institution profile and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="h-4 w-4" />
            Institution Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Institution Information</CardTitle>
              <CardDescription>
                Update your institution's public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institution-name">Institution Name</Label>
                  <Input
                    id="institution-name"
                    defaultValue="Mutare Polytechnic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution-type">Type</Label>
                  <Input
                    id="institution-type"
                    defaultValue="Polytechnic"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="admin@mutarepoly.ac.zw"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+263 20 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" defaultValue="Manicaland" disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <Textarea
                  id="address"
                  defaultValue="123 Education Drive, Mutare, Zimbabwe"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Institution Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password regularly for security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button onClick={handleSaveSecurity}>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Information</CardTitle>
              <CardDescription>Your account credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value="mutarepoly" disabled />
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="student-reg">Student Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when new students register
                  </p>
                </div>
                <Switch
                  id="student-reg"
                  checked={notifications.studentRegistration}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      studentRegistration: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="result-uploads">Result Uploads</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify on result submission
                  </p>
                </div>
                <Switch
                  id="result-uploads"
                  checked={notifications.resultUploads}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      resultUploads: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ministry-updates">Ministry Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Important announcements from Ministry
                  </p>
                </div>
                <Switch
                  id="ministry-updates"
                  checked={notifications.ministryUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      ministryUpdates: checked,
                    })
                  }
                />
              </div>

              <Button
                onClick={() => toast.success("Notification preferences saved")}
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
