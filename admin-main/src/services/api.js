import axios from "axios";

// Set the base URL for your Pawfect API
// VITE_API_BASE_URL should be like: http://localhost:5000/api  OR  https://pawfectf.vercel.app/api
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor to include auth token (optional for simple endpoints)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token && token !== "demo-token") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// No request interceptor needed - just use default headers
// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

// User API endpoints
export const userApi = {
  getUserStats: () => api.get("/users/admin/stats"),
  getAllUsers: (params) => api.get("/users/admin/all", { params }),
  toggleUserBlock: (userId) => api.patch(`/users/admin/${userId}/toggle-block`),
  changeUserRole: (userId, role) =>
    api.patch(`/users/admin/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/users/admin/${userId}`),
  // User approval functions - using simple endpoint 
  approveUser: (userId) =>
    api.patch(`/users/${userId}/approval-status`, { status: "approved" }),
  rejectUser: (userId, rejectionReason) =>
    api.patch(`/users/${userId}/approval-status`, { status: "rejected" }),
  getUserApprovalStats: () => api.get("/users/admin/approval-stats"),
};

// Pet API endpoints
export const petApi = {
  getPetStats: () => api.get("/pets/admin/stats"),
  getAllPets: (params) => api.get("/pets/admin/all", { params }),
  updatePetStatus: (petId, status) =>
    api.patch(`/pets/admin/${petId}/status`, { status }),
  deletePet: (petId) => api.delete(`/pets/admin/${petId}`),
};

// Adoption Request API endpoints
export const adoptionRequestApi = {
  getAdoptionRequestStats: () => api.get("/adoption-requests/admin/stats"),
  getAllAdoptionRequests: (params) =>
    api.get("/adoption-requests/admin/all", { params }),
  updateAdoptionRequestStatus: (requestId, status) =>
    api.patch(`/adoption-requests/admin/${requestId}/status`, { status }),
  deleteAdoptionRequest: (requestId) =>
    api.delete(`/adoption-requests/admin/${requestId}`),
};

// Lost & Found API endpoints
export const lostFoundApi = {
  getAllLostFound: (params) => api.get("/lost-found/admin/all", { params }),
  updateLostFoundStatus: (id, status) => api.patch(`/lost-found/admin/${id}/status`, { status }),
  deleteLostFound: (id) => api.delete(`/lost-found/admin/${id}`),
};

// Dashboard API endpoint
export const dashboardApi = {
  getDashboardData: async () => {
    try {
      const [usersResponse, petsResponse, requestsResponse] = await Promise.all(
        [
          userApi.getUserStats(),
          petApi.getPetStats(),
          adoptionRequestApi.getAdoptionRequestStats(),
        ]
      );

      return {
        data: {
          users: usersResponse.data,
          pets: petsResponse.data,
          adoptionRequests: requestsResponse.data,
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  },
};

// Export default api instance for custom requests
export default api;
