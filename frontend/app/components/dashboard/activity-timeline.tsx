import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Activity {
  id: string
  user: {
    name: string
    avatar?: string
  }
  action: string
  target: string
  timestamp: string
}

interface ActivityTimelineProps {
  activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback>
                  {activity.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">
                  <span className="font-semibold">{activity.user.name}</span>
                  {' '}{activity.action}{' '}
                  <span className="font-semibold">{activity.target}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

