"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Sun, Moon, Check, ArrowLeft } from "lucide-react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { authAPI } from "@/lib/api";
import { GoogleButton } from "@/components/ui/google-button";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { Suspense } from "react";

type Theme = "light" | "dark" | "system";

interface SignupFormData {
  full_name: string;
  email: string;
  password: string;
}

interface VerificationFormData {
  otp: string;
}

function SignupPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState<"signup" | "verification">("signup");
  const [userData, setUserData] = useState<SignupFormData | null>(null);
  const [isStepNavigating, setIsStepNavigating] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);


  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme, resolvedTheme, isThemeLoaded } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const {
    register: registerVerification,
    handleSubmit: handleVerificationSubmit,
    formState: { errors: verificationErrors },
    watch,
    setValue,
  } = useForm<VerificationFormData>({
    defaultValues: {
      otp: "",
    },
  });

  const otpValue = watch("otp");

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

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otpValue?.length === 6) {
      handleVerificationSubmit(handleVerificationFormSubmit)();
    }
  }, [otpValue, handleVerificationSubmit]);

  // Cooldown timer effect
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

  // Navigation functions
  const navigateToHome = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/home");
    }, 500);
  };

  const navigateToLogin = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/auth/login");
    }, 500);
  };

  // Show loading until theme is properly loaded
  if (!isThemeLoaded || isNavigating) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"
        }`}>
        <ProgressBar isLoading={true} />
      </div>
    );
  }

  // Handle signup form submission
  const handleSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setIsStepNavigating(true);

    try {
      await authAPI.signupSendOTP(data);
      showSuccessToast("Verification code sent to your email!");
      setUserData(data);
      setCurrentStep("verification");
    } catch (error: any) {
      console.error("Signup error:", error);
      showErrorToast(error.response?.data?.message || error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
      setIsStepNavigating(false);
    }
  };

  // Handle verification form submission
  const handleVerificationFormSubmit = async (data: VerificationFormData) => {
    setIsLoading(true);

    try {
      await authAPI.signupVerifyOTP({
        email: userData?.email || "",
        otp: data.otp
      });

      // Success
      showSuccessToast("Account verified successfully! Redirecting...");
      setTimeout(() => {
        navigateToHome();
      }, 1000);
    } catch (error: any) {
      console.error("Verification error:", error);
      showErrorToast(error.response?.data?.message || error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    if (!userData?.email || resendCooldown > 0) return;

    setIsLoading(true);
    try {
      await authAPI.resendOtp(userData.email);
      showSuccessToast("New verification code sent!");
      setResendCooldown(60); // Start 60s cooldown on success
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      showErrorToast(error.response?.data?.message || error.message || "Failed to resend code");

      // If rate limited (429), extract seconds if available or default to 60
      if (error.response?.status === 429) {
        setResendCooldown(60);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to signup form
  const handleBackToSignup = () => {
    setIsStepNavigating(true);
    setTimeout(() => {
      setCurrentStep("signup");
      setIsStepNavigating(false);
    }, 500);
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
      <div className={`min-h-screen flex h-screen ${isDark ? "dark bg-gray-900" : "bg-white"}`}>
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
        <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/signupimage.webp"
              alt="Sign up background"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
        </div>

        {/* Right Section - Form */}
        <div className={`flex-1 flex p-6 overflow-y-auto ${isDark ? "bg-gray-900" : "bg-white"
          }`}>
          <div className="w-full max-w-md relative m-auto">
            {currentStep === "signup" ? (
              // Signup Form
              <form onSubmit={handleSubmit(handleSignupSubmit)} className="space-y-6" noValidate>
                {/* Title */}
                <div className="text-center mb-8">
                  <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"
                    }`}>
                    Create Account
                  </h1>
                  <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                    Sign up to get started with your account
                  </p>
                </div>

                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className={isDark ? "text-gray-200" : "text-gray-700"}>
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className={inputClasses}
                    disabled={isLoading || isGoogleLoading || isStepNavigating}
                    {...register("full_name", {
                      required: "Full name is required",
                      minLength: {
                        value: 2,
                        message: "Full name must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.full_name && (
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"
                      }`}>
                      {errors.full_name.message}
                    </p>
                  )}
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
                    disabled={isLoading || isGoogleLoading || isStepNavigating}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"
                      }`}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className={isDark ? "text-gray-200" : "text-gray-700"}>
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className={`${inputClasses} pr-12`}
                      disabled={isLoading || isGoogleLoading || isStepNavigating}
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
                      disabled={isLoading || isGoogleLoading || isStepNavigating}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"
                      }`}>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full text-base font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white"
                  disabled={isLoading || isGoogleLoading || isStepNavigating}
                >
                  {isStepNavigating || isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner className="h-5 w-5 mr-2" />
                      Creating Account...
                    </div>
                  ) : (
                    "Sign Up"
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

                {/* Google Sign Up Button */}
                <GoogleButton
                  type="signup"
                  isLoading={isGoogleLoading}
                  disabled={isLoading || isStepNavigating}
                />

                {/* Sign in link */}
                <div className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                  Already have an account?{" "}
                  <button
                    onClick={navigateToLogin}
                    className="text-blue-500 font-medium hover:underline p-0 h-auto bg-transparent border-none cursor-pointer"
                    type="button"
                    disabled={isStepNavigating}
                  >
                    Sign in
                  </button>
                </div>
              </form>
            ) : (
              // Verification Form
              <div className="space-y-6">
                {/* Back Button */}
                <div className="text-left">
                  <Button
                    variant="link"
                    onClick={handleBackToSignup}
                    className={`flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer font-medium ${isDark
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                      } transition-colors duration-200`}
                    disabled={isStepNavigating}
                  >
                    {isStepNavigating ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Going back...
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="h-4 w-4" />
                        Back to sign up
                      </>
                    )}
                  </Button>
                </div>

                {/* Title Section */}
                <div className="text-center mb-8">
                  <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"
                    } mb-2`}>
                    Check Your Email
                  </h1>
                  <p className={`${isDark ? "text-gray-400" : "text-gray-600"
                    } mb-1`}>
                    We sent a verification code to
                  </p>
                  <p className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-600"
                    }`}>
                    {userData?.email}
                  </p>
                </div>

                {/* OTP Input Section */}
                <div className="space-y-4">
                  <Label className={`text-center block text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"
                    }`}>
                    Enter the 6-digit code
                  </Label>

                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={(value) => setValue("otp", value)}
                      onBlur={registerVerification("otp").onBlur}
                      name={registerVerification("otp").name}
                      ref={registerVerification("otp").ref}
                      disabled={isLoading || isStepNavigating}
                    >
                      <InputOTPGroup className="gap-2">
                        {[...Array(6)].map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={`h-14 w-12 text-lg font-semibold border-2 transition-all duration-200 ${isDark
                              ? "border-gray-600 bg-gray-800 text-white focus:border-blue-500"
                              : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                              } rounded-lg`}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {verificationErrors.otp && (
                    <p className={`text-sm text-center ${isDark ? "text-red-400" : "text-red-600"
                      }`}>
                      {verificationErrors.otp.message}
                    </p>
                  )}
                </div>

                {/* Help Text */}
                <div className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                  Didn't receive the code?{" "}
                  <button
                    className={`font-medium hover:underline p-0 h-auto bg-transparent border-none cursor-pointer ${isDark ? "text-blue-400" : "text-blue-600"
                      } ${resendCooldown > 0 || isLoading ? "opacity-50 cursor-not-allowed no-underline" : ""}`}
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isStepNavigating || isLoading || resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Click to resend"}
                  </button>
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleVerificationSubmit(handleVerificationFormSubmit)}
                  className="w-full h-12 rounded-full text-base font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white"
                  disabled={isLoading || otpValue?.length !== 6 || isStepNavigating}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner className="h-5 w-5 mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify Account"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ProgressBar isLoading={true} />
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}