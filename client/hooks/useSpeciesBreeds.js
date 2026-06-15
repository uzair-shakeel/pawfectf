import { useState, useEffect } from 'react';

export const useSpeciesBreeds = () => {
  const [speciesData, setSpeciesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/data/species.json');
        if (!res.ok) throw new Error('Failed to load species data');
        const data = await res.json();
        setSpeciesData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading species data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getSpecies = () => speciesData.map(item => item.species);

  const getBreedsForSpecies = (species) => {
    if (!species) return [];
    const found = speciesData.find(item => item.species === species);
    return found ? found.breeds : [];
  };

  return { speciesData, loading, error, getSpecies, getBreedsForSpecies };
};
