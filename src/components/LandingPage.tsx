import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { logger } from "@/lib/logger";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();

  logger.debug("LandingPage: Auth state", {
    isAuthenticated,
    loading,
    onboardingCompleted,
    onboardingLoading,
  });

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
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4 fill-current text-blue-600" />
            <span>
              <span className="text-black">Trusted by </span>
              <span className="text-blue-600">Princess Juliana International Airport</span>
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black mb-6 sm:mb-8 leading-tight">
              Transform Your
              <span className="block text-blue-600">Employee Appraisals</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Streamline performance reviews, track growth, and build stronger teams with our modern
              digital appraisal platform designed for the future of work.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-left">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">360° Feedback System</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive multi-source feedback collection for holistic performance evaluation.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-left">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">Goal Tracking</h3>
              <p className="text-gray-600 text-sm">
                Set, monitor, and achieve performance goals with intelligent tracking and insights.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-left sm:col-span-2 md:col-span-1 sm:max-w-sm sm:mx-auto md:max-w-none">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">Appraisal Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Centralized dashboard for managing all aspects of employee performance reviews.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg"
            >
              Get Started
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
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
