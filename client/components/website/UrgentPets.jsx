import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, MapPin, Heart, Zap } from 'lucide-react';

const UrgentPets = () => {
  const [urgentPets, setUrgentPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrgentPets();
  }, []);

  const fetchUrgentPets = async () => {
    try {
      // Mock data for now
      const mockData = [
        {
          _id: '1',
          name: 'Luna',
          species: 'Dog',
          breed: 'Golden Retriever',
          images: ['/placeholder.jpg'],
          location: { city: 'Warsaw' },
          urgentNeed: 'Critical food shortage',
          daysLeft: 2,
          goalAmount: 150,
          raisedAmount: 80
        },
        {
          _id: '2',
          name: 'Whiskers',
          species: 'Cat',
          breed: 'Persian',
          images: ['/placeholder.jpg'],
          location: { city: 'Krakow' },
          urgentNeed: 'Special diet required',
          daysLeft: 5,
          goalAmount: 100,
          raisedAmount: 30
        },
        {
          _id: '3',
          name: 'Max',
          species: 'Dog',
          breed: 'German Shepherd',
          images: ['/placeholder.jpg'],
          location: { city: 'Gdansk' },
          urgentNeed: 'Recovery food needed',
          daysLeft: 1,
          goalAmount: 200,
          raisedAmount: 160
        }
      ];
      setUrgentPets(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching urgent pets:', error);
      setLoading(false);
    }
  };

  const getProgressPercentage = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 1) return 'text-red-600 bg-red-50 border-red-200';
    if (daysLeft <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Urgent Food Needs</h2>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Urgent
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pets Needing Food Now</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These pets have critical food needs. Your immediate help can make the difference between hunger and health.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {urgentPets.map((pet) => (
            <div key={pet._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Image */}
              <div className="relative">
                <img
                  src={pet.images[0] || '/placeholder.jpg'}
                  alt={pet.name}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(pet.daysLeft)}`}>
                  <Clock className="h-3 w-3 inline mr-1" />
                  {pet.daysLeft} day{pet.daysLeft !== 1 ? 's' : ''} left
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors cursor-pointer">
                  <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-500">{pet.breed} • {pet.species}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {pet.location.city}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700 font-medium">{pet.urgentNeed}</p>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>₹{pet.raisedAmount} raised</span>
                    <span>₹{pet.goalAmount} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(pet.raisedAmount, pet.goalAmount)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(getProgressPercentage(pet.raisedAmount, pet.goalAmount))}% funded
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/food-donations/donate/${pet._id}`}
                    className="flex-1 bg-orange-600 text-white text-center py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Donate Food
                  </Link>
                  <Link
                    href={`/website/pets/${pet._id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Link
            href="/food-donations/urgent"
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-600 hover:text-white transition-colors"
          >
            View All Urgent Cases
            <Zap className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UrgentPets;