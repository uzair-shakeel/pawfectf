"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Upload, MapPin, AlertCircle, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../lib/auth/AuthContext';
import { useLanguage } from "../../../../lib/i18n/LanguageContext";

const AddFoodPetPage = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    gender: 'Male',
    size: 'Medium',
    description: '',
    foodNeed: {
      urgency: 'medium',
      specialDiet: '',
      reason: '',
      estimatedCost: '',
      duration: '1_month'
    },
    shelter: {
      name: '',
      address: '',
      contactPhone: '',
      contactEmail: '',
      licenseNumber: ''
    },
    location: {
      city: '',
      address: '',
      coordinates: [21.01178, 52.22977] // Default to Warsaw
    }
  });

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          file,
          preview: event.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.species || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (images.length === 0) {
        toast.error('Please upload at least one image');
        return;
      }

      // Get auth token
      const token = await getToken();
      if (!token) {
        toast.error('Please sign in to add a pet');
        router.push('/sign-in');
        return;
      }

      // Create form data for backend
      const backendFormData = new FormData();

      // Add pet data fields directly
      backendFormData.append('title', formData.name);
      backendFormData.append('name', formData.name);
      backendFormData.append('description', formData.description);
      backendFormData.append('species', formData.species);
      backendFormData.append('breed', formData.breed || '');

      if (formData.age && !isNaN(parseInt(formData.age))) {
        backendFormData.append('ageMonths', parseInt(formData.age) * 12);
      }

      backendFormData.append('gender', formData.gender);
      backendFormData.append('size', formData.size);
      backendFormData.append('type', 'food_donation');
      backendFormData.append('status', 'Pending');
      backendFormData.append('adoptionStatus', 'Available');
      backendFormData.append('isUrgent', formData.foodNeed?.urgency === 'high' || formData.foodNeed?.urgency === 'critical');
      backendFormData.append('foodNeed', JSON.stringify(formData.foodNeed || {}));
      backendFormData.append('shelter', JSON.stringify(formData.shelter || {}));

      // Add images
      images.forEach((img) => {
        backendFormData.append('images', img.file);
      });

      // Get API base URL
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rafraf.pl';
      const apiUrl = `${API_BASE}/pets`;

      console.log('Submitting to:', apiUrl);

      // Submit directly to backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: backendFormData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pet added for food donations! Awaiting admin approval.');
        router.push('/dashboard/food-pets');
      } else {
        console.error('Server response:', data);
        throw new Error(data.error || data.message || 'Failed to add pet');
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      toast.error(error.message || 'Failed to add pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Heart className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("dashboard:foodPets.addTitle", "Add Pet for Food Donations")}</h1>
              <p className="text-gray-600 mt-1">{t("dashboard:foodPets.addSubtitle", "Help a pet in need by listing them for food sponsorship")}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">{t("dashboard:foodPets.approvalRequired", "Admin Approval Required")}</p>
              <p>{t("dashboard:foodPets.approvalDesc", "All pets must be approved by our admin team before appearing on the platform. We'll review your submission within 24 hours.")}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Pet Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t("dashboard:foodPets.petInfo", "Pet Information")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.petName", "Pet Name *")}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Luna"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.species", "Species *")}</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.species}
                  onChange={(e) => handleInputChange('species', e.target.value)}
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("dashboard:foodPets.breed", "Breed")}</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-dark-raised rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                >
                  <option value="">Select breed (optional)</option>
                  {formData.species === 'Dog' && ["Kundel / mieszaniec", "Akita", "Alaskan malamute", "Amstaff", "Australian shepherd", "Beagle", "Bernardyn", "Bichon frise", "Border collie", "Bokser", "Buldog angielski", "Buldog francuski", "Cane corso", "Chihuahua", "Chow chow", "Cocker spaniel", "Collie", "Dalmatyńczyk", "Doberman", "Dog niemiecki", "Golden retriever", "Gończy polski", "Husky syberyjski", "Jack russell terrier", "Jamnik", "Labrador retriever", "Maltańczyk", "Mastif", "Mops", "Nowofundland", "Owczarek belgijski", "Owczarek niemiecki", "Owczarek podhalański", "Papillon", "Pekińczyk", "Pit bull", "Pointer", "Pomeranian", "Pudel", "Rottweiler", "Samoyed", "Seter", "Shar pei", "Shiba inu", "Shih tzu", "Spaniel", "Staffordshire bull terrier", "Sznaucer", "Terier", "West highland white terrier", "Whippet", "Wyżeł", "Yorkshire terrier"].map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                  {formData.species === 'Cat' && ["Kundel / mieszaniec", "Abisyński", "American shorthair", "Angora turecka", "Bengalski", "Birma", "Bombay", "Brytyjski krótkowłosy", "Brytyjski długowłosy", "Devon rex", "Egzotyczny krótkowłosy", "Maine coon", "Norweski leśny", "Pers", "Ragdoll", "Rosyjski niebieski", "Sfinks", "Syjamski", "Syberyjski"].map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                  {formData.species !== 'Dog' && formData.species !== 'Cat' && (
                    <option value="Mixed">Mixed</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.age", "Age")}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="e.g. 2 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.gender", "Gender")}</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.size", "Size")}</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Extra Large">Extra Large</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.description", "Description *")}</label>
              <textarea
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about this pet's personality, current situation, and why they need food support..."
              />
            </div>
          </div>

          {/* Food Need Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t("dashboard:foodPets.foodNeedDetails", "Food Need Details")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.urgencyLevel", "Urgency Level")}</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.foodNeed.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value, 'foodNeed')}
                >
                  <option value="low">Low - Regular feeding schedule</option>
                  <option value="medium">Medium - Need consistent food supply</option>
                  <option value="high">High - Running low on food</option>
                  <option value="critical">Critical - Out of food in days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.estimatedCost", "Estimated Monthly Cost")}</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.foodNeed.estimatedCost}
                  onChange={(e) => handleInputChange('estimatedCost', e.target.value, 'foodNeed')}
                  placeholder="e.g. 200"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.specialDiet", "Special Dietary Requirements")}</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.foodNeed.specialDiet}
                onChange={(e) => handleInputChange('specialDiet', e.target.value, 'foodNeed')}
                placeholder="e.g. Grain-free, Senior formula, Prescription diet..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.reasonForNeed", "Reason for Food Need")}</label>
              <textarea
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.foodNeed.reason}
                onChange={(e) => handleInputChange('reason', e.target.value, 'foodNeed')}
                placeholder="Explain why this pet needs food support..."
              />
            </div>
          </div>

          {/* Shelter Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t("dashboard:foodPets.shelterInfo", "Shelter/Care Provider Information")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.orgName", "Organization Name *")}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.shelter.name}
                  onChange={(e) => handleInputChange('name', e.target.value, 'shelter')}
                  placeholder="e.g. Happy Paws Shelter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.licenseNumber", "License Number")}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.shelter.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value, 'shelter')}
                  placeholder="Organization license number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.contactPhone", "Contact Phone *")}</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.shelter.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value, 'shelter')}
                  placeholder="+48 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.contactEmail", "Contact Email *")}</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.shelter.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value, 'shelter')}
                  placeholder="contact@shelter.org"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.address", "Address *")}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.shelter.address}
                onChange={(e) => handleInputChange('address', e.target.value, 'shelter')}
                placeholder="Full shelter address"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-orange-600" />
              {t("dashboard:foodPets.location", "Location")}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard:foodPets.city", "City *")}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.location.city}
                onChange={(e) => handleInputChange('city', e.target.value, 'location')}
                placeholder="e.g. Warsaw"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Camera className="h-5 w-5 text-orange-600" />
              {t("dashboard:foodPets.photos", "Pet Photos")}
            </h2>

            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">{t("dashboard:foodPets.clickUpload", "Click to upload")}</span> {t("dashboard:foodPets.orDrag", "or drag and drop")}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG {t("dashboard:foodPets.or", "or")} JPEG (MAX. 5MB each)</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {t("dashboard:foodPets.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  {t("dashboard:foodPets.submitting", "Submitting...")}
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  {t("dashboard:foodPets.submitApproval", "Submit for Approval")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFoodPetPage;