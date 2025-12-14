"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ProjectStatusGaugeProps {
    fullyCompleted: number
    fullyInProgress: number
    fullyNotStarted: number
}

export function ProjectStatusGauge({ fullyCompleted, fullyInProgress, fullyNotStarted }: ProjectStatusGaugeProps) {
    const total = fullyCompleted + fullyInProgress + fullyNotStarted
    const percentCompleted = (fullyCompleted / total) * 100

    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setProgress(percentCompleted), 500)
        return () => clearTimeout(timer)
    }, [percentCompleted])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Project Completion Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                                    Progress
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-teal-600">
                                    {progress.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200">
                            <motion.div 
                                style={{ width: `${progress}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                        <div>Not Started: {fullyNotStarted}</div>
                        <div>In Progress: {fullyInProgress}</div>
                        <div>Completed: {fullyCompleted}</div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

