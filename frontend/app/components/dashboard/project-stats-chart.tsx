"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    Cell
} from 'recharts'
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface ProjectStats {
    projectName: string
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
}

interface ProjectStatsChartProps {
    projects: ProjectStats[]
}

export function ProjectStatsChart({ projects }: ProjectStatsChartProps) {
    // Calculate totals for the summary
    const totals = projects.reduce((acc, project) => ({
        completed: acc.completed + project.completedTasks,
        inProgress: acc.inProgress + project.inProgressTasks,
        pending: acc.pending + project.pendingTasks
    }), { completed: 0, inProgress: 0, pending: 0 });

    const total = totals.completed + totals.inProgress + totals.pending;

    // Process data to include percentages
    const data = projects.map(project => {
        const total = project.completedTasks + project.inProgressTasks + project.pendingTasks;
        return {
            projectName: project.projectName,
            completedTasks: project.completedTasks,
            inProgressTasks: project.inProgressTasks,
            pendingTasks: project.pendingTasks,
            completedPercentage: ((project.completedTasks / total) * 100).toFixed(1),
            inProgressPercentage: ((project.inProgressTasks / total) * 100).toFixed(1),
            pendingPercentage: ((project.pendingTasks / total) * 100).toFixed(1)
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="font-medium">{label}</div>
                    <div className="grid gap-2 pt-2">
                        {payload.map((entry: any, index: number) => (
                            <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-muted-foreground">{entry.name}:</span>
                                <span className="font-medium">{entry.value}</span>
                                <span className="text-muted-foreground">
                                    ({data.find(d => d.projectName === label)?.[`${entry.dataKey}Percentage`]}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-2">
                        <CardTitle>Project Task Distribution</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900">
                                Completed: {totals.completed} ({((totals.completed/total) * 100).toFixed(1)}%)
                            </Badge>
                            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
                                In Progress: {totals.inProgress} ({((totals.inProgress/total) * 100).toFixed(1)}%)
                            </Badge>
                            <Badge variant="outline" className="bg-red-100 dark:bg-red-900">
                                Pending: {totals.pending} ({((totals.pending/total) * 100).toFixed(1)}%)
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis 
                                    dataKey="projectName"
                                    tick={{ fill: 'var(--foreground)' }}
                                    tickLine={{ stroke: 'var(--foreground)' }}
                                />
                                <YAxis 
                                    tick={{ fill: 'var(--foreground)' }}
                                    tickLine={{ stroke: 'var(--foreground)' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar
                                    dataKey="completedTasks"
                                    stackId="a"
                                    name="Completed"
                                    fill="hsl(var(--success))"
                                    radius={[4, 4, 0, 0]}
                                >
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`}
                                            fillOpacity={0.8}
                                            className="transition-opacity duration-200 hover:fill-opacity-100"
                                        />
                                    ))}
                                </Bar>
                                <Bar
                                    dataKey="inProgressTasks"
                                    stackId="a"
                                    name="In Progress"
                                    fill="hsl(var(--primary))"
                                    radius={[0, 0, 0, 0]}
                                >
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`}
                                            fillOpacity={0.8}
                                            className="transition-opacity duration-200 hover:fill-opacity-100"
                                        />
                                    ))}
                                </Bar>
                                <Bar
                                    dataKey="pendingTasks"
                                    stackId="a"
                                    name="Pending"
                                    fill="hsl(var(--destructive))"
                                    radius={[0, 0, 0, 0]}
                                >
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`}
                                            fillOpacity={0.8}
                                            className="transition-opacity duration-200 hover:fill-opacity-100"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

