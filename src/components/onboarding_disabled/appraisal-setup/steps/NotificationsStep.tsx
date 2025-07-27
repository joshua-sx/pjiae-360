import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Clock, AlertCircle, Calendar, Users } from "lucide-react";
import { CycleData } from "../types";
import { ValidationErrors } from "../validation";

interface NotificationsStepProps {
  data: CycleData;
  onDataChange: (updates: Partial<CycleData>) => void;
  errors: ValidationErrors;
}

export const NotificationsStep = ({ data, onDataChange, errors }: NotificationsStepProps) => {
  const handleNotificationChange = (updates: Partial<CycleData['notifications']>) => {
    onDataChange({
      notifications: { ...data.notifications, ...updates }
    });
  };

  const notificationTypes = [
    {
      id: 'reminders',
      title: 'Reminder Notifications',
      description: 'Send reminders for upcoming deadlines and review activities',
      icon: Clock,
    },
    {
      id: 'deadlines',
      title: 'Deadline Notifications',
      description: 'Alert when review periods or goal setting windows are about to close',
      icon: Calendar,
    },
  ];

  const getNotificationSummary = () => {
    const enabled = data.notifications.enabled;
    const email = data.notifications.email;
    const reminders = data.notifications.reminders;
    const deadlines = data.notifications.deadlines;

    if (!enabled) return 'All notifications disabled';

    const activeTypes = [];
    if (reminders) activeTypes.push('Reminders');
    if (deadlines) activeTypes.push('Deadlines');

    const deliveryMethod = email ? 'Email' : 'In-app only';
    
    return `${activeTypes.join(' + ')} via ${deliveryMethod}`;
  };

  return (
    <div className="space-y-6">
      {/* Enable Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Send notifications about review activities and deadlines
              </p>
            </div>
            <Switch 
              checked={data.notifications.enabled} 
              onCheckedChange={(enabled) => handleNotificationChange({ enabled })} 
            />
          </div>
        </CardContent>
      </Card>

      {data.notifications.enabled && (
        <>
          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email in addition to in-app notifications
                  </p>
                </div>
                <Switch 
                  checked={data.notifications.email} 
                  onCheckedChange={(email) => handleNotificationChange({ email })} 
                />
              </div>

              {data.notifications.email && (
                <div>
                  <Label htmlFor="emailAddress" className="text-base font-medium">
                    Notification Email Address *
                  </Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={data.notifications.emailAddress}
                    onChange={(e) => handleNotificationChange({ emailAddress: e.target.value })}
                    placeholder="hr@company.com"
                    className={errors['notifications.emailAddress'] ? "border-destructive" : ""}
                  />
                  {errors['notifications.emailAddress'] && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors['notifications.emailAddress'][0]}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Primary email address for receiving review notifications
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Types</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose which types of notifications to receive
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationTypes.map((type) => {
                const Icon = type.icon;
                const isChecked = data.notifications[type.id as keyof typeof data.notifications] as boolean;
                
                return (
                  <div key={type.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id={type.id}
                      checked={isChecked}
                      onCheckedChange={(checked) => 
                        handleNotificationChange({ [type.id]: !!checked })
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={type.id} className="font-medium flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        {type.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Notification Schedule Preview */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Notification Schedule Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {data.goalSettingWindows.map((window) => (
                    <div key={window.id} className="p-3 bg-background rounded-lg border">
                      <h4 className="font-medium text-sm">{window.name}</h4>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {data.notifications.reminders && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Reminder: 7 days before start ({new Date(new Date(window.startDate).getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()})
                          </div>
                        )}
                        {data.notifications.deadlines && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Deadline: 1 day before end ({new Date(new Date(window.endDate).getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {data.reviewPeriods.map((period) => (
                    <div key={period.id} className="p-3 bg-background rounded-lg border">
                      <h4 className="font-medium text-sm">{period.name}</h4>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {data.notifications.reminders && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Reminder: 7 days before start ({new Date(new Date(period.startDate).getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()})
                          </div>
                        )}
                        {data.notifications.deadlines && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Deadline: 3 days before end ({new Date(new Date(period.endDate).getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString()})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Notification Summary</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{getNotificationSummary()}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {data.notifications.email && data.notifications.emailAddress && (
                  <>Notifications will be sent to <strong>{data.notifications.emailAddress}</strong></>
                )}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};