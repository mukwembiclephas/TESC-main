import apiClient from "./api"; // your Axios instance

// 1. method to fetch total students, total active stuff , total programs, completion rate, recent activity, across the institutional data over the last 2 weeks, 
// you have to pass the institutional id to the backend together using the apiClient Interceptor
// NOTE : after creating this method, in Dashboard.tsx, simply update the file to call the get method from this file to fetch data and replace the hardcoded data