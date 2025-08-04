import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { validateTouchTargets, validateResponsiveBreakpoints } from '@/lib/responsive-utils';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { AlertTriangle, CheckCircle, Monitor, Smartphone, Tablet } from 'lucide-react';

interface TouchTargetIssue {
  element: Element;
  issue: string;
}

export function ResponsiveTestPanel() {
  const [touchTargetIssues, setTouchTargetIssues] = useState<TouchTargetIssue[]>([]);
  const [breakpointIssues, setBreakpointIssues] = useState<string[]>([]);
  const [isTestingEnabled, setIsTestingEnabled] = useState(false);
  
  const { 
    windowSize, 
    isMobile, 
    isTablet, 
    isDesktop, 
    breakpoint,
    getGridCols,
    getTouchTargetClass,
    getResponsiveTextClass
  } = useMobileResponsive();

  useEffect(() => {
    if (isTestingEnabled) {
      const touchIssues = validateTouchTargets();
      const breakpointIssues = validateResponsiveBreakpoints();
      
      setTouchTargetIssues(touchIssues);
      setBreakpointIssues(breakpointIssues);
    }
  }, [isTestingEnabled, windowSize]);

  const runTests = () => {
    setIsTestingEnabled(true);
    setTimeout(() => setIsTestingEnabled(false), 5000); // Auto-disable after 5 seconds
  };

  const getDeviceIcon = () => {
    if (isMobile) return <Smartphone className="h-4 w-4" />;
    if (isTablet) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceType = () => {
    if (isMobile) return 'Mobile';
    if (isTablet) return 'Tablet';
    return 'Desktop';
  };

  const testTypographyScaling = () => {
    return (
      <div className="space-y-2">
        <p className="text-responsive-xs">Extra Small Text (responsive)</p>
        <p className="text-responsive-sm">Small Text (responsive)</p>
        <p className="text-responsive-base">Base Text (responsive)</p>
        <p className="text-responsive-lg">Large Text (responsive)</p>
        <p className="text-responsive-xl">Extra Large Text (responsive)</p>
        <h3 className="heading-responsive-h3">Responsive H3 Heading</h3>
        <h2 className="heading-responsive-h2">Responsive H2 Heading</h2>
        <h1 className="heading-responsive-h1">Responsive H1 Heading</h1>
      </div>
    );
  };

  const testSpacing = () => {
    return (
      <div className="space-y-4">
        <div className="responsive-spacing bg-muted rounded">
          <p className="text-responsive-sm">Responsive Spacing Container</p>
        </div>
        <div className="responsive-gap flex">
          <div className="bg-primary/20 p-2 rounded text-xs">Item 1</div>
          <div className="bg-primary/20 p-2 rounded text-xs">Item 2</div>
          <div className="bg-primary/20 p-2 rounded text-xs">Item 3</div>
        </div>
      </div>
    );
  };

  const testTouchTargets = () => {
    return (
      <div className="space-y-4">
        <div className="mobile-button-group">
          <Button size="default" className="responsive-touch-target">
            Responsive Button 1
          </Button>
          <Button size="default" className="responsive-touch-target" variant="outline">
            Responsive Button 2
          </Button>
          <Button size="icon" className="touch-target-icon">
            ⚙️
          </Button>
        </div>
        <div className="flex gap-2">
          <button className="tap-target bg-secondary text-secondary-foreground rounded px-3 py-2 text-sm">
            Touch Target Button
          </button>
          <button className="responsive-touch-target bg-accent text-accent-foreground rounded px-3 py-2 text-sm">
            Responsive Touch Target
          </button>
        </div>
      </div>
    );
  };

  const testGridSystem = () => {
    const cols = getGridCols(1, 2, 3);
    return (
      <div className={`grid gap-4 grid-cols-${cols}`}>
        {Array.from({ length: cols * 2 }, (_, i) => (
          <div key={i} className="bg-muted p-4 rounded text-center text-responsive-sm">
            Grid Item {i + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-container space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="heading-responsive-h3 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Responsive Testing Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getDeviceIcon()}
              <span className="text-responsive-base font-medium">{getDeviceType()}</span>
              <Badge variant="outline">{breakpoint}</Badge>
            </div>
            <div className="text-responsive-sm text-muted-foreground">
              {windowSize.width} × {windowSize.height}
            </div>
          </div>

          <Separator />

          {/* Test Controls */}
          <div className="flex gap-4 items-center">
            <Button onClick={runTests} className="responsive-touch-target">
              Run Accessibility Tests
            </Button>
            {isTestingEnabled && (
              <Badge variant="secondary">Testing Active</Badge>
            )}
          </div>

          {/* Test Results */}
          {isTestingEnabled && (
            <div className="space-y-4">
              {/* Touch Target Issues */}
              {touchTargetIssues.length > 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{touchTargetIssues.length} Touch Target Issues Found:</strong>
                    <ul className="mt-2 text-sm space-y-1">
                      {touchTargetIssues.slice(0, 5).map((issue, i) => (
                        <li key={i} className="text-xs">• {issue.issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ All touch targets meet accessibility requirements
                  </AlertDescription>
                </Alert>
              )}

              {/* Breakpoint Issues */}
              {breakpointIssues.length > 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Breakpoint Issues:</strong>
                    <ul className="mt-2 text-sm space-y-1">
                      {breakpointIssues.map((issue, i) => (
                        <li key={i} className="text-xs">• {issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Responsive breakpoints are properly implemented
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Separator />

          {/* Typography Testing */}
          <div>
            <h4 className="heading-responsive-h3 mb-4">Typography Scaling Test</h4>
            {testTypographyScaling()}
          </div>

          <Separator />

          {/* Spacing Testing */}
          <div>
            <h4 className="heading-responsive-h3 mb-4">Responsive Spacing Test</h4>
            {testSpacing()}
          </div>

          <Separator />

          {/* Touch Target Testing */}
          <div>
            <h4 className="heading-responsive-h3 mb-4">Touch Target Test</h4>
            {testTouchTargets()}
          </div>

          <Separator />

          {/* Grid System Testing */}
          <div>
            <h4 className="heading-responsive-h3 mb-4">Responsive Grid Test</h4>
            <p className="text-responsive-sm text-muted-foreground mb-4">
              Current: {getGridCols()} columns ({getDeviceType()})
            </p>
            {testGridSystem()}
          </div>

          {/* Helper Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h5 className="text-responsive-base font-medium mb-2">Responsive Utilities Available:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-responsive-sm">
              <div>
                <strong>Touch Targets:</strong>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• .tap-target (44px minimum)</li>
                  <li>• .responsive-touch-target</li>
                  <li>• .touch-target-icon (icon buttons)</li>
                </ul>
              </div>
              <div>
                <strong>Typography:</strong>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• .text-responsive-xs/sm/base/lg/xl</li>
                  <li>• .heading-responsive-h1/h2/h3</li>
                </ul>
              </div>
              <div>
                <strong>Spacing:</strong>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• .responsive-spacing</li>
                  <li>• .responsive-gap</li>
                  <li>• .page-container</li>
                </ul>
              </div>
              <div>
                <strong>Layout:</strong>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• .mobile-button-group</li>
                  <li>• .mobile-table-card</li>
                  <li>• .mobile-scroll-x</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}