import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Define TypeScript interfaces for the API responses
interface Tokens {
  refresh: string;
  access: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

interface RegistrationSuccessResponse {
  message: string;
  user: User;
  tokens: Tokens;
}

interface RegistrationErrorResponse {
  message?: string;
  errors?: {
    username?: string | string[];
    email?: string | string[];
    password?: string | string[];
    password2?: string | string[];
    non_field_errors?: string | string[];
  };
}

interface ApiError {
  response?: {
    data: RegistrationErrorResponse;
    status: number;
  };
  request?: any;
  message?: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8000/api/auth/register/";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !email || !password1 || !password2) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (password1 !== password2) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const requestData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password1, // Changed from password1 to password
        password2,
      };

      console.log('Sending registration data:', requestData);

      const response = await axios.post<RegistrationSuccessResponse>(API_BASE_URL, requestData);

      console.log('Registration response:', response.data);

      toast.success("Registration successful! Please log in.");
      
      // ✅ FIX: Type-safe token extraction
      const token = response.data.tokens.access;
      
      if (token) {
        localStorage.setItem("token", token);
        // Also store refresh token if needed
        localStorage.setItem("refreshToken", response.data.tokens.refresh);
        console.log('Token stored successfully');
      }
      
      navigate("/login");
    } catch (err: unknown) {
      console.log('Full error object:', err);
      
      // Type-safe error handling
      const apiError = err as ApiError;
      console.log('Error response data:', apiError.response?.data);
      
      if (apiError.response?.data) {
        const errorData = apiError.response.data;
        
        if (errorData.errors) {
          // Handle field-specific errors from Django serializer
          const errors = errorData.errors;
          
          if (errors.username) {
            const usernameError = Array.isArray(errors.username) ? errors.username[0] : errors.username;
            setError(`Username: ${usernameError}`);
            toast.error(`Username: ${usernameError}`);
          } else if (errors.email) {
            const emailError = Array.isArray(errors.email) ? errors.email[0] : errors.email;
            setError(`Email: ${emailError}`);
            toast.error(`Email: ${emailError}`);
          } else if (errors.password) {
            const passwordError = Array.isArray(errors.password) ? errors.password[0] : errors.password;
            setError(`Password: ${passwordError}`);
            toast.error(`Password: ${passwordError}`);
          } else if (errors.password2) {
            const password2Error = Array.isArray(errors.password2) ? errors.password2[0] : errors.password2;
            setError(`Confirm Password: ${password2Error}`);
            toast.error(`Confirm Password: ${password2Error}`);
          } else if (errors.non_field_errors) {
            const nonFieldError = Array.isArray(errors.non_field_errors) ? errors.non_field_errors[0] : errors.non_field_errors;
            setError(nonFieldError);
            toast.error(nonFieldError);
          } else {
            // Generic error for any other validation errors
            const errorMessage = errorData.message || "Please check your registration details";
            setError(errorMessage);
            toast.error(errorMessage);
          }
        } else if (errorData.message) {
          // Handle direct message from Django view
          setError(errorData.message);
          toast.error(errorData.message);
        } else {
          // Handle other error formats
          setError("Registration failed. Please try again.");
          toast.error("Registration failed. Please try again.");
        }
      } else if (apiError.request) {
        // Network error - no response received
        setError("Network error. Please check your connection and make sure the Django server is running.");
        toast.error("Network error. Please check your connection.");
      } else {
        // Other errors
        setError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Register your institution credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g., mutarepoly"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="institution@example.ac.zw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password1">Password</Label>
              <Input
                id="password1"
                type="password"
                placeholder="Enter password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password2">Confirm Password</Label>
              <Input
                id="password2"
                type="password"
                placeholder="Confirm password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?
              </p>
              <Button
                type="button"
                variant="link"
                className="text-sm text-primary"
                onClick={() => navigate("/login")}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
            <p>Password must contain:</p>
            <p>Minimum 6 characters</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;