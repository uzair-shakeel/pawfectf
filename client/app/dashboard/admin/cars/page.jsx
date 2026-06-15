"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getAdminPets, setAdminPetStatus, deleteAdminPet } from "../../../../services/petService";
import { useAuth } from "../../../../lib/auth/AuthContext";

export default function AdminCarsPage() {
  const { getToken } = useAuth();
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // "", "Pending", "Approved", "Rejected"

  const loadCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminPets({ page, limit, search, status });
      setCars(res.cars || []);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      setError(e?.message || "Failed to load cars");
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const onApprove = async (carId) => {
    try {
      await setAdminPetStatus(carId, "Approved", getToken);
      await loadCars();
    } catch (e) {
      alert(e?.message || "Failed to approve car");
    }
  };

  const onReject = async (carId) => {
    try {
      await setAdminPetStatus(carId, "Rejected", getToken);
      await loadCars();
    } catch (e) {
      alert(e?.message || "Failed to reject car");
    }
  };

  const onPending = async (carId) => {
    try {
      await setAdminPetStatus(carId, "Pending", getToken);
      await loadCars();
    } catch (e) {
      alert(e?.message || "Failed to set pending");
    }
  };

  const onDelete = async (carId) => {
    if (!window.confirm("Delete this car?")) return;
    try {
      await deleteAdminPet(carId, getToken);
      await loadCars();
    } catch (e) {
      alert(e?.message || "Failed to delete car");
    }
  };

  const StatusBadge = ({ value }) => {
    const style =
      value === "Approved"
        ? "bg-green-50 text-green-700 border-green-200"
        : value === "Pending"
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-red-50 text-red-700 border-red-200";
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md border text-sm ${style}`}>
        {value}
      </span>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin • Cars Moderation</h1>
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, make, model, VIN"
          className="border rounded px-3 py-2 w-full sm:w-80"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          onClick={() => { setPage(1); loadCars(); }}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Apply
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2">Car</th>
                <th className="text-left px-3 py-2">Price</th>
                <th className="text-left px-3 py-2">Seller</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-semibold">{c.title || `${c.year || ''} ${c.make || ''} ${c.model || ''}`}</div>
                    <div className="text-gray-500">{c.vin || "No VIN"}</div>
                  </td>
                  <td className="px-3 py-2">
                    {c?.financialInfo?.priceNetto ? `${c.financialInfo.priceNetto.toLocaleString("pl-PL")} zł` : "N/A"}
                  </td>
                  <td className="px-3 py-2">
                    {c?.createdBy?.firstName || ""} {c?.createdBy?.lastName || ""}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge value={c.status} />
                  </td>
                  <td className="px-3 py-2 space-x-2">
                    <button onClick={() => onApprove(c._id)} className="px-2 py-1 rounded bg-green-600 text-white">Approve</button>
                    <button onClick={() => onReject(c._id)} className="px-2 py-1 rounded bg-red-600 text-white">Reject</button>
                    <button onClick={() => onPending(c._id)} className="px-2 py-1 rounded border">Set Pending</button>
                    <button onClick={() => onDelete(c._id)} className="px-2 py-1 rounded border text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {cars.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No cars found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`px-3 py-2 rounded border ${page <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`px-3 py-2 rounded border ${page >= totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
