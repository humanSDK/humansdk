import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface Project {
  id: string
  name: string
  progress: number
  totalTasks: number
  completedTasks: number
}

interface ProjectOverviewProps {
  projects: Project[]
}

export function ProjectOverview({ projects }: ProjectOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.completedTasks} of {project.totalTasks} tasks completed
                  </p>
                </div>
                <p className="text-sm font-medium">{project.progress}%</p>
              </div>
              <Progress value={project.progress} className="h-2" />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

