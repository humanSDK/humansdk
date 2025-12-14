"use client"
import { useState, useEffect } from 'react'
import { ProjectMemberProvider } from '@/components/context/ProjectMemberContext';
import SprintBoard from '@/components/Sprintboard';
import axiosInstances from '@/utils/axiosInstance';

export default function SprintboardPage({ params }: { params: { id: string } }) {
    const [projectId, setProjectId] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);


    const checkProjectAccess = async (id: string) => {
        try {
            setLoading(true)

            const response = await axiosInstances.CoreService.get(`/page/validate-access?projectId=${id}`)
            if (response.status != 200) return window.location.href = '/console/projects'
            setLoading(false)
            return;
        } catch (error) {
            console.log("Failed to check access:", error)
        }
    }


    useEffect(() => {
        if (params.id) {
            setProjectId(params.id);
            checkProjectAccess(params.id)
        }
    }, [params.id]);

    if (loading || !projectId) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading your sprint board...</p>
                </div>
            </div>
        );
    }



    return (
        <ProjectMemberProvider>
            <main className="min-h-screen w-full overflow-hidden">
                <SprintBoard projectId={projectId} />
            </main>
        </ProjectMemberProvider>
    )
}

