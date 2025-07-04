
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuthClick = () => {
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Smartgoals 360</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#product" className="text-gray-600 hover:text-gray-900 transition-colors">Product</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={handleAuthClick}>
              Log in
            </Button>
            <Button onClick={handleAuthClick}>
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Features</a>
              <a href="#product" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Product</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-gray-900">About</a>
              <div className="pt-4 pb-2 space-y-2">
                <Button variant="ghost" className="w-full" onClick={handleAuthClick}>
                  Log in
                </Button>
                <Button className="w-full" onClick={handleAuthClick}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
