
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
          <div className="inline-flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-full text-sm font-medium mb-8 cursor-pointer hover:bg-brand-100 transition-all duration-300 hover:scale-105 group">
            <Star className="w-4 h-4 fill-current text-brand-600 group-hover:rotate-12 transition-transform duration-300" />
            <span>
              <span className="text-black">Trusted by </span>
              <span className="text-brand-600">Princess Juliana International Airport</span>
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-black mb-6 sm:mb-8 leading-tight">
              Transform Your
              <span className="block text-brand-600">Employee Appraisals</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-black mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Streamline performance reviews, track growth, and build stronger teams with our modern digital appraisal platform designed for the future of work.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-success-600" />
                </div>
                <span className="font-semibold text-lg text-black">360° Feedback System</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-brand-600" />
                </div>
                <span className="font-semibold text-lg text-black">Goal Tracking</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 sm:col-span-2 md:col-span-1 sm:max-w-sm sm:mx-auto md:max-w-none">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-warning-600" />
                </div>
                <span className="font-semibold text-lg text-black">Appraisal Dashboard</span>
              </div>
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
