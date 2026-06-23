import axios from "axios";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const API = API_BASE ? `${API_BASE}/api` : "/api";

export interface LostFoundData {
  _id: string;
  reporterId: any;
  type: "Lost" | "Found";
  title: string;
  description: string;
  species: string;
  breed?: string;
  gender?: "Male" | "Female" | "Unknown";
  color?: string;
  images: string[];
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  dateLostOrFound: string;
  status: "Active" | "Resolved" | "Archived";
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
}

export const getAllLostFound = async (): Promise<LostFoundData[]> => {
  const res = await axios.get(`${API}/lost-found`);
  return res.data;
};

export const getLostFoundById = async (id: string): Promise<LostFoundData> => {
  const res = await axios.get(`${API}/lost-found/${id}`);
  return res.data;
};

export const createLostFound = async (data: FormData, getToken: () => Promise<string | null>): Promise<LostFoundData> => {
  const token = await getToken();
  const res = await axios.post(`${API}/lost-found`, data, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const updateLostFound = async (id: string, data: FormData, getToken: () => Promise<string | null>): Promise<LostFoundData> => {
  const token = await getToken();
  const res = await axios.put(`${API}/lost-found/${id}`, data, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const deleteLostFound = async (id: string, getToken: () => Promise<string | null>) => {
  const token = await getToken();
  const res = await axios.delete(`${API}/lost-found/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getUserLostFound = async (getToken: () => Promise<string | null>): Promise<LostFoundData[]> => {
  const token = await getToken();
  const res = await axios.get(`${API}/lost-found/user/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getAdminLostFound = async (params: { page?: number; limit?: number }, getToken: () => Promise<string | null>) => {
  const token = await getToken();
  const res = await axios.get(`${API}/lost-found/admin/all`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteAdminLostFound = async (id: string, getToken: () => Promise<string | null>) => {
  const token = await getToken();
  const res = await axios.delete(`${API}/lost-found/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const setAdminLostFoundStatus = async (id: string, status: string, getToken: () => Promise<string | null>) => {
  const token = await getToken();
  const res = await axios.patch(`${API}/lost-found/admin/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
