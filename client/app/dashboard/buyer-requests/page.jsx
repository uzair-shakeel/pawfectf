"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth/AuthContext";
import {
  getMyAdoptionRequests,
  getOffersForRequest,
  deleteAdoptionRequest,
} from "../../../services/adoptionRequestService";
import { acceptOffer, rejectOffer } from "../../../services/adoptionRequestService";
import { toast } from "react-hot-toast";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiX,
  FiInfo,
} from "react-icons/fi";
import { FaPaw } from "react-icons/fa";

const AdoptionRequestsDashboard = () => {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [allOffers, setAllOffers] = useState([]);
  const [allOffersLoading, setAllOffersLoading] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState(new Set());
  const [requestOffers, setRequestOffers] = useState({});

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (userId) {
      if (activeTab === "received-offers") {
        fetchAllOffers();
      } else {
        fetchRequests(activeTab);
      }
    }
  }, [userId, activeTab]);

  const fetchRequests = async (status) => {
    setLoading(true);
    try {
      const getTokenFn = async () => await getToken();
      const response = await getMyAdoptionRequests({ status }, getTokenFn);
      setRequests(response.buyerRequests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load your adoption requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async (requestId) => {
    setOffersLoading(true);
    try {
      const getTokenFn = async () => await getToken();
      const offersData = await getOffersForRequest(requestId, getTokenFn);
      setOffers(offersData.offers || offersData || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load shelter responses");
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchAllOffers = async () => {
    setAllOffersLoading(true);
    try {
      const getTokenFn = async () => await getToken();
      const requestsResponse = await getMyAdoptionRequests({}, getTokenFn);
      const userRequests = requestsResponse.buyerRequests || [];

      const allOffersData = [];
      for (const request of userRequests) {
        try {
          const offersData = await getOffersForRequest(request._id, getTokenFn);
          const offersList = offersData.offers || offersData || [];
          const offersWithRequest = offersList.map((offer) => ({
            ...offer,
            requestTitle: request.title,
            requestId: request._id,
          }));
          allOffersData.push(...offersWithRequest);
        } catch (error) {
          console.error(`Error fetching offers for request ${request._id}:`, error);
        }
      }
      setAllOffers(allOffersData);
    } catch (error) {
      console.error("Error fetching all offers:", error);
      toast.error("Failed to load shelter responses");
    } finally {
      setAllOffersLoading(false);
    }
  };

  const handleViewOffers = (request) => {
    setSelectedRequest(request);
    fetchOffers(request._id);
    setShowOffersModal(true);
  };

  const toggleRequestExpanded = async (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
      if (!requestOffers[requestId]) {
        await fetchOffersForRequest(requestId);
      }
    }
    setExpandedRequests(newExpanded);
  };

  const fetchOffersForRequest = async (requestId) => {
    try {
      const getTokenFn = async () => await getToken();
      const offersData = await getOffersForRequest(requestId, getTokenFn);
      const offersList = offersData.offers || offersData || [];
      setRequestOffers((prev) => ({
        ...prev,
        [requestId]: offersList,
      }));
    } catch (error) {
      console.error(`Error fetching offers for request ${requestId}:`, error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to cancel this adoption request?")) {
      try {
        const getTokenFn = async () => await getToken();
        await deleteAdoptionRequest(requestId, getTokenFn);
        toast.success("Adoption request cancelled");
        fetchRequests(activeTab === "cancelled" ? "Cancelled" : activeTab);
      } catch (error) {
        console.error("Error deleting request:", error);
        toast.error("Failed to cancel request");
      }
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (window.confirm("Are you sure you want to accept this pet match?")) {
      try {
        const getTokenFn = async () => await getToken();
        await acceptOffer(offerId, getTokenFn);
        toast.success("Match accepted!");
        if (activeTab === "received-offers") fetchAllOffers();
        else fetchRequests(activeTab);
        setShowOffersModal(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error("Error accepting offer:", error);
        toast.error("Failed to accept match");
      }
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (window.confirm("Are you sure you want to reject this match?")) {
      try {
        const getTokenFn = async () => await getToken();
        await rejectOffer(offerId, getTokenFn);
        toast.success("Match rejected");
        if (activeTab === "received-offers") fetchAllOffers();
        else fetchRequests(activeTab);
        setShowOffersModal(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error("Error rejecting offer:", error);
        toast.error("Failed to reject match");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const calculateDaysLeft = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-main p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Adoption Requests 🐾
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Manage your pet preferences and view matches from local shelters.
            </p>
          </div>
          <button
            onClick={() => toast.error("New adoption requests are temporarily disabled while we upgrade the system.")}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-1"
          >
            <FiPlus className="w-5 h-5" /> New Request
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-white dark:bg-dark-card p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-divider w-fit">
          {[
            { id: "active", label: "Active" },
            { id: "fulfilled", label: "Matched" },
            { id: "cancelled", label: "Cancelled" },
            { id: "expired", label: "Expired" },
            { id: "received-offers", label: "Shelter Matches" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-raised"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "received-offers" ? (
          allOffersLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allOffers.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-dark-card rounded-3xl shadow-sm p-12 text-center border border-gray-100 dark:border-dark-divider">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full inline-flex mb-4">
                    <FaPaw className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Matches Yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    You haven't received any pet matches from shelters yet.
                  </p>
                </div>
              ) : (
                allOffers.map((offer) => (
                  <div key={offer._id} className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-divider overflow-hidden hover:shadow-md transition-all flex flex-col">
                    <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-dark-main">
                      {offer.carInfo?.images?.[0] ? (
                        <img src={offer.carInfo.images[0]} alt={offer.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FaPaw className="w-12 h-12 opacity-50" /></div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase shadow-sm bg-white/90 text-gray-900">{offer.status}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white font-bold text-xl">{offer.price ? `${offer.price} PLN` : "Free Adoption"}</p>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{offer.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">For request: {offer.requestTitle}</p>
                      </div>
                      <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-gray-50 dark:border-dark-divider">
                        <button onClick={() => handleAcceptOffer(offer._id)} className="py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm">Accept</button>
                        <button onClick={() => handleRejectOffer(offer._id)} className="py-2.5 bg-gray-100 dark:bg-dark-raised text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm">Reject</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        ) : loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-dark-card rounded-3xl shadow-sm p-12 text-center border border-gray-100 dark:border-dark-divider">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full inline-flex mb-4">
                  <FaPaw className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {activeTab} requests</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Create a new request to start getting pet matches from shelters.</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request._id} className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-divider overflow-hidden hover:shadow-md transition-all flex flex-col">
                  <div className="bg-gray-50 dark:bg-dark-raised border-b border-gray-100 dark:border-dark-divider px-6 py-4 flex justify-between items-center">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">{request.status}</span>
                    {request.status === "Active" && <span className="text-xs font-bold text-gray-400 flex items-center"><FiClock className="mr-1" /> {calculateDaysLeft(request.expiryDate)} days left</span>}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{request.title}</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 mt-2">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Preferences</p>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-200"><FaPaw className="text-gray-400" /> {request.make || "Any"} {request.model || ""}</div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Budget</p>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400"><FiDollarSign className="text-green-500" /> &lt; {request.budgetMax || 0} PLN</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => toggleRequestExpanded(request._id)} className="flex-1 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl font-bold text-sm">
                        View Matches ({requestOffers[request._id]?.length || 0})
                      </button>
                      <button onClick={() => handleDeleteRequest(request._id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><FiTrash2 className="w-5 h-5" /></button>
                    </div>
                    
                    {expandedRequests.has(request._id) && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-divider">
                        {requestOffers[request._id]?.length > 0 ? (
                          <div className="space-y-2">
                            {requestOffers[request._id].map(offer => (
                              <div key={offer._id} className="bg-gray-50 dark:bg-dark-raised rounded-xl p-3 flex gap-3 items-center">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-gray-800 dark:text-white text-xs truncate">{offer.title}</h5>
                                  <p className="text-xs text-blue-600 font-bold">{offer.price ? `${offer.price} PLN` : "Free"}</p>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => handleAcceptOffer(offer._id)} className="p-1.5 bg-green-100 text-green-600 rounded-lg">✓</button>
                                  <button onClick={() => handleRejectOffer(offer._id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg">✕</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-center text-xs text-gray-500">No matches yet</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdoptionRequestsDashboard;
