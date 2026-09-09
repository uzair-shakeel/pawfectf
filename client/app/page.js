"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/website/Navbar.jsx";
import { Footer } from "../components/website/Footer.jsx";
import CustomSelect from "../components/website/CustomSelect.jsx";
import LocationSearch from "../components/website/LocationSearch.jsx";
import HomePetCard from "../components/website/HomePetCard.jsx";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { mergeWithDemoPets, DEMO_PETS } from "../lib/demoPets";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import {
  Search,
  Heart,
  MapPin,
  ArrowRight,
  PawPrint,
  ShieldCheck,
  Quote,
  Star,
  HeartHandshake,
  Users,
  Home as HomeIcon,
} from "lucide-react";

const resolveImage = (src, fallback) =>
  typeof src === "string" && /^(https?:\/\/|\/)/.test(src) ? src : fallback;

const HERO_STATS = [
  { value: "500+", key: "homepage.stats.pets", fallback: "Pets looking for a home" },
  { value: "120+", key: "homepage.stats.shelters", fallback: "Partner shelters" },
  { value: "2.400+", key: "homepage.stats.adoptions", fallback: "Happy adoptions" },
];

function SectionHeading({ eyebrow, title, subtitle, href, linkLabel }) {
  return (
    <div className="mb-8 flex flex-row items-end justify-between gap-3 md:mb-12 md:gap-6">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[1.85rem] font-bold leading-[1.12] tracking-tight text-[#0F172A] dark:text-white md:text-[3.1rem]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#64748B] dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group mb-1 inline-flex shrink-0 items-center gap-1.5 border-b border-[#0F172A] pb-0.5 text-sm font-semibold whitespace-nowrap text-[#0F172A] dark:border-white dark:text-white"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function HomeContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recentPets, setRecentPets] = useState([]);
  const [recentLost, setRecentLost] = useState([]);
  const [foodDonationPets, setFoodDonationPets] = useState([]);
  const [searchSpecies, setSearchSpecies] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    const clerkJwt = searchParams.get("__clerk_db_jwt");
    if (clerkJwt) {
      router.replace("/dashboard/profile");
      return;
    }

    const timer = setTimeout(() => {
      Promise.all([
        import("../services/petService").then(({ getAllPets }) =>
          getAllPets()
            .then((pets) => {
              const adoptionPets = pets.filter((p) => p.type !== "food_donation");
              const foodPets = pets.filter((p) => p.type === "food_donation" && p.status === "Approved");
              setRecentPets(mergeWithDemoPets(adoptionPets, 8));
              setFoodDonationPets(foodPets.slice(0, 4));
            })
            .catch(() => setRecentPets(DEMO_PETS.slice(0, 8)))
        ),
        import("../services/lostFoundService").then(({ getAllLostFound }) =>
          getAllLostFound()
            .then((entries) => setRecentLost(entries.slice(0, 3)))
            .catch(() => {})
        ),
      ]);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const handleHeroSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchSpecies) params.set("species", searchSpecies);
    if (searchLocation.trim()) params.set("location", searchLocation.trim());
    const query = params.toString();
    router.push(query ? `/website/pets?${query}` : "/website/pets");
  };

  const testimonials = [
    {
      quote: t("homepage.testimonials.one.quote", "The whole process took less than a week. Luna settled in as if she had always lived here."),
      name: t("homepage.testimonials.one.name", "Anna K."),
      city: t("homepage.testimonials.one.city", "Warsaw"),
    },
    {
      quote: t("homepage.testimonials.two.quote", "I could message the shelter directly and ask everything before deciding. No stress at all."),
      name: t("homepage.testimonials.two.name", "Marek W."),
      city: t("homepage.testimonials.two.city", "Krakow"),
    },
    {
      quote: t("homepage.testimonials.three.quote", "We reported our lost cat in the evening and a neighbour found him the very next morning."),
      name: t("homepage.testimonials.three.name", "Julia S."),
      city: t("homepage.testimonials.three.city", "Gdansk"),
    },
  ];

  const speciesOptions = [
    { value: "", label: t("homepage.hero.searchSpecies", "All species") },
    { value: "Pies", label: t("homepage.hero.dogs") },
    { value: "Kot", label: t("homepage.hero.cats") },
  ];

  const whyItems = [
    { num: "01", title: t("homepage.whyAdopt.saveLife.title"), desc: t("homepage.whyAdopt.saveLife.desc") },
    { num: "02", title: t("homepage.whyAdopt.localShelters.title"), desc: t("homepage.whyAdopt.localShelters.desc") },
    { num: "03", title: t("homepage.whyAdopt.easyProcess.title"), desc: t("homepage.whyAdopt.easyProcess.desc") },
  ];

  return (
    <div className="marketing-ui flex min-h-screen w-full max-w-full flex-col bg-[#F4F7FB] text-[#0F172A] transition-colors duration-300 dark:bg-dark-main dark:text-gray-200">
      <Navbar />

      <div className="min-w-0 overflow-x-hidden">
      <section className="relative isolate min-h-[72svh] md:min-h-[78svh]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 top-[-20%] h-[120%]">
            <Image
              src="/home/hero-wide.jpg"
              alt={t("homepage.hero.imageDogAlt", "Dogs running toward a new home")}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top origin-top animate-kenburns"
            />
          </div>
          <div className="absolute inset-0 bg-[#0F172A]/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-[#0F172A]/40 to-transparent" />
        </div>

        <div className="relative z-20 mx-auto flex min-h-[72svh] w-full max-w-[1520px] flex-col justify-end px-4 pb-8 pt-10 sm:px-8 md:min-h-[78svh] lg:justify-center lg:pb-12">
          <div className="max-w-3xl">
            <h1 className="font-display text-[2.15rem] font-bold leading-[1.28] text-white sm:text-6xl sm:leading-[1.24] lg:text-[5.1rem] lg:leading-[1.22]">
              {t("homepage.hero.title1")}
              <br />
              <em className="font-semibold italic leading-[inherit] text-[#93C5FD]">{t("homepage.hero.title2")}</em>
            </h1>

            <form onSubmit={handleHeroSearch} className="mkt-search mt-9 w-full min-w-0 max-w-3xl">
              <CustomSelect
                value={searchSpecies}
                onChange={setSearchSpecies}
                options={speciesOptions}
                label={t("dashboard.filters.species", "Species")}
                icon={PawPrint}
                ariaLabel={t("homepage.hero.searchSpecies", "All species")}
              />

              <LocationSearch
                value={searchLocation}
                onChange={setSearchLocation}
                label={t("dashboard.filters.location", "Location")}
                placeholder={t("homepage.hero.searchLocation", "City or region")}
              />

              <button
                type="submit"
                className="inline-flex min-h-[68px] items-center justify-center gap-2 bg-[#2563EB] px-8 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#1D4ED8]"
              >
                <Search className="h-4 w-4" />
                {t("homepage.hero.searchBtn", "Search")}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
              <span className="font-semibold uppercase tracking-[0.16em] text-white/45">
                {t("homepage.hero.popular", "Popular:")}
              </span>
              {[
                { label: t("homepage.hero.dogs"), href: "/website/pets?species=Pies" },
                { label: t("homepage.hero.cats"), href: "/website/pets?species=Kot" },
                { label: t("homepage.hero.lostFound"), href: "/website/lost-found" },
                { label: t("homepage.hero.allPets"), href: "/website/pets" },
              ].map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="border-b border-white/25 pb-0.5 transition hover:border-white hover:text-white"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid w-full grid-cols-3 border-y border-[#0F172A] bg-[#0F172A] text-white dark:border-dark-divider">
        {HERO_STATS.map((stat, index) => (
          <div
            key={stat.key}
            className={`px-2 py-5 text-center sm:px-8 sm:py-8 ${index > 0 ? "border-l border-white/10" : ""}`}
          >
            <p className="font-display text-[1.35rem] font-bold whitespace-nowrap sm:text-5xl">{stat.value}</p>
            <p className="mt-2 text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-white/50 sm:text-xs sm:tracking-[0.16em]">
              {t(stat.key, stat.fallback)}
            </p>
          </div>
        ))}
      </div>

      <main className="w-full flex-grow">
        <section className="border-b border-[#E2E8F0] dark:border-dark-divider">
          <div className="mx-auto grid max-w-[1520px] grid-cols-2 md:grid-cols-4">
            {[
              { icon: ShieldCheck, label: t("homepage.trust.verified", "Verified shelters") },
              { icon: Heart, label: t("homepage.trust.free", "Free to browse") },
              { icon: Users, label: t("homepage.trust.community", "Active community") },
              { icon: HomeIcon, label: t("homepage.trust.support", "Post-adoption support") },
            ].map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-3 py-2.5 sm:gap-3 sm:px-8 sm:py-6 ${
                  index % 2 === 1 ? "border-l border-[#E2E8F0] dark:border-dark-divider" : ""
                } ${
                  index >= 2 ? "border-t border-[#E2E8F0] dark:border-dark-divider md:border-t-0" : ""
                } ${
                  index > 0 ? "md:border-l md:border-[#E2E8F0] dark:md:border-dark-divider" : ""
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 text-[#2563EB]" />
                <span className="text-sm font-semibold leading-snug sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {recentPets.length > 0 && (
          <section className="mx-auto w-full max-w-[1520px] px-4 pt-12 pb-6 sm:px-8 md:py-20">
            <SectionHeading
              title={t("homepage.newlyListed.title")}
              href="/website/pets"
              linkLabel={t("homepage.viewAll")}
            />
            <div className="-mx-4 md:mx-0 md:hidden">
              <Swiper
                modules={[Pagination]}
                slidesPerView={1.18}
                spaceBetween={12}
                centeredSlides
                pagination={{ clickable: true }}
                className="newly-swiper"
              >
                {recentPets.map((pet, i) => (
                  <SwiperSlide key={pet._id || i} className="!h-auto">
                    <HomePetCard pet={pet} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            <div className="hidden grid-cols-2 gap-4 md:grid lg:grid-cols-4">
              {recentPets.map((pet, i) => (
                <HomePetCard key={pet._id || i} pet={pet} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 bg-white dark:bg-dark-card md:mt-24">
          <div className="grid lg:grid-cols-12">
            <div className="relative min-h-[380px] lg:col-span-6 lg:min-h-[680px]">
              <Image
                src="/home/hero-hug.jpg"
                alt={t("homepage.hero.imageHugAlt", "Woman hugging her adopted dog")}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex items-center lg:col-span-6">
              <div className="w-full px-5 py-10 sm:py-14 sm:px-10 lg:px-16 xl:px-20">
                <h2 className="font-display max-w-xl text-[2.3rem] font-bold leading-[1.12] text-[#0F172A] dark:text-white md:text-[3.25rem]">
                  {t("homepage.whyAdopt.title")}
                </h2>
                <div className="mt-10 divide-y divide-[#E2E8F0] dark:divide-dark-divider">
                  {whyItems.map((item) => (
                    <article key={item.num} className="grid grid-cols-[56px_1fr] items-start gap-5 py-6 first:pt-0 last:pb-0">
                      <span className="font-display pt-0.5 text-2xl text-[#2563EB]">{item.num}</span>
                      <div>
                        <h3 className="font-display text-[1.45rem] font-bold text-[#0F172A] dark:text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#64748B] dark:text-white/55">
                          {item.desc}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-[1520px] px-4 py-16 sm:px-8 md:py-28">
          <h2 className="font-display text-[2.3rem] font-bold text-[#0F172A] dark:text-white md:text-[3.1rem]">
            {t("homepage.howItWorks.title")}
          </h2>
          <div className="mt-12 grid grid-cols-1 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0] dark:divide-dark-divider dark:border-dark-divider md:grid-cols-3 md:divide-x md:divide-y-0">
            {[1, 2, 3].map((step) => (
              <div key={step} className="px-0 py-8 md:px-10 md:py-12 first:md:pl-0 last:md:pr-0">
                <span className="font-display text-5xl text-[#2563EB]/80">0{step}</span>
                <h3 className="font-display mt-5 text-2xl font-bold text-[#0F172A] dark:text-white">
                  {t(`homepage.howItWorks.step${step}.title`)}
                </h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[#64748B] dark:text-white/55">
                  {t(`homepage.howItWorks.step${step}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1520px] px-4 pb-8 sm:px-8">
          <div className="grid overflow-hidden bg-white dark:bg-dark-card lg:grid-cols-2">
            <div className="relative min-h-[300px] lg:min-h-[560px]">
              <Image
                src="/home/feed-pets.jpg"
                alt={t("homepage.feedPets.imageAlt", "Volunteer feeding a shelter dog")}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center px-5 py-8 sm:py-12 sm:px-12 lg:px-16">
              <h2 className="font-display text-[1.8rem] font-bold leading-[1.15] text-[#0F172A] dark:text-white md:text-[3rem]">
                {t("homepage.feedPets.title")}
              </h2>
              <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-[#64748B] dark:text-white/55">
                {t("homepage.feedPets.subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/website/food-donations"
                  className="inline-flex items-center justify-center gap-3 bg-[#2563EB] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#1D4ED8]"
                >
                  <Heart className="h-5 min-w-4 w-4" />
                  {t("homepage.feedPets.browseBtn")}
                </Link>
                <Link
                  href="/dashboard/food-pets/add"
                  className="inline-flex items-center justify-center border border-[#0F172A] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-[#0F172A] transition hover:bg-[#0F172A] hover:text-white dark:border-white dark:text-white"
                >
                  {t("homepage.feedPets.listBtn")}
                </Link>
              </div>
            </div>
          </div>

          {foodDonationPets.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {foodDonationPets.map((pet, i) => (
                <Link
                  key={pet._id || i}
                  href={`/website/food-donations/donate/${pet._id || pet.id}`}
                  className="group block overflow-hidden bg-white dark:bg-dark-card"
                >
                  <div className="relative h-48">
                    <Image
                      src={resolveImage(pet.images?.[0], "/home/feed-pets.jpg")}
                      alt={pet.name || "Pet"}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {pet.isUrgent && (
                      <span className="absolute left-3 top-3 bg-red-600 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-xl text-[#0F172A] dark:text-white">
                      {pet.name || pet.species || "Pet"}
                    </h3>
                    <p className="mt-1 text-sm text-[#64748B]">{pet.breed || pet.species}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-sm dark:border-dark-divider">
                      <span className="flex items-center gap-1 text-[#64748B]">
                        <MapPin className="h-3.5 w-3.5" />
                        {pet.location?.city || "Available"}
                      </span>
                      <span className="font-semibold text-[#2563EB]">{t("homepage.petsNeedingFood.donate")} →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="relative mt-16 min-h-[520px] w-full overflow-hidden md:mt-24 md:min-h-[600px]">
          <Image
            src="/home/lost-found.jpg"
            alt={t("homepage.lostFound.imageAlt", "Dog running back to its owner")}
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#0F172A]/70" />
          <div className="relative z-10 mx-auto flex min-h-[520px] max-w-[1520px] items-center px-4 py-16 sm:px-8 md:min-h-[600px]">
            <div className="max-w-2xl">
              <h2 className="font-display text-[2.4rem] font-bold leading-[1.1] text-white md:text-[3.4rem]">
                {t("homepage.lostFound.heading", "Every hour counts when a pet goes missing")}
              </h2>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/70">
                {t("homepage.lostFound.subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/website/lost-found"
                  className="inline-flex items-center justify-center gap-2 !bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] !text-[#0F172A]"
                >
                  {t("homepage.lostFound.browseBtn", "Browse reports")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/lost-found/new"
                  className="inline-flex items-center justify-center border border-white/40 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white"
                >
                  {t("homepage.lostFound.reportBtn", "Report a pet")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {recentLost.length > 0 && (
          <div className="mx-auto grid w-full max-w-[1520px] grid-cols-1 gap-px bg-[#E2E8F0] px-0 sm:grid-cols-3 dark:bg-dark-divider">
            {recentLost.map((entry, i) => (
              <Link
                key={entry._id || i}
                href={`/website/lost-found/${entry._id}`}
                className="flex items-center gap-4 bg-[#F4F7FB] px-5 py-5 dark:bg-dark-main"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[#E2E8F0]">
                  <Image
                    src={resolveImage(entry.images?.[0], "/home/lost-found.jpg")}
                    alt={entry.title || "Lost pet"}
                    fill
                    loading="lazy"
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                    {entry.type || "Lost"}
                  </span>
                  <p className="mt-1 truncate font-semibold">{entry.title || entry.species || "—"}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-[#64748B]">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {entry.location?.city || "—"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <section className="w-full bg-[#0F172A] text-white">
          <div className="px-4 py-16 sm:px-8 md:px-12 md:py-24">
            <div className="mb-12">
              <h2 className="font-display text-[2.3rem] font-bold md:text-[3.4rem]">
                {t("homepage.testimonials.title", "Stories from our community")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3">
              {testimonials.map((item, index) => (
                <figure
                  key={item.name}
                  className={`py-10 md:px-10 md:py-4 ${index > 0 ? "border-t border-white/10 md:border-l md:border-t-0" : ""} ${index === 0 ? "md:pl-0" : ""} ${index === testimonials.length - 1 ? "md:pr-0" : ""}`}
                >
                  <Quote className="h-8 w-8 text-[#2563EB]" />
                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#93C5FD] text-[#93C5FD]" />
                    ))}
                  </div>
                  <blockquote className="font-display mt-6 text-[1.35rem] font-normal leading-relaxed text-white/90">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="mt-8 text-sm">
                    <span className="block font-semibold">{item.name}</span>
                    <span className="mt-0.5 block uppercase tracking-[0.14em] text-white/40">{item.city}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="relative min-h-[480px] w-full overflow-hidden md:min-h-[560px]">
          <Image
            src="/home/cta-family.jpg"
            alt={t("homepage.cta.imageAlt", "Family walking their adopted dog")}
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#0F172A]/65" />
          <div className="relative z-10 mx-auto flex min-h-[480px] max-w-[800px] flex-col items-center justify-center px-6 py-20 text-center text-white md:min-h-[560px]">
            <HeartHandshake className="mb-6 h-10 w-10 text-[#93C5FD]" />
            <h2 className="font-display text-[2.4rem] font-bold leading-tight md:text-[4rem]">
              {t("homepage.cta.title")}
            </h2>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white/70">
              {t("homepage.cta.subtitle")}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/website/pets"
                className="inline-flex items-center justify-center gap-2 bg-[#2563EB] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#1D4ED8]"
              >
                <PawPrint className="h-4 w-4" />
                {t("homepage.cta.adoptBtn")}
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center border border-white px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white"
              >
                {t("homepage.cta.listBtn")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#2563EB]/20 border-t-[#2563EB]" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
