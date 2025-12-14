"use client"

import { useEffect, useState } from "react";
import AnalyticsComponent from "@/components/Analytics";
import { ProjectMemberProvider } from '@/components/context/ProjectMemberContext';

const Page = ({ params }: { params: { id: string } }) => {
    const [projectId, setProjectId] = useState<string | null>(null);
    useEffect(() => {
        if (params.id) {
            setProjectId(params.id)
        }
    }, [params.id]);

    if (!projectId) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading your analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <ProjectMemberProvider>
            <div className="min-h-screen w-full overflow-hidden">
                <AnalyticsComponent projectId={projectId} />
            </div>
        </ProjectMemberProvider>
    )
}

export default Page;