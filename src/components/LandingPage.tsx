
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/create-account");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    hover: { 
      y: -8,
      scale: 1.02,
      transition: { type: "spring" as const, stiffness: 300 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section - Full viewport height */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          variants={containerVariants}
        >
          {/* Trust Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-full text-sm font-medium mb-8 cursor-pointer group"
            variants={fadeInUp}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "hsl(var(--brand-100))",
              transition: { type: "spring" as const, stiffness: 400 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Star className="w-4 h-4 fill-current text-brand-600" />
            </motion.div>
            <span>
              <span className="text-black">Trusted by </span>
              <span className="text-brand-600">Princess Juliana International Airport</span>
            </span>
          </motion.div>

          <motion.div className="mb-12" variants={containerVariants}>
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-black mb-6 sm:mb-8 leading-tight"
              variants={fadeInUp}
            >
              Transform Your
              <motion.span 
                className="block text-brand-600"
                variants={fadeInUp}
              >
                Employee Appraisals
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-black mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0"
              variants={fadeInUp}
            >
              Streamline performance reviews, track growth, and build stronger teams with our modern digital appraisal platform designed for the future of work.
            </motion.p>
          </motion.div>

          {/* Key Benefits */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto px-4 sm:px-0"
            variants={containerVariants}
          >
            <motion.div 
              className="bg-white rounded-xl border border-gray-200 p-6 text-left"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring" as const, stiffness: 300 }}
              >
                <Star className="w-5 h-5 text-blue-600" />
              </motion.div>
              <h3 className="font-semibold text-black mb-2">360° Feedback System</h3>
              <p className="text-gray-600 text-sm">Comprehensive multi-source feedback collection for holistic performance evaluation.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl border border-gray-200 p-6 text-left"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring" as const, stiffness: 300 }}
              >
                <Target className="w-5 h-5 text-blue-600" />
              </motion.div>
              <h3 className="font-semibold text-black mb-2">Goal Tracking</h3>
              <p className="text-gray-600 text-sm">Set, monitor, and achieve performance goals with intelligent tracking and insights.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl border border-gray-200 p-6 text-left sm:col-span-2 md:col-span-1 sm:max-w-sm sm:mx-auto md:max-w-none"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring" as const, stiffness: 300 }}
              >
                <Award className="w-5 h-5 text-blue-600" />
              </motion.div>
              <h3 className="font-semibold text-black mb-2">Appraisal Dashboard</h3>
              <p className="text-gray-600 text-sm">Centralized dashboard for managing all aspects of employee performance reviews.</p>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0"
            variants={containerVariants}
          >
            <motion.div variants={scaleIn}>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg"
                asChild
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.3)",
                    transition: { type: "spring" as const, stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                  <motion.div
                    className="ml-2"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </motion.button>
              </Button>
            </motion.div>
            <motion.div variants={scaleIn}>
              <Button
                onClick={handleLogin}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl border-2"
                asChild
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: "hsl(var(--brand-600))",
                    transition: { type: "spring" as const, stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login
                </motion.button>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default LandingPage;
