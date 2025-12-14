"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from "framer-motion"

interface TeamActivity {
    name: string
    tasksCompleted: number
    totalTasks: number
}

interface TeamActivityChartProps {
    activities: TeamActivity[]
}

export function TeamActivityChart({ activities }: TeamActivityChartProps) {
    const data = activities.map(member => ({
        name: member.name,
        completed: member.tasksCompleted,
        pending: member.totalTasks - member.tasksCompleted,
        completionRate: ((member.tasksCompleted / member.totalTasks) * 100).toFixed(1)
    }))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Team Task Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                                formatter={(value, name: string) => [
                                    `${value} tasks`, 
                                    name.charAt(0).toUpperCase() + name.slice(1)
                                ]}
                            />
                            <Legend />
                            <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
                            <Bar dataKey="pending" stackId="a" fill="#EF4444" name="Pending" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    )
}

