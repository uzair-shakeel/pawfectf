"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useBlogPosts } from "./data";
import { useLanguage } from "../../../lib/i18n/LanguageContext";

const BlogPage = () => {
  const { t } = useLanguage();
  const blogPosts = useBlogPosts();

  return (
    <div className="bg-white py-4 dark:bg-dark-main min-h-screen">
      {/* Hero Banner Section with Image */}
      <div className=" mx-4 text-center rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat relative">
        <div
          className="w-full h-[300px] md:h-[500px] relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1)), url('/IMG_4467.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* <div className="bg-black/20 flex justify-start md:justify-end py-4 md:py-24 px-4 h-full">
            <div className="relative z-10 md:w-1/3 px-6 flex flex-col justify-center">
              <h1 className="text-xl font-extrabold pt-24 md:pt-0 text-white sm:text-4xl">
                {t("blog.hero.title")}
              </h1>
              <p className="mt-4 text-white text-lg">
                {t("blog.hero.subtitle")}
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2  gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/website/blog/${post.id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>
                    {post.readTime} {t("blog.minuteRead")}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 dark:text-white mb-2 transition-colors duration-300">
                  {post.title}
                </h2>
                <p className="text-gray-600">{post.excerpt}</p>
                <div className="mt-4">
                  <span className="text-blue-600 hover:text-blue-800 font-medium">
                    {t("blog.readMore")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
