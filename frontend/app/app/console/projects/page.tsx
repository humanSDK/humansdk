"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Trash, ArrowRight } from "lucide-react";
import axiosInstances from "@/utils/axiosInstance";
import { useToast } from "@/hooks/use-toast";

export default function AddProjectPage(): JSX.Element {
    const [projects, setProjects] = useState<any[]>([]);
    const [projectName, setProjectName] = useState<string>("");
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const { toast } = useToast();
    const [createLoader, setCreateLoader] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [associatedProjects, setAssociatedProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getAllProjects = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstances.CoreService.get(`/project/user`);
            if (response.status === 200) {
                setProjects(response.data.projects || []);
            } else {
                setProjects([]);
            }
            setIsLoading(false);
        } catch (error) {
            console.log("FAILED TO FETCH PROJECTS:", error);
            setProjects([]);
        }
    };

    const getAllTeams = async () => {
        try {
            const response = await axiosInstances.CoreService.get(`/team/all`);
            if (response.status === 200) {
                setTeams(response.data.teams || []);
            } else {
                setTeams([]);
            }
        } catch (error) {
            console.log("FAILED TO FETCH TEAMS:", error);
            setTeams([]);
        }
    };

    const getAssociatedProjects = async () => {
        try {
            const response = await axiosInstances.CoreService.get('/project/teams-associated');
            const result = response.data; // Axios automatically parses JSON responses

            setAssociatedProjects(result.projects || []);
        } catch (error) {
            console.error("Error fetching associated projects", error);
            setAssociatedProjects([]);
        }
    };

    const handleCreateProject = async () => {
        if (!selectedTeam) {
            toast({
                variant: "destructive",
                title: "Team Not Selected",
                description: "Please select a team before creating a project.",
            });
            return;
        }

        try {
            setCreateLoader(true);
            const response = await axiosInstances.CoreService.post(
                `/project/create`,
                {
                    name: projectName,
                    assignedTeam: selectedTeam,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                setProjectName("");
                setCreateLoader(false);
                setSelectedTeam(null);
                toast({
                    title: "Project Created",
                    description: "Your project has been created successfully.",
                });
                if (response.data.project._id)
                    window.location.href = `/console/projects/${response.data.project._id}-${response.data.page._id}`;
                getAllProjects(); // Refresh projects after creation
            }
        } catch (error) {
            console.log("err:", error)
            setCreateLoader(false);
            toast({
                variant: "destructive",
                title: "Failed to Create Project",
                description: "An error occurred while creating the project.",
            });
        }
    };

    const handleDeleteProject = async () => {
        try {
            if (!selectedProject) return;
            console.log("dd-d->", selectedProject)
            const response = await axiosInstances.CoreService.delete(`/project/${selectedProject.id}`);
            if (response.status === 200) {
                toast({
                    title: "Project Deleted",
                    description: "The project has been deleted successfully.",
                });
                getAllProjects(); // Refresh projects after deletion
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to Delete Project",
                    description: "An error occurred while deleting the project.",
                });
            }
            setIsDeleteDialogOpen(false);
            setSelectedProject(null);
        } catch (error) {
            console.log("Eerr:", error)
            toast({
                variant: "destructive",
                title: "Failed to Delete Project",
                description: "An error occurred while deleting the project.",
            });
        }
    };

    useEffect(() => {
        getAllProjects();
        getAssociatedProjects(); // Fetch associated projects on initial load
        getAllTeams();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading projects...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-white w-full py-8 px-4 mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2">
                            <Plus size={16} /> Add Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <h2 className="text-2xl font-bold text-gray-800">Create a New Project</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Add a name for your project and assign it to a team to get started.
                            </p>
                        </DialogHeader>
                        {teams.length > 0 ? (
                            <div className="space-y-6 mt-4">
                                <div>
                                    <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">
                                        Project Name
                                    </label>
                                    <Input
                                        id="project-name"
                                        placeholder="Enter project name"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="team-select" className="block text-sm font-medium text-gray-700">
                                        Assign to Team
                                    </label>
                                    <select
                                        id="team-select"
                                        className="w-full mt-2 p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedTeam || ""}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                    >
                                        <option value="" disabled>
                                            Select a team
                                        </option>
                                        {teams.map((team) => (
                                            <option key={team._id} value={team._id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <DialogFooter>
                                    <Button
                                        className="w-full py-3"
                                        onClick={handleCreateProject}
                                        disabled={!projectName.trim() || !selectedTeam}
                                    >
                                        {createLoader ? "Creating..." : "Create Project"}
                                    </Button>
                                </DialogFooter>
                            </div>
                        ) : (
                            <div className="text-center mt-6">
                                <p className="text-gray-600 text-sm">
                                    No teams available. Please create a team before adding a project.
                                </p>
                                <div className="text-center flex items-center justify-center">
                                    <Button
                                        variant="ghost"
                                        className="mt-4 flex items-center gap-2"
                                        onClick={() => {
                                            /* Navigate to project creation or teams page */
                                            window.location.href = "/console/team-members";
                                        }}
                                    >
                                        <Plus size={16} className="text-blue-500" /> Create a Team
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">My Projects</h2>
                {projects.length > 0 ? projects.map((project) => (
                    <div
                        key={project._id}
                        className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:shadow-md"
                    >
                        <span className="text-lg font-medium">{project.name}</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 text-black hover:bg-gray-100 rounded-md">
                                    <MoreVertical size={20} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-white text-black shadow-lg rounded-md w-40 py-2"
                            >
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => (window.location.href = `/console/projects/${project.id}-${project.page._id}`)}>
                                    <ArrowRight size={18} /> Go to Project
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer text-red-500"
                                    onClick={() => { setSelectedProject(project); setIsDeleteDialogOpen(true); }}
                                >
                                    <Trash size={18} /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))
                    :
                    <div className="flex flex-col justify-center items-center py-10">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-16 h-16 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.75 6.75h10.5m-10.5 3.75h10.5m-10.5 3.75h7.5m0 4.5H9.75a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25h6.75l4.5 4.5v9.75a2.25 2.25 0 01-2.25 2.25z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 8.25h4.5M3 12h3M3 15.75h4.5"
                            />
                        </svg>
                        <h2 className="mt-6 text-xl font-semibold text-gray-600">No Projects Yet</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Start creating your own projects to see it here.
                        </p>

                    </div>

                }
            </div>

            <div className="space-y-4 mt-8">
                <h2 className="text-lg font-semibold">Associated Projects</h2>
                {associatedProjects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => (window.location.href = `/console/projects/${project.id}-${project.page._id}`)}
                        className="p-4 border rounded-lg shadow-sm hover:shadow-md cursor-pointer"
                    >
                        <h3 className="text-lg font-medium">{project.name}</h3>
                        <p className="text-sm text-gray-500">{project.team.name}</p>
                    </div>
                ))}
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <h2 className="text-xl font-semibold">Are you sure you want to remove {selectedProject ? selectedProject.name : ''}?</h2>
                    </DialogHeader>
                    <DialogDescription>
                        <p>Removing the project will also remove the data in it. This is not reversible.</p>
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProject}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
