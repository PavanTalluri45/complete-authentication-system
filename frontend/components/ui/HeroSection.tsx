"use client";

import { motion, Variants } from "framer-motion";
import { Github } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const headlineVariants: Variants = {
    hidden: {
      opacity: 0,
      y: isMobile ? 30 : 50,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const textVariants: Variants = {
    hidden: {
      opacity: 0,
      y: isMobile ? 25 : 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.8,
      },
    },
    hover: {
      scale: 1.05,
      y: -4,
      boxShadow: isDark
        ? "0 20px 40px -15px rgba(59, 130, 246, 0.3)"
        : "0 20px 40px -15px rgba(59, 130, 246, 0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    tap: {
      scale: 0.98,
      y: 0
    },
  };

  const gradientVariants: Variants = {
    animate: {
      x: [0, isMobile ? 40 : 80, 0],
      y: [0, isMobile ? -30 : -50, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };


  const colors = {
    light: {
      primary: "#111827",
      secondary: "#4B5563",
      accent: "#2563EB",
      button: "#2563EB",
      buttonHover: "#1D4ED8",
      background: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%)",
      grid: "rgba(0, 0, 0, 0.03)",
      gradient1: "linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)",
      gradient2: "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)",
    },
    dark: {
      primary: "#F9FAFB",
      secondary: "#D1D5DB",
      accent: "#60A5FA",
      button: "#3B82F6",
      buttonHover: "#60A5FA",
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)",
      grid: "rgba(255, 255, 255, 0.04)",
      gradient1: "linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(139, 92, 246, 0.12) 100%)",
      gradient2: "linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(59, 130, 246, 0.12) 100%)",
    },
  };

  const currentColors = isDark ? colors.dark : colors.light;

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-24"
      aria-label="Enterprise-grade authentication platform"
      style={{
        background: currentColors.background
      }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-3xl"
          variants={gradientVariants}
          animate="animate"
          style={{
            background: currentColors.gradient1
          }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-3xl"
          variants={gradientVariants}
          animate="animate"
          style={{
            background: currentColors.gradient2,
            rotate: 45
          }}
        />
      </div>

      {/* Dynamic grid overlay */}
      <div
        className="absolute inset-0 bg-size-[50px_50px] md:bg-size-[70px_70px]"
        style={{
          backgroundImage: `linear-gradient(${currentColors.grid} 1px, transparent 1px),
                           linear-gradient(90deg, ${currentColors.grid} 1px, transparent 1px)`
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >

            {/* Main Headline */}
            <motion.div variants={headlineVariants} className="mb-4 md:mb-6">
              <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-bold tracking-tight">
                <span
                  className="block px-2 bg-clip-text"
                  style={{ color: currentColors.primary }}
                >
                  Complete
                </span>
                <span className="block mt-2 md:mt-4 px-2">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${currentColors.accent}, ${isDark ? '#10B981' : '#059669'})`
                    }}
                  >
                    Authentication System
                  </span>
                </span>
              </h1>
            </motion.div>

            {/* Subheading */}
            <motion.div variants={textVariants} className="mb-4 md:mb-6">
              <p
                className="text-lg sm:text-xl md:text-2xl max-w-4xl mx-auto font-medium px-4"
                style={{ color: currentColors.secondary }}
              >
                Production-ready auth with zero-compromise security
              </p>
            </motion.div>

            {/* Description */}
            <motion.div variants={textVariants} className="mb-8 md:mb-10">
              <p
                className="text-sm xs:text-base sm:text-lg max-w-5xl mx-auto leading-relaxed px-4"
                style={{ color: currentColors.secondary }}
              >
                Built on a solid <span className="font-semibold" style={{ color: currentColors.accent }}>Next.js 16</span> foundation with end-to-end
                <span className="font-semibold" style={{ color: currentColors.accent }}> TypeScript</span> safety, this authentication system uses a scalable
                <span className="font-semibold" style={{ color: currentColors.accent }}> microservices architecture</span>. User sessions are secured with
                dual-layer <span className="font-semibold" style={{ color: currentColors.accent }}>JWT tokens</span> and real-time session control via
                <span className="font-semibold" style={{ color: currentColors.accent }}> Redis</span>. Persistent data is handled through optimized
                <span className="font-semibold" style={{ color: currentColors.accent }}> MySQL</span> schemas, while transactional emails run through
                <span className="font-semibold" style={{ color: currentColors.accent }}> Nodemailer</span>. The UI blends
                <span className="font-semibold" style={{ color: currentColors.accent }}> Tailwind CSS</span> and
                <span className="font-semibold" style={{ color: currentColors.accent }}> Shadcn</span> components, enhanced with subtle
                <span className="font-semibold" style={{ color: currentColors.accent }}> Framer Motion</span> animations for a clean, modern experience.
              </p>
            </motion.div>


            {/* GitHub Button */}
            <motion.div
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              className="px-4"
            >
              <a
                href="https://github.com/blastgamer59/complete-authentication-system"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 font-semibold group w-full sm:w-auto justify-center"
                style={{
                  backgroundColor: currentColors.button,
                  color: isDark ? '#0F172A' : '#FFFFFF',
                }}
                aria-label="Explore source code on GitHub"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentColors.buttonHover;
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = isDark
                    ? '0 20px 40px -15px rgba(59, 130, 246, 0.3)'
                    : '0 20px 40px -15px rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentColors.button;
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Github className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-base">Explore the Codebase</span>
                <svg
                  className="w-5 h-5 ml-1 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
