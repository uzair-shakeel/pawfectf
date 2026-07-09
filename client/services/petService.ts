import axios from "axios";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const API_BASE_URL = API_BASE ? `${API_BASE}` : "/api";
const BACKEND_BASE = API_BASE_URL;

export interface PetData {
  _id: string;
  title: string;
  description: string;
  images: string[];
  species: string;
  breed?: string;
  ageMonths?: number;
  gender?: "Male" | "Female" | "Unknown";
  size?: "Small" | "Medium" | "Large" | "Extra Large";
  color?: string;
  coatLength?: "Hairless" | "Short" | "Medium" | "Long";
  healthStatus?: string[];
  specialNeeds?: string;
  adoptionFee?: number;
  currency?: string;
  adoptionStatus: "Available" | "Pending" | "Adopted";
  personality?: string[];
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  status: "Pending" | "Approved" | "Rejected";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddPetData {
  title: string;
  description: string;
  images: File[];
  species: string;
  breed?: string;
  ageMonths?: number;
  gender?: "Male" | "Female" | "Unknown";
  size?: "Small" | "Medium" | "Large" | "Extra Large";
  color?: string;
  coatLength?: "Hairless" | "Short" | "Medium" | "Long";
  healthStatus?: string[];
  specialNeeds?: string;
  adoptionFee?: number;
  currency?: string;
  adoptionStatus: "Available" | "Pending" | "Adopted";
  personality?: string[];
}

export const uploadImageBatch = async (
  images: File[],
  onProgress?: (progress: number) => void,
  getToken?: () => Promise<string | null>
): Promise<{ success: boolean; urls: string[]; errors: any[] }> => {
  try {
    const token = getToken ? await getToken() : null;
    if (!token) throw new Error("No authentication token found");

    const formData = new FormData();
    images.forEach((file) => formData.append("images", file));

    const uploadUrl = `${API_BASE_URL}/pets/upload-images`;

    const response = await axios.post(uploadUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return {
      success: true,
      urls: response.data.urls || [],
      errors: [],
    };
  } catch (error: any) {
    console.error("Batch upload failed:", error);
    return {
      success: false,
      urls: [],
      errors: [error.message || "Upload failed"],
    };
  }
};

export const addPet = async (
  petData: FormData,
  getToken: () => Promise<string | null>
): Promise<AddPetData> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/pets`, petData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (primaryError: any) {
      try {
        const fb = await axios.post(`${BACKEND_BASE}/pets`, petData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        return fb.data;
      } catch (fallbackError: any) {
        const serverMsg =
          fallbackError?.response?.data?.message ||
          primaryError?.response?.data?.message;
        throw new Error(serverMsg || "Server error");
      }
    }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Failed to add pet"
    );
  }
};

export const getAllPets = async (): Promise<PetData[]> => {
  const tryFetch = async (): Promise<PetData[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pets`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      if (!response.data) {
        throw new Error("No data received from API");
      }

      const pets = Array.isArray(response.data)
        ? response.data
        : response.data.pets || response.data.cars || [];

      if (!Array.isArray(pets)) {
        throw new Error("Invalid data format received from API");
      }

      return pets;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
        `Failed to fetch pets: ${error.message}`
      );
    }
  };

  return tryFetch();
};

export const getPetById = async (petId: string): Promise<PetData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pets/${petId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch pet");
  }
};

export const updatePet = async (
  petId: string,
  petData: FormData,
  getToken: () => Promise<string | null>
): Promise<PetData> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(`${API_BASE_URL}/pets/${petId}`, petData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update pet");
  }
};

export const deletePet = async (
  petId: string,
  getToken: () => Promise<string | null>
): Promise<{ message: string }> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.delete(`${API_BASE_URL}/pets/${petId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete pet");
  }
};

export const updatePetStatus = async (
  petId: string,
  status: "Pending" | "Approved" | "Rejected",
  getToken: () => Promise<string | null>
): Promise<PetData> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(
      `${API_BASE_URL}/pets/status/${petId}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update pet status"
    );
  }
};

export const searchPets = async (queryParams: {
  species?: string;
  breed?: string;
  minAge?: number;
  maxAge?: number;
  gender?: string;
  size?: string;
  color?: string;
  coatLength?: string;
  healthStatus?: string;
  adoptionStatus?: string;
  minFee?: number;
  maxFee?: number;
  location?: [number, number];
  radius?: number;
}): Promise<PetData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pets/search`, {
      params: queryParams,
    });
    const pets = Array.isArray(response.data)
      ? response.data
      : response.data.pets || response.data.cars || [];

    return pets;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to search pets");
  }
};

export const getPetsByUserId = async (
  userId: string,
  getToken: () => Promise<string | null>
): Promise<PetData[]> => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_BASE_URL}/pets/my-pets/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch user pets"
    );
  }
};

export const getRecommendedPets = async (petId: string): Promise<PetData[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/pets/recommended/${petId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch recommended pets"
    );
  }
};

export const getFeaturedPets = async (): Promise<PetData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pets/featured`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch featured pets"
    );
  }
};

export const getAdminPets = async (params: {
  page?: number;
  limit?: number;
  species?: string;
  breed?: string;
  status?: string;
  search?: string;
} = {}): Promise<{
  pets: any[];
  currentPage: number;
  totalPages: number;
  totalPets: number;
  hasNext: boolean;
  hasPrev: boolean;
}> => {
  try {
    const res = await axios.get(`${BACKEND_BASE}/pets/admin/all`, { params });
    // In case backend still returns "cars" array, map it to pets
    if (res.data.cars && !res.data.pets) {
      res.data.pets = res.data.cars;
      res.data.totalPets = res.data.totalCars;
    }
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to load admin pets");
  }
};

export const setAdminPetStatus = async (
  petId: string,
  status: "Pending" | "Approved" | "Rejected",
  getToken?: () => Promise<string | null>
): Promise<any> => {
  try {
    const headers: any = {};
    if (getToken) {
      const token = await getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await axios.patch(
      `${BACKEND_BASE}/pets/admin/${petId}/status`,
      { status },
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update pet status");
  }
};

export const deleteAdminPet = async (
  petId: string,
  getToken?: () => Promise<string | null>
): Promise<any> => {
  try {
    const headers: any = {};
    if (getToken) {
      const token = await getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await axios.delete(`${BACKEND_BASE}/pets/admin/${petId}`, { headers });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete pet");
  }
};

export const generatePetListing = async (
  inputData: any,
  getToken: () => Promise<string | null>
): Promise<{ listing: string }> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(`${API_BASE_URL}/generate-listing`, inputData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error || error?.message || "Failed to generate pet listing"
    );
  }
};
