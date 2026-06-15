"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../lib/i18n/LanguageContext";

const BLOG_POSTS = [
  {
    id: 1,
    titleKey: "buyCarEasily",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
    categoryKey: "guides",
    dateKey: "march5",
  },
  {
    id: 2,
    titleKey: "bestCars2025",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop",
    categoryKey: "guides",
    dateKey: "march3",
  },
  {
    id: 3,
    titleKey: "sellCarEasily",
    image:
      "https://images.unsplash.com/photo-1471479917193-f00955256257?q=80&w=2831&auto=format&fit=crop",
    categoryKey: "guides",
    dateKey: "march1",
  },
  {
    id: 4,
    titleKey: "financingOptions",
    image:
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=1974&auto=format&fit=crop",
    categoryKey: "guides",
    dateKey: "feb28",
  },
];

export function BlogSection() {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-white dark:bg-dark-main transition-colors duration-300">
      <div className=" mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-gray-900 dark:text-gray-200 dark:text-white transition-colors duration-300 tracking-tight">
          {t("homepage.blogSection.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {BLOG_POSTS.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group block h-full">
              <div className="bg-white dark:bg-dark-card rounded-3xl overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={t(`homepage.blogSection.posts.${post.titleKey}`)}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 dark:bg-dark-elevation-4 backdrop-blur text-gray-900 dark:text-gray-200 dark:text-white shadow-lg">
                    {t(`homepage.blogSection.categories.${post.categoryKey}`)}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                    {t(`homepage.blogSection.dates.${post.dateKey}`)}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight mb-2">
                    {t(`homepage.blogSection.posts.${post.titleKey}`)}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <button className="px-8 py-3 bg-white dark:bg-dark-main border border-gray-200 dark:border-gray-600 rounded-full text-sm font-bold text-gray-900 dark:text-gray-200 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2">
            {t("homepage.blogSection.viewAll")} <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
