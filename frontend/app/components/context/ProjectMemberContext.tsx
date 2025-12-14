"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import axiosInstances from "@/utils/axiosInstance";

type ProjectMember = {
    _id: string,
    email: string,
    userName: string,
    userId: string,
    avatar: string,
    status: 'accepted' | 'removed' | 'invited'
}

type assignedTeam = {
    name: string;
    owner: string;
}
const emptyAssignedteam: assignedTeam = {
    name: '',
    owner: ''
}

type owner = {
    email: string;
    name: string;
    _id: string;
}
const emptyOwner = {
    email: '',
    name: '',
    _id: ''
}

export type ProjectDetail = {
    _id: string;
    name: string;
    assignedTeam: assignedTeam;
    owner: owner;
}
const emptyProjectDetail: ProjectDetail = {
    _id: '',
    name: '',
    assignedTeam: emptyAssignedteam,
    owner: emptyOwner
}

interface ProjectMemberContextType {
    members: ProjectMember[];
    projectDetails: ProjectDetail;
    fetchProjectMembers: (projectId: string) => Promise<void>;
    fetchProjectDetails: (projectId: string) => Promise<void>;
    isLoading: boolean;
}

// Create the context
const ProjectMemberContext = createContext<ProjectMemberContextType | undefined>(undefined);

// Provider component
export function ProjectMemberProvider({ children }: { children: ReactNode }) {
    const [projectDetails, setProjectDetails] = useState<ProjectDetail>(emptyProjectDetail);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    //fetch project details
    const fetchProjectDetails = async (projectId: string) => {
        try {
            const response = await axiosInstances.CoreService.get(`/project/${projectId}`)
            console.log("response forprjoejct details: ", response)
            if (response.status == 200) {
                setProjectDetails(response.data.project)
            }
        } catch (error) {
            console.log("error in getting project detials:", error)
        }
    }
    // Fetch project members from the API
    const fetchProjectMembers = async (projectId: string) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("ct_token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axiosInstances.CoreService.get(`/team-members/get-project-members?projectId=${projectId}`);

            setMembers(response.data.members || []);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch project members:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch project members",
            });
            setIsLoading(false);
        }
    };

    // Context value
    const value = {
        members,
        projectDetails,
        fetchProjectMembers,
        fetchProjectDetails,
        isLoading,
    };

    return (
        <ProjectMemberContext.Provider value={value}>
            {children}
        </ProjectMemberContext.Provider>
    );
}

// Custom hook to use the project member context
export function useProjectMembers() {
    const context = useContext(ProjectMemberContext);
    if (context === undefined) {
        throw new Error("useProjectMembers must be used within a ProjectMemberProvider");
    }
    return context;
}

export default ProjectMemberContext;
