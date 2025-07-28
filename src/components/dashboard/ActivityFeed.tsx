import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePermissions } from "@/hooks/usePermissions";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useDemoActivities } from "@/hooks/useDemoActivities";
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

// Fetch real activities from database (placeholder for now)
const fetchRealActivities = async (userRoles: string[]): Promise<Activity[]> => {
  // TODO: Implement real activity fetching from database
  // For now, return empty array to remove mock data
  return [];
};

export function ActivityFeed() {
  const { roles, loading } = usePermissions();
  const { isDemoMode, demoRole } = useDemoMode();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const demoActivities = useDemoActivities(demoRole);

  useEffect(() => {
    if (!loading) {
      if (isDemoMode) {
        setActivities(demoActivities);
      } else {
        // Fetch real activities or show empty state
        fetchRealActivities(roles).then(setActivities);
      }
    }
  }, [roles, loading, isDemoMode, demoActivities]);

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
            className="min-h-[44px] touch-manipulation"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
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
                    "flex items-start space-x-3 p-3 sm:p-4 rounded-lg border-l-4 transition-all hover:shadow-sm touch-manipulation",
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
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
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
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-2 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-2">
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
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4 mt-2 sm:mt-0">
                      {activity.actionable && activity.actionLabel && (
                        <Button
                          variant={activity.actionVariant || "outline"}
                          size="sm"
                          onClick={() => handleActionClick(activity)}
                          className="text-xs px-3 py-2 min-h-[44px] touch-manipulation w-full sm:w-auto"
                        >
                          {activity.actionLabel}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="p-2 min-h-[44px] touch-manipulation">
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
          <Button variant="outline" className="w-full min-h-[44px] touch-manipulation">
            See More Activities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}