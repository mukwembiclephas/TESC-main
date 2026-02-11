import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Database, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            TESC Institution Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Comprehensive management system for educational institutions in Zimbabwe
          </p>
          <Button size="lg" onClick={() => navigate("/login")}>
            Access Portal
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure Access</h3>
            <p className="text-muted-foreground">
              Ministry-approved authentication with role-based access control
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <Database className="h-10 w-10 text-secondary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Data Management</h3>
            <p className="text-muted-foreground">
              Centralized student, staff, and academic records management
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <Users className="h-10 w-10 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">Collaboration</h3>
            <p className="text-muted-foreground">
              Seamless integration with Ministry systems and reporting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
