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
          getAllPets().then(pets => setRecentPets(pets.slice(0, 4))).catch(() => {})
        ),
        import("../services/lostFoundService").then(({ getAllLostFound }) => 
          getAllLostFound().then(entries => setRecentLost(entries.slice(0, 4))).catch(() => {})
        )
      ]);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-main transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[650px] w-[98%] mx-auto my-4 rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-900 group">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=2000"
            alt="Adopt a pet"
            fill
            className="object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-700"
            priority
            sizes="100vw"
            quality={75}
          />
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
        </div>

        <div className="relative w-full z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-xl animate-in slide-in-from-bottom-8 duration-700">
            Find Your <span className="text-blue-400">Best Friend</span>
          </h1>
          <p className="text-lg md:text-2xl font-medium mb-12 max-w-2xl text-gray-200 drop-shadow-md animate-in slide-in-from-bottom-8 duration-1000 delay-150">
            Thousands of adoptable pets are looking for people. People like you.
          </p>

          <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-2xl md:rounded-[2rem] border border-white/20 shadow-2xl flex flex-col md:flex-row gap-3 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
            <button 
              onClick={() => router.push("/website/pets?species=Dog")}
              className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-4 rounded-xl md:rounded-2xl font-bold flex flex-col items-center justify-center gap-2"
            >
              <span className="text-3xl">🐶</span> Dogs
            </button>
            <button 
              onClick={() => router.push("/website/pets?species=Cat")}
              className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-4 rounded-xl md:rounded-2xl font-bold flex flex-col items-center justify-center gap-2"
            >
              <span className="text-3xl">🐱</span> Cats
            </button>
            <button 
              onClick={() => router.push("/website/lost-found")}
              className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-4 rounded-xl md:rounded-2xl font-bold flex flex-col items-center justify-center gap-2 text-white"
            >
              <span className="text-3xl">🔍</span> Lost & Found
            </button>
            <button 
              onClick={() => router.push("/website/pets")}
              className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-blue-500/25"
            >
              <Search className="w-5 h-5" /> All Pets
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
                <h2 className="text-3xl md:text-4xl font-black">Newly Listed</h2>
                <p className="text-gray-500 mt-2">Meet the newest additions looking for a home.</p>
              </div>
              <Link href="/website/pets" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
                View All <ArrowRight className="w-4 h-4" />
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
                    <p className="text-sm text-gray-500 mb-2">{pet.breed || pet.species}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-blue-600">{pet.adoptionFee ? `${pet.adoptionFee} PLN` : "Free"}</span>
                      <span className="text-gray-400">{pet.location?.city || "Available"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Why Adopt Section */}
        <section className="text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-12">Why Adopt via Pawfect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-divider">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Save a Life</h3>
              <p className="text-gray-600 dark:text-gray-400">When you adopt, you're giving a deserving animal a second chance at a happy life.</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-divider">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Local Shelters</h3>
              <p className="text-gray-600 dark:text-gray-400">We partner with local shelters and rescues to help you find the perfect pet near you.</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-dark-divider">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Easy Process</h3>
              <p className="text-gray-600 dark:text-gray-400">Our seamless platform makes finding, applying, and adopting your new best friend easy.</p>
            </div>
          </div>
        </section>

        {/* Food Donations Section */}
        <section className="bg-blue-50 dark:bg-dark-card rounded-[2.5rem] p-8 md:p-16 border border-blue-100 dark:border-dark-divider my-16 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">Help Feed Pets in Need</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 font-medium">
              Support pets waiting for adoption with food donations. Every contribution helps provide nutrition for animals in shelters.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600">450+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pets Fed This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600">25</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Partner Shelters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600">15k zł</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Food Donated</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/website/food-donations" className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Browse Pets Needing Food
              </Link>
              <Link href="/dashboard/food-pets/add" className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-dark-raised dark:border-dark-divider dark:text-gray-300 font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95">
                List Pet for Food Support
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="bg-blue-50 dark:bg-dark-card rounded-[2.5rem] p-8 md:p-16 border border-blue-100 dark:border-dark-divider my-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-16">How Pawfect Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-blue-200 dark:bg-blue-900/50 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-blue-500/30">1</div>
              <h3 className="text-xl font-bold mb-3">Find a Pet</h3>
              <p className="text-gray-600 dark:text-gray-400">Browse thousands of adorable pets from verified local shelters and private owners.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-blue-500/30">2</div>
              <h3 className="text-xl font-bold mb-3">Meet & Greet</h3>
              <p className="text-gray-600 dark:text-gray-400">Connect instantly via our platform to ask questions and schedule a meet-up.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-blue-500/30">3</div>
              <h3 className="text-xl font-bold mb-3">Take Them Home</h3>
              <p className="text-gray-600 dark:text-gray-400">Complete the adoption process and give your new best friend the loving home they deserve.</p>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black">Browse by Category</h2>
              <p className="text-gray-500 mt-2">Find exactly the companion you're looking for.</p>
            </div>
            <Link href="/website/pets" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Small Dogs", q: "species=Dog&size=Small", img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600" },
              { name: "Big Dogs", q: "species=Dog&size=Large", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600" },
              { name: "Kittens", q: "species=Cat&ageGroup=Baby", img: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=600" },
              { name: "Senior Pets", q: "ageGroup=Senior", img: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=600" },
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
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">Lost a Pet? Found a Pet?</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 font-medium">
              We are a community. Help reunite pets with their loving families or report a lost pet to get everyone looking.
            </p>
            
            {recentLost.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 text-left">
                {recentLost.map((entry, i) => (
                  <Link key={i} href={`/website/lost-found/${entry._id}`} className="group bg-white dark:bg-dark-raised rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-divider hover:shadow-xl transition-all block">
                    <div className="relative h-40">
                      <Image 
                        src={(entry.images && entry.images[0]) || "/images/hamer1.png"} 
                        alt={entry.title || "Pet"} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 25vw"
                        quality={60}
                      />
                      <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${entry.type === 'Lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                              {entry.type}
                          </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{entry.title}</h3>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span className="truncate">{entry.location?.city || "Unknown"}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/website/lost-found" className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/25">
                View All Lost & Found
              </Link>
              <Link href="/dashboard/lost-found/new" className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-dark-raised dark:border-dark-divider dark:text-gray-300 font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95">
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
            <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to change a life?</h2>
            <p className="text-xl text-blue-100 mb-10 font-medium">Join thousands of people who have found their perfect companion through Pawfect.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/website/pets" className="bg-white text-blue-700 hover:bg-gray-50 font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-xl">
                Adopt a Pet
              </Link>
              <Link href="/sign-up" className="bg-blue-800/50 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 active:scale-95 backdrop-blur-sm border border-blue-500/30">
                List a Pet
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
