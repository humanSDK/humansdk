"use client"
import React, { useState, useEffect } from "react";
import { useProjectMembers } from '@/components/context/ProjectMemberContext';
import axiosInstances from "../utils/axiosInstance";
import AppSidebar from "./AppSidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

import dynamic from 'next/dynamic';
const Plot: any = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Task {
    _id: string;
    data: {
        type: string;
        status: string;
        label: string;
        assignees: string[];
    };
}
const ChartTypes = {
    PIE: "pie",
    BAR: "bar",
    DONUT: "donut",
};

interface AnalyticsComponentProps {
    projectId: string;
}

const AnalyticsComponent = ({ projectId }: AnalyticsComponentProps) => {
    const { members, fetchProjectMembers } = useProjectMembers();
    const [pages, setPages] = useState<any[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [groupBy, setGroupBy] = useState<"status" | "assignees" | "type">("status");
    const [chartType, setChartType] = useState(ChartTypes.PIE);

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const response = await axiosInstances.CoreService.get("/analytics/pages", {
                    params: { projectId },
                });
                setPages(response.data.pages);
            } catch (error) {
                console.error("Error fetching pages:", error);
            }
        };
        fetchPages();
        if (projectId) fetchProjectMembers(projectId);
    }, [projectId]);

    useEffect(() => {
        if (!selectedPageId) return;
        const fetchTasks = async () => {
            try {
                const response = await axiosInstances.CoreService.get("/analytics/page/tasks", {
                    params: { projectId, pageId: selectedPageId },
                });
                setTasks(response.data.allTasks.filter((task: any) => task.type === 'task'));
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchTasks();
    }, [selectedPageId, projectId]);

    const selectedPageCompletionPercentage = selectedPageId ?
        Math.round((tasks.filter(task => task.data.status === 'Completed').length / tasks.length) * 100) || 0 : 0;

    const groupedTasks = tasks.reduce((acc: any, task: any) => {
        let key;
        if (groupBy === "assignees") {
            key = task.data.assignees.length ? task.data.assignees.map((assigneeId: string) => {
                const member = members.find(m => m.email === assigneeId);
                return member ? member.userName : 'Unknown';
            }).join(", ") : "Unassigned";
        } else if (groupBy === "type") {
            key = task.data.type || "Unspecified";
        } else {
            key = task.data.status || "No Status";
        }
        acc[key] = acc[key] || [];
        acc[key].push(task);
        return acc;
    }, {});

    const getChartData = () => {
        const labels = Object.keys(groupedTasks);
        const values = labels.map((key) => groupedTasks[key].length);

        const baseData = {
            labels,
            values,
            textinfo: "label+percent",
        };

        switch (chartType) {
            case ChartTypes.BAR:
                return [{
                    type: "bar",
                    x: labels,
                    y: values,
                    marker: {
                        color: 'rgb(58, 134, 255)',
                    },
                }];
            case ChartTypes.DONUT:
                return [{
                    ...baseData,
                    type: "pie",
                    hole: 0.6,
                }];
            default:
                return [{
                    ...baseData,
                    type: "pie",
                    hole: 0,
                }];
        }
    };
    // Calculate individual member completion percentage
    const calculateMemberCompletion = (member: any) => {
        const assignedTasks = tasks.filter((task: any) =>
            task.data.assignees.includes(member.email)
        );
        const completedTasks = assignedTasks.filter(
            (task: any) => task.data.status === 'Completed'
        );
        const completionPercentage = assignedTasks.length > 0 ?
            Math.round((completedTasks.length / assignedTasks.length) * 100) : 0;

        return completionPercentage;
    };

    return (
        <div className="flex h-screen w-full bg-gray-50">
            <AppSidebar projectId={projectId} pageType="analytics" />
            <div className="flex-1 h-screen overflow-y-auto p-6 space-y-6">
                {/* Project Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Pages</h3>
                                    <p className="text-2xl font-bold">{pages.length}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Team Members</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {members.map((member) => (
                                            <div key={member._id} className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
                                                <Avatar>
                                                    <AvatarImage src={member.avatar} />
                                                    <AvatarFallback>{member.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">{member.userName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Page Selection and Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Page Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Select value={selectedPageId || ""} onValueChange={setSelectedPageId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a page to view statistics..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pages.map((page) => (
                                            <SelectItem key={page._id} value={page._id}>{page.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedPageId ? (
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Completion Progress</h3>
                                            <div className="relative w-full h-24 flex items-center justify-center">
                                                <svg className="w-24 h-24" viewBox="0 0 100 100">
                                                    <circle
                                                        className="text-gray-200 stroke-current"
                                                        strokeWidth="10"
                                                        fill="transparent"
                                                        r="40"
                                                        cx="50"
                                                        cy="50"
                                                    />
                                                    <circle
                                                        className="text-blue-500 stroke-current"
                                                        strokeWidth="10"
                                                        strokeLinecap="round"
                                                        fill="transparent"
                                                        r="40"
                                                        cx="50"
                                                        cy="50"
                                                        style={{
                                                            strokeDasharray: `${2 * Math.PI * 40}`,
                                                            strokeDashoffset: `${2 * Math.PI * 40 * (1 - selectedPageCompletionPercentage / 100)}`,
                                                            transform: 'rotate(-90deg)',
                                                            transformOrigin: '50% 50%',
                                                        }}
                                                    />
                                                </svg>
                                                <span className="absolute text-2xl font-bold">{selectedPageCompletionPercentage}%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Tasks</h3>
                                            <p className="text-2xl font-bold">{tasks.length}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center mt-4">Select a page to view its statistics</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {selectedPageId && (
                    <>
                        {/* Chart Section */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Task Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex space-x-4">
                                        <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Group by..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="status">Status</SelectItem>
                                                <SelectItem value="assignees">Assignees</SelectItem>
                                                <SelectItem value="type">Type</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={chartType} onValueChange={setChartType}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Chart type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ChartTypes.PIE}>Pie Chart</SelectItem>
                                                <SelectItem value={ChartTypes.BAR}>Bar Chart</SelectItem>
                                                <SelectItem value={ChartTypes.DONUT}>Donut Chart</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <Plot
                                            data={getChartData()}
                                            layout={{
                                                title: `${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)} Distribution`,
                                                height: 500,
                                                width: 800,
                                                margin: { t: 40, r: 20, b: 40, l: 40 },
                                                showlegend: true,
                                            }}
                                            config={{ responsive: true }}
                                        />
                                    </div>
                                    {
                                        groupBy == "assignees" &&
                                        <div className="mt-6">
                                            {members.map((member) => {
                                                const completion = calculateMemberCompletion(member);
                                                return (
                                                    <div key={member._id} className="flex items-center space-x-4 mb-4">
                                                        <Avatar>
                                                            <AvatarImage src={member.avatar} />
                                                            <AvatarFallback>{member.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-lg font-medium">{member.userName}</span>
                                                                <span className="text-lg">{completion}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                                                <div
                                                                    className="bg-blue-500 h-2.5 rounded-full"
                                                                    style={{ width: `${completion}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    }
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(groupedTasks).map(([key, tasksGroup]: any) => (
                                        <motion.div
                                            key={key}
                                            className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-xl font-semibold text-gray-800">{key}</h3>
                                                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-4 py-1 rounded-full">
                                                        {tasksGroup.length} tasks
                                                    </span>
                                                </div>

                                                <div className="space-y-5">
                                                    {tasksGroup.map((task: Task) => (
                                                        <div key={task._id} className="pl-5 border-l-4 border-blue-400">
                                                            <p className="text-lg font-medium text-gray-900">{task.data.label}</p>
                                                            <div className="mt-2 flex flex-wrap gap-3">
                                                                {task.data.assignees.length > 0 ? (
                                                                    task.data.assignees.map((assigneeId: string) => {
                                                                        const member = members.find(m => m.email === assigneeId);
                                                                        return member ? (
                                                                            <div key={assigneeId} className="flex items-center space-x-2">
                                                                                <Avatar className="h-8 w-8">
                                                                                    <AvatarImage src={member.avatar} />
                                                                                    <AvatarFallback>{member.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                                                </Avatar>
                                                                                <span className="text-sm font-medium text-gray-700">{member.userName}</span>
                                                                            </div>
                                                                        ) : null;
                                                                    })
                                                                ) : (
                                                                    <span className="text-sm text-gray-500 italic">Unassigned</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>


                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsComponent;