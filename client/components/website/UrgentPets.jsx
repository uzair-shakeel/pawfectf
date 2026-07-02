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
    if (daysLeft <= 1) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (daysLeft <= 3) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-dark-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Urgent Food Needs</h2>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-dark-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Urgent
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pets Needing Food Now</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            These pets have critical food needs. Your immediate help can make the difference between hunger and health.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {urgentPets.map((pet) => (
            <div key={pet._id} className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-dark-divider overflow-hidden hover:shadow-xl transition-shadow">
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
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm rounded-full p-2 hover:bg-white dark:hover:bg-dark-raised transition-colors cursor-pointer">
                  <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{pet.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pet.breed} • {pet.species}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    {pet.location.city}
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{pet.urgentNeed}</p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>{pet.raisedAmount} zł raised</span>
                    <span>{pet.goalAmount} zł goal</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(pet.raisedAmount, pet.goalAmount)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(getProgressPercentage(pet.raisedAmount, pet.goalAmount))}% funded
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/website/food-donations/donate/${pet._id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Donate Food
                  </Link>
                  <Link
                    href={`/website/pets/${pet._id}`}
                    className="px-4 py-2 border border-gray-300 dark:border-dark-divider text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-raised transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/website/food-donations"
            className="inline-flex items-center px-6 py-3 bg-white dark:bg-dark-card border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
          >
            View All Cases
            <Zap className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UrgentPets;
