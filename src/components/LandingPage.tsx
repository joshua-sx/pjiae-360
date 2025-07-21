
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Target, Award, CheckCircle, Users, BarChart3, Shield, Zap, Clock, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import Navigation from "./Navigation";
import StatsSection from "./landing/StatsSection";
import HowItWorksSection from "./landing/HowItWorksSection";
import WhyChooseUsSection from "./landing/WhyChooseUsSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import PricingSection from "./landing/PricingSection";
import FAQSection from "./landing/FAQSection";
import CTASection from "./landing/CTASection";
import Footer from "./Footer";
import FeaturesSection from "./FeaturesSection";
import ProductSection from "./ProductSection";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();

  console.log("LandingPage: Auth state:", { isAuthenticated, loading, onboardingCompleted, onboardingLoading });

  const handleGetStarted = () => {
    navigate("/create-account");
  };

  const handleLogin = () => {
    navigate("/log-in");
  };

  // Show loading state
  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect authenticated users based on onboarding status
  if (isAuthenticated) {
    if (onboardingCompleted === false) {
      navigate("/onboarding");
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Redirecting to onboarding...</div>
        </div>
      );
    } else {
      navigate("/dashboard");
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Redirecting to dashboard...</div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
            <Star className="w-4 h-4 fill-current text-blue-600" />
            <span>
              <span className="text-black">Trusted by </span>
              <span className="text-blue-600">Princess Juliana International Airport</span>
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
              Transform Your
              <span className="block text-blue-600">
                Employee Appraisals
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline performance reviews, track growth, and build stronger teams with our modern digital appraisal platform designed for the future of work.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={handleLogin}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-xl border-2"
            >
              Login
            </Button>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-left shadow-sm">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">360° Feedback System</h3>
              <p className="text-gray-600 text-sm">Comprehensive multi-source feedback collection for holistic performance evaluation.</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-left shadow-sm">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">Goal Tracking</h3>
              <p className="text-gray-600 text-sm">Set, monitor, and achieve performance goals with intelligent tracking and insights.</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-left shadow-sm">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 text-sm">Centralized dashboard for managing all aspects of employee performance reviews.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* Product Section */}
      <ProductSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
