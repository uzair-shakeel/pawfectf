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


    </div>
  );
};

export default BlogPage;
