import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { User, Mail, Calendar, Building, Users, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

export function ProfileDisplay() {
  const { profile, departments, divisions, managers, loading } = useProfile();

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          Loading profile...
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          Profile not found
        </CardContent>
      </Card>
    );
  }

  const department = departments.find(d => d.id === profile.department_id);
  const division = divisions.find(d => d.id === profile.division_id);
  const manager = managers.find(m => m.id === profile.manager_id);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {profile.name || `${profile.first_name} ${profile.last_name}`}
            </CardTitle>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                {profile.status}
              </Badge>
              {profile.job_title && (
                <span className="text-sm">{profile.job_title}</span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>
        </div>

        {/* Employment Details */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Employment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {profile.hire_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Hired: {format(new Date(profile.hire_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            {profile.job_title && (
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{profile.job_title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Organizational Structure */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Organization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {division && (
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Division: {division.name}</span>
              </div>
            )}
            {department && (
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Department: {department.name}</span>
              </div>
            )}
            {manager && (
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  Manager: {manager.name || `${manager.first_name} ${manager.last_name}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Metadata */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              Created: {format(new Date(profile.created_at), 'MMM d, yyyy')}
            </div>
            <div>
              Last updated: {format(new Date(profile.updated_at), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}