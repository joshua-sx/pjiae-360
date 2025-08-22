import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileFirstLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileFirstLayout({ children, className }: MobileFirstLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    console.log('Mobile menu toggled:', !isMobileMenuOpen);
  };

  const handleCtaClick = (action: string) => {
    console.log('CTA clicked:', action);
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header - Mobile First */}
      <header className="sticky top-0 z-fixed bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-lg">Lovable</span>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#product" className="text-muted-foreground hover:text-foreground transition-colors">
              Product
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>

          {/* Desktop CTAs - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => handleCtaClick('login')}
              className="tap-target"
            >
              Log in
            </Button>
            <Button 
              onClick={() => handleCtaClick('get-started')}
              className="tap-target"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden tap-target"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <nav className="px-4 py-4 space-y-4">
              <a 
                href="#features" 
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors tap-target"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#product" 
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors tap-target"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Product
              </a>
              <a 
                href="#about" 
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors tap-target"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <div className="pt-4 border-t space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full tap-target"
                  onClick={() => handleCtaClick('login')}
                >
                  Log in
                </Button>
                <Button 
                  className="w-full tap-target"
                  onClick={() => handleCtaClick('get-started')}
                >
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Mobile: Single column, Tablet: 2 column, Desktop 1440px+: 3 column with sidebar */}
        <div className="xl1440:flex">
          {/* Desktop Sidebar - Only visible on 1440px+ */}
          <aside className="hidden xl1440:block xl1440:w-1/5 xl1440:min-h-screen xl1440:bg-muted/30 xl1440:border-r">
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Navigation
                </h3>
                <nav className="space-y-2">
                  <a href="#dashboard" className="block py-2 px-3 rounded-md hover:bg-muted transition-colors">
                    Dashboard
                  </a>
                  <a href="#analytics" className="block py-2 px-3 rounded-md hover:bg-muted transition-colors">
                    Analytics
                  </a>
                  <a href="#settings" className="block py-2 px-3 rounded-md hover:bg-muted transition-colors">
                    Settings
                  </a>
                </nav>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    New Project
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Import Data
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Content Area with Responsive Grid */}
          <div className="flex-1 xl1440:w-4/5">
            <div className="mobile-padding">
              {/* Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl1440:grid-cols-3 gap-4 sm:gap-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="mobile-padding py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold">Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>hello@lovable.dev</p>
                <p>+1 (555) 123-4567</p>
                <p>San Francisco, CA</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <div className="space-y-2 text-sm">
                <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="#docs" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <div className="space-y-2 text-sm">
                <a href="#about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
                <a href="#careers" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </a>
                <a href="#contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <div className="space-y-2 text-sm">
                <a href="#privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Lovable. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}