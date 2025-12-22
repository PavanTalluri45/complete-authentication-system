"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { GoogleButton } from "@/components/ui/google-button";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Theme = "light" | "dark" | "system";

interface LoginFormData {
  email: string;
  password: string;
}

// Create a separate component for the main content that uses useSearchParams
function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const { theme, setTheme, resolvedTheme, isThemeLoaded } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  // Check for OAuth errors in URL params
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'user_exists_with_email':
          showErrorToast("User already exists with email/password. Please sign in with email.");
          break;
        case 'invalid_state':
          showErrorToast("Security token expired. Please try again.");
          break;
        case 'google_auth_failed':
          showErrorToast("Google authentication failed. Please try again.");
          break;
        default:
          showErrorToast("Authentication failed. Please try again.");
      }

      // Clear the error from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authAPI.validateSession();
        if (response.data.success) {
          router.replace("/home");
        }
      } catch (error) {
        // Not logged in, stay on login page
      }
    };

    checkSession();
  }, [router]);

  // Cooldown timer effect for Modal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Handle OTP Verification
  const handleVerificationSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (otpValue.length !== 6) {
      showErrorToast("Please enter the complete 6-digit code");
      return;
    }

    setVerificationLoading(true);
    const email = getValues("email");

    try {
      await authAPI.signupVerifyOTP({
        email,
        otp: otpValue
      });

      // Success
      setShowVerifyModal(false);
      showSuccessToast("Email verified successfully! Please sign in.");

      const password = getValues("password");
      if (password) {
        handleLoginSubmit({ email, password });
      }

    } catch (error) {
      console.error("Verification error:", error);

    } finally {
      setVerificationLoading(false);
    }
  };

  // Handle Resend OTP in Modal
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    const email = getValues("email");
    setVerificationLoading(true);

    try {
      await authAPI.resendOtp(email);
      setResendCooldown(60);
    } catch (error: any) {
      if (error.response?.status === 429) {
        setResendCooldown(60);
      }
    } finally {
      setVerificationLoading(false);
    }
  };

  // Navigation functions
  const navigateToHome = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/home");
    }, 500);
  };

  const navigateToSignup = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/auth/signup");
    }, 500);
  };

  const navigateToForgotPassword = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/auth/forgot-password");
    }, 500);
  };

  // Show loading until theme is properly loaded
  if (!isThemeLoaded || isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ProgressBar isLoading={true} />
      </div>
    );
  }

  // Handle login form submission
  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await authAPI.login(data);

      if (response.data.message && response.data.message.includes("Account not verified")) {
        setShowVerifyModal(true);
        return;
      }

      // Success toast
      showSuccessToast("Login successful!");
      setTimeout(() => {
        navigateToHome();
      }, 1000);
    } catch (error: any) {
      console.error("Login error:", error);

      // Check for specific error status codes
      if (error.response?.status === 403) {
        showErrorToast("Account not verified. We sent an OTP to your email.");
        setShowVerifyModal(true);
        return;
      }

      // Check for specific error messages from backend
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Account not verified")) {
          showErrorToast("Account not verified. We sent an OTP to your email.");
          setShowVerifyModal(true);
          return;
        }

        if (errorMessage.includes("Google authentication")) {
          showErrorToast("This account uses Google authentication. Please click 'Sign in with Google'.");
          return;
        }

        // Show backend error message if it exists 
        showErrorToast(errorMessage);
        return;
      }

      if (error.response?.status !== 403 && !error.response?.data?.message) {
        showErrorToast("Invalid email or password");
      }
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
              src="/loginlogo.webp"
              alt="Login background"
              fill
              className="object-cover object-center"
              priority
              sizes="50vw"
            />
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className={`flex-1 flex items-center justify-center p-6 ${isDark ? "bg-gray-900" : "bg-white"
          }`}>
          <div className="w-full max-w-md">
            <form onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-6" noValidate>
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"
                  }`}>
                  Welcome Back
                </h1>
                <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                  Sign in to your account
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className={isDark ? "text-gray-200" : "text-gray-700"}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={inputClasses}
                  disabled={isLoading || isGoogleLoading}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className={isDark ? "text-gray-200" : "text-gray-700"}>
                    Password
                  </Label>
                  <Button
                    variant="link"
                    onClick={navigateToForgotPassword}
                    className="text-blue-500 hover:underline p-0 h-auto text-sm"
                    type="button"
                  >
                    Forgot password?
                  </Button>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`${inputClasses} pr-12`}
                    disabled={isLoading || isGoogleLoading}
                    {...register("password", {
                      required: "Password is required",
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                      }`}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>

                {errors.password && (
                  <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-full text-base font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner className="h-5 w-5 mr-2" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDark ? "border-gray-600" : "border-gray-300"
                    }`} />
                </div>

                <div className="relative flex justify-center text-xs uppercase">
                  <span className={`px-3 ${isDark ? "bg-gray-900 text-gray-400" : "bg-white text-gray-500"
                    }`}>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <GoogleButton
                type="signin"
                isLoading={isGoogleLoading}
                disabled={isLoading}
              />

              {/* Sign up link */}
              <div className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={navigateToSignup}
                  className="text-blue-500 font-medium hover:underline p-0 h-auto"
                  type="button"
                >
                  Create a new one
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <AlertDialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <AlertDialogContent className={`sm:max-w-md ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white"}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl font-bold">Verify Your Email</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Enter the 6-digit code sent to your email address.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className={`p-6 rounded-full ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
              <div className={`w-12 h-12 flex items-center justify-center rounded-full ${isDark ? "bg-blue-600" : "bg-blue-500"}`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={setOtpValue}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={0}
                  className={`w-12 h-12 text-xl border rounded-md ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                />
                <InputOTPSlot
                  index={1}
                  className={`w-12 h-12 text-xl border rounded-md ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                />
                <InputOTPSlot
                  index={2}
                  className={`w-12 h-12 text-xl border rounded-md ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                />
                <InputOTPSlot
                  index={3}
                  className={`w-12 h-12 text-xl border rounded-md ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                />
                <InputOTPSlot
                  index={4}
                  className={`w-12 h-12 text-xl border rounded-md ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                />
                <InputOTPSlot
                  index={5}
                  className={`w-12 h-12 text-xl border rounded-md ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                />
              </InputOTPGroup>
            </InputOTP>

            <Button
              onClick={handleVerificationSubmit}
              disabled={otpValue.length !== 6 || verificationLoading}
              className="w-full h-12 rounded-full text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              {verificationLoading ? <Spinner className="w-5 h-5 mr-2" /> : "Verify Email"}
            </Button>

            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || verificationLoading}
                className={`font-medium hover:underline p-0 bg-transparent border-none cursor-pointer ${isDark ? "text-blue-400" : "text-blue-600"
                  } ${resendCooldown > 0 ? "opacity-50 cursor-not-allowed no-underline" : ""}`}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Click to resend"}
              </button>
            </div>
            {/* Cancel/Close Button */}
            <div className="w-full">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className={`w-full text-sm font-medium hover:underline p-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Main export component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ProgressBar isLoading={true} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}