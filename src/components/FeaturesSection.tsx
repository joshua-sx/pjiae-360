
import { CheckCircle, Target, Users, BarChart3, Calendar, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Target,
    title: "360° Feedback System",
    description: "Comprehensive feedback from peers, managers, and direct reports for a complete performance picture."
  },
  {
    icon: Users,
    title: "Goal Tracking & Management",
    description: "Set, track, and achieve meaningful goals with our intuitive goal management system."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Gain insights with powerful analytics and reporting tools to drive performance improvements."
  },
  {
    icon: Calendar,
    title: "Automated Review Cycles",
    description: "Streamline your review process with automated scheduling and reminders."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with SOC 2 compliance to keep your data safe and secure."
  },
  {
    icon: CheckCircle,
    title: "Easy Integration",
    description: "Seamlessly integrate with your existing HR tools and workflows."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything you need for modern performance management
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Streamline your employee appraisal process with our comprehensive suite of tools designed for the modern workplace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
