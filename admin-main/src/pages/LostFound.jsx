import React, { useState, useEffect } from "react";
import { lostFoundApi } from "../services/api";
import { Search, Trash2, Shield, Eye } from "lucide-react";
import toast from "react-hot-toast";

const LostFound = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEntries = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await lostFoundApi.getAllLostFound({ page: pageNum, limit: 10 });
      setEntries(res.data.entries || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching lost/found", error);
      toast.error("Failed to load lost/found entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await lostFoundApi.deleteLostFound(id);
      toast.success("Entry deleted");
      fetchEntries(page);
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await lostFoundApi.updateLostFoundStatus(id, status);
      toast.success("Status updated");
      fetchEntries(page);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Lost & Found</h1>
          <p className="text-slate-400">Manage community lost & found pet reports</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 sticky top-0 z-10 text-xs uppercase text-slate-400 font-semibold">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No lost/found entries yet.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 text-sm text-white font-medium">{entry.title}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${entry.type === 'Lost' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {entry.reporterId?.email || 'Unknown'}
                      </td>
                      <td className="p-4">
                        <select
                          className="bg-slate-800 border border-slate-700 text-sm rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                          value={entry.status}
                          onChange={(e) => handleStatusChange(entry._id, e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900">
          <p className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchEntries(page - 1)}
              disabled={page === 1 || loading}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => fetchEntries(page + 1)}
              disabled={page === totalPages || loading}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostFound;
