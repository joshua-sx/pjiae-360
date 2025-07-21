
import { Shield, Zap, Users, BarChart3, Clock, Heart } from "lucide-react";

const WhyChooseUsSection = () => {
  const benefits = [
    {
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 compliance and end-to-end encryption to keep your data safe.",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Lightning Fast",
      description: "Built for speed with modern architecture that handles thousands of employees effortlessly.",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Team Collaboration",
      description: "Enable seamless collaboration between managers, employees, and HR teams.",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Advanced Analytics",
      description: "Gain deep insights with powerful reporting and analytics tools for better decision making.",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Time Saving",
      description: "Automate repetitive tasks and focus on what matters most - developing your people.",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Employee Focused",
      description: "Designed with employee experience in mind, making performance reviews engaging and meaningful.",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Smartgoals 360?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create a world-class performance management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="group hover:shadow-lg transition-shadow duration-300 rounded-2xl p-8 border border-gray-100">
              <div className={`w-12 h-12 ${benefit.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {benefit.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
