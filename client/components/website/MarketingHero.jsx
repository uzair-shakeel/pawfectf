import Image from "next/image";

export default function MarketingHero({
  image,
  imageAlt = "",
  eyebrow,
  title,
  subtitle,
  children,
  compact = false,
}) {
  return (
    <section className={`relative overflow-hidden ${compact ? "min-h-[240px] md:min-h-[280px]" : "min-h-[320px] md:min-h-[420px]"}`}>
      {image ? (
        <>
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center animate-kenburns"
          />
          <div className="absolute inset-0 bg-[#0F172A]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-[#0F172A]/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#0F172A]" />
      )}

      <div className={`relative z-10 mx-auto flex max-w-[1520px] flex-col justify-end px-4 sm:px-8 ${compact ? "py-12 md:py-16" : "py-16 md:py-24"}`}>
        {eyebrow && (
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#93C5FD]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display max-w-3xl text-[2.15rem] font-bold leading-[1.1] text-white md:text-[3.4rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/70">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
