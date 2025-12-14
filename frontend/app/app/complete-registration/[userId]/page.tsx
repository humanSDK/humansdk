"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { USER_SERVICE_API } from "../../../constant";
import { CustomLogo } from "@/components/Logo";

const CompleteRegistration = ({ params }: { params: { userId: string } }) => {
    const [formData, setFormData] = useState({
        name: "",
        password: "",
        role: "personal", // default to 'personal'
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRoleChange = (value: string) => {
        setFormData({
            ...formData,
            role: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for mandatory fields
        if (!formData.name.trim()) {
            return toast({
                variant: "destructive",
                title: "Missing Field",
                description: "Full Name is required.",
            });
        }

        if (!formData.password.trim()) {
            return toast({
                variant: "destructive",
                title: "Missing Field",
                description: "Password is required.",
            });
        }

        setLoading(true);
        setSuccess(false);

        try {
            const searchParams = new URLSearchParams(window.location.search);
            const rt_token = searchParams.get("rt");
            const response = await axios.post(`${USER_SERVICE_API}/auth/complete-registration`, {
                userId: params.userId,
                token: rt_token,
                ...formData,
            });

            if (response.status === 200 && response.data.error == false && response.data.token) {
                localStorage.setItem("ct_token", response.data.token)
                localStorage.setItem("rt_token", response.data.refreshToken)
                setSuccess(true);
                toast({
                    title: "Registration Successful",
                    description: "Thanks for being part of something Incredible!",
                });
                setTimeout(() => {
                    window.location.href = "/console"
                }, 1000);
            }
        } catch (error: any) {
            console.log("err:", error.message)
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToastProvider>
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex justify-center items-center">
                            <CustomLogo className="w-16 h-16" />
                        </div>
                        <h2 className="text-xl font-semibold text-center">Complete Your Registration</h2>
                    </CardHeader>
                    <CardContent>
                        {success && !loading && (
                            <p className="text-center text-green-500">
                                Registration Successful! You can now log in.
                            </p>
                        )}

                        {!success && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={handleRoleChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="personal">Personal</SelectItem>
                                            <SelectItem value="organization">Organization</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </form>
                        )}
                    </CardContent>
                    {
                        !success &&
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Registering..." : "Complete Registration"}
                            </Button>
                        </CardFooter>
                    }
                </Card>
            </div>
            <Toast />
        </ToastProvider>
    );
};

export default CompleteRegistration;
