// Example: hch-frontend/src/services/Api.jsx

import axios from "axios";

export default axios.create({
    // ⭐ CRITICAL FIX: Use 127.0.0.1 to match the running server address precisely
    baseURL: "http://127.0.0.1:8000/api",
    
    // Ensure withCredentials: true is removed for stateless token auth
    // (As per your previous correct fix)
})