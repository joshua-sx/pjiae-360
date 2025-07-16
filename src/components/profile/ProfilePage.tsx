import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileDisplay } from './ProfileDisplay';
import { ProfileForm } from './ProfileForm';
import ProtectedRoute from '@/components/ProtectedRoute';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('view');

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
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