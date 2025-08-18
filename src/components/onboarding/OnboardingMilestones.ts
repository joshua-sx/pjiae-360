
import { Building2, Users, UserCog, Layers, Calendar, CheckCircle, Upload, MapPin, Eye } from "lucide-react";

export interface Milestone {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const milestones: Milestone[] = [
  {
    id: 'welcome',
    title: 'Welcome & Organization Setup',
    icon: Building2,
    description: 'Set up your organization profile'
  },
  {
    id: 'people',
    title: 'Add Your People',
    icon: Users,
    description: 'Import your team members'
  },
  {
    id: 'appraisal-setup',
    title: 'Appraisal Setup',
    icon: Calendar,
    description: 'Configure performance evaluation criteria'
  },
  {
    id: 'mapping',
    title: 'Column Mapping',
    icon: MapPin,
    description: 'Map CSV columns to fields'
  },
  {
    id: 'import-roles',
    title: 'Assign Roles',
    icon: UserCog,
    description: 'Set team roles and responsibilities'
  },
  {
    id: 'success',
    title: 'Success Dashboard',
    icon: CheckCircle,
    description: 'Your setup is complete!'
  }
];
