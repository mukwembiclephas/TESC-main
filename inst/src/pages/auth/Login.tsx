import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building2, Loader2, Mail, Lock } from "lucide-react";
import { bg_image, tesc_logo } from "@/constants/images";
import {
  getInstitutionAdminProfile,
  loginInstitutionAdmin,
} from "@/services/auth.services";
import { getAllInstitutions } from "@/services/institution.service";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form States
  const [selectedInstId, setSelectedInstId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI States
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Fetch Institutions for the Dropdown ---
  const { data: institutions, isLoading: isLoadingInsts } = useQuery({
    queryKey: ["institutions-list"],
    queryFn: getAllInstitutions,
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Authenticate with the backend
      const { tokens } = await loginInstitutionAdmin({ 
        username: email, 
        password 
      });
      
      await login(tokens.access, tokens.refresh);

      // 3. Navigate only after the user data is ready
      navigate("/dashboard");

    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_image})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      
      <Card className="w-full max-w-md shadow-2xl rounded-xl relative z-10 border-white/10 bg-white/95 dark:bg-slate-950/95">
        <CardHeader className="space-y-1 text-center pb-6">
          <img 
            src={tesc_logo} 
            alt="TESC Logo" 
            className="h-24 mx-auto mb-4 drop-shadow-md" 
          />

          <CardTitle className="text-2xl font-bold tracking-tight">
            Institution Portal
          </CardTitle>
          <CardDescription>
            Verify your institution and sign in
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 1. Institution Selection (Visual Confirmation) */}
            <div className="space-y-2">
              <Label htmlFor="institution">Institution Name</Label>
              <Select 
                onValueChange={(value) => setSelectedInstId(value)} 
                disabled={isLoading || isLoadingInsts}
              >
                <SelectTrigger id="institution" className="h-11 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <SelectValue placeholder={isLoadingInsts ? "Loading list..." : "Select your institution"} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {institutions?.map((inst: any) => (
                    <SelectItem key={inst.id} value={inst.id.toString()}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Institutional Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@institution.ac.zw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 h-11 transition-all"
                  required
                />
              </div>
            </div>

            {/* 3. Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-xs text-muted-foreground hover:text-primary"
                  onClick={() => navigate("/forgot-password")}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 h-11 transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium mt-2" 
              // Require institution selection + email + password to activate button
              disabled={isLoading || !selectedInstId || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Verifying...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Protected by ZCHPC System Security
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;