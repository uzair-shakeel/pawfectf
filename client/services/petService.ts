import axios from "axios";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const API_BASE_URL = API_BASE ? (API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`) : "/api";
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
      const response = await axios.get(`${API_BASE_URL}/pets`, {
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

export type PetImageAnalysis = {
  species: string;
  breed: string;
  gender?: string;
  size?: string;
  description: string;
};

async function compressImageForAnalysis(file: File): Promise<File> {
  try {
    if (!file.type.startsWith("image/")) return file;
    const bitmap = await createImageBitmap(file);
    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg") || "pet.jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}

export const analyzePetImage = async (
  file: File,
  getToken: () => Promise<string | null>
): Promise<PetImageAnalysis> => {
  const token = await getToken();
  if (!token) throw new Error("No authentication token found");

  const compressed = await compressImageForAnalysis(file);
  const formData = new FormData();
  formData.append("image", compressed);

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze-pet-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 180000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    return response.data;
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to analyze pet image";
    throw new Error(msg === "Network Error" ? "Network error while analyzing image. Please try a smaller photo." : msg);
  }
};

/** Stronger local fallback if API is down */
export function punctuateTextLocally(text: string): string {
  let t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";

  // Insert breaks before likely new sentences / questions
  t = t.replace(
    /\s+(?=(?:What|Where|When|Why|How|Who|Is|Are|Can|Do|Did|Will|Would|Booking|You|I|Czy|Jak|Co|Gdzie|Dlaczego)\b)/g,
    ". "
  );
  t = t.replace(/\s+(ale|jednak|ponieważ|dlatego|więc|natomiast)\s+/gi, ", $1 ");

  // Question mark for question-like clauses
  t = t
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => {
      let s = sentence.trim();
      if (!s) return "";
      s = s.charAt(0).toUpperCase() + s.slice(1);
      if (/^(what|where|when|why|how|who|is|are|can|do|did|will|would|czy|jak|co|gdzie|dlaczego)\b/i.test(s)) {
        if (!/[?]$/.test(s)) s = s.replace(/[.!]*$/, "") + "?";
      } else if (!/[.!?]$/.test(s)) {
        s += ".";
      }
      return s;
    })
    .filter(Boolean)
    .join(" ");

  return t.trim();
}

export const punctuateSpeechText = async (
  text: string,
  lang: string,
  getToken: () => Promise<string | null>
): Promise<string> => {
  const raw = String(text || "").trim();
  if (!raw) return "";

  try {
    const token = await getToken();
    if (!token) return punctuateTextLocally(raw);

    const response = await axios.post(
      `${API_BASE_URL}/analyze-pet-image/punctuate`,
      { text: raw, lang },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );
    const apiText = String(response.data?.text || "").trim();
    if (apiText && apiText !== raw) return apiText;
    // If API echoed raw unchanged, still try local structuring
    return punctuateTextLocally(raw);
  } catch (error: any) {
    console.warn("[punctuateSpeechText]", error?.message || error);
    return punctuateTextLocally(raw);
  }
};
