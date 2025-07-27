import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

interface Notifications {
  enabled: boolean;
  email: boolean;
  emailAddress: string;
  reminders: boolean;
  deadlines: boolean;
}

interface NotificationSettingsProps {
  notifications: Notifications;
  onNotificationChange: (updates: Partial<Notifications>) => void;
}

export const NotificationSettings = ({ notifications, onNotificationChange }: NotificationSettingsProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send automated notifications to participants
            </p>
          </div>
          <Switch 
            checked={notifications.enabled} 
            onCheckedChange={(enabled) => onNotificationChange({ enabled })} 
          />
        </div>

        {notifications.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Notification Email Address</Label>
              <Input 
                type="email" 
                value={notifications.emailAddress} 
                onChange={(e) => onNotificationChange({ emailAddress: e.target.value })} 
                placeholder="hr@company.com" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="reminders"
                  checked={notifications.reminders}
                  onCheckedChange={(checked) => onNotificationChange({ reminders: checked as boolean })}
                />
                <Label htmlFor="reminders" className="text-sm">Send reminders</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="deadlines"
                  checked={notifications.deadlines}
                  onCheckedChange={(checked) => onNotificationChange({ deadlines: checked as boolean })}
                />
                <Label htmlFor="deadlines" className="text-sm">Deadline notifications</Label>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};