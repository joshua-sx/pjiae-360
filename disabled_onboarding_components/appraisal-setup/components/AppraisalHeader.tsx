
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

export default function AppraisalHeader() {
  return (
    <header className="text-center mb-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
      >
        <Target className="h-8 w-8 text-primary" />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="text-3xl font-bold text-slate-900 mb-3"
      >
        Appraisal Cycle Setup
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed"
      >
        Configure your appraisal process to align with your organization's goals. 
        Start by defining when employees and managers can set and review goals.
      </motion.p>
    </header>
  );
}
