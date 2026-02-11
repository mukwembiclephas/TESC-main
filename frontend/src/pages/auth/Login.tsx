import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { bg_image, tesc_logo } from "@/components/layout/logo";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  // 🚨 Only destructure login, as we will get the user data directly from the login return value
  const { login } = useAuth();
  const location = useLocation();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Determines the correct dashboard route based on the user's department.
   */
  const getDashboardRoute = (departmentName: string | undefined) => {
    if (!departmentName) {
      return "/dashboard";
    }

    switch (departmentName) {
      case "Innovation and Industrialisation":
        return "/dashboard/innovation";
      case "Admissions":
        return "/dashboard/admissions";
      case "Monitoring and Evaluation":
        return "/dashboard/mne";
      // Add other cases here...
      case "IT":
      case "Executive Administration":
        return "/dashboard"; // General/Admin dashboard
      default:
        return "/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 🚨 FIX 1: Await login and CAPTURE the returned user object.
      // Assumes useAuth().login returns the UserInfo object.
      const authenticatedUser = await login(form.email, form.password);

      // 🚨 FIX 2: Calculate the correct redirect path using the captured user data.
      const departmentName = authenticatedUser?.department?.name;
      const redirectPath = getDashboardRoute(departmentName);

      // 🚨 FIX 3: Navigate immediately to the calculated path.
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401 || status === 400) {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        setError("Login failed. Please try again later.");
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
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <Card className="w-full max-w-md shadow-2xl rounded-2xl relative z-10">
        <CardContent className="p-8 space-y-6">
          <img src={tesc_logo} className="h-28 mx-auto" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">TESC SRS Login</h1>
            <p className="text-gray-500 text-sm">
              Zimbabwe Human Capital Planning and Skills Development
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {location.state?.message && (
              <div className="flex items-center p-3 text-sm text-green-700 bg-green-100 rounded-lg">
                {location.state.message}
              </div>
            )}
            {error && (
              <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                <AlertCircle className="mr-2" size={18} />
                {error}
              </div>
            )}
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
                className="pl-10"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <div
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Don’t have an account? <br /> Contact the system adminstrator to get
            assistance
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
