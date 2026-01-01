"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";

export function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const socialLinks = [
    {
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com/PavanTalluri45",
      label: "GitHub",
      color: "hover:bg-black hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900"
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://www.linkedin.com/in/pavankumartalluri45/",
      label: "LinkedIn",
      color: "hover:bg-[#2563EB] hover:text-white dark:hover:bg-[#2563EB] dark:hover:text-white"
    },
  ];


  return (
    <footer className="border-t bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-blue-50/20 dark:to-gray-800/20" />

      <div className="container mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link href="/home" className="inline-block">
                <h3 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 mb-4">
                  AuthFlow
                </h3>
              </Link>
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              A modern, secure authentication solution built with cutting-edge technologies.
              Providing seamless user experiences with enterprise-grade security.
            </p>
          </motion.div>

          <div className="hidden lg:block"></div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h4>
            <div className="space-y-4">
              <motion.a
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:alex@authflow.dev"
                className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium">Email</span>
                  <p className="text-sm">talluripavankuamr88@gmail.com</p>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                href="tel:+15551234567"
                className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium">Phone</span>
                  <p className="text-sm">+91 7793931658</p>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} AuthFlow. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Built with Next.js 16
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all duration-200 ${social.color}`}
                aria-label={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}