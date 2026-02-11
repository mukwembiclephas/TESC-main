import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Building,
  MapPin,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllInstitutions,
  deleteInstitution,
} from "@/services/institution.service";
import { Institution } from "@/lib/types/academic.types";
import { Skeleton } from "@/components/ui/skeleton";
import RegisterInst from "@/modules/institutions/RegisterInst";

/**
 * Loading Skeleton component
 */
const InstitutionCardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-32 w-full" />
    </CardContent>
  </Card>
);

export default function Institutions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [registerInst, setRegisterInst] = useState(false);
  const [editingInstitution, setEditingInstitution] =
    useState<Institution | null>(null);

  const {
    data: institutions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["institutions"],
    queryFn: getAllInstitutions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
    },
  });

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this institution permanently?")) return;
    deleteMutation.mutate(id);
  };

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      setRegisterInst(false);
      setEditingInstitution(null);
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Educational Institutions</h1>
              <p className="text-muted-foreground">
                Manage Teachers Colleges, Polytechnics, and Industrial Training Centres
              </p>
            </div>

            <Button onClick={() => setRegisterInst(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Register Institution
            </Button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading && (
              <>
                <InstitutionCardSkeleton />
                <InstitutionCardSkeleton />
              </>
            )}

            {isError && (
              <div className="lg:col-span-2 text-center text-red-500">
                Failed to load institutions.
              </div>
            )}

            {institutions?.map((institution: Institution) => {
              const utilization =
                institution.capacity > 0
                  ? (institution.student_count / institution.capacity) * 100
                  : 0;

              return (
                <Card
                  key={institution.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary" />
                          {institution.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {institution.address || "No address"}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Badge variant="outline">{institution.type}</Badge>
                        <Badge
                          variant={
                            institution.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {institution.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Students
                        </div>
                        <div className="font-bold">
                          {institution.student_count}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Staff
                        </div>
                        <div className="font-bold">
                          {institution.staff_count}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Programs
                        </div>
                        <div className="font-bold">
                          {institution.program_count || 0}
                        </div>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Capacity Utilization</span>
                        <span>{utilization.toFixed(0)}%</span>
                      </div>
                      <Progress value={utilization} className="h-2" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingInstitution(institution)}
                      >
                        View & Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-9 w-9"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(institution.id)}
                        title="Delete institution"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Established: {institution.established} |{" "}
                      {institution.location}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardLayout>

      {/* Modal */}
      <RegisterInst
        open={registerInst || !!editingInstitution}
        onOpenChange={handleModalClose}
        institutionToEdit={editingInstitution}
      />
    </>
  );
}
