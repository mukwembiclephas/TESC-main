import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useState } from "react";

export function StudentView({ data, setdata }) {
  return (
    <Dialog open={!!data} onOpenChange={(open) => !open && setdata(null)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogDescription>
            Detailed information about {data?.full_name}
          </DialogDescription>
        </DialogHeader>
        {data && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-medium">{data.student_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">National ID</p>
                    <p className="font-medium">{data.national_id || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{data.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{data.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="font-medium">{data.date_of_birth || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Institution</p>
                    <p className="font-medium">{data.institution_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Program</p>
                    <p className="font-medium">{data.program_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{data.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Enrollment Year
                    </p>
                    <p className="font-medium">{data.enrollment_year}</p>
                  </div>
                  {data.status === "Graduated" && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Graduation Year
                        </p>
                        <p className="font-medium">
                          {(data as any).graduation_year}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Final Grade
                        </p>
                        <p className="font-medium">
                          {(data as any).final_grade}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
