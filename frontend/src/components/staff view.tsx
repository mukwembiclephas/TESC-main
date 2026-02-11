import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Briefcase, Mail, Phone, GraduationCap, Award } from "lucide-react";
import { Separator } from "./ui/separator";

export function StaffView({ data, setData }) {
  return (
    <Dialog open={!!data} onOpenChange={(open) => !open && setData(null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Staff Profile</DialogTitle>
          <DialogDescription>
            Detailed information about {data?.full_name} from {data?.institution_name}
          </DialogDescription>
        </DialogHeader>

        {data && (
          <div className="space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Staff ID</p>
                    <p className="font-medium">{data.employee_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{data.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{data.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant={data.is_active ? "default" : "secondary"}
                      className={`mt-1 ${data.is_active ? "bg-green-600" : ""}`}
                    >
                      {data.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{data.date_joined}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department / Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Department & Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Department Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Institution:</span>
                        <p className="font-medium">{data.institution_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Faculty:</span>
                        <p className="font-medium">{data.faculty_name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department:</span>
                        <p className="font-medium">{data.department_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Specialization:</span>
                        <p className="font-medium">{data.specialization || "Not Specified"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{data.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{data.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Award className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm">
                      Highest Qualification: <strong>{data.qualification}</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
