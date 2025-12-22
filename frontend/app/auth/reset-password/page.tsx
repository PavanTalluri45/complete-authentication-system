"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Sun, Moon, Check } from "lucide-react";
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
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const { theme, setTheme, resolvedTheme, isThemeLoaded } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    mode: "onBlur",
  });

  const newPassword = watch("newPassword");

  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');

  // Get token from URL and validate on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      setToken(tokenFromUrl);

      if (!tokenFromUrl) {
        setTokenStatus('invalid');
        return;
      }

      // Validate token with backend
      const validateToken = async () => {
        try {
          await authAPI.validateResetToken(tokenFromUrl);
          setTokenStatus('valid');
        } catch (error) {
          console.error("Token validation failed:", error);
          setTokenStatus('invalid');
        }
      };

      validateToken();
    }
  }, []);

  // Navigation function
  const navigateToLogin = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/auth/login");
    }, 500);
  };

  // Show loading while validating token
  if (tokenStatus === 'loading' || !isThemeLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ProgressBar isLoading={true} />
      </div>
    );
  }

  // Show error if token is invalid or missing
  if (tokenStatus === 'invalid') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-white"}`}>
        <div className="text-center p-8 max-w-md">
          <div className="mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-red-900/20" : "bg-red-100"}`}>
              <svg className={`w-8 h-8 ${isDark ? "text-red-400" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Link Expired or Invalid
            </h1>
            <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              The password reset link is invalid or has expired. Please request a new reset link.
            </p>
          </div>
          <Button
            onClick={navigateToLogin}
            className="w-full h-12 rounded-full text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }


  // Handle form submission
  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      showErrorToast("Reset token is missing");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });

      // Success
      showSuccessToast("Password changed successfully!");
      setTimeout(() => {
        navigateToLogin();
      }, 2000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      showErrorToast(error.response?.data?.message || error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // Get theme icon based on current theme
  const getThemeIcon = () => {
    if (theme === "system") {
      return isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
    }
    return isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
  };

  // CSS classes
  const inputClasses = `h-12 rounded-full px-4 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${isDark
    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
    }`;

  const dropdownContentClasses = `w-40 ${isDark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-white border-gray-200 text-gray-900"
    }`;

  const dropdownItemClasses = `flex items-center justify-between cursor-pointer ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
    }`;

  return (
    <div className={`min-h-screen flex ${isDark ? "dark bg-gray-900" : "bg-white"}`}>
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
            src="/choosenewpassowrdlogo.webp"
            alt="Reset password background"
            fill
            className="object-cover object-center"
            priority
            sizes="50vw"
          />
        </div>
      </div>

      {/* Right Section - Reset Password Form */}
      <div className={`flex-1 flex items-center justify-center p-6 ${isDark ? "bg-gray-900" : "bg-white"
        }`}>
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"
                }`}>
                Choose a New Password
              </h1>
              <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                Create a strong password to secure your account
              </p>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className={isDark ? "text-gray-200" : "text-gray-700"}>
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className={`${inputClasses} pr-12`}
                  disabled={isLoading}
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                    }`}
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>

              {errors.newPassword && (
                <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={isDark ? "text-gray-200" : "text-gray-700"}>
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className={`${inputClasses} pr-12`}
                  disabled={isLoading}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === newPassword || "Passwords do not match",
                  })}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                    }`}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>

              {errors.confirmPassword && (
                <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                  {errors.confirmPassword.message}
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
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}