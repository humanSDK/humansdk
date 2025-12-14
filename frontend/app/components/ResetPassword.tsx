// components/ResetPassword.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CustomLogo } from "@/components/Logo";
import { USER_SERVICE_API } from "../constant";

interface ResetPasswordProps {
    token: string;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token }) => {
    const { toast } = useToast();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tokenUsed, setTokenUsed] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            return toast({
                variant: "destructive",
                title: "Passwords don't match",
                description: "Please ensure both passwords are the same.",
            });
        }

        if (newPassword.length < 6) {
            return toast({
                variant: "destructive",
                title: "Password too short",
                description: "Password must be at least 6 characters long.",
            });
        }

        setLoading(true);

        try {
            await axios.post(`${USER_SERVICE_API}/auth/reset-password`, {
                token,
                newPassword
            });

            setIsSuccess(true);
            toast({
                title: "Password Reset Successful",
                description: "Your password has been successfully reset.",
            });
        } catch (error: any) {
            if (error.response?.data?.code === 'TOKEN_ALREADY_USED') {
                setTokenUsed(true);
                toast({
                    title: "Link Already Used",
                    description: "This reset link has already been used. Please request a new password reset.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Reset Failed",
                    description: error.response?.data?.message || "Failed to reset password.",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };
    if (tokenUsed) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[400px] space-y-8 text-center"
                >
                    <div className="space-y-6">
                        <CustomLogo className="w-20 h-20 mx-auto" />
                        <div className="space-y-4">
                            <h1 className="text-2xl font-semibold tracking-tight text-destructive">
                                Link Already Used
                            </h1>
                            <p className="text-muted-foreground">
                                This password reset link has already been used. For security purposes, each reset link can only be used once.
                            </p>
                            <Link href="#">
                                <Button className="w-full h-11 mt-4">
                                    Back to Login
                                </Button>
                            </Link>
                            {/* <Link href="/forgot-password">
                                <Button variant="outline" className="w-full h-11">
                                    Request New Reset Link
                                </Button>
                            </Link> */}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[400px] space-y-8 text-center"
                >
                    <div className="space-y-6">
                        <CustomLogo className="w-20 h-20 mx-auto" />
                        <div className="space-y-4">
                            <h1 className="text-2xl font-semibold tracking-tight text-green-600">
                                Password Reset Successful!
                            </h1>
                            <p className="text-muted-foreground">
                                Your password has been successfully reset. You can now log in with your new password.
                            </p>
                            <Link href="#">
                                <Button className="w-full h-11 mt-4">
                                    Go to Login Page
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] space-y-8"
            >
                <div className="text-center space-y-6">
                    <CustomLogo className="w-20 h-20 mx-auto" />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Reset Your Password
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your new password below
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                            New Password
                        </Label>
                        <Input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="h-11 bg-muted/50"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm Password
                        </Label>
                        <Input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="h-11 bg-muted/50"
                            required
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-11 text-base"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};