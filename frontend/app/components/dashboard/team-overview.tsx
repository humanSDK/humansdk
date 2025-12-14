import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface TeamMember {
  id: string
  name: string
  avatar?: string
  role: string
  tasksCompleted: number
  totalTasks: number
}

interface TeamOverviewProps {
  members: TeamMember[]
}

export function TeamOverview({ members }: TeamOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {members.map((member, index) => {
            const progress = (member.tasksCompleted / member.totalTasks) * 100
            
            return (
              <motion.div
                key={member.id}
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <p className="text-sm font-medium">{Math.round(progress)}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

