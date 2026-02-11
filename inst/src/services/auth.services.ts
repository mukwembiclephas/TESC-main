import apiClient from "./api"; // your Axios instance

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

/**
 * Login as Institution Admin
 */
export const loginInstitutionAdmin = async (
  data: LoginData
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/instauth/login/",  // Django endpoint
    data
  );
  console.log(response);
  
  return response.data;
};

/**
 * Refresh JWT access token
 */
export const refreshToken = async (refresh: string): Promise<{ access: string }> => {
  const response = await apiClient.post<{ access: string }>(
    "/instauth/token/refresh/",
    { refresh }
  );
  return response.data;
};

/**
 * Verify JWT token
 */
export const verifyToken = async (token: string): Promise<void> => {
  await apiClient.post("/instauth/token/verify/", { token });
};

/**
 * Logout institution admin
 */
export const logoutInstitutionAdmin = async (refresh: string): Promise<void> => {
  await apiClient.post("/instauth/logout/", { refresh });
};

/**
 * Get current logged-in user profile
 */
export const getInstitutionAdminProfile = async () => {
  const response = await apiClient.get("/instauth/profile/");
  return response.data;
};
