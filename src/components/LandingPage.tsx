
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/create-account");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full viewport height */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4 fill-current" />
            <span>Trusted by Princess Juliana International Airport</span>
          </div>

          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
              Transform Your
              <span className="block text-brand-600">Employee Appraisals</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-900 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Streamline performance reviews, track growth, and build stronger teams with our modern digital appraisal platform designed for the future of work.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="flex items-center justify-center sm:justify-start space-x-3 text-gray-900 text-center sm:text-left">
              <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
              <span className="font-semibold text-sm sm:text-base">360° Feedback System</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-3 text-gray-900 text-center sm:text-left">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-brand-600" />
              </div>
              <span className="font-semibold text-sm sm:text-base">Smart Goal Tracking</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-3 text-gray-900 text-center sm:text-left sm:col-span-2 md:col-span-1 sm:justify-center md:justify-start">
              <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-warning-600" />
              </div>
              <span className="font-semibold text-sm sm:text-base">Advanced Analytics</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              onClick={handleLogin}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl border-2"
            >
              Login
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
