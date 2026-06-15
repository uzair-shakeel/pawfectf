import { useState, useEffect } from 'react';

export const useMakesModels = () => {
  const [makesData, setMakesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMakesData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/makes.json');
        if (!response.ok) {
          throw new Error('Failed to load makes data');
        }
        const data = await response.json();
        setMakesData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading makes data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMakesData();
  }, []);

  // Get all makes as a simple array
  const getMakes = () => {
    return makesData.map(item => item.make).sort();

    // const makes = makesData.map(item => item.make)
    //use Set to remove duplicates values
    // return [...new Set(makes)].sort;
  };

  // Get models for a specific make
  const getModelsForMake = (make) => {
    if (!make) return [];
    const makeData = makesData.find(item => item.make === make);
    return makeData ? makeData.models.sort() : [];
  };

  // Get all makes with their models (for more complex scenarios)
  const getAllMakesWithModels = () => {
    return makesData.map(item => ({
      make: item.make,
      models: item.models.sort()
    })).sort((a, b) => a.make.localeCompare(b.make));
  };

  return {
    makesData,
    loading,
    error,
    getMakes,
    getModelsForMake,
    getAllMakesWithModels
  };
};
