import React from 'react';
import { MobileFirstLayout } from '@/components/layouts/MobileFirstLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Smartphone, Tablet, Monitor } from 'lucide-react';

const Index = () => {
  const handleCardClick = (cardType: string) => {
    console.log('Card clicked:', cardType);
  };

  const handleCTAClick = (action: string) => {
    console.log('CTA clicked:', action);
  };

  return (
    <MobileFirstLayout>
      {/* Hero Section */}
      <Card className="lg:col-span-2 xl1440:col-span-3 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader className="text-center pb-2">
          <Badge variant="secondary" className="mx-auto mb-4 w-fit">
            Mobile-First Design
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Responsive Excellence
          </CardTitle>
          <CardDescription className="text-base sm:text-lg mt-2 max-w-2xl mx-auto">
            Experience our mobile-first responsive layout that adapts seamlessly from 375px mobile screens to 1440px+ desktop displays.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            size="lg" 
            className="w-full sm:w-auto tap-target"
            onClick={() => handleCTAClick('get-started')}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleCardClick('mobile')}
      >
        <CardHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Mobile First</CardTitle>
          <CardDescription>
            Optimized for ≤375px screens with large tap targets and readable 16px+ fonts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Single-column layout</li>
            <li>• Full-width CTAs</li>
            <li>• Hamburger navigation</li>
            <li>• Touch-friendly UI</li>
          </ul>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleCardClick('tablet')}
      >
        <CardHeader>
          <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
            <Tablet className="h-6 w-6 text-success" />
          </div>
          <CardTitle className="text-lg">Tablet Ready</CardTitle>
          <CardDescription>
            Enhanced for ≥1024px with 2-column layout and expanded navigation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 2-column grid system</li>
            <li>• Horizontal navigation</li>
            <li>• Moderate padding</li>
            <li>• Improved typography</li>
          </ul>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleCardClick('desktop')}
      >
        <CardHeader>
          <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
            <Monitor className="h-6 w-6 text-warning" />
          </div>
          <CardTitle className="text-lg">Desktop Power</CardTitle>
          <CardDescription>
            Full experience on ≥1440px with 3-column layout plus sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 3-column grid system</li>
            <li>• Left sidebar (20% width)</li>
            <li>• Dense information</li>
            <li>• Advanced navigation</li>
          </ul>
        </CardContent>
      </Card>

      {/* Sample Content Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Responsive Design</CardTitle>
          <CardDescription>
            Built with Tailwind CSS and semantic design tokens for consistent theming.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto tap-target"
            onClick={() => handleCTAClick('learn-more')}
          >
            Learn More
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progressive Enhancement</CardTitle>
          <CardDescription>
            Starts with mobile-optimized base styles, then enhances for larger screens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto tap-target"
            onClick={() => handleCTAClick('view-demo')}
          >
            View Demo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accessibility First</CardTitle>
          <CardDescription>
            Includes proper ARIA labels, focus management, and touch-friendly interactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto tap-target"
            onClick={() => handleCTAClick('accessibility')}
          >
            Accessibility Guide
          </Button>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="lg:col-span-2 xl1440:col-span-3 bg-muted/50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">Ready to Build?</CardTitle>
          <CardDescription className="text-base mt-2">
            Start creating your mobile-first responsive application today.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="tap-target"
            onClick={() => handleCTAClick('start-building')}
          >
            Start Building
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="tap-target"
            onClick={() => handleCTAClick('view-docs')}
          >
            View Documentation
          </Button>
        </CardContent>
      </Card>
    </MobileFirstLayout>
  );
};

export default Index;
