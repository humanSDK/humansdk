import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotification } from "@/components/context/NotificationContext";

interface Activity {
  _id: string;
  userName: string;
  userAvatar: string;
  taskName?: string;
  projectName?: string;
  action: string;
  timestamp: string;
}

export const RecentActivityCard = () => {
  const { activities, refreshActivities } = useNotification();

  // Take only the 5 most recent activities
  const recentActivities = activities.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => refreshActivities()}
          title="Refresh activities"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity: Activity) => (
              <div key={activity._id} className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                  <AvatarFallback>
                    {activity.userName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.userName}</span>{" "}
                    {activity.action}{" "}
                    {activity.taskName && (
                      <span className="font-medium">&quot;{activity.taskName}&quot;</span>
                    )}{" "}
                    {activity.projectName && (
                      <span className="text-muted-foreground">
                       task  in project &quot;{activity.projectName}&quot;
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};