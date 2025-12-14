"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { CORE_SERVICE_API } from "../../../../constant";
import { CustomLogo } from "@/components/Logo";

const Page = ({ params }: { params: { teamId: string } }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [teamDetails, setTeamDetails] = useState<any>(null);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const { toast } = useToast();

    const handleAcceptInvite = async () => {
        const searchParams = new URLSearchParams(window.location.search);
        const invite_token = searchParams.get("token");

        // Validate name and password before sending the request
        if (!name || !password) {
            toast({
                variant: "destructive",
                title: "Missing Fields",
                description: "Name and Password are required.",
            });
            return;
        }

        if (!invite_token) {
            toast({
                variant: "destructive",
                title: "Missing Token",
                description: "Token is missing in the URL.",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${CORE_SERVICE_API}/team-members/accept-invite/join-cos-theta`, {
                token: invite_token,
                name,
                password,
            });

            if (response.status === 200) {
                setSuccess(true);
            } else {
                setError("Failed to accept the invitation.");
            }
        } catch (error: any) {
            setError(error?.response?.data?.message || "An error occurred while accepting the invite.");
        } finally {
            setLoading(false);
        }
    };

    const getTeamDetails = async (teamId: string) => {
        try {
            const response = await axios.get(`${CORE_SERVICE_API}/team?teamId=${teamId}`);
            if (response.data && !response.data.error) {
                setTeamDetails(response.data); // Set the team and owner details
            } else {
                setError("Unable to fetch team details.");
            }
        } catch (error) {
            console.error("Error fetching team details:", error);
            setError("An error occurred while fetching team details.");
        }
    };

    useEffect(() => {
        if (params.teamId) {
            getTeamDetails(params.teamId);
        }
    }, [params]);

    return (
        <ToastProvider>
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex justify-center items-center">
                            <CustomLogo className="w-16 h-16" />
                        </div>
                        <h2 className="text-xl font-semibold text-center">Accept Team Invitation</h2>
                    </CardHeader>
                    <CardContent>
                        {teamDetails && !success && !error ? (
                            <div className="text-center">
                                <p>
                                    <strong>{teamDetails.owner.name}</strong> invited you to join{" "}
                                    <strong>{teamDetails.team.name}</strong>!
                                </p>
                                <p className="text-sm text-gray-500">
                                    Team Owner: {teamDetails.owner.name} ({teamDetails.owner.email})
                                </p>
                                <form className="mt-4">
                                    <div className="mb-4">
                                        <Input
                                            placeholder="Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </form>
                            </div>
                        ) : success ? (
                            <p className="text-center text-green-500">
                                Congrats! You are now a member of {teamDetails.team.name}.
                            </p>
                        ) : error ? (
                            <p className="text-center text-red-500">{error}</p>
                        ) : (
                            <p className="text-center">Loading team details...</p>
                        )}
                    </CardContent>

                    <CardFooter>
                        {!success && !error && teamDetails && (
                            <Button
                                type="button"
                                className="w-full"
                                disabled={loading}
                                onClick={handleAcceptInvite}
                            >
                                {loading ? "Accepting..." : "Create Account & Accept Invitation"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
            <Toast />
        </ToastProvider>
    );
};

export default Page;
