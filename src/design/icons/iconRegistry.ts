/**
 * Icon Registry
 * Central registry for all icons to ensure consistency and prevent one-off imports
 */

import {
  // Navigation
  Home,
  Users,
  Building2,
  Settings,
  HelpCircle,
  
  // Actions
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  X,
  Check,
  Search,
  Filter,
  RefreshCw,
  
  // Interface
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  MoreVertical,
  
  // Status
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Zap,
  
  // Data & Files
  FileText,
  File,
  Folder,
  Database,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  
  // Communication
  Mail,
  MessageSquare,
  Bell,
  
  // User & Account
  User,
  UserPlus,
  UserMinus,
  Shield,
  Key,
  
  // Utility
  Calendar,
  Clock3,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  
  // Theme
  Sun,
  Moon,
  Monitor,
  
} from 'lucide-react';

/**
 * Centralized icon registry
 * All icons used in the application should be exported from here
 */
export const Icons = {
  // Navigation
  Dashboard: Home,
  Team: Users,
  Organization: Building2,
  Settings: Settings,
  Help: HelpCircle,
  
  // Actions
  Add: Plus,
  Edit: Edit,
  Delete: Trash2,
  Download: Download,
  Upload: Upload,
  Save: Save,
  Close: X,
  Check: Check,
  Search: Search,
  Filter: Filter,
  Refresh: RefreshCw,
  
  // Interface
  Menu: Menu,
  ChevronLeft: ChevronLeft,
  ChevronRight: ChevronRight,
  ChevronDown: ChevronDown,
  ChevronUp: ChevronUp,
  ArrowLeft: ArrowLeft,
  ArrowRight: ArrowRight,
  ArrowUp: ArrowUp,
  ArrowDown: ArrowDown,
  MoreHorizontal: MoreHorizontal,
  MoreVertical: MoreVertical,
  
  // Status
  Warning: AlertCircle,
  Success: CheckCircle,
  Error: XCircle,
  Info: Info,
  Pending: Clock,
  Active: Zap,
  
  // Data & Files
  Document: FileText,
  File: File,
  Folder: Folder,
  Database: Database,
  BarChart: BarChart3,
  PieChart: PieChart,
  TrendingUp: TrendingUp,
  TrendingDown: TrendingDown,
  
  // Communication
  Email: Mail,
  Message: MessageSquare,
  Notification: Bell,
  
  // User & Account
  User: User,
  UserAdd: UserPlus,
  UserRemove: UserMinus,
  Security: Shield,
  Password: Key,
  
  // Utility
  Calendar: Calendar,
  Time: Clock3,
  Location: MapPin,
  Phone: Phone,
  Website: Globe,
  ExternalLink: ExternalLink,
  Copy: Copy,
  Show: Eye,
  Hide: EyeOff,
  
  // Theme
  Light: Sun,
  Dark: Moon,
  System: Monitor,
} as const;

/**
 * Type for valid icon names
 */
export type IconName = keyof typeof Icons;

/**
 * Standard icon sizes based on design tokens
 */
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof IconSizes;

/**
 * Helper function to get icon size value
 */
export function getIconSize(size: IconSize): number {
  return IconSizes[size];
}