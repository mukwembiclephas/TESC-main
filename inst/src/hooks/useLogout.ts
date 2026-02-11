import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call Django logout endpoint to blacklist the refresh token
      if (refreshToken) {
        await axios.post('http://localhost:8000/api/auth/logout/', {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.log('Logout API error:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // Clear all stored tokens and user data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Clear any other user-related storage
      localStorage.removeItem('user');
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to login page
      navigate('/login');
    }
  };

  return { logout };
};