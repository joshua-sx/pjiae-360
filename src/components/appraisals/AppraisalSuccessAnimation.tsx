"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Star, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface AppraisalSuccessAnimationProps {
  employeeName?: string;
  overallRating?: number;
  onStartNew: () => void;
}

const confettiColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
];

const ConfettiPiece = ({ delay = 0 }: { delay?: number }) => {
  const randomColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;
  const randomScale = 0.5 + Math.random() * 0.5;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full"
      style={{
        backgroundColor: randomColor,
        left: `${randomX}%`,
        top: "-20px"
      }}
      initial={{
        y: -20,
        opacity: 1,
        rotate: 0,
        scale: randomScale
      }}
      animate={{
        y: window.innerHeight + 100,
        opacity: 0,
        rotate: randomRotation,
        x: Math.random() * 200 - 100
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: "easeOut"
      }}
    />
  );
};

export default function AppraisalSuccessAnimation({
  employeeName = "Employee",
  overallRating = 4.2,
  onStartNew
}: AppraisalSuccessAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Start the animation sequence
    const timer1 = setTimeout(() => setCurrentStep(1), 300);
    const timer2 = setTimeout(() => setCurrentStep(2), 800);
    const timer3 = setTimeout(() => {
      setShowConfetti(true);
      setCurrentStep(3);
    }, 1300);
    const timer4 = setTimeout(() => setCurrentStep(4), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const getRatingCategory = (rating: number) => {
    if (rating >= 4.5) return { label: "Exceptional", color: "text-green-600" };
    if (rating >= 3.5) return { label: "Exceeds Expectations", color: "text-blue-600" };
    if (rating >= 2.5) return { label: "Meets Expectations", color: "text-yellow-600" };
    if (rating >= 1.5) return { label: "Below Expectations", color: "text-orange-600" };
    return { label: "Unsatisfactory", color: "text-red-600" };
  };

  const category = getRatingCategory(overallRating);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-hidden">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiPiece key={i} delay={i * 0.1} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Background Gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Success Icon */}
          {currentStep >= 1 && (
            <motion.div
              key="success-icon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                duration: 0.6
              }}
              className="mb-8"
            >
              <div className="relative inline-block">
                <motion.div 
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0.4)",
                      "0 0 0 20px rgba(34, 197, 94, 0)",
                      "0 0 0 0 rgba(34, 197, 94, 0)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                
                {/* Sparkles around the icon */}
                {currentStep >= 2 && (
                  <>
                    {[0, 1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          top: i === 0 ? "10%" : i === 1 ? "90%" : "50%",
                          left: i === 2 ? "10%" : i === 3 ? "90%" : "50%"
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.2,
                          repeat: Infinity,
                          repeatDelay: 2
                        }}
                      >
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Success Message */}
          {currentStep >= 2 && (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Appraisal Complete!
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Successfully submitted appraisal for <strong>{employeeName}</strong>
              </p>
            </motion.div>
          )}

          {/* Step 3: Rating Display */}
          {currentStep >= 3 && (
            <motion.div
              key="rating-display"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-green-200">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-6">
                    <Trophy className="w-12 h-12 text-yellow-500" />
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {overallRating.toFixed(1)}/5.0
                      </div>
                      <div className={`text-lg font-semibold ${category.color}`}>
                        {category.label}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <motion.div
                          key={star}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: 0.5 + star * 0.1,
                            type: "spring",
                            stiffness: 200
                          }}
                        >
                          <Star className={`w-6 h-6 ${
                            star <= Math.round(overallRating) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          }`} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Action Button */}
          {currentStep >= 4 && (
            <motion.div
              key="action-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={onStartNew}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-8 py-4 text-lg"
                >
                  Start New Appraisal
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              
              <p className="text-gray-500 mt-4 text-sm">
                Ready to evaluate another team member?
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {currentStep >= 3 && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 2) * 60}%`
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20" />
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}