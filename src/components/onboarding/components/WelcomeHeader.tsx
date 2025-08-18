
"use client";

import * as React from "react";
import { motion } from "framer-motion";

export default function WelcomeHeader() {
  return (
    <header className="text-center mb-6">
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        Welcome & Identity
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed"
      >
        Let's get your organization set up for success. We'll start with some basic information about your company.
      </motion.p>
    </header>
  );
}
