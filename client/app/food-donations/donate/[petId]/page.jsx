"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaHeart, FaMapMarkerAlt, FaClock, FaUser, FaCreditCard } from 'react-icons/fa';
import Link from 'next/link';

const DonatePage = () => {
  const params = useParams();
  const router = useRouter();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        // Mock pet data matching the site style
        const mockPet = {
          _id: params.petId,
          name: 'Luna',
          species: 'Dog',
          breed: 'Golden Retriever',
          ageMonths: 24,
          gender: 'Female',
          images: ['/placeholder.jpg'],
          location: { city: 'Warsaw' },
          description: 'Luna is a gentle and loving golden retriever who was rescued from the streets. She needs consistent nutrition to recover her strength.',
          shelter: {
            name: 'Happy Paws Shelter',
            city: 'Warsaw',
            contactPhone: '+48 123 456 789'
          },
          foodNeed: {
            urgency: 'high',
            reason: 'Recovery food needed after surgery',
            goalAmount: 800,
            raisedAmount: 450,
            specialDiet: 'Prescription recovery diet'
          }
        };
        setPet(mockPet);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pet:', error);
        setLoading(false);
      }
    };
    fetchPet();
  }, [params.petId]);

  const handleDonate = async () => {
    setDonating(true);
    try {
      const amount = customAmount || selectedAmount;
      
      // Mock donation processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page
      router.push(`/food-donations/success/${params.petId}`);
    } catch (error) {
      console.error('Donation error:', error);
    } finally {
      setDonating(false);
    }
  };

  const getProgressPercentage = () => {
    if (!pet?.foodNeed) return 0;
    return Math.min((pet.foodNeed.raisedAmount / pet.foodNeed.goalAmount) * 100, 100);
  };

  const predefinedAmounts = [25, 50, 100, 200];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-main flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-main flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pet not found</h2>
          <p className="text-gray-600 dark:text-gray-400">The pet you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-main py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pet Information */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-divider overflow-hidden">
              <div className="relative h-80">
                <img
                  src={pet.images[0] || '/placeholder.jpg'}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-xl">
                  <div className="text-white font-bold">Goal: {pet.foodNeed.goalAmount} zł</div>
                  <div className="text-green-400 text-sm">{pet.foodNeed.raisedAmount} zł raised</div>
                </div>
              </div>
              
              <div className="p-6">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{pet.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{pet.breed} • {pet.species} • {pet.gender}</p>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>{Math.round(getProgressPercentage())}% funded</span>
                    <span>{pet.foodNeed.goalAmount - pet.foodNeed.raisedAmount} zł needed</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span>{pet.shelter.name}, {pet.shelter.city}</span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">{pet.description}</p>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                  <h3 className="font-bold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                    <FaClock />
                    Urgent Food Need
                  </h3>
                  <p className="text-red-800 dark:text-red-400 text-sm mb-2">{pet.foodNeed.reason}</p>
                  {pet.foodNeed.specialDiet && (
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      <span className="font-medium">Special diet:</span> {pet.foodNeed.specialDiet}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-divider p-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Make a Donation</h3>
              
              {/* Amount Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Donation Amount (zł)
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {setSelectedAmount(amount); setCustomAmount('');}}
                      className={`p-4 border rounded-xl font-bold transition-all ${
                        selectedAmount === amount && !customAmount
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'border-gray-200 dark:border-dark-divider hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {amount} zł
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => {setCustomAmount(e.target.value); setSelectedAmount(0);}}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-dark-divider rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-raised text-gray-900 dark:text-white"
                />
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Message for {pet.name} (Optional)
                </label>
                <textarea
                  rows="3"
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  placeholder="Send a message of support..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-dark-divider rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-raised text-gray-900 dark:text-white"
                />
              </div>

              {/* Anonymous Option */}
              <div className="mb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Donate anonymously</span>
                </label>
              </div>

              {/* Total and Donate Button */}
              <div className="border-t border-gray-200 dark:border-dark-divider pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount:</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {customAmount || selectedAmount} zł
                  </span>
                </div>

                <button
                  onClick={handleDonate}
                  disabled={donating || (!customAmount && !selectedAmount)}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {donating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaHeart />
                      Donate {customAmount || selectedAmount} zł
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Secure payment processing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;