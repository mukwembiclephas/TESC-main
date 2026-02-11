import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const ForcePasswordChange = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = () => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25;
    return strength;
  };

  const getStrengthLabel = () => {
    const strength = passwordStrength();
    if (strength <= 25) return { label: "Weak", color: "text-destructive" };
    if (strength <= 50) return { label: "Medium", color: "text-warning" };
    if (strength <= 75) return { label: "Good", color: "text-info" };
    return { label: "Strong", color: "text-success" };
  };

  const passwordRequirements = [
    { test: newPassword.length >= 8, label: "At least 8 characters" },
    { test: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword), label: "Upper & lowercase letters" },
    { test: /[0-9]/.test(newPassword), label: "At least one number" },
    { test: /[^A-Za-z0-9]/.test(newPassword), label: "At least one symbol" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (passwordStrength() < 100) {
      toast.error("Password does not meet all requirements");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success("Password updated successfully!");
      navigate("/dashboard");
    }, 1500);
  };

  const strength = getStrengthLabel();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-warning" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Change Password</CardTitle>
          <CardDescription className="text-center">
            You're using a temporary password. Please create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="bg-warning/10 border-warning">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning-foreground">
                For security, you must change your password before proceeding.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password Strength:</span>
                    <span className={`font-medium ${strength.color}`}>{strength.label}</span>
                  </div>
                  <Progress value={passwordStrength()} className="h-2" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">Password Requirements:</p>
              <div className="space-y-1">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {req.test ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={req.test ? "text-success" : "text-muted-foreground"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || passwordStrength() < 100}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForcePasswordChange;
