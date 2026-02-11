import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rocket, Building2, Handshake, Banknote } from "lucide-react";
import ProjectManager from "../components/innovation_dept/ProjectManager";
import HubManager from "../components/innovation_dept/HubManager";
import PartnershipManager from "../components/innovation_dept/PartnershipManager";
import GrantManager from "../components/innovation_dept/GrantManager";
import { useInnovationData } from "@/hooks/useInnovation";
import { useAuth } from "@/context/AuthContext";

const InnovationDashboard = () => {

  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;

  // ONE HOOK TO RULE THEM ALL
  const { projects, hubs, partnerships, grants, loading, refresh } = useInnovationData(institutionId);

  if (loading) return <div>Loading...</div>;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Innovation & Industrialisation</h1>
        <p className="text-muted-foreground">
          Manage institution hubs, startups, partnerships, and research grants.
        </p>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="projects" className="gap-2"><Rocket className="h-4 w-4"/> Projects</TabsTrigger>
          <TabsTrigger value="hubs" className="gap-2"><Building2 className="h-4 w-4"/> Hubs</TabsTrigger>
          <TabsTrigger value="partnerships" className="gap-2"><Handshake className="h-4 w-4"/> Partners</TabsTrigger>
          <TabsTrigger value="grants" className="gap-2"><Banknote className="h-4 w-4"/> Grants</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <ProjectManager projects={projects} onRefresh={refresh} />
        </TabsContent>

        <TabsContent value="hubs" className="space-y-4">
           <HubManager hubs={hubs} />
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-4">
          <PartnershipManager partnerships={partnerships} />
        </TabsContent>

        <TabsContent value="grants" className="space-y-4">
          <GrantManager grants={grants} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InnovationDashboard;