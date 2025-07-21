
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    "14-day free trial",
    "No credit card required",
    "Setup in under 24 hours",
    "Full customer support"
  ];

  const handleGetStarted = () => {
    navigate("/create-account");
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your 
            <span className="block">Performance Management?</span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of organizations already using Smartgoals 360 to build stronger, more engaged teams.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center justify-center text-blue-100">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              <span className="text-sm md:text-base">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl"
          >
            Schedule a Demo
          </Button>
        </div>

        <p className="mt-8 text-blue-200 text-sm">
          Questions? Contact our team at{" "}
          <a href="mailto:hello@smartgoals360.com" className="text-white underline">
            hello@smartgoals360.com
          </a>
        </p>
      </div>
    </section>
  );
};

export default CTASection;
