import React from 'react';
import Link from 'next/link';
import { Heart, Award, Users, TrendingUp } from 'lucide-react';

const FoodDonationHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-dark-main dark:via-dark-main dark:to-dark-main py-16 overflow-hidden">
      <div className="absolute inset-0 bg-white/20 dark:bg-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-4 py-2 rounded-full text-md font-medium mb-4">
              <Heart className="h-4 w-4" />
              New Feature
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Feed a Pet,
              <span className="text-blue-600 dark:text-blue-400"> Save a Life</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
              Sponsor pet food donations directly to shelters and help homeless animals get the nutrition they need while waiting for their forever homes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                href="/website/pets"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Heart className="h-5 w-5 mr-2" />
                Start Donating
              </Link>
              <Link
                href="/website/faq"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
              >
                How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</div>
                <div className="text-md text-gray-500 dark:text-gray-400">Pets Fed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">89</div>
                <div className="text-md text-gray-500 dark:text-gray-400">Shelters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">45k zł</div>
                <div className="text-md text-gray-500 dark:text-gray-400">Donated</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4 lg:space-y-6">
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-dark-divider">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Direct Impact</h3>
                  <p className="text-md text-gray-600 dark:text-gray-400">Your donation goes directly to feeding specific pets</p>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-dark-divider">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Verified Shelters</h3>
                  <p className="text-md text-gray-600 dark:text-gray-400">All shelters are verified and trusted partners</p>
                </div>
              </div>
              <div className="space-y-4 lg:space-y-6 pt-8">
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg border border-green-100 dark:border-dark-divider">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community Driven</h3>
                  <p className="text-md text-gray-600 dark:text-gray-400">Join thousands of pet lovers making a difference</p>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg border border-pink-100 dark:border-dark-divider">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Updates</h3>
                  <p className="text-md text-gray-600 dark:text-gray-400">Track your donation impact with live updates</p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200 dark:bg-blue-900/30 rounded-full opacity-20"></div>
            <div className="absolute -bottom-8 -left-4 w-16 h-16 bg-pink-200 dark:bg-pink-900/30 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodDonationHero;
