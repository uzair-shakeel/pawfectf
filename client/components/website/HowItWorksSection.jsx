import React from 'react';
import { Search, Heart, Truck, Award } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: 'Find a Pet',
      description: 'Browse pets in need or filter by location, species, and urgency level.',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      icon: Heart,
      title: 'Choose Your Donation',
      description: 'Select a food package (basic, premium, deluxe) and duration that fits your budget.',
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    {
      icon: Truck,
      title: 'Food Gets Delivered',
      description: 'We coordinate directly with shelters to ensure food reaches the pet quickly.',
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      icon: Award,
      title: 'Track Your Impact',
      description: 'Receive updates on how your donation helped and see the difference you made.',
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How Food Donation Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, transparent, and direct - your donation makes an immediate impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-md font-bold z-10">
                {index + 1}
              </div>

              {/* Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 h-full">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border ${step.color} mb-6`}>
                  <step.icon className="h-8 w-8" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              {/* Arrow (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-0">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h3>
            <p className="text-lg text-orange-100 mb-6 max-w-2xl mx-auto">
              Join thousands of pet lovers who are helping feed homeless animals. Every donation, no matter the size, makes a real impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                <Heart className="h-5 w-5 mr-2" />
                Start Donating
              </button>
              <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;