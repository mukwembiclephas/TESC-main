// frontend/src/pages/Programs.tsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { Program } from "@/lib/types/academic.types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Programs() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const institutionId = searchParams.get("institution"); // Read ?institution=ID

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = "/api/programs/";
    if (institutionId) {
      url += `?institution=${institutionId}`;
    }

    setLoading(true);
    axiosInstance
      .get(url)
      .then((res) => {
        setPrograms(res.data.results);
      })
      .finally(() => setLoading(false));
  }, [institutionId]);

  if (loading) return <DashboardLayout>Loading programs...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Programs</h1>
        {programs.length === 0 ? (
          <p className="text-muted-foreground">No programs found.</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Program List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Enrolled Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>{program.id}</TableCell>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>{program.institution_name}</TableCell>
                      <TableCell>{program.level}</TableCell>
                      <TableCell>{program.enrolled_students}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}