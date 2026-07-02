"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Heart, Share2, Home, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DonationSuccessPage = () => {
  const params = useParams();

  useEffect(() => {
    // Confetti or celebration animation could go here
    const timer = setTimeout(() => {
      toast.success('Thank you for your kindness! 🎉');
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'I just donated to help a pet in need!',
      text: 'Join me in supporting pets who need food assistance. Every donation makes a difference! 🐾❤️',
      url: window.location.origin + `/food-donations/donate/${params.petId}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to copying link
        navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Your donation has been successfully processed. You've just made a real difference in a pet's life!
            </p>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens next?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <span className="text-2xl">📧</span>
                  </div>
                  <p className="font-medium mb-1">Confirmation Email</p>
                  <p>You'll receive a receipt within 5 minutes</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <p className="font-medium mb-1">Shelter Coordination</p>
                  <p>Food will be ordered and delivered to the shelter</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <span className="text-2xl">📱</span>
                  </div>
                  <p className="font-medium mb-1">Updates</p>
                  <p>Get updates on how your donation helped</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <Share2 className="h-4 w-4" />
                Share the Love
              </button>
              <Link
                href="/website/pets"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <Heart className="h-4 w-4" />
                Help Another Pet
              </Link>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue exploring</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Back to Home</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </Link>
                <Link
                  href="/website/pets"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Browse Pets</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* Impact Message */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Impact</h3>
            <p className="text-lg text-gray-700 mb-6">
              Thanks to donors like you, we've provided over <span className="font-bold text-orange-600">45,000 PLN</span> worth of food 
              to <span className="font-bold text-orange-600">1,247 pets</span> in need across Poland.
            </p>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">89</div>
                <div>Partner Shelters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">1,247</div>
                <div>Pets Helped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">₹45k</div>
                <div>Food Donated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccessPage;