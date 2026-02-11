// TESC-main/frontend/src/components/server/Server.tsx

import axios from 'axios';

// Define the base URL for your Django backend
const API_URL = 'http://127.0.0.1:8000/users/';

// Function to handle user signup
export async function signUp(formData) {
    console.log(formData);
        const response = await axios.post(
            `${API_URL}signup/`,
            formData
        );
        // Return the response data on success
        return response.data;
    
}

// Function to handle user login
export async function signIn(formData) {
    const response = await axios.post(
        `${API_URL}login/`,
        formData
    );
    // Return the response data on success
    return response.data;

}