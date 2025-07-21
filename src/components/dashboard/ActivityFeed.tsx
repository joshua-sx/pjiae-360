import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  FileText, 
  MessageSquare, 
  Target,
  ChevronRight,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Activity types and their configurations
const activityTypes = {
  system_alert: {
    icon: AlertTriangle,
    borderColor: "border-l-orange-500",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  goal_assignment: {
    icon: Target,
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  appraisal_update: {
    icon: FileText,
    borderColor: "border-l-green-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  review_request: {
    icon: MessageSquare,
    borderColor: "border-l-purple-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  },
  team_update: {
    icon: Users,
    borderColor: "border-l-cyan-500",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600"
  },
  performance_milestone: {
    icon: TrendingUp,
    borderColor: "border-l-emerald-500",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600"
  },
  completion: {
    icon: CheckCircle,
    borderColor: "border-l-green-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  }
};

export interface Activity {
  id: string;
  type: keyof typeof activityTypes;
  title: string;
  description: string;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
    department?: string;
    role?: string;
  };
  timestamp: Date;
  tags?: string[];
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  actionLabel?: string;
  actionVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
  metadata?: Record<string, any>;
}

const generateMockActivities = (userRoles: string[]): Activity[] => {
  const baseActivities: Activity[] = [
    {
      id: "1",
      type: "system_alert",
      title: "System Alert",
      description: "15 appraisals missing signatures company wide",
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      tags: ["Q4 Appraisal Cycle"],
      priority: "high",
      actionable: true,
      actionLabel: "Take Action",
      actionVariant: "destructive"
    },
    {
      id: "2",
      type: "appraisal_update",
      title: "Appraisal Needed",
      description: "requests approval for department restructure",
      user: {
        name: "James Wilson",
        initials: "JW",
        department: "Engineering",
        role: "Senior Developer"
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      tags: ["Restructuring Department"],
      priority: "medium",
      actionable: true,
      actionLabel: "Take Action"
    },
    {
      id: "3",
      type: "team_update",
      title: "System Alert",
      description: "New performance policy rollout completed",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      tags: ["All Departments"],
      priority: "low",
      actionable: false,
      actionLabel: "Review"
    }
  ];

  // Role-specific activities
  if (userRoles.includes('admin')) {
    baseActivities.push(
      {
        id: "4",
        type: "system_alert",
        title: "System Alert",
        description: "Filed a performance review dispute",
        user: {
          name: "Robert Chen",
          initials: "RC",
          department: "Marketing",
          role: "Marketing Manager"
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        tags: ["Annual Review Appeal"],
        priority: "high",
        actionable: true,
        actionLabel: "Take Action",
        actionVariant: "destructive"
      },
      {
        id: "5",
        type: "team_update",
        title: "System Alert",
        description: "Goal modification detected in Sales Department",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        tags: ["Audit Log Entry Policy"],
        priority: "medium",
        actionable: true,
        actionLabel: "View"
      }
    );
  }

  if (userRoles.includes('manager') || userRoles.includes('director')) {
    baseActivities.push(
      {
        id: "6",
        type: "goal_assignment",
        title: "Goal Update",
        description: "assigned you a new goal",
        user: {
          name: "Sarah Chen",
          initials: "SC",
          department: "Sales Team",
          role: "Sales Representative"
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        tags: ["Improve Customer Retention"],
        priority: "medium",
        actionable: false,
        actionLabel: "Review"
      },
      {
        id: "7",
        type: "review_request",
        title: "Review Request",
        description: "submitted self evaluation for review",
        user: {
          name: "Lisa Rodriguez",
          initials: "LR",
          department: "Sales Team",
          role: "Account Manager"
        },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        tags: ["Annual Performance Review"],
        priority: "medium",
        actionable: true,
        actionLabel: "Take Action",
        actionVariant: "default"
      }
    );
  }

  if (userRoles.includes('employee')) {
    baseActivities.push(
      {
        id: "8",
        type: "completion",
        title: "Goal Update",
        description: "completed the goal",
        user: {
          name: "John Martinez",
          initials: "JM",
          department: "Sales Team",
          role: "Sales Manager"
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        tags: ["Increase Lead Conversion"],
        priority: "low",
        actionable: false,
        actionLabel: "View"
      },
      {
        id: "9",
        type: "appraisal_update",
        title: "System Alert",
        description: "Reminder: 5 team appraisals due this week",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        tags: ["Sales Team Reviews"],
        priority: "medium",
        actionable: true,
        actionLabel: "Take Action"
      }
    );
  }

  return baseActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export function ActivityFeed() {
  const { roles, loading } = usePermissions();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!loading) {
      const mockActivities = generateMockActivities(roles);
      setActivities(mockActivities);
    }
  }, [roles, loading]);

  const handleActionClick = (activity: Activity) => {
    console.log(`Action clicked for activity: ${activity.id}`, activity);
    // Here you would typically navigate to the relevant page or open a modal
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with your team's activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{activities.length} activities</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => {
            const config = activityTypes[activity.type];
            const IconComponent = config.icon;
            
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start space-x-3 p-4 rounded-lg border-l-4 transition-all hover:shadow-sm",
                  config.borderColor,
                  config.bgColor
                )}
              >
                <div className="flex-shrink-0">
                  {activity.user ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.initials}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.bgColor)}>
                      <IconComponent className={cn("w-4 h-4", config.iconColor)} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {activity.title}
                        </span>
                        {activity.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-foreground leading-relaxed">
                        {activity.user && (
                          <span className="font-medium">{activity.user.name} </span>
                        )}
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          {activity.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {activity.actionable && activity.actionLabel && (
                        <Button
                          variant={activity.actionVariant || "outline"}
                          size="sm"
                          onClick={() => handleActionClick(activity)}
                          className="text-xs px-3 py-1"
                        >
                          {activity.actionLabel}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="p-1">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="outline" className="w-full">
            See More Activities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}