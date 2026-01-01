"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTheme } from "@/context/ThemeContext";
import {
  Sun,
  Moon,
  Monitor,
  LogOut,
  Palette,
  Check,
  Menu,
  X,
} from "lucide-react";
import { authAPI, clearAuthCookies } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

type Theme = "light" | "dark" | "system";

interface HeaderProps {
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
}

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface UserData {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export function Header({ onSignOut, isSigningOut }: HeaderProps) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getCurrentUser();

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          console.error('Failed to fetch user:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If there's an error, try to validate session first
        try {
          const sessionResponse = await authAPI.validateSession();
          if (sessionResponse.data.success) {
            // Session is valid, try to get user again
            const userResponse = await authAPI.getCurrentUser();
            if (userResponse.data.success) {
              setUser(userResponse.data.user);
            }
          }
        } catch (sessionError) {
          console.error('Session validation failed:', sessionError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const openMenu = () => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    setIsMenuOpen(true);
  };

  const closeMenuWithDelay = (delay = 250) => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      timeoutRef.current = null;
    }, delay);
  };

  const handleSignOutClick = () => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    setShowSignOutDialog(true);
  };

  const confirmSignOut = async () => {
    await onSignOut();
    setShowSignOutDialog(false);
    // Clear cookies
    clearAuthCookies();
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.location.href = '/home';
    }, 300);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.full_name) return 'U';

    const names = user.full_name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return user.full_name.charAt(0).toUpperCase();
  };

  const themeOptions: ThemeOption[] = [
    { value: "light", label: "Light", icon: Sun, color: "text-yellow-500" },
    { value: "dark", label: "Dark", icon: Moon, color: "text-blue-400" },
    { value: "system", label: "System", icon: Monitor, color: "text-gray-400" },
  ];

  // If loading, show a placeholder
  if (loading) {
    return (
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 w-full border-b backdrop-blur-sm shadow-sm"
        style={{
          backgroundColor: isDark ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
          borderColor: isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(209, 213, 219, 0.5)",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Button
                onClick={handleLogoClick}
                variant="ghost"
                className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent p-2 hover:bg-transparent"
                aria-label="Go to homepage"
              >
                AuthFlow
              </Button>
            </motion.div>

            {/* Loading avatar */}
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </motion.header>
    );
  }

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 w-full border-b backdrop-blur-sm shadow-sm"
        style={{
          backgroundColor: isDark ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
          borderColor: isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(209, 213, 219, 0.5)",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Button
                onClick={handleLogoClick}
                variant="ghost"
                className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent p-2 hover:bg-transparent"
                aria-label="Go to homepage"
              >
                AuthFlow
              </Button>
            </motion.div>

            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                style={{
                  color: isDark ? "#ffffff" : "#1e293b"
                }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Desktop User Menu */}
            {!isMobile && (
              <div
                className="relative z-50"
                onPointerEnter={openMenu}
                onPointerLeave={() => closeMenuWithDelay(250)}
              >
                <DropdownMenu
                  open={isMenuOpen}
                  onOpenChange={setIsMenuOpen}
                  modal={false}
                >
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer outline-none">
                      <Avatar className="h-10 w-10 border-2 shadow-sm transition-transform hover:scale-105"
                        style={{
                          borderColor: isDark ? "rgba(96, 165, 250, 0.8)" : "rgba(59, 130, 246, 0.8)"
                        }}
                      >
                        <AvatarFallback className="bg-linear-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className={`w-64 ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                    align="end"
                    sideOffset={8}
                    onPointerEnter={openMenu}
                    onPointerLeave={() => closeMenuWithDelay(250)}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuLabel className="p-3 font-normal">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">
                          {user?.full_name || 'User'}
                        </span>
                        <span className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"} mt-1`}>
                          {user?.email || 'user@example.com'}
                        </span>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className={isDark ? "bg-gray-600" : "bg-gray-200"} />

                    {/* Theme Selection */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger
                        className={`flex items-center gap-3 p-3 cursor-pointer ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                      >
                        <Palette className="h-4 w-4" />
                        <span className="text-sm">Themes</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent
                        className={`w-48 ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                        sideOffset={8}
                        alignOffset={-5}
                        onPointerEnter={openMenu}
                        onPointerLeave={() => closeMenuWithDelay(250)}
                      >
                        {themeOptions.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <DropdownMenuItem
                              key={option.value}
                              className={`flex items-center justify-between p-3 cursor-pointer ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                              onClick={() => setTheme(option.value)}
                            >
                              <div className="flex items-center gap-2">
                                <IconComponent className={`h-4 w-4 ${option.color}`} />
                                <span className="text-sm">{option.label}</span>
                              </div>
                              {theme === option.value && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator className={isDark ? "bg-gray-600" : "bg-gray-200"} />

                    {/* Sign Out */}
                    <DropdownMenuItem
                      className={`flex items-center gap-3 p-3 cursor-pointer text-red-600 dark:text-red-400 ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                      onClick={handleSignOutClick}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu */}
            {isMobile && isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-16 left-0 right-0 border-b shadow-lg md:hidden"
                style={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  borderColor: isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(209, 213, 219, 0.5)",
                }}
              >
                <div className="px-4 py-6 space-y-4">
                  {/* User Info */}
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: isDark ? "rgba(31, 41, 55, 0.5)" : "rgba(249, 250, 251, 0.8)"
                    }}
                  >
                    <Avatar className="h-10 w-10 border-2"
                      style={{
                        borderColor: isDark ? "rgba(96, 165, 250, 0.8)" : "rgba(59, 130, 246, 0.8)"
                      }}
                    >
                      <AvatarFallback className="bg-linear-to-r from-blue-500 to-purple-500 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p style={{ color: isDark ? "#ffffff" : "#111827" }} className="font-semibold">
                        {user?.full_name || 'User'}
                      </p>
                      <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }} className="text-sm">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>

                  {/* Theme Selection */}
                  <div className="space-y-2">
                    <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }} className="text-sm font-medium px-3">
                      Theme
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {themeOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <Button
                            key={option.value}
                            variant={theme === option.value ? "secondary" : "ghost"}
                            onClick={() => setTheme(option.value)}
                            className="justify-start"
                            size="sm"
                          >
                            <IconComponent className={`h-4 w-4 mr-2 ${option.color}`} />
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sign Out */}
                  <Button
                    variant="destructive"
                    onClick={handleSignOutClick}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className={isDark ? "dark bg-gray-800 border-gray-700 text-white" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription className={isDark ? "text-gray-300" : ""}>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSigningOut}
              className={isDark ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600" : ""}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSignOut}
              disabled={isSigningOut}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white flex items-center"
            >
              {isSigningOut ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 text-white" />
                  Signing out...
                </>
              ) : (
                "Sign out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}