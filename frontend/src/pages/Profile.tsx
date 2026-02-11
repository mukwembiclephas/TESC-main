// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/services/api";
import {
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Building,
  Briefcase,
  Edit,
  Save,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Updated type definition for the TESC profile
type ProfileData = {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  institution_name: string;
};

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initials = profile
    ? `${profile.first_name[0] || ""}${profile.last_name[0] || ""}`
    : "";

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/users/profile/"); // Correct URL
        setProfile(response.data);
        setFormData(response.data);
      } catch (err) {
        setError("Failed to fetch profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.put("/users/profile/", formData); // Correct URL
      setProfile(response.data);
      setFormData(response.data);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      const errorData = err.response?.data;
      const messages = errorData
        ? Object.values(errorData).flat().join(" ")
        : "Failed to update profile.";
      setError(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) setFormData(profile);
    setIsEditing(false);
    setError(null);
  };

  if (isLoading && !profile) {
    return <div className="p-8">Loading TESC Profile...</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader className="bg-gray-100 p-6 rounded-t-lg">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 text-xl">
                <AvatarImage
                  src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile?.first_name} ${profile?.last_name}`}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {profile?.first_name} {profile?.last_name}
                </CardTitle>
                <CardDescription>
                  Human Capital Planning and Skills Development
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                <AlertCircle className="mr-2 h-5 w-5" /> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center p-3 text-sm text-green-700 bg-green-100 rounded-lg">
                <CheckCircle className="mr-2 h-5 w-5" /> {success}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Institutional Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Institution</Label>
                    <div className="flex items-center p-2 h-10 w-full rounded-md border border-input bg-background text-sm">
                      <Building className="mr-2 h-4 w-4 text-gray-500" />
                      {profile?.institution_name || "Not Assigned"}
                    </div>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <div className="flex items-center p-2 h-10 w-full rounded-md border border-input bg-background text-sm">
                      <Briefcase className="mr-2 h-4 w-4 text-gray-500" />
                      {profile?.role.replace("_", " ")}
                    </div>
                  </div>
                </div>
              </div>

              <CardFooter className="flex justify-end p-0 pt-6">
                {isEditing ? (
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
