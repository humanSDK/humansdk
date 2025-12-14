"use client";

import { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash, UserPlus } from 'lucide-react';
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Page = ({ params }: { params: { teamId: string } }) => {
    const { toast } = useToast();
    const [teamDetails, setTeamDetails] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [emailList, setEmailList] = useState<string[]>([]);
    const [tableData, setTableData] = useState<{ email: string; status: string; userName: string; userId: string; avatar?: string }[]>([]);
    const [isSendingInvite, setSendingInvite] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchTeamMembers = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("ct_token");
        if (!token) {
            toast({
                variant: "destructive",
                title: "Missing Token",
                description: "Token is missing in the URL.",
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axiosInstances.CoreService.get(
                `/team-members?teamId=${params.teamId}`
            );

            if (response.status === 200) {
                setTableData(response.data.members);
            }
        } catch (error) {
            console.log("err:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch team members.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getTeamDetails = async (teamId: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstances.CoreService.get(`/team?teamId=${teamId}`);
            if (response.data && !response.data.error) {
                setTeamDetails(response.data);
            }
        } catch (error) {
            console.error("Error fetching team details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
        if (params.teamId) {
            getTeamDetails(params.teamId);
        }
    }, [params.teamId, toast]);

    const handleAddEmail = () => {
        if (email.trim() && !emailList.includes(email.trim())) {
            setEmailList([...emailList, email.trim()]);
            setEmail("");
        }
    };

    const handleRemoveEmail = (index: number) => {
        setEmailList(emailList.filter((_, i) => i !== index));
    };

    const handleSendInvites = async () => {
        const token = localStorage.getItem("ct_token");
        if (!token) {
            toast({
                variant: "destructive",
                title: "Missing Token",
                description: "Token is missing in the URL.",
            });
            return;
        }

        try {
            setSendingInvite(true);
            const response = await axiosInstances.CoreService.post(
                `/team-members/${params.teamId}/add-members`,
                { emails: emailList },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                toast({
                    variant: "default",
                    title: "Success",
                    description: "Email invites sent successfully.",
                });
                setEmailList([]);
                fetchTeamMembers();
                setSendingInvite(false);
            }
        } catch (error) {
            console.log("err:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send invites. Please try again.",
            });
            setSendingInvite(false);
        }
    };

    const handleRemoveMember = async (email: string) => {
        const token = localStorage.getItem("ct_token");
        if (!token) {
            toast({
                variant: "destructive",
                title: "Missing Token",
                description: "Token is missing in the URL.",
            });
            return;
        }

        try {
            const response = await axiosInstances.CoreService.delete(
                `/team-members/remove/${email}?teamId=${params.teamId}`
            );

            if (response.status === 200) {
                toast({
                    variant: "default",
                    title: "Success",
                    description: "Team member removed successfully.",
                });
            }
        } catch (error) {
            console.log("err:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to remove team member.",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading team details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="p-5 border-b bg-white shadow-sm">
                <BreadcrumbNav />
            </div>
            <div className="container mx-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-800">{teamDetails ? teamDetails.team.name : 'Team Details'}</h1>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="default" className="flex items-center gap-2">
                                <UserPlus size={16} /> Invite Members
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <h2 className="text-xl font-semibold">Add Team Members</h2>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleAddEmail();
                                        }}
                                    />
                                    <Button onClick={handleAddEmail} disabled={!email.trim()}>
                                        Add
                                    </Button>
                                </div>
                                <motion.ul className="space-y-2">
                                    {emailList.map((item, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex items-center justify-between bg-gray-100 p-2 rounded"
                                        >
                                            <span>{item}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveEmail(index)}
                                            >
                                                Remove
                                            </Button>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleSendInvites}
                                    disabled={emailList.length === 0 || isSendingInvite}
                                >
                                    {isSendingInvite ? 'Sending Invites...' : 'Send Invites'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell className="flex items-center space-x-3">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={row.avatar} alt={row.userName} />
                                            <AvatarFallback>{row.email.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span>{row.userName}</span>
                                    </TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${row.status === "accepted"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {row.status.toUpperCase()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical size={20} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleRemoveMember(row.email)}
                                                >
                                                    <Trash size={18} className="mr-2" /> Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </motion.div>
            </div>
        </div>
    );
};

export default Page;

