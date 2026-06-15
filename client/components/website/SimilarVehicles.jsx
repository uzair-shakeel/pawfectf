import { useState, useEffect } from "react";
import { getAllPets } from "../../services/petService";
import CarCard from "./CarCard";

const SimilarVehicles = () => {
  const [cars, setCars] = useState([]);

  // Load all cars on initial render
  useEffect(() => {
    getAllPets()
      .then((data) => setCars(data))
      .catch((error) => console.error("Error fetching cars:", error));
  }, []);

  const visibleCars = cars.slice(0, 3);

  return (
    <div className="space-y-3 py-2">
      {visibleCars.map((car) => (
        <CarCard key={car._id} car={car} />
      ))}
    </div>
  );
};

export default SimilarVehicles;
