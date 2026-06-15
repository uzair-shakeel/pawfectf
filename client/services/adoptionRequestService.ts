import axios from "axios";

// Use the Next.js API proxy
const API_URL = "/api";

export interface AdoptionRequest {
  _id: string;
  adopterId: string;
  title: string;
  description: string;
  preferredSpecies?: string;
  preferredBreed?: string;
  preferredSize?: string;
  preferredAgeGroup?: string;
  preferredGender?: string;
  maxAdoptionFee?: number;
  location?: {
    type: string;
    coordinates: number[];
  };
  preferredFeatures?: string[];
  status: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdoptionRequestInput {
  title: string;
  description: string;
  preferredSpecies?: string;
  preferredBreed?: string;
  preferredSize?: string;
  preferredAgeGroup?: string;
  preferredGender?: string;
  maxAdoptionFee?: number;
  preferredFeatures?: string[];
  location?: {
    coordinates: number[];
  };
}

export interface AdoptionRequestsResponse {
  adoptionRequests: AdoptionRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Create a new adoption request
export const createAdoptionRequest = async (
  requestData: AdoptionRequestInput,
  getToken: () => Promise<string | null>
): Promise<AdoptionRequest> => {
  try {
    const token = await getToken();
    if (!token) {
      console.error("No token available from getToken function");
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${API_URL}/adoption-requests`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.adoptionRequest;
  } catch (error) {
    console.error("Error creating adoption request:", error);
    throw error;
  }
};

// Get all adoption requests
export const getAllAdoptionRequests = async (
  filters: {
    preferredSpecies?: string;
    preferredBreed?: string;
    preferredSize?: string;
    preferredAgeGroup?: string;
    maxAdoptionFee?: number;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<AdoptionRequestsResponse> => {
  try {
    const response = await axios.get(`${API_URL}/adoption-requests`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching adoption requests:", error);
    throw error;
  }
};

// Get adoption requests by user ID
export const getMyAdoptionRequests = async (
  filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {},
  getToken: () => Promise<string | null>
): Promise<AdoptionRequestsResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      `${API_URL}/adoption-requests/my-requests`,
      {
        params: filters,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching my adoption request:", error);
    throw error;
  }
};

// Get a single adoption request by ID
export const getAdoptionRequestById = async (
  requestId: string
): Promise<AdoptionRequest> => {
  try {
    const response = await axios.get(
      `${API_URL}/adoption-requests/${requestId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching adoption request with ID ${requestId}:`, error);
    throw error;
  }
};

// Update an adoption request
export const updateAdoptionRequest = async (
  requestId: string,
  updateData: Partial<AdoptionRequestInput>,
  getToken: () => Promise<string | null>
): Promise<AdoptionRequest> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(
      `${API_URL}/adoption-requests/${requestId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.adoptionRequest;
  } catch (error) {
    console.error(`Error updating adoption request with ID ${requestId}:`, error);
    throw error;
  }
};

// Delete/cancel an adoption request
export const deleteAdoptionRequest = async (
  requestId: string,
  getToken: () => Promise<string | null>
): Promise<void> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    await axios.delete(`${API_URL}/adoption-requests/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(`Error deleting adoption request with ID ${requestId}:`, error);
    throw error;
  }
};
