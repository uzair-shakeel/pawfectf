"use client";
import React, { useState, useEffect } from "react";
import { getAdminLostFound, deleteAdminLostFound, setAdminLostFoundStatus } from "../../../../services/lostFoundService";
import { useAuth } from "../../../../lib/auth/AuthContext";
import { FaTrash, FaCheck, FaTimes, FaArchive } from "react-icons/fa";

export default function AdminLostFoundPage() {
    const { getToken, user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchEntries = async (p = 1) => {
        try {
            setLoading(true);
            const data = await getAdminLostFound({ page: p, limit: 10 }, getToken);
            setEntries(data.entries);
            setTotalPages(data.totalPages);
            setPage(data.currentPage);
        } catch (error) {
            console.error("Error fetching admin entries", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchEntries(1);
        } else {
            setLoading(false);
        }
    }, [user, getToken]);

    const handleDelete = async (id) => {
        if (!confirm("Delete this report forever?")) return;
        try {
            await deleteAdminLostFound(id, getToken);
            fetchEntries(page);
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const handleStatus = async (id, status) => {
        try {
            await setAdminLostFoundStatus(id, status, getToken);
            fetchEntries(page);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500 font-bold">Unauthorized. Admins only.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-black mb-6">Admin: Lost & Found</h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-divider overflow-x-auto">
                    <table className="w-full text-left text-md text-gray-500 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-dark-raised text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Reporter</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(e => (
                                <tr key={e._id} className="border-b border-gray-100 dark:border-dark-divider">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white truncate max-w-xs">{e.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-sm font-bold text-white ${e.type === 'Lost' ? 'bg-red-500' : 'bg-green-500'}`}>{e.type}</span>
                                    </td>
                                    <td className="px-6 py-4">{e.reporterId?.email || e.reporterId?.firstName || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={e.status}
                                            onChange={(ev) => handleStatus(e._id, ev.target.value)}
                                            className="bg-gray-100 dark:bg-dark-raised border-none rounded-lg px-2 py-1 text-sm"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button onClick={() => handleDelete(e._id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-center gap-2 mt-6">
                <button disabled={page <= 1} onClick={() => fetchEntries(page - 1)} className="px-4 py-2 bg-gray-100 dark:bg-dark-raised rounded-lg disabled:opacity-50">Prev</button>
                <span className="px-4 py-2">Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => fetchEntries(page + 1)} className="px-4 py-2 bg-gray-100 dark:bg-dark-raised rounded-lg disabled:opacity-50">Next</button>
            </div>
        </div>
    );
}
