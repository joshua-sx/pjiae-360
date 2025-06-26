
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <span className="text-xl font-semibold text-slate-800">Smartgoals 360</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Transform Your
              <span className="text-blue-600 block">Employee Appraisals</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Streamline performance reviews, track growth, and build stronger teams with our modern digital appraisal platform.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-slate-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>360° Feedback</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-slate-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Goal Tracking</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-slate-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Analytics Dashboard</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <p className="text-sm text-slate-500 mt-4">
            No credit card required • Start free trial
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
