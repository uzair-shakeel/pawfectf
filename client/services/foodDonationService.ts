const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000")
    .trim()
    .replace(/\/$/, "") + "/api";

export interface FoodDonation {
  _id: string;
  petId: {
    _id: string;
    name: string;
    species: string;
    breed: string;
    images: string[];
    location: {
      city: string;
      state: string;
      country: string;
    };
  };
  donorId: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  donationType: "sponsorship" | "direct_purchase";
  foodPackage: {
    type: "basic" | "premium" | "deluxe" | "custom";
    duration:
      | "1_day"
      | "3_days"
      | "1_week"
      | "2_weeks"
      | "1_month"
      | "3_months"
      | "6_months";
    amount: number;
    description?: string;
  };
  payment: {
    amount: number;
    currency: string;
    status: "pending" | "paid" | "failed" | "refunded";
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: string;
  };
  delivery: {
    type: "pickup" | "delivery" | "shelter_direct";
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    scheduledDate?: string;
    deliveredAt?: string;
    trackingNumber?: string;
  };
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "delivered"
    | "completed"
    | "cancelled";
  donorMessage?: string;
  shelterResponse?: string;
  updates: Array<{
    message: string;
    createdAt: string;
    createdBy: string;
  }>;
  isRecurring: boolean;
  recurringInterval?: "weekly" | "monthly" | "quarterly";
  nextDonationDate?: string;
  isFeatured: boolean;
  isUrgent: boolean;
  views: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationData {
  petId: string;
  donationType: "sponsorship" | "direct_purchase";
  foodPackage: {
    type: "basic" | "premium" | "deluxe" | "custom";
    duration:
      | "1_day"
      | "3_days"
      | "1_week"
      | "2_weeks"
      | "1_month"
      | "3_months"
      | "6_months";
    amount?: number;
    description?: string;
  };
  donorMessage?: string;
  delivery?: {
    type: "pickup" | "delivery" | "shelter_direct";
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    scheduledDate?: string;
  };
  isRecurring?: boolean;
  recurringInterval?: "weekly" | "monthly" | "quarterly";
}

export interface DonationFilters {
  page?: number;
  limit?: number;
  status?: string;
  petType?: string;
  urgentOnly?: boolean;
  donorId?: string;
  petId?: string;
}

export interface DonationStats {
  overview: {
    totalDonations: number;
    totalAmount: number;
    activeDonations: number;
    urgentDonations: number;
  };
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
}

class FoodDonationService {
  private async request(url: string, options: RequestInit = {}) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  // Get all donations with filters
  async getAllDonations(filters: DonationFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return this.request(`/food-donations?${params.toString()}`);
  }

  // Get single donation
  async getDonation(id: string): Promise<FoodDonation> {
    return this.request(`/food-donations/${id}`);
  }

  // Create new donation
  async createDonation(data: CreateDonationData): Promise<FoodDonation> {
    return this.request("/food-donations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update donation status (shelter/admin)
  async updateDonationStatus(
    id: string,
    data: {
      status: string;
      shelterResponse?: string;
      updateMessage?: string;
    },
  ) {
    return this.request(`/food-donations/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Get my donations
  async getMyDonations(
    filters: Pick<DonationFilters, "page" | "limit" | "status"> = {},
  ) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return this.request(
      `/food-donations/user/my-donations?${params.toString()}`,
    );
  }

  // Get received donations (for my pets)
  async getReceivedDonations(
    filters: Pick<DonationFilters, "page" | "limit" | "status"> = {},
  ) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return this.request(`/food-donations/user/received?${params.toString()}`);
  }

  // Get donation statistics
  async getDonationStats(): Promise<DonationStats> {
    return this.request("/food-donations/stats");
  }

  // Cancel donation
  async cancelDonation(id: string) {
    return this.request(`/food-donations/${id}`, {
      method: "DELETE",
    });
  }
}

export default new FoodDonationService();
