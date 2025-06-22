"use client";

import { motion } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simple Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="py-8 text-center"
        >
          {/* Brand */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Zephyre
            </span>
          </div>

          {/* Copyright and Developer */}
          <div className="flex flex-col items-center space-y-2 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <span>© {currentYear} Zephyre. Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>for anime lovers</span>
            </div>
            <div>
              <span>Developer: </span>
              <span className="text-primary-400 font-medium">lexxganz</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
