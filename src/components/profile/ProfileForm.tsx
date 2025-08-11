import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { Upload, User } from 'lucide-react';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  job_title: string;
  department_id: string;
  division_id: string;
  manager_id: string;
  hire_date: string;
}

export function ProfileForm() {
  const { profile, departments, divisions, managers, updating, updateProfile } = useProfile();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      job_title: profile?.job_title || '',
      department_id: profile?.department_id || '',
      division_id: profile?.division_id || '',
      manager_id: profile?.manager_id || '',
      hire_date: profile?.hire_date || '',
    }
  });

  const watchedDivision = watch('division_id');
  const filteredDepartments = departments.filter(dept => 
    !watchedDivision || dept.division_id === watchedDivision
  );

  const onSubmit = async (data: ProfileFormData) => {
    const updates = {
      ...data,
      name: `${data.first_name} ${data.last_name}`.trim(),
      department_id: data.department_id || null,
      division_id: data.division_id || null,
      manager_id: data.manager_id || null,
      hire_date: data.hire_date || null,
    };

    await updateProfile(updates);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profile) {
    return <div className="flex items-center justify-center p-8">Loading profile...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your personal information and organizational details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview || profile.avatar_url || ''} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
                  <Upload className="h-4 w-4" />
                  <span>Upload new photo</span>
                </div>
              </Label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              sanitize
              {...register('first_name', { required: 'First name is required' })}
            />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              sanitize
              {...register('last_name', { required: 'Last name is required' })}
            />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed. Contact your administrator if needed.
            </p>
          </div>

          {/* Job Information */}
          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              sanitize
              {...register('job_title')}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input
              id="hire_date"
              type="date"
              {...register('hire_date')}
            />
          </div>

          {/* Organizational Structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="division_id">Division</Label>
              <Select
                value={watch('division_id')}
                onValueChange={(value) => {
                  setValue('division_id', value);
                  setValue('department_id', ''); // Reset department when division changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No division</SelectItem>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              <Select
                value={watch('department_id')}
                onValueChange={(value) => setValue('department_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No department</SelectItem>
                  {filteredDepartments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Manager Selection */}
          <div className="space-y-2">
            <Label htmlFor="manager_id">Manager</Label>
            <Select
              value={watch('manager_id')}
              onValueChange={(value) => setValue('manager_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No manager</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name || `${manager.first_name} ${manager.last_name}`} 
                    {manager.job_title && ` - ${manager.job_title}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}