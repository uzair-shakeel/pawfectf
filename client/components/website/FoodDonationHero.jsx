import React from 'react';
import Link from 'next/link';
import { Heart, Award, Users, TrendingUp } from 'lucide-react';

const FoodDonationHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-16 overflow-hidden">
      <div className="absolute inset-0 bg-white/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Heart className="h-4 w-4" />
              New Feature
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Feed a Pet,
              <span className="text-orange-600"> Save a Life</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Sponsor pet food donations directly to shelters and help homeless animals get the nutrition they need while waiting for their forever homes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link 
                href="/website/pets" 
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Heart className="h-5 w-5 mr-2" />
                Start Donating
              </Link>
              <Link 
                href="/food-donations/how-it-works" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-600 hover:text-white transition-colors"
              >
                How It Works
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <div className="text-2xl font-bold text-orange-600">1,247</div>
                <div className="text-sm text-gray-500">Pets Fed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">89</div>
                <div className="text-sm text-gray-500">Shelters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">₹45k</div>
                <div className="text-sm text-gray-500">Donated</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4 lg:space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Direct Impact</h3>
                  <p className="text-sm text-gray-600">Your donation goes directly to feeding specific pets</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Verified Shelters</h3>
                  <p className="text-sm text-gray-600">All shelters are verified and trusted partners</p>
                </div>
              </div>
              <div className="space-y-4 lg:space-y-6 pt-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Community Driven</h3>
                  <p className="text-sm text-gray-600">Join thousands of pet lovers making a difference</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                  <p className="text-sm text-gray-600">Track your donation impact with live updates</p>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-200 rounded-full opacity-20"></div>
            <div className="absolute -bottom-8 -left-4 w-16 h-16 bg-pink-200 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodDonationHero;