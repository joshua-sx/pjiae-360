import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileDisplay } from './ProfileDisplay';
import { ProfileForm } from './ProfileForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('view');
  const { isMobile } = useMobileResponsive();

  return (
    <ProtectedRoute>
      <div className={`container mx-auto ${isMobile ? 'py-4 px-4' : 'py-8'}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-8 ${isMobile ? 'max-w-full' : 'max-w-md mx-auto'}`}>
            <TabsTrigger value="view">View Profile</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view">
            <ProfileDisplay />
          </TabsContent>
          
          <TabsContent value="edit">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}