"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Sun, Moon, Check, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";
import { Spinner } from "@/components/ui/spinner";
import { authAPI } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";

type Theme = "light" | "dark" | "system";

interface ResetPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const { theme, setTheme, resolvedTheme, isThemeLoaded } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  // Navigation to login page
  const navigateToLogin = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/auth/login");
    }, 500);
  };


  // Show loading while theme is loading
  if (!isThemeLoaded || isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ProgressBar isLoading={true} />
      </div>
    );
  }

  // Handle form submission 
  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      // Call API 
      const response = await authAPI.forgotPassword(data.email);

      if (response.data.success) {
        // Show success state
        setIsSubmitted(true);
        showSuccessToast("Password reset instructions sent to your email!");
      }

    } catch (error: any) {
      console.error("Forgot password error:", error);

      // Check for specific error messages from backend
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Google users cannot reset password")) {
          showErrorToast("This account uses Google authentication. Please sign in with Google.");
          return;
        }

        if (errorMessage.includes("doesn't have a password")) {
          showErrorToast("This account doesn't have a password. Please use Google login.");
          return;
        }

        if (errorMessage.includes("User not found")) {
          showErrorToast("No account found with this email. Please sign up.");
          return;
        }
      }

      // Show generic error
      showErrorToast("Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get theme icon
  const getThemeIcon = () => {
    if (theme === "system") {
      return isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
    }
    return isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
  };

  // CSS classes for consistent styling
  const inputClasses = `h-12 rounded-full px-6 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${isDark
    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500"
    : "bg-white border-gray-400 text-gray-900 placeholder-gray-400 focus:border-blue-500"
    }`;

  const dropdownContentClasses = `w-40 ${isDark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-white border-gray-200 text-gray-900"
    }`;

  const dropdownItemClasses = `flex items-center justify-between cursor-pointer ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
    }`;

  return (
    <>
      <div className={`min-h-screen flex ${isDark ? "dark bg-gray-900" : "bg-white"}`}>
        {/* Loading Progress Bar */}
        <ProgressBar isLoading={isNavigating} />

        {/* Theme Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`absolute top-6 right-6 z-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${isDark
                ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              aria-label="Theme settings"
            >
              {getThemeIcon()}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className={dropdownContentClasses}>
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={dropdownItemClasses}
            >
              <span>Light</span>
              {theme === "light" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={dropdownItemClasses}
            >
              <span>Dark</span>
              {theme === "dark" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className={dropdownItemClasses}
            >
              <span>System</span>
              {theme === "system" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Left Section - Image */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-linear-to-br from-blue-600 to-purple-700 relative overflow-hidden">
          <div className="relative w-full h-screen">
            <Image
              src="/resetpasswordlogo.webp"
              alt="Reset password background"
              fill
              className="object-cover object-center"
              priority
              sizes="50vw"
            />
          </div>
        </div>

        {/* Right Section - Reset Password Form */}
        <div
          className={`flex-1 flex items-center justify-center p-6 ${isDark ? "bg-gray-900" : "bg-white"
            }`}
        >
          <div className="w-full max-w-md">
            {!isSubmitted ? (
              // Form View
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
                noValidate
              >
                {/* Back to Login Button */}
                <Button
                  variant="link"
                  onClick={navigateToLogin}
                  className={`flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer font-medium ${isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                    } transition-colors duration-200`}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>

                {/* Title */}
                <div className="text-center mb-8">
                  <h1
                    className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Reset Your Password
                  </h1>
                  <p
                    className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                  >
                    Enter your email address and we'll send you instructions to
                    reset your password.
                  </p>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={isDark ? "text-gray-200" : "text-gray-700"}
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={inputClasses}
                    disabled={isLoading}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p
                      className={`text-sm ${isDark ? "text-red-400" : "text-red-600"
                        }`}
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full text-base font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner className="h-5 w-5 mr-2" />
                      Sending Instructions...
                    </div>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>
              </form>
            ) : (
              // Success View (after form submission)
              <div className="text-center space-y-6">
                {/* Back to Login */}
                <Button
                  variant="ghost"
                  onClick={navigateToLogin}
                  className={`p-0 h-auto mb-4 flex items-center gap-2 ${isDark
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>

                {/* Success Icon */}
                <div className="flex justify-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-green-900/20" : "bg-green-100"
                      }`}
                  >
                    <svg
                      className={`w-8 h-8 ${isDark ? "text-green-400" : "text-green-600"
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Success Message */}
                <div>
                  <h1
                    className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Check Your Email
                  </h1>
                  <p
                    className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                  >
                    We've sent password reset link to your email address.
                  </p>
                </div>

                {/* Additional Information */}
                <div
                  className={`text-sm p-4 rounded-lg ${isDark
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-50 text-gray-600"
                    }`}
                >
                  <p>
                    If you don't see the email in your inbox, please check your
                    spam folder or try again.
                  </p>
                </div>

                {/* Return to Login Button */}
                <Button
                  onClick={navigateToLogin}
                  className="w-full h-12 rounded-full text-base font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white"
                >
                  Return to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}