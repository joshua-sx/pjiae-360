
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import FeaturesSection from "./FeaturesSection";
import ProductSection from "./ProductSection";

import Footer from "./Footer";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/create-account");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4 fill-current" />
            <span>Trusted by 500+ companies worldwide</span>
          </div>

          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
              Transform Your
              <span className="block text-blue-600">Employee Appraisals</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Streamline performance reviews, track growth, and build stronger teams with our modern digital appraisal platform designed for the future of work.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="flex items-center justify-center sm:justify-start space-x-3 text-gray-700 text-center sm:text-left">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-semibold text-sm sm:text-base">360° Feedback System</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-3 text-gray-700 text-center sm:text-left">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-semibold text-sm sm:text-base">Smart Goal Tracking</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-3 text-gray-700 text-center sm:text-left sm:col-span-2 md:col-span-1 sm:justify-center md:justify-start">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-semibold text-sm sm:text-base">Advanced Analytics</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 px-4 sm:px-0">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl border-2"
            >
              Watch Demo
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      
      <FeaturesSection />
      <ProductSection />

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your performance reviews?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using Smartgoals 360 to create better, more meaningful performance reviews.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
