import React from 'react';
import { Shield, Users, UserCheck, Eye, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { AppRole } from '@/features/access-control/hooks/usePermissions';

const roleConfig = {
  admin: {
    icon: Shield,
    title: 'Admin',
    description: 'Full system access with all administrative privileges',
  },
  director: {
    icon: Users,
    title: 'Director', 
    description: 'Department oversight and strategic management',
  },
  manager: {
    icon: UserCheck,
    title: 'Manager',
    description: 'Team leadership and operational management',
  },
  supervisor: {
    icon: Eye,
    title: 'Supervisor',
    description: 'Direct team supervision and performance monitoring',
  },
  employee: {
    icon: User,
    title: 'Employee',
    description: 'Standard user access for daily tasks and goals',
  },
};

export function DemoRoleSelectionModal() {
  const { 
    isRoleSelectionModalOpen, 
    closeRoleSelectionModal, 
    setDemoRole, 
    availableRoles,
    demoRole 
  } = useDemoMode();

  const handleRoleSelect = (role: AppRole) => {
    setDemoRole(role);
    closeRoleSelectionModal();
  };

  return (
    <Dialog open={isRoleSelectionModalOpen} onOpenChange={closeRoleSelectionModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Choose Demo Role</DialogTitle>
          <DialogDescription>
            Select a role to experience the application from different user perspectives
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {availableRoles.map((role) => {
            const config = roleConfig[role];
            const IconComponent = config.icon;
            const isSelected = role === demoRole;
            
            return (
              <Card 
                key={role}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleRoleSelect(role)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{config.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={closeRoleSelectionModal}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}