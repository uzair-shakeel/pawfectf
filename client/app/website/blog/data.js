import { useLanguage } from "../../../lib/i18n/LanguageContext";

export const useBlogPosts = () => {
  const { t, currentLanguage } = useLanguage();

  const blogPosts = [
    {
      id: 1,
      title: t("blog:posts.1.title"),
      excerpt: t("blog:posts.1.excerpt"),
      image:
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
      date: currentLanguage === "pl" ? "15 marca 2024" : "March 15, 2024",
      category: t("blog:posts.1.category"),
      readTime: "5",
      author: "John Smith",
      content: `
        <h2>${t("blog:posts.1.content.intro.title")}</h2>
        <p>${t("blog:posts.1.content.intro.text")}</p>

        <h2>${t("blog:posts.1.content.cars.1.title")}</h2>
        <p>${t("blog:posts.1.content.cars.1.text")}</p>

        <h2>${t("blog:posts.1.content.cars.2.title")}</h2>
        <p>${t("blog:posts.1.content.cars.2.text")}</p>

        <h2>${t("blog:posts.1.content.cars.3.title")}</h2>
        <p>${t("blog:posts.1.content.cars.3.text")}</p>

        <h2>${t("blog:posts.1.content.cars.4.title")}</h2>
        <p>${t("blog:posts.1.content.cars.4.text")}</p>

        <h2>${t("blog:posts.1.content.cars.5.title")}</h2>
        <p>${t("blog:posts.1.content.cars.5.text")}</p>

        <h2>${t("blog:posts.1.content.conclusion.title")}</h2>
        <p>${t("blog:posts.1.content.conclusion.text")}</p>
      `,
    },
    {
      id: 2,
      title: t("blog:posts.2.title"),
      excerpt: t("blog:posts.2.excerpt"),
      image:
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
      date: currentLanguage === "pl" ? "10 marca 2024" : "March 10, 2024",
      category: t("blog:posts.2.category"),
      readTime: "7",
      author: "Sarah Johnson",
      content: `
        <h2>${t("blog:posts.2.content.intro.title")}</h2>
        <p>${t("blog:posts.2.content.intro.text")}</p>

        <h2>${t("blog:posts.2.content.sections.current.title")}</h2>
        <p>${t("blog:posts.2.content.sections.current.text")}</p>

        <h2>${t("blog:posts.2.content.sections.levels.title")}</h2>
        <p>${t("blog:posts.2.content.sections.levels.text")}</p>
        <ul>
          ${t("blog:posts.2.content.sections.levels.list", {
            returnObjects: true,
          })
            .map((item) => `<li>${item}</li>`)
            .join("")}
        </ul>

        <h2>${t("blog:posts.2.content.conclusion.title")}</h2>
        <p>${t("blog:posts.2.content.conclusion.text")}</p>
      `,
    },
  ];

  return blogPosts;
};
