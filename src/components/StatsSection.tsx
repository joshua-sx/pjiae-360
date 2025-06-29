
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { number: "10,000+", label: "Active Users" },
  { number: "500+", label: "Companies Trust Us" },
  { number: "98%", label: "Customer Satisfaction" },
  { number: "50%", label: "Time Saved on Reviews" }
];

const companies = [
  "TechCorp", "InnovateLab", "GlobalSoft", "DataDyne", "CloudFirst", "NextGen"
];

const StatsSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <p className="text-gray-600 mb-8">Trusted by teams at</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="text-center">
                <div className="text-xl font-semibold text-gray-800">{company}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
