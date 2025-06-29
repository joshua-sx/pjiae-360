
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Play } from "lucide-react";

const ProductSection = () => {
  return (
    <section id="product" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Product Showcase */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            See Smartgoals 360 in action
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the power of our platform with intuitive dashboards, comprehensive reporting, and seamless collaboration tools.
          </p>
          
          {/* Product Demo Card */}
          <Card className="max-w-4xl mx-auto overflow-hidden shadow-2xl border-0">
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto">
                    <Play className="w-8 h-8 text-blue-600 ml-1" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Watch Demo</h3>
                  <p className="text-gray-600">See how teams use Smartgoals 360</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Streamlined Performance Reviews
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Automated Workflows</h4>
                  <p className="text-gray-600">Set up review cycles that run automatically</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Real-time Collaboration</h4>
                  <p className="text-gray-600">Teams work together seamlessly on reviews</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Actionable Insights</h4>
                  <p className="text-gray-600">Get data-driven recommendations for growth</p>
                </div>
              </li>
            </ul>
            <Button className="mt-8 flex items-center gap-2">
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 aspect-square flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-32 h-32 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-4">
                <div className="text-6xl">📊</div>
              </div>
              <p className="font-medium">Interactive Dashboard Preview</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
