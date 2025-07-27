
import { Building2, Users, UserCog, Layers, Calendar, CheckCircle, Upload, MapPin, Eye, Target } from "lucide-react";

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
    id: 'mapping',
    title: 'Column Mapping',
    icon: MapPin,
    description: 'Map CSV columns to fields'
  },
  {
    id: 'preview',
    title: 'Preview & Confirm',
    icon: Eye,
    description: 'Review imported data'
  },
  {
    id: 'import-roles',
    title: 'Import & Assign Roles',
    icon: UserCog,
    description: 'Complete import and set team roles'
  },
  {
    id: 'appraisal-setup',
    title: 'Appraisal Setup',
    icon: Target,
    description: 'Configure performance evaluation criteria'
  },
  {
    id: 'success',
    title: 'Success Dashboard',
    icon: CheckCircle,
    description: 'Your setup is complete!'
  }
];
