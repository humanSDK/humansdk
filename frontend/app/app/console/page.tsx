"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useUser } from "@/components/context/UserContext";
import { useNotification } from "@/components/context/NotificationContext";
import axiosInstances from "@/utils/axiosInstance";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProjectOverview } from "@/components/dashboard/project-overview";
import { ProjectStatsChart } from "@/components/dashboard/project-stats-chart";
import { TaskDistributionPie } from "@/components/dashboard/task-distribution-pie";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { Button } from "@/components/ui/button";

interface ProjectWiseAnalytics {
    projectId: string;
    projectName: string;
    statusCounts: {
        completed: number;
        inProgress: number;
        notStarted: number;
    };
    totalTasksAssigned: number;
}

const WelcomePage = () => {
    const { userData } = useUser();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [projectData, setProjectData] = useState<any>(null);
    const [taskData, setTaskData] = useState<any>(null);
    const { refreshActivities } = useNotification();

    const fetchDashboardData = useCallback(async () => {
        try {
            const [statsRes, projectRes, tasksRes] = await Promise.all([
                axiosInstances.CoreService.get("/analytics/stats"),
                axiosInstances.CoreService.get("/analytics/project"),
                axiosInstances.CoreService.get("/analytics/tasks")
            ]);

            setStats(statsRes.data);
            setProjectData(projectRes.data);
            setTaskData(tasksRes.data);
            refreshActivities();
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [refreshActivities]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-[200px] w-full" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-[100px]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="min-h-screen bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto p-6 space-y-8">
                {/* Welcome Section with Navigation */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                    <motion.div 
                        className="flex flex-col space-y-2"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold tracking-tight">
                            Welcome back, <span className="text-primary">{userData.user.name}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Here&apos;s an overview of your projects and team activity
                        </p>
                    </motion.div>

                    <div className="flex gap-4">
                        <Button asChild>
                            <a href="/console/projects" className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                  Create Project
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/console/team-members" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Create Team
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <motion.div 
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <StatsCard
                        title="Total Projects"
                        value={stats.totalProjects}
                        icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatsCard
                        title="Active Teams"
                        value={stats.activeTeams}
                        icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatsCard
                        title="Completed Tasks"
                        value={stats.completedTasks}
                        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatsCard
                        title="Tasks in Progress"
                        value={stats.tasksInProgress}
                        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatsCard
                        title="Not Started"
                        value={stats.notStarted}
                        icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
                    />
                </motion.div>

                {projectData?.pages.length > 0 ? (
                    <motion.div 
                        className="space-y-8"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        {/* Main Content Grid */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <ProjectOverview 
                                projects={taskData.projectWiseAnalytics.map((p: ProjectWiseAnalytics) => ({
                                    id: p.projectId,
                                    name: p.projectName,
                                    progress: (p.statusCounts.completed / p.totalTasksAssigned) * 100,
                                    totalTasks: p.totalTasksAssigned,
                                    completedTasks: p.statusCounts.completed
                                }))}
                            />
                            <TaskDistributionPie 
                                completed={stats.completedTasks}
                                inProgress={stats.tasksInProgress}
                                notStarted={stats.notStarted}
                            />
                        </div>

                        {/* Recent Activity */}
                        <RecentActivityCard/>

                        {/* Project Stats */}
                        <ProjectStatsChart 
                            projects={taskData.projectWiseAnalytics.map((p: ProjectWiseAnalytics) => ({
                                projectName: p.projectName,
                                completedTasks: p.statusCounts.completed,
                                inProgressTasks: p.statusCounts.inProgress,
                                pendingTasks: p.statusCounts.notStarted
                            }))}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        className="flex flex-col items-center gap-6 py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-lg text-muted-foreground text-center">
                            Get started by creating your first project or team
                        </p>
                        <div className="flex gap-4">
                            <Button asChild size="lg">
                                <a
                                    href="/console/team-members"
                                    className="flex items-center gap-2"
                                >
                                    <Users size={20} />
                                    Create Your Team
                                </a>
                            </Button>
                            <Button asChild size="lg">
                                <a
                                    href="/console/projects"
                                    className="flex items-center gap-2"
                                >
                                    <Briefcase size={20} />
                                    Create Your Project
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default WelcomePage;

