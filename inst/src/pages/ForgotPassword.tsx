import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
      setIsLoading(false);
      toast.success("Password reset link sent!");
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/login")} 
              className="w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email or username to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="e.g., mutarepoly or admin@mutarepoly.ac.zw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
