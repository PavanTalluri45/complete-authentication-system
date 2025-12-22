"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Header } from "@/components/ui/Header";
import { HeroSection } from "@/components/ui/HeroSection";
import { TechStackSection } from "@/components/ui/TechStackSection";
import { Footer } from "@/components/ui/Footer";
import { ProgressBar } from "@/components/ui/progress-bar";
import { authAPI, clearAuthCookies } from "@/lib/api";
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils";
import { Suspense } from "react";

function HomeContent() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [shouldRetryRefresh, setShouldRetryRefresh] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { theme, resolvedTheme, isThemeLoaded } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Check for Google OAuth success message
  useEffect(() => {
    const success = searchParams.get('success');
    const message = searchParams.get('message');

    if (success === 'true' && message) {
      showSuccessToast(message);

      // Clear the query params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const res = await authAPI.validateSession();
        if (res.data.success) {
          setIsCheckingAuth(false);
          return;
        }
      } catch {
        clearAuthCookies();
        router.push("/auth/login");
      }
    };

    if (isThemeLoaded) {
      hydrateSession();
    }
  }, [isThemeLoaded]);


  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await authAPI.logout();
      clearAuthCookies();
      showSuccessToast("Logged out successfully");

      setIsNavigating(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 500);

    } catch (error) {
      console.error("Logout error:", error);
      showErrorToast("Failed to log out");
      setIsSigningOut(false);
    }
  };

  // Show loading while checking
  if (!isThemeLoaded || isNavigating || isCheckingAuth) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"
        }`}>
        <ProgressBar isLoading={true} />
      </div>
    );
  }


  return (
    <>
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? "dark bg-gray-900" : "bg-linear-to-br from-blue-50 via-white to-purple-50"}`}>
        <ProgressBar isLoading={isNavigating} />

        <Header onSignOut={handleSignOut} isSigningOut={isSigningOut} />

        <main className={isDark ? "bg-gray-900" : ""}>
          <HeroSection />
          <TechStackSection />
        </main>

        <Footer />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ProgressBar isLoading={true} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}