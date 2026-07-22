"use client";

import { useEffect, Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/website/Navbar.jsx";
import { Footer } from "../components/website/Footer.jsx";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { Search, Heart, MapPin, ArrowRight } from "lucide-react";

function HomeContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recentPets, setRecentPets] = useState([]);
  const [recentLost, setRecentLost] = useState([]);
  const [foodDonationPets, setFoodDonationPets] = useState([]);

  useEffect(() => {
    const clerkJwt = searchParams.get("__clerk_db_jwt");
    if (clerkJwt) {
      router.replace("/dashboard/profile");
      return;
    }

    // Lazy load services only when needed, with slight delay for better UX
    const timer = setTimeout(() => {
      Promise.all([
        import("../services/petService").then(({ getAllPets }) =>
          getAllPets().then(pets => {
            // Separate adoption pets and food donation pets
            const adoptionPets = pets.filter(p => p.type !== 'food_donation');
            const foodPets = pets.filter(p => p.type === 'food_donation' && p.status === 'Approved');
            setRecentPets(adoptionPets.slice(0, 4));
            setFoodDonationPets(foodPets.slice(0, 4));
          }).catch(() => { })
        ),
        import("../services/lostFoundService").then(({ getAllLostFound }) =>
          getAllLostFound().then(entries => setRecentLost(entries.slice(0, 4))).catch(() => { })
        )
      ]);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-main transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] sm:h-[450px] md:h-[650px] w-[98%] mx-auto my-4 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-900 group">
        <div className="absolute inset-0">
          <Image
            src="/bg.jpeg"
            alt="Adopt a pet"
            fill
            className="object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-700"
            priority
            sizes="100vw"
            quality={75}
          />
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
        </div>

        <div className="relative w-full z-10 h-full flex flex-col justify-center items-center text-center text-white px-3 sm:px-4 md:px-6">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black mb-2 sm:mb-3 md:mb-6 tracking-tight drop-shadow-xl animate-in slide-in-from-bottom-8 duration-700">
            {t('homepage.hero.title1')} <span className="text-blue-400">{t('homepage.hero.title2')}</span>
          </h1>
          <p className="text-md md:text-lg lg:text-2xl font-medium mb-4 sm:mb-6 md:mb-12 max-w-2xl text-gray-200 drop-shadow-md animate-in slide-in-from-bottom-8 duration-1000 delay-150">
            {t('homepage.hero.subtitle')}
          </p>

          <div className="w-full mt-60 md:mt-8 grid grid-cols-2 md:grid-cols-4 max-w-4xl bg-white/10 backdrop-blur-md p-3 sm:p-4 md:p-4 rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-white/20 shadow-2xl gap-2 sm:gap-3 md:gap-3 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
            <button
              onClick={() => router.push("/website/pets?species=Pies")}
              className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-bold flex flex-col items-center justify-center gap-1 sm:gap-2 text-sm sm:text-md md:text-base"
            >
              <span className="text-xl sm:text-2xl md:text-3xl">🐶</span> {t('homepage.hero.dogs')}
            </button>
            <button
              onClick={() => router.push("/website/pets?species=Kot")}
              className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-bold flex flex-col items-center justify-center gap-1 sm:gap-2 text-sm sm:text-md md:text-base"
            >
              <span className="text-xl sm:text-2xl md:text-3xl">🐱</span> {t('homepage.hero.cats')}
            </button>
            <button
              onClick={() => router.push("/website/lost-found")}
              className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-bold flex flex-col items-center justify-center gap-1 sm:gap-2 text-white text-sm sm:text-md md:text-base"
            >
              <span className="text-xl sm:text-2xl md:text-3xl">🔍</span> {t('homepage.hero.lostFound')}
            </button>
            <button
              onClick={() => router.push("/website/pets")}
              className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-1 sm:gap-2 text-white shadow-lg shadow-blue-500/25 text-md md:text-base"
            >
              <Search className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" /> {t('homepage.hero.allPets')}
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </section>



      <main className="flex-grow text-gray-900 dark:text-gray-200 max-w-7xl mx-auto w-full px-4 py-16 space-y-24">


        {/* Newly Listed Section */}
        {recentPets.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black">{t('homepage.newlyListed.title')}</h2>
                <p className="text-gray-500 mt-2">{t('homepage.newlyListed.subtitle')}</p>
              </div>
              <Link href="/website/pets" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
                {t('homepage.viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentPets.map((pet, i) => (
                <Link key={i} href={`/website/pets/${pet._id || pet.id}`} className="group bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-divider hover:shadow-xl transition-all block">
                  <div className="relative h-48">
                    <Image
                      src={(pet.images && pet.images[0]) || "/images/hamer1.png"}
                      alt={pet.name || "Pet"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      quality={60}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{pet.name || pet.species || "Pet"}</h3>
                    <p className="text-md text-gray-500 mb-2">{pet.breed || pet.species}</p>
                    <div className="flex items-center justify-between text-md">
                      {/* Fee display removed per user request */}
                      {/* <span className="font-semibold text-blue-600">{pet.adoptionFee ? `${pet.adoptionFee} PLN` : "Free"}</span> */}
                      <span className="text-gray-400">{pet.location?.city || "Available"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Pets Needing Food Section */}
        {foodDonationPets.length > 0 && (
          <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-dark-card dark:via-dark-card dark:to-dark-card rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-dark-divider shadow-lg">
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-bold mb-3">
                  <Heart className="h-3.5 w-3.5" />
                  {t('homepage.petsNeedingFood.badge')}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">{t('homepage.petsNeedingFood.title')}</h2>
                <p className="text-gray-600 dark:text-gray-400">{t('homepage.petsNeedingFood.subtitle')}</p>
              </div>
              <Link href="/website/food-donations" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 hover:gap-3 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {foodDonationPets.map((pet, i) => (
                <Link key={i} href={`/website/food-donations/donate/${pet._id || pet.id}`} className="group bg-white dark:bg-dark-raised rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-divider hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 block relative">
                  <div className="relative h-48">
                    <Image
                      src={(pet.images && pet.images[0]) || "/images/hamer1.png"}
                      alt={pet.name || "Pet"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      quality={60}
                    />
                    {pet.isUrgent && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold animate-pulse shadow-lg">
                        🚨 URGENT
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{pet.name || pet.species || "Pet"}</h3>
                      <Heart className="h-5 w-5 text-gray-400 group-hover:text-red-500 group-hover:fill-red-500 transition-all" />
                    </div>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-3">{pet.breed || pet.species}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-divider">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {pet.location?.city || "Available"}
                      </div>
                      <span className="text-md font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        {t('homepage.petsNeedingFood.donate')} →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/website/food-donations"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Heart className="h-4 w-4 mr-2" />
                See All Pets Needing Food
              </Link>
            </div>
          </section>
        )}

        {/* Why Adopt Section */}
        <section className="text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-12">{t('homepage.whyAdopt.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-divider">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('homepage.whyAdopt.saveLife.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('homepage.whyAdopt.saveLife.desc')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-divider">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('homepage.whyAdopt.localShelters.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('homepage.whyAdopt.localShelters.desc')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-divider">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('homepage.whyAdopt.easyProcess.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('homepage.whyAdopt.easyProcess.desc')}</p>
            </div>
          </div>
        </section>

        {/* Food Donations Section */}
        <section className="bg-blue-50 dark:bg-dark-card rounded-[2.5rem] p-8 md:p-16 border border-blue-100 dark:border-dark-divider my-16 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">{t('homepage.feedPets.title')}</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 font-medium">
              {t('homepage.feedPets.subtitle')}
            </p>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 font-medium max-w-3xl mx-auto">
              {t('homepage.feedPets.description', 'Pracujemy nad nową sekcją wsparcia zwierząt. Już wkrótce będzie można pomagać konkretnym podopiecznym oraz finansować określone cele, takie jak karma, leczenie czy niezbędne wyposażenie. Dziękujemy za cierpliwość!')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/website/food-donations" className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                {t('homepage.feedPets.browseBtn')}
              </Link>
              <Link href="/dashboard/food-pets/add" className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-dark-raised dark:border-dark-divider dark:text-gray-300 dark:hover:bg-dark-card font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95">
                {t('homepage.feedPets.listBtn')}
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="bg-blue-50 dark:bg-dark-card rounded-[2.5rem] p-8 md:p-16 border border-blue-100 dark:border-dark-divider my-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-16">{t('homepage.howItWorks.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-blue-200 dark:bg-blue-900/50 z-0"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-blue-500/30">1</div>
              <h3 className="text-xl font-bold mb-3">{t('homepage.howItWorks.step1.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('homepage.howItWorks.step1.desc')}</p>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-blue-500/30">2</div>
              <h3 className="text-xl font-bold mb-3">{t('homepage.howItWorks.step2.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('homepage.howItWorks.step2.desc')}</p>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-blue-500/30">3</div>
              <h3 className="text-xl font-bold mb-3">{t('homepage.howItWorks.step3.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('homepage.howItWorks.step3.desc')}</p>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black">{t('homepage.browseCategory.title')}</h2>
              <p className="text-gray-500 mt-2">{t('homepage.browseCategory.subtitle')}</p>
            </div>
            <Link href="/website/pets" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
              {t('homepage.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: t('homepage.browseCategory.smallDogs'), q: "species=Pies&size=Small", img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600" },
              { name: t('homepage.browseCategory.bigDogs'), q: "species=Pies&size=Large", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600" },
              { name: t('homepage.browseCategory.kittens'), q: "species=Kot&ageGroup=Baby", img: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=600" },
              { name: t('homepage.browseCategory.seniorPets'), q: "ageGroup=Senior", img: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=600" },
            ].map((cat, i) => (
              <Link key={i} href={`/website/pets?${cat.q}`} className="group relative h-48 md:h-64 rounded-2xl overflow-hidden">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  quality={60}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg md:text-xl">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Lost & Found Section */}
        <section className="bg-blue-50 dark:bg-dark-card rounded-[2.5rem] p-8 md:p-16 border border-blue-100 dark:border-dark-divider my-16 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">{t('homepage.lostFound.title')}</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 font-medium">
              {t('homepage.lostFound.subtitle')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10 relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-blue-200 dark:bg-blue-900/50 z-0"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black mb-4 ">1</div>
                <h3 className="text-lg font-bold mb-2">{t('homepage.lostFound.step1.title', 'Zgłoś zwierzaka')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('homepage.lostFound.step1.desc', 'Dodaj informacje o zaginięciu lub znalezieniu zwierzęcia wraz ze zdjęciami i lokalizacją.')}</p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black mb-4 ">2</div>
                <h3 className="text-lg font-bold mb-2">{t('homepage.lostFound.step2.title', 'Społeczność pomaga')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('homepage.lostFound.step2.desc', 'Użytkownicy będą mogli przeglądać ogłoszenia, zgłaszać obserwacje i udostępniać je dalej.')}</p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black mb-4 ">3</div>
                <h3 className="text-lg font-bold mb-2">{t('homepage.lostFound.step3.title', 'Szczęśliwy powrót')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('homepage.lostFound.step3.desc', 'Po odnalezieniu zwierzaka będzie można oznaczyć ogłoszenie jako zakończone i poinformować społeczność o szczęśliwym zakończeniu.')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/website/lost-found" className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/25">
                View All Lost & Found
              </Link>
              <Link href="/dashboard/lost-found/new" className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-dark-raised dark:border-dark-divider dark:text-gray-300 dark:hover:bg-dark-card font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95">
                Report a Pet
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 md:p-20 text-center text-white relative overflow-hidden my-16 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <Heart className="w-16 h-16 mx-auto mb-6 text-pink-400 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-black mb-6">{t('homepage.cta.title')}</h2>
            <p className="text-xl text-blue-100 mb-10 font-medium">{t('homepage.cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/website/pets" className="bg-white text-blue-700 hover:bg-gray-50 dark:hover:bg-dark-card font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-xl">
                {t('homepage.cta.adoptBtn')}
              </Link>
              <Link href="/sign-up" className="bg-blue-800/50 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95 backdrop-blur-sm border border-blue-500/30">
                {t('homepage.cta.listBtn')}
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
