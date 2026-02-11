import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Lock, AlertCircle, Eye, EyeOff, Building } from "lucide-react";
import { bg_image } from "@/components/layout/logo";
import apiClient from "@/services/api";

// Define types for better code quality
type Institution = {
  id: number;
  name: string;
};

const Signup = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    institution: "", // To hold the selected institution ID
  });
  const [showPassword, setShowPassword] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch the list of institutions when the component mounts
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await apiClient.get('/users/institutions/');
        setInstitutions(response.data);
      } catch (err) {
        console.error("Failed to fetch institutions", err);
        setError("Could not load the list of institutions. Please refresh the page.");
      }
    };
    fetchInstitutions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Special handler for the ShadCN Select component
  const handleInstitutionChange = (value: string) => {
    setForm({ ...form, institution: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const nameParts = form.fullName.trim().split(/\s+/);
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    try {
      await apiClient.post("/users/register/", {
        username: form.email,
        email: form.email,
        password: form.password,
        first_name: first_name,
        last_name: last_name,
        institution: form.institution, // Send the institution ID
      });

      navigate("/", {
        state: { message: "Account created successfully! Please log in." },
      });
    } catch (err: any) {
      // Robust error handling from previous step
      const errorResponse = err.response;
      if (errorResponse && errorResponse.data) {
        const errorData = errorResponse.data;
        if (typeof errorData === "object" && errorData !== null) {
          const messages = Object.values(errorData).flat().join(" ");
          setError(messages || "An unexpected error occurred.");
        } else {
          setError("A server error occurred. Please try again later.");
        }
      } else {
        setError("Failed to connect to the server.");
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
            <p className="text-gray-500 text-sm">TESC Student Records & Statistics</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                <AlertCircle className="mr-2" size={18} /> {error}
              </div>
            )}
            {/* Input fields... */}
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required className="pl-10" disabled={isLoading} />
            </div>
             <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} required className="pl-10" disabled={isLoading} />
            </div>
            
            {/* Password with visibility toggle */}
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
              <div className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            {/* Institution Dropdown */}
            <div className="relative">
               <Building className="absolute left-3 top-3 text-gray-400" size={18} />
                <Select onValueChange={handleInstitutionChange} value={form.institution} required>
                    <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your institution" />
                    </SelectTrigger>
                    <SelectContent>
                        {institutions.map((inst) => (
                            <SelectItem key={inst.id} value={String(inst.id)}>
                                {inst.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button onClick={() => navigate("/")} className="text-blue-600 font-medium hover:underline">
              Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;