
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export default function WelcomeHeader() {
  return (
    <header className="text-center mb-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
      >
        <Building2 className="h-8 w-8 text-primary" />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="text-3xl font-bold text-slate-900 mb-3"
      >
        Welcome & Identity
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed"
      >
        Let's get your organization set up for success. We'll start with some basic information about your company.
      </motion.p>
    </header>
  );
}
