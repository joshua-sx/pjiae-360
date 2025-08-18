
import { Building2, Users, UserCog, Calendar, Eye } from "lucide-react";

export interface Milestone {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const milestones: Milestone[] = [
  {
    id: 'welcome',
    title: 'Welcome & Identity',
    icon: Building2,
    description: 'Set up your organization profile'
  },
  {
    id: 'people',
    title: 'Add your team',
    icon: Users,
    description: 'Import your team members'
  },
  {
    id: 'import-roles',
    title: 'Assign roles',
    icon: UserCog,
    description: 'Set team roles and responsibilities'
  },
  {
    id: 'appraisal-setup',
    title: 'Appraisal cycle',
    icon: Calendar,
    description: 'Configure performance evaluation criteria'
  },
  {
    id: 'overview',
    title: 'Review & complete',
    icon: Eye,
    description: 'Review and confirm your setup'
  }
];
