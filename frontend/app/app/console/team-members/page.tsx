"use client";

import { useState, useEffect } from "react";
import axiosInstances from "@/utils/axiosInstance";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Trash, Users, ChevronRight } from 'lucide-react';
import Link from "next/link";
import { DialogDescription } from "@radix-ui/react-dialog";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface TeamMember {
    _id: string;
    email: string;
    userName: string;
    avatar?: string;
    status: string;
}

interface Team {
    _id: string;
    name: string;
    members?: TeamMember[];
}

export default function TeamPage(): JSX.Element {
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamName, setTeamName] = useState<string>("");
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
        try {
            const response = await axiosInstances.CoreService.get(
                `/team-members?teamId=${teamId}`
            );
            return response.data.members || [];
        } catch (error) {
            console.error("Error fetching team members:", error);
            return [];
        }
    };

    const fetchTeams = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstances.CoreService.get(
                `/team/all`
            );
            if (response && response.data.error === false && response.data.teams) {
                // Fetch members for each team
                const teamsWithMembers = await Promise.all(
                    response.data.teams.map(async (team: Team) => {
                        const members = await fetchTeamMembers(team._id);
                        return { ...team, members };
                    })
                );
                setTeams(teamsWithMembers);
            }
        } catch (error) {
            console.error("Error fetching teams", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleAddTeam = async () => {
        if (teamName.trim()) {
            try {
                setIsLoading(true);
                await axiosInstances.CoreService.post(
                    `/team/create`,
                    { name: teamName }
                );
                setTeamName("");
                fetchTeams();
            } catch (error) {
                console.error("Error creating team", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteTeam = async () => {
        if (selectedTeam !== null) {
            try {
                setIsLoading(true);
                await axiosInstances.CoreService.delete(
                    `/team/${selectedTeam._id}`
                );
                setTeams(teams.filter((item) => item._id !== selectedTeam._id));
                setIsDeleteDialogOpen(false);
                setSelectedTeam(null);
            } catch (error) {
                console.error("Error deleting team", error);
                setIsDeleteDialogOpen(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const TeamMemberAvatars = ({ members }: { members: TeamMember[] }) => {
        const displayMembers = members.slice(0, 3);
        const remainingCount = Math.max(0, members.length - 3);

        return (
            <TooltipProvider>
                <div className="flex items-center -space-x-3 ">
                    {displayMembers.map((member) => (
                        <Tooltip key={member._id}>
                            <TooltipTrigger asChild>
                                <div className="ring-2 ring-white rounded-full">
                                    <Avatar className="h-8 w-8 border-2 border-white">
                                        <AvatarImage src={member.avatar} alt={member.userName} />
                                        <AvatarFallback>
                                            {member.email.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{member.userName}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                    {remainingCount > 0 && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-white">
                            +{remainingCount}
                        </div>
                    )}
                </div>
            </TooltipProvider>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading teams...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="p-5 border-b bg-white shadow-sm">
                <BreadcrumbNav />
            </div>

            <div className="container mx-auto py-6">
                <div className="container mx-auto p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Your Teams</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage and collaborate with your teams
                            </p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Team
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <h2 className="text-xl font-semibold">Create New Team</h2>
                                </DialogHeader>
                                <Input
                                    placeholder="Enter team name"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="mt-4"
                                />
                                <DialogFooter>
                                    <Button onClick={handleAddTeam} disabled={!teamName.trim()}>
                                        Create Team
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-1">
                        {teams.map((team, index) => (
                            <motion.div
                                key={team._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="group relative flex items-center justify-between p-4 rounded-lg hover:bg-accent gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1">
                                            <h3 className="font-medium">{team.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {team.members?.length || 0} members
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {team.members && team.members.length > 0 ? (
                                                <TeamMemberAvatars members={team.members} />
                                            ) : (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Users size={16} />
                                                    <span className="text-sm">No members</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/console/team-members/manage/${team._id}`}
                                            className="text-sm font-medium hover:text-primary flex items-center gap-2"
                                        >
                                            Manage
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setSelectedTeam(team);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash size={16} className="mr-2" /> Delete Team
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                {index < teams.length - 1 && <Separator />}
                            </motion.div>
                        ))}
                    </div>

                    {teams.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-sm font-semibold text-foreground">No teams yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Get started by creating your first team
                            </p>
                        </div>
                    )}
                </div>

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <h2 className="text-xl font-semibold">Confirm Team Deletion</h2>
                        </DialogHeader>
                        <DialogDescription>
                            <p>Are you sure you want to delete the team &quot;{selectedTeam ? selectedTeam.name : ''}&quot;?</p>
                            <p className="text-red-600 mt-2">This action cannot be undone. All team members will be removed.</p>
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteTeam}>
                                Delete Team
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

