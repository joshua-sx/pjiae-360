
import { UserPlus, Target, BarChart3 } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Set Up Your Team",
      description: "Import your employees, set up departments, and configure your organizational structure in minutes.",
      icon: UserPlus,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      step: "02",
      title: "Create Goals & Reviews",
      description: "Set performance goals, schedule review cycles, and customize evaluation criteria for your organization.",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      step: "03",
      title: "Track & Analyze",
      description: "Monitor progress with real-time analytics, generate reports, and make data-driven decisions.",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with Smartgoals 360 in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gray-200 transform -translate-y-1/2 z-0" 
                     style={{ width: 'calc(100% - 4rem)' }} />
              )}
              
              <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 z-10">
                <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                
                <div className="text-sm font-bold text-gray-400 mb-2">
                  STEP {step.step}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
